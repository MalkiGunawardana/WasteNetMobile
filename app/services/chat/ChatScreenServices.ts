/*import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  type Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getUserById, type UserData } from "../users/UserService";

export interface Chat {
  senderName: string;
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  lastMessageSenderId: string;
  unread: {
    [key: string]: number;
  };
  receiverData?: UserData;
}

export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return () => {};

  const db = getFirestore();
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", currentUser.uid)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const chatsPromises = snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const otherParticipantId = chatData.participants.find(
          (id: string) => id !== currentUser.uid
        );

        // Fetch the receiver's data
        const receiverData = await getUserById(otherParticipantId);

        return {
          id: doc.id,
          ...chatData,
          receiverData,
        } as Chat;
      });

      const chats = await Promise.all(chatsPromises);
      callback(chats);
    } catch (error) {
      console.error("Error processing chats:", error);
      callback([]);
    }
  });
};

export const markChatAsRead = async (chatId: string) => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return;

  const db = getFirestore();
  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    [`unread.${currentUser.uid}`]: 0,
  });
};*/

import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  type Timestamp,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getUserById, type UserData } from "../users/UserService";

export interface Chat {
  senderName: string;
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  lastMessageSenderId: string;
  unread: {
    [key: string]: number;
  };
  receiverData?: UserData;
}

export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return () => {};

  const db = getFirestore();
  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", currentUser.uid)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const chatsPromises = snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        const otherParticipantId = chatData.participants.find(
          (id: string) => id !== currentUser.uid
        );

        // Fetch the receiver's data
        const receiverData = await getUserById(otherParticipantId);

        return {
          id: doc.id,
          ...chatData,
          receiverData,
        } as Chat;
      });

      const chats = await Promise.all(chatsPromises);
      callback(chats);
    } catch (error) {
      console.error("Error processing chats:", error);
      callback([]);
    }
  });
};

export const markChatAsRead = async (chatId: string) => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return;

  const db = getFirestore();
  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    [`unread.${currentUser.uid}`]: 0,
  });
};

export const createNewChat = async (userId1: string, userId2: string) => {
  const db = getFirestore();
  const chatsRef = collection(db, "chats");
  
  const newChatRef = await addDoc(chatsRef, { // Use addDoc to get the reference
    participants: [userId1, userId2],
    unread: {
      [userId1]: 0,
      [userId2]: 0,
    },
    lastMessage:'',
    lastMessageSenderId:'',
    lastMessageTime:'',
    senderName:'',
  });

  return newChatRef.id; // Return the ID of the newly created chat
};
