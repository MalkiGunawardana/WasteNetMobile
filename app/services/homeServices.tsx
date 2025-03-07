{/*import {
  getDocs,
  query,
  collection,
  limit,
  orderBy,
  where,
  getFirestore,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { RecentItemType } from "../types/home";

//get 4 most recent items
export const fetchRecentItems = async (): Promise<RecentItemType[]> => {
  try {
    const itemsQuery = query(
      collection(db, "items"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const querySnapshot = await getDocs(itemsQuery);

    const recentItems: RecentItemType[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as {
          title?: string;
          price?: number;
          itemType?: string;
          transactionType?: string;
          description?: string;
          images?: string[];
          createdAt?: { toDate: () => Date };
          addedBy?: string;
        };

        let displayName = "Unknown";

        if (data.addedBy) {
          try {
            const userDoc = await getDoc(doc(db, "users", data.addedBy));
            if (userDoc.exists()) {
              displayName = userDoc.data()?.displayName || "Unknown";
            }
          } catch (userError) {
            console.error(`Error fetching user displayName for ID ${data.addedBy}:`, userError);
          }
        }

        return {
          id: docSnapshot.id,
          title: data.title || "Unnamed Item",
          price: data.price ? data.price.toString() : null,
          itemType: data.itemType || "Unknown",
          transactionType: data.transactionType || "sell",
          description: data.description || "",
          images: data.images || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          addedBy: displayName,
        };
      })
    );

    return recentItems;
  } catch (error) {
    console.error("Error fetching recent items:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to fetch recent items: ${error.message}`
        : "Failed to fetch recent items"
    );
  }
};
//get user's recently added 3 items
export const fetchUserItems = async (
  userId: string
): Promise<RecentItemType[]> => {
  try {
    const itemsQuery = query(
      collection(db, "items"),
      orderBy("createdAt", "desc"),
      where("addedBy", "==", userId),    
      limit(4)
    );

    const querySnapshot = await getDocs(itemsQuery);

    const userItems: RecentItemType[] = querySnapshot.docs.map((doc) => {
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
    });

    return userItems;
  } catch (error) {
    console.error("Failed to fetch user items:", error);
    return [];
  }
};

//get user's name
export const getUserName = async (uid: string): Promise<string | null> => {
  try {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData?.displayName || null;
    } else {
      console.warn(`No user found with UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user display name:", error);
    return null;
  }
};*/}

import {
  getDocs,
  query,
  collection,
  limit,
  orderBy,
  where,
  getFirestore,
  doc,
  getDoc,
} from "firebase/firestore";
import { db } from "../../firebaseConfig";
import { RecentItemType, RecentBuyerType } from "../types/home";

//get 4 most recent items
export const fetchRecentItems = async (): Promise<RecentItemType[]> => {
  try {
    const itemsQuery = query(
      collection(db, "items"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const querySnapshot = await getDocs(itemsQuery);

    const recentItems: RecentItemType[] = await Promise.all(
      querySnapshot.docs.map(async (docSnapshot) => {
        const data = docSnapshot.data() as {
          title?: string;
          price?: number;
          itemType?: string;
          transactionType?: string;
          description?: string;
          images?: string[];
          createdAt?: { toDate: () => Date };
          addedBy?: string;
        };

        let displayName = "Unknown";

        if (data.addedBy) {
          try {
            const userDoc = await getDoc(doc(db, "users", data.addedBy));
            if (userDoc.exists()) {
              displayName = userDoc.data()?.displayName || "Unknown";
            }
          } catch (userError) {
            console.error(`Error fetching user displayName for ID ${data.addedBy}:`, userError);
          }
        }

        return {
          id: docSnapshot.id,
          title: data.title || "Unnamed Item",
          price: data.price ? data.price.toString() : null,
          itemType: data.itemType || "Unknown",
          transactionType: data.transactionType || "sell",
          description: data.description || "",
          images: data.images || [],
          createdAt: data.createdAt?.toDate() || new Date(),
          addedBy: displayName,
        };
      })
    );

    return recentItems;
  } catch (error) {
    console.error("Error fetching recent items:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to fetch recent items: ${error.message}`
        : "Failed to fetch recent items"
    );
  }
};

//get 4 most recent buyers
export const fetchRecentBuyers = async (): Promise<RecentBuyerType[]> => {
  try {
    const buyersQuery = query(
      collection(db, "buyers"),
      orderBy("createdAt", "desc"),
      limit(4)
    );

    const querySnapshot = await getDocs(buyersQuery);

    const recentBuyers: RecentBuyerType[] = querySnapshot.docs.map((docSnapshot) => {
      const data = docSnapshot.data() as {
        name?: string;
        phoneNumber?: string;
        location?: string;
        itemType?: string;
        price?: string;
        createdAt?: { toDate: () => Date };
      };

      return {
        id: docSnapshot.id,
        name: data.name || "Unnamed Buyer",
        phoneNumber: data.phoneNumber || "Unknown",
        location: data.location || "Unknown",
        itemType: data.itemType || "Unknown",
        price: data.price || "Unknown",
        createdAt: data.createdAt?.toDate() || new Date(),
      };
    });

    return recentBuyers;
  } catch (error) {
    console.error("Error fetching recent buyers:", error);
    throw new Error(
      error instanceof Error
        ? `Failed to fetch recent buyers: ${error.message}`
        : "Failed to fetch recent buyers"
    );
  }
};

//get user's recently added 3 items
export const fetchUserItems = async (
  userId: string
): Promise<RecentItemType[]> => {
  try {
    const itemsQuery = query(
      collection(db, "items"),
      orderBy("createdAt", "desc"),
      where("addedBy", "==", userId),    
      limit(4)
    );

    const querySnapshot = await getDocs(itemsQuery);

    const userItems: RecentItemType[] = querySnapshot.docs.map((doc) => {
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
    });

    return userItems;
  } catch (error) {
    console.error("Failed to fetch user items:", error);
    return [];
  }
};

//get user's name
export const getUserName = async (uid: string): Promise<string | null> => {
  try {
    const db = getFirestore();
    const userRef = doc(db, "users", uid);
    const userDoc = await getDoc(userRef);

    if (userDoc.exists()) {
      const userData = userDoc.data();
      return userData?.displayName || null;
    } else {
      console.warn(`No user found with UID: ${uid}`);
      return null;
    }
  } catch (error) {
    console.error("Error fetching user display name:", error);
    return null;
  }
};