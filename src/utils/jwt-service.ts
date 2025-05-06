import jwt from "jsonwebtoken";
import dotenv from "dotenv";

dotenv.config();

// Function to generate a random 5-digit code
export const generateRandomCode = (): string => {
  return Math.floor(10000 + Math.random() * 90000).toString();
};

// Function to generate an access token
interface JwtPayload {
  email: string;
  // You can add more properties if needed, for example:
  // userId: string;
}

export const generateAccessToken = (details: JwtPayload): string => {
  return jwt.sign(details, process.env.JWT_SECRET as string, { expiresIn: "20m" });
};
