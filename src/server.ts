import express from 'express';
import authRoute from './routes/auth-route';
import dotenv from "dotenv";
import cors from 'cors'

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware to parse JSON bodies
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Root route
app.get('/', (_req, res) => {
  res.send('Hello from TypeScript + Express!, This is grantty backend');
});

// Auth routes
app.use("/auth", authRoute);

// Start server
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});
