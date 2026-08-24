export const COIN_RATE = 20;
export const MIN_COINS_TO_REDEEM = 100;
export const REDEMPTION_VALID_DAYS = 90;

export interface RedeemOption {
  coins: number;
  amount: number;
}

export const REDEEM_OPTIONS: RedeemOption[] = [
  { coins: 100, amount: 2_000 },
  { coins: 250, amount: 5_000 },
  { coins: 500, amount: 10_000 },
  { coins: 1_000, amount: 25_000 },
];

export interface RedemptionRow {
  id: number;
  user_id: string;
  coins: number;
  amount: number;
  coupon_code: string;
  status: "activo" | "usado" | "vencido";
  created_at: string;
  expires_at: string;
}

export function formatRedemptionCode(code: string): string {
  return code.toUpperCase();
}
