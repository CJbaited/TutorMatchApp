import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  FlatList, 
  TouchableOpacity, 
  Image,
  Alert,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useChat } from '../context/ChatContext';
import { useNavigation } from '@react-navigation/native';
import supabase from '../services/supabase';
import { Swipeable } from 'react-native-gesture-handler';
import { Trash2 } from 'lucide-react-native';
import { format } from 'date-fns';

const MessagesScreen = () => {
  const [loading, setLoading] = useState(true);
  const { conversations, addConversation, deleteConversation } = useChat();
  const navigation = useNavigation();

  useEffect(() => {
    fetchConversations();
    const subscription = setupMessageSubscription();
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
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

          // Fetch the updated conversation to get all current data
          const { data: updatedConv } = await supabase
            .from('conversations')
            .select(`
              id,
              tutor_id,
              updated_at,
              unread_count,
              tutors:tutors!inner(
                name,
                image_url
              )
            `)
            .eq('id', conversationId)
            .single();

          if (updatedConv) {
            addConversation({
              id: updatedConv.id,
              participant_id: updatedConv.tutor_id,
              participant_name: updatedConv.tutors.name,
              participant_image: updatedConv.tutors.image_url,
              last_message: payload.new.text,
              updated_at: payload.new.created_at,
              unread_count: isMessageFromOther ? (updatedConv.unread_count || 0) + 1 : updatedConv.unread_count
            });
          }
        }
      })
      .subscribe();
  };

  const fetchConversations = async () => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { data: conversationsData, error } = await supabase
        .from('conversations')
        .select(`
          id,
          tutor_id,
          updated_at,
          unread_count,
          tutors:tutors!inner(
            name,
            image_url
          ),
          messages(
            id,
            text,
            created_at,
            sender_id
          )
        `)
        .eq('student_id', user.id)
        .order('updated_at', { ascending: false });

      if (error) throw error;

      const formattedConversations = conversationsData.map(conv => {
        // Sort messages by created_at to get the latest message
        const sortedMessages = conv.messages.sort((a, b) => 
          new Date(b.created_at).getTime() - new Date(a.created_at).getTime()
        );

        return {
          id: conv.id,
          participant_id: conv.tutor_id,
          participant_name: conv.tutors?.name || 'Unknown Tutor',
          participant_image: conv.tutors?.image_url,
          last_message: sortedMessages[0]?.text || 'Start a conversation',
          updated_at: conv.updated_at,
          unread_count: conv.unread_count || 0
        };
      });

      formattedConversations.forEach(conv => addConversation(conv));
      setLoading(false);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      setLoading(false);
    }
  };

  const handleConversationOpen = async (conversationId, participantId, participantName) => {
    try {
      // Reset unread count
      const { error } = await supabase
        .from('conversations')
        .update({ unread_count: 0 })
        .eq('id', conversationId);

      if (error) throw error;

      // Update local state
      const updatedConv = conversations.find(c => c.id === conversationId);
      if (updatedConv) {
        addConversation({
          ...updatedConv,
          unread_count: 0
        });
      }

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