/*import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  subscribeToChats,
  markChatAsRead,
  Chat,
} from "../services/chat/ChatScreenServices";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from "firebase/auth";
import { UserData } from "../services/users/UserService";
import { t } from "i18next";

type RootStackParamList = {
  ViewChatScreen: { receiverId: string; receiverName: string };
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProcessedChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  receiverData?: UserData;
}

export default function ChatScreen() {
  const [chats, setChats] = useState<ProcessedChat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<ChatScreenNavigationProp>();
  const currentUser = getAuth().currentUser;

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "N/A";

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString();
    }
  };

  const fetchChats = useCallback(() => {
    setRefreshing(true);
    try {
      const unsubscribe = subscribeToChats((fetchedChats) => {
        const processedChats = fetchedChats.map((chat: Chat) => {
          const otherParticipantId =
            chat.participants.find((id: any) => id !== currentUser?.uid) ||
            "Unknown";

          return {
            id: chat.id,
            name: chat.senderName || otherParticipantId,
            lastMessage: chat.lastMessage || "No messages yet...",
            lastMessageTime: formatTimestamp(chat.lastMessageTime),
            unreadCount: currentUser?.uid
              ? chat.unread?.[currentUser.uid] || 0
              : 0,
            receiverData: chat.receiverData,
          };
        });

        setChats(processedChats);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      });

      return unsubscribe;
    } catch (err) {
      setError("Failed to load chats");
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  // Auto-refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchChats]);

  const handleChatPress = async (chat: ProcessedChat) => {
    try {
      await markChatAsRead(chat.id);
      navigation.navigate("ViewChatScreen", {
        receiverId: chat.receiverData?.id || "",
        receiverName: chat.receiverData?.name || chat.name,
      });
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008F4C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{t("messages")}</Text>
      </View>
      {chats.length === 0 ? (
        <View style={styles.noChatsContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#999" />
          <Text style={styles.noChatsText}>{t("noMessages")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchChats}
              tintColor="#008F4C"
            />
          }
        >
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.chatItem,
                chat.unreadCount > 0 && styles.unreadChatItem,
              ]}
              onPress={() => handleChatPress(chat)}
            >
              <View style={styles.avatar}>
                {chat.receiverData?.profileImage ? (
                  <Image
                    source={{ uri: chat.receiverData?.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {chat.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>
                  {chat.receiverData?.name || chat.name}{" "}
                </Text>

                <Text
                  style={[
                    styles.lastMessage,
                    chat.unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {chat.lastMessage}
                </Text>
              </View>

              <View style={styles.timestampContainer}>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Text style={styles.timeStamp}>{chat.lastMessageTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#008f4c",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF4444",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#fff",
  },
  unreadChatItem: {
    backgroundColor: "#f0f9f4",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f4ea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#008F4C",
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  lastMessage: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
  },
  unreadMessage: {
    color: "#333",
    fontWeight: "500",
  },
  timestampContainer: {
    alignItems: "flex-end",
    minWidth: 65,
  },
  timeStamp: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#008F4C",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noChatsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  noChatsText: {
    marginTop: 16,
    fontSize: 18,
    color: "#777",
    fontWeight: "500",
  },
});*/

/*import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  subscribeToChats,
  markChatAsRead,
} from "../services/chat/ChatScreenServices";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from "firebase/auth";
import { UserData } from "../services/users/UserService";
import { t } from "i18next";
import type { Chat } from "../types/chat";

type RootStackParamList = {
  ViewChatScreen: { chatId: string; receiverId: string; receiverName: string };
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

interface ProcessedChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  receiverData?: UserData;
  receiverName: string;
}

export default function ChatScreen() {
  const [chats, setChats] = useState<ProcessedChat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<ChatScreenNavigationProp>();
  const currentUser = getAuth().currentUser;

  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "N/A";

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString();
    }
  };

  const fetchChats = useCallback(() => {
    setRefreshing(true);
    try {
      const unsubscribe = subscribeToChats((fetchedChats) => {
        const processedChats = fetchedChats.map((chat: Chat) => {
          return {
            id: chat.id,
            name: chat.receiverName || "No Name", //use receiver name for display
            lastMessage: chat.lastMessage || "No messages yet...",
            lastMessageTime: formatTimestamp(chat.lastMessageTime),
            unreadCount: currentUser?.uid
              ? chat.unread?.[currentUser.uid] || 0
              : 0,
            receiverData: chat.receiverData,
            receiverName: chat.receiverName || "No Name",
          };
        });

        setChats(processedChats);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      });

      return unsubscribe;
    } catch (err) {
      setError("Failed to load chats");
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchChats]);

  const handleChatPress = async (chat: ProcessedChat) => {
    try {
      await markChatAsRead(chat.id);
      navigation.navigate("ViewChatScreen", {
        chatId: chat.id,
        receiverId: chat.receiverData?.id || "", // if receiverData is null receiver id will be ""
        receiverName: chat.receiverData?.name || chat.receiverName, // receiver name or chat name
      });
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008F4C" />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{t("messages")}</Text>
      </View>
      {chats.length === 0 ? (
        <View style={styles.noChatsContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#999" />
          <Text style={styles.noChatsText}>{t("noMessages")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchChats}
              tintColor="#008F4C"
            />
          }
        >
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.chatItem,
                chat.unreadCount > 0 && styles.unreadChatItem,
              ]}
              onPress={() => handleChatPress(chat)}
            >
              <View style={styles.avatar}>
                {chat.receiverData?.profileImage ? (
                  <Image
                    source={{ uri: chat.receiverData?.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {chat.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>
                  {chat.receiverData?.name || chat.name}
                </Text>

                <Text
                  style={[
                    styles.lastMessage,
                    chat.unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {chat.lastMessage}
                </Text>
              </View>

              <View style={styles.timestampContainer}>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Text style={styles.timeStamp}>{chat.lastMessageTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#008f4c",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF4444",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#fff",
  },
  unreadChatItem: {
    backgroundColor: "#f0f9f4",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f4ea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#008F4C",
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  lastMessage: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
  },
  unreadMessage: {
    color: "#333",
    fontWeight: "500",
  },
  timestampContainer: {
    alignItems: "flex-end",
    minWidth: 65,
  },
  timeStamp: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#008F4C",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noChatsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  noChatsText: {
    marginTop: 16,
    fontSize: 18,
    color: "#777",
    fontWeight: "500",
  },
});*/

//second chat //correct
/*import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  subscribeToChats,
  markChatAsRead,
  Chat, // Import the Chat type
} from "../services/chat/ChatScreenServices";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from "firebase/auth";
import { UserData } from "../services/users/UserService";
import { t } from "i18next";

// Define the navigation params
type RootStackParamList = {
  ViewChatScreen: { chatId: string; receiverId: string; receiverName: string };
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define the ProcessedChat interface
interface ProcessedChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  receiverData?: UserData;
  receiverName: string;
  receiverId: string;
}

export default function ChatScreen() {
  const [chats, setChats] = useState<ProcessedChat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<ChatScreenNavigationProp>();
  const currentUser = getAuth().currentUser;

  // Function to format the timestamp for display
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "N/A";

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to fetch and process chats
  const fetchChats = useCallback(() => {
    setRefreshing(true);
    try {
      const unsubscribe = subscribeToChats((fetchedChats: Chat[]) => {
        // Process each fetched chat and transform it into a ProcessedChat object
        const processedChats: ProcessedChat[] = fetchedChats.map((chat) => {
          return {
            id: chat.id,
            name: chat.receiverName || "No Name",
            lastMessage: chat.lastMessage || "No messages yet...",
            lastMessageTime: formatTimestamp(chat.lastMessageTime),
            unreadCount: currentUser?.uid
              ? chat.unread?.[currentUser.uid] || 0
              : 0,
            receiverData: chat.receiverData,
            receiverName: chat.receiverName || "No Name",
            receiverId: chat.receiverId || "unknown",
          };
        });

        setChats(processedChats);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      });

      return unsubscribe; // Return the unsubscribe function
    } catch (err) {
      setError("Failed to load chats");
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  // Auto-refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  // Handle cleanup when the component unmounts
  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchChats]);

  // Handle navigation to the ViewChatScreen when a chat is pressed
  const handleChatPress = async (chat: ProcessedChat) => {
    try {
      await markChatAsRead(chat.id);
      navigation.navigate("ViewChatScreen", {
        chatId: chat.id,
        receiverId: chat.receiverId,
        receiverName: chat.receiverName,
      });
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008F4C" />
      </View>
    );
  }

  // Show error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render the main chat list
  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{t("messages")}</Text>
      </View>
      {chats.length === 0 ? (
        <View style={styles.noChatsContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#999" />
          <Text style={styles.noChatsText}>{t("noMessages")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchChats}
              tintColor="#008F4C"
            />
          }
        >
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.chatItem,
                chat.unreadCount > 0 && styles.unreadChatItem,
              ]}
              onPress={() => handleChatPress(chat)}
            >
              <View style={styles.avatar}>
                {chat.receiverData?.profileImage ? (
                  <Image
                    source={{ uri: chat.receiverData?.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {chat.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>
                  {chat.receiverData?.name || chat.name}
                </Text>

                <Text
                  style={[
                    styles.lastMessage,
                    chat.unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {chat.lastMessage}
                </Text>
              </View>

              <View style={styles.timestampContainer}>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Text style={styles.timeStamp}>{chat.lastMessageTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#008f4c",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF4444",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#fff",
  },
  unreadChatItem: {
    backgroundColor: "#f0f9f4",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f4ea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#008F4C",
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  lastMessage: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
  },
  unreadMessage: {
    color: "#333",
    fontWeight: "500",
  },
  timestampContainer: {
    alignItems: "flex-end",
    minWidth: 65,
  },
  timeStamp: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#008F4C",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noChatsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  noChatsText: {
    marginTop: 16,
    fontSize: 18,
    color: "#777",
    fontWeight: "500",
  },
});*/

import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  RefreshControl,
  Image,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import {
  subscribeToChats,
  markChatAsRead,
  Chat, // Import the Chat type
} from "../services/chat/ChatScreenServices";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { StackNavigationProp } from "@react-navigation/stack";
import { getAuth } from "firebase/auth";
import { UserData } from "../services/users/UserService";
import { t } from "i18next";

// Define the navigation params
type RootStackParamList = {
  ViewChatScreen: { chatId: string; receiverId: string; receiverName: string };
};

type ChatScreenNavigationProp = StackNavigationProp<RootStackParamList>;

// Define the ProcessedChat interface
interface ProcessedChat {
  id: string;
  name: string;
  lastMessage: string;
  lastMessageTime: string;
  unreadCount: number;
  receiverData?: UserData;
  receiverName: string;
  receiverId: string;
}

export default function ChatScreen() {
  const [chats, setChats] = useState<ProcessedChat[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const navigation = useNavigation<ChatScreenNavigationProp>();
  const currentUser = getAuth().currentUser;

  // Function to format the timestamp for display
  const formatTimestamp = (timestamp: any) => {
    if (!timestamp || !timestamp.toDate) return "N/A";

    const date = timestamp.toDate();
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString([], {
        hour: "2-digit",
        minute: "2-digit",
      });
    } else if (days === 1) {
      return "Yesterday";
    } else if (days < 7) {
      return date.toLocaleDateString([], { weekday: "short" });
    } else {
      return date.toLocaleDateString();
    }
  };

  // Function to fetch and process chats
  const fetchChats = useCallback(() => {
    setRefreshing(true);
    try {
      const unsubscribe = subscribeToChats((fetchedChats: Chat[]) => {
        // Process each fetched chat and transform it into a ProcessedChat object
        const processedChats: ProcessedChat[] = fetchedChats.map((chat) => {
          return {
            id: chat.id,
            name: chat.receiverName || "No Name",
            lastMessage: chat.lastMessage || "No messages yet...",
            lastMessageTime: formatTimestamp(chat.lastMessageTime),
            unreadCount: currentUser?.uid
              ? chat.unread?.[currentUser.uid] || 0
              : 0,
            receiverData: chat.receiverData,
            receiverName: chat.receiverName || "No Name",
            receiverId: chat.receiverId || "unknown",
          };
        });

        setChats(processedChats);
        setLoading(false);
        setRefreshing(false);
        setError(null);
      });

      return unsubscribe; // Return the unsubscribe function
    } catch (err) {
      setError("Failed to load chats");
      setLoading(false);
      setRefreshing(false);
    }
  }, [currentUser]);

  // Auto-refresh when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      fetchChats();
    }, [fetchChats])
  );

  // Handle cleanup when the component unmounts
  useEffect(() => {
    const unsubscribe = fetchChats();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [fetchChats]);

  // Handle navigation to the ViewChatScreen when a chat is pressed
  const handleChatPress = async (chat: ProcessedChat) => {
    try {
      await markChatAsRead(chat.id);
      navigation.navigate("ViewChatScreen", {
        chatId: chat.id,
        receiverId: chat.receiverId,
        receiverName: chat.receiverName,
      });
    } catch (err) {
      console.error("Error marking chat as read:", err);
    }
  };

  // Show loading indicator
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#008F4C" />
      </View>
    );
  }

  // Show error message
  if (error) {
    return (
      <View style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={styles.errorText}>{error}</Text>
        <TouchableOpacity style={styles.retryButton} onPress={fetchChats}>
          <Text style={styles.retryButtonText}>Retry</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Render the main chat list
  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <View style={styles.headerContainer}>
        <Text style={styles.headerText}>{t("messages")}</Text>
      </View>
      {chats.length === 0 ? (
        <View style={styles.noChatsContainer}>
          <Ionicons name="chatbubbles-outline" size={48} color="#999" />
          <Text style={styles.noChatsText}>{t("noMessages")}</Text>
        </View>
      ) : (
        <ScrollView
          style={styles.scrollView}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={fetchChats}
              tintColor="#008F4C"
            />
          }
        >
          {chats.map((chat) => (
            <TouchableOpacity
              key={chat.id}
              style={[
                styles.chatItem,
                chat.unreadCount > 0 && styles.unreadChatItem,
              ]}
              onPress={() => handleChatPress(chat)}
            >
              <View style={styles.avatar}>
                {chat.receiverData?.profileImage ? (
                  <Image
                    source={{ uri: chat.receiverData?.profileImage }}
                    style={styles.avatarImage}
                  />
                ) : (
                  <Text style={styles.avatarText}>
                    {chat.name?.charAt(0).toUpperCase() || "?"}
                  </Text>
                )}
              </View>
              <View style={styles.chatInfo}>
                <Text style={styles.chatName}>
                  {chat.receiverData?.name || chat.name}
                </Text>

                <Text
                  style={[
                    styles.lastMessage,
                    chat.unreadCount > 0 && styles.unreadMessage,
                  ]}
                  numberOfLines={1}
                >
                  {chat.lastMessage}
                </Text>
              </View>

              <View style={styles.timestampContainer}>
                {chat.unreadCount > 0 && (
                  <View style={styles.unreadBadge}>
                    <Text style={styles.unreadCount}>{chat.unreadCount}</Text>
                  </View>
                )}
                <Text style={styles.timeStamp}>{chat.lastMessageTime}</Text>
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#F8F8F8",
  },
  headerContainer: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
  },
  headerText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#008f4c",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#F8F8F8",
  },
  errorText: {
    marginTop: 16,
    fontSize: 16,
    color: "#FF4444",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 24,
    paddingVertical: 12,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  scrollView: {
    flex: 1,
    backgroundColor: "#f5f5f5",
  },
  chatItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 20,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f2f2f2",
    backgroundColor: "#fff",
  },
  unreadChatItem: {
    backgroundColor: "#f0f9f4",
  },
  avatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: "#e6f4ea",
    alignItems: "center",
    justifyContent: "center",
    marginRight: 16,
  },
  avatarText: {
    color: "#008F4C",
    fontSize: 20,
    fontWeight: "bold",
  },
  avatarImage: {
    width: 50,
    height: 50,
    borderRadius: 25,
  },
  chatInfo: {
    flex: 1,
    marginRight: 16,
  },
  chatName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  lastMessage: {
    color: "#777",
    fontSize: 14,
    marginTop: 4,
  },
  unreadMessage: {
    color: "#333",
    fontWeight: "500",
  },
  timestampContainer: {
    alignItems: "flex-end",
    minWidth: 65,
  },
  timeStamp: {
    color: "#999",
    fontSize: 12,
    fontWeight: "500",
  },
  unreadBadge: {
    backgroundColor: "#008F4C",
    borderRadius: 12,
    minWidth: 24,
    height: 24,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 4,
  },
  unreadCount: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "600",
  },
  noChatsContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#F8F8F8",
  },
  noChatsText: {
    marginTop: 16,
    fontSize: 18,
    color: "#777",
    fontWeight: "500",
  },
});