import * as React from "react";
import { useState, useEffect, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  Image,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { NavigationProp, useNavigation } from "@react-navigation/native";
import { t } from "i18next";
import {
  fetchItemsFromFirestore,
  Item,
  ItemCategory,
  filterItems,
} from "../services/ExploreScreenService";
import { DocumentData, QueryDocumentSnapshot } from "firebase/firestore";
import AntDesign from "@expo/vector-icons/AntDesign";
import { useTranslation } from "react-i18next";

export type RootStackParamList = {
  Explore: undefined;
  ViewItemScreen: { itemId: string };
};

export default function ExploreScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const categoryKeys: ItemCategory[] = [
    "All",
    "Plastic",
    "Paper",
    "Glass",
    "Metal",
    "Electronics",
  ];

  const categories = categoryKeys.map((key) => t(key.toLowerCase()));

  const [selectedCategory, setSelectedCategory] = useState<ItemCategory>("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [items, setItems] = useState<Item[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastDoc, setLastDoc] =
    useState<QueryDocumentSnapshot<DocumentData> | null>(null);
  const [hasMore, setHasMore] = useState(true);
  const [isFiltering, setIsFiltering] = useState(false);

  const fetchItems = useCallback( //fetching items
    async (refresh = false, loadMore = false) => {
      try {
        if (loadMore && !hasMore) return;

        if (loadMore) setIsLoadingMore(true);
        else setIsLoading(refresh);

        const result = await fetchItemsFromFirestore(
          loadMore && lastDoc ? lastDoc : undefined,
          selectedCategory,
          searchQuery
        );

        const filteredItems = filterItems(
          result.items,
          selectedCategory,
          searchQuery
        );

        setItems((prevItems) => {
          if (loadMore) {
            const newItems = filteredItems.filter(
              (newItem) => !prevItems.some((item) => item.id === newItem.id)
            );
            return [...prevItems, ...newItems];
          }
          return filteredItems;
        });

        setLastDoc(result.lastDoc);
        setHasMore(result.hasMore); //check if more items exist
        setError(null);
      } catch (error) {
        setError(
          error instanceof Error ? error.message : t("errorFetchingItems")
        );
      } finally {
        setIsLoading(false);
        setIsLoadingMore(false);
        setIsRefreshing(false);
        setIsFiltering(false);
      }
    },
    [selectedCategory, searchQuery, lastDoc, hasMore]
  );

  useEffect(() => {
    fetchItems(true);
  }, [selectedCategory, searchQuery]);

  const handleCategorySelect = useCallback((category: ItemCategory) => { // select categor
    setSelectedCategory(category);
    setSearchQuery("");
    setItems([]);
    setLastDoc(null);
    setHasMore(true);
    setIsFiltering(true);
    fetchItems(true);
  }, []);

  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setLastDoc(null);
    setHasMore(true);
    fetchItems(true);
  }, [fetchItems]);

  const handleLoadMore = useCallback(() => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      fetchItems(false, true);
    }
  }, [fetchItems, isLoadingMore, hasMore]);

  const renderItem = useCallback(
    ({ item }: { item: Item }) => (
      <TouchableOpacity
        key={item.id}
        style={styles.itemCard}
        onPress={() =>
          navigation.navigate("ViewItemScreen", { itemId: String(item.id) })
        }
      >
        {/* Image Display */}
        <View style={styles.itemImageContainer}>
          {item.images && item.images.length > 0 ? (
            <Image
              source={{ uri: item.images[0] }}
              style={styles.itemImage}
              resizeMode="cover"
            />
          ) : (
            <View style={styles.placeholderImage}>
              <Text style={styles.placeholderText}>{t("noImage")}</Text>
            </View>
          )}
        </View>

        {/* Title Display */}
        <Text style={styles.itemTitle} numberOfLines={2}>
          {item.title || t("unnamedItem")}
        </Text>

        {/* Transaction Type or Price */}
        {item.transactionType === "donate" ? (
          <Text style={styles.itemType}>{t("donation")}</Text>
        ) : (
          <Text style={styles.itemPrice}>
            Rs.{" "}
            {item.price ? item.price.toLocaleString() : t("priceNotAvailable")}{" "}
            {/* Translation key */}
          </Text>
        )}
      </TouchableOpacity>
    ),
    []
  );

  return (
    <SafeAreaView edges={["left", "right"]} style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <View style={styles.searchBar}>
          <AntDesign name="search1" size={20} color="#666" />
          <TextInput
            placeholder={t("searchItemsPlaceholder")}
            style={styles.searchInput}
            value={searchQuery}
            onChangeText={setSearchQuery}
            onSubmitEditing={() => fetchItems(true)}
          />
        </View>
      </View>

      {/* Categories */}
      <View style={styles.categoriesSection}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false}>
          <View style={styles.categoriesRow}>
            {categoryKeys.map((category) => (
              <TouchableOpacity
                key={category}
                style={[
                  styles.categoryChip,
                  selectedCategory === category && styles.selectedCategoryChip,
                ]}
                onPress={() => handleCategorySelect(category)}
              >
                <Text
                  style={[
                    styles.categoryText,
                    selectedCategory === category &&
                      styles.selectedCategoryText,
                  ]}
                >
                  {t(category.toLowerCase())}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>

      {!isLoading && items.length === 0 && !isFiltering ? (
        <View style={styles.emptyContainer}>
          <Text style={styles.emptyText}>{t("noItemsFound")}</Text>
        </View>
      ) : (
        <FlatList
          data={items}
          keyExtractor={(item) => String(item.id)}
          numColumns={2}
          contentContainerStyle={styles.itemsGrid}
          renderItem={renderItem}
          onEndReached={handleLoadMore}
          onEndReachedThreshold={0.5}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshing}
              onRefresh={handleRefresh}
              colors={["#008F4C"]}
            />
          }
          ListFooterComponent={
            isLoadingMore ? (
              <ActivityIndicator style={styles.loadingMore} color="#008F4C" />
            ) : null
          }
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  centerContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#fff",
  },
  searchContainer: {
    padding: 16,
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  searchBar: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#f5f5f5",
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    gap: 8,
    flex: 1,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: "#333",
    height: 40,
  },
  categoriesSection: {
    padding: 16,
  },
  categoriesRow: {
    flexDirection: "row",
    gap: 8,
    paddingRight: 16,
  },
  categoryChip: {
    backgroundColor: "#f5f5f5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 15,
  },
  selectedCategoryChip: {
    backgroundColor: "#008F4C",
  },
  categoryText: {
    color: "#666",
    fontWeight: "500",
  },
  selectedCategoryText: {
    color: "#fff",
  },
  itemsGrid: {
    padding: 8,
  },
  itemCard: {
    flex: 1,
    margin: 5,
    backgroundColor: "#f2f2f2",
    borderRadius: 6,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    overflow: "hidden",
  },
  itemImageContainer: {
    height: 120,
    backgroundColor: "#f0f0f0",
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  itemImage: {
    width: "100%",
    height: "100%",
  },
  placeholderImage: {
    justifyContent: "center",
    alignItems: "center",
  },
  placeholderText: {
    color: "#bbb",
  },
  itemTitle: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 8,
    paddingBottom: 0,
  },
  itemPrice: {
    fontSize: 12,
    color: "#888",
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  itemType: {
    fontSize: 12,
    color: "#008F4C",
    paddingBottom: 8,
    paddingHorizontal: 8,
  },
  emptyContainer: {
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  emptyText: {
    color: "#888",
    fontSize: 16,
  },
  loadingMore: {
    paddingVertical: 10,
  },
  loaderContainer: {
    justifyContent: "center",
    alignItems: "center",
    marginTop: 16,
  },
  retryButton: {
    marginTop: 20,
    padding: 10,
    backgroundColor: "#008F4C",
    borderRadius: 5,
  },
  retryButtonText: {
    color: "#fff",
    fontSize: 16,
  },
  errorText: {
    color: "#ff4d4d",
    fontSize: 16,
  },
});
