import * as ImagePicker from "expo-image-picker";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  doc,
  getDoc,
  updateDoc,
  serverTimestamp,
} from "firebase/firestore";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";

class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

import { NavigationProp } from "@react-navigation/native";

interface ItemServiceProps {
  itemId: string;
  itemType: string;
  customItemType: string;
  transactionType: string;
  title: string;
  description: string;
  quantity: number;
  price: string;
  location: string;
  images: string[];
  navigation: NavigationProp<any>;
  setLoading: (value: boolean) => void;
  setTitle: (value: string) => void;
  setDescription: (value: string) => void;
  setQuantity: (value: number) => void;
  setPrice: (value: string) => void;
  setImages: (value: string[]) => void;
  setUploadProgress: (value: number) => void;
  setLocation: (value: string) => void;
}
export function ItemService({
  itemId,
  itemType,
  customItemType,
  transactionType,
  title,
  description,
  location,
  quantity,
  price,
  images,
  navigation,
  setLoading,
  setTitle,
  setDescription,
  setQuantity,
  setPrice,
  setImages,
  setLocation,
  setUploadProgress,
}: ItemServiceProps) {
  const firestore = getFirestore();

  const uploadImageToCloudinary = async (uri: string): Promise<string> => {
    try {
      const fileInfo = await FileSystem.getInfoAsync(uri);
      if (!fileInfo.exists) {
        throw new UploadError("Image file not found");
      }

      const base64 = await FileSystem.readAsStringAsync(uri, {
        encoding: FileSystem.EncodingType.Base64,
      });

      const cloudName =
        Constants?.expoConfig?.extra?.CLOUDINARY_CLOUD_NAME || "";
      const uploadPresent =
        Constants?.expoConfig?.extra?.CLOUDINARY_UPLOAD_PRESET || "";

      // Prepare form data
      const formData = new FormData();
      formData.append("file", `data:image/jpeg;base64,${base64}`);
      formData.append("upload_preset", uploadPresent);
      formData.append("cloud_name", cloudName);

      // Upload to Cloudinary
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
        throw new UploadError(`Upload failed: ${errorData}`);
      }

      const result = await response.json();
      return result.secure_url;
    } catch (error) {
      if (error instanceof UploadError) {
        throw error;
      }
      throw new UploadError(
        error instanceof Error ? error.message : "Unknown upload error"
      );
    }
  };

  const handleImagePick = async () => {
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.8,
      });

      if (!result.canceled && result.assets[0]) {
        const imageUri = result.assets[0].uri;
        setImages([...images, imageUri]);
      }
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Failed to select image";
      console.error("Error picking image:", message);
      alert(message);
    }
  };

  const handleUpdate = async () => {  //update item data
    try {
      setLoading(true);
      const docRef = doc(firestore, "items", itemId);
      await updateDoc(docRef, {
        itemType,
        customItemType,
        transactionType,
        title,
        description,
        quantity,
        price: price ? Number(price) : 0,
        location,
        images,
        updatedAt: serverTimestamp(),
      });

      setLoading(false);
      alert("Item updated successfully");
      navigation.navigate("MainTabs", { screen: "Home" }); // Navigate to Home
    } catch (error) {
      setLoading(false);
      console.error("Error updating item:", error);
      alert("Failed to update the item.");
    }
  };

  return {
    handleImagePick, //allow select images 
    handleUpdate,     // update the item in DB
  };
}
