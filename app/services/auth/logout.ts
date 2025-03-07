import { signOut } from "firebase/auth";
import { auth } from "../../../firebaseConfig";

// Logout function
export const logout = async () => {
  try {
    await signOut(auth);
    console.log("User logged out successfully.");
  } catch (error) {
    if (error instanceof Error) {
      console.error("Error logging out: ", error.message);
    } else {
      console.error("Error logging out: ", error);
    }
    throw new Error("Failed to log out");
  }
};
