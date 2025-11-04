import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import mpesaRouter from './mpesa.js'; // Import your M-Pesa routes

// Initialize environment variables
dotenv.config();

// Create Express application
const app = express();

// Set the port (use environment variable or default to 3000)
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: 'http://localhost:5173', // Your frontend URL
  methods: ['GET', 'POST'],
  allowedHeaders: ['Content-Type']
})); // Enable CORS for all routes
app.use(express.json()); // Parse JSON request bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded request bodies

// Routes
app.use('/api/mpesa', mpesaRouter); // Mount M-Pesa routes at /api/mpesa

// Basic health check route
app.get('/', (req, res) => {
  res.status(200).json({
    status: 'success',
    message: 'M-Pesa Daraja API Integration Service',
    timestamp: new Date().toISOString()
  });
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({
    status: 'error',
    message: 'Endpoint not found'
  });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    status: 'error',
    message: 'Internal server error'
  });
});

// Start the server
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  console.log(`M-Pesa routes available at http://localhost:${PORT}/api/mpesa`);
  console.log("lazima daraja api ijipe")
});
