export function isNonEmpty(value) {
  return typeof value === "string" && value.trim().length > 0;
}