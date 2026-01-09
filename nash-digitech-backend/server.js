const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
const axios = require('axios'); // Add axios for better HTTP requests
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

// --- AI CHAT ENDPOINT ---
const apiKey = process.env.GEMINI_API_KEY;

// System prompt for Nash-AI
const systemPrompt = `You are "Nash-AI," the virtual assistant for Nash Digitech Solutions. Provide helpful, accurate information about our services.

COMPANY SERVICES:
1. Website Design & Development - Custom websites starting at $500
2. Mobile App Development - iOS & Android apps starting at $250
3. System Development - Web & desktop systems from $700+
4. Digital Marketing - Monthly plans from $100
5. Creative Design - Logos, branding from $75

IMPORTANT RULES:
- Never give exact prices, say "starting at" or "contact us for a quote"
- Be friendly and professional
- If unsure, suggest contacting us directly
- Keep responses concise (max 100 words)
- Our location: Victoria Falls, Zimbabwe
- Contact: +263 78 718 2780, nashdigitechsolutions@gmail.com`;

app.post('/api/chat/ai', async (req, res) => {
  try {
    const { message, sessionId } = req.body;
    
    if (!message || typeof message !== 'string') {
      return res.status(400).json({ 
        success: false, 
        message: 'Valid message is required' 
      });
    }

    // Check if API key is available
    if (!apiKey) {
      console.warn('⚠️ Gemini API key not found');
      // Return a helpful response even without AI
      return res.json({
        success: true,
        reply: "I'm here to help! For detailed inquiries about our services, please email us at nashdigitechsolutions@gmail.com or call +263 78 718 2780. You can also visit our website for more information about our services.",
        sessionId: sessionId || `chat_${Date.now()}`
      });
    }

    // Get or create chat session
    let chatSession;
    if (sessionId) {
      chatSession = await ChatSession.findOne({ sessionId });
    }
    
    if (!chatSession) {
      const newSessionId = sessionId || `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      chatSession = new ChatSession({ 
        sessionId: newSessionId, 
        messages: [] 
      });
    }

    // Add user message
    chatSession.messages.push({
      role: 'user',
      content: message
    });
    chatSession.lastActivity = new Date();

    // Prepare conversation history (last 4 messages for context)
    const conversationHistory = chatSession.messages
      .slice(-4)
      .map(msg => `${msg.role === 'user' ? 'User' : 'Assistant'}: ${msg.content}`)
      .join('\n');

    // Build the prompt
    const prompt = `${systemPrompt}\n\nPrevious conversation:\n${conversationHistory}\n\nUser: ${message}\n\nAssistant:`;

    try {
      // Call Gemini API with axios (more reliable than fetch)
      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
        {
          contents: [{
            parts: [{
              text: prompt
            }]
          }],
          generationConfig: {
            temperature: 0.7,
            topP: 0.8,
            topK: 40,
            maxOutputTokens: 300
          }
        },
        {
          headers: {
            'Content-Type': 'application/json'
          },
          timeout: 10000 // 10 second timeout
        }
      );

      const aiReply = response.data?.candidates?.[0]?.content?.parts?.[0]?.text || 
        "Thanks for your message! How can I assist you with Nash Digitech Solutions today?";

      // Add AI response
      chatSession.messages.push({
        role: 'assistant',
        content: aiReply
      });

      // Save session
      await chatSession.save();

      res.json({
        success: true,
        reply: aiReply,
        sessionId: chatSession.sessionId
      });

    } catch (geminiError) {
      console.error('Gemini API error:', geminiError.message);
      
      // Provide fallback response if Gemini fails
      const fallbackReplies = [
        "Thanks for reaching out to Nash Digitech Solutions! We specialize in website design, mobile apps, and digital marketing. How can I help you today?",
        "Hello! I'm here to assist you with information about Nash Digitech's services. Are you looking for website development, mobile apps, or something else?",
        "Welcome to Nash Digitech Solutions! We offer custom software development and digital services. Feel free to ask about our pricing or portfolio."
      ];
      
      const fallbackReply = fallbackReplies[Math.floor(Math.random() * fallbackReplies.length)];
      
      // Still save the conversation
      chatSession.messages.push({
        role: 'assistant',
        content: fallbackReply
      });
      await chatSession.save();

      res.json({
        success: true,
        reply: fallbackReply,
        sessionId: chatSession.sessionId
      });
    }

  } catch (error) {
    console.error('Chat endpoint error:', error.message);
    
    // Final fallback response
    res.json({
      success: true,
      reply: "Hello! Thanks for contacting Nash Digitech Solutions. For immediate assistance, please email us at nashdigitechsolutions@gmail.com or call +263 78 718 2780. We're here to help with all your digital needs!",
      sessionId: req.body.sessionId || `fallback_${Date.now()}`
    });
  }
});

// Simple test endpoint
app.get('/api/chat/test', (req, res) => {
  res.json({
    success: true,
    message: 'Chat API is working',
    geminiApiKey: apiKey ? 'Configured' : 'Not configured'
  });
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
  
  if (!apiKey) {
    console.log('⚠️ GEMINI_API_KEY not found. AI chat will use fallback responses.');
    console.log('ℹ️  To enable full AI chat, add GEMINI_API_KEY to your environment variables');
  } else {
    console.log('✅ Gemini API key loaded');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}`);
    console.log(`🤖 Chat test: http://localhost:${PORT}/api/chat/test`);
  });
}

// Handle unhandled promise rejections
process.on('unhandledRejection', (reason, promise) => {
  console.error('Unhandled Rejection at:', promise, 'reason:', reason);
});

// Start the server
startServer().catch(error => {
  console.error('Failed to start server:', error);
  process.exit(1);
});