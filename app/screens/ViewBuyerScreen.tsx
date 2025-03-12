/*import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Platform,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchBuyerById, Buyer } from "../services/buyers/ViewBuyerScreenService";
import { getAuth } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import { createNewChat } from "../services/chat/ChatScreenServices";

let BuyerSkeletonComponent = View;
// Conditional import for BuyerSkeleton
if (Platform.OS === 'ios' || Platform.OS === 'android') {
  const BuyerSkeletonNative = require('../components/BuyerSkeleton').BuyerSkeleton;
  BuyerSkeletonComponent = BuyerSkeletonNative;
}

const ViewBuyerScreen = ({ route }: any) => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  type ViewBuyerScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ViewBuyerScreen"
  >;

  const navigation = useNavigation<ViewBuyerScreenNavigationProp>();

  // Load buyer details by ID
  const loadBuyer = async (buyerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedBuyer = await fetchBuyerById(buyerId);
      if (fetchedBuyer) {
        setBuyer(fetchedBuyer);
      } else {
        setError(t("buyerNotFound"));
      }
    } catch (err) {
      console.error("Error fetching buyer:", err);
      setError(err instanceof Error ? err.message : t("loadItemsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.buyerId) {
      loadBuyer(route.params.buyerId);
    } else {
      setError(t("buyerNotFound"));
      setLoading(false);
    }
  }, [route.params?.buyerId]);

  const handleRequestChat = async () => {
    if(!buyer){
      return;
    }
    setButtonLoading(true);
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    try {
        const chatId = await createNewChat(userId, buyer.id); // Now it returns chatId
        navigation.navigate("ViewChatScreen", { receiverId: buyer.id, receiverName: buyer.name }); //Add receiverId
      } catch (error) {
        console.error("Error creating chat:", error);
      } finally {
        setButtonLoading(false);
      }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <BuyerSkeletonComponent />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={[styles.loadingText, { color: "#FF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() => route.params?.buyerId && loadBuyer(route.params.buyerId)}
        >
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!buyer) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("buyerNotFound")}</Text>
      </SafeAreaView>
    );
  }

  const userId = getAuth().currentUser?.uid;
  const isOwner = buyer.addedBy === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header1}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.inlineHeader}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
          <Text style={styles.headerTitle}>{buyer.name}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>*/
          {/* Buyer Image Placeholder */}
         /* <View style={styles.placeholderContainer}>
              <View style={styles.initialContainer}>
                  <Text style={styles.initialText}>
                      {buyer.name.charAt(0).toUpperCase()}
                  </Text>
              </View>
            </View>

          <View style={styles.header}>
            <Text style={styles.title}>{buyer.name || "No Name"}</Text>
            <Text style={styles.price}>
              {t("rs")}
              {buyer.price.toLocaleString()}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>{buyer.itemType}</Text>
            </View>
          </View>*/

        {/* Description Section */}
          {/*{buyer.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("description")}</Text>
              <Text style={styles.descriptionText}>{buyer.description}</Text>
            </View>
          ) : null}*/}

          /*<View style={styles.section}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                    <Text style={styles.detailValue}>{buyer.phoneNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("location")}</Text>
                    <Text style={styles.detailValue}>{buyer.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("createdAt")}</Text>
                    <Text style={styles.detailValue}>{buyer.createdAt}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {!isOwner && (
        <View style={styles.bottomContainer}>
        <TouchableOpacity
          style={styles.chatButton}
          onPress={handleRequestChat}
          disabled={buttonLoading}
        >
          {buttonLoading ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <>
              <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
              <Text style={styles.chatButtonText}>Request Chat</Text>
            </>
          )}
        </TouchableOpacity>
      </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header1: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#008F4C",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#008F4C",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#008F4C",
    marginBottom: 8,
  },
  quickInfo: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginRight: 40,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
    // Placeholder style
    placeholderContainer: {
      width: "100%",
      alignItems: 'center',
      marginBottom: 20,
    },
    initialContainer: {
      width: 150,
      height: 150,
      borderRadius: 75,
      backgroundColor: "#ddd",
      justifyContent: "center",
      alignItems: "center",
  },
  initialText: {
      fontSize: 60,
      fontWeight: "bold",
      color: "#333",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
    chatButton: {
    backgroundColor: "#008F4C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
    },
    chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    },
});

export default ViewBuyerScreen;*/

// app/screens/ViewBuyerScreen.tsx
// app/screens/ViewBuyerScreen.tsx   correct for viewbuyerscreen
/*import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchBuyerById, Buyer } from "../services/buyers/ViewBuyerScreenService";
import { getAuth } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import { createNewChat } from "../services/chat/ChatScreenServices";
import { BuyerSkeleton } from "../components/BuyerSkeleton";

const ViewBuyerScreen = ({ route }: any) => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  type ViewBuyerScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ViewBuyerScreen"
  >;

  const navigation = useNavigation<ViewBuyerScreenNavigationProp>();

  const loadBuyer = async (buyerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedBuyer = await fetchBuyerById(buyerId);
      if (fetchedBuyer) {
        setBuyer(fetchedBuyer);
      } else {
        setError(t("buyerNotFound"));
      }
    } catch (err) {
      console.error("Error fetching buyer:", err);
      setError(err instanceof Error ? err.message : t("loadItemsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.buyerId) {
      loadBuyer(route.params.buyerId);
    } else {
      setError(t("buyerNotFound"));
      setLoading(false);
    }
  }, [route.params?.buyerId]);

  const handleRequestChat = async () => {
    if (!buyer) {
      return;
    }
    setButtonLoading(true);
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    try {
      const chatId = await createNewChat(userId, buyer.id);
      navigation.navigate("ViewChatScreen", {
        receiverId: buyer.id,
        receiverName: buyer.name,
      });
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <BuyerSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={[styles.loadingText, { color: "#FF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            route.params?.buyerId && loadBuyer(route.params.buyerId)
          }
        >
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!buyer) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("buyerNotFound")}</Text>
      </SafeAreaView>
    );
  }

  const userId = getAuth().currentUser?.uid;
  const isOwner = buyer.addedBy === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header1}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.inlineHeader}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
          <Text style={styles.headerTitle}>{buyer.name}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.placeholderContainer}>
            <View style={styles.initialContainer}>
              <Text style={styles.initialText}>
                {buyer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{buyer.name || "No Name"}</Text>
            <Text style={styles.price}>
              {t("rs")}
              {buyer.price.toLocaleString()}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>{buyer.itemType}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                    <Text style={styles.detailValue}>{buyer.phoneNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("location")}</Text>
                    <Text style={styles.detailValue}>{buyer.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("createdAt")}</Text>
                    <Text style={styles.detailValue}>{buyer.createdAt}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {!isOwner && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleRequestChat}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                <Text style={styles.chatButtonText}>Request Chat</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header1: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#008F4C",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#008F4C",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#008F4C",
    marginBottom: 8,
  },
  quickInfo: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginRight: 40,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  initialContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#333",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  chatButton: {
    backgroundColor: "#008F4C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
    sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
    descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
});

export default ViewBuyerScreen;*/

//with chat
// app/screens/ViewBuyerScreen.tsx    

/*import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchBuyerById, Buyer } from "../services/buyers/ViewBuyerScreenService";
import { getAuth } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import {
  createNewChat,
  findExistingChat,
} from "../services/chat/ChatScreenServices";
import { BuyerSkeleton } from "../components/BuyerSkeleton";

const ViewBuyerScreen = ({ route }: any) => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);

  type ViewBuyerScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ViewBuyerScreen"
  >;

  const navigation = useNavigation<ViewBuyerScreenNavigationProp>();

  const loadBuyer = async (buyerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedBuyer = await fetchBuyerById(buyerId);
      if (fetchedBuyer) {
        setBuyer(fetchedBuyer);
      } else {
        setError(t("buyerNotFound"));
      }
    } catch (err) {
      console.error("Error fetching buyer:", err);
      setError(err instanceof Error ? err.message : t("loadItemsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.buyerId) {
      loadBuyer(route.params.buyerId);
    } else {
      setError(t("buyerNotFound"));
      setLoading(false);
    }
  }, [route.params?.buyerId]);

  const handleRequestChat = async () => {
    if (!buyer) {
      return;
    }
    setButtonLoading(true);
    const userId = getAuth().currentUser?.uid;
    if (!userId) return;
    try {
      const existingChatId = await findExistingChat(userId, buyer.id);

      let chatIdToUse;
      if (existingChatId) {
        chatIdToUse = existingChatId;
      } else {
        chatIdToUse = await createNewChat(userId, buyer.id);
      }

      navigation.navigate("ViewChatScreen", {
        chatId: chatIdToUse,
        receiverId: buyer.id,
        receiverName: buyer.name,
      });
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <BuyerSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={[styles.loadingText, { color: "#FF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            route.params?.buyerId && loadBuyer(route.params.buyerId)
          }
        >
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!buyer) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("buyerNotFound")}</Text>
      </SafeAreaView>
    );
  }

  const userId = getAuth().currentUser?.uid;
  const isOwner = buyer.addedBy === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header1}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.inlineHeader}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
          <Text style={styles.headerTitle}>{buyer.name}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.placeholderContainer}>
            <View style={styles.initialContainer}>
              <Text style={styles.initialText}>
                {buyer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{buyer.name || "No Name"}</Text>
            <Text style={styles.price}>
              {t("rs")}
              {buyer.price.toLocaleString()}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>{buyer.itemType}</Text>
            </View>
          </View>

          <View style={styles.section}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                    <Text style={styles.detailValue}>{buyer.phoneNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("location")}</Text>
                    <Text style={styles.detailValue}>{buyer.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("createdAt")}</Text>
                    <Text style={styles.detailValue}>{buyer.createdAt}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {!isOwner && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleRequestChat}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                <Text style={styles.chatButtonText}>Request Chat</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header1: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#008F4C",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#008F4C",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#008F4C",
    marginBottom: 8,
  },
  quickInfo: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginRight: 40,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    overflow: "hidden",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  placeholderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  initialContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#333",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  chatButton: {
    backgroundColor: "#008F4C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
});

export default ViewBuyerScreen;*/

//second for chat  //correct
/*import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchBuyerById, Buyer } from "../services/buyers/ViewBuyerScreenService";
import { getAuth } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import {
  createNewChat,
  findExistingChat,
} from "../services/chat/ChatScreenServices";
import { BuyerSkeleton } from "../components/BuyerSkeleton";
import { getUserById } from "../services/users/UserService";

const ViewBuyerScreen = ({ route }: any) => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null); // New state for creator name

  type ViewBuyerScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ViewBuyerScreen"
  >;

  const navigation = useNavigation<ViewBuyerScreenNavigationProp>();

  const loadBuyer = async (buyerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedBuyer = await fetchBuyerById(buyerId);
      if (fetchedBuyer) {
        setBuyer(fetchedBuyer);
        // Fetch the name of the buyer's creator
        if (fetchedBuyer.addedBy) {
          const creatorData = await getUserById(fetchedBuyer.addedBy);
          setCreatorName(creatorData?.name || "Unknown");
        }
      } else {
        setError(t("buyerNotFound"));
      }
    } catch (err) {
      console.error("Error fetching buyer:", err);
      setError(err instanceof Error ? err.message : t("loadItemsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.buyerId) {
      loadBuyer(route.params.buyerId);
    } else {
      setError(t("buyerNotFound"));
      setLoading(false);
    }
  }, [route.params?.buyerId]);

  const handleRequestChat = async () => {
    if (!buyer || !buyer.addedBy) {
      return; // Ensure addedBy is available
    }
    setButtonLoading(true);
    const currentUserId = getAuth().currentUser?.uid;
    if (!currentUserId) return;
    try {
      // Use findExistingChat and createNewChat to set up a chat with the buyer's creator
      const existingChatId = await findExistingChat(
        currentUserId,
        buyer.addedBy
      );
      let chatIdToUse;
      if (existingChatId) {
        chatIdToUse = existingChatId;
      } else {
        if (creatorName) {
          chatIdToUse = await createNewChat(
            currentUserId,
            buyer.addedBy,
            creatorName
          );
        } else {
          chatIdToUse = await createNewChat(
            currentUserId,
            buyer.addedBy,
            "Unknow"
          );
        }
      }

      navigation.navigate("ViewChatScreen", {
        chatId: chatIdToUse,
        receiverId: buyer.addedBy, // Set receiverId to the buyer's creator
        receiverName: creatorName || "Unknown", // set receiver name to the buyer creator.
      });
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <BuyerSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={[styles.loadingText, { color: "#FF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            route.params?.buyerId && loadBuyer(route.params.buyerId)
          }
        >
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!buyer) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("buyerNotFound")}</Text>
      </SafeAreaView>
    );
  }

  const userId = getAuth().currentUser?.uid;
  const isOwner = buyer.addedBy === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header1}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.inlineHeader}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
          <Text style={styles.headerTitle}>{buyer.name}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.placeholderContainer}>
            <View style={styles.initialContainer}>
              <Text style={styles.initialText}>
                {buyer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{buyer.name || "No Name"}</Text>
            <Text style={styles.price}>
              {t("rs")}
              {buyer.price.toLocaleString()}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>{buyer.itemType}</Text>
            </View>
          </View>*/
          {/*{buyer.description ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{t("description")}</Text>
              <Text style={styles.descriptionText}>{buyer.description}</Text>
            </View>
          ) : null}*/}

          /*<View style={styles.section}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                    <Text style={styles.detailValue}>{buyer.phoneNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("location")}</Text>
                    <Text style={styles.detailValue}>{buyer.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("createdAt")}</Text>
                    <Text style={styles.detailValue}>{buyer.createdAt}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {!isOwner && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleRequestChat}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                <Text style={styles.chatButtonText}>{t("requestChat")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header1: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#008F4C",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#008F4C",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#008F4C",
    marginBottom: 8,
  },
  quickInfo: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginRight: 40,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Placeholder style
  placeholderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  initialContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#333",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  chatButton: {
    backgroundColor: "#008F4C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ViewBuyerScreen;*/

import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchBuyerById, Buyer } from "../services/buyers/ViewBuyerScreenService";
import { getAuth } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import {
  createNewChat,
  findExistingChat,
} from "../services/chat/ChatScreenServices";
import { BuyerSkeleton } from "../components/BuyerSkeleton";
import { getUserById } from "../services/users/UserService";

const ViewBuyerScreen = ({ route }: any) => {
  const [buyer, setBuyer] = useState<Buyer | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [buttonLoading, setButtonLoading] = useState(false);
  const [creatorName, setCreatorName] = useState<string | null>(null); // New state for creator name

  type ViewBuyerScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ViewBuyerScreen"
  >;

  const navigation = useNavigation<ViewBuyerScreenNavigationProp>();

  const loadBuyer = async (buyerId: string) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedBuyer = await fetchBuyerById(buyerId);
      if (fetchedBuyer) {
        setBuyer(fetchedBuyer);
        // Fetch the name of the buyer's creator
        if (fetchedBuyer.addedBy) {
          const creatorData = await getUserById(fetchedBuyer.addedBy);
          setCreatorName(creatorData?.name || "Unknown");
        }
      } else {
        setError(t("buyerNotFound"));
      }
    } catch (err) {
      console.error("Error fetching buyer:", err);
      setError(err instanceof Error ? err.message : t("loadItemsFailed"));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.buyerId) {
      loadBuyer(route.params.buyerId);
    } else {
      setError(t("buyerNotFound"));
      setLoading(false);
    }
  }, [route.params?.buyerId]);

  const handleRequestChat = async () => {
    if (!buyer || !buyer.addedBy) {
      return; // Ensure addedBy is available
    }
    setButtonLoading(true);
    const currentUserId = getAuth().currentUser?.uid;
    if (!currentUserId) return;
    try {
      // Use findExistingChat and createNewChat to set up a chat with the buyer's creator
      const existingChatId = await findExistingChat(
        currentUserId,
        buyer.addedBy
      );
      let chatIdToUse;
      if (existingChatId) {
        chatIdToUse = existingChatId;
      } else {
          chatIdToUse = await createNewChat(
            currentUserId,
            buyer.addedBy,
            creatorName || "Unknow"
          );
        
      }

      navigation.navigate("ViewChatScreen", {
        chatId: chatIdToUse,
        receiverId: buyer.addedBy, // Set receiverId to the buyer's creator
        receiverName: creatorName || "Unknown", // set receiver name to the buyer creator.
      });
    } catch (error) {
      console.error("Error creating chat:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <BuyerSkeleton />
      </SafeAreaView>
    );
  }

  if (error) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Ionicons name="alert-circle-outline" size={48} color="#FF4444" />
        <Text style={[styles.loadingText, { color: "#FF4444" }]}>{error}</Text>
        <TouchableOpacity
          style={styles.retryButton}
          onPress={() =>
            route.params?.buyerId && loadBuyer(route.params.buyerId)
          }
        >
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!buyer) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("buyerNotFound")}</Text>
      </SafeAreaView>
    );
  }

  const userId = getAuth().currentUser?.uid;
  const isOwner = buyer.addedBy === userId;

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar
        barStyle="dark-content"
        backgroundColor="transparent"
        translucent
      />
      <View style={styles.header1}>
        <TouchableOpacity
          onPress={() => navigation.goBack()}
          style={styles.inlineHeader}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
          <Text style={styles.headerTitle}>{buyer.name}</Text>
        </TouchableOpacity>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.placeholderContainer}>
            <View style={styles.initialContainer}>
              <Text style={styles.initialText}>
                {buyer.name.charAt(0).toUpperCase()}
              </Text>
            </View>
          </View>

          <View style={styles.header}>
            <Text style={styles.title}>{buyer.name || "No Name"}</Text>
            <Text style={styles.price}>
              {t("rs")}
              {buyer.price.toLocaleString()}
            </Text>
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>{buyer.itemType}</Text>
            </View>
          </View>
         

          <View style={styles.section}>
            <View style={styles.detailsGrid}>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="person-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("phoneNumber")}</Text>
                    <Text style={styles.detailValue}>{buyer.phoneNumber}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="location-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("location")}</Text>
                    <Text style={styles.detailValue}>{buyer.location}</Text>
                  </View>
                </View>
              </View>
              <View style={styles.detailRow}>
                <View style={styles.detailItem}>
                  <Ionicons
                    name="calendar-outline"
                    size={20}
                    color="#008F4C"
                    style={styles.detailIcon}
                  />
                  <View>
                    <Text style={styles.detailLabel}>{t("createdAt")}</Text>
                    <Text style={styles.detailValue}>{buyer.createdAt}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>
      {!isOwner && (
        <View style={styles.bottomContainer}>
          <TouchableOpacity
            style={styles.chatButton}
            onPress={handleRequestChat}
            disabled={buttonLoading}
          >
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="chatbubbles-outline" size={20} color="#fff" />
                <Text style={styles.chatButtonText}>{t("requestChat")}</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      )}
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header1: {
    paddingHorizontal: 16,
    paddingTop: 40,
  },
  inlineHeader: {
    flexDirection: "row",
    alignItems: "center",
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: "600",
    color: "#008F4C",
    marginLeft: 10,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  loadingText: {
    fontSize: 16,
    color: "#008F4C",
  },
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  contentContainer: {
    flex: 1,
    padding: 20,
  },
  header: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 8,
  },
  price: {
    fontSize: 28,
    fontWeight: "700",
    color: "#008F4C",
    marginBottom: 8,
  },
  quickInfo: {
    flexDirection: "row",
    backgroundColor: "#f8f8f8",
    padding: 15,
    borderRadius: 12,
    marginBottom: 24,
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginLeft: 10,
    marginRight: 40,
  },
  infoText: {
    fontSize: 14,
    color: "#666",
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#1a1a1a",
    marginBottom: 12,
  },
  descriptionText: {
    fontSize: 16,
    lineHeight: 24,
    color: "#666",
  },
  detailsGrid: {
    gap: 12,
  },
  detailRow: {
    backgroundColor: "#f8f8f8",
    borderRadius: 12,
    overflow: "hidden",
  },
  detailItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
  },
  detailIcon: {
    marginRight: 12,
  },
  detailLabel: {
    fontSize: 14,
    color: "#666",
    marginBottom: 4,
  },
  detailValue: {
    fontSize: 16,
    color: "#1a1a1a",
  },
  retryButton: {
    marginTop: 16,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#008F4C",
    borderRadius: 8,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  // Placeholder style
  placeholderContainer: {
    width: "100%",
    alignItems: "center",
    marginBottom: 20,
  },
  initialContainer: {
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 60,
    fontWeight: "bold",
    color: "#333",
  },
  bottomContainer: {
    padding: 16,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderTopColor: "#f0f0f0",
  },
  chatButton: {
    backgroundColor: "#008F4C",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  chatButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
});

export default ViewBuyerScreen;

