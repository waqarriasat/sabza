// Customer-facing payment wording, built from what's switched on in the admin panel
// (Payment methods + Delivery → COD switch). `pay` comes from getPaySummary() on the server.

const orList = (a) => (a.length <= 1 ? a[0] || '' : `${a.slice(0, -1).join(', ')} or ${a[a.length - 1]}`);
const lower = (s) => s.replace(/^(\w)/, (c) => c.toLowerCase());

export const EMPTY_PAY = { names: [], prepaid: [], cod: false, codWith: [] };

/** e.g. "JazzCash or Easypaisa" */
export const payList = (pay) => orList(pay.names) || 'WhatsApp';
const prepaidList = (pay) => orList(pay.prepaid) || 'online payment';
const codWithText = (pay) => orList(pay.codWith.map(lower)) || 'courier';

export const codOn = (pay) => pay.cod && pay.codWith.length > 0;

export function faqPayment(pay) {
  if (codOn(pay)) {
    return `Yes — Cash on Delivery is available with ${codWithText(pay)}. Other orders (like same-day inDrive delivery) are paid in advance by ${prepaidList(pay)}.`;
  }
  return `At the moment all orders are paid in advance by ${payList(pay)} — quick and secure. Just send the payment and enter the transaction ID at checkout.`;
}

export const pillPayment = (pay) => (codOn(pay) ? `Cash on Delivery with ${codWithText(pay)}` : `Pay by ${payList(pay)}`);

export function productPayment(pay) {
  return codOn(pay)
    ? { b: `Cash on Delivery with ${codWithText(pay)}.`, s: `Same-day inDrive orders: pay in advance by ${prepaidList(pay)}.` }
    : { b: `Pay by ${payList(pay)}.`, s: 'Pay in advance and enter your transaction ID at checkout.' };
}

export const citiesNote = (pay) => `…and every other area of Lahore. Same-day inDrive delivery, or courier in 2–3 days${codOn(pay) ? ' with Cash on Delivery' : ''}.`;
