import { getFirestore, doc, getDoc } from "firebase/firestore";

export interface Item {
  createdBy: string | undefined;
  id: string;
  title: string;
  description: string;
  price: number;
  quantity: number;
  itemType: string;
  images: string[];
  addedBy: string;
  addedByName?: string;
  createdAt: any;
  transactionType: string;
  userName: string;
  location: string;
}

export const fetchItemById = async (itemId: string): Promise<Item | null> => {
  try {
    const firestore = getFirestore();

    const itemRef = doc(firestore, "items", itemId);
    const itemSnap = await getDoc(itemRef);

    if (!itemSnap.exists()) {  //check item exist
      throw new Error("Item not found");
    }

    const itemData = itemSnap.data();  //fetching additional data
    const addedBy = itemData?.addedBy || "Unknown";

    let userName = "Unknown";
    if (addedBy) {
      const userRef = doc(firestore, "users", addedBy);
      const userSnap = await getDoc(userRef);

      if (userSnap.exists()) {
        const userData = userSnap.data();
        userName = userData?.displayName || "Unknown";
      }
    }

    const createdAtDate = itemData.createdAt?.toDate();
    const formattedDate = createdAtDate
      ? createdAtDate.toLocaleDateString("en-IN", {
          day: "numeric",
          month: "long",
          year: "numeric",
          hour: "2-digit",
          minute: "2-digit",
          second: "2-digit",
        })
      : "Date not available";

    return {
      id: itemId,
      addedBy,
      title: itemData.title || "No Title",
      description: itemData.description || "No Description",
      price: itemData.price || 0,
      quantity: itemData.quantity || 0,
      itemType: itemData.itemType || "Unknown",
      images: itemData.images || [],
      createdBy: userName,
      createdAt: formattedDate,
      transactionType: itemData.transactionType || "Unknown",
      userName: userName,
      location: itemData.location || "Unknown",
    };
  } catch (err) {
    console.error("Error fetching item by ID:", err);
    throw new Error(
      err instanceof Error ? err.message : "Failed to fetch item"
    );
  }
};
