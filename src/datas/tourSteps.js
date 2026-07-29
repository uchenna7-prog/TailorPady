export const TOURS = {
  onboarding: [
    {
      id: 'add-customer',
      route: '/customers',
      target: '[data-tour="add-customer-fab"]',
      title: 'Add your first customer',
      message: 'Every order starts with a customer profile. Tap the + button to add one.',
    },
    {
      id: 'goto-orders-tab',
      route: 'CUSTOMER_DETAIL',
      target: '[data-tour="tab-orders"]',
      title: 'Nice! Now add an order',
      message: 'Tap the Orders tab to get started.',
    },
    {
      id: 'add-order',
      target: '[data-tour="detail-fab"]',
      title: 'Add an order',
      message: 'Tap the + button to create an order for this customer.',
    },
    {
      id: 'goto-invoices-tab',
      target: '[data-tour="tab-invoices"]',
      title: 'Generate an invoice',
      message: 'Tap the Invoices tab.',
    },
    {
      id: 'add-invoice',
      target: '[data-tour="detail-fab"]',
      title: 'Create the invoice',
      message: 'Tap + and select the order to generate an invoice.',
    },
    {
      id: 'goto-payments-tab',
      target: '[data-tour="tab-payments"]',
      title: 'Record a payment',
      message: 'Tap the Payments tab.',
    },
    {
      id: 'add-payment',
      target: '[data-tour="detail-fab"]',
      title: 'Record a payment',
      message: 'Tap + to record a payment for this order.',
    },
    {
      id: 'goto-receipts-tab',
      target: '[data-tour="tab-receipts"]',
      title: 'Get the receipt',
      message: 'Tap the Receipts tab.',
    },
    {
      id: 'add-receipt',
      target: '[data-tour="detail-fab"]',
      title: 'Generate a receipt',
      message: 'Tap + to generate a receipt from that payment.',
    },
    {
      id: 'done',
      target: null,
      title: "You're all set!",
      message: 'You now know the full flow: Customer → Order → Invoice → Payment → Receipt.',
    },
  ],
}
