import { Request, Response, NextFunction } from 'express';
import dotenv from "dotenv";
import db from "./../utils/db";
import path from "path";

dotenv.config();

const BASE_URL = process.env.BASE_URL || "http://localhost:3000";

const convertFilePathToUrl = (filePath: string | null): string | null => {
  if (!filePath) return null;
  const filename = path.basename(filePath);  // Extract the filename from the path
  return `${BASE_URL}/uploads/${filename}`;  // Return the full URL
};


export const Create_Startup = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    const {
      startup_name,
      startup_description,
      startup_location,
      startup_website,
      startup_email,
      team_size,
      no_of_teams,
      cofounder,
      linkedin_profile,
      nin,
      amount_of_funds,
      usage_of_funds,
      no_of_customers,
      video,
      startup_industry,
      full_name,
      founder_linkedin_profile,
      email_address,
      phone_no,
      founder_nin,
      role,
      user_id
    } = req.body;
  
    const files = req.files as { [fieldname: string]: Express.Multer.File[] };
  
    const startupPicture = files?.['startup_picture']?.[0]?.path || null;
    const profileImage = files?.['profile_image']?.[0]?.path || null;
  
    try {
      const existingFounder = await db.query(
        `SELECT * FROM founders WHERE email_address = $1`,
        [email_address]
      );
      if (existingFounder.rows.length > 0) {
        res.status(400).json({ message: 'Founder email address already exists.' });
        return;
      }
  
      const existingStartup = await db.query(
        `SELECT * FROM startups WHERE startup_email = $1`,
        [startup_email]
      );
      if (existingStartup.rows.length > 0) {
        res.status(400).json({ message: 'Startup email address already exists.' });
        return;
      }
  
      const founderQuery = `
        INSERT INTO founders (full_name, linkedin_profile, email_address, phone_no, profile_img, nin, role, user_id)
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
        RETURNING *
      `;
      const founderValues = [
        full_name,
        founder_linkedin_profile,
        email_address,
        phone_no,
        profileImage,
        founder_nin,
        role,
        user_id
      ];
      const founderResult = await db.query(founderQuery, founderValues);
      const founder = founderResult.rows[0];
      const founder_id = founder.founder_id;
  
      const startupQuery = `
        INSERT INTO startups (
          startup_name, startup_description, startup_location, startup_website, startup_email, 
          startup_picture, team_size, no_of_teams, cofounder, profile_image, 
          linkedin_profile, nin, amount_of_funds, usage_of_funds, no_of_customers, 
          video, startup_industry, founder_id
        )
        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18)
        RETURNING *
      `;
      const startupValues = [
        startup_name,
        startup_description,
        startup_location,
        startup_website,
        startup_email,
        startupPicture,
        team_size,
        no_of_teams,
        cofounder,
        profileImage,
        linkedin_profile,
        nin,
        amount_of_funds,
        usage_of_funds,
        no_of_customers,
        video,
        startup_industry,
        founder_id
      ];
      const startupResult = await db.query(startupQuery, startupValues);
      const startup = startupResult.rows[0];
  
      res.status(201).json({
        message: "Startup and founder created successfully",
        data: {
          startup: {
            ...startup,
            startup_picture: convertFilePathToUrl(startup.startup_picture),
            profile_image: convertFilePathToUrl(startup.profile_image),
          },
          founder: {
            ...founder,
            profile_img: convertFilePathToUrl(founder.profile_img),
          }
        }
      });
  
    } catch (error) {
      console.error("Error creating startup and founder:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
export const Get_All_Startups = async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<void> => {
    try {
      const startupQuery = `
        SELECT 
          s.*, 
          f.full_name AS founder_full_name, f.linkedin_profile AS founder_linkedin_profile,
          f.email_address AS founder_email, f.phone_no AS founder_phone_no, f.profile_img AS founder_profile_img,
          f.nin AS founder_nin, f.role AS founder_role
        FROM startups s
        LEFT JOIN founders f ON s.founder_id = f.founder_id
      `;
      const startupResult = await db.query(startupQuery);
  
      if (startupResult.rows.length === 0) {
        res.status(404).json({ message: "No startups found" });
        return;
      }
  
      const formattedData = startupResult.rows.map((row: any) => ({
        ...row,
        startup_picture: convertFilePathToUrl(row.startup_picture),
        profile_image: convertFilePathToUrl(row.profile_image),
        founder_profile_img: convertFilePathToUrl(row.founder_profile_img),
      }));
  
      res.status(200).json({
        message: "Startups and founders retrieved successfully",
        data: formattedData
      });
    } catch (error) {
      console.error("Error retrieving all startups and founders:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  export const Get_Startup_By_Id = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { id } = req.params;
  
    try {
      const query = `
        SELECT 
          s.*, 
          f.full_name AS founder_full_name, 
          f.linkedin_profile AS founder_linkedin_profile,
          f.email_address AS founder_email, 
          f.phone_no AS founder_phone_no, 
          f.profile_img AS founder_profile_img,
          f.nin AS founder_nin, 
          f.role AS founder_role 
        FROM startups s
        LEFT JOIN founders f ON s.founder_id = f.founder_id
        WHERE s.startup_id = $1
      `;
      const result = await db.query(query, [id]);
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: "Startup not found" });
        return;
      }
  
      const row = result.rows[0];
      row.startup_picture = convertFilePathToUrl(row.startup_picture);
      row.profile_image = convertFilePathToUrl(row.profile_image);
      row.founder_profile_img = convertFilePathToUrl(row.founder_profile_img);
  
      res.status(200).json({
        message: "Startup retrieved successfully",
        data: row
      });
    } catch (error) {
      console.error("Error fetching startup by ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };
  
  export const Get_Startups_By_User_Id = async (
    req: Request,
    res: Response
  ): Promise<void> => {
    const { userId } = req.params;
  
    try {
      const query = `
        SELECT 
          s.*, 
          f.full_name AS founder_full_name, 
          f.linkedin_profile AS founder_linkedin_profile,
          f.email_address AS founder_email, 
          f.phone_no AS founder_phone_no, 
          f.profile_img AS founder_profile_img,
          f.nin AS founder_nin, 
          f.role AS founder_role 
        FROM startups s
        LEFT JOIN founders f ON s.founder_id = f.founder_id
        WHERE f.user_id = $1
      `;
      const result = await db.query(query, [userId]);
  
      if (result.rows.length === 0) {
        res.status(404).json({ message: "No startups found for this user" });
        return;
      }
  
      const formattedData = result.rows.map((row: any) => ({
        ...row,
        startup_picture: convertFilePathToUrl(row.startup_picture),
        profile_image: convertFilePathToUrl(row.profile_image),
        founder_profile_img: convertFilePathToUrl(row.founder_profile_img),
      }));
  
      res.status(200).json({
        message: "Startups retrieved successfully",
        data: formattedData
      });
    } catch (error) {
      console.error("Error fetching startups by user ID:", error);
      res.status(500).json({ message: "Internal server error" });
    }
  };