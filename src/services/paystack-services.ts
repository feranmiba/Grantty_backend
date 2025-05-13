import dotenv from 'dotenv';
import paystack from 'paystack';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;

// Initialize Paystack with your secret key
const paystackClient = paystack(PAYSTACK_SECRET_KEY);

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

// Generate a unique transaction reference
const generateReference = () => `ref_${Math.random().toString(36).substr(2, 9)}`;

// Function to initialize payment
export const initializePayment = async (email: string, amount: number, full_name: string, callback_url: string): Promise<string> => {
  try {
    const response = await paystackClient.transaction.initialize({
      email,
      amount: amount * 100, // Convert to kobo
      reference: generateReference(), // Unique reference
      name : full_name, // Customer name
      callback_url: callback_url, // Callback URL
    });

    // Check if the response was successful and contains the authorization URL
    if (response.body.status && response.body.data.authorization_url) {
      return response.body.data.authorization_url;
    } else {
      throw new Error('Payment initialization failed. No callback URL received.');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment initialization failed');
  }
};


// Function to verify payment
export const verifyPayment = async (reference: string) => {
  try {
    const response = await paystackClient.transaction.verify(reference);

    if (response.body.status) {
      return response.body.data;
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error: any) {
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};
