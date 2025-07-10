import React from 'react';
import {View, Text, ScrollView, StyleSheet, Image} from 'react-native';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';

const AnnouncementCard = ({announcements}) => {
  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <MaterialCommunityIcons
          name="bullhorn-outline"
          size={28}
          color="#5d5d5d"
        />
        <Text style={styles.headerText}>Announcements</Text>
      </View>

      {/* Scrollable Announcement List */}
      <ScrollView
        style={styles.scrollView}
        showsVerticalScrollIndicator={false}>
        {announcements.length === 0 ? (
          <View style={styles.noAnnouncementContainer}>
            <MaterialCommunityIcons
              name="email-open-outline"
              size={64}
              color="#ccc"
            />
            <Text style={styles.noAnnouncementText}>
              No announcements available.
            </Text>
          </View>
        ) : (
          announcements.map(announcement => (
            <View key={announcement.id} style={styles.announcementItem}>
              <Text style={styles.announcementTitle}>{announcement.title}</Text>

              {/* Optional Image */}
              {/* <Image
                source={require('../../assets/images/noImage.jpg')}
                style={styles.announcementImage}
              /> */}

              {/* Recipient office and sender name */}
              <View style={styles.metaContainer}>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons
                    name="office-building"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.metaText}>
                    {announcement.recipientOffice}
                  </Text>
                </View>
                <View style={styles.metaRow}>
                  <MaterialCommunityIcons
                    name="account"
                    size={16}
                    color="#666"
                  />
                  <Text style={styles.metaText}>
                    {announcement.senderName}
                  </Text>
                </View>
              </View>

              <Text style={styles.announcementContent}>
                {announcement.content}
              </Text>
              <Text style={styles.announcementDate}>{announcement.date}</Text>
            </View>
          ))
        )}
      </ScrollView>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    padding: 16,
    marginTop: 15,
    backgroundColor: '#fff',
    borderRadius: 12,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 2},
    shadowOpacity: 0.15,
    shadowRadius: 4,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
    paddingBottom: 12,
    marginBottom: 12,
  },
  headerText: {
    fontFamily: 'Inter_28pt-Bold',
    color: '#5d5d5d',
    fontSize: 18,
    fontWeight: '700',
    marginLeft: 8,
  },
  scrollView: {},
  announcementItem: {
    marginBottom: 20,
    padding: 15,
    borderRadius: 10,
    backgroundColor: '#fefefe',
    borderWidth: 1,
    borderColor: '#e8e8e8',
    shadowColor: '#000',
    shadowOffset: {width: 0, height: 1},
    shadowOpacity: 0.05,
    shadowRadius: 2,
  },
  announcementTitle: {
    fontSize: 16,
    fontWeight: '700',
    color: '#222',
    marginBottom: 6,
  },
  announcementImage: {
    width: '100%',
    height: 150,
    borderRadius: 8,
    marginBottom: 10,
    resizeMode: 'cover',
  },
  announcementDate: {
    fontSize: 13,
    color: '#888',
    marginBottom: 8,
    textAlign: 'right',
  },
  metaContainer: {
    marginBottom: 10,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  metaText: {
    fontSize: 13,
    color: '#555',
    marginLeft: 6,
  },
  announcementContent: {
    fontSize: 15,
    color: '#444',
    lineHeight: 22,
  },
  noAnnouncementContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  noAnnouncementText: {
    marginTop: 10,
    fontSize: 16,
    color: '#999',
  },
});

export default AnnouncementCard;
