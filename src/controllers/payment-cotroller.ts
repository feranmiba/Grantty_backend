import { Request, Response, NextFunction } from 'express';
import { initializePayment, verifyPayment } from '../services/paystack-services';

export const initializePaymentController = async (  req: Request,
    res: Response,
    next: NextFunction ): Promise<void>  => {
  try {
    const { email, amount } = req.body;

    if (!email || !amount) {
      res.status(400).json({ message: 'Email and amount are required' });
    }

    const result = await initializePayment(email, amount);
    res.status(200).json({
      message: 'Payment initialized successfully',
      data: result,
    });
  } catch (error: any) {
    res.status(500).json({ message: error.message });
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
