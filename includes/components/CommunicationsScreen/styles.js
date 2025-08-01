import { StyleSheet } from 'react-native';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  card: {
    flex: 1,
    backgroundColor: '#ffffff',
    borderRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 8,
    overflow: 'hidden',
  },
  header: {
    backgroundColor: '#4a6da7',
    padding: 24,
    paddingBottom: 20,
  },
  headerTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  headerText: {
    color: '#ffffff',
    fontSize: 24,
    fontWeight: '700',
  },
  headerSubtext: {
    color: '#dbe4f5',
    fontSize: 14,
  },
  yearSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
  },
  yearText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  dropdownOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  dropdownContainer: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    width: 200,
    paddingVertical: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5,
  },
  dropdownItem: {
    paddingVertical: 12,
    paddingHorizontal: 16,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownItemSelected: {
    backgroundColor: '#f1f5f9',
  },
  dropdownItemText: {
    fontSize: 16,
    color: '#334155',
  },
  tabNavigation: {
    flexDirection: 'row',
    backgroundColor: '#f1f5f9',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flex: 1,
    paddingVertical: 16,
    position: 'relative',
  },
  tabButtonContent: {
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabButtonActive: {
    backgroundColor: '#ffffff',
  },
  tabButtonInactive: {
    backgroundColor: 'transparent',
  },
  tabButtonText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 6,
  },
  tabButtonTextActive: {
    color: '#4a6da7',
  },
  tabButtonTextInactive: {
    color: '#64748b',
  },
  activeTabIndicator: {
    position: 'absolute',
    bottom: 0,
    left: '25%',
    width: '50%',
    height: 3,
    backgroundColor: '#4a6da7',
    borderRadius: 3,
  },
  contentArea: {
    flex: 1,
    padding: 16,
  },
  sectionHeader: {
    fontSize: 18,
    fontWeight: '700',
    color: '#1e293b',
    marginBottom: 16,
  },
  // Announcement Tab Styles
  announcementContainer: {
    marginBottom: 16,
  },
  announcementCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2,
  },
  urgentCard: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  urgentBadge: {
    position: 'absolute',
    top: 12,
    right: 12,
    backgroundColor: '#fee2e2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  urgentBadgeText: {
    color: '#dc2626',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  announcementHeader: {
    marginBottom: 8,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#1e293b',
  },
  announcementDate: {
    fontSize: 12,
    color: '#64748b',
    marginTop: 2,
  },
  announcementContent: {
    fontSize: 14,
    color: '#475569',
    lineHeight: 20,
    marginBottom: 12,
  },
  readMoreButton: {
    alignSelf: 'flex-start',
    flexDirection: 'row',
    alignItems: 'center',
  },
  readMoreText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: '600',
    marginRight: 4,
  },
  // Forum Tab Styles
  forumContainer: {
    marginBottom: 16,
  },
  forumCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  forumInfo: {
    flex: 1,
  },
  forumTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#1e293b',
    marginBottom: 4,
  },
  forumStatsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
  },
  forumStats: {
    fontSize: 12,
    color: '#64748b',
    marginLeft: 4,
  },
  forumActivity: {
    alignItems: 'flex-end',
  },
  lastPostContainer: {
    marginBottom: 4,
  },
  lastPostLabel: {
    fontSize: 10,
    color: '#64748b',
  },
  lastPostUser: {
    fontSize: 12,
    fontWeight: '600',
    color: '#1e293b',
  },
  lastPostTime: {
    fontSize: 10,
    color: '#94a3b8',
  },
  newPostsBadge: {
    backgroundColor: '#dbe4f5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newPostsText: {
    color: '#4a6da7',
    fontSize: 10,
    fontWeight: '700',
    marginLeft: 4,
  },
  // Message Tab Styles
  messageContainer: {
    marginBottom: 16,
  },
  messageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  composeButton: {
    backgroundColor: '#4a6da7',
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
  },
  composeButtonText: {
    color: '#ffffff',
    fontSize: 14,
    fontWeight: '600',
    marginLeft: 4,
  },
  messageCard: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#e2e8f0',
    flexDirection: 'row',
    position: 'relative',
    overflow: 'hidden',
    alignItems: 'center',
  },
  messageCardUnread: {
    backgroundColor: '#f8fafc',
    borderColor: '#4a6da7',
  },
  newIndicator: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: 4,
    backgroundColor: '#4a6da7',
  },
  messageContent: {
    flex: 1,
    marginRight: 8,
  },
  messageHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  messageSender: {
    fontSize: 14,
    fontWeight: '600',
    color: '#475569',
  },
  unreadText: {
    color: '#1e293b',
    fontWeight: '700',
  },
  messageTime: {
    fontSize: 12,
    color: '#94a3b8',
  },
  messageSubject: {
    fontSize: 15,
    fontWeight: '600',
    color: '#475569',
    marginBottom: 4,
  },
  messagePreview: {
    fontSize: 13,
    color: '#64748b',
    lineHeight: 18,
  },
  messageStatus: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
  },
  messageStatusText: {
    color: '#4a6da7',
    fontSize: 12,
    fontWeight: '600',
    marginLeft: 4,
  },
  // Shared Button Styles
  primaryButton: {
    width: '100%',
    backgroundColor: '#4a6da7',
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: 'center',
    marginTop: 16,
    shadowColor: '#4a6da7',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  primaryButtonText: {
    color: '#ffffff',
    fontSize: 16,
    fontWeight: '600',
    marginRight: 8,
  },
  viewAllButton: {
    alignSelf: 'center',
    paddingVertical: 12,
    paddingHorizontal: 24,
  },
  viewAllButtonText: {
    color: '#4a6da7',
    fontSize: 14,
    fontWeight: '600',
  },
  emptyState: {
    backgroundColor: '#f8fafc',
    padding: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 16,
  },
  emptyStateText: {
    color: '#64748b',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 8,
  },
   headerWithBack: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10, // Adjust as needed
  },
  backButton: {
    paddingRight: 15, // Space between back button and text
    paddingVertical: 5, // Make touchable area larger
  },
  underDevelopmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  underDevelopmentText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#64748b',
    lineHeight: 24,
  },underDevelopmentContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f8fafc',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  underDevelopmentText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 20,
    color: '#64748b',
    lineHeight: 24,
  },
});

export default styles;