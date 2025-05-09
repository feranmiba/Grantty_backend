import axios from 'axios';
import dotenv from 'dotenv';

const PAYSTACK_SECRET_KEY = process.env.PAYSTACK_SECRET_KEY;
const PAYSTACK_BASE_URL = 'https://api.paystack.co';


dotenv.config();


interface PaystackResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}
export const initializePayment = async (email: string, amount: number): Promise<string> => {
  try {
    const response = await axios.post<PaystackResponse>(
      `${PAYSTACK_BASE_URL}/transaction/initialize`,
      { email, amount: amount * 100 },
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
    throw new Error(error.response?.data?.message || 'Payment initialization failed');
  }
};


export const verifyPayment = async (reference: string) => {
  try {
    const response = await axios.get(
      `${PAYSTACK_BASE_URL}/transaction/verify/${reference}`,
      {
        headers: {
          Authorization: `Bearer ${PAYSTACK_SECRET_KEY}`,
        },
      }
    );
    return response.data;
  } catch (error) {
    // throw new Error(error.response?.data?.message || 'Payment verification failed');
  }
};
