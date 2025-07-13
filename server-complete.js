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
app.use(express.static('.'));

// === EMAIL SETUP ===
const transporter = nodemailer.createTransporter({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS
  }
});

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

    // Bestätigungs-Email senden
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
    } catch (emailError) {
      console.error('Email error:', emailError);
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
app.post('/api/admin/login', async (req, res) => {
  try {
    const { password } = req.body;
    
    if (!password) {
      return res.status(400).json({ error: 'Passwort erforderlich' });
    }

    const adminPassword = process.env.ADMIN_PASSWORD || 'admin123';
    
    if (password === adminPassword) {
      const token = jwt.sign(
        { userId: 'admin', role: 'admin' },
        JWT_SECRET,
        { expiresIn: '24h' }
      );
      
      res.json({ success: true, token });
    } else {
      res.status(401).json({ error: 'Ungültiges Passwort' });
    }
  } catch (error) {
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

    // Email senden
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

    res.json({ success: true, message: 'Nachricht erfolgreich gesendet!' });
  } catch (error) {
    console.error('Contact form error:', error);
    res.status(500).json({ error: 'Fehler beim Senden der Nachricht' });
  }
});

// === STATISTICS API ===
app.get('/api/statistics', authenticateToken, async (req, res) => {
  try {
    const bookings = await readJsonFile('bookings.json');
    const vouchers = await readJsonFile('vouchers.json');
    const discountCodes = await readJsonFile('discount-codes.json');

    const stats = {
      totalBookings: bookings.length,
      pendingBookings: bookings.filter(b => b.status === 'pending').length,
      confirmedBookings: bookings.filter(b => b.status === 'confirmed').length,
      totalRevenue: bookings.reduce((sum, b) => sum + (b.totalPrice || 0), 0),
      totalVouchers: vouchers.length,
      redeemedVouchers: vouchers.filter(v => v.isRedeemed).length,
      totalDiscountCodes: discountCodes.length,
      activeDiscountCodes: discountCodes.filter(c => c.isActive).length
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Fehler beim Laden der Statistiken' });
  }
});

// === SERVER START ===
app.listen(PORT, () => {
  console.log(`🦙 Alpaka-Wanderungen Server läuft auf Port ${PORT}`);
  console.log(`📊 Admin Panel: http://localhost:${PORT}/admin`);
  console.log(`🌐 Website: http://localhost:${PORT}`);
});
