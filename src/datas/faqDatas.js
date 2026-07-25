export const APP_FAQ = [
  {
    category: 'Getting Started',
    icon: 'rocket_launch',
    items: [
      {
        q: 'What is TailorPady?',
        a: 'TailorPady is a tailor management system built as a Progressive Web App (PWA) for tailors and fashion designers. It works fully offline and automatically syncs your data to the cloud once you\'re back online. With TailorPady you can manage customers and their measurements, track orders, generate invoices and receipts, manage payments, handle tasks and appointments, track inventory, build a portfolio of your work, and collect customer reviews — plus an AI assistant that can draft receipts, invoices, birthday messages, and reminders for you automatically.',
      },
      {
        q: 'Do I need to create an account to use TailorPady?',
        a: 'Yes, an account is required to use TailorPady. Your data is stored on your device so the app works fully offline, and it automatically syncs to the cloud whenever you\'re connected, keeping your records backed up and accessible if you switch devices.',
      },
      {
        q: 'Is my data safe if I uninstall the app?',
        a: 'As long as your data has synced to the cloud at least once while you were online, it\'s safely backed up to your account and will still be there if you reinstall the app or switch devices. Data created while offline that hasn\'t had a chance to sync yet could be lost if you uninstall before reconnecting, so it\'s best to go online from time to time to let everything sync.',
      },
    ],
  },
  {
    category: 'Customers',
    icon: 'people',
    items: [
      {
        q: 'How do I add a new customer?',
        a: 'Go to the Customers page and tap the + button. A form will pop up for you to fill in the customer\'s details — tap Save and a customer card will appear on the Customers page.',
      },
      {
        q: 'What can I do from a customer\'s profile?',
        a: 'Tapping a customer\'s card opens their Customer Details page, where you\'ll see their contact info, address, birthday, and a running total of what they\'ve been billed, paid, and still owe. You can call or message them on WhatsApp directly from this page, and the page is organised into tabs — Measurements, Orders, Invoices, Payments, and Receipts — each filtered to that one customer.',
      },
      {
        q: 'How do I add a measurement, order, invoice, payment, or receipt for a customer?',
        a: 'Open the customer\'s profile and switch to the relevant tab — Measurements, Orders, Invoices, Payments, or Receipts — then tap the + button at the bottom of that tab. A form will pop up for you to enter the details and save.',
      },
      {
        q: 'What\'s the difference between a customer\'s tabs and the main Orders, Invoices, Payments, and Receipts pages?',
        a: 'The Orders, Invoices, Payments, and Receipts pages in the main navigation show records across all of your customers, but they\'re for viewing only — you can\'t create a new entry from those pages. To add a new order, invoice, payment, or receipt, do it from the relevant tab inside that specific customer\'s profile.',
      },
    ],
  },
  {
    category: 'Orders',
    icon: 'shopping_bag',
    items: [
      {
        q: 'How do I create an order?',
        a: 'Orders are created from a customer\'s profile. Open the customer\'s Orders tab and tap the + button to fill in the order details and save.',
      },
      {
        q: 'How do I check an order\'s status?',
        a: 'Tap any order — from a customer\'s Orders tab or from the All Orders page — to open its details, which show the order\'s current stage, such as in progress or ready. Once an order is marked ready or delivered, its status updates to completed.',
      },
      {
        q: 'Can I generate a review link from an order?',
        a: 'Yes. Once an order\'s status shows completed or delivered, a Send Review Link button appears in its details. Tapping it generates a one-time link you can send to the customer.',
      },
    ],
  },
  {
    category: 'Invoices, Receipts & Payments',
    icon: 'receipt_long',
    items: [
      {
        q: 'How do I create an invoice or receipt?',
        a: 'Open the customer\'s profile, go to their Invoices or Receipts tab, and tap the + button to fill in line items, quantities, and prices.',
      },
      {
        q: 'Can I customise how my invoices and receipts look?',
        a: 'Yes, and this is free for everyone. You can choose from multiple templates and set details like your bank information, payment terms, and footer message in Settings → Invoice Settings and Receipt Settings. Full branding — your logo, brand colours, and signature — is part of TailorPady Pro.',
      },
      {
        q: 'Can I bill a customer in a different currency from my app\'s display currency?',
        a: 'Yes. Your app\'s Display Currency, set in Settings → Currency, is used across your dashboard, totals, and reports, but you can choose a different currency for an individual invoice or receipt at the time you create it.',
      },
      {
        q: 'Can I share or print an invoice or receipt?',
        a: 'Yes. Once generated, you can share it as a PDF via WhatsApp, email, or any other app on your phone, or print it through your device\'s share sheet.',
      },
      {
        q: 'How many invoices and receipts can I generate per month?',
        a: 'On the free plan you can generate up to 10 invoices and 10 receipts per month, alongside up to 20 active orders per month. TailorPady Pro removes these limits entirely.',
      },
      {
        q: 'How do I track payments?',
        a: 'Open a customer\'s profile and go to their Payments tab, then tap the + button to record a payment. Their total billed, total paid, and balance at the top of the profile update automatically.',
      },
    ],
  },
  {
    category: 'Tasks & Appointments',
    icon: 'task_alt',
    items: [
      {
        q: 'What are Tasks and Appointments for?',
        a: 'Tasks are to-dos tied to your work, like cutting fabric or picking up buttons, with due dates you can mark complete. Appointments let you schedule and keep track of meetings or fittings with customers. Both have their own pages since they\'re not part of a customer profile\'s tabs.',
      },
      {
        q: 'Can I link a task or appointment to a customer or order?',
        a: 'Yes. When creating a task or appointment you can link it to a specific customer and a specific order, making it easy to see what work belongs to whom.',
      },
      {
        q: 'Will I be notified about overdue tasks?',
        a: 'Yes, if enabled in Settings → Notifications, you\'ll get an alert whenever a task passes its due date.',
      },
    ],
  },
  {
    category: 'Inventory',
    icon: 'inventory_2',
    items: [
      {
        q: 'What can I do on the Inventory page?',
        a: 'The Inventory page lets you track your stock of materials and supplies. You can update quantities as you use or restock items, and set a low-stock threshold so you know when it\'s time to reorder.',
      },
    ],
  },
  {
    category: 'Gallery & Portfolio',
    icon: 'photo_library',
    items: [
      {
        q: 'What is the Gallery for?',
        a: 'The Gallery is where you upload photos of your finished work. From there, TailorPady generates a public portfolio link you can share with potential customers or on social media.',
      },
      {
        q: 'Can I customise my portfolio link and page?',
        a: 'Yes. You can set your own custom slug for your portfolio link, choose a portfolio template, and add details like your milestone, signature style, style statement, turnaround time, and service area from Settings → Portfolio Settings.',
      },
    ],
  },
  {
    category: 'Reviews',
    icon: 'star',
    items: [
      {
        q: 'How do customer reviews work?',
        a: 'Once an order\'s status shows completed or delivered, you can generate a one-time review link from that order\'s details and send it to your customer. They fill in a short form with their rating and comments, which then appears on your Reviews page for you to approve or decline.',
      },
      {
        q: 'How do reviews end up on my portfolio?',
        a: 'Once you approve a review on the Reviews page, it\'s automatically added to your public portfolio page for visitors to see.',
      },
    ],
  },
  {
    category: 'Settings',
    icon: 'settings',
    items: [
      {
        q: 'What can I customise in Settings?',
        a: 'Settings lets you adjust app Appearance (light or dark mode and accent colour), your Display Currency, Invoice Settings, Receipt Settings, your invoice and receipt Templates, Portfolio Settings, AI Settings, and Notifications for overdue tasks, customer birthdays, and unpaid invoices. There\'s also a Reset All Settings option that restores defaults without affecting your customers or orders.',
      },
      {
        q: 'Where do I set my preferred measurement unit?',
        a: 'Measurement units aren\'t set in Settings. You choose the unit — inches, centimetres, or yards — at the time you add a new measurement from a customer\'s Measurements tab.',
      },
    ],
  },
  {
    category: 'TailorPady Pro',
    icon: 'workspace_premium',
    items: [
      {
        q: 'What\'s included in the free plan?',
        a: 'The free plan includes up to 15 customers, full body and cloth measurements, 20 active orders per month, all invoice and receipt templates, 10 invoice and 10 receipt generations per month, basic branding, 15 portfolio uploads per month, a public portfolio link, 5 review links per month, basic payment tracking, 3 AI assistant actions per month, and birthday reminders.',
      },
      {
        q: 'What do I get with TailorPady Pro?',
        a: 'Pro removes the free plan\'s limits, giving you unlimited customers, measurements, active orders, and invoice and receipt generations. You also get full branding with your logo, colours, and signature, bank details and terms on every document, unlimited portfolio uploads with a fully branded portfolio page, unlimited review links, advanced payment tracking and reports, unlimited AI assistant actions, smart invoice auto-drafts, customer re-engagement reminders, and expanded cloud storage.',
      },
      {
        q: 'What does the AI assistant do?',
        a: 'The AI assistant can take autonomous actions on your behalf, such as generating receipts and invoices, sending customer birthday messages, and drafting documents automatically if a set timeframe passes and you haven\'t handled it yourself. It needs to be turned on in Settings → AI Settings, and on the free plan it\'s limited to 3 actions per month.',
      },
      {
        q: 'How do I upgrade to Pro?',
        a: 'Open TailorPady Pro from Settings and choose Monthly or Annual billing. Your Pro features activate immediately once payment is processed.',
      },
      {
        q: 'Can I cancel my Pro subscription?',
        a: 'Yes, you can cancel at any time. Your Pro features remain active until the end of your current billing period, after which your account reverts to the free plan.',
      },
    ],
  },
  {
    category: 'Troubleshooting',
    icon: 'build',
    items: [
      {
        q: 'The app is showing a blank screen. What do I do?',
        a: 'Try closing and reopening the app. If the issue persists, clear the app cache in your phone settings. If you still see a blank screen, please contact us via the Contact page so we can help you.',
      },
      {
        q: 'I accidentally deleted a customer. Can I recover them?',
        a: 'Unfortunately, deleted records can\'t be recovered once they\'ve synced. Double-check before deleting a customer, and keep your device online regularly so your data stays backed up.',
      },
      {
        q: 'My data isn\'t showing up on my other device. What\'s wrong?',
        a: 'Make sure you\'re signed into the same account on both devices and that each one has had a chance to connect to the internet — TailorPady syncs automatically in the background once you\'re online.',
      },
    ],
  },
]

export const MARKETING_FAQ = [
  {
    category: 'Getting Started',
    icon: 'rocket_launch',
    items: [
      {
        q: 'Does TailorPady work without internet?',
        a: 'Yes. TailorPady runs fully offline and syncs to the cloud automatically the moment you are back online, so you can keep working in the shop even without a signal.',
      },
      {
        q: 'Do I need to install anything?',
        a: 'No installation is required to get started — TailorPady runs in your browser. You can optionally install it as an app on your phone or tablet for a faster, full-screen experience.',
      },
      {
        q: 'Is TailorPady built for Nigerian tailors specifically?',
        a: 'TailorPady was built with Nigerian tailors and boutique owners in mind, including support for naira and other currencies, WhatsApp-based customer contact, and offline-first design for areas with unreliable internet.',
      },
    ],
  },
  {
    category: 'Pricing & Plans',
    icon: 'workspace_premium',
    items: [
      {
        q: 'Is TailorPady free?',
        a: 'Yes. The free plan covers up to 15 customers, 20 active orders a month, 10 invoice and 10 receipt generations a month, a public portfolio link, and more — no card required to start.',
      },
      {
        q: 'What do I get with TailorPady Pro?',
        a: 'Pro removes the free plan\'s limits entirely: unlimited customers, orders, measurements, invoices, and receipts, plus full branding, a fully branded portfolio page, unlimited AI assistant actions, and advanced reporting.',
      },
      {
        q: 'Can I cancel anytime?',
        a: 'Yes, you can cancel your subscription at any time. Your Pro features stay active until the end of your current billing period.',
      },
    ],
  },
  {
    category: 'Features',
    icon: 'apps',
    items: [
      {
        q: 'Can I customise my invoices and receipts?',
        a: 'Yes, for everyone, for free. Choose a template and set your bank details and footer message right from Settings.',
      },
      {
        q: 'What does the AI assistant actually do?',
        a: 'Pady, TailorPady\'s AI assistant, can draft receipts, invoices, and birthday messages, and remind you before an order slips — all in plain language.',
      },
      {
        q: 'Can customers see my finished work?',
        a: 'Yes. TailorPady gives you a shareable portfolio link showcasing your gallery and approved customer reviews, which you can send to prospective clients or post on social media.',
      },
    ],
  },
]