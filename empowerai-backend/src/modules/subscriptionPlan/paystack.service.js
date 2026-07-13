
const { v4: uuidv4 } = require('uuid');
const { PAYSTACK_CONFIG, paystackRequest } = require('../../config/payStack.config');
const { getPlanById, getPaystackPlanCode, BILLING_CYCLES } = require('../../config/plans.config');

class PaystackService {
  constructor(subscriptionService) {
    this.subscriptionService = subscriptionService;
  }

  // ─── INITIALIZE TRANSACTION ───────────────────────────────────────────────────

  async initializeTransaction({ user, planId, billingCycle = BILLING_CYCLES.MONTHLY }) {
    const plan = getPlanById(planId);
    const planCode = getPaystackPlanCode(planId, billingCycle);
    const amount = billingCycle === BILLING_CYCLES.ANNUAL ? plan.priceAnnual : plan.priceMonthly;
    const reference = `EMPOWERAI-${user.id}-${uuidv4()}`;

    const payload = {
      email: user.email,
      amount,                         // in kobo
      currency: plan.currency,
      reference,
      plan: planCode,                 // attaches recurring billing
      callback_url: PAYSTACK_CONFIG.callbackUrl,
      metadata: {
        userId: user.id,
        planId: plan.id,
        billingCycle,
        userName: user.name,
        custom_fields: [
          { display_name: 'User', variable_name: 'user_name', value: user.name },
          { display_name: 'Plan', variable_name: 'plan_id', value: plan.id },
        ],
      },
    };

    const response = await paystackRequest('POST', '/transaction/initialize', payload);

    return {
      authorizationUrl: response.data.authorization_url,
      accessCode: response.data.access_code,
      reference: response.data.reference,
    };
  }

  // ─── VERIFY TRANSACTION ───────────────────────────────────────────────────────

  async verifyTransaction(reference) {
    const response = await paystackRequest('GET', `/transaction/verify/${reference}`);
    const tx = response.data;

    if (tx.status !== 'success') {
      throw new Error(`Transaction not successful: ${tx.gateway_response}`);
    }

    return tx;
  }

  // ─── PROCESS WEBHOOK EVENT ────────────────────────────────────────────────────

  async processWebhookEvent(event) {
    const { event: eventType, data } = event;

    switch (eventType) {
      case 'charge.success':
        return this._handleChargeSuccess(data);

      case 'subscription.create':
        return this._handleSubscriptionCreated(data);

      case 'invoice.update':
        if (data.paid) return this._handleRenewalSuccess(data);
        return { event: 'invoice_not_paid', status: data.status };

      case 'invoice.payment_failed':
        return this._handlePaymentFailed(data);

      case 'subscription.disable':
        return this._handleSubscriptionDisabled(data);

      default:
        // Unhandled event types are expected - log via caller
        return { event: 'unhandled', eventType };
    }
  }

  // ─── CANCEL SUBSCRIPTION ──────────────────────────────────────────────────────

  async cancelPaystackSubscription(subscriptionCode, emailToken) {
    return paystackRequest('POST', '/subscription/disable', {
      code: subscriptionCode,
      token: emailToken,
    });
  }

  async getPaystackSubscription(subscriptionCode) {
    return paystackRequest('GET', `/subscription/${subscriptionCode}`);
  }

  // ─── PRIVATE EVENT HANDLERS ───────────────────────────────────────────────────

  async _handleChargeSuccess(data) {
    const { metadata, subscription_code, customer, amount, reference, id: paymentId } = data;
    const userId = metadata?.userId;          // ✅ was schoolId

    if (!userId) {
      console.warn('[Paystack] charge.success missing userId in metadata', { reference });
      return { event: 'skipped_no_user_id' }; // ✅ was skipped_no_school_id
    }

    const subscription = await this.subscriptionService.activate({
      userId,                                 // ✅ was schoolId
      planId: metadata.planId,
      billingCycle: metadata.billingCycle,
      paystackSubscriptionCode: subscription_code || null,
      paystackCustomerCode: customer?.customer_code || null,
      paystackEmailToken: data.subscription?.email_token || null,
      paymentId: String(paymentId),
      amountPaid: amount,
    });

    return { event: 'subscription_activated', subscription };
  }

  async _handleSubscriptionCreated(data) {
    const { subscription_code, email_token, customer, next_payment_date } = data;

    const customerCode = customer?.customer_code;
    if (!customerCode) return { event: 'skipped_no_customer_code' };

    const updated = await this.subscriptionService.updatePaystackSubDetails({
      paystackCustomerCode: customerCode,
      paystackSubscriptionCode: subscription_code,
      paystackEmailToken: email_token,
      nextPaymentDate: new Date(next_payment_date),
    });

    return { event: 'paystack_subscription_stored', updated };
  }

  async _handleRenewalSuccess(data) {
    const { subscription, amount, id: paymentId } = data;
    const subscriptionCode = subscription?.subscription_code;
    if (!subscriptionCode) return { event: 'skipped_no_subscription_code' };

    const updated = await this.subscriptionService.handleRenewalBySubscriptionCode({
      subscriptionCode,
      paymentId: String(paymentId),
      amountPaid: amount,
    });

    return { event: 'subscription_renewed', updated };
  }

  async _handlePaymentFailed(data) {
    const { subscription } = data;
    const subscriptionCode = subscription?.subscription_code;
    if (!subscriptionCode) return { event: 'skipped_no_subscription_code' };

    const updated = await this.subscriptionService.markPastDueBySubscriptionCode(subscriptionCode);
    return { event: 'payment_failed', updated };
  }

  async _handleSubscriptionDisabled(data) {
    const { subscription_code } = data;

    const updated = await this.subscriptionService.cancelBySubscriptionCode(
      subscription_code,
      'Paystack subscription disabled'
    );

    return { event: 'subscription_cancelled', updated };
  }
}

module.exports = PaystackService;
