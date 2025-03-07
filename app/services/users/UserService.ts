import { getFirestore, doc, getDoc } from "firebase/firestore";  

export interface UserData {   
  id: string;   
  name: string;   
  userName?: string;   
  email?: string;   
  profileImage?: string; 
}  

export const getUserById = async (userId: string): Promise<UserData | null> => {   
  try {     
    const db = getFirestore();     
    const userDoc = await getDoc(doc(db, "users", userId));      

    if (!userDoc.exists()) {       
      return null;     
    }      

    const userData = userDoc.data();     
    console.log("Fetched user data:", userData); 
    return {       
      id: userDoc.id,       
      name: userData.displayName || "Unknown User",       
      userName: userData.userName,       
      email: userData.email,       
      profileImage: userData.profileImage     
    };   
  } catch (error) {     
    console.error("Error fetching user:", error);     
    return null;   
  } 
};
