export const LEGAL_CONTACT_EMAIL = 'uchenduuchenna7@gmail.com'
export const LEGAL_CONTACT_PHONE = '+234 907 911 6980'

export const PRIVACY_LAST_UPDATED = 'August 2026'

export const PRIVACY_SECTIONS = [
  {
    id: 'who-we-are',
    title: 'Who We Are',
    body: `TailorPady is a business management application for tailors and fashion professionals. This Privacy Policy explains how we collect, use, store, and protect your personal data when you use the app.`,
  },
  {
    id: 'account-data',
    title: 'Account Information',
    body: `When you register, we collect:`,
    bullets: [
      'Full name (required).',
      'Email address (required).',
      'Phone number (optional).',
      'City and country (optional).',
      'Sex (optional).',
      'Birthday, month and day only, not year (optional).',
    ],
    footer: 'Full name and email are required for account creation and authentication. The optional fields help us personalise your experience, for example recognising your birthday, and are never required to use the app.',
  },
  {
    id: 'brand-identity',
    title: 'Brand Identity',
    body: `To power features like invoices, receipts, and your public portfolio page, you may add:`,
    bullets: [
      'Your logo.',
      'Shop or brand name.',
      'Tagline.',
      'Brand colour.',
      'Signature.',
    ],
    footer: 'Your logo and signature are optional and help personalise documents you generate in the app, but are not required to use core features.',
  },
  {
    id: 'business-info',
    title: 'Business Information',
    body: `You may add business details used to generate invoices and receipts for your customers:`,
    bullets: [
      'Business phone number and business address, required if you want to generate invoices or receipts.',
      'Business email, website or social handle, payment terms, optional.',
      'Bank name, account number, and account name, displayed on invoices as payment instructions for your customers, optional.',
    ],
    footer: 'Adding business information is entirely optional and only needed if you choose to use invoicing or receipt features. If you do not use these features, none of this information is required. We do not use your bank details for any payment processing.',
  },
  {
    id: 'socials',
    title: 'Social Media Handles',
    body: `If you set up a public portfolio, you may add your social handles for: Instagram, TikTok, Facebook, Twitter, YouTube, Pinterest, and Threads. These are optional and only used to display links on your public portfolio page.`,
  },
  {
    id: 'customer-data',
    title: 'Customer Data You Enter',
    body: `As a tailor using TailorPady, you enter data about your own customers. We store this on your behalf to power the app's features:`,
    bullets: [
      'Customer measurements, used for order and garment tracking.',
      'Garment reference images for your customers\u2019 orders.',
      'Customer details such as name, phone number, email, profile picture, and address. Most of these fields are optional, and help personalise the customer experience within the app.',
    ],
    footer: 'You are responsible for having the appropriate basis to collect and store your customers\u2019 data within the app.',
  },
  {
    id: 'payments-recorded',
    title: 'Payment Records',
    body: `TailorPady lets you manually record payments received from your customers for an order. This is for your own bookkeeping, receipts, reports, and revenue goals. TailorPady does not process or move this money; it is a record you type in yourself.`,
  },
  {
    id: 'reviews',
    title: 'Customer Reviews',
    body: `If you share a review link with your customers, anyone who submits a review through that link may provide their name, a rating, a written review, and an optional photo of themselves. Submitted reviews may be displayed publicly, for example on your portfolio page.`,
  },
  {
    id: 'portfolio-visibility',
    title: 'Public Portfolio Page',
    body: `If you set up a portfolio, the information you choose to include, such as your brand identity, business details, social handles, images, and customer reviews, is displayed on a public web page accessible to anyone with the link, without requiring login.`,
  },
  {
    id: 'bug-reports',
    title: 'Bug Reports',
    body: `If you use the Report a Bug feature, we collect your device model, operating system version, app version, your typed description of the issue, and an optional screenshot. This information is stored in Firebase and reviewed internally to provide support. A screenshot may incidentally contain other information visible on your screen at the time, such as customer data.`,
  },
  {
    id: 'analytics',
    title: 'Analytics',
    body: `We use Firebase Analytics to understand how the app is used, such as which features are opened and how often, so we can improve TailorPady. We do not use crash reporting tools, advertising identifiers, or third-party advertising or tracking pixels.`,
  },
  {
    id: 'ai-features',
    title: 'AI Features',
    body: `TailorPady includes two AI-related features. Both work using the business data you've already stored in the app, and neither sends your data to a third-party AI or language model provider.`,
    bullets: [
      'Automation engine: when you turn on the AI Assistant in Settings, it monitors your orders, invoices, payments, and customer records against the timeframes you configure, for example generating an invoice draft after an order has gone unbilled for the period you set, or preparing a receipt, payment reminder, overdue alert, birthday message, or win-back message. It only prepares drafts. Nothing is sent to your customers, and nothing is deleted, without your review and approval.',
      'Chat assistant: lets you ask questions about your business in plain language, such as checking a customer\u2019s balance or what\u2019s due today. It works entirely on-device using pattern matching against your own stored data; we do not send your messages to any external AI or language model provider to generate a response. Your chat messages are still saved to your account the same way other app data is, so your conversation history is available across your devices.',
      'Autonomous sending, where an approved draft would be sent automatically through a connected channel such as WhatsApp, Email, or Telegram, is a planned feature and is not active yet. If we launch it, you will need to separately connect a channel and give your consent before anything is sent without your review.',
    ],
    footer: 'You can turn the AI Assistant off at any time from Settings. Turning it off stops the automation engine from creating new drafts; it does not delete drafts or chat history you already have.',
  },
  {
    id: 'how-we-use',
    title: 'How We Use Your Data',
    body: `We use your data to:`,
    bullets: [
      'Provide and maintain the TailorPady service.',
      'Sync your business data across your devices.',
      'Generate documents you request, such as invoices, receipts, and your portfolio page.',
      'Send important account notifications and service updates.',
      'Improve the performance and features of the app, including through analytics.',
      'Respond to your support requests and bug reports.',
    ],
    footer: 'We do not use your data for advertising, and we do not sell your data to any third party.',
  },
  {
    id: 'third-party',
    title: 'Third-Party Services',
    body: `TailorPady uses the following trusted third-party services to deliver its functionality:`,
    bullets: [
      'Firebase (Google): used for authentication, database storage, hosting, and analytics.',
      'Cloudinary: used for storing and serving profile photos, gallery, and other images.',
      'Paystack: used to process payment for your TailorPady subscription. Paystack handles your card details directly; we do not store your card information.',
    ],
    footer: 'These services process your data on our behalf and are bound by their own privacy policies. We encourage you to review the privacy policies of Firebase, Cloudinary, and Paystack if you have concerns about how they handle data.',
  },
  {
    id: 'storage-security',
    title: 'Data Storage and Security',
    body: `Your data is stored securely on Firebase servers. Images are stored on Cloudinary. We implement reasonable technical measures to protect your data from unauthorised access, loss, or misuse. However, no system is completely secure, and we cannot guarantee absolute security.`,
  },
  {
    id: 'data-retention',
    title: 'Data Retention',
    body: `We retain your data for as long as your account is active. If you delete your account, your access is revoked immediately, and your data is permanently deleted from our systems within 30 days. See our Account Deletion page for full details.`,
    footer: 'We may retain limited data beyond this period where required by law, such as billing records related to your Paystack transactions.',
  },
  {
    id: 'your-rights',
    title: 'Your Rights',
    body: `You have the right to:`,
    bullets: [
      'Access the data we hold about you.',
      'Request correction of inaccurate data.',
      'Delete individual records you have created, such as customers, orders, or images, directly within the app at any time.',
      'Request deletion of your account and associated data.',
      'Export your business data.',
    ],
    footer: 'To exercise any of these rights, please contact us using the details below.',
  },
  {
    id: 'childrens-privacy',
    title: "Children's Privacy",
    body: `TailorPady is not intended for use by anyone under the age of 13. We do not knowingly collect personal data from children. If you believe a child has provided us with their data, please contact us and we will delete it promptly.`,
  },
  {
    id: 'international',
    title: 'International Users',
    body: `TailorPady is available globally. If you are accessing the app from outside Nigeria, please be aware that your data may be transferred to and processed in servers located in other countries, including those operated by Firebase, Cloudinary, and Paystack. By using the app, you consent to this transfer.`,
  },
  {
    id: 'changes',
    title: 'Changes to This Policy',
    body: `We may update this Privacy Policy from time to time. We will notify you of material changes through the app or by email. Your continued use of TailorPady after changes are posted means you accept the updated policy.`,
  },
]

export const TERMS_LAST_UPDATED = 'June 2026'

export const TERMS_SECTIONS = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    body: `By accessing or using TailorPady, you agree to be bound by these Terms and Conditions. If you do not agree to these terms, please do not use the app. These terms apply to all users of TailorPady, whether on the free plan or any paid subscription plan.`,
  },
  {
    id: 'description',
    title: 'Description of Service',
    body: `TailorPady is a business management application designed for tailors and fashion professionals. The app provides tools for managing customers, orders, invoices, payments, appointments, tasks, gallery, and related business operations.`,
  },
  {
    id: 'user-accounts',
    title: 'User Accounts',
    body: `You are responsible for maintaining the confidentiality of your account credentials and for all activity that occurs under your account.`,
    bullets: [
      'You agree to provide accurate and complete information when creating your account.',
      'You must notify us immediately of any unauthorised use of your account.',
    ],
  },
  {
    id: 'acceptable-use',
    title: 'Acceptable Use',
    body: `You agree to use TailorPady only for lawful business purposes. You must not:`,
    bullets: [
      'Misuse the app or attempt to gain unauthorised access to any part of the service.',
      'Upload malicious content or use the app in any way that could damage, disable, or impair the service.',
      'You are solely responsible for the accuracy of data you enter into the app.',
    ],
  },
  {
    id: 'subscriptions',
    title: 'Subscription Plans and Payments',
    body: `TailorPady offers both a free plan and paid subscription plans. Paid plans are billed on a monthly or annual basis as selected at the time of subscription, and processed securely through Paystack.`,
    bullets: [
      'All fees are non-refundable except as described in our Refund and Cancellation Policy.',
      'We reserve the right to change pricing with reasonable notice.',
      'Continued use of the app after a price change constitutes your acceptance of the new pricing.',
    ],
  },
  {
    id: 'data-privacy',
    title: 'Data and Privacy',
    body: `Your use of TailorPady is also governed by our Privacy Policy. By using the app, you consent to the collection and use of your data as described in that policy.`,
    bullets: [
      'You retain ownership of all business data you input into the app.',
      'We do not sell your data to third parties.',
    ],
  },
  {
    id: 'ip',
    title: 'Intellectual Property',
    body: `All content, design, code, and materials within TailorPady are the intellectual property of TailorPady and its creators. You may not reproduce, distribute, or create derivative works from any part of the app without our express written permission.`,
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    body: `TailorPady is provided on an "as is" basis. We do not guarantee uninterrupted or error-free operation. To the fullest extent permitted by law, we shall not be liable for any indirect, incidental, or consequential damages arising from your use of or inability to use the app, including loss of business data.`,
  },
  {
    id: 'termination',
    title: 'Termination',
    body: `We reserve the right to suspend or terminate your account at any time if you violate these terms or engage in conduct that we reasonably determine to be harmful to other users or to the service. You may also delete your account at any time through the app settings.`,
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    body: `We may update these Terms and Conditions from time to time. We will notify you of significant changes through the app or by email. Your continued use of TailorPady after changes are posted constitutes your acceptance of the updated terms.`,
  },
]

export const REFUND_LAST_UPDATED = 'June 2026'

export const REFUND_SECTIONS = [
  {
    id: 'free-plan',
    title: 'Free Plan',
    body: `The free plan for TailorPady carries no charges. There is nothing to refund or cancel. You may stop using the app at any time without any financial obligation.`,
  },
  {
    id: 'paid-plans',
    title: 'Paid Subscription Plans',
    body: `TailorPady offers monthly and annual subscription plans, billed securely through Paystack. By subscribing to a paid plan, you authorise us to charge your selected payment method at the beginning of each billing period. All subscription fees are charged in advance.`,
  },
  {
    id: 'cancellation',
    title: 'Cancellation',
    body: `You may cancel your paid subscription at any time through the app settings or by contacting us directly.`,
    bullets: [
      'Once cancelled, your subscription will remain active until the end of the current billing period.',
      'You will not be charged for the next billing cycle.',
      'Cancellation does not entitle you to a refund for the current or any past billing period.',
    ],
  },
  {
    id: 'refunds',
    title: 'Refunds',
    body: `All payments made to TailorPady are non-refundable. We do not offer partial refunds for unused portions of a billing period.`,
    footer: 'If you believe you were charged in error, please contact us within 7 days of the charge and we will investigate and resolve the issue promptly.',
  },
  {
    id: 'annual-plans',
    title: 'Annual Plans',
    body: `Annual subscriptions are billed as a single upfront payment.`,
    bullets: [
      'If you cancel an annual plan, you will retain access to the paid features until the end of the 12-month period.',
      'No refund will be issued for the remaining months, except in cases of verified billing errors on our part.',
    ],
  },
  {
    id: 'exceptional',
    title: 'Exceptional Circumstances',
    body: `In exceptional circumstances \u2014 such as extended service unavailability caused by our end \u2014 we may at our discretion offer account credits or partial refunds. These will be evaluated on a case-by-case basis. Please contact us to discuss your situation.`,
  },
  {
    id: 'account-deletion',
    title: 'Account Deletion',
    body: `Deleting your account does not automatically cancel an active subscription. Please cancel your subscription first before deleting your account to avoid future charges.`,
    footer: 'Once your account deletion is confirmed, it cannot be reversed. See our Account Deletion page for the full timeline.',
  },
]

export const DELETE_ACCOUNT_LAST_UPDATED = 'August 2026'

export const DELETE_ACCOUNT_SECTIONS = [
  {
    id: 'in-app-deletion',
    title: 'Delete Your Account In the App',
    body: `You can delete your TailorPady account and all associated data directly from within the app:`,
    bullets: [
      'Open the TailorPady app and log in to your account.',
      'Go to Account.',
      'Tap Delete Account.',
      'Confirm the deletion when prompted.',
    ],
    footer: 'Your access to your account is revoked immediately after confirmation. Your data is not deleted right away, see the Grace Period section below.',
  },
  {
    id: 'deleting-individual-data',
    title: 'Deleting Individual Data You No Longer Need',
    body: `You do not need to delete your entire account to remove specific data. Items such as customers, orders, garment images, and other records you have created can be deleted directly within the app at any time, using the delete option available on that item. This kind of deletion is immediate and does not go through the 30-day grace period described below, which applies only to full account deletion.`,
  },
  {
    id: 'grace-period',
    title: 'Grace Period and Recovery',
    body: `Once you confirm account deletion in the app, you are logged out immediately and your account is scheduled for permanent deletion 30 days later.`,
    bullets: [
      'During this 30-day window, your account cannot be accessed or restored by logging in.',
      'If you change your mind, contact us at the email address below within the 30-day window, from the email address associated with your account, to request recovery.',
      'After the 30-day window ends, deletion is permanent and cannot be reversed.',
      'You cannot create a new TailorPady account using the same email address until the deletion process is complete.',
    ],
  },
  {
    id: 'what-gets-deleted',
    title: 'What Gets Deleted',
    body: `After the 30-day period, the following data is permanently removed from our systems:`,
    bullets: [
      'Account data: your name, email address, phone number, city, country, sex, and birthday.',
      'Brand identity: logo, shop name, tagline, brand colour, and signature.',
      'Business information: business contact details, address, website/social handles, and payment terms.',
      'Customer data you entered: customer measurements, garment reference images, and customer details.',
      'Payment records you manually entered, and customer reviews.',
      'Profile, gallery, and portfolio images stored on Cloudinary.',
    ],
  },
  {
    id: 'retention',
    title: 'Data We May Retain',
    body: `In limited cases, we may retain certain data beyond the 30-day period where required by law or legitimate business need, such as:`,
    bullets: [
      'Subscription billing records from Paystack needed for tax, accounting, or fraud-prevention purposes.',
      'Records we are legally required to keep under applicable law.',
    ],
    footer: 'Any retained data is kept only as long as necessary for these purposes and is not used for any other purpose.',
  },
  {
    id: 'timeframe',
    title: 'Deletion Timeframe',
    body: `Your account is locked immediately upon confirming deletion. Your data, including images, is permanently deleted from our active systems 30 days after your request. Data may persist briefly in backups before being fully purged.`,
  },
  {
    id: 'contact',
    title: 'Contact Us',
    body: `If you do not have access to the app, you can request account deletion or the deletion of other data by emailing us at the address below. Requests for full account deletion made this way follow the same 30-day grace period described above.`,
  },
]
