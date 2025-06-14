# 🚀 System Management Application

A comprehensive system management application built with Node.js, Express, and MongoDB, featuring AI-powered automation and intelligent business workflows.

## Quick Setup

1. **Clone & Install:**
```bash
git clone https://github.com/farahmahfouz/order_management_system
cd system-management
npm install
```

2. **Environment Configuration:**
```env
# Server
PORT=3000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/system_management

# Authentication
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d

# Email
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email

# AI & Google Services
OPENROUTER_API_KEY=your_openrouter_api_key
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

3. **Run Application:**
```bash
npm start        # Development
npm run start:prod  # Production
```

## 📖 API Documentation

**[Postman Collection](https://documenter.getpostman.com/view/37612905/2sB2x3nYY7)**

Covers: Authentication, Users, Items, Orders, Reports, Advanced Querying

## 🤖 AI Integration Features

### Smart Promotional Messaging
- **Auto-generates 3 promotional messages** (1 SMS + 2 social posts) for new Food items ≥ 200 EGP
- Uses **OpenRouter Gen AI API** for creative content

### AI-Triggered Admin Alerts
- New expensive food items (≥200 EGP)
- High-performing items (500+ sales in 10 days)

## ⏰ Automated Business Operations

**Hourly cron jobs handle:**

### 📅 Expiry Management
- **Today's expiry alerts** + **5-day warnings**
- Email notifications to admins/managers
- **Google Calendar integration** for expiry reminders

### 💰 Smart Pricing
- **Auto 25% discount** for items expiring within 20 days
- Prevents duplicate applications
- Admin notification reports

### 🛒 Order Management
- **Auto-expire pending orders** after 4 hours
- Status tracking and analytics

### 📊 Daily Reports
- **Automated CSV generation** of daily orders
- **Google Drive upload** integration
- Email distribution to stakeholders

## 🔗 Google Services Integration

- **📧 Gmail**: Email automation via Nodemailer
- **📅 Calendar**: Expiry reminder events
- **💾 Drive**: Automated report storage

## Database Schema

**MongoDB Collections:**
- **Users**: Authentication, profiles, roles
- **Items**: Product catalog with expiry tracking
- **Orders**: Order management and analytics

## Security Features

- Password hashing (bcrypt)
- JWT authentication
- Rate limiting & CORS
- Input validation
- NoSQL injection protection

## Key Dependencies

**Core:** express, mongoose, bcryptjs, jsonwebtoken  
**Automation:** node-cron, dayjs, nodemailer  
**AI/Services:** openrouter, googleapis, sendgrid  
**Security:** helmet, express-rate-limit, cors

## File Structure

```
system-management/
├── config/             # Configuration
├── controllers/        # Route controllers
├── models/            # Mongoose schemas
├── utils/             # Utilities (email, CSV, cronJobs)
├── routes/            # API routes
├── middlewares/       # Custom middlewares
└── app.js            # Entry point
```

## Troubleshooting

**MongoDB Issues:**
- Check connection string and network access
- Verify Atlas credentials and IP whitelist

**Cron Jobs:**
- Check server timezone and logs
- Verify SendGrid API configuration

**Google Services:**
- Confirm OAuth credentials and API permissions

## Contributing

1. Fork repository
2. Create feature branch
3. Commit changes
4. Open Pull Request

## License

ISC License

---

**Built with ❤️ by [Farah Mahfouz](https://github.com/farahmahfouz)**