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
        role
    } = req.body;

    try {
        // Insert founder information
        const founderQuery = `
            INSERT INTO founders (full_name, linkedin_profile, email_address, phone_no, profile_img, nin, role)
            VALUES ($1, $2, $3, $4, $5, $6, $7)
            RETURNING *
        `;
        const founderValues = [
            full_name,
            founder_linkedin_profile,
            email_address,
            phone_no,
            founder_profile_img,
            founder_nin,
            role
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
