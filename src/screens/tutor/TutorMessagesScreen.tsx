import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert,
  ActivityIndicator,
  AppState,
  Platform
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { format } from 'date-fns';
import supabase from '../../services/supabase';
import * as Notifications from 'expo-notifications';
import { setBadgeCountSafely, setupNotifications, scheduleLocalNotification } from '../../utils/notifications';
import { useChat } from '../../contexts/ChatContext';  

const TutorMessagesScreen = () => {
  const { activeConversationId } = useChat();
  const [loading, setLoading] = useState(true);
  const [conversations, setConversations] = useState([]);
  const navigation = useNavigation();

  useEffect(() => {
    fetchConversations();
    setupMessageSubscription();

    const subscription = AppState.addEventListener('change', handleAppStateChange);
    setupNotifications();
    
    return () => {
      supabase.removeAllChannels();
      subscription.remove();
    };
  }, []);

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to real-time updates for the conversations table
      const conversationsSubscription = supabase
        .channel('tutor-conversations-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `tutor_id=eq.${user.id}`,
        }, () => {
          // Refresh conversations when any change occurs
          fetchConversationsData();
        })
        .subscribe();

      // Initial fetch
      fetchConversationsData();

      return () => {
        supabase.removeChannel(conversationsSubscription);
      };
    } catch (error) {
      console.error('Error in conversations setup:', error);
    }
  };

  const fetchConversationsData = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          tutor_id,
          updated_at,
          tutor_unread_count,
          last_message,
          student_id,
          profiles:student_id(
            name,
            image_url
          )
        `)
        .eq('tutor_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = conversationsData.map(conv => ({
        id: conv.id,
        studentId: conv.student_id,
        studentName: conv.profiles?.name || 'Unknown Student',
        studentImage: conv.profiles?.image_url,
        lastMessage: conv.last_message || 'Start a conversation',
        updatedAt: conv.updated_at,
        unreadCount: conv.tutor_unread_count || 0
      }));

      setConversations(formattedConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      fetchConversations();
    }
  };

  const setupMessageSubscription = () => {
    return supabase
      .channel('tutor-messages-channel')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'messages'
      }, async (payload) => {
        if (payload.new) {
          const { data: { user } } = await supabase.auth.getUser();
          if (!user) return;

          const conversationId = payload.new.conversation_id;
          const isMessageFromOther = payload.new.sender_id !== user.id;

          // Don't update unread count if users are actively chatting
          if (isMessageFromOther && activeConversationId !== conversationId) {
            // Fetch the updated conversation
            const { data: conversationData } = await supabase
              .from('conversations')
              .select(`
                id,
                student_id,
                updated_at,
                tutor_unread_count,
                last_message,
                profiles:student_id(
                  name,
                  image_url
                )
              `)
              .eq('id', conversationId)
              .single();

            if (conversationData) {
              setConversations(prevConversations => {
                const updatedConversations = prevConversations.map(conv => {
                  if (conv.id === conversationId) {
                    return {
                      ...conv,
                      lastMessage: payload.new.text,
                      updatedAt: payload.new.created_at,
                      unreadCount: conversationData.tutor_unread_count || 0
                    };
                  }
                  return conv;
                });
                
                return [...updatedConversations].sort((a, b) => 
                  new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
                );
              });

              // Update badge count only if not in active conversation
              if (activeConversationId !== conversationId) {
                const totalUnread = conversations.reduce((acc, conv) => acc + conv.unreadCount, 0);
                await setBadgeCountSafely(totalUnread);

                await scheduleLocalNotification(
                  `New message from ${conversationData.profiles?.name || 'Unknown Student'}`,
                  payload.new.text,
                  activeConversationId,
                  conversationId
                );
              }
            }
          }
        }
      })
      .subscribe();
  };

  const handleConversationOpen = async (conversationId, studentId, studentName) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .update({ tutor_unread_count: 0 })
        .eq('id', conversationId);

      if (error) throw error;

      // Update local state
      setConversations(prevConversations =>
        prevConversations.map(conv =>
          conv.id === conversationId ? { ...conv, unreadCount: 0 } : conv
        )
      );

      // Navigate to chat
      navigation.navigate('Chat', {
        conversationId: conversationId,
        participantId: studentId,
        participantName: studentName
      });
    } catch (error) {
      console.error('Error resetting unread count:', error);
      Alert.alert('Error', 'Failed to open conversation');
    }
  };

  const renderChatItem = ({ item }) => (
    <TouchableOpacity 
      style={styles.chatItem}
      onPress={() => handleConversationOpen(item.id, item.studentId, item.studentName)}
    >
      <View style={styles.avatar}>
        {item.studentImage ? (
          <Image 
            source={{ uri: item.studentImage }} 
            style={styles.avatarImage} 
          />
        ) : (
          <Text style={styles.avatarText}>
            {item.studentName.charAt(0).toUpperCase()}
          </Text>
        )}
      </View>
      <View style={styles.chatInfo}>
        <View style={styles.chatHeader}>
          <Text style={styles.studentName}>{item.studentName}</Text>
          <Text style={styles.timestamp}>
            {format(new Date(item.updatedAt), 'MMM d, h:mm a')}
          </Text>
        </View>
        <View style={styles.messageRow}>
          <Text style={styles.lastMessage} numberOfLines={1}>
            {item.lastMessage}
          </Text>
          {item.unreadCount > 0 && (
            <View style={styles.unreadBadge}>
              <Text style={styles.unreadCount}>{item.unreadCount}</Text>
            </View>
          )}
        </View>
      </View>
    </TouchableOpacity>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#084843" />
      </View>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>
      
      <FlatList
        data={conversations}
        renderItem={renderChatItem}
        keyExtractor={item => item.id}
        ListEmptyComponent={
          <View style={styles.emptyState}>
            <Text style={styles.emptyStateText}>No messages yet</Text>
          </View>
        }
      />
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  header: {
    padding: 16,
    backgroundColor: '#FFF',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: '#333',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  searchIcon: {
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
  },
  chatItem: {
    flexDirection: 'row',
    padding: 16,
    backgroundColor: '#FFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E0E0E0',
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#084843',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: '#FFF',
    fontSize: 20,
    fontWeight: '600',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginLeft: 12,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  studentName: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  timestamp: {
    fontSize: 12,
    color: '#666',
  },
  messageRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: '#666',
  },
  unreadBadge: {
    backgroundColor: '#084843',
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8,
    paddingHorizontal: 8,
  },
  unreadCount: {
    color: '#FFF',
    fontSize: 12,
    fontWeight: '600',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: '#666',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
});

export default TutorMessagesScreen;
