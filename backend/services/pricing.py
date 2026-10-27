from typing import Dict, Any

def calculate_pricing(hourly_rate: float, daily_rate: float, hours: int) -> Dict[str, Any]:
    """
    Computes Indian marketplace pricing:
    - Base Fare = hourly_rate * hours (or capped at daily_rate for >= 6 hours)
    - Platform Convenience Fee = 10% of Base Fare
    - Statutory GST on Convenience Fee = 18% of Convenience Fee
    - Total Amount Paid by Driver = Base Fare + Convenience Fee + GST
    - Host Commission = 10% deducted from Base Fare
    - Net Host Payout = Base Fare - Host Commission
    """
    safe_hours = max(1, hours)
    base_fare = hourly_rate * safe_hours

    if safe_hours >= 6 and 0 < daily_rate < base_fare:
        base_fare = daily_rate

    convenience_fee = round(base_fare * 0.10, 2)
    gst_on_fee = round(convenience_fee * 0.18, 2)
    total_amount = round(base_fare + convenience_fee + gst_on_fee, 2)
    host_commission = round(base_fare * 0.10, 2)
    host_payout = round(base_fare - host_commission, 2)

    return {
        "hours": safe_hours,
        "base_fare": base_fare,
        "convenience_fee": convenience_fee,
        "gst_on_fee": gst_on_fee,
        "total_amount": total_amount,
        "host_payout": host_payout,
        "platform_take_rate": round(convenience_fee + host_commission, 2),
    }
