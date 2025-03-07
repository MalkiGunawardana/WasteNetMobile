import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Dimensions,
  SafeAreaView,
  StatusBar,
  ActivityIndicator,
  Alert,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { fetchItemById, Item } from "../services/items/ViewItemScreenService";
import { getAuth } from "firebase/auth";
import { StackNavigationProp } from "@react-navigation/stack";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import {
  getFirestore,
  doc,
  getDoc,
  collection,
  addDoc,
  query,
  where,
  getDocs,
} from "firebase/firestore";
import { ItemSkeleton } from "../components/ItemSkeleton";

const { width } = Dimensions.get("window");

const ViewItemScreen = ({ route }: any) => {
  const [item, setItem] = useState<Item | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [activeImageIndex] = useState(0);
  const [offerSent, setOfferSent] = useState(false);
  const firestore = getFirestore();
  const [buttonLoading, setButtonLoading] = useState(false);

  type ViewItemScreenNavigationProp = StackNavigationProp<
    RootStackParamList,
    "ViewItemScreen"
  >;

  const navigation = useNavigation<ViewItemScreenNavigationProp>();

  // Load item details by ID
  const loadItem = async (itemId: string) => {
    try {
      setLoading(true);
      setError(null);

      const fetchedItem = await fetchItemById(itemId);
      setItem(fetchedItem);

      if (userId) {
        checkOfferStatus(itemId, userId);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t("loadItemsFailed"));
    } finally {
      setLoading(false);
    }
  };

  const checkOfferStatus = async (itemId: string, customerId: string) => {
    const offersRef = collection(firestore, "offers");
    const q = query(
      offersRef,
      where("itemId", "==", itemId),
      where("customerId", "==", customerId)
    );
    const querySnapshot = await getDocs(q);

    setOfferSent(!querySnapshot.empty);
  };

  const handleSendOffer = async () => {
    if (!userId || !item) return;

    setButtonLoading(true); // Set button loading to true

    try {
      const offerData = {
        itemId: item.id,
        customerId: userId,
        viewedCustomerId: item.addedBy,
        time: new Date(),
        read: false,
      };

      await addDoc(collection(firestore, "offers"), offerData);

      setOfferSent(true);
      Alert.alert(t("offerSentSuccessfully"));
    } catch (error) {
      Alert.alert(t("failedToSendOffer"));
      console.error("Error sending offer:", error);
    } finally {
      setButtonLoading(false);
    }
  };

  useEffect(() => {
    if (route.params?.itemId) {
      loadItem(route.params.itemId);
    } else {
      setError(t("itemNotFound"));
      setLoading(false);
    }
  }, [route.params?.itemId]);

  if (loading) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar
          barStyle="dark-content"
          backgroundColor="transparent"
          translucent
        />
        <ItemSkeleton />
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
          onPress={() => route.params?.itemId && loadItem(route.params.itemId)}
        >
          <Text style={styles.retryButtonText}>{t("retry")}</Text>
        </TouchableOpacity>
      </SafeAreaView>
    );
  }

  if (!item) {
    return (
      <SafeAreaView style={styles.loadingContainer}>
        <Text style={styles.loadingText}>{t("itemNotFound")}</Text>
      </SafeAreaView>
    );
  }

  const userId = getAuth().currentUser?.uid;
  const isOwner = item.addedBy === userId;

  const renderImageIndicators = () => (
    <View style={styles.imageIndicators}>
      {item.images.map((_: any, index: React.Key | null | undefined) => (
        <View
          key={index}
          style={[
            styles.indicator,
            index === activeImageIndex && styles.activeIndicator,
          ]}
        />
      ))}
    </View>
  );

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
          <Text style={styles.headerTitle}>{item.title}</Text>
        </TouchableOpacity>
        <View style={styles.imageContainer}>
          <ScrollView
            horizontal
            pagingEnabled
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={{ flexGrow: 1 }}
            scrollEventThrottle={16}
          >
            {item.images.map(
              (image: any, index: React.Key | null | undefined) => (
                <Image
                  key={index}
                  source={{ uri: image }}
                  style={styles.image}
                  resizeMode="cover"
                />
              )
            )}
          </ScrollView>
          {renderImageIndicators()}
        </View>
      </View>
      <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
        <View style={styles.contentContainer}>
          <View style={styles.header}>
            <Text style={styles.title}>{item.title || "No Title"}</Text>
            {item.transactionType !== "donate" && (
              <Text style={styles.price}>
                {t("rs")}
                {item.price.toLocaleString()}
              </Text>
            )}
          </View>

          <View style={styles.quickInfo}>
            <View style={styles.infoItem}>
              <Ionicons name="cube-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>{item.itemType}</Text>
            </View>
            <View style={styles.infoItem}>
              <Ionicons name="repeat-outline" size={20} color="#008F4C" />
              <Text style={styles.infoText}>
                {item.transactionType.charAt(0).toUpperCase() +
                  item.transactionType.slice(1)}
              </Text>
            </View>
          </View>

          <View style={styles.section}>
            <Text style={styles.sectionTitle}>{t("description")}</Text>
            <Text style={styles.description}>{item.description}</Text>
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
                    <Text style={styles.detailLabel}>{t("addedBy")}</Text>
                    <Text style={styles.detailValue}>{item.userName}</Text>
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
                    <Text style={styles.detailValue}>{item.createdAt}</Text>
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
                    <Text style={styles.detailValue}>{item.location}</Text>
                  </View>
                </View>
              </View>
            </View>
          </View>
        </View>
      </ScrollView>

      <View style={styles.bottomContainer}>
        {isOwner ? (
          <TouchableOpacity
            style={styles.updateButton}
            onPress={() =>
              navigation.navigate("UpdateItem", { itemId: item.id })
            }
          >
            <Text style={styles.updateButtonText}>{t("updateItem")}</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={[
              styles.offerButton,
              (offerSent || buttonLoading) && styles.disabledButton,
            ]}
            disabled={offerSent || buttonLoading}
            onPress={handleSendOffer}
          >
            {buttonLoading ? (
              <ActivityIndicator size="small" color="#fff" />
            ) : (
              <>
                <Ionicons name="pricetag-outline" size={20} color="#fff" />
                <Text style={styles.offerButtonText}>
                  {offerSent ? t("offerSent") : t("sendOffer")}
                </Text>
              </>
            )}
          </TouchableOpacity>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  offerButton: {
    backgroundColor: "#008F4C",
    padding: 16,
    borderRadius: 12,
    alignItems: "center",
    flexDirection: "row",
    justifyContent: "center",
  },
  disabledButton: {
    backgroundColor: "#ccc",
    opacity: 0.7,
  },
  offerButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
    marginLeft: 8,
  },
  updateButton: {
    backgroundColor: "#008F4C",
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
    alignItems: "center",
  },
  updateButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  header: {
    paddingHorizontal: 16,
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
  imageContainer: {
    height: width - 40,
    width: width - 40,
    position: "relative",
    borderRadius: 10,
    overflow: "hidden",
    marginTop: 20,
    alignSelf: "center",
    elevation: 2,
  },
  scrollView: {
    height: "100%",
    width: "100%",
  },
  image: {
    width: width - 40,
    height: width - 40,
    alignSelf: "center",
  },
  imageIndicators: {
    position: "absolute",
    bottom: 10,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
  },
  indicator: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(255, 255, 255, 0.5)",
    marginHorizontal: 3,
  },
  activeIndicator: {
    backgroundColor: "#fff",
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  iconBackground: {
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    borderRadius: 20,
    padding: 8,
  },
  contentContainer: {
    flex: 1,
    padding: 20,
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
  description: {
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
});

export default ViewItemScreen;