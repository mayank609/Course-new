import { Coupon } from "./models/Coupon";

export class CouponError extends Error {}

export function computeDiscount(
  coupon: { discountType: string; discountValue: number },
  subtotal: number
): number {
  const raw =
    coupon.discountType === "percentage"
      ? (subtotal * coupon.discountValue) / 100
      : coupon.discountValue;
  return Math.min(Math.max(raw, 0), subtotal);
}

export async function validateCoupon(
  code: string,
  { courseSlug, subtotal }: { courseSlug: string; subtotal: number }
): Promise<{ coupon: any; discountAmount: number; finalAmount: number }> {
  const coupon = await Coupon.findOne({ code: code.trim().toUpperCase() });
  if (!coupon) throw new CouponError("Invalid coupon code");
  if (!coupon.active) throw new CouponError("This coupon is no longer active");
  if (coupon.expiresAt && new Date(coupon.expiresAt) < new Date()) {
    throw new CouponError("This coupon has expired");
  }
  if (coupon.maxUses != null && coupon.usedCount >= coupon.maxUses) {
    throw new CouponError("This coupon has reached its usage limit");
  }
  if (coupon.applicableCourseSlugs?.length && !coupon.applicableCourseSlugs.includes(courseSlug)) {
    throw new CouponError("This coupon is not valid for the selected course");
  }
  if (subtotal < (coupon.minOrderAmount || 0)) {
    throw new CouponError(`This coupon requires a minimum order of ₹${coupon.minOrderAmount}`);
  }

  const discountAmount = computeDiscount(coupon, subtotal);
  const finalAmount = Math.max(subtotal - discountAmount, 1);

  return { coupon, discountAmount, finalAmount };
}
