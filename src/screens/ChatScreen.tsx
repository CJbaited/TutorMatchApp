import React, { useState, useRef } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, KeyboardAvoidingView, Platform, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Send } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import { useChat } from '../context/ChatContext';

const ChatScreen = ({ route }) => {
  const { conversationId, participantId } = route.params;
  const [newMessage, setNewMessage] = useState('');
  const { messages, addMessage } = useChat();
  const flatListRef = useRef(null);
  const inputHeight = useRef(new Animated.Value(40)).current;

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        senderId: 1, // Current user ID
        receiverId: participantId,
        text: newMessage.trim(),
        timestamp: new Date(),
      };
      addMessage(conversationId, message);
      setNewMessage('');
      flatListRef.current?.scrollToEnd();
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

  return (
    <SafeAreaView style={styles.container} edges={['bottom']}>
      <KeyboardAvoidingView 
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
      >
        <FlatList
          ref={flatListRef}
          data={messages[conversationId] || []}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.messagesList}
          onLayout={() => flatListRef.current?.scrollToEnd()}
          renderItem={({ item }) => (
            <View style={[
              styles.messageBubble,
              item.senderId === 1 ? styles.sentMessage : styles.receivedMessage
            ]}>
              <Text style={[
                styles.messageText,
                item.senderId === 1 ? styles.sentMessageText : styles.receivedMessageText
              ]}>
                {item.text}
              </Text>
              <Text style={[
                styles.timestamp,
                item.senderId === 1 ? styles.sentTimestamp : styles.receivedTimestamp
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
