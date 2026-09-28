import { getPayments } from './payments';
import { getDelivery } from './delivery';
import { codAllowed } from '../delivery';

/** What customers can pay with right now (from the admin panel). */
export async function getPaySummary() {
  const [payments, delivery] = await Promise.all([getPayments(), getDelivery()]);
  const on = payments.filter((p) => p.enabled);
  return {
    names: on.map((p) => p.name),
    prepaid: on.filter((p) => p.kind !== 'cod').map((p) => p.name),
    cod: on.some((p) => p.kind === 'cod'),
    codWith: delivery.methods.filter((m) => m.enabled && codAllowed(m)).map((m) => (m.kind === 'pickup' ? 'pickup at the nursery' : m.name)),
  };
}
