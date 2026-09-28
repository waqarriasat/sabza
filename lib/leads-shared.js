// Lead helpers used by both the server and the admin panel.
export const LEAD_STATUSES = ['new', 'contacted', 'confirmed', 'delivered', 'cancelled', 'spam'];
export const SALE_STATUSES = ['confirmed', 'delivered']; // these count toward commission

/** Sale value a lead contributes (0 unless the sale is confirmed/delivered). */
export function saleValue(lead, commission) {
  if (!SALE_STATUSES.includes(lead.status)) return 0;
  if (lead.saleAmount != null) return lead.saleAmount;
  return commission.basis === 'total' ? lead.total : lead.subtotal;
}
export const commissionOf = (lead, commission) => Math.round(saleValue(lead, commission) * (commission.rate || 0) / 100);

/** YYYY-MM in Pakistan time. */
export const monthOf = (iso) => new Date(iso).toLocaleDateString('en-CA', { timeZone: 'Asia/Karachi' }).slice(0, 7);
export const pkTime = (iso) => new Date(iso).toLocaleString('en-PK', { timeZone: 'Asia/Karachi', day: 'numeric', month: 'short', year: 'numeric', hour: 'numeric', minute: '2-digit' });
