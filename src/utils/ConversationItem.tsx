import React from 'react';
import { View, Text, TouchableOpacity, Image, StyleSheet } from 'react-native';
import { format } from 'date-fns';

const ConversationItem = ({ conversation, onPress }) => {
  return (
    <TouchableOpacity 
      style={styles.container} 
      onPress={onPress}
    >
      <Image 
        source={{ uri: conversation.participant_image }} 
        style={styles.avatar}
        defaultSource={require('../assets/default-avatar.png')}
      />
      <View style={styles.content}>
        <Text style={styles.name}>{conversation.participant_name}</Text>
        <Text style={styles.message} numberOfLines={1}>
          {conversation.last_message || 'No messages yet'}
        </Text>
      </View>
      <Text style={styles.time}>
        {format(new Date(conversation.updated_at), 'MMM d')}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    padding: 15,
    alignItems: 'center',
    borderBottomWidth: 1,
    borderBottomColor: '#E5E5E5'
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 15
  },
  content: {
    flex: 1
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 4
  },
  message: {
    fontSize: 14,
    color: '#666'
  },
  time: {
    fontSize: 12,
    color: '#999'
  }
});

export default ConversationItem;