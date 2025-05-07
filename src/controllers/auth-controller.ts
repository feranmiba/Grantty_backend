import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import db from "./../utils/db";
import bcrypt from "bcrypt";
import NodeCache from "node-cache";
import jwt from "jsonwebtoken";
import { generateRandomCode } from "./../utils/jwt-service";

dotenv.config();

const saltRounds = 12;
const cache = new NodeCache({ stdTTL: 300 });

interface CachedUserData {
  email: string;
  password: string;
  code: string;
  type: 'resetpassword';
}

export const login = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, password } = req.body;
  
    try {
      const usermailExist = await db.query(
        "SELECT * FROM user_credential WHERE email = $1",
        [email]
      );
  
      if (usermailExist.rows.length === 0) {
        res.status(404).json({ message: "User not found." });
        return;
      }
  
      const user = usermailExist.rows[0];
      const isPasswordValid = await bcrypt.compare(password, user.password);
  
      if (!isPasswordValid) {
        res.status(400).json({ message: "Incorrect password. Try again." });
        return;
      }
  
      // const creatorProfile = await db.query(
      //   "SELECT * FROM creatorprofile WHERE user_id = $1",
      //   [user.id]
      // );
      // const attendeeProfile = await db.query(
      //   "SELECT * FROM userprofiles WHERE user_id = $1",
      //   [user.id]
      // );
  
      // const profile = creatorProfile.rows[0] || attendeeProfile.rows[0];
  
      // if (!profile) {
      //   res.status(404).json({ message: "User profile not found." });
      //   return;
      // }
  
      const accessToken = jwt.sign(
        { email },                       // ✅ Correct: Payload is an object
        process.env.JWT_SECRET as string,
        { expiresIn: "20m" }             // Valid expiration format
      );
      
      res.status(200).json({
        // userID: profile.user_id,
        // profile,
        accessToken
      });
  
    } catch (error) {
      console.error("Login error:", error);
      res.status(500).json({ message: "Server error. Please try again later." });
    }
  };
  
  export const SignUp = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const { email, fullname, password } = req.body;
  
    try {
      // Check if user already exists
      const existingUser = await db.query(
        "SELECT * FROM user_credential WHERE email = $1",
        [email]
      );
  
      if (existingUser.rows.length > 0) {
        res.status(400).json({ message: "User already exists." });
        return;
      }
  
      // Hash password and insert new user
      const hashedPassword = await bcrypt.hash(password, saltRounds);
      const result = await db.query(
        `INSERT INTO user_credential (email, password, fullname) 
         VALUES ($1, $2, $3) RETURNING id, email, fullname`,
        [email, hashedPassword, fullname]
      );


      const accessToken = jwt.sign(
        { email },                       // ✅ Correct: Payload is an object
        process.env.JWT_SECRET as string,
        { expiresIn: "20m" }             // Valid expiration format
      );
      
  
      cache.del(email);
      res.status(201).json({
        message: "User created successfully.",
        accessToken: accessToken,
        user: result.rows[0]
      });
  
    } catch (error) {
      console.error("SignUp error:", error);
      res.status(500).json({ error: 'Server error, please try again' });
    }
  };
  

// ✅ VERIFY CODE — only for reset password
export const verifyCode = async (req: Request, res: Response): Promise<Response> => {
  const { email, code } = req.body;
  const cachedDetails = cache.get<CachedUserData>(email);

  if (!cachedDetails || cachedDetails.code !== code) {
    return res.status(400).json({ message: 'Invalid email or code' });
  }

  try {
    if (cachedDetails.type === 'resetpassword') {
      const result = await db.query(
        "UPDATE user_credential SET password = $1 WHERE email = $2 RETURNING id",
        [cachedDetails.password, email]
      );

      if (result.rowCount === 0) {
        return res.status(404).json({ message: "User not found" });
      }

      cache.del(email);
      return res.status(200).json({ message: "Password successfully updated." });
    }

    return res.status(400).json({ message: "Invalid operation for this route." });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error, please try again' });
  }
};

// ✅ RESET PASSWORD — caches password + code for verification
export const resetPassword = async (req: Request, res: Response): Promise<Response> => {
  const { email, newPassword } = req.body;

  if (!email || !newPassword) {
    return res.status(400).json({ message: "Email and new password are required." });
  }

  try {
    const result = await db.query("SELECT * FROM user_credential WHERE email = $1", [email]);

    if (result.rowCount === 0) {
      return res.status(404).json({ message: "User not found" });
    }

    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);
    const code = generateRandomCode();

    // Code and hashed password stored temporarily
    cache.set(email, { password: hashedPassword, code, type: 'resetpassword' });

    return res.status(200).json({ message: "Verification code generated and cached." });

  } catch (error) {
    console.error("Error resetting password:", error);
    return res.status(500).json({ message: "An error occurred while resetting the password" });
  }
};
