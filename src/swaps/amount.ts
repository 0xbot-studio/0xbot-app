export const native = "0x0000000000000000000000000000000000000000";
export const addressPattern = /^0x[0-9a-fA-F]{40}$/;
export const hashPattern = /^0x[0-9a-fA-F]{64}$/;
export function toUnits(amount: string, decimals: number) {
  if (
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 36 ||
    amount.length > 120 ||
    !/^\d+(\.\d+)?$/.test(amount)
  )
    throw new Error("swap_amount");
  const [whole, fraction = ""] = amount.split(".");
  if (fraction.length > decimals) throw new Error("swap_precision");
  const units = BigInt(whole + fraction.padEnd(decimals, "0"));
  if (units <= 0n || units >= 2n ** 256n) throw new Error("swap_amount");
  return units.toString();
}
