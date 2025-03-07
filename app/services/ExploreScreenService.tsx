import {
  collection,
  getDocs,
  query,
  where,
  limit,
  startAfter,
  QueryDocumentSnapshot,
  DocumentData,
  orderBy,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";

export type ItemCategory =
  | "All"
  | "Plastic"
  | "Paper"
  | "Glass"
  | "Metal"
  | "Electronics";

export interface Item {
  id: string;
  title: string;
  price: number | null;
  itemType: string;
  transactionType: "sell" | "donate";
  description?: string;
  images?: string[];
  createdAt: Date;
  addedBy: string;
}

interface FetchItemsResult {
  items: Item[];
  lastDoc: QueryDocumentSnapshot<DocumentData> | null;
  hasMore: boolean;
}

class FirestoreError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "FirestoreError";
  }
}

export const ITEMS_PER_PAGE = 6;
export const fetchItemsFromFirestore = async ( //fetch item from Db
  lastDoc?: QueryDocumentSnapshot<DocumentData>,
  category: ItemCategory = "All",
  searchQuery = ""
): Promise<FetchItemsResult> => {
  try {
    let itemsQuery = query(
      collection(db, "items"),
      orderBy("createdAt", "desc"),
      limit(ITEMS_PER_PAGE)
    );

    // Add category filter if not "All"
    if (category !== "All") {
      itemsQuery = query(itemsQuery, where("itemType", "==", category));
    }

    // Add pagination if lastDoc exists
    if (lastDoc) {
      itemsQuery = query(itemsQuery, startAfter(lastDoc));
    }

    const querySnapshot = await getDocs(itemsQuery);

    const items: Item[] = querySnapshot.docs.map((doc) => {
      const data = doc.data();
      return {
        id: doc.id,
        title: data.title || "Unnamed Item",
        price: data.price || null,
        itemType: data.itemType || "Unknown",
        transactionType: data.transactionType || "sell",
        description: data.description || "",
        images: data.images || [],
        createdAt: data.createdAt?.toDate() || new Date(),
        addedBy: data.addedBy || "Unknown",
      };
    })
    .filter((item) => item.transactionType !== "sold" && item.transactionType !== "donated")

    const filteredItems = searchQuery
      ? items.filter(
          (item) =>
            item.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            item.description?.toLowerCase().includes(searchQuery.toLowerCase())
        )
      : items;

    return {
      items: filteredItems,
      lastDoc: querySnapshot.docs[querySnapshot.docs.length - 1] || null,
      hasMore: querySnapshot.docs.length === ITEMS_PER_PAGE,
    };
  } catch (error) {
    console.error("Error fetching items:", error);
    throw new FirestoreError(
      error instanceof Error
        ? `Failed to fetch items: ${error.message}`
        : "Failed to fetch items"
    );
  }
};

export const filterItems = (
  items: Item[],
  category: ItemCategory,
  query: string
): Item[] => {
  const filteredItems = items.filter((item) => {
    const matchesCategory = category === "All" || item.itemType === category;
    const matchesQuery =
      item.title.toLowerCase().includes(query.toLowerCase()) ||
      item.description?.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesQuery;
  });

  return filteredItems;
};
