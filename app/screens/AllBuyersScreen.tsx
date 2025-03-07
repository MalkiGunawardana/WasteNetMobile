import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import {
  getFirestore,
  collection,
  query,
  getDocs,
  orderBy,
} from "firebase/firestore";
import Ionicons from "@expo/vector-icons/Ionicons";
import { t } from "i18next";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";

interface Buyer {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  itemType: string;
  price: string;
  createdAt: string;
  description: string;
}

export default function AllBuyersScreen() {
  const navigation = useNavigation<StackNavigationProp<RootStackParamList>>();
  const [buyers, setBuyers] = useState<Buyer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);

  // Fetch all buyers
  useEffect(() => {
    const fetchBuyers = async () => {
      try {
        const firestore = getFirestore();
        const buyersQuery = query(
          collection(firestore, "buyers"),
          orderBy("createdAt", "desc")
        );
        const querySnapshot = await getDocs(buyersQuery);

        const fetchedBuyers: Buyer[] = querySnapshot.docs.map((doc) => ({
          id: doc.id,
          name: doc.data().name,
          phoneNumber: doc.data().phoneNumber,
          location: doc.data().location,
          itemType: doc.data().itemType,
          price: doc.data().price,
          createdAt: doc.data().createdAt?.toDate().toLocaleString() || "Unknown",
          description: doc.data().description || "", // Get the description
        }));

        setBuyers(fetchedBuyers);
      } catch (error) {
        console.error("Error fetching buyers: ", error);
        Alert.alert("Error", "Failed to load buyers");
      } finally {
        setLoading(false);
      }
    };

    fetchBuyers();
  }, []);

  // Navigate to ViewBuyerScreen when a buyer is clicked
  const handleBuyerPress = (buyerId: string) => {
    navigation.navigate("ViewBuyerScreen", { buyerId });
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("allBuyers")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollView}>
        {loading ? (
          <View style={styles.loadingContainer}>
            <ActivityIndicator size="large" color="#008F4C" />
          </View>
        ) : (
          buyers.map((buyer) => (
            <TouchableOpacity
              key={buyer.id}
              onPress={() => handleBuyerPress(buyer.id)}
            >
              <View style={styles.buyer}>
                <View style={styles.initialContainer}>
                  <Text style={styles.initialText}>
                    {buyer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.buyerContent}>
                  <Text style={styles.buyerName}>{buyer.name}</Text>
                  {buyer.description ? (
                      <Text style={styles.buyerDescription} numberOfLines={2}>
                        {buyer.description.length > 50
                          ? buyer.description.substring(0, 50) + "..."
                          : buyer.description}
                      </Text>
                    ) : null}
                  <Text style={styles.buyerItemType}>{buyer.itemType}</Text>
                  <Text style={styles.buyerPrice}>{buyer.price}</Text>
                  <Text style={styles.buyerLocation}>{buyer.location}</Text>
                  <Text style={styles.buyerCreatedAt}>{buyer.createdAt}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>
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
    fontWeight: "bold", // Changed to "bold"
    color: "#008F4C",
  },
  scrollView: {
    paddingVertical: 0,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: "center",
  },
  buyer: {
    flexDirection: "row",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#f0f0f0",
  },
  initialContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: "#ddd",
    justifyContent: "center",
    alignItems: "center",
  },
  initialText: {
    fontSize: 20,
    fontWeight: "bold",
    color: "#333",
  },
  buyerContent: {
    flex: 1,
    marginLeft: 12,
  },
  buyerName: {
    fontSize: 16,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  buyerDescription: {
    color: "#666",
    marginTop: 4,
    marginBottom: 4,
  },
  buyerItemType: {
    color: "#666",
    marginTop: 4,
  },
  buyerPrice: {
    color: "#008F4C",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  buyerLocation: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  buyerCreatedAt: {
    color: "#999",
    fontSize: 12,
    marginTop: 4,
  },
});
