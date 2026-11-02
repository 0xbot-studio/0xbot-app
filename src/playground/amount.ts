// Exact decimal presentation. Never convert token quantities to JS Number.
export function formatAmount(amount: string, decimals: number): string {
  if (
    !/^\d+$/.test(amount) ||
    !Number.isInteger(decimals) ||
    decimals < 0 ||
    decimals > 255
  )
    return amount;
  const digits = amount.replace(/^0+(?=\d)/, "");
  if (decimals === 0) return digits;
  const padded = digits.padStart(decimals + 1, "0");
  const fraction = padded.slice(-decimals).replace(/0+$/, "");
  return padded.slice(0, -decimals) + (fraction ? "." + fraction : "");
}
