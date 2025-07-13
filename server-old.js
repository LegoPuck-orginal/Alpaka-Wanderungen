const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const compression = require('compression');
const path = require('path');
const fs = require('fs').promises;
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const validator = require('validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;
const JWT_SECRET = process.env.JWT_SECRET || 'alpaka-wanderungen-secret-key-2025';

// === MIDDLEWARE ===
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com", "https://cdnjs.cloudflare.com"],
      fontSrc: ["'self'", "https://fonts.gstatic.com", "https://cdnjs.cloudflare.com"],
      scriptSrc: ["'self'", "'unsafe-inline'", "https://cdnjs.cloudflare.com"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  }
}));

app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use(express.static('.', {
  maxAge: '1y',
  etag: true,
  lastModified: true
}));

// === DATENBANK SIMULATION (JSON FILES) ===
const DATA_DIR = path.join(__dirname, 'data');
const BOOKINGS_FILE = path.join(DATA_DIR, 'bookings.json');
const USERS_FILE = path.join(DATA_DIR, 'users.json');
const SETTINGS_FILE = path.join(DATA_DIR, 'settings.json');

// Erstelle Data-Ordner falls nicht vorhanden
async function ensureDataDir() {
  try {
    await fs.access(DATA_DIR);
  } catch {
    await fs.mkdir(DATA_DIR, { recursive: true });
  }
}

// JSON Datei lesen
async function readJsonFile(filePath, defaultData = []) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch {
    return defaultData;
  }
}

// JSON Datei schreiben
async function writeJsonFile(filePath, data) {
  await fs.writeFile(filePath, JSON.stringify(data, null, 2));
}

// === AUTHENTICATION MIDDLEWARE ===
function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }

  jwt.verify(token, JWT_SECRET, (err, user) => {
    if (err) {
      return res.status(403).json({ error: 'Invalid token' });
    }
    req.user = user;
    next();
  });
}

// === EMAIL KONFIGURATION ===
const emailTransporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER || 'demo@alpaka-wanderungen.de',
    pass: process.env.SMTP_PASS || 'demo-password'
  }
});

// === API ROUTES ===

// Admin Login
app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password required' });
    }

    const users = await readJsonFile(USERS_FILE, [
      { 
        id: 1, 
        username: 'admin', 
        password: await bcrypt.hash('admin123', 10),
        role: 'admin'
      }
    ]);

    const user = users.find(u => u.username === username);
    if (!user || !await bcrypt.compare(password, user.password)) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const token = jwt.sign(
      { id: user.id, username: user.username, role: user.role },
      JWT_SECRET,
      { expiresIn: '24h' }
    );

    res.json({ 
      success: true, 
      token,
      user: { id: user.id, username: user.username, role: user.role }
    });

  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get all bookings
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJsonFile(BOOKINGS_FILE);
    res.json(bookings);
  } catch (error) {
    console.error('Get bookings error:', error);
    res.status(500).json({ error: 'Failed to fetch bookings' });
  }
});

// Create new booking
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, date, time, tour, participants, message } = req.body;

    // Validierung
    if (!name || !email || !date || !tour) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    const bookings = await readJsonFile(BOOKINGS_FILE);
    
    const newBooking = {
      id: Date.now().toString(),
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      phone: phone ? validator.escape(phone) : '',
      date,
      time: time || '10:00',
      tour,
      participants: parseInt(participants) || 1,
      message: message ? validator.escape(message) : '',
      status: 'pending',
      createdAt: new Date().toISOString(),
      totalPrice: calculateTourPrice(tour, parseInt(participants) || 1)
    };

    bookings.push(newBooking);
    await writeJsonFile(BOOKINGS_FILE, bookings);

    // Send confirmation email
    try {
      await sendBookingConfirmation(newBooking);
    } catch (emailError) {
      console.error('Email sending failed:', emailError);
      // Continue anyway, booking was saved
    }

    res.status(201).json({ 
      success: true, 
      booking: newBooking,
      message: 'Booking created successfully' 
    });

  } catch (error) {
    console.error('Create booking error:', error);
    res.status(500).json({ error: 'Failed to create booking' });
  }
});

// Update booking
app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;

    const bookings = await readJsonFile(BOOKINGS_FILE);
    const bookingIndex = bookings.findIndex(b => b.id === id);

    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    bookings[bookingIndex] = { 
      ...bookings[bookingIndex], 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };

    await writeJsonFile(BOOKINGS_FILE, bookings);

    res.json({ 
      success: true, 
      booking: bookings[bookingIndex] 
    });

  } catch (error) {
    console.error('Update booking error:', error);
    res.status(500).json({ error: 'Failed to update booking' });
  }
});

// Delete booking
app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    const bookings = await readJsonFile(BOOKINGS_FILE);
    const filteredBookings = bookings.filter(b => b.id !== id);

    if (bookings.length === filteredBookings.length) {
      return res.status(404).json({ error: 'Booking not found' });
    }

    await writeJsonFile(BOOKINGS_FILE, filteredBookings);

    res.json({ success: true, message: 'Booking deleted successfully' });

  } catch (error) {
    console.error('Delete booking error:', error);
    res.status(500).json({ error: 'Failed to delete booking' });
  }
});

// Contact form
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Required fields missing' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // Send contact email
    await emailTransporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.CONTACT_EMAIL || 'info@alpaka-wanderungen.de',
      subject: `Kontakt: ${subject || 'Neue Nachricht'}`,
      html: `
        <h2>Neue Kontaktanfrage</h2>
        <p><strong>Name:</strong> ${validator.escape(name)}</p>
        <p><strong>Email:</strong> ${email}</p>
        <p><strong>Betreff:</strong> ${validator.escape(subject || 'Keine Angabe')}</p>
        <p><strong>Nachricht:</strong></p>
        <div style="background: #f5f5f5; padding: 15px; border-radius: 5px;">
          ${validator.escape(message).replace(/\n/g, '<br>')}
        </div>
      `
    });

    res.json({ success: true, message: 'Message sent successfully' });

  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Failed to send message' });
  }
});

// === HELPER FUNCTIONS ===

function calculateTourPrice(tourType, participants) {
  const prices = {
    'familie': 25,
    'abenteuer': 45,
    'sonnenaufgang': 35
  };
  
  const basePrice = prices[tourType] || 30;
  return basePrice * participants;
}

async function sendBookingConfirmation(booking) {
  const tourNames = {
    'familie': 'Familien-Tour',
    'abenteuer': 'Abenteuer-Tour',
    'sonnenaufgang': 'Sonnenaufgang-Tour'
  };

  await emailTransporter.sendMail({
    from: process.env.SMTP_USER,
    to: booking.email,
    subject: 'Buchungsbestätigung - Alpaka-Wanderungen',
    html: `
      <h2>Vielen Dank für Ihre Buchung! 🦙</h2>
      <p>Liebe/r ${booking.name},</p>
      <p>wir haben Ihre Buchung erhalten und freuen uns auf Ihren Besuch!</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 10px; margin: 20px 0;">
        <h3>Buchungsdetails:</h3>
        <p><strong>Tour:</strong> ${tourNames[booking.tour] || booking.tour}</p>
        <p><strong>Datum:</strong> ${booking.date}</p>
        <p><strong>Uhrzeit:</strong> ${booking.time}</p>
        <p><strong>Teilnehmer:</strong> ${booking.participants}</p>
        <p><strong>Gesamtpreis:</strong> ${booking.totalPrice}€</p>
      </div>
      
      <p>Wir werden uns in Kürze mit Ihnen in Verbindung setzen, um alle Details zu besprechen.</p>
      <p>Bei Fragen stehen wir Ihnen gerne zur Verfügung!</p>
      
      <p>Herzliche Grüße<br>
      Ihr Alpaka-Wanderungen Team</p>
    `
  });
}

// === SERVER START ===
app.listen(PORT, '0.0.0.0', async () => {
  await ensureDataDir();
  console.log(`
🦙 === ALPAKA-WANDERUNGEN SERVER GESTARTET ===
🌐 Server läuft auf: http://localhost:${PORT}
📁 Statische Dateien von: ${__dirname}
💾 Daten gespeichert in: ${DATA_DIR}
⚡ Node.js/Express Server bereit!

🚀 Verfügbare Endpunkte:
   GET  /                     - Hauptwebsite
   POST /api/admin/login      - Admin Login
   GET  /api/bookings         - Buchungen abrufen (Auth)
   POST /api/bookings         - Neue Buchung
   PUT  /api/bookings/:id     - Buchung bearbeiten (Auth)
   DEL  /api/bookings/:id     - Buchung löschen (Auth)
   POST /api/contact          - Kontaktformular
  `);
});

module.exports = app;
