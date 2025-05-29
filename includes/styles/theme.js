// theme.js
import {StyleSheet} from 'react-native';

export const COLORS = {
  primary: '#4285F4',
  primaryDark: '#3367D6',
  primaryLight: '#BBDEFB',
  accent: '#0F9D58',
  accentDark: '#0A8043',
  accentLight: '#A7FFEB',
  white: '#FFFFFF',
  black: '#212121',
  lightGrey: '#F5F5F5',
  mediumGrey: '#EEEEEE',
  darkGrey: '#757575',
  success: '#4CAF50',
  warning: '#FFC107',
  danger: '#F44336',
  textPrimary: '#212121',
  textSecondary: '#757575',
  textLight: '#BDBDBD',
  borderColor: '#E0E0E0',
  dividerColor: '#E0E0E0',
  cardBackground: '#FFFFFF', // Still a background, but won't be used for card shape
  headerBackground: '#F0F0F0',
  backgroundLight: '#F8F8F8', // This is the screen background color for a flatter UI
  deleteIconColor: '#F44336',
  iconColor: '#616161',
};

export const SPACING = {
  none: 0,
  xxs: 2,
  xs: 4,
  s: 8,
  m: 16,
  l: 24,
  xl: 32,
  xxl: 40,
};

export const FONT_SIZES = {
  tiny: 10,
  small: 12,
  medium: 14,
  large: 16,
  title: 18,
  header: 20,
  h1: 28,
  h2: 24,
  h3: 20,
};

export const GLOBAL_STYLES = StyleSheet.create({
  // --- Section Container Styles (Renamed from Card Styles to reflect non-card nature) ---
  sectionContainer: {
    // Renamed from cardContainer
    marginVertical: SPACING.m,
    marginHorizontal: SPACING.m,
    backgroundColor: COLORS.white, // Each section will still have its own white background
    // Removed borderWidth, borderColor, borderRadius for a flatter look
  },
  sectionHeader: {
    // Renamed from cardHeader
    //backgroundColor: COLORS.headerBackground,
    paddingVertical: SPACING.s,
    paddingHorizontal: SPACING.s,
    //borderBottomWidth: 1,
    //borderBottomColor: COLORS.borderColor,
    //alignItems: 'center',
    justifyContent: 'center',
  },
  headerText: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,

    //textTransform: 'uppercase',
  },

  // --- List Item Styles (for General Information Card) ---
  listItemContainer: {
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.s,
  },
  listItemInner: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  listItemLabel: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    fontWeight: '300',
    flex: 1,
    marginRight: SPACING.s,
  },
  listItemValue: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    textAlign: 'right',
    fontWeight:'600',
    flex: 1.5,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.dividerColor,
    marginVertical: SPACING.s,
    marginHorizontal: 0,
  },

  // --- Table Styles (for OBR and PR Details Sections) ---
  sectionTable: {
    // Renamed from cardTable
    paddingHorizontal: SPACING.s,
    paddingVertical: SPACING.s,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dividerColor,
    backgroundColor: COLORS.backgroundLight,
  },
  tableHeaderText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  tableHeaderTextRight: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    textAlign: 'right',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    //alignItems: 'center',
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
  },
  tableRowLast: {
    borderBottomWidth: 0,
  },
  tableRowMainText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    fontWeight: '600',
  },
  tableRowSubText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textSecondary,
  },
  tableRowEven: {
    backgroundColor: COLORS.cardBackground, // Keep these for row banding
  },
  tableRowOdd: {
    backgroundColor: COLORS.white, // Keep these for row banding
  },
  noDataText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary,
    textAlign: 'center',
    paddingVertical: SPACING.m,
  },
  totalContainer: {
    borderTopWidth: 1,
    borderTopColor: COLORS.dividerColor,
    paddingVertical: SPACING.s,
    alignItems: 'flex-end',
    backgroundColor: COLORS.backgroundLight,
    marginHorizontal: -SPACING.m, // This negates padding of parent and extends total bar to full width
    paddingHorizontal: SPACING.m,
  },
  totalAmountText: {
    fontSize: FONT_SIZES.large,
    fontWeight: 'bold',
    color: COLORS.primary,
  },

  // --- Simple Text Section Content Styles (e.g., Remarks, Pending Note) ---
  simpleTextSectionContent: {
    // Renamed from simpleTextCardContent
    padding: SPACING.m,
  },
  remarksText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.medium * 1.5,
  },
  pendingNoteTextContent: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textPrimary,
    lineHeight: FONT_SIZES.medium * 1.5,
    fontStyle: 'italic',
  },

  // --- Digital Copies Styles ---
  digitalCopiesContent: {
    padding: SPACING.m,
  },
  digitalCopyItem: {
    marginBottom: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.dividerColor,
    paddingBottom: SPACING.s,
  },
  digitalCopyItemLast: {
    borderBottomWidth: 0,
    marginBottom: 0,
    paddingBottom: 0,
  },
  digitalCopyItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: SPACING.xs,
  },
  digitalCopyFormType: {
    fontSize: FONT_SIZES.medium,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
    flex: 1,
    marginRight: SPACING.s,
  },
  buttonSmall: {
    paddingVertical: SPACING.xs,
    paddingHorizontal: SPACING.s,
    borderRadius: 5,
    marginLeft: SPACING.s,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  buttonSmallText: {
    fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
  },
  attachButton: {
    backgroundColor: COLORS.primary,
  },
  attachButtonText: {
    color: COLORS.white,
  },
  removeButton: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.danger,
  },
  disabledButton: {
    opacity: 0.5,
    backgroundColor: COLORS.lightGrey,
    borderColor: COLORS.mediumGrey,
  },
  fileEntry: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: SPACING.xs,
    paddingLeft: SPACING.s,
    marginBottom: SPACING.xs,
    backgroundColor: COLORS.backgroundLight,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: COLORS.mediumGrey,
  },
  fileEntryText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textPrimary,
    flex: 1,
    marginLeft: SPACING.xs,
  },

  // --- Transaction History Styles ---
  transactionHistoryContainer: {
    backgroundColor: COLORS.white,
    paddingHorizontal: SPACING.m,
    paddingBottom: SPACING.m, // Add padding bottom for the whole container
    borderRadius: SPACING.s, // Slightly rounded corners for the whole section
    shadowColor: COLORS.darkGrey,
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2, // Android shadow
    marginVertical: SPACING.m,
    marginHorizontal: SPACING.m,
  },
  transactionHeaderWrapper: {
    paddingVertical: SPACING.s,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderColor,
    marginBottom: SPACING.s,
  },
  transactionHeaderText: {
    fontSize: FONT_SIZES.title,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
   transactionListContainer: {
    // This view wraps the table content, applying consistent horizontal padding
    paddingHorizontal: SPACING.xxs,
  },
  transactionListHeader: {
    flexDirection: 'row',
    paddingVertical: SPACING.s,
    backgroundColor: COLORS.lightGrey, // More distinct header background // Removed borderRadius here, will be handled by the parent container if needed
    marginBottom: SPACING.s,
    alignItems: 'center',
    paddingHorizontal: SPACING.s, // Add horizontal padding for column alignment
  },
  transactionListHeaderText: {
      fontSize: FONT_SIZES.small,
    fontWeight: 'bold',
    color: COLORS.textPrimary,
  },
  transactionRow: {
    flexDirection: 'row',
    paddingVertical: SPACING.s,
    alignItems: 'center',
    minHeight: 40,
    paddingHorizontal: SPACING.s, // Consistent horizontal padding for rows
  },
  transactionRowEven: {
    backgroundColor: COLORS.tableRowEven, // Lighter background for even rows
  },
  transactionRowOdd: {
    backgroundColor: COLORS.tableRowOdd, // White for odd rows
  },
  transactionIndexText: {
    fontSize: FONT_SIZES.medium,
    color: COLORS.textSecondary, // A bit softer color for index
    textAlign: 'center',
    fontWeight: 'normal',
  },
  transactionDateText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textPrimary,
    textAlign: 'center',
    fontWeight: '300', // Slightly bolder for date
  },
  transactionStatusText: {
    fontSize: FONT_SIZES.medium,
    fontWeight: '500', // Make status text more prominent
    textAlign: 'center',
    // We'll use a dynamic style for status color directly in the component
    // Example usage in component: style={{ color: getStatusColor(item.Status) }}
  },
  // Define specific status colors
  statusCompleted: {
    color: COLORS.statusCompleted,
  },
  statusPending: {
    color: COLORS.statusPending,
  },
  statusFailed: {
    color: COLORS.statusFailed,
  },
  transactionCompletionText: {
    fontSize: FONT_SIZES.small,
    color: COLORS.textPrimary,
    textAlign: 'right',
    paddingRight: SPACING.xs, // Slightly less padding for a tighter look
    fontWeight: '400',
  },
  descriptionToggleIcon: {
    marginLeft: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.dividerColor, // Adjust margin here for better flow within the list items
    marginVertical: SPACING.xxs, // Smaller vertical margin for dividers within the list
    marginHorizontal: 0,
  },
  // No data text
  noTransactionDataText: {
    textAlign: 'center',
    color: COLORS.textSecondary,
    fontSize: FONT_SIZES.medium,
    paddingVertical: SPACING.m,
    fontStyle: 'italic',
  },
  descriptionToggleIcon: {
    marginLeft: SPACING.xs,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.dividerColor,
    marginVertical: SPACING.s,
    marginHorizontal: 0,
  },
});
