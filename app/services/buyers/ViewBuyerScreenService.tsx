/*import { getFirestore, doc, getDoc } from "firebase/firestore";

export interface Buyer {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  itemType: string;
  price: string;
  createdAt: string;
  addedBy: string;
}

export const fetchBuyerById = async (buyerId: string): Promise<Buyer> => {
  const firestore = getFirestore();
  const buyerDoc = await getDoc(doc(firestore, "buyers", buyerId));

  if (!buyerDoc.exists()) {
    throw new Error("Buyer not found");
  }

  const data = buyerDoc.data();

  return {
    id: buyerDoc.id,
    name: data?.name || "Unnamed Buyer",
    phoneNumber: data?.phoneNumber || "Unknown",
    location: data?.location || "Unknown",
    itemType: data?.itemType || "Unknown",
    price: data?.price || "Unknown",
    createdAt: data?.createdAt?.toDate().toLocaleDateString() || "Unknown",
    addedBy: data?.addedBy || "Unknown",
  };
};*/

// app/services/buyers/ViewBuyerScreenService.tsx
/*import {
  getFirestore,
  doc,
  getDoc,
  Timestamp,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface Buyer {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  itemType: string;
  price: string;
  createdAt: string;
  addedBy: string;
}

export const fetchBuyerById = async (buyerId: string): Promise<Buyer> => {
  const firestore = getFirestore();
  const buyerDoc = await getDoc(doc(firestore, "buyers", buyerId));

  if (!buyerDoc.exists()) {
    throw new Error("Buyer not found");
  }

  const data = buyerDoc.data();
  const createdAt = data?.createdAt as Timestamp;

  return {
    id: buyerDoc.id,
    name: data?.name || "Unnamed Buyer",
    phoneNumber: data?.phoneNumber || "Unknown",
    location: data?.location || "Unknown",
    itemType: data?.itemType || "Unknown",
    price: data?.price || "Unknown",
    createdAt: createdAt?.toDate().toLocaleDateString() || "Unknown",
    addedBy: data?.addedBy || "Unknown",
  };
};

// New function to add buyer
export const addBuyer = async (buyerData: Omit<Buyer, "id" | "createdAt">) => {
  const firestore = getFirestore();
  await addDoc(collection(firestore, "buyers"), {
    ...buyerData,
    createdAt: serverTimestamp(), // Add createdAt with server timestamp
  });
};*/

// with chat
// app/services/buyers/ViewBuyerScreenService.tsx
import {
  getFirestore,
  doc,
  getDoc,
  Timestamp,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";

export interface Buyer {
  id: string;
  name: string;
  phoneNumber: string;
  location: string;
  itemType: string;
  price: string;
  createdAt: string;
  addedBy: string;
}

export const fetchBuyerById = async (buyerId: string): Promise<Buyer> => {
  const firestore = getFirestore();
  const buyerDoc = await getDoc(doc(firestore, "buyers", buyerId));

  if (!buyerDoc.exists()) {
    throw new Error("Buyer not found");
  }

  const data = buyerDoc.data();
  const createdAt = data?.createdAt as Timestamp;

  return {
    id: buyerDoc.id,
    name: data?.name || "Unnamed Buyer",
    phoneNumber: data?.phoneNumber || "Unknown",
    location: data?.location || "Unknown",
    itemType: data?.itemType || "Unknown",
    price: data?.price || "Unknown",
    createdAt: createdAt?.toDate().toLocaleDateString() || "Unknown",
    addedBy: data?.addedBy || "Unknown",
  };
};

// New function to add buyer
export const addBuyer = async (buyerData: Omit<Buyer, "id" | "createdAt">) => {
  const firestore = getFirestore();
  await addDoc(collection(firestore, "buyers"), {
    ...buyerData,
    createdAt: serverTimestamp(), // Add createdAt with server timestamp
  });
};
