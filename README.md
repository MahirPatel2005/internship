# 🌙 Safe Venting Space

A safe, anonymous forum-style web application where users can share their thoughts and feelings in a judgment-free environment.

## Features

✅ **Core Requirements**
- Anonymous message submission (no login required)
- Live feed of all submitted messages
- Real-time updates across all users

✅ **Enhanced Features**
- Comprehensive content moderation (self-harm, abuse, spam detection)
- Emoji mood selection (8 options)
- Timestamps with relative time display
- Smooth animations and transitions
- Submission confirmations
- Rate limiting (5 seconds between posts)
- Accessible design (ARIA labels, keyboard navigation)
- Responsive layout (mobile/tablet/desktop)
- Auto-refresh feed every 30 seconds

## Tech Stack

- **Frontend**: HTML5, CSS3, Vanilla JavaScript
- **Backend**: Node.js + Express
- **Database**: MongoDB (with Mongoose ODM)
- **Deployment Ready**: Heroku, Vercel, Railway compatible

## Setup Instructions

### Prerequisites
- Node.js (v14 or higher)
- MongoDB (local or MongoDB Atlas)

### Local Development

1. **Install dependencies**
   ```bash
   npm install
   ```

2. **Set up environment variables**
   ```bash
   copy .env.example .env
   ```
   
   Edit `.env` and add your MongoDB connection string:
   ```
   MONGODB_URI=mongodb://localhost:27017/ventspace
   ```

3. **Start MongoDB** (if using local MongoDB)
   ```bash
   mongod
   ```

4. **Run the server**
   ```bash
   npm start
   ```
   
   Or for development with auto-reload:
   ```bash
   npm run dev
   ```

5. **Open in browser**
   ```
   http://localhost:3000
   ```

## MongoDB Atlas Setup (Free Cloud Database)

1. Go to [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a free account and cluster
3. Click "Connect" → "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your database password
6. Add to your `.env` file:
   ```
   MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/ventspace?retryWrites=true&w=majority
   ```

## Deployment

### Deploy to Heroku

1. Install Heroku CLI
2. Login and create app:
   ```bash
   heroku login
   heroku create your-app-name
   ```

3. Set environment variables:
   ```bash
   heroku config:set MONGODB_URI=your_mongodb_atlas_uri
   ```


## API Endpoints

- `GET /api/messages` - Fetch all messages (last 100)
- `POST /api/messages` - Submit a new message
- `GET /api/health` - Health check

## Content Moderation

The app includes comprehensive moderation for:
- Self-harm and suicide-related content (with crisis resources)
- Abusive and threatening language
- Discriminatory content
- Spam (URLs, emails, repeated characters)
- Excessive caps lock

## Project Structure

```
├── server.js           # Express server & API routes
├── package.json        # Dependencies
├── .env.example        # Environment variables template
├── public/
│   └── index.html      # Frontend application
└── README.md           # This file
```

## Security Features

- XSS protection (HTML escaping)
- Rate limiting (5 seconds between posts)
- Input validation
- Content moderation
- IP-based rate limiting
- Maximum message length (1000 chars)
- Database query limits

## Browser Support

- Chrome/Edge (latest)
- Firefox (latest)
- Safari (latest)
- Mobile browsers

## License

MIT

## Support Resources

If you're experiencing thoughts of self-harm:
- National Suicide Prevention Lifeline: **988**
- Crisis Text Line: Text **HOME** to **741741**
- International: [IASP Crisis Centres](https://www.iasp.info/resources/Crisis_Centres/)
