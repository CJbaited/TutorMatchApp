import React, { useState } from 'react';
import { View, Text, StyleSheet, TextInput, TouchableOpacity, FlatList, SafeAreaView, KeyboardAvoidingView, Platform } from 'react-native';
import { Send } from 'lucide-react-native';
import { colors } from '../theme/Theme';
import { useChat } from '../context/ChatContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const ChatScreen = ({ route }) => {
  const { conversationId, participantId } = route.params;
  const [newMessage, setNewMessage] = useState('');
  const { messages, addMessage } = useChat();
  const insets = useSafeAreaInsets();

  const handleSend = () => {
    if (newMessage.trim()) {
      const message = {
        id: Date.now().toString(),
        senderId: 1, // Current user ID (you should get this from auth context)
        receiverId: participantId,
        text: newMessage.trim(),
        timestamp: new Date(),
      };
      addMessage(conversationId, message);
      setNewMessage('');
    }
  };

  return (
    <KeyboardAvoidingView 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { paddingBottom: insets.bottom }]}
    >
      <SafeAreaView style={{ flex: 1 }}>
        <FlatList
          data={messages[conversationId] || []}
          keyExtractor={(item) => item.id}
          renderItem={({ item }) => (
            <View
              style={[
                styles.messageBubble,
                item.senderId === 1 ? styles.sentMessage : styles.receivedMessage,
              ]}
            >
              <Text style={styles.messageText}>{item.text}</Text>
            </View>
          )}
        />
        <View style={[styles.inputContainer, { paddingBottom: route.params?.fromProfile ? 20 : 0 }]}>
          <TextInput
            style={styles.input}
            value={newMessage}
            onChangeText={setNewMessage}
            placeholder="Type a message..."
            multiline
          />
          <TouchableOpacity style={styles.sendButton} onPress={handleSend}>
            <Send size={24} color={colors.primary} />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
  },
  messageBubble: {
    maxWidth: '80%',
    padding: 12,
    borderRadius: 16,
    marginVertical: 4,
    marginHorizontal: 8,
  },
  sentMessage: {
    alignSelf: 'flex-end',
    backgroundColor: colors.primary,
  },
  receivedMessage: {
    alignSelf: 'flex-start',
    backgroundColor: colors.secondary,
  },
  messageText: {
    color: '#000',
    fontSize: 16,
  },
  inputContainer: {
    flexDirection: 'row',
    marginBottom: 24,
    paddingHorizontal: 18,
    paddingVertical: 12,
    alignItems: 'center',
    borderTopWidth: 1,
    borderTopColor: '#eee',
    //minHeight: 100, // Add fixed height
    backgroundColor: '#fff',
    paddingBottom: Platform.OS === 'ios' ? 25 : 12,
  },
  input: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 8,
    marginRight: 8,
    maxHeight: 80, // Limit max height
    minHeight: 40, // Set minimum height
  },
  sendButton: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 20,
  },
});

export default ChatScreen;
