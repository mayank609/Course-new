export type CoursePricing = {
  price: number;
  originalPrice: number;
  discountPercent: number;
  savings: number;
  hasDiscount: boolean;
};

/**
 * Calculates standard offer price, original (MRP / cut) price, discount percentage,
 * and savings difference for course display across the application.
 */
export function getCoursePricing(price: number = 0, originalPrice?: number): CoursePricing {
  const offer = Number(price) || 0;
  let original = originalPrice ? Number(originalPrice) : 0;

  // If no original price is explicitly provided and course has a price,
  // generate a sensible standard market price tier so discount is always attractive
  if ((!original || original <= offer) && offer > 0) {
    if (offer <= 299) {
      original = 1499;
    } else if (offer <= 499) {
      original = 1999;
    } else if (offer <= 999) {
      original = 3499;
    } else if (offer <= 1499) {
      original = 4499;
    } else {
      original = Math.round((offer * 2.5) / 100) * 100 - 1;
    }
  }

  const hasDiscount = original > offer && offer > 0;
  const savings = hasDiscount ? original - offer : 0;
  const discountPercent = hasDiscount ? Math.round((savings / original) * 100) : 0;

  return {
    price: offer,
    originalPrice: original,
    discountPercent,
    savings,
    hasDiscount,
  };
}

/** GST charged on every course purchase (18%). */
export const GST_RATE = 0.18;
export const GST_PERCENT = Math.round(GST_RATE * 100);

const roundToPaise = (value: number) => Math.round(value * 100) / 100;

/**
 * Adds 18% GST on top of a (post-discount) taxable amount. Shared by the
 * checkout UI and the payment API so the displayed total always matches
 * what the gateway charges.
 */
export function applyGst(taxableAmount: number): { gstAmount: number; totalWithGst: number } {
  const base = Math.max(Number(taxableAmount) || 0, 0);
  const gstAmount = roundToPaise(base * GST_RATE);
  return { gstAmount, totalWithGst: roundToPaise(base + gstAmount) };
}
