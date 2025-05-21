export const formatFileSize = (size) => {
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

export const getQuarter = (month) => {
  if (month >= 1 && month <= 3) return '1st Quarter';
  if (month >= 4 && month <= 6) return '2nd Quarter';
  if (month >= 7 && month <= 9) return '3rd Quarter';
  if (month >= 10 && month <= 12) return '4th Quarter';
  return null;
};