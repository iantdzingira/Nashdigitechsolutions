const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios'); // Add axios for better HTTP requests
const OpenAI = require("openai");
require('dotenv').config();


const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['https://nashdigitechsolutions.co.zw', 'https://iantdzingira.github.io/Nashdigitechsolutions/admin.html', 'http://localhost:5500', 'http://127.0.0.1:5500'],
  credentials: true
}));
app.use(express.json());

// Rate limiting - more generous for chat
const apiLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100
});

const chatLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 50 // Lower limit for chat to prevent abuse
});

app.use('/api/', apiLimiter);
app.use('/api/chat/ai', chatLimiter);

// MongoDB connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/nash-digitech';

async function connectToDatabase() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
    return true;
  } catch (error) {
    console.error('❌ MongoDB connection error:', error.message);
    return false;
  }
}

// Mongoose Schemas
const testimonialSchema = new mongoose.Schema({
  name: { type: String, required: true },
  position: String,
  country: { type: String, required: true },
  rating: { type: Number, required: true, min: 1, max: 5 },
  testimonial: { type: String, required: true },
  status: { type: String, enum: ['pending', 'approved', 'rejected'], default: 'pending' },
  email: String,
  createdAt: { type: Date, default: Date.now }
});

const contactSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true },
  phone: String,
  service: String,
  servicePrice: String,
  budget: String,
  message: { type: String, required: true },
  platforms: [String],
  newsletterOptIn: { type: Boolean, default: false },
  status: { type: String, enum: ['new', 'contacted', 'in-progress', 'completed'], default: 'new' },
  createdAt: { type: Date, default: Date.now }
});

const newsletterSchema = new mongoose.Schema({
  email: { type: String, required: true, unique: true },
  subscribedAt: { type: Date, default: Date.now },
  active: { type: Boolean, default: true }
});

const chatSessionSchema = new mongoose.Schema({
  sessionId: { type: String, required: true, unique: true },
  messages: [{
    role: { type: String, enum: ['user', 'assistant'], required: true },
    content: { type: String, required: true },
    timestamp: { type: Date, default: Date.now }
  }],
  createdAt: { type: Date, default: Date.now },
  lastActivity: { type: Date, default: Date.now }
});

// Mongoose Models
const Testimonial = mongoose.model('Testimonial', testimonialSchema);
const Contact = mongoose.model('Contact', contactSchema);
const Newsletter = mongoose.model('Newsletter', newsletterSchema);
const ChatSession = mongoose.model('ChatSession', chatSessionSchema);

// Initialize Database with Sample Data
async function initializeDatabase() {
  try {
    const count = await Testimonial.countDocuments();
    
    if (count === 0) {
      const sampleTestimonials = [
        {
          name: "Takunda Moyo",
          position: "CEO, Safari Adventures Zimbabwe",
          country: "Zimbabwe",
          rating: 5,
          testimonial: "Nash Digitech transformed our online presence completely. Our new website increased conversions by 150% in just 3 months. Their team is professional, responsive, and truly understands digital business.",
          status: "approved"
        },
        {
          name: "Sarah Chidemo",
          position: "Operations Director, AgriTech Solutions",
          country: "South Africa",
          rating: 4,
          testimonial: "The AI analytics dashboard they built for us has revolutionized how we make business decisions. Real-time insights have improved our operational efficiency by 40%. Exceptional work!",
          status: "approved"
        },
        {
          name: "Robert Ndlovu",
          position: "Founder, HealthTech Zimbabwe",
          country: "Zimbabwe",
          rating: 5,
          testimonial: "From concept to launch, the team at Nash Digitech was incredible. Our mobile app has over 10,000 downloads in the first month alone. Their 24/7 support is a game-changer for businesses.",
          status: "approved"
        }
      ];
      
      await Testimonial.insertMany(sampleTestimonials);
      console.log('✅ Sample testimonials added');
    }
    
    console.log(`📊 Database initialized with ${count} existing testimonials`);
  } catch (error) {
    console.error('⚠️ Error initializing database:', error.message);
  }
}

// Health check
app.get('/', (req, res) => {
  res.json({ 
    message: 'Nash Digitech Backend API',
    status: 'running',
    version: '1.0.0',
    mongodb: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected',
    endpoints: {
      testimonials: '/api/testimonials',
      contacts: '/api/contacts',
      newsletter: '/api/newsletter/subscribe',
      stats: '/api/testimonials/stats',
      chat: '/api/chat/ai'
    }
  });
});

// Get all approved testimonials
app.get('/api/testimonials', async (req, res) => {
  try {
    const testimonials = await Testimonial.find({ status: 'approved' })
      .sort({ createdAt: -1 })
      .limit(10);
    
    // Calculate stats
    const total = await Testimonial.countDocuments({ status: 'approved' });
    const averageRatingAgg = await Testimonial.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    
    const countries = await Testimonial.distinct('country', { status: 'approved' });
    
    res.json({
      success: true,
      testimonials,
      stats: {
        total,
        averageRating: averageRatingAgg[0]?.avgRating?.toFixed(1) || '0.0',
        countriesCount: countries.length
      }
    });
  } catch (error) {
    console.error('Error fetching testimonials:', error.message);
    
    // Fallback to in-memory data
    const fallbackData = {
      success: true,
      testimonials: [
        {
          _id: '1',
          name: "Takunda Moyo",
          position: "CEO, Safari Adventures Zimbabwe",
          country: "Zimbabwe",
          rating: 5,
          testimonial: "Nash Digitech transformed our online presence completely.",
          status: "approved",
          createdAt: new Date()
        }
      ],
      stats: {
        total: 1,
        averageRating: '5.0',
        countriesCount: 1
      }
    };
    
    res.json(fallbackData);
  }
});

// Submit a new testimonial
app.post('/api/testimonials', async (req, res) => {
  try {
    const testimonial = new Testimonial(req.body);
    await testimonial.save();
    res.status(201).json({ 
      success: true,
      message: 'Testimonial submitted successfully! It will be reviewed and published soon.',
      testimonial 
    });
  } catch (error) {
    console.error('Error submitting testimonial:', error.message);
    res.status(400).json({ 
      success: false,
      message: 'Error submitting testimonial. Please try again.',
      error: error.message 
    });
  }
});

// Submit contact form
app.post('/api/contacts', async (req, res) => {
  try {
    const contact = new Contact(req.body);
    await contact.save();
    
    // If newsletter opt-in is true, add to newsletter
    if (req.body.newsletterOptIn && req.body.email) {
      try {
        const newsletter = new Newsletter({ email: req.body.email });
        await newsletter.save();
      } catch (newsletterError) {
        // Ignore duplicate email errors
        if (newsletterError.code !== 11000) {
          console.error('Newsletter subscription error:', newsletterError.message);
        }
      }
    }
    
    res.status(201).json({ 
      success: true,
      message: 'Contact form submitted successfully! We will contact you via your selected platforms.',
      contact
    });
  } catch (error) {
    console.error('Error submitting contact form:', error.message);
    res.status(400).json({ 
      success: false,
      message: 'Error submitting contact form. Please try again.',
      error: error.message
    });
  }
});

// Newsletter subscription
app.post('/api/newsletter/subscribe', async (req, res) => {
  try {
    const { email } = req.body;
    
    if (!email) {
      return res.status(400).json({ 
        success: false,
        message: 'Email is required' 
      });
    }
    
    // Check if already subscribed
    const existing = await Newsletter.findOne({ email });
    if (existing) {
      return res.status(200).json({ 
        success: true,
        message: 'Already subscribed to newsletter' 
      });
    }
    
    const subscriber = new Newsletter({ email });
    await subscriber.save();
    
    res.status(201).json({ 
      success: true,
      message: 'Successfully subscribed to newsletter' 
    });
  } catch (error) {
    if (error.code === 11000) {
      return res.status(200).json({ 
        success: true,
        message: 'Already subscribed to newsletter' 
      });
    }
    console.error('Error subscribing to newsletter:', error.message);
    res.status(400).json({ 
      success: false,
      message: 'Error subscribing to newsletter',
      error: error.message
    });
  }
});

// Get testimonial statistics
app.get('/api/testimonials/stats', async (req, res) => {
  try {
    const total = await Testimonial.countDocuments({ status: 'approved' });
    const averageRatingAgg = await Testimonial.aggregate([
      { $match: { status: 'approved' } },
      { $group: { _id: null, avgRating: { $avg: '$rating' } } }
    ]);
    const countries = await Testimonial.distinct('country', { status: 'approved' });
    
    res.json({
      success: true,
      total,
      averageRating: averageRatingAgg[0]?.avgRating?.toFixed(1) || '0.0',
      countriesCount: countries.length,
      happyClients: total
    });
  } catch (error) {
    console.error('Error fetching statistics:', error.message);
    
    // Fallback response
    res.json({
      success: true,
      total: 3,
      averageRating: '4.7',
      countriesCount: 2,
      happyClients: 3
    });
  }
});

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" }); // Fast and free

// The Full Nash Digitech Brain
const NASH_SYSTEM_PROMPT = `
You are the official AI assistant for Nash Digitech Solutions.

You represent the company professionally and help visitors understand services, technology solutions, and how to work with Nash Digitech Solutions.

============================
COMPANY INFORMATION
============================

Company Name:
Nash Digitech Solutions

Tagline:
From Code to Cognition: Your Complete Technology Partner.

Industry:
Software Development
Technology Solutions
Digital Transformation

Location:
Victoria Falls, Zimbabwe

Website:
https://nashdigitechsolutions.co.zw

Phone:
+263 78 718 2780

Company Overview:

Nash Digitech Solutions is a modern digital technology company focused on building innovative digital platforms, business systems, mobile applications, and websites for businesses and organizations.

The company helps businesses modernize their operations through automation, web technologies, mobile applications, and custom software systems.

Nash Digitech Solutions provides advanced digital solutions for startups, enterprises, and growing businesses looking to establish or improve their digital presence.

============================
FOUNDER & CEO
============================

Founder and CEO:
Ian Tinashe Dzingira

Professional Profile:

Ian Tinashe Dzingira is a software developer, entrepreneur, and technology innovator from Zimbabwe.

He is the founder of Nash Digitech Solutions and currently works as a Junior Programmer Analyst at Mains'l Solutions.

Ian specializes in software engineering, web development, mobile applications, and business automation systems.

He studied Software Engineering / Software Development and obtained certification from Matter Career Readiness Institute.

Ian is experienced in modern development technologies including full-stack web development and cross-platform mobile development.

============================
TECHNOLOGY STACK
============================

Programming Languages:
JavaScript
Swift
C#
PHP
HTML
CSS

Frameworks:
React
React Native
.NET
Node.js

Databases:
MongoDB
SQLite
SQL Server

Development Skills:
API Integration
Database Architecture
Backend Development
Mobile App Development
Cloud Systems
Automation
Admin Dashboards

============================
CAREER
============================

Current Position:
Junior Programmer Analyst

Company:
Mains'l Solutions

Start Date:
January 2026

Responsibilities:
Software Development
Mobile App Feature Development
Backend Systems
Database Design
API Integrations
Business System Automation

============================
MAJOR PROJECTS
============================

BNB-Hunt
A real estate discovery and property listing platform.

Legal Document Management System
A system used to manage legal documents and workflows digitally.

EVV Project
A digital verification system used for monitoring and operational verification.

============================
NASH DIGITECH SOLUTIONS SERVICES
============================

Advanced Digital Solutions

Nash Digitech Solutions provides advanced technology services designed to help businesses build digital infrastructure and scale their operations.

---------------------------------
Professional Website Design
---------------------------------

We create stunning, responsive websites that work perfectly on all devices and help businesses grow online.

Features include:

Up to 15 Website Pages
WordPress Website Design
Content Management System (CMS)
Responsive Mobile Design
Photo Galleries
Multimedia Integration
Website Contact Forms

Starting Price:
$250+

---------------------------------
Mobile App Development
---------------------------------

Development of powerful mobile applications for iOS and Android devices.

Services include:

iOS App Development (Swift)
Android App Development (Kotlin / Java)
Cross-platform development using React Native or Flutter
App Store Deployment
Google Play Store Deployment
Push Notifications
Backend API Integration

Starting Price:
$500+

---------------------------------
System Development (Non-Web)
---------------------------------

Custom desktop and enterprise software solutions designed to automate business operations.

Examples include:

Desktop Applications
Enterprise Resource Planning Systems (ERP)
Customer Relationship Management Systems (CRM)
Inventory Management Systems
Database Design & Development
API Development & Integration

Starting Price:
$1,000+

---------------------------------
System Development (Web-Based)
---------------------------------

Advanced web platforms with complex functionality.

Examples include:

Interactive Web Applications
E-commerce Platforms
Learning Management Systems
Payment Gateway Integration
Real-time Data Features
Admin Dashboards
Business Analytics Systems

Starting Price:
$700+

---------------------------------
Digital Marketing & Support
---------------------------------

Helping businesses build and maintain a strong digital presence.

Services include:

Social Media Setup
Social Media Integration
Google Search Console Setup
Google Analytics Integration
Website Monitoring
Performance Optimization
24/7 Technical Support

Monthly Plans Starting At:
$100/month

---------------------------------
Creative Design Services
---------------------------------

Professional branding and visual design services.

Services include:

Logo Design
Brand Identity Development
UI/UX Design
Marketing Materials Design
Social Media Graphics
Print Design
Brand Style Guides

Starting Price:
$75+

============================
TARGET CLIENTS
============================

Startups
Small Businesses
Entrepreneurs
Organizations
Local Businesses
Growing Companies

============================
MISSION
============================

To empower businesses with powerful technology solutions that improve productivity, efficiency, and digital presence.

============================
VISION
============================

To become one of Africa's most trusted digital technology companies.

============================
VALUES
============================

Innovation
Reliability
Professionalism
Creativity
Customer Success

============================
BOT PERSONALITY
============================

You are:

Professional
Helpful
Friendly
Knowledgeable
Confident

You represent Nash Digitech Solutions.

Always answer clearly and professionally.

If users ask about services, explain them clearly.

If someone wants a website, mobile app, or system developed, encourage them to contact Nash Digitech Solutions.

============================
CONTACT
============================

Phone:
+263 78 718 2780

Website:
https://nashdigitechsolutions.co.zw

============================
GOAL
============================

Help visitors:

Understand Nash Digitech Solutions
Learn about services
Understand the founder's expertise
Start technology projects
Book consultations
`;

app.post('/api/chat/ai', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        if (!message) return res.status(400).json({ success: false, message: 'Message is required' });

        // 2. Database Session Logic (Keep your existing code)
        let chatSession = await ChatSession.findOne({ sessionId });
        if (!chatSession) {
            chatSession = new ChatSession({ 
                sessionId: sessionId || `session_${Date.now()}`, 
                messages: [] 
            });
        }

        // 3. Format History for Gemini
        // Gemini expects { role: "user" or "model", parts: [{ text: "..." }] }
        const history = chatSession.messages.slice(-10).map(msg => ({
            role: msg.role === 'assistant' ? 'model' : 'user',
            parts: [{ text: msg.content }]
        }));

        // 4. Start Chat with System Instructions
        const chat = model.startChat({
            history: history,
            systemInstruction: NASH_SYSTEM_PROMPT, // Your existing prompt
        });

        const result = await chat.sendMessage(message);
        const aiReply = result.response.text();

        // 5. Update Database
        chatSession.messages.push({ role: 'user', content: message });
        chatSession.messages.push({ role: 'assistant', content: aiReply });
        chatSession.lastActivity = new Date();
        
        await chatSession.save().catch(err => console.error("DB Save Error:", err));

        res.json({
            success: true,
            reply: aiReply,
            sessionId: chatSession.sessionId
        });

    } catch (error) {
        console.error('Gemini Backend Error:', error);
        res.json({
            success: false,
            message: error.message,
            reply: "I'm having a quick look at my systems. Please try again or WhatsApp Nash at +263 78 718 2780!"
        });
    }
});

// Admin endpoints
app.get('/api/admin/testimonials/all', async (req, res) => {
  try {
    const testimonials = await Testimonial.find().sort({ createdAt: -1 });
    res.json({ success: true, testimonials });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching all testimonials' });
  }
});

app.get('/api/admin/contacts/all', async (req, res) => {
  try {
    const contacts = await Contact.find().sort({ createdAt: -1 });
    res.json({ success: true, contacts });
  } catch (error) {
    res.status(500).json({ success: false, error: 'Error fetching all contacts' });
  }
});

// Update testimonial status
app.patch('/api/admin/testimonials/:id/status', async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    
    const testimonial = await Testimonial.findByIdAndUpdate(
      id,
      { status },
      { new: true }
    );
    
    if (!testimonial) {
      return res.status(404).json({ 
        success: false, 
        message: 'Testimonial not found' 
      });
    }
    
    res.json({ 
      success: true,
      message: 'Status updated successfully',
      testimonial 
    });
  } catch (error) {
    console.error('Error updating status:', error.message);
    res.status(400).json({ 
      success: false,
      message: 'Error updating status',
      error: error.message 
    });
  }
});

// Start server
async function startServer() {
  const isConnected = await connectToDatabase();
  
  if (!isConnected) {
    console.log('⚠️ Starting server without MongoDB connection');
    console.log('⚠️ Some features will use in-memory storage');
  }
  
  await initializeDatabase();
  
  if (!process.env.OPENAI_API_KEY) {
    console.log('⚠️ OPENAI_API_KEY not found. AI chat will use fallback responses.');
    console.log('ℹ️  To enable full AI chat, add OPENAI_API_KEY to your environment variables');
  } else {
    console.log('✅ OpenAI API key loaded');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}`);
    console.log(`🤖 Chat test: http://localhost:${PORT}/api/chat/test`);
  });
}

app.get('/api/chat/test', (req, res) => {
  res.json({
    success: true,
    message: "Nash Digitech API is active",
    timestamp: new Date().toISOString(),
    apikey: process.env.OPENAI_API_KEY ? '✅ Loaded' : '❌ Not Found'
  });
});
// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});