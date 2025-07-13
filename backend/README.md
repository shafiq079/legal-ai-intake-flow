# Legal Intake SaaS Backend API

A comprehensive Node.js/Express backend for AI-powered legal client intake management.

## 🚀 Quick Start

1. **Install Dependencies**
```bash
cd backend
npm install
```

2. **Environment Setup**
```bash
cp .env.example .env
# Edit .env with your configuration
```

3. **Start Development Server**
```bash
npm run dev
```

4. **Seed Sample Data** (Optional)
```bash
npm run seed
```

## 📚 API Documentation

### Base URL
- Development: `http://localhost:5000/api`
- Health Check: `GET /api/health`

### Authentication Endpoints
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout
- `POST /api/auth/refresh-token` - Refresh JWT token
- `POST /api/auth/forgot-password` - Forgot password
- `POST /api/auth/reset-password` - Reset password
- `GET /api/auth/verify-token` - Verify JWT token
- `GET /api/auth/profile` - Get user profile
- `PUT /api/auth/profile` - Update user profile

### Client Management
- `GET /api/clients` - Get all clients (with filtering)
- `POST /api/clients` - Create new client
- `GET /api/clients/:id` - Get client by ID
- `PUT /api/clients/:id` - Update client
- `DELETE /api/clients/:id` - Delete client

### AI Processing
- `POST /api/ai/intake-chat` - Process intake conversation
- `POST /api/ai/document-analysis` - Analyze documents
- `POST /api/ai/extract-data` - Extract structured data

## 🛠️ Technology Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB + Mongoose
- **Authentication**: JWT
- **File Upload**: Cloudinary (for documents)
- **Voice Transcription**: Client-side (Web Speech API)
- **AI Integration**: Google Gemini API
- **Validation**: Joi
- **Security**: Helmet, CORS, bcryptjs

## 🔐 Security Features

- JWT authentication with refresh tokens
- Role-based access control
- Input validation and sanitization
- Rate limiting
- File upload security
- Password hashing with bcrypt
- CORS protection

## 📊 Database Models

- **User**: Authentication and user management
- **Client**: Comprehensive client intake data
- **Case**: Legal case management
- **Document**: File and document handling
- **Intake**: AI conversation tracking

## 🚀 Deployment

1. Set production environment variables
2. Deploy to your preferred platform (Railway, Render, etc.)
3. Configure MongoDB Atlas connection
4. Set up Cloudinary for file storage
5. Configure OpenAI API key

## 📝 Environment Variables

See `.env.example` for all required configuration options.

## 🧪 Testing

The API includes comprehensive error handling and validation. Test with tools like Postman or curl.

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request