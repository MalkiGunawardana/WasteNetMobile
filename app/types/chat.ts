/*import type { Timestamp } from "firebase/firestore";

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
}*/


// second for chat //correct
/*import type { Timestamp } from "firebase/firestore";

// removed UserData import
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
      chatId: string; //chatId is required now
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
}*/

import type { Timestamp } from "firebase/firestore";

// removed UserData import
export interface Chat {
  id: string;
  participants: string[];
  lastMessage?: string;
  lastMessageTime?: Timestamp;
  name?: string; // This line was added.
  unread?: Record<string, number>;
  receiverName?: string; // added
  receiverId?: string; //added
}

export interface ChatScreenProps {
  route: {
    params: {
      receiverId: string;
      receiverName: string;
      chatId: string; //chatId is required now
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
}

