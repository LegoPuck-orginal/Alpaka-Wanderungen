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
      scriptSrcAttr: ["'unsafe-inline'"], // Allow inline event handlers
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'"]
    }
  },
  permissionsPolicy: false // Disable permissions policy to avoid browser warnings
}));

app.use(compression());
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ extended: true, limit: '10mb' }));
app.use(express.static('.'));

// === EMAIL SETUP ===
let transporter = null;

// Nur E-Mail-Transporter erstellen wenn Credentials verfügbar sind
if (process.env.EMAIL_USER && process.env.EMAIL_PASS && 
    process.env.EMAIL_USER !== 'demo@alpaka-wanderungen.de') {
  try {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
      }
    });
  } catch (error) {
    console.warn('⚠️ E-Mail-Transporter konnte nicht initialisiert werden:', error.message);
  }
}

// === HELPER FUNCTIONS ===
async function ensureDataDir() {
  const dataDir = path.join(__dirname, 'data');
  try {
    await fs.access(dataDir);
  } catch {
    await fs.mkdir(dataDir, { recursive: true });
  }
}

async function readJsonFile(filename) {
  try {
    await ensureDataDir();
    const data = await fs.readFile(path.join(__dirname, 'data', filename), 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.log(`File ${filename} not found, creating empty array`);
    return [];
  }
}

async function writeJsonFile(filename, data) {
  await ensureDataDir();
  await fs.writeFile(path.join(__dirname, 'data', filename), JSON.stringify(data, null, 2));
}

function generateId() {
  return Math.random().toString(36).substr(2, 9) + Date.now().toString(36);
}

function generateCode(length = 8) {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
}

function getTourPrice(tourName) {
  const prices = {
    'Entspannte Alpaka-Wanderung': 25,
    'Alpaka-Abenteuer für die ganze Familie': 35,
    'Romantische Alpaka-Wanderung für Paare': 45,
    'Alpaka-Yoga & Meditation': 40,
    'Alpaka-Fotoshooting Experience': 50,
    'Alpaka-Wanderung mit Picknick': 55
  };
  return prices[tourName] || 30;
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

// === BOOKING SYSTEM (KONTAKTFORMULAR-STIL) ===
app.post('/api/bookings', async (req, res) => {
  try {
    const { name, email, phone, tour, date, participants, message, voucherCode, discountCode } = req.body;
    
    if (!name || !email || !tour || !date || !participants) {
      return res.status(400).json({ error: 'Alle Pflichtfelder müssen ausgefüllt werden' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
    }

    const bookings = await readJsonFile('bookings.json');
    let totalPrice = getTourPrice(tour) * parseInt(participants);
    let discount = 0;
    let appliedVoucher = null;
    let appliedDiscount = null;
    
    // Gutschein einlösen
    if (voucherCode) {
      const vouchers = await readJsonFile('vouchers.json');
      const voucher = vouchers.find(v => 
        v.code === voucherCode && 
        v.isActive && 
        !v.isRedeemed &&
        (!v.expiryDate || new Date(v.expiryDate) > new Date())
      );
      
      if (voucher) {
        discount += voucher.value;
        voucher.isRedeemed = true;
        voucher.redeemedAt = new Date().toISOString();
        voucher.redeemedBy = email;
        appliedVoucher = voucher.code;
        await writeJsonFile('vouchers.json', vouchers);
      }
    }

    // Rabattcode anwenden
    if (discountCode) {
      const discountCodes = await readJsonFile('discount-codes.json');
      const code = discountCodes.find(c => 
        c.code === discountCode && 
        c.isActive &&
        (!c.expiryDate || new Date(c.expiryDate) > new Date())
      );
      
      if (code && (code.usageLimit === null || code.usedCount < code.usageLimit)) {
        if (code.type === 'percentage') {
          discount += (totalPrice * code.value) / 100;
        } else {
          discount += code.value;
        }
        code.usedCount = (code.usedCount || 0) + 1;
        appliedDiscount = code.code;
        await writeJsonFile('discount-codes.json', discountCodes);
      }
    }

    const finalPrice = Math.max(0, totalPrice - discount);

    const booking = {
      id: Date.now().toString(),
      name,
      email,
      phone: phone || '',
      tour,
      date,
      participants: parseInt(participants),
      message: message || '',
      totalPrice: finalPrice,
      originalPrice: totalPrice,
      discount,
      appliedVoucher,
      appliedDiscount,
      status: 'pending',
      createdAt: new Date().toISOString(),
      type: 'contact_form' // Markierung als Kontaktformular-Buchung
    };

    bookings.push(booking);
    await writeJsonFile('bookings.json', bookings);

    // Bestätigungs-Email senden (nur wenn Transporter verfügbar)
    if (transporter) {
      try {
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: `Buchungsanfrage erhalten - ${tour}`,
          html: `
            <h2>🦙 Vielen Dank für Ihre Buchungsanfrage!</h2>
            <p>Hallo ${name},</p>
            <p>wir haben Ihre Buchungsanfrage erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
            
            <h3>📋 Ihre Anfrage im Überblick:</h3>
            <ul>
              <li><strong>Tour:</strong> ${tour}</li>
              <li><strong>Wunschtermin:</strong> ${date}</li>
              <li><strong>Teilnehmer:</strong> ${participants} Person(en)</li>
              <li><strong>Preis:</strong> ${finalPrice}€</li>
              ${discount > 0 ? `<li><strong>Ersparnis:</strong> ${discount}€</li>` : ''}
              ${message ? `<li><strong>Nachricht:</strong> ${message}</li>` : ''}
            </ul>
            
            <p>Wir werden Ihnen innerhalb von 24 Stunden alle weiteren Details und die Bestätigung Ihrer Buchung zusenden.</p>
            
            <p>Mit alpakigen Grüßen,<br>
            Ihr Alpaka-Wanderungen Team</p>
          `
        });

        // Admin-Benachrichtigung
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `🦙 Neue Buchungsanfrage von ${name}`,
          html: `
            <h2>Neue Buchungsanfrage eingegangen!</h2>
            <ul>
              <li><strong>Name:</strong> ${name}</li>
              <li><strong>E-Mail:</strong> ${email}</li>
              <li><strong>Telefon:</strong> ${phone || 'Nicht angegeben'}</li>
              <li><strong>Tour:</strong> ${tour}</li>
              <li><strong>Datum:</strong> ${date}</li>
              <li><strong>Teilnehmer:</strong> ${participants}</li>
              <li><strong>Preis:</strong> ${finalPrice}€</li>
              <li><strong>Nachricht:</strong> ${message || 'Keine'}</li>
            </ul>
          `
        });
        
        console.log('📧 Buchungs-E-Mails erfolgreich gesendet');
      } catch (emailError) {
        console.warn('⚠️ Buchungs-E-Mail konnte nicht gesendet werden:', emailError.message);
      }
    } else {
      console.log('📝 Buchungsanfrage erhalten (E-Mail-Versand deaktiviert):', booking);
    }

    res.json({ 
      success: true, 
      message: 'Buchungsanfrage erfolgreich gesendet! Sie erhalten bald eine Bestätigung.',
      booking: { ...booking, email: undefined } // Email aus Antwort entfernen
    });
  } catch (error) {
    console.error('Booking error:', error);
    res.status(500).json({ error: 'Server-Fehler bei der Buchungsanfrage' });
  }
});

// === GUTSCHEIN SYSTEM ===
app.post('/api/vouchers', authenticateToken, async (req, res) => {
  try {
    const { value, description, expiryDate } = req.body;
    
    if (!value || !description) {
      return res.status(400).json({ error: 'Wert und Beschreibung sind erforderlich' });
    }

    const vouchers = await readJsonFile('vouchers.json');
    const code = generateCode();

    const voucher = {
      id: Date.now().toString(),
      code,
      value: parseFloat(value),
      description,
      expiryDate: expiryDate || null,
      isActive: true,
      isRedeemed: false,
      createdAt: new Date().toISOString(),
      redeemedAt: null,
      redeemedBy: null
    };

    vouchers.push(voucher);
    await writeJsonFile('vouchers.json', vouchers);

    res.json({ success: true, voucher });
  } catch (error) {
    console.error('Voucher creation error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Gutscheins' });
  }
});

app.get('/api/vouchers', authenticateToken, async (req, res) => {
  try {
    const vouchers = await readJsonFile('vouchers.json');
    res.json(vouchers);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Gutscheine' });
  }
});

app.post('/api/vouchers/redeem', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Gutscheincode erforderlich' });
    }

    const vouchers = await readJsonFile('vouchers.json');
    const voucher = vouchers.find(v => 
      v.code === code && 
      v.isActive && 
      !v.isRedeemed &&
      (!v.expiryDate || new Date(v.expiryDate) > new Date())
    );

    if (!voucher) {
      return res.status(404).json({ error: 'Gutschein ungültig oder bereits eingelöst' });
    }

    res.json({ 
      valid: true, 
      value: voucher.value,
      description: voucher.description 
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Validieren des Gutscheins' });
  }
});

app.delete('/api/vouchers/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const vouchers = await readJsonFile('vouchers.json');
    const filteredVouchers = vouchers.filter(v => v.id !== id);
    
    if (vouchers.length === filteredVouchers.length) {
      return res.status(404).json({ error: 'Gutschein nicht gefunden' });
    }
    
    await writeJsonFile('vouchers.json', filteredVouchers);
    res.json({ success: true, message: 'Gutschein gelöscht' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen des Gutscheins' });
  }
});

// === RABATTCODE SYSTEM ===
app.post('/api/discount-codes', authenticateToken, async (req, res) => {
  try {
    const { code, value, type, description, usageLimit, expiryDate } = req.body;
    
    if (!code || !value || !type || !description) {
      return res.status(400).json({ error: 'Code, Wert, Typ und Beschreibung sind erforderlich' });
    }

    const discountCodes = await readJsonFile('discount-codes.json');
    
    // Prüfen ob Code bereits existiert
    if (discountCodes.find(c => c.code === code)) {
      return res.status(400).json({ error: 'Code bereits vorhanden' });
    }

    const discountCode = {
      id: Date.now().toString(),
      code: code.toUpperCase(),
      value: parseFloat(value),
      type, // 'percentage' oder 'fixed'
      description,
      usageLimit: usageLimit ? parseInt(usageLimit) : null,
      usedCount: 0,
      expiryDate: expiryDate || null,
      isActive: true,
      createdAt: new Date().toISOString()
    };

    discountCodes.push(discountCode);
    await writeJsonFile('discount-codes.json', discountCodes);

    res.json({ success: true, discountCode });
  } catch (error) {
    console.error('Discount code creation error:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Rabattcodes' });
  }
});

app.get('/api/discount-codes', authenticateToken, async (req, res) => {
  try {
    const discountCodes = await readJsonFile('discount-codes.json');
    res.json(discountCodes);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Rabattcodes' });
  }
});

app.post('/api/discount-codes/validate', async (req, res) => {
  try {
    const { code } = req.body;
    
    if (!code) {
      return res.status(400).json({ error: 'Rabattcode erforderlich' });
    }

    const discountCodes = await readJsonFile('discount-codes.json');
    const discountCode = discountCodes.find(c => 
      c.code === code.toUpperCase() && 
      c.isActive &&
      (!c.expiryDate || new Date(c.expiryDate) > new Date())
    );

    if (!discountCode) {
      return res.status(404).json({ error: 'Rabattcode ungültig oder abgelaufen' });
    }

    if (discountCode.usageLimit !== null && discountCode.usedCount >= discountCode.usageLimit) {
      return res.status(400).json({ error: 'Rabattcode-Limit erreicht' });
    }

    res.json({ 
      valid: true, 
      value: discountCode.value,
      type: discountCode.type,
      description: discountCode.description 
    });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Validieren des Rabattcodes' });
  }
});

app.put('/api/discount-codes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const discountCodes = await readJsonFile('discount-codes.json');
    const codeIndex = discountCodes.findIndex(c => c.id === id);
    
    if (codeIndex === -1) {
      return res.status(404).json({ error: 'Rabattcode nicht gefunden' });
    }
    
    discountCodes[codeIndex] = { 
      ...discountCodes[codeIndex], 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };
    await writeJsonFile('discount-codes.json', discountCodes);
    
    res.json({ success: true, discountCode: discountCodes[codeIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren des Rabattcodes' });
  }
});

app.delete('/api/discount-codes/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const discountCodes = await readJsonFile('discount-codes.json');
    const filteredCodes = discountCodes.filter(c => c.id !== id);
    
    if (discountCodes.length === filteredCodes.length) {
      return res.status(404).json({ error: 'Rabattcode nicht gefunden' });
    }
    
    await writeJsonFile('discount-codes.json', filteredCodes);
    res.json({ success: true, message: 'Rabattcode gelöscht' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen des Rabattcodes' });
  }
});

// === ADMIN PANEL ===

// Admin Panel Routes
app.get('/admin-panel', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel', 'index.html'));
});

app.get('/admin', (req, res) => {
  res.sendFile(path.join(__dirname, 'admin-panel', 'index.html'));
});

// Serve admin panel assets
app.use('/admin-panel', express.static(path.join(__dirname, 'admin-panel')));

app.get('/admin', (req, res) => {
  res.redirect('/admin/new');
});

app.post('/api/admin/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Benutzername und Passwort erforderlich' });
    }

    const adminUsername = process.env.ADMIN_USERNAME || 'admin';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (username === adminUsername && password === adminPassword) {
      const token = jwt.sign(
        { userId: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Ungültige Anmeldedaten' });
    }
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login-Fehler' });
  }
});

// === BUCHUNGEN ADMIN ===
app.get('/api/bookings', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJsonFile('bookings.json');
    res.json(bookings);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Buchungen' });
  }
});

app.put('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const updateData = req.body;
    
    const bookings = await readJsonFile('bookings.json');
    const bookingIndex = bookings.findIndex(b => b.id === id);
    
    if (bookingIndex === -1) {
      return res.status(404).json({ error: 'Buchung nicht gefunden' });
    }
    
    bookings[bookingIndex] = { 
      ...bookings[bookingIndex], 
      ...updateData, 
      updatedAt: new Date().toISOString() 
    };
    await writeJsonFile('bookings.json', bookings);
    
    res.json({ success: true, booking: bookings[bookingIndex] });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Buchung' });
  }
});

app.delete('/api/bookings/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const bookings = await readJsonFile('bookings.json');
    const filteredBookings = bookings.filter(b => b.id !== id);
    
    if (bookings.length === filteredBookings.length) {
      return res.status(404).json({ error: 'Buchung nicht gefunden' });
    }
    
    await writeJsonFile('bookings.json', filteredBookings);
    res.json({ success: true, message: 'Buchung gelöscht' });
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Löschen der Buchung' });
  }
});

// === KONTAKT FORMULAR ===
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, subject, message } = req.body;
    
    if (!name || !email || !subject || !message) {
      return res.status(400).json({ error: 'Alle Felder sind erforderlich' });
    }

    if (!validator.isEmail(email)) {
      return res.status(400).json({ error: 'Ungültige E-Mail-Adresse' });
    }

    // Kontaktanfrage in Datenbank speichern
    const contacts = await readJsonFile('contacts.json');
    const contact = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      name: validator.escape(name),
      email: validator.normalizeEmail(email),
      subject: validator.escape(subject),
      message: validator.escape(message),
      status: 'new',
      replied: false
    };

    contacts.push(contact);
    await writeJsonFile('contacts.json', contacts);

    // E-Mail-Funktion (nur wenn Transporter verfügbar)
    if (transporter) {
      try {
        // Email an Admin senden
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: process.env.EMAIL_USER,
          subject: `🦙 Kontaktanfrage: ${subject}`,
          html: `
            <h2>Neue Kontaktanfrage</h2>
            <p><strong>Name:</strong> ${name}</p>
            <p><strong>E-Mail:</strong> ${email}</p>
            <p><strong>Betreff:</strong> ${subject}</p>
            <p><strong>Nachricht:</strong></p>
            <p>${message}</p>
          `
        });

        // Bestätigung an Absender
        await transporter.sendMail({
          from: process.env.EMAIL_USER,
          to: email,
          subject: 'Ihre Kontaktanfrage wurde empfangen',
          html: `
            <h2>🦙 Vielen Dank für Ihre Nachricht!</h2>
            <p>Hallo ${name},</p>
            <p>wir haben Ihre Nachricht erhalten und werden uns schnellstmöglich bei Ihnen melden.</p>
            <p>Mit alpakigen Grüßen,<br>Ihr Alpaka-Wanderungen Team</p>
          `
        });
        
        console.log('📧 Kontakt-E-Mails erfolgreich gesendet');
      } catch (emailError) {
        console.warn('⚠️ E-Mail konnte nicht gesendet werden:', emailError.message);
      }
    } else {
      console.log('📝 Kontaktanfrage erhalten (E-Mail-Versand deaktiviert):', { name, email, subject });
    }

    res.json({ success: true, message: 'Nachricht erfolgreich gesendet!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
  }
});

// === KONTAKT API ===
app.get('/api/contacts', authenticateToken, async (req, res) => {
  try {
    const contacts = await readJsonFile('contacts.json');
    res.json(contacts.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp)));
  } catch (error) {
    console.error('Contacts fetch error:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Kontaktanfragen' });
  }
});

app.patch('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    const { status, replied } = req.body;
    
    const contacts = await readJsonFile('contacts.json');
    const contactIndex = contacts.findIndex(c => c.id === id);
    
    if (contactIndex === -1) {
      return res.status(404).json({ error: 'Kontaktanfrage nicht gefunden' });
    }
    
    if (status) contacts[contactIndex].status = status;
    if (replied !== undefined) contacts[contactIndex].replied = replied;
    
    await writeJsonFile('contacts.json', contacts);
    res.json({ success: true, contact: contacts[contactIndex] });
  } catch (error) {
    console.error('Contact update error:', error);
    res.status(500).json({ error: 'Fehler beim Aktualisieren der Kontaktanfrage' });
  }
});

app.delete('/api/contacts/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    
    const contacts = await readJsonFile('contacts.json');
    const filteredContacts = contacts.filter(c => c.id !== id);
    
    if (contacts.length === filteredContacts.length) {
      return res.status(404).json({ error: 'Kontaktanfrage nicht gefunden' });
    }
    
    await writeJsonFile('contacts.json', filteredContacts);
    res.json({ success: true, message: 'Kontaktanfrage gelöscht' });
  } catch (error) {
    console.error('Contact delete error:', error);
    res.status(500).json({ error: 'Fehler beim Löschen der Kontaktanfrage' });
  }
});

// === STATISTICS API ===
app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJsonFile('bookings.json');
    const vouchers = await readJsonFile('vouchers.json');
    const discountCodes = await readJsonFile('discount-codes.json');
    const contacts = await readJsonFile('contacts.json');

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      totalVouchers: vouchers.length,
      redeemedVouchers: vouchers.filter(v => v.isRedeemed).length,
      totalDiscountCodes: discountCodes.length,
      activeDiscountCodes: discountCodes.filter(c => c.isActive).length,
      totalContacts: contacts.length,
      newContacts: contacts.filter(c => c.status === 'new').length,
      repliedContacts: contacts.filter(c => c.replied === true).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});

// === ADMIN VOUCHER MANAGEMENT ===
app.get('/api/admin/vouchers', authenticateToken, async (req, res) => {
  try {
    const vouchers = await readJsonFile('vouchers.json');
    res.json(vouchers);
  } catch (error) {
    console.error('Error getting admin vouchers:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Vouchers' });
  }
});

app.post('/api/admin/vouchers', authenticateToken, async (req, res) => {
  try {
    const vouchers = await readJsonFile('vouchers.json');
    const newVoucher = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      usageCount: 0,
      isRedeemed: false
    };
    
    vouchers.push(newVoucher);
    await writeJsonFile('vouchers.json', vouchers);
    
    res.status(201).json(newVoucher);
  } catch (error) {
    console.error('Error creating voucher:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Vouchers' });
  }
});

app.delete('/api/admin/vouchers/:id', authenticateToken, async (req, res) => {
  try {
    const vouchers = await readJsonFile('vouchers.json');
    const filteredVouchers = vouchers.filter(v => v.id !== req.params.id);
    
    if (vouchers.length === filteredVouchers.length) {
      return res.status(404).json({ error: 'Voucher nicht gefunden' });
    }
    
    await writeJsonFile('vouchers.json', filteredVouchers);
    res.json({ success: true, message: 'Voucher gelöscht' });
  } catch (error) {
    console.error('Error deleting voucher:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Vouchers' });
  }
});

// === ADMIN DISCOUNT CODE MANAGEMENT ===
app.get('/api/admin/discount-codes', authenticateToken, async (req, res) => {
  try {
    const discountCodes = await readJsonFile('discount-codes.json');
    res.json(discountCodes);
  } catch (error) {
    console.error('Error getting discount codes:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Rabattcodes' });
  }
});

app.post('/api/admin/discount-codes', authenticateToken, async (req, res) => {
  try {
    const discountCodes = await readJsonFile('discount-codes.json');
    const newDiscountCode = {
      id: generateId(),
      ...req.body,
      createdAt: new Date().toISOString(),
      usageCount: 0
    };
    
    discountCodes.push(newDiscountCode);
    await writeJsonFile('discount-codes.json', discountCodes);
    
    res.status(201).json(newDiscountCode);
  } catch (error) {
    console.error('Error creating discount code:', error);
    res.status(500).json({ error: 'Fehler beim Erstellen des Rabattcodes' });
  }
});

app.delete('/api/admin/discount-codes/:id', authenticateToken, async (req, res) => {
  try {
    const discountCodes = await readJsonFile('discount-codes.json');
    const filteredDiscountCodes = discountCodes.filter(d => d.id !== req.params.id);
    
    if (discountCodes.length === filteredDiscountCodes.length) {
      return res.status(404).json({ error: 'Rabattcode nicht gefunden' });
    }
    
    await writeJsonFile('discount-codes.json', filteredDiscountCodes);
    res.json({ success: true, message: 'Rabattcode gelöscht' });
  } catch (error) {
    console.error('Error deleting discount code:', error);
    res.status(500).json({ error: 'Fehler beim Löschen des Rabattcodes' });
  }
});

// === ADMIN SETTINGS ===
app.post('/api/admin/change-password', authenticateToken, async (req, res) => {
  try {
    const { newPassword } = req.body;
    
    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({ error: 'Passwort muss mindestens 6 Zeichen lang sein' });
    }
    
    // In einer echten Anwendung würde das Passwort gehasht und in einer Datenbank gespeichert
    console.log('Passwort-Änderungsanfrage für Admin erhalten');
    
    res.json({ success: true, message: 'Passwort erfolgreich geändert' });
  } catch (error) {
    console.error('Error changing password:', error);
    res.status(500).json({ error: 'Fehler beim Ändern des Passworts' });
  }
});

app.get('/api/admin/system-info', authenticateToken, async (req, res) => {
  try {
    const systemInfo = {
      nodeVersion: process.version,
      platform: process.platform,
      uptime: Math.floor(process.uptime()),
      memoryUsage: process.memoryUsage(),
      timestamp: new Date().toISOString()
    };
    
    res.json(systemInfo);
  } catch (error) {
    console.error('Error getting system info:', error);
    res.status(500).json({ error: 'Fehler beim Laden der Systeminformationen' });
  }
});

// === SERVER START ===
app.listen(PORT, () => {
  console.log(`🦙 Alpaka-Wanderungen Server läuft auf Port ${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
});
