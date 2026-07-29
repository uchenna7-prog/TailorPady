export const TRACKS = [
  { id: 'permissions',  label: 'Turn on notifications & install the app', available: true  },
  { id: 'customerFlow', label: 'Add your first customer',                 available: true  },
  { id: 'portfolio',    label: 'Set up your portfolio',                   available: false },
  { id: 'firstTask',    label: 'Add your first task',                     available: false },
]

export const TOURS = {
  permissions: [
    {
      id: 'enable-notifications',
      target: '[data-tour="enable-notifications-btn"]',
      title: 'Turn on notifications',
      message: "Tap here so you never miss an appointment or due date.",
    },
    {
      id: 'install-app',
      target: '[data-tour="install-app-btn"]',
      title: 'Install the app',
      message: 'Tap here to install TailorPady on your device and use it offline.',
    },
    {
      id: 'confirm-start-customer',
      type: 'confirm',
      target: null,
      title: 'Ready to add your first customer?',
      message: "We'll walk through adding a customer, their measurements, an order, invoice, payment and receipt.",
      yesLabel: "Let's go",
      noLabel: 'Maybe later',
      onYesStartTour: 'customerFlow',
    },
  ],

  customerFlow: [
    {
      id: 'goto-customers-nav',
      target: '[data-tour="nav-customers"]',
      title: 'Go to Customers',
      message: 'Tap Customers in the bottom navigation.',
    },
    {
      id: 'add-customer',
      target: '[data-tour="add-customer-fab"]',
      title: 'Add your first customer',
      message: 'Every order starts with a customer profile. Tap the + button to add one.',
    },
    {
      id: 'tap-new-customer',
      target: '[data-tour="new-customer-row"]',
      title: 'Open their profile',
      message: 'Tap on the customer you just added to open their profile.',
    },
    {
      id: 'add-measurement',
      target: '[data-tour="detail-fab"]',
      title: 'Add body measurements',
      message: 'Tap + to record their measurements — this is what orders are built from.',
    },
    {
      id: 'goto-orders-tab',
      target: '[data-tour="tab-orders"]',
      title: 'Now place an order',
      message: 'Tap the Orders tab.',
    },
    {
      id: 'add-order',
      target: '[data-tour="detail-fab"]',
      title: 'Add an order',
      message: 'Tap + to create an order using those measurements.',
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
      message: 'You now know the full flow: Customer → Measurements → Order → Invoice → Payment → Receipt.',
    },
  ],

  // Built later, once Portfolio and Tasks pages are shared.
  portfolio: [],
  firstTask: [],
}
