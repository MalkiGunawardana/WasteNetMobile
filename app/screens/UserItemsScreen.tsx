import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  Modal,
  Pressable,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  where,
  getDocs,
  orderBy,
  doc,
  updateDoc,
} from "firebase/firestore";
import { getAuth } from "firebase/auth";
import Ionicons from "@expo/vector-icons/Ionicons";
import { t } from "i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

interface UserItem {
  id: string;
  name: string;
  description: string;
  time: string;
  status: string;
  image: string;
}

export default function UserItemsScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [userItems, setUserItems] = useState<UserItem[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [selectedItem, setSelectedItem] = useState<UserItem | null>(null);
  const [modalVisible, setModalVisible] = useState<boolean>(false);

  // Fetch the items added by the current user
  useEffect(() => {
    const fetchUserItems = async () => {
      const userId = getAuth().currentUser?.uid;

      if (userId) {
        try {
          const firestore = getFirestore();
          const userItemsQuery = query(
            collection(firestore, "items"),
            orderBy("createdAt", "desc"),
            where("addedBy", "==", userId) //get items added by current user
          );
          const querySnapshot = await getDocs(userItemsQuery);

          const items: UserItem[] = querySnapshot.docs.map((doc) => ({
            id: doc.id,
            name: doc.data().title,
            description: doc.data().description,
            time: doc.data().createdAt?.toDate().toLocaleString() || "Unknown",
            status: doc.data().transactionType,
            image:
              doc.data().images && doc.data().images[0]
                ? doc.data().images[0]
                : "",
          }));

          setUserItems(items);
        } catch (error) {
          console.error("Error fetching items: ", error);
          Alert.alert("Error", "Failed to load items");
        } finally {
          setLoading(false);
        }
      } else {
        Alert.alert("Error", "No user authenticated");
        setLoading(false);
      }
    };

    fetchUserItems();
  }, []);

  // Update the status of an item
  const updateItemStatus = async (itemId: string, status: string) => {
    try {
      const firestore = getFirestore();
      const itemRef = doc(firestore, "items", itemId);
      await updateDoc(itemRef, { transactionType: status });

      setUserItems((prevItems) =>
        prevItems.map((item) =>
          item.id === itemId ? { ...item, status } : item
        )
      );
      setModalVisible(false);
      Alert.alert("Success", `Item status updated to "${status}"`);
    } catch (error) {
      console.error("Error updating item status: ", error);
      Alert.alert("Error", "Failed to update item status");
    }
  };

  const getStatusStyle = (status: string) => {
    switch (status) {
      case "sell":
        return { backgroundColor: "#d4f1d4" }; 
      case "donate":
        return { backgroundColor: "#d4e8f1" }; 
      case "sold":
        return { backgroundColor: "#f1d4d4" }; 
      case "donated":
        return { backgroundColor: "#f1ecd4" }; 
      default:
        return { backgroundColor: "#e6e6e6" }; 
    }
  };

  // Navigate to ViewItemScreen when an item is clicked
  const handleItemPress = (itemId: string) => {
    navigation.navigate("ViewItemScreen", { itemId });
  };

  return (// make ui for item list
    <SafeAreaView style={styles.container}>  
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("myItems")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008F4C" />
          </View>
        ) : (
          userItems.map((item) => (
            <TouchableOpacity
              key={item.id}
              onPress={() => handleItemPress(item.id)}
            >
              <View style={[styles.item]}>
                <View style={styles.itemImageContainer}>
                  {item.image ? (
                    <Image
                      source={{ uri: item.image }}
                      style={styles.itemImage}
                    />
                  ) : (
                    <Text>{t("noImage")}</Text>
                  )}
                </View>
                <View style={styles.itemContent}>
                  <Text style={styles.itemName}>{item.name}</Text>
                  <Text style={styles.itemDescription}>{item.description}</Text>
                  <Text style={[styles.status, getStatusStyle(item.status)]}>
                    {item.status}
                  </Text>
                  <Text style={styles.itemTime}>{item.time}</Text>
                </View>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => {
                    setSelectedItem(item);
                    setModalVisible(true);
                  }}
                >
                  <Ionicons name="ellipsis-vertical" size={24} color="#666" />
                </TouchableOpacity>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Status Update Modal */}
      {selectedItem && (
        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{t("updateStatus")}</Text>
              <Pressable
                  style={[styles.modalButton, styles.soldButton]}
                  onPress={() => updateItemStatus(selectedItem.id, "sold")}
                >
                  <Text style={styles.modalButtonText}>{t("markAsSold")}</Text>
                </Pressable>
                <Pressable
                  style={[styles.modalButton, styles.donatedButton]}
                  onPress={() => updateItemStatus(selectedItem.id, "donated")}
                >
                  <Text style={styles.modalButtonText}>{t("markAsDonated")}</Text>
                </Pressable>
                <Pressable
                    style={[styles.modalButton, styles.closeButton]}
                    onPress={() => setModalVisible(false)}
                  >
                    <Text style={styles.modalButtonText}>{t("cancel")}</Text>
                  </Pressable>
            </View>
          </View>
        </Modal>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  goBackButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "800",
    color: "#008F4C",
  },
  scrollView: {
    paddingVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  item: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  itemImageContainer: {
    width: 60,
    height: 60,
    borderRadius: 8,
    overflow: "hidden",
    backgroundColor: "#e6f4ea",
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: "100%",
    height: "100%",
    resizeMode: "cover",
  },
  itemContent: {
    flex: 1,
    marginLeft: 12,
  },
  itemName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  itemDescription: {
    color: "#666",
    marginTop: 4,
  },
  status: {
    padding: 4,
    width: 100,
    borderRadius: 8,
    textAlign: "center",
    color: "#1a1a1a",
  },
  itemTime: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
  actionButton: {
    justifyContent: "center",
    alignItems: "center",
    padding: 8,
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#008F4C",
    marginBottom: 16,
  },
  modalButton: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
    backgroundColor: "#bef7dd",
    alignItems: "center",
  },
  modalButtonText: {
    color: "#0a0a0a",
    fontSize: 16,
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#f2f2f2",
  },
  closeButtonText: {
    textAlign: "center",
    color: "#1c1c1c",
    fontSize: 14,
    fontWeight: "500",
  },
  soldButton: {
    backgroundColor: "#f1d4d4",
    opacity: 0.8
  },
  
  donatedButton: {
    backgroundColor: "#f1ecd4", 
    opacity: 0.8
  },
});