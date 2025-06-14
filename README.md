# System Management Application

A comprehensive system management application built with Node.js, Express, and MongoDB.

## Prerequisites

Before you begin, ensure you have the following installed:
- Node.js (v14 or higher)
- MongoDB (v4.4 or higher)
- npm (Node Package Manager)

## Environment Setup

1. Clone the repository:
```bash
git clone https://github.com/farahmahfouz/order_management_system
cd system-management
```

2. Install dependencies:
```bash
npm install
```

3. Create a `.env` file in the root directory with the following variables:
```env
# Server Configuration
PORT=3000
NODE_ENV=development

# Database Configuration
# MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/system_management

# JWT Configuration
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRES_IN=90d

# Email Configuration (SendGrid)
SENDGRID_API_KEY=your_sendgrid_api_key
EMAIL_FROM=your_verified_sender_email
```

## Running the Application

### Development Mode
```bash
npm start
```

### Production Mode
```bash
npm run start:prod
```

### Running Tests
```bash
npm test
```

## API Documentation

For detailed documentation of the available API endpoints, refer to the following:

[API Documentation: Postman Collection](https://documenter.getpostman.com/view/37612905/2sB2x3nYY7)

This documentation covers:
- Authentication (login, signup, password reset)
- User profile management
- Items management
- Orders management
- Reports management
- Advanced data querying (filtering, sorting, pagination)

## Database Schema

The application uses MongoDB with Mongoose ODM. Key collections include:
- **Users**: User authentication and profile data
- **Items**: Product/service catalog
- **Orders**: Order management and tracking

Mongoose automatically handles:
- Schema validation
- Data type conversion
- Relationship management
- Index creation

## Security Features

- Password hashing using bcrypt
- JWT authentication
- Rate limiting
- CORS protection
- Helmet security headers
- Input validation
- NoSQL injection protection
- MongoDB connection security

## File Structure

```
system-management/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middlewares/        # Custom middlewares
├── models/            # Mongoose models
├── routes/            # API routes
├── utils/             # Utility functions
├── tests/             # Test files
├── services/           # Business logic
├── app.js            # Application entry point
└── package.json      # Project dependencies
```

## Key Dependencies

- **express**: Web framework
- **mongoose**: MongoDB ODM
- **bcryptjs**: Password hashing
- **jsonwebtoken**: JWT authentication
- **express-rate-limit**: Rate limiting
- **helmet**: Security headers
- **cors**: Cross-origin resource sharing
- **dotenv**: Environment variables

## 🤖 AI Integration

This system integrates **Generative AI (Gen AI)** to automate marketing content creation and administrative notifications.

### ✨ Smart Promotional Messaging

* When a **new "Food" item** is added to the system with a price of **200 EGP or more**, the system:

  * Automatically generates **3 promotional messages** (1 SMS and 2 social media posts)
  * Uses **Gen AI API** to craft creative and engaging content tailored to the product

### 📩 AI-Triggered Admin Alerts

* Admins are notified via email in the following cases:

  * A **new "Food" item** is added with a price ≥ 200 EGP
  * An item achieves **500+ sales within 10 days**

These AI-powered features ensure:

* Faster and more engaging marketing communication
* Real-time monitoring of high-performing products
* Less manual work for admins and marketing teams

### Technologies Used:

* **OpenRouter API** for generating messages
* **Nodemailer** for sending email notifications
* **Mongoose** middleware & scheduled logic for tracking item sales

## MongoDB Best Practices Implemented

- Connection pooling
- Proper error handling
- Schema validation
- Index optimization
- Aggregation pipelines for complex queries
- Mongoose middleware for data processing

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## Troubleshooting

### Common MongoDB Issues:

1. **Connection Issues:**
   - Ensure MongoDB is running
   - Check connection string in `.env`
   - Verify network connectivity for Atlas

2. **Authentication Errors:**
   - Verify username/password for Atlas
   - Check IP whitelist settings

3. **Performance Issues:**
   - Monitor database indexes
   - Use MongoDB Compass for query optimization

## License

This project is licensed under the ISC License.
