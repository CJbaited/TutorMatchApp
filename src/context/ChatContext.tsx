import React, { createContext, useState, useContext } from 'react';

type Message = {
  id: string;
  senderId: number;
  receiverId: number;
  text: string;
  timestamp: Date;
};

type Conversation = {
  id: number;
  participantId: number;
  name: string;
  lastMessage: string;
  time: string;
  unread: number;
  image: any;
};

type ChatContextType = {
  conversations: Conversation[];
  messages: { [conversationId: number]: Message[] };
  addConversation: (conversation: Conversation) => void;
  addMessage: (conversationId: number, message: Message) => void;
  deleteConversation: (conversationId: number) => void;
};

const ChatContext = createContext<ChatContextType | undefined>(undefined);

export const ChatProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [messages, setMessages] = useState<{ [conversationId: number]: Message[] }>({});

  const addConversation = (conversation: Conversation) => {
    // Check if conversation with this participant already exists
    const existingConversation = conversations.find(
      conv => conv.participantId === conversation.participantId
    );

    if (!existingConversation) {
      setConversations(prev => [...prev, conversation]);
      setMessages(prev => ({ ...prev, [conversation.id]: [] }));
    }
    
    return existingConversation || conversation;
  };

  const addMessage = (conversationId: number, message: Message) => {
    setMessages(prev => ({
      ...prev,
      [conversationId]: [...(prev[conversationId] || []), message],
    }));
    
    setConversations(prev =>
      prev.map(conv =>
        conv.id === conversationId
          ? {
              ...conv,
              lastMessage: message.text,
              time: 'Just now',
              unread: conv.unread + 1,
            }
          : conv
      )
    );
  };

  const deleteConversation = (conversationId: number) => {
    setConversations(prev => prev.filter(conv => conv.id !== conversationId));
    setMessages(prev => {
      const newMessages = { ...prev };
      delete newMessages[conversationId];
      return newMessages;
    });
  };

  return (
    <ChatContext.Provider value={{ 
      conversations, 
      messages, 
      addConversation, 
      addMessage,
      deleteConversation 
    }}>
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => {
  const context = useContext(ChatContext);
  if (context === undefined) {
    throw new Error('useChat must be used within a ChatProvider');
  }
  return context;
};
