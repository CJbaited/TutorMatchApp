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
  activeConversationId: string | null;
  setActiveConversationId: (id: string | null) => void;
}

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: string]: Message[] }>({});
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);

  
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

  // Update the addMessage function
  const addMessage = async (conversationId: string, text: string) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('No authenticated user');

      // Check if user is student or tutor
      const { data: studentProfile } = await supabase
        .from('profiles')
        .select('id')
        .eq('user_id', user.id)
        .single();

      // Insert the new message
      const { data: newMessage, error: messageError } = await supabase
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

      if (messageError) throw messageError;

      // Update conversation last_message and increment unread count
      const rpcFunction = studentProfile 
        ? 'increment_tutor_unread_count' 
        : 'increment_student_unread_count';

      const { error: rpcError } = await supabase
        .rpc(rpcFunction, { conversation_id: conversationId });

      if (rpcError) throw rpcError;

      return newMessage;
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
      markAsRead,
      activeConversationId,
      setActiveConversationId
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
