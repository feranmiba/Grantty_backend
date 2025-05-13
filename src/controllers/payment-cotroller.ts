import { Request, Response, NextFunction } from 'express';
import { initializePayment, verifyPayment } from '../services/paystack-services';
import db from '../utils/db';

export const initializePaymentController = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const { email, amount, full_name, callback_url } = req.body;

    if (!email || !amount) {
      res.status(400).json({ message: 'Email and amount are required' });
      return; // Exit the function if validation fails
    }

    const result = await initializePayment(email, amount, full_name, callback_url);
    res.status(200).json({
      message: 'Payment initialized successfully',
      data: result,
    });
  } catch (error: any) {
    console.error('Payment Initialization Error:', error.message);
    res.status(500).json({ message: error.message || 'Payment initialization failed' });
  }
};

export const verifyPaymentController = async (  req: Request,
    res: Response,
    next: NextFunction ): Promise<void> =>  {
  try {
    const { reference } = req.params;

    if (!reference) {
      res.status(400).json({ message: 'Reference is required' });
    }

    const result = await verifyPayment(reference);
    res.status(200).json({
      message: 'Payment verified successfully',
      data: result,
    });

      const saveQuery = `
        INSERT INTO payments (startup_name, email, amount)
        VALUES ($1, $2, $3) RETURNING *`;
  } catch (error: any) {
    res.status(500).json({ message: error.message });
  }
};




export const getAmountRaised = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  const { startup_id } = req.params; // Get the startup_id from the request parameters

  try {
    // Query to get the sum of amounts raised for a specific startup_id
    const getAmounts = await db.query(
      'SELECT SUM(amount) AS total_amount_raised FROM payments WHERE startup_id = $1',
      [startup_id]
    );

    // Check if the result is empty
    if (getAmounts.rows.length === 0) {
       res.status(404).json({ message: 'No amounts found for the given startup_id' });
    }

    // Retrieve the total amount raised from the result
    const totalAmountRaised = getAmounts.rows[0].total_amount_raised || 0;

    // Respond with the total amount raised
    res.json({ startup_id, total_amount_raised: totalAmountRaised });

  } catch (error) {
    console.error('Error fetching raised amount:', error);
    next(error); // Pass the error to the next middleware (e.g., error handler)
  }
};

