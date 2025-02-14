import React, { useState, useRef, useEffect } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import  supabase  from '../services/supabase';

const ChatScreen = ({ route }) => {
  const { conversationId, participantId, participantName } = route.params;
  const [messages, setMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [loading, setLoading] = useState(true);
  const flatListRef = useRef(null);
  const inputHeight = useRef(new Animated.Value(40)).current;
  const [user, setUser] = useState(null);
  const initialScrollDone = useRef(false);

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
    };
    fetchUser();
  }, []);

  useEffect(() => {
    fetchMessages();
    const subscription = subscribeToMessages();
    resetUnreadCount(); // Reset count when entering chat
    
    return () => {
      if (subscription) {
        supabase.removeChannel(subscription);
      }
    };
  }, [conversationId]);

  const fetchMessages = async () => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      setMessages(data || []);
      
      // Scroll to bottom after messages are loaded
      setTimeout(() => {
        if (!initialScrollDone.current && flatListRef.current) {
          flatListRef.current.scrollToEnd({ animated: false });
          initialScrollDone.current = true;
        }
      }, 100);
    } catch (error) {
      console.error('Error fetching messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const subscribeToMessages = () => {
    return supabase
      .channel(`room:${conversationId}`)
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'messages',
        filter: `conversation_id=eq.${conversationId}`
      }, async (payload) => {
        // Only update messages display
        setMessages(current => [...current, payload.new]);
        flatListRef.current?.scrollToEnd();
      })
      .subscribe();
  };

  const handleSend = async () => {
    if (!newMessage.trim()) return;

    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) return;

      const { error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId, // Ensure this is a UUID
          sender_id: user.id,
          text: newMessage.trim(),
          created_at: new Date().toISOString(),
          read: false
        });

      if (error) throw error;
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
    } catch (error) {
      console.error('Error sending message:', error);
    }
  };

  const handleContentSizeChange = (event) => {
    const { height } = event.nativeEvent.contentSize;
    const newHeight = Math.min(Math.max(40, height), 100);
    Animated.timing(inputHeight, {
      toValue: newHeight,
      duration: 100,
      useNativeDriver: false,
    }).start();
  };

  const formatTime = (date) => {
    return new Date(date).toLocaleTimeString([], { 
      hour: '2-digit', 
      minute: '2-digit'
    });
  };

  // Add resetUnreadCount function
  const resetUnreadCount = async () => {
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

      // Reset unread count when opening chat
      await supabase
        .from('conversations')
        .update({ [updateColumn]: 0 })
        .eq('id', conversationId);
    } catch (error) {
      console.error('Error resetting unread count:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onContentSizeChange={() => {
            if (flatListRef.current) {
              flatListRef.current.scrollToEnd({ animated: false });
            }
          }}
          onLayout={() => {
            if (flatListRef.current && !initialScrollDone.current) {
              flatListRef.current.scrollToEnd({ animated: false });
              initialScrollDone.current = true;
            }
          }}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.sender_id === user?.id ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={[
                styles.messageText,
                item.sender_id === user?.id ? styles.sentMessageText : styles.receivedMessageText
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.timestamp,
                item.sender_id === user?.id ? styles.sentTimestamp : styles.receivedTimestamp
              ]}>
                {formatTime(item.timestamp)}
              </Text>
            </View>
          )}
        />

        <View style={styles.inputContainer}>
          <Animated.View style={[styles.inputWrapper, { height: inputHeight }]}>
            <TextInput
              style={styles.input}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="Type a message..."
              multiline
              onContentSizeChange={handleContentSizeChange}
              placeholderTextColor="#999"
            />
            <TouchableOpacity 
              style={[styles.sendButton, newMessage.trim() ? styles.sendButtonActive : null]}
              onPress={handleSend}
              disabled={!newMessage.trim()}
            >
              <Send size={24} color={newMessage.trim() ? colors.primary : '#999'} />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8F9FA',
  },
  keyboardView: {
    flex: 1,
  },
  messagesList: {
    padding: 16,
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
    borderBottomRightRadius: 4,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: '#FFF',
    borderBottomLeftRadius: 4,
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
      },
      android: {
        elevation: 2,
      },
    }),
  },
  messageText: {
    fontSize: 16,
    marginBottom: 4,
    lineHeight: 20,
  },
  sentMessageText: {
    color: '#FFF',
  },
  receivedMessageText: {
    color: '#333',
  },
  timestamp: {
    fontSize: 11,
    alignSelf: 'flex-end',
  },
  sentTimestamp: {
    color: 'rgba(255,255,255,0.7)',
  },
  receivedTimestamp: {
    color: 'rgba(0,0,0,0.5)',
  },
  inputContainer: {
    borderTopWidth: 1,
    borderTopColor: '#E5E5E5',
    backgroundColor: '#FFF',
    paddingTop: 10,
    paddingBottom: 20, 
    marginBottom: 8,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 2,
  },
  input: {
    flex: 1,
    backgroundColor: '#F0F0F0',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginRight: 8,
    fontSize: 16,
    maxHeight: 100,
    color: '#333',
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#F0F0F0',
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonActive: {
    backgroundColor: '#E8F5E9',
  }
});

export default ChatScreen;
