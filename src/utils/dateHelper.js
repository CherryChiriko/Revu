export const getUserTimezone = () =>
  Intl.DateTimeFormat().resolvedOptions().timeZone || "UTC";

export const getLocalDateKey = (
  date = new Date(),
  timeZone = getUserTimezone(),
) => {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(date);

  const byType = Object.fromEntries(
    parts.map((part) => [part.type, part.value]),
  );
  return `${byType.year}-${byType.month}-${byType.day}`;
};

export const getTodayISO = (timeZone = getUserTimezone()) =>
  getLocalDateKey(new Date(), timeZone);

export const addDaysToDateKey = (dateKey, amount) => {
  const [year, month, day] = dateKey.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day + amount));
  const nextYear = date.getUTCFullYear();
  const nextMonth = String(date.getUTCMonth() + 1).padStart(2, "0");
  const nextDay = String(date.getUTCDate()).padStart(2, "0");
  return `${nextYear}-${nextMonth}-${nextDay}`;
};
