import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY!;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';

// Generate a unique transaction reference
const generateReference = () => `ref_${Math.random().toString(36).slice(2, 11)}`;

interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

// Initialize Payment
export const initializePayment = async (
  email: string,
  amount: number,
  full_name: string,
  callback_url: string
): Promise<string> => {
  try {
    const response = await axios.post<PaystackResponse>(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      {
        email,
        amount: amount * 100, // Convert to kobo
        reference: generateReference(), // Unique reference
        callback_url, // Callback URL
        name: full_name, // Customer name
      },
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
          'Content-Type': 'application/json',
        },
      }
    );

    // Check if the response was successful and contains the authorization URL
    if (response.data.status && response.data.data.authorization_url) {
      return response.data.data.authorization_url;
    } else {
      throw new Error('Payment initialization failed. No callback URL received.');
    }
  } catch (error: any) {
    console.error('Initialization Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Payment initialization failed');
  }
};

// Verify Payment
export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get<PaystackResponse>(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );

    // Check if the verification was successful
    if (response.data.status) {
      return response.data.data;
    } else {
      throw new Error('Payment verification failed');
    }
  } catch (error: any) {
    console.error('Verification Error:', error.response?.data || error.message);
    throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};
