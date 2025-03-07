import { getFirestore, doc, getDoc } from "firebase/firestore";
import { getAuth } from "firebase/auth";

export async function debugUserProfile(uid?: string) {
  const auth = getAuth();     //initialize auth
  const db = getFirestore();  //initialize db

  try {
    // 1. Check current auth user
    const currentUser = auth.currentUser;
    console.log("=== Firebase Auth Debug ===");
    console.log(
      "Current Auth User:",
      currentUser
        ? {
            uid: currentUser.uid,
            email: currentUser.email,
            displayName: currentUser.displayName,
          }
        : "No user logged in"
    );

    // 2. Check Firestore user data
    const userUid = uid || currentUser?.uid;
    if (userUid) {
      console.log("\n=== Firestore Debug ===");
      const userDocRef = doc(db, "users", userUid);
      const userDocSnap = await getDoc(userDocRef);

      console.log("Firestore User Document Exists:", userDocSnap.exists());
      console.log(
        "Firestore User Data:",
        userDocSnap.exists() ? userDocSnap.data() : "No data"
      );
    } else {
      console.log("No UID provided and no current user");
    }
  } catch (error) {
    console.error("=== Debug Error ===");
    console.error("Error during debug:", error);
  }
}
