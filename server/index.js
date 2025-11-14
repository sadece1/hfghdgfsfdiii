const express = require('express');
const mysql = require('mysql2/promise');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const slowDown = require('express-slow-down');
const { body, validationResult, param, query } = require('express-validator');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const path = require('path');
const fs = require('fs').promises;
const mongoSanitize = require('express-mongo-sanitize');
const { xss } = require('express-xss-sanitizer');
const hpp = require('hpp');
const compression = require('compression');
const cookieParser = require('cookie-parser');
const session = require('express-session');
const validator = require('validator');
const DOMPurify = require('isomorphic-dompurify');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Advanced Security Middleware Stack

// 1. Helmet - Security Headers
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      fontSrc: ["'self'"],
      connectSrc: ["'self'"],
      frameSrc: ["'none'"],
      objectSrc: ["'none'"],
      upgradeInsecureRequests: [],
    },
  },
  crossOriginEmbedderPolicy: false,
  hsts: {
    maxAge: 31536000,
    includeSubDomains: true,
    preload: true
  },
  noSniff: true,
  xssFilter: true,
  referrerPolicy: { policy: "strict-origin-when-cross-origin" },
  frameguard: { action: 'deny' } // X-Frame-Options: DENY
}));

// 2. Compression
app.use(compression());

// 3. Cookie Parser
app.use(cookieParser(process.env.COOKIE_SECRET || crypto.randomBytes(64).toString('hex')));

// 4. Session Security
app.use(session({
  secret: process.env.SESSION_SECRET || crypto.randomBytes(64).toString('hex'),
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production',
    httpOnly: true,
    maxAge: 24 * 60 * 60 * 1000, // 24 hours
    sameSite: 'strict'
  }
}));

// 5. Rate Limiting - Multiple Layers
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // General limit
  message: { error: 'Too many requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const strictLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5, // Strict limit for sensitive operations
  message: { error: 'Too many attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Auth attempts
  message: { error: 'Too many authentication attempts, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// 6. Slow Down - Progressive delays
const speedLimiter = slowDown({
  windowMs: 15 * 60 * 1000, // 15 minutes
  delayAfter: 50, // Allow 50 requests per 15 minutes, then...
  delayMs: () => 500 // Add 500ms delay per request above 50
});

app.use(generalLimiter);
app.use(speedLimiter);

// 7. Data Sanitization
app.use(mongoSanitize()); // Prevent NoSQL injection
app.use(xss()); // Prevent XSS attacks
app.use(hpp()); // Prevent HTTP Parameter Pollution

// CORS configuration
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:5173',
  credentials: true
}));

// Body parsing middleware
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Static files
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Security Utility Functions
const SecurityUtils = {
  // Input sanitization
  sanitizeInput: (input) => {
    if (typeof input !== 'string') return input;
    return DOMPurify.sanitize(input, { 
      ALLOWED_TAGS: [],
      ALLOWED_ATTR: []
    });
  },

  // SQL injection prevention
  escapeHtml: (unsafe) => {
    return unsafe
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  },

  // Validate email
  validateEmail: (email) => {
    return validator.isEmail(email) && email.length <= 254;
  },

  // Validate password strength
  validatePassword: (password) => {
    const minLength = 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);
    
    return password.length >= minLength && 
           hasUpperCase && 
           hasLowerCase && 
           hasNumbers && 
           hasSpecialChar;
  },

  // Generate secure random token
  generateSecureToken: (length = 32) => {
    return crypto.randomBytes(length).toString('hex');
  },

  // Validate file type
  validateFileType: (filename, allowedTypes = ['jpg', 'jpeg', 'png', 'gif', 'webp']) => {
    const ext = path.extname(filename).toLowerCase().slice(1);
    return allowedTypes.includes(ext);
  },

  // Check for malicious patterns
  detectMaliciousPatterns: (input) => {
    const maliciousPatterns = [
      /<script/i,
      /javascript:/i,
      /on\w+\s*=/i,
      /eval\s*\(/i,
      /expression\s*\(/i,
      /vbscript:/i,
      /data:text\/html/i,
      /base64/i
    ];
    
    return maliciousPatterns.some(pattern => pattern.test(input));
  },

  // Rate limiting per user
  userRateLimit: new Map(),
  
  checkUserRateLimit: (userId, maxRequests = 100, windowMs = 15 * 60 * 1000) => {
    const now = Date.now();
    const userKey = `user_${userId}`;
    
    if (!SecurityUtils.userRateLimit.has(userKey)) {
      SecurityUtils.userRateLimit.set(userKey, { count: 1, resetTime: now + windowMs });
      return true;
    }
    
    const userLimit = SecurityUtils.userRateLimit.get(userKey);
    
    if (now > userLimit.resetTime) {
      userLimit.count = 1;
      userLimit.resetTime = now + windowMs;
      return true;
    }
    
    if (userLimit.count >= maxRequests) {
      return false;
    }
    
    userLimit.count++;
    return true;
  }
};

// Database connection with security enhancements
const dbConfig = {
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'grader_marketplace',
  port: process.env.DB_PORT || 3306,
  charset: 'utf8mb4',
  timezone: '+00:00',
  acquireTimeout: 60000,
  timeout: 60000,
  reconnect: true,
  // Security options
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: true } : false,
  supportBigNumbers: true,
  bigNumberStrings: true,
  connectionLimit: 10,
  queueLimit: 0
};

let db;

// Database connection function
async function connectDB() {
  try {
    db = await mysql.createConnection(dbConfig);
    console.log('✅ Database connected successfully');
  } catch (error) {
    console.log('❌ Database connection failed:', error.message);
    console.log('⚠️  Running without database - some features will be limited');
    // Don't exit, continue without database
  }
}

// JWT secret
const JWT_SECRET = process.env.JWT_SECRET || 'your-super-secret-jwt-key-2024';

// Utility functions
const generateId = () => crypto.randomUUID();
const hashPassword = async (password) => await bcrypt.hash(password, 10);
const comparePassword = async (password, hash) => await bcrypt.compare(password, hash);
const generateToken = (user) => jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '7d' });

// Enhanced Authentication Middleware
const authenticateToken = async (req, res, next) => {
  try {
    const authHeader = req.headers['authorization'];
    const token = authHeader && authHeader.split(' ')[1];

    if (!token) {
      return res.status(401).json({ error: 'Access token required' });
    }

    // Verify token signature and expiration
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Check if user still exists and is active
    const [users] = await db.execute(
      'SELECT id, email, username, role, is_active FROM users WHERE id = ? AND is_active = 1',
      [decoded.id]
    );

    if (users.length === 0) {
      return res.status(401).json({ error: 'User not found or inactive' });
    }

    // Check for suspicious activity
    if (!SecurityUtils.checkUserRateLimit(decoded.id, 200, 15 * 60 * 1000)) {
      return res.status(429).json({ error: 'Too many requests from this user' });
    }

    req.user = users[0];
    next();
  } catch (error) {
    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({ error: 'Token expired' });
    } else if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({ error: 'Invalid token' });
    }
    console.error('Auth error:', error);
    return res.status(500).json({ error: 'Authentication error' });
  }
};

// Admin middleware
const requireAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ error: 'Admin access required' });
  }
};

// Input validation middleware
const validateInput = (validationRules) => {
  return async (req, res, next) => {
    try {
      // Sanitize all string inputs
      const sanitizeObject = (obj) => {
        for (const key in obj) {
          if (typeof obj[key] === 'string') {
            obj[key] = SecurityUtils.sanitizeInput(obj[key]);
            
            // Check for malicious patterns
            if (SecurityUtils.detectMaliciousPatterns(obj[key])) {
              return res.status(400).json({ 
                error: 'Invalid input detected',
                field: key
              });
            }
          } else if (typeof obj[key] === 'object' && obj[key] !== null) {
            sanitizeObject(obj[key]);
          }
        }
      };

      sanitizeObject(req.body);
      sanitizeObject(req.query);
      sanitizeObject(req.params);

      // Run express-validator
      if (validationRules && validationRules.length > 0) {
        await Promise.all(validationRules.map(rule => rule.run(req)));
        
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
          return res.status(400).json({ 
            error: 'Validation failed',
            details: errors.array()
          });
        }
      }

      next();
    } catch (error) {
      console.error('Validation error:', error);
      res.status(500).json({ error: 'Validation error' });
    }
  };
};

// API Routes

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', timestamp: new Date().toISOString() });
});

// Authentication routes
// Registration with enhanced security
app.post('/api/auth/register', 
  authLimiter,
  validateInput([
    body('username')
      .isLength({ min: 3, max: 30 })
      .matches(/^[a-zA-Z0-9_]+$/)
      .withMessage('Username must be 3-30 characters, alphanumeric and underscores only'),
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .isLength({ min: 8 })
      .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/)
      .withMessage('Password must be at least 8 characters with uppercase, lowercase, number and special character'),
    body('full_name')
      .optional()
      .isLength({ max: 100 })
      .withMessage('Full name must be less than 100 characters'),
    body('phone')
      .optional()
      .isMobilePhone()
      .withMessage('Valid phone number required')
  ]),
  async (req, res) => {
    try {
      const { username, email, password, full_name, phone } = req.body;
      
      // Additional security checks
      if (!SecurityUtils.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      if (!SecurityUtils.validatePassword(password)) {
        return res.status(400).json({ 
          error: 'Password must contain at least 8 characters with uppercase, lowercase, number and special character' 
        });
      }

      // Check if user already exists
      const [existingUsers] = await db.execute(
        'SELECT id FROM users WHERE email = ? OR username = ?',
        [email, username]
      );

      if (existingUsers.length > 0) {
        return res.status(400).json({ error: 'User already exists' });
      }

      const id = generateId();
      const passwordHash = await hashPassword(password);

      await db.execute(
        'INSERT INTO users (id, username, email, password_hash, full_name, phone, is_active, created_at) VALUES (?, ?, ?, ?, ?, ?, 1, NOW())',
        [id, username, email, passwordHash, full_name || null, phone || null]
      );

      const token = generateToken({ id, email, role: 'user' });

      res.status(201).json({
        message: 'User created successfully',
        token,
        user: { id, username, email, full_name, phone, role: 'user' }
      });
    } catch (error) {
      console.error('Registration error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Login with enhanced security
app.post('/api/auth/login',
  authLimiter,
  validateInput([
    body('email')
      .isEmail()
      .normalizeEmail()
      .withMessage('Valid email required'),
    body('password')
      .notEmpty()
      .withMessage('Password required')
  ]),
  async (req, res) => {
    try {
      const { email, password } = req.body;

      // Additional security checks
      if (!SecurityUtils.validateEmail(email)) {
        return res.status(400).json({ error: 'Invalid email format' });
      }

      const [users] = await db.execute(
        'SELECT * FROM users WHERE email = ? AND is_active = TRUE',
        [email]
      );

      if (users.length === 0) {
        // Delay response to prevent timing attacks
        await new Promise(resolve => setTimeout(resolve, 100));
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      const user = users[0];
      const isValidPassword = await comparePassword(password, user.password_hash);

      if (!isValidPassword) {
        // Log failed login attempt
        console.warn(`Failed login attempt for email: ${email} from IP: ${req.ip}`);
        return res.status(401).json({ error: 'Invalid credentials' });
      }

      // Update last login
      await db.execute(
        'UPDATE users SET last_login = NOW() WHERE id = ?',
        [user.id]
      );

      const token = generateToken(user);

      res.json({
        message: 'Login successful',
        token,
        user: {
          id: user.id,
          username: user.username,
          email: user.email,
          full_name: user.full_name,
          phone: user.phone,
          role: user.role
        }
      });
    } catch (error) {
      console.error('Login error:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
);

// Graders routes
app.get('/api/graders', async (req, res) => {
  try {
    const { 
      brand, 
      minPrice, 
      maxPrice, 
      isSold, 
      isFeatured, 
      stockCountry, 
      limit = 20, 
      offset = 0,
      search 
    } = req.query;

    let query = `
      SELECT g.*, u.username as seller_name 
      FROM graders g 
      LEFT JOIN users u ON g.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (brand) {
      query += ' AND g.brand = ?';
      params.push(brand);
    }

    if (minPrice) {
      query += ' AND g.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND g.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (isSold !== undefined) {
      query += ' AND g.is_sold = ?';
      params.push(isSold === 'true');
    }

    if (isFeatured !== undefined) {
      query += ' AND g.is_featured = ?';
      params.push(isFeatured === 'true');
    }

    if (stockCountry) {
      query += ' AND g.stock_country = ?';
      params.push(stockCountry);
    }

    if (search) {
      query += ' AND (g.title LIKE ? OR g.description LIKE ? OR g.brand LIKE ? OR g.model LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY g.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [graders] = await db.execute(query, params);

    // Parse JSON fields
    graders.forEach(grader => {
      if (grader.images) grader.images = JSON.parse(grader.images);
      if (grader.technical_specs) grader.technical_specs = JSON.parse(grader.technical_specs);
      if (grader.features) grader.features = JSON.parse(grader.features);
      if (grader.safety) grader.safety = JSON.parse(grader.safety);
    });

    res.json(graders);
  } catch (error) {
    console.error('Get graders error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/graders/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [graders] = await db.execute(
      'SELECT g.*, u.username as seller_name FROM graders g LEFT JOIN users u ON g.user_id = u.id WHERE g.id = ?',
      [id]
    );

    if (graders.length === 0) {
      return res.status(404).json({ error: 'Grader not found' });
    }

    const grader = graders[0];
    
    // Parse JSON fields
    if (grader.images) grader.images = JSON.parse(grader.images);
    if (grader.technical_specs) grader.technical_specs = JSON.parse(grader.technical_specs);
    if (grader.features) grader.features = JSON.parse(grader.features);
    if (grader.safety) grader.safety = JSON.parse(grader.safety);

    res.json(grader);
  } catch (error) {
    console.error('Get grader error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/graders', authenticateToken, async (req, res) => {
  try {
    const graderData = req.body;
    const id = generateId();

    await db.execute(
      `INSERT INTO graders (
        id, title, brand, model, price, year, operating_hours, fuel, transmission,
        location, seller_type, images, description, technical_specs, features, safety,
        is_new, is_sold, is_featured, listing_date, stock_country, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        graderData.title,
        graderData.brand || null,
        graderData.model || null,
        graderData.price,
        graderData.year || null,
        graderData.operatingHours || null,
        graderData.fuel || null,
        graderData.transmission || null,
        graderData.location || null,
        graderData.sellerType || null,
        JSON.stringify(graderData.images || []),
        graderData.description || null,
        JSON.stringify(graderData.technicalSpecs || {}),
        JSON.stringify(graderData.features || []),
        JSON.stringify(graderData.safety || []),
        graderData.isNew !== undefined ? graderData.isNew : true,
        graderData.isSold !== undefined ? graderData.isSold : false,
        graderData.isFeatured !== undefined ? graderData.isFeatured : false,
        graderData.listingDate || new Date().toISOString().split('T')[0],
        graderData.stockCountry || 'EU',
        req.user.id
      ]
    );

    res.status(201).json({ message: 'Grader created successfully', id });
  } catch (error) {
    console.error('Create grader error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Parts routes
app.get('/api/parts', async (req, res) => {
  try {
    const { 
      brand, 
      category, 
      minPrice, 
      maxPrice, 
      isSold, 
      stockCountry, 
      minStock,
      limit = 20, 
      offset = 0,
      search 
    } = req.query;

    let query = `
      SELECT p.*, u.username as seller_name 
      FROM parts p 
      LEFT JOIN users u ON p.user_id = u.id 
      WHERE 1=1
    `;
    const params = [];

    if (brand) {
      query += ' AND p.brand = ?';
      params.push(brand);
    }

    if (category) {
      query += ' AND p.category = ?';
      params.push(category);
    }

    if (minPrice) {
      query += ' AND p.price >= ?';
      params.push(parseFloat(minPrice));
    }

    if (maxPrice) {
      query += ' AND p.price <= ?';
      params.push(parseFloat(maxPrice));
    }

    if (isSold !== undefined) {
      query += ' AND p.is_sold = ?';
      params.push(isSold === 'true');
    }

    if (stockCountry) {
      query += ' AND p.stock_country = ?';
      params.push(stockCountry);
    }

    if (minStock !== undefined) {
      query += ' AND p.stock_quantity >= ?';
      params.push(parseInt(minStock));
    }

    if (search) {
      query += ' AND (p.title LIKE ? OR p.description LIKE ? OR p.brand LIKE ? OR p.part_number LIKE ?)';
      const searchTerm = `%${search}%`;
      params.push(searchTerm, searchTerm, searchTerm, searchTerm);
    }

    query += ' ORDER BY p.created_at DESC LIMIT ? OFFSET ?';
    params.push(parseInt(limit), parseInt(offset));

    const [parts] = await db.execute(query, params);

    // Parse JSON fields
    parts.forEach(part => {
      if (part.images) part.images = JSON.parse(part.images);
      if (part.compatible_models) part.compatible_models = JSON.parse(part.compatible_models);
      if (part.specifications) part.specifications = JSON.parse(part.specifications);
    });

    res.json(parts);
  } catch (error) {
    console.error('Get parts error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/api/parts/:id', async (req, res) => {
  try {
    const { id } = req.params;

    const [parts] = await db.execute(
      'SELECT p.*, u.username as seller_name FROM parts p LEFT JOIN users u ON p.user_id = u.id WHERE p.id = ?',
      [id]
    );

    if (parts.length === 0) {
      return res.status(404).json({ error: 'Part not found' });
    }

    const part = parts[0];
    
    // Parse JSON fields
    if (part.images) part.images = JSON.parse(part.images);
    if (part.compatible_models) part.compatible_models = JSON.parse(part.compatible_models);
    if (part.specifications) part.specifications = JSON.parse(part.specifications);

    res.json(part);
  } catch (error) {
    console.error('Get part error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.post('/api/parts', authenticateToken, async (req, res) => {
  try {
    const partData = req.body;
    const id = generateId();

    await db.execute(
      `INSERT INTO parts (
        id, title, brand, category, price, part_number, compatible_models, images,
        description, specifications, is_new, is_sold, stock_quantity, listing_date, stock_country, user_id
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        partData.title,
        partData.brand,
        partData.category,
        partData.price,
        partData.partNumber,
        JSON.stringify(partData.compatibleModels || []),
        JSON.stringify(partData.images || []),
        partData.description || null,
        JSON.stringify(partData.specifications || {}),
        partData.isNew !== undefined ? partData.isNew : true,
        partData.isSold !== undefined ? partData.isSold : false,
        partData.stockQuantity || 0,
        partData.listingDate || new Date().toISOString().split('T')[0],
        partData.stockCountry || 'EU',
        req.user.id
      ]
    );

    res.status(201).json({ message: 'Part created successfully', id });
  } catch (error) {
    console.error('Create part error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Sales locations route
app.get('/api/sales-locations', async (req, res) => {
  try {
    const [locations] = await db.execute(
      'SELECT * FROM sales_locations ORDER BY created_at DESC'
    );

    // Parse JSON fields
    locations.forEach(location => {
      if (location.products) location.products = JSON.parse(location.products);
    });

    res.json(locations);
  } catch (error) {
    console.error('Get sales locations error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Contact messages route
app.post('/api/contact', async (req, res) => {
  try {
    const { name, email, phone, subject, message } = req.body;

    if (!name || !email || !message) {
      return res.status(400).json({ error: 'Name, email and message are required' });
    }

    const id = generateId();

    await db.execute(
      'INSERT INTO contact_messages (id, name, email, phone, subject, message) VALUES (?, ?, ?, ?, ?, ?)',
      [id, name, email, phone || null, subject || null, message]
    );

    res.status(201).json({ message: 'Message sent successfully' });
  } catch (error) {
    console.error('Contact message error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Homepage slider route
app.get('/api/homepage-slider', async (req, res) => {
  try {
    const [sliderItems] = await db.execute(
      'SELECT * FROM homepage_slider WHERE is_active = TRUE ORDER BY order_index ASC'
    );

    res.json(sliderItems);
  } catch (error) {
    console.error('Get homepage slider error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Serve static files from React build
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, '../dist')));
  
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, '../dist/index.html'));
  });
}

// Error handling middleware
app.use((error, req, res, next) => {
  console.error('Unhandled error:', error);
  res.status(500).json({ error: 'Internal server error' });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

// Start server
async function startServer() {
  await connectDB();
  
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📊 Environment: ${process.env.NODE_ENV || 'development'}`);
    console.log(`🌐 Frontend URL: ${process.env.FRONTEND_URL || 'http://localhost:5173'}`);
  });
}

startServer().catch(console.error);

module.exports = app;
