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

//with correct chat
/*import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  getDocs,
  type Timestamp,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getUserById, type UserData } from "../users/UserService";
import type { Chat, Message } from "../../types/chat";

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

        const receiverData = await getUserById(otherParticipantId);

        return {
          id: doc.id,
          participants: chatData.participants,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime,
          unread: chatData.unread,
          receiverData,
          receiverName: chatData.receiverName
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

export const findExistingChat = async (
  userId: string,
  receiverId: string
): Promise<string | null> => {
  const db = getFirestore();
  const chatId1 = [userId, receiverId].sort().join("_");
  const chatId2 = [receiverId, userId].sort().join("_");

  const chatRef1 = doc(db, "chats", chatId1);
  const chatDoc1 = await getDoc(chatRef1);

  const chatRef2 = doc(db, "chats", chatId2);
  const chatDoc2 = await getDoc(chatRef2);

  if (chatDoc1.exists()) {
    return chatId1;
  } else if (chatDoc2.exists()) {
    return chatId2;
  } else {
    return null;
  }
};

export const createNewChat = async (
  userId: string,
  receiverId: string
): Promise<string> => {
  const db = getFirestore();
  const chatId = [userId, receiverId].sort().join("_");
  const user = await getUserById(receiverId);
  const chatDocRef = doc(db, "chats", chatId);

  // check user or user name exist before add
  await setDoc(
    chatDocRef,
    {
      participants: [userId, receiverId],
      lastMessage: "",
      lastMessageTime: serverTimestamp(),
      unread: {
        [userId]: 0,
        [receiverId]: 0,
      },
      receiverName: user && user.name ? user.name : "User",
    },
    { merge: true }
  );

  return chatId;
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string
) => {
  const db = getFirestore();
  const messagesRef = collection(db, "chats", chatId, "messages");

  const newMessage = {
    message: text,
    timestamp: serverTimestamp(),
    senderId,
    read: false,
    readByReceiver: false,
  };

  await addDoc(messagesRef, newMessage);

  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageSenderId: senderId,
    lastMessageTime: serverTimestamp(),
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const db = getFirestore();
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "desc"));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Message, "id">),
    }));
    callback(messages);
  });
};*/

//second correct chat //correct
/*import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  doc,
  updateDoc,
  addDoc,
  type Timestamp,
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getUserById, type UserData } from "../users/UserService";
import type { Message } from "../../types/chat";
import { db } from "../../../firebaseConfig"; // Import db from firebaseConfig

// Define the correct Chat interface
export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  unread: {
    [key: string]: number;
  };
  receiverData?: UserData;
  receiverName?: string;
  receiverId?: string;
}

export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return () => {};

  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", currentUser.uid)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const chatsPromises = snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        //Find the other participant id
        const otherParticipantId = chatData.participants.find(
          (id: string) => id !== currentUser.uid
        );

        const receiverData = await getUserById(otherParticipantId);

        return {
          id: doc.id,
          participants: chatData.participants,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime,
          unread: chatData.unread || {}, // Initialize unread as an empty object if not set
          receiverData,
          receiverName: chatData.receiverName, // Use receiverName from chat data
          receiverId: otherParticipantId, // Include receiverId
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

  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    [`unread.${currentUser.uid}`]: 0,
  });
};

export const findExistingChat = async (
  userId: string,
  otherUserId: string
): Promise<string | null> => {
  // Order the user IDs to ensure consistent chatId generation
  const sortedIds = [userId, otherUserId].sort();
  const chatId = sortedIds.join("_");
  try {
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      return chatId;
    }
    return null;
  } catch (error) {
    console.error("Error finding existing chat:", error);
    return null;
  }
};

export const createNewChat = async (
  userId: string,
  receiverId: string,
  receiverName: string
): Promise<string> => {
    // Order the user IDs to ensure consistent chatId generation
  const sortedIds = [userId, receiverId].sort();
  const chatId = sortedIds.join("_");
  const chatDocRef = doc(db, "chats", chatId);

  // Check if the chat document already exists
  const chatDoc = await getDoc(chatDocRef);

  if (chatDoc.exists()) {
    return chatId;
  }
  try {
    await setDoc(
      chatDocRef,
      {
        participants: [userId, receiverId],
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unread: {
          [userId]: 0,
          [receiverId]: 0,
        },
        receiverName: receiverName, // Store the receiverName in the chat document
        receiverId: receiverId,
      },
      { merge: true }
    );

    return chatId;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  receiverId: string
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const newMessage = {
    message: text,
    timestamp: serverTimestamp(),
    senderId,
    read: false,
  };

  await addDoc(messagesRef, newMessage);

  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    [`unread.${receiverId}`]: increment(1), // Increments the unread count for receiver
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "desc"));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Message, "id">),
    }));
    callback(messages);
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
  orderBy,
  serverTimestamp,
  setDoc,
  getDoc,
  increment,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { getUserById, type UserData } from "../users/UserService";
import type { Message } from "../../types/chat";
import { db } from "../../../firebaseConfig"; // Import db from firebaseConfig

// Define the correct Chat interface
export interface Chat {
  id: string;
  participants: string[];
  lastMessage: string;
  lastMessageTime: Timestamp;
  unread: {
    [key: string]: number;
  };
  receiverData?: UserData;
  receiverName?: string;
  receiverId?: string;
}

export const subscribeToChats = (callback: (chats: Chat[]) => void) => {
  const currentUser = getAuth().currentUser;
  if (!currentUser) return () => {};

  const chatsRef = collection(db, "chats");
  const q = query(
    chatsRef,
    where("participants", "array-contains", currentUser.uid)
  );

  return onSnapshot(q, async (snapshot) => {
    try {
      const chatsPromises = snapshot.docs.map(async (doc) => {
        const chatData = doc.data();
        //Find the other participant id
        const otherParticipantId = chatData.participants.find(
          (id: string) => id !== currentUser.uid
        );

        const receiverData = await getUserById(otherParticipantId);

        return {
          id: doc.id,
          participants: chatData.participants,
          lastMessage: chatData.lastMessage,
          lastMessageTime: chatData.lastMessageTime,
          unread: chatData.unread || {}, // Initialize unread as an empty object if not set
          receiverData,
          receiverName: chatData.receiverName, // Use receiverName from chat data
          receiverId: otherParticipantId, // Include receiverId
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

  const chatRef = doc(db, "chats", chatId);

  await updateDoc(chatRef, {
    [`unread.${currentUser.uid}`]: 0,
  });
};

export const findExistingChat = async (
  userId: string,
  otherUserId: string
): Promise<string | null> => {
  // Order the user IDs to ensure consistent chatId generation
  const sortedIds = [userId, otherUserId].sort();
  const chatId = sortedIds.join("_");
  try {
    const chatRef = doc(db, "chats", chatId);
    const chatSnap = await getDoc(chatRef);

    if (chatSnap.exists()) {
      return chatId;
    }
    return null;
  } catch (error) {
    console.error("Error finding existing chat:", error);
    return null;
  }
};

export const createNewChat = async (
  userId: string,
  receiverId: string,
  receiverName: string
): Promise<string> => {
  // Order the user IDs to ensure consistent chatId generation
  const sortedIds = [userId, receiverId].sort();
  const chatId = sortedIds.join("_");
  const chatDocRef = doc(db, "chats", chatId);

  // Check if the chat document already exists
  const chatDoc = await getDoc(chatDocRef);

  if (chatDoc.exists()) {
    return chatId;
  }
  try {
    await setDoc(
      chatDocRef,
      {
        participants: [userId, receiverId],
        lastMessage: "",
        lastMessageTime: serverTimestamp(),
        unread: {
          [userId]: 0,
          [receiverId]: 0,
        },
        receiverName: receiverName, // Store the receiverName in the chat document
        receiverId: receiverId,
      },
      { merge: true }
    );

    return chatId;
  } catch (error) {
    console.error("Error creating chat:", error);
    throw error;
  }
};

export const sendMessage = async (
  chatId: string,
  senderId: string,
  text: string,
  receiverId: string
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");

  const newMessage = {
    message: text,
    timestamp: serverTimestamp(),
    senderId,
    read: false,
  };

  await addDoc(messagesRef, newMessage);

  const chatRef = doc(db, "chats", chatId);
  await updateDoc(chatRef, {
    lastMessage: text,
    lastMessageTime: serverTimestamp(),
    [`unread.${receiverId}`]: increment(1), // Increments the unread count for receiver
  });
};

export const subscribeToMessages = (
  chatId: string,
  callback: (messages: Message[]) => void
) => {
  const messagesRef = collection(db, "chats", chatId, "messages");
  const q = query(messagesRef, orderBy("timestamp", "desc"));

  return onSnapshot(q, (snapshot) => {
    const messages: Message[] = snapshot.docs.map((doc) => ({
      id: doc.id,
      ...(doc.data() as Omit<Message, "id">),
    }));
    callback(messages);
  });
};
