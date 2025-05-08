import express from 'express';
import path from 'path';
import authRoute from './routes/auth-route';
import startupRoute from './routes/startup-route';
import paymentRoute from './routes/payment-routes';
import dotenv from "dotenv";
import cors from 'cors';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploads folder statically
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// Root route
app.get('/', (_req, res) => {
  res.send('Hello from TypeScript + Express! This is Grantty backend');
});

// Auth routes
app.use("/auth", authRoute);
// Startup routes
app.use("/startup", startupRoute);
// Payment routes
app.use("/payment", paymentRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
