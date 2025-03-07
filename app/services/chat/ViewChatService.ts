import { getFirestore, collection, addDoc, query, where, orderBy, onSnapshot } from "firebase/firestore";

const firestore = getFirestore();

export const saveChatMessage = async (chatData: any) => {
  const chatRef = collection(firestore, "chats");
  await addDoc(chatRef, { ...chatData, timestamp: new Date() });
};

export const listenToChatMessages = (user1: string, user2: string, callback: any) => {
  const chatRef = collection(firestore, "chats");
  const q = query(
    chatRef,
    where("senderId", "in", [user1, user2]),
    where("receiverId", "in", [user1, user2]),
    orderBy("timestamp", "asc")
  );

  return onSnapshot(q, (snapshot) => {
    const messages = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
    callback(messages);
  });
};
