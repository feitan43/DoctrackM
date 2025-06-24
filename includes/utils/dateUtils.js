// dateUtils.js

/**
 * Formats a date string into 'Month Day, Year HH:mm AM/PM' format.
 * Can handle 'YYYY-MM-DD HH:mm AM/PM' or ISO strings.
 * @param {string | Date} dateInput - The date string or Date object to format.
 * @returns {string} The formatted date string or 'Invalid Date' if parsing fails.
 */
export const formatDisplayDateTime = (dateInput) => {
  if (!dateInput) return '';

  let date;

  // If already a Date object, use it directly
  if (dateInput instanceof Date) {
    date = dateInput;
  } else {
    // Attempt to parse the string into a Date object
    try {
      // Try direct parsing first
      date = new Date(dateInput);

      // If direct parsing fails or results in an invalid date, attempt manual parsing
      // This handles the specific 'YYYY-MM-DD HH:mm AM/PM' format more robustly
      if (isNaN(date.getTime())) {
          const [datePart, timePart, ampmPart] = String(dateInput).split(' ');
          const [year, month, day] = datePart.split('-').map(Number);
          let [hours, minutes] = timePart.split(':').map(Number);

          if (ampmPart === 'PM' && hours < 12) {
              hours += 12;
          } else if (ampmPart === 'AM' && hours === 12) {
              hours = 0; // 12 AM is midnight (0 hours)
          }

          // Month is 0-indexed in JavaScript Date
          date = new Date(year, month - 1, day, hours, minutes);
      }
    } catch (error) {
      console.error("Error creating Date object from input:", dateInput, error);
      return 'Invalid Date';
    }
  }

  if (isNaN(date.getTime())) {
    console.warn("Could not parse date string for display:", dateInput);
    return 'Invalid Date';
  }

  const options = {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  };
  return date.toLocaleString(undefined, options);
};


/**
 * Formats a Date object into 'YYYY-MM-DD HH:mm AM/PM' format.
 * This is useful for sending data to a backend that expects this specific string format.
 * @param {Date} date - The Date object to format.
 * @returns {string} The formatted date string.
 */
export const formatForSubmission = (date) => {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  let hours = date.getHours();
  const minutes = String(date.getMinutes()).padStart(2, '0');
  
  const ampm = hours >= 12 ? 'PM' : 'AM';
  hours = hours % 12;
  hours = hours ? hours : 12; // The hour '0' should be '12'

  const formattedTime = `${String(hours).padStart(2, '0')}:${minutes} ${ampm}`;
  
  return `${year}-${month}-${day} ${formattedTime}`;
};