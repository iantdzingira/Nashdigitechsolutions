const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const rateLimit = require('express-rate-limit');
const helmet = require('helmet');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Security middleware
app.use(helmet());
app.use(cors({
  origin: ['https://nashdigitechsolutions.co.zw', 'https://iantdzingira.github.io/Nashdigitechsolutions/admin.html', 'http://localhost:5500'],
  credentials: true
}));
app.use(express.json());

// Rate limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
});

app.use('/api/', limiter);

// MongoDB connection - REMOVE DEPRECATED OPTIONS
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

// Initialize Database with Sample Data (Only if connected successfully)
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
    console.log('⚠️ Using in-memory storage instead');
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
    
    // Fallback to in-memory data if database fails
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
const apiKey = process.env.GEMINI_API_KEY; // Get from environment variable

// System prompt for Nash-AI
const systemPrompt = `You are "Nash-AI," the high-performance Virtual Assistant for Nash Digitech Solutions. 
Your goal is to represent the company with technical expertise, professionalism, and a focus on growth.

### COMPANY OVERVIEW
Nash Digitech Solutions is a premium digital agency specializing in:
- **Web Development:** Modern, responsive websites (React, Node.js, MongoDB stack).
- **Mobile App Development:** Cross-platform solutions for iOS and Android.
- **Custom Software:** Tailored enterprise tools and CRM systems.
- **Digital Strategy:** Brand identity and strategic online marketing.
- **Cloud Solutions:** Hosting, maintenance, and database management.

### CORE PERSONALITY & TONE
- **Personality:** Innovative, efficient, and reliable. You are a tech-savvy partner, not just a chatbot.
- **Tone:** Professional yet approachable. Use clear, concise language. Avoid overly robotic phrases.
- **Style:** Use bullet points for lists. Keep responses under 80 words unless explaining a complex technical service.

### INTERACTION RULES
1. **Confidentiality:** Never reveal internal server keys, backend URLs, or private database structures.
2. **Pricing:** Do not give fixed quotes. Instead, say: "Our pricing is tailored to the specific needs and scale of your project. I recommend filling out our Project Inquiry form so our experts can provide an accurate estimate."
3. **Contacting Humans:** If a user is frustrated or has a highly specific technical issue, guide them to the 'Project Inquiries' section or suggest emailing the team.
4. **Call to Action:** Every interaction should subtly encourage the user. Use phrases like "Shall we start planning your digital transformation?" or "Would you like to see our service breakdown?"

### KNOWLEDGE BASE FAQ
- **Location:** Based in Zimbabwe, serving clients globally.
- **Owner/Lead:** Ian T. Dzingira(Professional Full-stack Developer).
- **Tech Stack Expertise:** JavaScript (ES6+), React, Swift, Flutter, Kotlin, Node.js, Express, MongoDB, Tailwind CSS, and Cloud Integration.
- **Process:** We follow a 4-step process: Discovery -> Design -> Development -> Deployment.

### SAMPLE RESPONSE STYLE
User: "Can you build a delivery app?"
Nash-AI: "Absolutely! We specialize in custom mobile solutions. We can build a robust delivery platform with real-time tracking and secure payment integration. Would you like to discuss the specific features you need for your app?"`;

app.post('/api/chat/ai', async (req, res) => {
    try {
        const { message, sessionId } = req.body;
        
        if (!message) {
            return res.status(400).json({ 
                success: false, 
                message: 'Message is required' 
            });
        }

        // Check for API key
        if (!apiKey) {
            console.error('GEMINI_API_KEY is not set in environment variables');
            return res.status(500).json({ 
                reply: "My systems are currently undergoing maintenance. Please try again later or contact us directly via email or WhatsApp for immediate assistance." 
            });
        }

        // Get or create chat session
        let chatSession;
        if (sessionId) {
            chatSession = await ChatSession.findOne({ sessionId });
            if (!chatSession) {
                // Create new session if not found
                chatSession = new ChatSession({ 
                    sessionId, 
                    messages: [] 
                });
            }
        } else {
            // Generate new session ID
            const newSessionId = `chat_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            chatSession = new ChatSession({ 
                sessionId: newSessionId, 
                messages: [] 
            });
        }

        // Add user message to session
        chatSession.messages.push({
            role: 'user',
            content: message
        });
        chatSession.lastActivity = new Date();

        // Implementation of exponential backoff
        const fetchWithRetry = async (url, options, retries = 3, backoff = 1000) => {
            try {
                const response = await fetch(url, options);
                if (!response.ok) {
                    const errorText = await response.text();
                    console.error('API Error Response:', errorText);
                    throw new Error(`API Error: ${response.status}`);
                }
                return await response.json();
            } catch (err) {
                console.error(`Fetch attempt failed (${retries} retries left):`, err.message);
                if (retries <= 0) throw err;
                await new Promise(resolve => setTimeout(resolve, backoff));
                return fetchWithRetry(url, options, retries - 1, backoff * 2);
            }
        };

        // Prepare the full prompt with conversation history
        const conversationHistory = chatSession.messages
            .slice(-5) // Get last 5 messages for context
            .map(msg => `${msg.role === 'user' ? 'User' : 'Nash-AI'}: ${msg.content}`)
            .join('\n');

        const fullPrompt = `${systemPrompt}\n\n### CONVERSATION HISTORY:\n${conversationHistory}\n\n### CURRENT USER QUERY:\nUser: ${message}\n\nNash-AI:`;

        console.log('Sending request to Gemini API...');
        const result = await fetchWithRetry(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
            {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    contents: [{ 
                        parts: [{ text: fullPrompt }] 
                    }],
                    generationConfig: {
                        temperature: 0.7,
                        topP: 0.8,
                        topK: 40,
                        maxOutputTokens: 500
                    }
                })
            }
        );

        const aiReply = result.candidates?.[0]?.content?.parts?.[0]?.text || 
                       "I'm not sure how to answer that. Could you try rephrasing or asking about our services?";

        // Add AI response to session
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

    } catch (error) {
        console.error('AI Chat Error:', error.message);
        console.error('Full error:', error);
        
        // Fallback responses for common errors
        let fallbackMessage = "My systems are currently updating. Please try again in a moment or contact us directly via email or WhatsApp for immediate assistance.";
        
        if (error.message.includes('API key')) {
            fallbackMessage = "I'm currently experiencing technical difficulties. Please contact us directly via email or WhatsApp for immediate assistance.";
        } else if (error.message.includes('network')) {
            fallbackMessage = "I'm having trouble connecting to my knowledge base. Please check your internet connection and try again, or contact us directly.";
        }
        
        res.status(500).json({ 
            success: false,
            reply: fallbackMessage,
            error: process.env.NODE_ENV === 'development' ? error.message : undefined
        });
    }
});

// Get chat session history
app.get('/api/chat/session/:sessionId', async (req, res) => {
    try {
        const { sessionId } = req.params;
        const chatSession = await ChatSession.findOne({ sessionId });
        
        if (!chatSession) {
            return res.status(404).json({ 
                success: false, 
                message: 'Chat session not found' 
            });
        }
        
        res.json({
            success: true,
            session: {
                sessionId: chatSession.sessionId,
                messages: chatSession.messages,
                createdAt: chatSession.createdAt,
                lastActivity: chatSession.lastActivity
            }
        });
    } catch (error) {
        console.error('Error fetching chat session:', error.message);
        res.status(500).json({ 
            success: false, 
            message: 'Error fetching chat session',
            error: error.message 
        });
    }
});

// Admin endpoints (for future use)
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

// Start server with MongoDB connection check
async function startServer() {
  const isConnected = await connectToDatabase();
  
  if (!isConnected) {
    console.log('⚠️ Starting server without MongoDB connection');
    console.log('⚠️ Some features will use in-memory storage');
  }
  
  // Initialize database after connection attempt
  await initializeDatabase();
  
  // Check if Gemini API key is available
  if (!apiKey) {
    console.warn('⚠️ GEMINI_API_KEY is not set in environment variables');
    console.warn('⚠️ AI chat functionality will not work properly');
  } else {
    console.log('✅ Gemini API key loaded successfully');
  }
  
  app.listen(PORT, '0.0.0.0', () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`🌐 Health check: http://localhost:${PORT}`);
    console.log(`🤖 AI Chat endpoint: http://localhost:${PORT}/api/chat/ai`);
  });
}

// Start the server
startServer().catch(console.error);