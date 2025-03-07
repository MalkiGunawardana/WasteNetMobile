import {
  getAuth,
  reauthenticateWithCredential,
  updatePassword,
  EmailAuthProvider,
} from "firebase/auth";
import { getFirestore, doc, updateDoc } from "firebase/firestore";
import * as ImagePicker from "expo-image-picker";
import * as FileSystem from "expo-file-system";
import Constants from "expo-constants";
import { getUserProfile } from "./firebase";

// Types
export interface UserProfile {
  displayName: string;
  email: string;
  profileImage: string;
}

// Services
export const fetchUserProfile = async (): Promise<UserProfile | null> => {
  const auth = getAuth();
  try {
    const currentUser = auth.currentUser;
    if (currentUser) {
      const profile = await getUserProfile(currentUser.uid);
      if (profile) {
        return {
          displayName: profile.displayName || "",
          email: profile.email || "",
          profileImage: profile.profileImage || "",
        };
      }
    }
    return null;
  } catch (error) {
    console.error("Error fetching user profile:", error);
    throw error;
  }
};

export const handleImageUpload = async (): Promise<string | null> => {
  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images,
    allowsEditing: true,
    aspect: [1, 1],
    quality: 1,
  });

  if (!result.canceled && result.assets[0]) {
    const imageUri = result.assets[0].uri;
    try {
      return await uploadImageToCloudinary(imageUri);
    } catch (error) {
      console.error("Error uploading image:", error);
      throw error;
    }
  }
  return null;
};

export const uploadImageToCloudinary = async (uri: string): Promise<string> => {
  try {
    const fileInfo = await FileSystem.getInfoAsync(uri);
    if (!fileInfo.exists) {
      throw new Error("Image file not found");
    }

    const base64 = await FileSystem.readAsStringAsync(uri, {
      encoding: FileSystem.EncodingType.Base64,
    });

    const cloudName = Constants?.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME || "";
    const uploadPreset =
      Constants?.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET || "";

    const formData = new FormData();
    formData.append("file", `data:image/jpeg;base64,${base64}`);
    formData.append("upload_preset", uploadPreset);
    formData.append("cloud_name", cloudName);

    const response = await fetch(
      `https://api.cloudinary.com/v1_1/${cloudName}/image/upload`,
      {
        method: "POST",
        body: formData,
        headers: {
          "Content-Type": "multipart/form-data",
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.text();
      throw new Error(`Upload failed: ${errorData}`);
    }

    const result = await response.json();
    return result.secure_url;
  } catch (error) {
    console.error("Image upload failed:", error);
    throw new Error("Failed to upload image.");
  }
};

export const updateUserProfileImage = async (
  imageUrl: string
): Promise<void> => {
  const auth = getAuth();
  const firestore = getFirestore();
  try {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        profileImage: imageUrl,
      });
    }
  } catch (error) {
    console.error("Error updating user profile image:", error);
    throw error;
  }
};

export const updateUserDisplayName = async (
  displayName: string
): Promise<void> => {
  const auth = getAuth();
  const firestore = getFirestore();
  try {
    const user = auth.currentUser;
    if (user) {
      const userRef = doc(firestore, "users", user.uid);
      await updateDoc(userRef, {
        displayName,
      });
    }
  } catch (error) {
    console.error("Error updating display name:", error);
    throw error;
  }
};

export const updateUserPassword = async (
  currentPassword: string,
  newPassword: string
): Promise<void> => {
  const auth = getAuth();
  try {
    const user = auth.currentUser;
    if (user) {
      const credential = EmailAuthProvider.credential(
        user.email || "",
        currentPassword
      );
      await reauthenticateWithCredential(user, credential);
      await updatePassword(user, newPassword);
    }
  } catch (error) {
    console.error("Error updating password:", error);
    throw error;
  }
};
