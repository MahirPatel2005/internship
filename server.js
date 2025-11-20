const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const { Server } = require('socket.io');
require('dotenv').config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: "*",
    methods: ["GET", "POST"]
  }
});

const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// In-memory storage fallback
let inMemoryMessages = [];
let useInMemory = false;

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/ventspace';

mongoose.connect(MONGODB_URI)
  .then(() => {
    console.log('✅ Connected to MongoDB');
    useInMemory = false;
  })
  .catch(err => {
    console.error('❌ MongoDB connection error:', err);
    console.log('⚠️  Using in-memory storage (data will be lost on restart)');
    useInMemory = true;
  });

// Message Schema
const messageSchema = new mongoose.Schema({
  text: {
    type: String,
    required: true,
    maxlength: 1000,
    minlength: 3
  },
  emoji: {
    type: String,
    default: '💭',
    enum: ['😊', '😢', '😤', '😰', '😔', '🤗', '😌', '💭']
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  ipHash: String // For rate limiting (hashed for privacy)
});

const Message = mongoose.model('Message', messageSchema);

// Content moderation patterns
const harmfulPatterns = [
  /\b(kill|suicide|harm|hurt|cut|end)\s+(myself|yourself|themselves|my\s*self|your\s*self)\b/i,
  /\b(want|going|gonna)\s+to\s+(die|kill|end)\b/i,
  /\b(suicidal|self[\s-]harm)\b/i,
  /\b(f+u+c+k+|sh+i+t+|b+i+t+c+h+|a+s+s+h+o+l+e+|c+u+n+t+|d+a+m+n+|h+e+l+l+)\b/gi,
  /\b(stupid|idiot|dumb|moron|retard)\s+(you|people|everyone|person)\b/i,
  /\b(hate|despise|loathe)\s+(you|everyone|people|all)\b/i,
  /\b(kill|murder|hurt|attack|beat)\s+(you|them|someone|people)\b/i,
  /\b(death|violence)\s+(threat|wish)\b/i,
  /\b(shoot|stab|punch|hit)\s+(you|them|someone)\b/i,
  /\b(racist|sexist|homophobic|transphobic)\b/i,
  /\b(n+i+g+g+|f+a+g+g+|tr+a+n+n+y+)\b/gi,
  /(.)\1{10,}/i,
  /\b(buy|click|visit|check)\s+(now|here|this)\b/gi,
  /(https?:\/\/|www\.)/gi,
  /\b[\w\.-]+@[\w\.-]+\.\w+\b/gi
];

// Moderation function
function moderateContent(text) {
  if (text.length < 3) {
    return { safe: false, message: 'Message too short (minimum 3 characters).' };
  }

  for (let i = 0; i < harmfulPatterns.length; i++) {
    if (harmfulPatterns[i].test(text)) {
      if (i < 3) {
        return { safe: false, message: 'Content related to self-harm detected. Please reach out: 988' };
      } else if (i < 9) {
        return { safe: false, message: 'Inappropriate or abusive language detected.' };
      } else if (i < 11) {
        return { safe: false, message: 'Discriminatory language is not allowed.' };
      } else {
        return { safe: false, message: 'Spam or prohibited content detected.' };
      }
    }
  }

  const letters = text.replace(/[^a-zA-Z]/g, '');
  if (letters.length > 10) {
    const upperCount = text.replace(/[^A-Z]/g, '').length;
    if (upperCount / letters.length > 0.7) {
      return { safe: false, message: 'Please avoid excessive capital letters.' };
    }
  }

  return { safe: true };
}

// Rate limiting map (in-memory, resets on server restart)
const rateLimitMap = new Map();

// API Routes
app.get('/api/messages', async (req, res) => {
  try {
    if (useInMemory) {
      // Use in-memory storage
      const messages = inMemoryMessages
        .sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp))
        .slice(0, 100);
      return res.json(messages);
    }
    
    const messages = await Message.find()
      .sort({ timestamp: -1 })
      .limit(100)
      .select('-__v -ipHash');
    res.json(messages);
  } catch (error) {
    console.error('Error fetching messages:', error);
    res.status(500).json({ error: 'Failed to fetch messages' });
  }
});

app.post('/api/messages', async (req, res) => {
  try {
    const { text, emoji } = req.body;
    const clientIp = req.ip || req.connection.remoteAddress;

    // Rate limiting (5 seconds between posts)
    const lastPost = rateLimitMap.get(clientIp);
    if (lastPost && Date.now() - lastPost < 5000) {
      return res.status(429).json({ error: 'Please wait before posting again.' });
    }

    // Moderate content
    const moderation = moderateContent(text);
    if (!moderation.safe) {
      return res.status(400).json({ error: moderation.message });
    }

    if (useInMemory) {
      // Use in-memory storage
      const newMessage = {
        _id: Date.now().toString(),
        text: text.trim(),
        emoji: emoji || '💭',
        timestamp: new Date(),
        ipHash: clientIp
      };
      
      inMemoryMessages.push(newMessage);
      
      // Keep only last 100 messages
      if (inMemoryMessages.length > 100) {
        inMemoryMessages = inMemoryMessages.slice(-100);
      }
      
      rateLimitMap.set(clientIp, Date.now());

      const responseData = {
        _id: newMessage._id,
        text: newMessage.text,
        emoji: newMessage.emoji,
        timestamp: newMessage.timestamp
      };

      // Broadcast to all connected clients
      const broadcast = req.app.get('broadcastNewMessage');
      if (broadcast) {
        broadcast(responseData);
      }
      
      return res.status(201).json(responseData);
    }

    // Create and save message to MongoDB
    const message = new Message({
      text: text.trim(),
      emoji: emoji || '💭',
      ipHash: clientIp // In production, hash this for privacy
    });

    await message.save();
    rateLimitMap.set(clientIp, Date.now());

    // Clean up old rate limit entries (keep last hour)
    if (rateLimitMap.size > 1000) {
      const oneHourAgo = Date.now() - 3600000;
      for (const [ip, time] of rateLimitMap.entries()) {
        if (time < oneHourAgo) rateLimitMap.delete(ip);
      }
    }

    const responseData = {
      _id: message._id,
      text: message.text,
      emoji: message.emoji,
      timestamp: message.timestamp
    };

    // Broadcast to all connected clients
    const broadcast = req.app.get('broadcastNewMessage');
    if (broadcast) {
      broadcast(responseData);
    }

    res.status(201).json(responseData);
  } catch (error) {
    console.error('Error saving message:', error);
    if (error.name === 'ValidationError') {
      res.status(400).json({ error: 'Invalid message data' });
    } else {
      res.status(500).json({ error: 'Failed to save message' });
    }
  }
});

// Health check
app.get('/api/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date() });
});

// WebSocket connection for real-time updates
io.on('connection', (socket) => {
  console.log('👤 User connected:', socket.id);

  socket.on('disconnect', () => {
    console.log('👋 User disconnected:', socket.id);
  });
});

// Broadcast new message to all connected clients
function broadcastNewMessage(message) {
  io.emit('newMessage', message);
}

// Export for use in routes
app.set('broadcastNewMessage', broadcastNewMessage);

server.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log('⚡ WebSocket enabled for real-time updates');
});
