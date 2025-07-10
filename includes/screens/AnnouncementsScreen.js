import React, { useState, useRef } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
    Modal,
    Pressable
} from 'react-native';

const mockAnnouncements = [
    {
        id: '1',
        title: 'Welcome to the Team!',
        content: 'We are thrilled to welcome our new members starting this week. Please make them feel at home!',
        authorId: 'mockUser123',
        timestamp: new Date(2025, 6, 8, 10, 30),
    },
    {
        id: '2',
        title: 'Upcoming Holiday Schedule',
        content: 'Please note the office will be closed on July 15th for the national holiday. Ensure all urgent tasks are completed by July 14th.',
        authorId: 'adminUser456',
        timestamp: new Date(2025, 6, 5, 14, 0),
    },
    {
        id: '3',
        title: 'Project Alpha Kick-off',
        content: 'The Project Alpha kick-off meeting is scheduled for July 12th at 9:00 AM in Conference Room B. All team leads must attend.',
        authorId: 'projectManager789',
        timestamp: new Date(2025, 6, 3, 9, 0),
    },
];

const AnnouncementsScreen = () => {
    const [userId, setUserId] = useState('mockCurrentUser1');
    const [announcements, setAnnouncements] = useState(mockAnnouncements);
    const [newAnnouncementTitle, setNewAnnouncementTitle] = useState('');
    const [newAnnouncementContent, setNewAnnouncementContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState(null);
    const [isMessageModalVisible, setIsMessageModalVisible] = useState(false);
    const messageTimeoutRef = useRef(null);

    const showMessage = (msg) => {
        setMessage(msg);
        setIsMessageModalVisible(true);
        if (messageTimeoutRef.current) {
            clearTimeout(messageTimeoutRef.current);
        }
        messageTimeoutRef.current = setTimeout(() => {
            setIsMessageModalVisible(false);
            setMessage(null);
        }, 3000);
    };

    const handleCreateAnnouncement = () => {
        if (!newAnnouncementTitle.trim() || !newAnnouncementContent.trim()) {
            showMessage("Title and Content cannot be empty.");
            return;
        }

        setLoading(true);
        setTimeout(() => {
            const newId = (announcements.length + 1).toString();
            const newAnn = {
                id: newId,
                title: newAnnouncementTitle,
                content: newAnnouncementContent,
                authorId: userId,
                timestamp: new Date(),
            };
            setAnnouncements([newAnn, ...announcements]);
            setNewAnnouncementTitle('');
            setNewAnnouncementContent('');
            showMessage("Announcement created successfully!");
            setLoading(false);
        }, 1000);
    };

    if (false) {
        return (
            <View style={styles.centeredContainer}>
                <ActivityIndicator size="large" color="#0000ff" />
                <Text style={styles.loadingText}>Loading application...</Text>
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <ScrollView contentContainerStyle={styles.scrollViewContent}>
                <View style={styles.userIdContainer}>
                    <Text style={styles.userIdText}>
                        User ID: <Text style={styles.userIdValue}>{userId || 'N/A'}</Text>
                    </Text>
                </View>

                <Text style={styles.header}>Announcements</Text>

                <View style={styles.createAnnouncementSection}>
                    <Text style={styles.sectionTitle}>Create New Announcement</Text>
                    <TextInput
                        placeholder="Announcement Title"
                        style={styles.input}
                        value={newAnnouncementTitle}
                        onChangeText={setNewAnnouncementTitle}
                    />
                    <TextInput
                        placeholder="Announcement Content"
                        style={[styles.input, styles.textArea]}
                        multiline
                        numberOfLines={5}
                        value={newAnnouncementContent}
                        onChangeText={setNewAnnouncementContent}
                    />
                    <TouchableOpacity
                        onPress={handleCreateAnnouncement}
                        style={styles.button}
                        disabled={loading}
                    >
                        <Text style={styles.buttonText}>
                            {loading ? 'Creating...' : 'Publish Announcement'}
                        </Text>
                    </TouchableOpacity>
                </View>

                <View style={styles.announcementsListSection}>
                    <Text style={styles.sectionTitle}>All Announcements</Text>
                    {announcements.length === 0 ? (
                        <View style={styles.noAnnouncementsContainer}>
                            <Text style={styles.noAnnouncementsText}>No announcements yet. Be the first to create one!</Text>
                        </View>
                    ) : (
                        <View style={styles.announcementsContainer}>
                            {announcements.map((announcement) => (
                                <View key={announcement.id} style={styles.announcementCard}>
                                    <Text style={styles.announcementTitle}>{announcement.title}</Text>
                                    <Text style={styles.announcementContent}>{announcement.content}</Text>
                                    <View style={styles.announcementMeta}>
                                        <Text style={styles.announcementMetaText}>
                                            Posted by: <Text style={styles.announcementAuthor}>{announcement.authorId === userId ? 'You' : announcement.authorId}</Text>
                                        </Text>
                                        <Text style={styles.announcementMetaText}>
                                            {announcement.timestamp?.toLocaleString()}
                                        </Text>
                                    </View>
                                </View>
                            ))}
                        </View>
                    )}
                </View>
            </ScrollView>

            <Modal
                animationType="fade"
                transparent={true}
                visible={isMessageModalVisible}
                onRequestClose={() => {
                    setIsMessageModalVisible(!isMessageModalVisible);
                    setMessage(null);
                }}
            >
                <Pressable
                    style={styles.modalOverlay}
                    onPress={() => {
                        setIsMessageModalVisible(false);
                        setMessage(null);
                    }}
                >
                    <View style={styles.modalContent}>
                        <Text style={styles.modalMessage}>{message}</Text>
                        <TouchableOpacity
                            style={styles.modalButton}
                            onPress={() => {
                                setIsMessageModalVisible(false);
                                setMessage(null);
                            }}
                        >
                            <Text style={styles.modalButtonText}>OK</Text>
                        </TouchableOpacity>
                    </View>
                </Pressable>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f3f4f6',
    },
    scrollViewContent: {
        padding: 16,
        paddingBottom: 32,
        alignItems: 'center',
    },
    centeredContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#f3f4f6',
    },
    loadingText: {
        fontSize: 18,
        fontWeight: '600',
        color: '#4b5563',
        marginTop: 10,
    },
    userIdContainer: {
        width: '100%',
        alignItems: 'flex-end',
        marginBottom: 8,
    },
    userIdText: {
        fontSize: 12,
        color: '#4b5563',
    },
    userIdValue: {
        fontFamily: 'monospace',
        color: '#1d4ed8',
    },
    header: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#111827',
        textAlign: 'center',
        marginBottom: 24,
    },
    createAnnouncementSection: {
        width: '100%',
        backgroundColor: '#eff6ff',
        padding: 24,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        marginBottom: 32,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        color: '#1e40af',
        marginBottom: 16,
    },
    input: {
        width: '100%',
        padding: 12,
        marginBottom: 16,
        borderWidth: 1,
        borderColor: '#93c5fd',
        borderRadius: 6,
        backgroundColor: '#fff',
        fontSize: 16,
    },
    textArea: {
        height: 120,
        textAlignVertical: 'top',
    },
    button: {
        width: '100%',
        backgroundColor: '#2563eb',
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
    },
    buttonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: '600',
    },
    announcementsListSection: {
        width: '100%',
    },
    noAnnouncementsContainer: {
        backgroundColor: '#f9fafb',
        padding: 32,
        borderRadius: 8,
        alignItems: 'center',
        justifyContent: 'center',
    },
    noAnnouncementsText: {
        fontSize: 16,
        color: '#4b5563',
        textAlign: 'center',
    },
    announcementsContainer: {
    },
    announcementCard: {
        backgroundColor: '#fff',
        padding: 24,
        borderRadius: 8,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3.84,
        elevation: 5,
        borderWidth: 1,
        borderColor: '#e5e7eb',
        marginBottom: 24,
    },
    announcementTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#111827',
        marginBottom: 8,
    },
    announcementContent: {
        fontSize: 16,
        color: '#374151',
        marginBottom: 12,
    },
    announcementMeta: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderTopWidth: 1,
        borderTopColor: '#e5e7eb',
        paddingTop: 12,
    },
    announcementMetaText: {
        fontSize: 12,
        color: '#6b7280',
    },
    announcementAuthor: {
        fontWeight: '600',
    },
    modalOverlay: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
    },
    modalContent: {
        backgroundColor: 'white',
        borderRadius: 10,
        padding: 20,
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.25,
        shadowRadius: 4,
        elevation: 5,
        width: '80%',
        maxWidth: 300,
    },
    modalMessage: {
        fontSize: 18,
        fontWeight: '600',
        color: '#333',
        marginBottom: 20,
        textAlign: 'center',
    },
    modalButton: {
        backgroundColor: '#3b82f6',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 8,
    },
    modalButtonText: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
    },
});

export default AnnouncementsScreen;
