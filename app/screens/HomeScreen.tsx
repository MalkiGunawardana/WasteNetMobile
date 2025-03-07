import React, { useEffect, useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Image,
  RefreshControl,
  Alert,
  BackHandler,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  fetchRecentItems,
  fetchRecentBuyers,
  fetchUserItems,
  getUserName,
} from "../services/homeServices";
import { RecentItemType, RecentBuyerType } from "../types/home";
import { auth, db } from "../../firebaseConfig";
import AntDesign from "@expo/vector-icons/AntDesign";
import FontAwesome5 from "@expo/vector-icons/FontAwesome5";
import { RootStackParamList } from "../types/navigation";
import { t } from "i18next";
import { collection, query, where, getDocs } from "firebase/firestore";

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function HomeScreen() {
  const navigation = useNavigation<NavigationProp>();
  const [recentItems, setRecentItems] = useState<RecentItemType[]>([]);
  const [recentBuyers, setRecentBuyers] = useState<RecentBuyerType[]>([]);
  const [userItems, setUserItems] = useState<RecentItemType[]>([]);
  const [userName, setUserName] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [unreadOffersCount, setUnreadOffersCount] = useState(0);

  const currentUser = auth.currentUser;

  // Fetch data when the screen comes into focus
  useFocusEffect(
    useCallback(() => {
      refreshData();
    }, [])
  );

  useFocusEffect(
    //back function
    useCallback(() => {
      const backAction = () => {
        Alert.alert("Exit App", "Are you sure you want to exit?", [
          { text: "Cancel", onPress: () => null, style: "cancel" },
          { text: "Exit", onPress: () => BackHandler.exitApp() },
        ]);
        return true;
      };

      const backHandler = BackHandler.addEventListener(
        "hardwareBackPress",
        backAction
      );

      return () => backHandler.remove();
    }, [])
  );

  // notification count
  useEffect(() => {
    const fetchUnreadOffersCount = async () => {
      try {
        if (currentUser?.uid) {
          const offersQuery = query(
            collection(db, "offers"),
            where("viewedCustomerId", "==", currentUser.uid),
            where("read", "==", false)
          );

          const offersSnapshot = await getDocs(offersQuery);
          setUnreadOffersCount(offersSnapshot.size);
        }
      } catch (error) {
        console.error("Failed to load unread offers count:", error);
      }
    };

    fetchUnreadOffersCount();
  }, [currentUser?.uid]);

  // Get recent items
  useEffect(() => {
    const loadRecentItems = async () => {
      try {
        const items = await fetchRecentItems();
        setRecentItems(items);
      } catch (error) {
        console.error("Failed to load recent items:", error);
      }
    };

    loadRecentItems();
  }, []);

  // Get recent buyers
  useEffect(() => {
    const loadRecentBuyers = async () => {
      try {
        const buyers = await fetchRecentBuyers();
        setRecentBuyers(buyers);
      } catch (error) {
        console.error("Failed to load recent buyers:", error);
      }
    };

    loadRecentBuyers();
  }, []);

  // Get user name
  useEffect(() => {
    const fetchUserName = async () => {
      const currentUser = auth.currentUser;
      if (currentUser?.uid) {
        const name = await getUserName(currentUser.uid);
        setUserName(name);
      }
    };

    fetchUserName();
  }, []);

  // Refresh data function
  const refreshData = async () => {
    setIsRefreshing(true);
    try {
      if (currentUser?.uid) {
        const items = await fetchUserItems(currentUser.uid);
        setUserItems(items);
      }

      const items = await fetchRecentItems();
      setRecentItems(items);

      const buyers = await fetchRecentBuyers();
      setRecentBuyers(buyers);
    } catch (error) {
      console.error("Failed to refresh data:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const actionButtons: {
    title: string;
    icon: "shoppingcart" | "gift" | "user";
    color: string;
    onPress: () => void;
  }[] = [
    {
      title: t("explore"),
      icon: "shoppingcart",
      color: "#008F4C",
      onPress: () => navigation.navigate("Explore"),
    },
    {
      title: t("addItem"),
      icon: "gift",
      color: "#008F4C",
      onPress: () => navigation.navigate("AddItem"),
    },
    {
      title: t("addBuyer"),
      icon: "user",
      color: "#008F4C",
      onPress: () => navigation.navigate("AddBuyer"),
    },
  ];

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      <View style={styles.header}>
        <View>
          <Text style={styles.welcomeUser}>{userName}</Text>
          <Text style={styles.welcomeText}>{t("welcomeBack")}</Text>
          <Text style={styles.dateText}>{new Date().toLocaleDateString()}</Text>
        </View>
        <TouchableOpacity
          style={styles.notificationButton}
          onPress={() => navigation.navigate("Notifications")}
        >
          <FontAwesome5 name="bell" size={24} color="#008F4C" />
          {unreadOffersCount > 0 && (
            <View style={styles.notificationBadge}>
              <Text style={styles.notificationBadgeText}>
                {unreadOffersCount}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      <ScrollView
        refreshControl={
          <RefreshControl refreshing={isRefreshing} onRefresh={refreshData} />
        }
      >
        <View style={styles.actionButtons}>
          {actionButtons.map((button, index) => (
            <TouchableOpacity
              key={index}
              style={styles.actionButton}
              onPress={button.onPress}
            >
              <AntDesign name={button.icon} size={24} color={button.color} />
              <Text style={styles.actionButtonText}>{button.title}</Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("myItems")}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("UserItemsScreen")}
            >
              <Text style={styles.seeAllText}>{t("seeMore")}</Text>
            </TouchableOpacity>
          </View>

          {/* Horizontal scrolling for My Items */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentItemsScroll}
          >
            {userItems.length > 0 ? (
              userItems.map((item) => (
                <TouchableOpacity
                  key={item.id}
                  style={styles.recentItemCard}
                  onPress={() =>
                    navigation.navigate("ViewItemScreen", { itemId: item.id })
                  }
                >
                  <Image
                    source={{ uri: item.images[0] }}
                    style={styles.recentItemImage}
                    defaultSource={require("../assets/wastenet-icon.png")}
                  />
                  <View style={styles.recentItemInfo}>
                    <Text style={styles.recentItemTitle}>{item.title}</Text>
                    <Text style={styles.recentItemType}>{item.itemType}</Text>
                    {item.price !== null && item.price !== undefined ? (
                      <Text style={styles.recentItemPrice}>
                        Rs. {item.price}
                      </Text>
                    ) : (
                      <Text style={styles.recentItemPrice}>
                        {t("donation")}
                      </Text>
                    )}
                  </View>
                </TouchableOpacity>
              ))
            ) : (
              <Text style={styles.noItemsText}>{t("noItemsFound")}</Text>
            )}
          </ScrollView>
        </View>

        {/* Recent Items Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("recentlyAdded")}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("Explore")}
            >
              <Text style={styles.seeAllText}>{t("seeMore")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentItemsScroll}
          >
            {recentItems.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.recentItemCard}
                onPress={() =>
                  navigation.navigate("ViewItemScreen", { itemId: item.id })
                }
              >
                <Image
                  source={{ uri: item.images[0] }}
                  style={styles.recentItemImage}
                  defaultSource={require("../assets/wastenet-icon.png")}
                />
                <View style={styles.recentItemInfo}>
                  <Text style={styles.recentItemTitle}>{item.title}</Text>
                  <Text style={styles.recentItemType}>{item.itemType}</Text>
                  {item.price && (
                    <Text style={styles.recentItemPrice}>{item.price}</Text>
                  )}
                  <Text style={styles.recentItemUserTitle}>{t("addedBy")}</Text>
                  <Text style={styles.recentItemUser}> {item.addedBy}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* Recent Buyers Section */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{t("recentlyAddedBuyers")}</Text>
            <TouchableOpacity
              style={styles.seeAllButton}
              onPress={() => navigation.navigate("AllBuyersScreen")} // Navigate to AllBuyersScreen
            >
              <Text style={styles.seeAllText}>{t("seeMore")}</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.recentItemsScroll}
          >
            {recentBuyers.map((buyer) => (
              <TouchableOpacity
                key={buyer.id}
                style={styles.recentItemCard}
                onPress={() =>
                  navigation.navigate("ViewBuyerScreen", { buyerId: buyer.id })
                }
              >
                <View style={styles.initialContainer}>
                  <Text style={styles.initialText}>
                    {buyer.name.charAt(0).toUpperCase()}
                  </Text>
                </View>
                <View style={styles.recentItemInfo}>
                  <Text style={styles.recentItemTitle}>{buyer.name}</Text>
                  <Text style={styles.recentItemType}>{buyer.itemType}</Text>
                  <Text style={styles.recentItemPrice}>Rs. {buyer.price}</Text>
                  <Text style={styles.recentItemUserTitle}>{t("location")}</Text>
                  <Text style={styles.recentItemUser}>{buyer.location}</Text>
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  noItemsText: {
    color: "#666",
    fontSize: 14,
    textAlign: "center",
    padding: 20,
  },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: "bold",
  },
  welcomeUser: {
    fontSize: 15,
    fontWeight: "bold",
    color: "#008F4C",
  },
  dateText: {
    color: "#666",
    marginTop: 4,
  },
  notificationButton: {
    position: "relative",
    padding: 8,
  },
  notificationBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    backgroundColor: "#ff4444",
    borderRadius: 10,
    minWidth: 20,
    height: 20,
    justifyContent: "center",
    alignItems: "center",
  },
  notificationBadgeText: {
    color: "#fff",
    fontSize: 12,
    fontWeight: "bold",
  },
  actionButtons: {
    flexDirection: "row",
    justifyContent: "space-around",
    padding: 5,
    textAlign: "center",
  },
  actionButton: {
    alignItems: "center",
    gap: 8,
    backgroundColor: "#f5f5f5",
    width: 120,
    height: 70,
    justifyContent: "center",
    textAlign: "center",
    borderRadius: 12,
  },
  actionButtonText: {
    color: "#008F4C",
    fontSize: 12,
    fontWeight: "500",
    textAlign: "center",
  },
  section: {
    padding: 20,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "600",
  },
  seeAllButton: {
    padding: 4,
  },
  seeAllText: {
    color: "#008F4C",
    fontSize: 14,
    fontWeight: "500",
  },
  statusActive: {
    backgroundColor: "#008F4C",
  },
  statusText: {
    color: "#fff",
    fontSize: 12,
  },
  recentItemsScroll: {
    paddingBottom: 20,
  },
  recentItemCard: {
    backgroundColor: "#f5f5f5",
    borderRadius: 16,
    marginRight: 16,
    width: 220,
    padding: 16,
    flexDirection: "row",
    alignItems: "center",
  },
  recentItemImage: {
    width: 90,
    height: 90,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  recentItemInfo: {
    flex: 1,
    marginLeft: 12,
  },
  recentItemTitle: {
    fontSize: 16,
    fontWeight: "600",
    color: "#333",
  },
  recentItemType: {
    color: "#666",
    fontSize: 14,
    marginTop: 4,
  },
  recentItemPrice: {
    color: "#008F4C",
    fontSize: 16,
    fontWeight: "600",
    marginTop: 8,
  },
  recentItemUser: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
  },
  recentItemUserTitle: {
    color: "#666",
    fontSize: 12,
    marginTop: 4,
    fontWeight: "700",
  },
    //initial container and initial text
    initialContainer: {
        width:40,
        height:40,
        borderRadius:20,
        alignItems:'center',
        justifyContent:'center',
        backgroundColor:'#ddd'
    },
    initialText: {
        fontSize:20,
        fontWeight:'bold',
        color:'#333'
    }
});