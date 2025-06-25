import {Dimensions} from 'react-native';

export const formatFileSize = size => {
  if (!size) return '0 KB';
  if (size < 1024 * 1024) return (size / 1024).toFixed(2) + ' KB';
  return (size / (1024 * 1024)).toFixed(2) + ' MB';
};

export const getQuarter = month => {
  if (month >= 1 && month <= 3) return '1st Quarter';
  if (month >= 4 && month <= 6) return '2nd Quarter';
  if (month >= 7 && month <= 9) return '3rd Quarter';
  if (month >= 10 && month <= 12) return '4th Quarter';
  return null;
};

export const years = Array.from(
  {length: Math.max(0, new Date().getFullYear() - 2023 + 1)},
  (_, index) => new Date().getFullYear() - index,
);

export const currentYear = new Date().getFullYear();

export const {width, height} = Dimensions.get('window');

export const removeHtmlTags = text => {
  if (!text) return '';
  const boldEndRegex = /<\/b>/g;
  const newText = text.replace(boldEndRegex, '</b>\n');
  const htmlRegex = /<[^>]*>/g;
  return newText.replace(htmlRegex, ' ');
};

  export const formatDateTime = text => {
  const date = new Date(text);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // 0 -> 12

  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  return `${year}-${month}-${day} ${formattedTime}`;
};


