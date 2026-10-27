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

/** 18% GST is included in the course price. */
export const GST_RATE = 0.18;
export const GST_PERCENT = Math.round(GST_RATE * 100);

const roundToPaise = (value: number) => Math.round(value * 100) / 100;

/** Extract included GST without increasing the payment amount. */
export function applyGst(
  inclusiveAmount: number
): { gstAmount: number; totalWithGst: number } {
  const totalWithGst = roundToPaise(
    Math.max(Number(inclusiveAmount) || 0, 0)
  );
  const gstAmount = roundToPaise(
    (totalWithGst * GST_RATE) / (1 + GST_RATE)
  );

  return { gstAmount, totalWithGst };
}
