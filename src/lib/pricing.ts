import { PriceBreakdown } from './types';

/**
 * Calculates Indian marketplace price breakdown.
 * - Base Fare = hourlyRate * hours (or capped at dailyRate if >= 6 hours)
 * - Platform Convenience Fee = 10% of Base Fare (paid by driver)
 * - GST on Convenience Fee = 18% of Convenience Fee (statutory Indian GST)
 * - Total Driver Payable = Base Fare + Convenience Fee + GST
 * - Platform Host Commission = 10% deducted from Base Fare
 * - Net Host Payout = Base Fare - Host Commission
 */
export function calculatePricing(
  hourlyRate: number,
  dailyRate: number,
  hours: number
): PriceBreakdown {
  const safeHours = Math.max(1, hours);
  
  // Use daily cap if booking duration is 6+ hours and daily rate is less
  let baseFare = hourlyRate * safeHours;
  if (safeHours >= 6 && dailyRate > 0 && dailyRate < baseFare) {
    baseFare = dailyRate;
  }

  // 10% Convenience Fee paid by Driver
  const convenienceFee = Math.round(baseFare * 0.10);
  
  // 18% GST on the convenience fee
  const gstOnFee = Math.round(convenienceFee * 0.18 * 100) / 100;
  
  // Total paid by Driver
  const totalAmount = Math.round((baseFare + convenienceFee + gstOnFee) * 100) / 100;

  // 10% Commission taken from Host
  const hostCommission = Math.round(baseFare * 0.10);
  const hostPayout = baseFare - hostCommission;

  return {
    hours: safeHours,
    baseFare,
    convenienceFee,
    gstOnFee,
    totalAmount,
    hostPayout,
    platformTakeRate: convenienceFee + hostCommission,
  };
}

/**
 * Formats a currency amount in Indian Rupees (₹)
 */
export function formatINR(amount: number): string {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 1,
  }).format(amount);
}
