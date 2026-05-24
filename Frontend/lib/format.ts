export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    maximumFractionDigits: 0,
  }).format(value);

export const getDiscountedPrice = (
  price: number,
  discountPercentage?: number
) => {
  const safeDiscount = Math.min(Math.max(discountPercentage ?? 0, 0), 100);
  return Math.max(0, price - (price * safeDiscount) / 100);
};

export const formatCompactNumber = (value: number) =>
  new Intl.NumberFormat("en-PK", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);

export const formatDate = (value: string) =>
  new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));

export const toSentenceCase = (value: string) =>
  value
    .replace(/_/g, " ")
    .replace(/\b\w/g, (match) => match.toUpperCase());
