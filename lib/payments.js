// Payment methods available in Pakistan. These are the starting defaults —
// everything is editable from Admin → Payment methods and saved on the server.
//
// Shape:
//   { id, kind, name, desc, badge, color, logo, enabled, instructions,
//     accounts: [{ id, bank, title, number, iban, active }] }
// kind: 'cod' | 'wallet' | 'bank' | 'raast' | 'card' | 'other'

export const PAYMENT_KINDS = {
  cod: { label: 'Cash on Delivery', numberLabel: '', needsAccount: false },
  wallet: { label: 'Mobile wallet', numberLabel: 'Wallet / mobile number', needsAccount: true },
  bank: { label: 'Bank transfer', numberLabel: 'Account number', needsAccount: true },
  raast: { label: 'Raast', numberLabel: 'Raast ID (mobile number)', needsAccount: true },
  card: { label: 'Debit / Credit card', numberLabel: 'Merchant / gateway ID', needsAccount: false },
  other: { label: 'Other', numberLabel: 'Account / reference number', needsAccount: true },
};

export const PK_BANKS = [
  'Meezan Bank', 'HBL (Habib Bank Limited)', 'UBL (United Bank Limited)', 'MCB Bank', 'Allied Bank (ABL)',
  'Bank Alfalah', 'Bank Al Habib', 'Faysal Bank', 'Askari Bank', 'Standard Chartered Pakistan',
  'National Bank of Pakistan (NBP)', 'The Bank of Punjab (BOP)', 'Habib Metropolitan Bank', 'JS Bank',
  'Soneri Bank', 'Dubai Islamic Bank Pakistan', 'BankIslami', 'Al Baraka Bank', 'Bank of Khyber',
  'Sindh Bank', 'Silkbank', 'Samba Bank', 'Summit Bank', 'MCB Islamic Bank', 'First Women Bank',
  'Mobilink Microfinance Bank', 'Telenor Microfinance Bank', 'U Microfinance Bank', 'Other',
];

const m = (o) => ({ badge: '', instructions: '', accounts: [], ...o });

export const DEFAULT_PAYMENTS = [
  m({ id: 'cod', kind: 'cod', name: 'Cash on Delivery', desc: 'Pay in cash when your plants arrive', badge: 'Most popular', color: '#5DA13B', logo: 'COD', enabled: true }),
  m({ id: 'jazzcash', kind: 'wallet', name: 'JazzCash', desc: 'Send payment from your JazzCash wallet', color: '#C8102E', logo: 'JC', enabled: true,
    instructions: 'Send the total to the JazzCash account below, then enter the transaction ID (TID).' }),
  m({ id: 'easypaisa', kind: 'wallet', name: 'Easypaisa', desc: 'Send payment from your Easypaisa wallet', color: '#00A651', logo: 'EP', enabled: true,
    instructions: 'Send the total to the Easypaisa account below, then enter the transaction ID (TID).' }),
  m({ id: 'bank', kind: 'bank', name: 'Bank transfer', desc: 'IBFT / online transfer from any Pakistani bank', color: '#1F4E8C', logo: 'BANK', enabled: true,
    instructions: 'Transfer the total to one of the accounts below, then enter the transaction reference.' }),
  m({ id: 'raast', kind: 'raast', name: 'Raast', desc: 'Instant free transfer via Raast ID or IBAN', color: '#0B6E4F', logo: 'R', enabled: false,
    instructions: 'Pay instantly from your banking app using Raast.' }),
  m({ id: 'sadapay', kind: 'wallet', name: 'SadaPay', desc: 'Send from your SadaPay app', color: '#FF7A59', logo: 'SP', enabled: false }),
  m({ id: 'nayapay', kind: 'wallet', name: 'NayaPay', desc: 'Send from your NayaPay app', color: '#F26B21', logo: 'NP', enabled: false }),
  m({ id: 'upaisa', kind: 'wallet', name: 'UPaisa', desc: 'Send from your UPaisa (Ufone) wallet', color: '#6A1B9A', logo: 'UP', enabled: false }),
  m({ id: 'card', kind: 'card', name: 'Debit / Credit card', desc: 'Visa, Mastercard, UnionPay, PayPak', color: '#1A56DB', logo: 'CARD', enabled: false,
    instructions: 'We will send you a secure card payment link on WhatsApp after you place the order.' }),
];

/** Strip admin-only data for the storefront: enabled methods + active accounts only. */
export function publicPayments(list) {
  return list
    .filter((p) => p.enabled)
    .map((p) => ({ ...p, accounts: p.accounts.filter((a) => a.active) }));
}
