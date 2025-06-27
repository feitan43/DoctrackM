export const getQuarter = (month) => {
  if (month >= 1 && month <= 3) return '1st Quarter';
  if (month >= 4 && month <= 6) return '2nd Quarter';
  if (month >= 7 && month <= 9) return '3rd Quarter';
  if (month >= 10 && month <= 12) return '4th Quarter';
  return null;
};