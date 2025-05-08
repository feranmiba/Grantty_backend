import { Router } from 'express';
import { initializePaymentController, verifyPaymentController } from '../controllers/payment-cotroller';

const router = Router();

router.post('/paystack/initialize', initializePaymentController);
router.get('/paystack/verify/:reference', verifyPaymentController);

export default router;
