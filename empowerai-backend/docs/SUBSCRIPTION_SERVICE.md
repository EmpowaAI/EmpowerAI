# SubscriptionService

Handles the full lifecycle of a user subscription — from trial creation through activation, plan changes, cancellation, and renewal. Works with the MongoDB adapter (`db.js`) and is called primarily by Paystack webhook events and the subscriptions REST API.

---

## Constructor

```js
const subscriptionService = new SubscriptionService(db);
```

| Parameter | Type | Description |
|---|---|---|
| `db` | Object | MongoDB adapter from `db.js` |

---

## Methods

### `startTrial(userId, planId?)`

Creates a new trial subscription for a user immediately after registration.

```js
await subscriptionService.startTrial(userId, 'starter');
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `userId` | String | required | MongoDB ObjectId of the user |
| `planId` | String | `'starter'` | Plan to trial (`starter`, `professional`, `enterprise`) |

**Returns** — the created `Subscription` document.

**Throws** — if the user already has a subscription.

**Behaviour**
- Sets `status: 'trial'`
- Sets `trialEndsAt` to today + `plan.trialDays` (14 days for Starter/Pro, 30 for Enterprise)
- Sets `billingCycle: 'monthly'` by default
- Called once per user — wire it into your registration controller

---

### `activate({ userId, planId, billingCycle, paystackSubscriptionCode, paystackCustomerCode, paystackEmailToken, paymentId, amountPaid })`

Activates or upgrades a subscription after a successful Paystack payment. Called automatically from `paystackService.processWebhookEvent()` on a `charge.success` event.

```js
await subscriptionService.activate({
  userId,
  planId: 'professional',
  billingCycle: 'monthly',
  paystackSubscriptionCode: 'SUB_xxx',
  paystackCustomerCode: 'CUS_xxx',
  paystackEmailToken: 'token_xxx',
  paymentId: '12345',
  amountPaid: 79900,
});
```

| Parameter | Type | Description |
|---|---|---|
| `userId` | String | MongoDB ObjectId of the user |
| `planId` | String | Plan being activated |
| `billingCycle` | String | `monthly` or `annual` |
| `paystackSubscriptionCode` | String | `SUB_xxx` from Paystack |
| `paystackCustomerCode` | String | `CUS_xxx` from Paystack |
| `paystackEmailToken` | String | Token needed to cancel subscription via Paystack API |
| `paymentId` | String | Paystack payment ID |
| `amountPaid` | Number | Amount in kobo |

**Returns** — the updated or created `Subscription` document.

**Behaviour**
- If a subscription already exists → updates it
- If no subscription exists → creates one
- Sets `status: 'active'`
- Calculates `currentPeriodEnd` as +1 month or +1 year from now
- Clears any pending plan changes

---

### `updatePaystackSubDetails({ paystackCustomerCode, paystackSubscriptionCode, paystackEmailToken, nextPaymentDate })`

Stores the Paystack subscription token and email token after the `subscription.create` webhook event fires. These are required later to cancel the subscription via the Paystack API.

```js
await subscriptionService.updatePaystackSubDetails({
  paystackCustomerCode: 'CUS_xxx',
  paystackSubscriptionCode: 'SUB_xxx',
  paystackEmailToken: 'token_xxx',
  nextPaymentDate: new Date('2026-06-01'),
});
```

**Returns** — the updated `Subscription` document, or `null` if no subscription found for that customer code.

---

### `handleRenewalBySubscriptionCode({ subscriptionCode, paymentId, amountPaid })`

Processes a successful recurring payment. Called from the `invoice.update` webhook event.

```js
await subscriptionService.handleRenewalBySubscriptionCode({
  subscriptionCode: 'SUB_xxx',
  paymentId: '67890',
  amountPaid: 79900,
});
```

**Behaviour**
- Resets `currentPeriodStart` and `currentPeriodEnd` for the new billing period
- If a downgrade was pending (`pendingPlanId`), applies it now
- Clears `pendingPlanId` and `pendingBillingCycle` after applying

---

### `markPastDueBySubscriptionCode(subscriptionCode)`

Marks a subscription as `past_due` after a failed recurring payment. Called from the `invoice.payment_failed` webhook event.

```js
await subscriptionService.markPastDueBySubscriptionCode('SUB_xxx');
```

**Returns** — the updated `Subscription` document, or `null` if not found.

> Users with `past_due` status are blocked by `requireActiveSubscription` middleware until payment is resolved.

---

### `cancel(userId, reason?)`

Schedules a cancellation at the end of the current billing period. The user retains full access until `currentPeriodEnd`.

```js
const result = await subscriptionService.cancel(userId, 'Too expensive');
// result.message → "Subscription active until Mon Jun 01 2026 and will not renew."
```

| Parameter | Type | Default | Description |
|---|---|---|---|
| `userId` | String | required | MongoDB ObjectId |
| `reason` | String | `''` | Optional cancellation reason |

**Returns** — `{ subscription, message }`

**Throws** — if subscription is already cancelled.

---

### `cancelImmediately(userId, reason?)`

Cancels a subscription immediately with no grace period. Used for admin actions or non-recoverable payment failures.

```js
await subscriptionService.cancelImmediately(userId, 'Fraud detected');
```

**Behaviour**
- Sets `status: 'cancelled'`
- Sets `currentPeriodEnd` to now (access revoked immediately)

---

### `cancelBySubscriptionCode(subscriptionCode, reason?)`

Same as `cancelImmediately` but looks up the subscription by Paystack subscription code instead of `userId`. Called from the `subscription.disable` webhook event.

```js
await subscriptionService.cancelBySubscriptionCode('SUB_xxx', 'Paystack subscription disabled');
```

---

### `reactivate(userId)`

Undoes a scheduled cancellation. Only works if `cancelAtPeriodEnd` is `true` and the subscription is still `active`.

```js
await subscriptionService.reactivate(userId);
```

**Throws**
- If subscription is not scheduled for cancellation
- If subscription is already fully cancelled (user must start a new subscription)

---

### `changePlan(userId, newPlanId, billingCycle)`

Handles plan upgrades and downgrades.

```js
const result = await subscriptionService.changePlan(userId, 'enterprise', 'annual');
```

| Parameter | Type | Description |
|---|---|---|
| `userId` | String | MongoDB ObjectId |
| `newPlanId` | String | Target plan |
| `billingCycle` | String | `monthly` or `annual` |

**Returns**

For upgrades:
```js
{ action: 'checkout_required', planId: 'enterprise', billingCycle: 'annual' }
```
→ frontend should redirect user to a new Paystack checkout.

For downgrades:
```js
{ action: 'scheduled', message: 'Downgrade to Professional applies on Mon Jun 01 2026' }
```
→ change is stored as `pendingPlanId` and applied on next renewal.

**Throws** — if user is already on the same plan and billing cycle.

---

### `expireTrials()`

Marks all trial subscriptions past their `trialEndsAt` date as `expired`. Run this daily via a cron job.

```js
// In your cron scheduler (e.g. node-cron)
cron.schedule('0 0 * * *', async () => {
  const expired = await subscriptionService.expireTrials();
  console.log(`Expired ${expired.length} trials`);
});
```

**Returns** — array of updated `Subscription` documents.

---

### `getByUserId(userId)`

Fetch the subscription for a user.

```js
const subscription = await subscriptionService.getByUserId(userId);
```

---

### `getAll({ status?, planId?, page?, limit? })`

Fetch all subscriptions with optional filters. Used by the super admin dashboard.

```js
const result = await subscriptionService.getAll({ status: 'trial', page: 1, limit: 20 });
// result.data       → array of subscriptions
// result.pagination → { page, limit, total, pages }
```

---

## Subscription Status Flow

```
Registration
     │
     ▼
  [trial] ──────────────────────────────────► [expired]
     │              trialEndsAt passed             │
     │              (cron: expireTrials)            │
     │ charge.success                               │
     ▼                                             ▼
  [active] ◄──────────────── user re-subscribes ──┘
     │
     ├── invoice.payment_failed ──► [past_due]
     │                                  │
     │                          payment resolves
     │                                  │
     │◄─────────────────────────────────┘
     │
     ├── cancel() ──► cancelAtPeriodEnd: true ──► period ends ──► [cancelled]
     │                        │
     │                  reactivate() ──► back to [active]
     │
     └── subscription.disable (Paystack) ──► [cancelled]
```

---

## Error Reference

| Error Message | Cause |
|---|---|
| `School already has a subscription` | `startTrial` called for user who already has one |
| `No subscription found for school {id}` | Internal lookup failed — user has no subscription |
| `Subscription is already cancelled` | `cancel()` called on already-cancelled sub |
| `Subscription is not scheduled for cancellation` | `reactivate()` called but `cancelAtPeriodEnd` is false |
| `Already cancelled. Start a new subscription` | `reactivate()` called on fully cancelled sub |
| `Already on this plan and cycle` | `changePlan()` called with no actual change |
| `No subscription found for Paystack code: SUB_xxx` | Webhook arrived for unknown subscription code |
