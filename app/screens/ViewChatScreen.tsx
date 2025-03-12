
/*import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  updateDoc,
  doc,
  setDoc,
  limit,
  increment,
  type Timestamp,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Message, ChatScreenProps } from "../types/chat";

const db = getFirestore();
const MESSAGES_PER_LOAD = 20;

const ChatHeader = ({ receiverName }: { receiverName: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {receiverName}
        </Text>
      </View>
    </View>
  );
};

const ViewChatScreen = ({ route }: ChatScreenProps) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { receiverId, receiverName } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUserId = getAuth().currentUser?.uid;
  const chatId = [currentUserId, receiverId].sort().join("_");

  useEffect(() => {
    if (!currentUserId) {
      setError("User not authenticated");
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
      limit(MESSAGES_PER_LOAD)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp as Timestamp,
        })) as Message[];
        setMessages(messagesData);
        setIsLoading(false);

        messagesData.forEach(async (message) => {
          if (message.senderId !== currentUserId && !message.read) {
            await updateDoc(doc(db, "chats", chatId, "messages", message.id), {
              read: true,
            });
          }
        });
      },
      (err) => {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
        setIsLoading(false);
      }
    );

    const typingQuery = query(
      collection(db, "typing"),
      where("chatId", "==", chatId),
      where("userId", "==", receiverId)
    );

    const typingUnsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typingData = snapshot.docs[0]?.data();
      setIsTyping(typingData?.isTyping || false);
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUserId, receiverId, receiverName, chatId]);

  const handleSend = async () => {
    if (input.trim() === "" || !currentUserId) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId,
      message: input.trim(),
      timestamp: serverTimestamp(),
      read: false,
      readByReceiver: false, // Add this field to indicate if the receiver read the message
    };

    try {
      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);
      await setDoc(
        doc(db, "chats", chatId),
        {
          participants: [currentUserId, receiverId],
          lastMessage: input.trim(),
          lastMessageTime: serverTimestamp(),
          [`unread.${receiverId}`]: increment(1),
        },
        { merge: true }
      );
      setInput("");
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const updateTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!currentUserId) return;

      try {
        const typingRef = doc(db, "typing", chatId);
        await setDoc(
          typingRef,
          {
            chatId,
            userId: currentUserId,
            isTyping,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    [currentUserId, chatId]
  );

  const handleInputChange = (text: string) => {
    setInput(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingStatus(true);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUserId
          ? styles.ownMessage
          : styles.otherMessage,
      ]}
    >
      <Text
        style={
          item.senderId === currentUserId
            ? styles.ownMessageText
            : styles.otherMessageText
        }
      >
        {item.message}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            item.senderId === currentUserId && styles.ownTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
        {item.senderId === currentUserId && (
          <Ionicons
            name={
              item.readByReceiver
                ? "checkmark-done"
                : item.read
                ? "checkmark-done"
                : "checkmark"
            }
            size={16}
            color={item.readByReceiver ? "#34B7F1" : "#fff"}
            style={styles.readReceipt}
          />
        )}
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <ChatHeader receiverName={receiverName || receiverId} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#008F4C" />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messagesList}
            />
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {receiverName || "User"} is typing...
                </Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={input}
                onChangeText={handleInputChange}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#008F4C",
    borderTopRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    borderTopLeftRadius: 4,
  },
  ownMessageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  otherMessageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  readReceipt: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#008F4C",
    padding: 12,
    borderRadius: 24,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  typingIndicator: {
    padding: 8,
    paddingLeft: 16,
  },
  typingText: {
    color: "#888",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ViewChatScreen;*/

//with chat name
/*import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  where,
  updateDoc,
  doc,
  setDoc,
  limit,
  increment,
  type Timestamp,
  writeBatch,
  DocumentReference,
  type CollectionReference,
  getDoc,
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Message, ChatScreenProps } from "../types/chat";

const db = getFirestore();
const MESSAGES_PER_LOAD = 20;

const ChatHeader = ({ receiverName }: { receiverName: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {receiverName}
        </Text>
      </View>
    </View>
  );
};

const ViewChatScreen = ({ route }: ChatScreenProps) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { receiverId, receiverName, chatId } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  const currentUserId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserId || !chatId) {
      setError("User not authenticated or invalid chat");
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
      limit(MESSAGES_PER_LOAD)
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      async (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp as Timestamp,
        })) as Message[];
        setMessages(messagesData);
        setIsLoading(false);

        const unreadMessages = messagesData.filter(
          (message) => message.senderId !== currentUserId && !message.read
        );

        if (unreadMessages.length > 0) {
          const batch = writeBatch(db);

          unreadMessages.forEach((message) => {
            const messageRef: DocumentReference = doc(
              db,
              "chats",
              chatId,
              "messages",
              message.id
            );
            batch.update(messageRef, { read: true });
          });

          await batch.commit();
        }
      },
      (err) => {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
        setIsLoading(false);
      }
    );

    const typingQuery = query(
      collection(db, "typing"),
      where("chatId", "==", chatId),
      where("userId", "!=", currentUserId)
    );

    const typingUnsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typingData = snapshot.docs.map((doc) => doc.data());

      if (typingData.length > 0) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUserId, receiverId, receiverName, chatId]);

  const handleSend = async () => {
    if (input.trim() === "" || !currentUserId) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId,
      message: input.trim(),
      timestamp: serverTimestamp(),
      read: false,
    };

    try {
      // Check if the chat document exists before adding a message
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        // If the chat document doesn't exist, create it first
        await setDoc(
          chatDocRef,
          {
            participants: [currentUserId, receiverId],
            lastMessage: input.trim(),
            lastMessageTime: serverTimestamp(),
            unread: {
              [receiverId]: 0,
            },
          },
          { merge: true }
        );
      }

      const messagesCollection = collection(
        db,
        "chats",
        chatId,
        "messages"
      ) as CollectionReference;

      await addDoc(messagesCollection, newMessage);
      await updateDoc(chatDocRef, {
        lastMessage: input.trim(),
        lastMessageTime: serverTimestamp(),
        [`unread.${receiverId}`]: increment(1),
      });

      setInput("");
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const updateTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!currentUserId) return;

      try {
        const typingRef = doc(db, "typing", `${chatId}_${currentUserId}`);
        await setDoc(
          typingRef,
          {
            chatId,
            userId: currentUserId,
            isTyping,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    [currentUserId, chatId]
  );

  const handleInputChange = (text: string) => {
    setInput(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingStatus(true);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUserId
          ? styles.ownMessage
          : styles.otherMessage,
      ]}
    >
      <Text
        style={
          item.senderId === currentUserId
            ? styles.ownMessageText
            : styles.otherMessageText
        }
      >
        {item.message}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            item.senderId === currentUserId && styles.ownTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <ChatHeader receiverName={receiverName || receiverId} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#008F4C" />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messagesList}
            />
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {receiverName || "User"} is typing...
                </Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={input}
                onChangeText={handleInputChange}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#008F4C",
    borderTopRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    borderTopLeftRadius: 4,
  },
  ownMessageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  otherMessageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  readReceipt: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,    
  },
  sendButton: {
    backgroundColor: "#008F4C",
    padding: 12,
    borderRadius: 24,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  typingIndicator: {
    padding: 8,
    paddingLeft: 16,
  },
  typingText: {
    color: "#888",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ViewChatScreen;*/

//second chat  //correct
/*import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  type Timestamp,
  updateDoc,
  increment,
  writeBatch,
  getDoc,
  setDoc,
  limit, // Import limit
  where, // Import where
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Message, ChatScreenProps } from "../types/chat";

const db = getFirestore();
const MESSAGES_PER_LOAD = 20;

const ChatHeader = ({ receiverName }: { receiverName: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {receiverName}
        </Text>
      </View>
    </View>
  );
};

const ViewChatScreen = ({ route }: ChatScreenProps) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chatId, receiverId, receiverName } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentUserId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserId || !chatId) {
      setError("User not authenticated or invalid chat");
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
      limit(MESSAGES_PER_LOAD) // Limit correctly imported and used
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      async (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp as Timestamp,
        })) as Message[];
        setMessages(messagesData);
        setIsLoading(false);

        const unreadMessages = messagesData.filter(
          (message) => message.senderId !== currentUserId && !message.read
        );

        if (unreadMessages.length > 0) {
          const batch = writeBatch(db);

          unreadMessages.forEach((message) => {
            const messageRef = doc(
              db,
              "chats",
              chatId,
              "messages",
              message.id
            );
            batch.update(messageRef, { read: true });
          });

          await batch.commit();
        }
      },
      (err) => {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
        setIsLoading(false);
      }
    );
    // Correct way to use `where`
    const typingQuery = query(
      collection(db, "typing"),
      where("chatId", "==", chatId),
      where("userId", "==", receiverId) // send the correct id to detect if the user is typing
    );

    const typingUnsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typingData = snapshot.docs.map((doc) => doc.data());

      if (typingData.length > 0) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUserId, chatId]);

  const handleSend = async () => {
    if (input.trim() === "" || !currentUserId) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId,
      message: input.trim(),
      timestamp: serverTimestamp(),
      read: false,
    };

    try {
      // Check if the chat document exists before adding a message
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        // If the chat document doesn't exist, create it first
        await setDoc(
          chatDocRef,
          {
            participants: [currentUserId, receiverId],
            lastMessage: input.trim(),
            lastMessageTime: serverTimestamp(),
            unread: {
              [receiverId]: 0,
              [currentUserId]: 0,
            },
          },
          { merge: true }
        );
      }

      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);
      await updateDoc(chatDocRef, {
        lastMessage: input.trim(),
        lastMessageTime: serverTimestamp(),
        [`unread.${receiverId}`]: increment(1),
      });

      setInput("");
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const updateTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!currentUserId || !chatId) return;

      try {
        const typingRef = doc(db, "typing", `${chatId}_${currentUserId}`); // send current user id in the collection
        await setDoc(
          typingRef,
          {
            chatId,
            userId: currentUserId,
            isTyping,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    [currentUserId, chatId]
  );

  const handleInputChange = (text: string) => {
    setInput(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingStatus(true);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUserId
          ? styles.ownMessage
          : styles.otherMessage,
      ]}
    >
      <Text
        style={
          item.senderId === currentUserId
            ? styles.ownMessageText
            : styles.otherMessageText
        }
      >
        {item.message}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            item.senderId === currentUserId && styles.ownTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <ChatHeader receiverName={receiverName} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#008F4C" />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messagesList}
            />
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {receiverName} is typing...
                </Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Type a message..."
                value={input}
                onChangeText={handleInputChange}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#008F4C",
    borderTopRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    borderTopLeftRadius: 4,
  },
  ownMessageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  otherMessageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  readReceipt: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#008F4C",
    padding: 12,
    borderRadius: 24,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  typingIndicator: {
    padding: 8,
    paddingLeft: 16,
  },
  typingText: {
    color: "#888",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ViewChatScreen;*/

//second chat  //correct
import React, { useState, useEffect, useCallback, useRef } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ActivityIndicator,
  Alert,
} from "react-native";
import { getAuth } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  doc,
  type Timestamp,
  updateDoc,
  increment,
  writeBatch,
  getDoc,
  setDoc,
  limit, // Import limit
  where, // Import where
} from "firebase/firestore";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import type { Message, ChatScreenProps } from "../types/chat";
import { t } from "i18next";

const db = getFirestore();
const MESSAGES_PER_LOAD = 20;

const ChatHeader = ({ receiverName }: { receiverName: string }) => {
  const navigation = useNavigation();
  return (
    <View style={styles.header}>
      <TouchableOpacity
        onPress={() => navigation.goBack()}
        style={styles.backButton}
      >
        <Ionicons name="chevron-back" size={28} color="#000" />
      </TouchableOpacity>
      <View style={styles.titleContainer}>
        <Text style={styles.title} numberOfLines={1}>
          {receiverName}
        </Text>
      </View>
    </View>
  );
};

const ViewChatScreen = ({ route }: ChatScreenProps) => {
  const navigation = useNavigation();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isTyping, setIsTyping] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { chatId, receiverId, receiverName } = route.params;
  const flatListRef = useRef<FlatList>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const currentUserId = getAuth().currentUser?.uid;

  useEffect(() => {
    if (!currentUserId || !chatId) {
      setError("User not authenticated or invalid chat");
      return;
    }

    const messagesQuery = query(
      collection(db, "chats", chatId, "messages"),
      orderBy("timestamp", "desc"),
      limit(MESSAGES_PER_LOAD) // Limit correctly imported and used
    );

    const unsubscribe = onSnapshot(
      messagesQuery,
      async (snapshot) => {
        const messagesData = snapshot.docs.map((doc) => ({
          id: doc.id,
          ...doc.data(),
          timestamp: doc.data().timestamp as Timestamp,
        })) as Message[];
        setMessages(messagesData);
        setIsLoading(false);

        const unreadMessages = messagesData.filter(
          (message) => message.senderId !== currentUserId && !message.read
        );

        if (unreadMessages.length > 0) {
          const batch = writeBatch(db);

          unreadMessages.forEach((message) => {
            const messageRef = doc(
              db,
              "chats",
              chatId,
              "messages",
              message.id
            );
            batch.update(messageRef, { read: true });
          });

          await batch.commit();
        }
      },
      (err) => {
        console.error("Error loading messages:", err);
        setError("Failed to load messages");
        setIsLoading(false);
      }
    );
    // Correct way to use `where`
    const typingQuery = query(
      collection(db, "typing"),
      where("chatId", "==", chatId),
      where("userId", "==", receiverId) // send the correct id to detect if the user is typing
    );

    const typingUnsubscribe = onSnapshot(typingQuery, (snapshot) => {
      const typingData = snapshot.docs.map((doc) => doc.data());

      if (typingData.length > 0) {
        setIsTyping(true);
      } else {
        setIsTyping(false);
      }
    });

    return () => {
      unsubscribe();
      typingUnsubscribe();
      if (typingTimeoutRef.current) {
        clearTimeout(typingTimeoutRef.current);
      }
    };
  }, [currentUserId, chatId]);

  const handleSend = async () => {
    if (input.trim() === "" || !currentUserId) return;

    const newMessage = {
      senderId: currentUserId,
      receiverId,
      message: input.trim(),
      timestamp: serverTimestamp(),
      read: false,
    };

    try {
      // Check if the chat document exists before adding a message
      const chatDocRef = doc(db, "chats", chatId);
      const chatDocSnap = await getDoc(chatDocRef);

      if (!chatDocSnap.exists()) {
        // If the chat document doesn't exist, create it first
        await setDoc(
          chatDocRef,
          {
            participants: [currentUserId, receiverId],
            lastMessage: input.trim(),
            lastMessageTime: serverTimestamp(),
            unread: {
              [receiverId]: 0,
              [currentUserId]: 0,
            },
          },
          { merge: true }
        );
      }

      await addDoc(collection(db, "chats", chatId, "messages"), newMessage);
      await updateDoc(chatDocRef, {
        lastMessage: input.trim(),
        lastMessageTime: serverTimestamp(),
        [`unread.${receiverId}`]: increment(1),
      });

      setInput("");
      flatListRef.current?.scrollToOffset({ offset: 0, animated: true });
    } catch (error) {
      console.error("Error sending message:", error);
      Alert.alert("Error", "Failed to send message. Please try again.");
    }
  };

  const updateTypingStatus = useCallback(
    async (isTyping: boolean) => {
      if (!currentUserId || !chatId) return;

      try {
        const typingRef = doc(db, "typing", `${chatId}_${currentUserId}`); // send current user id in the collection
        await setDoc(
          typingRef,
          {
            chatId,
            userId: currentUserId,
            isTyping,
            timestamp: serverTimestamp(),
          },
          { merge: true }
        );
      } catch (error) {
        console.error("Error updating typing status:", error);
      }
    },
    [currentUserId, chatId]
  );

  const handleInputChange = (text: string) => {
    setInput(text);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    updateTypingStatus(true);
    typingTimeoutRef.current = setTimeout(() => {
      updateTypingStatus(false);
    }, 3000);
  };

  const formatTime = (timestamp: Timestamp) => {
    if (!timestamp) return "";
    const date = timestamp.toDate();
    return date.toLocaleTimeString([], {
      hour: "2-digit",
      minute: "2-digit",
      hour12: true,
    });
  };

  const renderMessage = ({ item }: { item: Message }) => (
    <View
      style={[
        styles.messageContainer,
        item.senderId === currentUserId
          ? styles.ownMessage
          : styles.otherMessage,
      ]}
    >
      <Text
        style={
          item.senderId === currentUserId
            ? styles.ownMessageText
            : styles.otherMessageText
        }
      >
        {item.message}
      </Text>
      <View style={styles.messageFooter}>
        <Text
          style={[
            styles.timestamp,
            item.senderId === currentUserId && styles.ownTimestamp,
          ]}
        >
          {formatTime(item.timestamp)}
        </Text>
      </View>
    </View>
  );

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <ChatHeader receiverName={receiverName} />
      <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        {isLoading ? (
          <View style={styles.centerContainer}>
            <ActivityIndicator size="large" color="#008F4C" />
          </View>
        ) : (
          <>
            <FlatList
              ref={flatListRef}
              data={messages}
              keyExtractor={(item) => item.id}
              renderItem={renderMessage}
              inverted
              contentContainerStyle={styles.messagesList}
            />
            {isTyping && (
              <View style={styles.typingIndicator}>
                <Text style={styles.typingText}>
                  {/*{receiverName} is typing...*/}
                </Text>
              </View>
            )}
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder={t("typeAMessage")}
                value={input}
                onChangeText={handleInputChange}
                multiline
                maxLength={1000}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  !input.trim() && styles.sendButtonDisabled,
                ]}
                onPress={handleSend}
                disabled={!input.trim()}
              >
                <Ionicons name="send" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
          </>
        )}
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 8,
    paddingVertical: 12,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  backButton: {
    padding: 8,
  },
  titleContainer: {
    flex: 1,
    marginLeft: 8,
    marginRight: 48,
  },
  title: {
    fontSize: 18,
    fontWeight: "600",
    color: "#000",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  messagesList: {
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  messageContainer: {
    maxWidth: "80%",
    marginBottom: 12,
    padding: 12,
    borderRadius: 16,
  },
  ownMessage: {
    alignSelf: "flex-end",
    backgroundColor: "#008F4C",
    borderTopRightRadius: 4,
  },
  otherMessage: {
    alignSelf: "flex-start",
    backgroundColor: "#f1f1f1",
    borderTopLeftRadius: 4,
  },
  ownMessageText: {
    fontSize: 16,
    color: "#fff",
    lineHeight: 22,
  },
  otherMessageText: {
    fontSize: 16,
    color: "#333",
    lineHeight: 22,
  },
  messageFooter: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
    marginTop: 4,
  },
  timestamp: {
    fontSize: 12,
    color: "#999",
    marginRight: 4,
  },
  ownTimestamp: {
    color: "rgba(255, 255, 255, 0.7)",
  },
  readReceipt: {
    marginLeft: 2,
  },
  inputContainer: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  input: {
    flex: 1,
    backgroundColor: "#f1f1f1",
    borderRadius: 24,
    paddingHorizontal: 16,
    paddingVertical: 8,
    fontSize: 16,
    marginRight: 12,
    maxHeight: 100,
  },
  sendButton: {
    backgroundColor: "#008F4C",
    padding: 12,
    borderRadius: 24,
  },
  sendButtonDisabled: {
    backgroundColor: "#ccc",
  },
  typingIndicator: {
    padding: 8,
    paddingLeft: 16,
  },
  typingText: {
    color: "#888",
    fontSize: 14,
  },
  errorText: {
    color: "red",
    fontSize: 16,
  },
});

export default ViewChatScreen;

