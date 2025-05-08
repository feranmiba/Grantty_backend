import { Request, Response, NextFunction } from "express";
import dotenv from "dotenv";
import db from "./../utils/db";
dotenv.config();

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
        picture,
        team_size,
        no_of_teams,
        cofounder,
        profile_image,
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
        founder_profile_img,
        founder_nin,
        role,
        user_id
    } = req.body;

    try {
        // Insert founder information
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
            founder_profile_img,
            founder_nin,
            role, 
            user_id
        ];
        const founderResult = await db.query(founderQuery, founderValues);
        const founder = founderResult.rows[0];
        const founder_id = founder.founder_id;

        // Insert startup information with founder_id and startup_industry
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
            picture,
            team_size,
            no_of_teams,
            cofounder,
            profile_image,
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
                startup,
                founder
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
        // Query to fetch all startups with their associated founders
        const startupQuery = `
            SELECT 
                s.startup_id, s.startup_name, s.startup_description, s.startup_location, s.startup_website, 
                s.startup_email, s.startup_picture, s.team_size, s.no_of_teams, s.cofounder, s.profile_image,
                s.linkedin_profile, s.nin, s.amount_of_funds, s.usage_of_funds, s.no_of_customers, 
                s.video, s.startup_industry, f.full_name AS founder_full_name, f.linkedin_profile AS founder_linkedin_profile,
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

        res.status(200).json({
            message: "Startups and founders retrieved successfully",
            data: startupResult.rows
        });
    } catch (error) {
        console.error("Error retrieving all startups and founders:", error);
        res.status(500).json({ message: "Internal server error" });
    }
};
