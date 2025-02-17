import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert,
  Platform,
  AppState 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import supabase from '../services/supabase';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';
import * as Notifications from 'expo-notifications';
import { setBadgeCountSafely, setupNotifications, scheduleLocalNotification } from '../utils/notifications';

const MessagesScreen = () => {
  const { conversations, addConversation, activeConversationId } = useChat();
  const [loading, setLoading] = useState(true);
  const navigation = useNavigation();

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Subscribe to real-time updates for the conversations table
      const conversationsSubscription = supabase
        .channel('conversations-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'conversations',
          filter: `student_id=eq.${user.id}`,
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
      setLoading(true);
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          tutor_id,
          updated_at,
          student_unread_count,
          last_message,
          tutors:tutors!inner(
            name,
            image_url
          )
        `)
        .eq('student_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = conversationsData.map(conv => ({
        id: conv.id,
        participant_id: conv.tutor_id,
        participant_name: conv.tutors?.name || 'Unknown Tutor',
        participant_image: conv.tutors?.image_url,
        last_message: conv.last_message,
        updated_at: conv.updated_at,
        unread_count: conv.student_unread_count || 0
      }));

      // Use addConversation from context for each conversation
      formattedConversations.forEach(conv => addConversation(conv));
    } catch (error) {
      console.error('Error fetching conversations:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const subscription = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active') {
        fetchConversationsData(); // Refresh data when app comes to foreground
      }
    });

    fetchConversations(); // Initial fetch
    setupNotifications();

    return () => {
      subscription.remove();
      supabase.removeAllChannels();
    };
  }, []);

  const setupMessageSubscription = () => {
    return supabase
      .channel('messages-channel')
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

          // Don't update unread count for own messages
          if (!isMessageFromOther) {
            const existingConv = conversations.find(c => c.id === conversationId);
            if (existingConv) {
              addConversation({
                ...existingConv,
                last_message: payload.new.text,
                updated_at: payload.new.created_at
              });
            }
            return;
          }

          // Handle messages from others
          if (activeConversationId !== conversationId) {
            const { data: conversationData } = await supabase
              .from('conversations')
              .select(`
                id,
                tutor_id,
                updated_at,
                student_unread_count,
                tutors:tutors!inner(
                  name,
                  image_url
                )
              `)
              .eq('id', conversationId)
              .single();

            if (conversationData) {
              addConversation({
                id: conversationData.id,
                participant_id: conversationData.tutor_id,
                participant_name: conversationData.tutors?.name || 'Unknown Tutor',
                participant_image: conversationData.tutors?.image_url,
                last_message: payload.new.text,
                updated_at: payload.new.created_at,
                unread_count: conversationData.student_unread_count || 0
              });
            }
          }
        }
      })
      .subscribe();
  };

  const handleAppStateChange = (nextAppState: string) => {
    if (nextAppState === 'active') {
      fetchConversations(); // Refresh conversations when app comes to foreground
    }
  };

  const handleConversationOpen = async (conversationId: string, participantId: string, participantName: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Reset unread count immediately in local state
      const updatedConv = conversations.find(c => c.id === conversationId);
      if (updatedConv) {
        addConversation({
          ...updatedConv,
          unread_count: 0
        });
      }

      // Reset in database
      const { error } = await supabase
        .from('conversations')
        .update({ student_unread_count: 0 })
        .eq('id', conversationId);

      if (error) throw error;

      // Navigate to chat
      navigation.navigate('Chat', {
        conversationId,
        participantId,
        participantName
      });
    } catch (error) {
      console.error('Error resetting unread count:', error);
      Alert.alert('Error', 'Failed to open conversation');
    }
  };

  const renderRightActions = (conversationId) => {
    return (
      <TouchableOpacity 
        style={styles.deleteAction}
        onPress={() => handleDelete(conversationId)}
      >
        <Trash2 size={24} color="#FFF" />
      </TouchableOpacity>
    );
  };

  const handleDelete = async (conversationId) => {
    try {
      const { error } = await supabase
        .from('conversations')
        .delete()
        .eq('id', conversationId);

      if (error) throw error;
      deleteConversation(conversationId);
    } catch (error) {
      console.error('Error deleting conversation:', error);
      Alert.alert('Error', 'Failed to delete conversation');
    }
  };

  const renderItem = ({ item }) => (
    <Swipeable renderRightActions={() => renderRightActions(item.id)}>
      <TouchableOpacity 
        style={styles.chatCard}
        onPress={() => handleConversationOpen(item.id, item.participant_id, item.participant_name)}
      >
        <Image 
          source={
            item.participant_image 
              ? { uri: item.participant_image }
              : require('../assets/placeholder-person.jpg')
          }
          style={styles.avatar}
        />
        <View style={styles.chatInfo}>
          <View style={styles.chatHeader}>
            <Text style={styles.name}>{item.participant_name}</Text>
            <Text style={styles.time}>
              {format(new Date(item.updated_at), 'MMM d, h:mm a')}
            </Text>
          </View>
          <View style={styles.messageContainer}>
            <Text style={styles.lastMessage} numberOfLines={1}>
              {item.last_message}
            </Text>
            {item.unread_count > 0 && (
              <View style={styles.unreadBadge}>
                <Text style={styles.unreadCount}>{item.unread_count}</Text>
              </View>
            )}
          </View>
        </View>
      </TouchableOpacity>
    </Swipeable>
  );

  const resetUnreadCount = async (conversationId) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      // Check if user is a student or tutor
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      const updateColumn = studentProfile ? 'student_unread_count' : 'tutor_unread_count';

      await supabase
        .from('conversations')
        .update({ [updateColumn]: 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error resetting unread count:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Messages</Text>
      </View>

      <FlatList
        data={conversations}
        keyExtractor={(item) => item.id.toString()}
        contentContainerStyle={styles.listContainer}
        renderItem={renderItem}
        refreshing={loading}
        onRefresh={fetchConversations}
      />
    </SafeAreaView>
  );
};

const colors = {
  textPrimary: '#333',
  textSecondary: '#666',
  primary: '#007BFF',
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
    paddingTop: Platform.OS === 'android' ? 38 : 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    backgroundColor: '#F8F9FA',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '600',
    color: '#333',
  },
  listContainer: {
    padding: 16,
  },
  chatCard: {
    flexDirection: 'row',
    backgroundColor: '#FFF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
      },
      android: {
        elevation: 3,
      },
    }),
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: '#F0F0F0',
  },
  chatInfo: {
    flex: 1,
    marginLeft: 15,
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  name: {
    fontSize: 16,
    fontWeight: 'bold',
    color: colors.textPrimary,
  },
  time: {
    fontSize: 12,
    color: colors.textSecondary,
    marginLeft: 8,
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  lastMessage: {
    flex: 1,
    fontSize: 14,
    color: colors.textSecondary,
    marginRight: 10,
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
  deleteAction: {
    backgroundColor: '#FF4444',
    justifyContent: 'center',
    alignItems: 'center',
    width: 80,
    height: '100%',
    borderTopRightRadius: 12,
    borderBottomRightRadius: 12,
  },
  deleteButton: {
    padding: 8,
    marginLeft: 8,
  }
});

export default MessagesScreen;