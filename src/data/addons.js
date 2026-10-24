// Add-on services: help centres, FAQs and grievance templates.
// All content is guidance, not a live government service.

export const HELP_CENTRES = [
  { name: 'Gram / Ward Sachivalayam', what: 'Apply for NSAP and NTR Bharosa, submit documents, get application status', carry: 'Aadhaar, rice card, bank passbook' },
  { name: 'MeeSeva / CSC Centre', what: 'Online applications, certificates, Jeevan Pramaan help, printing', carry: 'Aadhaar, application number, mobile phone' },
  { name: 'Pension-Paying Bank Branch', what: 'NPCI mapping activation, KYC correction, pension account issues', carry: 'Aadhaar, passbook, PPO copy' },
  { name: 'India Post (Doorstep Service)', what: 'Jeevan Pramaan at home for elderly / immobile pensioners', carry: 'Aadhaar, PPO number' },
  { name: 'EPFO Branch', what: 'EPS pension, family pension (Form 10D), PF claims', carry: 'UAN, death certificate, Aadhaar, cancelled cheque' },
  { name: 'District Social Welfare Office', what: 'Escalation for NSAP / state pension delays and rejections', carry: 'Application number, rejection letter (if any)' },
]

export const FAQS = [
  { q: 'Is PensionSaarthi a government website?', a: 'No. It is a student prototype built for IMPACTX 2026. It guides you to the right scheme and explains the process, but the final decision and payment are always made by the government.' },
  { q: 'Why is the central amount different from what my neighbour receives?', a: 'Because the central share is only part of the payment. Your state adds a top-up. This app always shows the central and state amounts separately so the difference is clear.' },
  { q: 'Do I need to share my Aadhaar number or OTP here?', a: 'Never. This app does not ask for a full Aadhaar number, bank password or OTP. A family helper can use it with just basic details.' },
  { q: 'My pension stopped suddenly. What is the first thing to check?', a: 'Check the Life Certificate first — it is the most common reason. Then check NPCI mapping at your bank. The "Why Did My Pension Stop?" section walks through both in order.' },
  { q: 'Can a family member apply on my behalf?', a: 'Yes — that is Family Helper Mode. The helper fills in details and prepares the checklist, but the pensioner\'s own face / fingerprint is still needed for Jeevan Pramaan, and documents are submitted at the official counter.' },
  { q: 'Is there any fee for applying for a pension?', a: 'No. Pension applications are free. Anyone asking for money to "get it done faster" should be reported at the official counter.' },
]

export const GRIEVANCE_ISSUES = [
  'Pension stopped without reason',
  'Application pending for more than 45 days',
  'Payment failed / DBT not credited',
  'Name or details mismatch rejection',
  'Family pension not started after death of pensioner',
]
