import { Router } from 'express';
import { initializePaymentController, verifyPaymentController, getAmountRaised } from '../controllers/payment-cotroller';

const router = Router();

router.post('/paystack/initialize', initializePaymentController);
router.get('/paystack/verify/:reference', verifyPaymentController);
router.get('/amount-raised/:startup_id', getAmountRaised);

export default router;
