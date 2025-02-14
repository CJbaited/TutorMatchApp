import React, { createContext, useState, useContext, useEffect } from 'react';
import supabase from '../services/supabase';

interface Message {
  id: string;
  conversation_id: string;
  sender_id: string;
  text: string;
  timestamp: string;
  read: boolean;
}

interface Conversation {
  id: string;
  participant_id: string;
  participant_name: string;
  last_message?: string;
  unread_count: number;
  updated_at: string;
  participant_image?: string;
}

interface ChatContextType {
  conversations: Conversation[];
  messages: { [conversationId: string]: Message[] };
  addConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: string, text: string) => Promise<void>;
  markAsRead: (conversationId: string) => Promise<void>;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});

  const addConversation = (conversation: Conversation) => {
    setConversations(prev => {
      const existingIndex = prev.findIndex(conv => conv.id === conversation.id);
      if (existingIndex >= 0) {
        const updated = [...prev];
        updated[existingIndex] = conversation;
        return updated;
      }
      return [...prev, conversation];
    });
  };

  // Add real-time subscription for messages
  useEffect(() => {
    const channel = supabase
      .channel('messages')
      .on('postgres_changes', { 
        event: 'INSERT',
        schema: 'public',
        table: 'messages'
      }, handleNewMessage)
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  }, []);

  const handleNewMessage = async (payload: any) => {
    const { new: message } = payload;
    
    setMessages(prev => ({
      ...prev,
      [message.conversation_id]: [
        ...(prev[message.conversation_id] || []),
        message
      ]
    }));

    setConversations(prev =>
      prev.map(conv =>
        conv.id === message.conversation_id
          ? {
              ...conv,
              last_message: message.text,
              updated_at: message.created_at,
              unread_count: conv.unread_count + 1
            }
          : conv
      )
    );
  };

  const addMessage = async (conversationId: string, text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // First update the conversation's last message
      await supabase
        .from('conversations')
        .update({
          last_message: text,
          updated_at: new Date().toISOString()
        })
        .eq('id', conversationId);

      // Then insert the new message
      const { data, error } = await supabase
        .from('messages')
        .insert({
          conversation_id: conversationId,
          sender_id: user.id,
          text,
          created_at: new Date().toISOString(),
          read: false
        })
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  };

  const fetchMessages = async (conversationId: string) => {
    try {
      const { data, error } = await supabase
        .from('messages')
        .select('*')
        .eq('conversation_id', conversationId)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error fetching messages:', error);
      throw error;
    }
  };

  const markAsRead = async (conversationId: string) => {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { error } = await supabase
      .from('messages')
      .update({ read: true })
      .eq('conversation_id', conversationId)
      .neq('sender_id', user.id);

    if (error) throw error;

    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? { ...conv, unread_count: 0 }
          : conv
      )
    );
  };

  return (
    <ChatContext.Provider value={{
      conversations,
      messages,
      addConversation,
      addMessage,
      markAsRead
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (!context) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
