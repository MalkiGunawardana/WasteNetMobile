import type { Timestamp } from "firebase/firestore";

export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  name?: string;
  unread?: Record<string, number>;
}

export interface ChatScreenProps {
  route: {
    params: {
      receiverId: string;
      receiverName: string;
      chatId?: string;
    };
  };
}

export interface Message {
  id: string;
  senderId: string;
  receiverId: string;
  message: string;
  timestamp: Timestamp;
  read: boolean;
  readByReceiver: boolean;
}
