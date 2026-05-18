
const express = require('express');
const router = express.Router();
const { verifyWebhookSignature } = require('../config/payStack.config');

router.post(
  '/paystack',
  express.raw({ type: 'application/json' }),
  async (req, res) => {
    // Respond immediately — Paystack retries if no fast response
    res.status(200).json({ received: true });

    const signature = req.headers['x-paystack-signature'];
    const rawBody = req.body; // Buffer (express.raw keeps it intact)

    try {
      // Step 1: Verify HMAC-SHA512 signature
      if (!signature || !verifyWebhookSignature(rawBody, signature)) {
        console.warn('[Paystack Webhook] Rejected: invalid signature');
        return;
      }

      // Step 2: Parse verified payload
      const event = JSON.parse(rawBody.toString('utf8'));

      console.log('[Paystack Webhook] Event received:', event.event, {
        reference: event.data?.reference,
        customer: event.data?.customer?.email,
      });

      // Step 3: Delegate to PaystackService
      const result = await req.paystackService.processWebhookEvent(event);
      console.log('[Paystack Webhook] Processed:', result.event);

      // Step 4: Optional internal event bus
      if (req.eventEmitter) req.eventEmitter.emit('paystack:webhook', result);

    } catch (err) {
      console.error('[Paystack Webhook] Unhandled error:', err.message, err.stack);
    }
  }
);

module.exports = router;
