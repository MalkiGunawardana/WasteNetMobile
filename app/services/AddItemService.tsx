import * as ImagePicker from "expo-image-picker";
import * as Google from "expo-auth-session/providers/google";
import { getAuth } from "firebase/auth";
import {
  getFirestore,
  collection,
  addDoc,
  serverTimestamp,
} from "firebase/firestore";
import Constants from "expo-constants";
import * as FileSystem from "expo-file-system";

import { NavigationProp } from "@react-navigation/native";

interface ItemServiceProps {   
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
}

class UploadError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadError";
  }
}

export function ItemService({    //recieve props define in above
  itemType,
  customItemType,
  transactionType,
  title,
  description,
  quantity,
  price,
  images,
  location,
  navigation,
  setLoading,
  setTitle,
  setDescription,
  setQuantity,
  setPrice,
  setImages,
  setUploadProgress,
}: ItemServiceProps) {
  const auth = getAuth();
  const firestore = getFirestore();
  const [request, response, promptAsync] = Google.useAuthRequest({
    clientId: Constants?.expoConfig?.extra?.EXPO_PUBLIC_WEB_CLIENT_ID || "",
    androidClientId:
      Constants?.expoConfig?.extra?.EXPO_PUBLIC_ANDROID_CLIENT_ID || "",
    iosClientId: Constants?.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID || "",
  });

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

  const handleImagePick = async () => {  //handle image selection
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

  const handleSubmit = async () => {
    if (!title.trim()) {
      alert("Please enter a title");
      return;
    }
    if (!description.trim()) {
      alert("Please enter a description");
      return;
    }
    if (quantity < 1) {
      alert("Quantity must be at least 1");
      return;
    }
    if (images.length === 0) {
      alert("Please select at least one image");
      return;
    }
    if (transactionType === "sell" && (!price || parseFloat(price) <= 0)) {
      alert("Please enter a valid price");
      return;
    }

    const user = auth.currentUser;
    if (!user) {
      alert("Please sign in first");
      promptAsync();
      return;
    }

    setLoading(true);
    setUploadProgress(0);

    try {
      const totalImages = images.length;
      const uploadedUrls: string[] = [];

      for (let i = 0; i < totalImages; i++) {
        try {
          const url = await uploadImageToCloudinary(images[i]);
          uploadedUrls.push(url);
          setUploadProgress(((i + 1) / totalImages) * 100);
        } catch (error) {
          console.error(`Failed to upload image ${i + 1}:`, error);
        }
      }

      if (uploadedUrls.length === 0) {
        throw new Error("Failed to upload any images. Please try again.");
      }

      const itemData = {
        title: title.trim(),
        description: description.trim(),
        itemType,
        customItemType: itemType === "other" ? customItemType.trim() : "",
        transactionType,
        quantity,
        price: transactionType === "sell" ? parseFloat(price) : 0,
        addedBy: user.uid,
        location: location.trim(),
        images: uploadedUrls,
        createdAt: serverTimestamp(),
      };

      await addDoc(collection(firestore, "items"), itemData);

      setTitle("");
      setDescription("");
      setQuantity(1);
      setPrice("");

      setImages([]);
      setUploadProgress(0);

      alert("Item added successfully!");
      navigation.navigate("MainTabs", { screen: "Home" });
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error in item submission:", message);
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  return { handleImagePick, handleSubmit, request };
}
