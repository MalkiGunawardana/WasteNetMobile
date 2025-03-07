import { getFirestore, doc, getDoc } from "firebase/firestore";
import type { FirestoreUserData } from "../types/firebase";

const db = getFirestore();    //firebase DB initialization

export const getUserProfile = async (
  uid: string
): Promise<FirestoreUserData | null> => {
  try {
    const userDocRef = doc(db, "users", uid);
    const docSnap = await getDoc(userDocRef);

    if (docSnap.exists()) {
      const userData = {
        ...(docSnap.data() as Omit<FirestoreUserData, "uid">),
        uid: docSnap.id,
      };

      //console.log("User profile data fetched successfully:", userData);
      return userData;
    }

    return null;
  } catch (error) {
    console.error("Error fetching user profile: ", error);
    throw error;
  }
};
``;
