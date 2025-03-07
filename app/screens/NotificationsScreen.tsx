import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "react-native-screens/lib/typescript/native-stack/types";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  query,
  where,
  onSnapshot,
  updateDoc,
  doc,
  getDoc,
  type Timestamp,
} from "firebase/firestore";
import { ActivityIndicator } from "react-native";

type RootStackParamList = {
  ViewItemScreen: { itemId: string };
  ViewChatScreen: { receiverId: string; receiverName: string };
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

interface Offer {
  id: string;
  itemId: string;
  customerId: string;
  customerName?: string;
  time: Timestamp;
  isAccepted: boolean | null;
  read: boolean;
  itemTitle?: string;
}

export default function NotificationsScreen() {
  const navigation = useNavigation<NavigationProp>();
  const currentUserId = getAuth().currentUser?.uid;
  const [loading, setLoading] = useState(true);

  const db = getFirestore();

  const [offers, setOffers] = useState<Offer[]>([]);

  useEffect(() => {
    if (!currentUserId) return;

    const offersQuery = query(
      collection(db, "offers"),
      where("viewedCustomerId", "==", currentUserId)
    );

    const unsubscribe = onSnapshot(offersQuery, async (snapshot) => {
      const offersData: Offer[] = [];

      for (const docSnapshot of snapshot.docs) {
        const offerData = docSnapshot.data();

        // Fetch item title
        const itemRef = doc(db, "items", offerData.itemId);
        const itemSnapshot = await getDoc(itemRef);
        const itemTitle = itemSnapshot.exists()
          ? itemSnapshot.data()?.title
          : "Unknown Item";

        // Fetch customer name
        const userRef = doc(db, "users", offerData.customerId);
        const userSnapshot = await getDoc(userRef);
        const customerName = userSnapshot.exists()
          ? userSnapshot.data()?.displayName
          : "Unknown User";

        offersData.push({
          id: docSnapshot.id,
          itemId: offerData.itemId,
          customerId: offerData.customerId,
          customerName,
          time: offerData.time,
          isAccepted: offerData.isAccepted ?? null,
          read: offerData.read || false,
          itemTitle,
        });
      }

      offersData.sort((a, b) => b.time.seconds - a.time.seconds);
      setOffers(offersData);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [currentUserId, db]);

  const handleAcceptOffer = async (
    offerId: string,
    customerId: string,
    customerName: string
  ) => {
    try {
      const offerRef = doc(db, "offers", offerId);
      await updateDoc(offerRef, {
        isAccepted: true,
        read: true,
      });
    } catch (error) {
      console.error("Error accepting offer:", error);
      Alert.alert("Error", "Failed to accept offer. Please try again.");
    }
  };

  const handleRejectOffer = async (offerId: string) => {
    try {
      const offerRef = doc(db, "offers", offerId);
      await updateDoc(offerRef, {
        isAccepted: false,
        read: true,
      });
      Alert.alert("Success", "Offer rejected successfully!");
    } catch (error) {
      console.error("Error rejecting offer:", error);
      Alert.alert("Error", "Failed to reject offer. Please try again.");
    }
  };

  const markAsRead = async (offerId: string) => {
    const offerRef = doc(db, "offers", offerId);
    await updateDoc(offerRef, {
      read: true,
    });
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
        </TouchableOpacity>
        <Text style={styles.headerText}>Notifications</Text>
      </View>
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#008F4C" />
        </View>
      ) : (
        <ScrollView contentContainerStyle={styles.scrollView}>
          {offers.map((offer) => (
            <View
              key={offer.id}
              style={[
                styles.notificationItem,
                !offer.read && styles.unreadNotification,
              ]}
            >
              <View style={styles.notificationIcon}>
                <Ionicons name="pricetag" size={24} color="#008F4C" />
              </View>
              <View style={styles.notificationContent}>
                {/* <TouchableOpacity
                  onPress={() => {
                    markAsRead(offer.id);
                    navigation.navigate("ViewItemScreen", {
                      itemId: offer.itemId,
                    });
                  }}
                >
                  <Text style={styles.notificationTitle}>Messaging Request</Text>
                  <Text style={styles.notificationMessage}>
                    {offer.customerName} wants to chat with you about{" "}
                    {offer.itemTitle}
                  </Text>
                  <Text style={styles.notificationTime}>
                    {offer.time.toDate().toLocaleString()}
                  </Text>
                </TouchableOpacity> */}

                {offer.isAccepted === null && !offer.read && (
                  <View style={styles.actionButtons}>
                    <TouchableOpacity
                      style={[styles.actionButton, styles.acceptButton]}
                      onPress={() =>
                        handleAcceptOffer(
                          offer.id,
                          offer.customerId,
                          offer.customerName ?? ""
                        )
                      }
                    >
                      <Text style={styles.actionButtonText}>Accept</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={[styles.actionButton, styles.rejectButton]}
                      onPress={() => handleRejectOffer(offer.id)}
                    >
                      <Text
                        style={[
                          styles.actionButtonText,
                          styles.rejectButtonText,
                        ]}
                      >
                        Reject
                      </Text>
                    </TouchableOpacity>
                  </View>
                )}

                {offer.isAccepted !== null && (
                  <View style={styles.statusContainer}>
                    <Text
                      style={[
                        styles.statusText,
                        offer.isAccepted
                          ? styles.acceptedText
                          : styles.rejectedText,
                      ]}
                    >
                      {offer.isAccepted ? "Accepted" : "Rejected"}
                    </Text>

                    {offer.isAccepted && (
                      <TouchableOpacity
                        style={styles.inlineChatButton}
                        onPress={() =>
                          navigation.navigate("ViewChatScreen", {
                            receiverId: offer.customerId,
                            receiverName: offer.customerName ?? "",
                          })
                        }
                      >
                        <Text style={styles.inlineChatButtonText}>
                          Go to Chat
                        </Text>
                      </TouchableOpacity>
                    )}
                  </View>
                )}
              </View>
            </View>
          ))}

          {offers.length === 0 && (
            <View style={styles.emptyState}>
              <Ionicons name="notifications-off" size={48} color="#ccc" />
              <Text style={styles.emptyStateText}>No notifications yet</Text>
            </View>
          )}
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  statusContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 8,
    gap: 8,
  },
  inlineChatButton: {
    marginLeft: 8,
    marginTop: 8,
    padding: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: "#f2f2f2",
    backgroundColor: "#fff",
  },
  inlineChatButtonText: {
    color: "#008F4C",
    fontSize: 12,
    fontWeight: "500",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
    gap: 10,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008f4c",
  },
  scrollView: {
    flexGrow: 1,
  },
  notificationItem: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
    backgroundColor: "#fff",
  },
  unreadNotification: {
    backgroundColor: "#f0f9f4",
  },
  notificationIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#e6f4ea",
    justifyContent: "center",
    alignItems: "center",
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationContent: {
    flex: 1,
    marginLeft: 12,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: "500",
    color: "#121212",
  },
  notificationMessage: {
    color: "#666",
    marginTop: 4,
    fontSize: 14,
  },
  notificationTime: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  actionButtons: {
    flexDirection: "row",
    marginTop: 12,
    gap: 8,
  },
  actionButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 8,
    borderWidth: 1,
    minWidth: 100,
    alignItems: "center",
  },
  acceptButton: {
    backgroundColor: "#008F4C",
    borderColor: "#008F4C",
  },
  rejectButton: {
    backgroundColor: "#fff",
    borderColor: "#ff4444",
  },
  actionButtonText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "500",
  },
  rejectButtonText: {
    color: "#ff4444",
  },
  statusText: {
    marginTop: 8,
    fontSize: 14,
    fontWeight: "500",
  },
  acceptedText: {
    color: "#008F4C",
  },
  rejectedText: {
    color: "#ff4444",
  },
  emptyState: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingVertical: 40,
  },
  emptyStateText: {
    marginTop: 16,
    fontSize: 16,
    color: "#666",
  },
});