import * as React from "react";
import { useState, useEffect } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Image,
  ActivityIndicator,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import Ionicons from "@expo/vector-icons/Ionicons";
import * as ImagePicker from "expo-image-picker";
import { ItemService } from "../services/items/UpdateItemService";
import { getFirestore, doc, getDoc, deleteDoc } from "firebase/firestore";
import { t } from "i18next";

export default function UpdateItemScreen({ route, navigation }: any) {
  const { itemId } = route.params;
  const [itemType, setItemType] = useState("Plastic");
  const [customItemType, setCustomItemType] = useState("");
  const [transactionType, setTransactionType] = useState("sell");
  const [images, setImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [location, setLocation] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);

  const { handleImagePick, handleUpdate } = ItemService({
    itemId,
    itemType,
    customItemType,
    transactionType,
    title,
    description,
    quantity,
    price,
    location,
    images,
    navigation,
    setLoading,
    setTitle,
    setDescription,
    setQuantity,
    setPrice,
    setLocation,
    setImages,
    setUploadProgress,
  });

  useEffect(() => {
    if (itemId) {
      fetchItemData();
    }
    requestPermissions();
  }, [itemId]);

  const fetchItemData = async () => {    //fetch data
    const firestore = getFirestore();
    try {
      const docRef = doc(firestore, "items", itemId);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        setItemType(data.itemType || "Plastic");
        setCustomItemType(data.customItemType || "");
        setTransactionType(data.transactionType || "sell");
        setTitle(data.title || "");
        setDescription(data.description || "");
        setQuantity(data.quantity || 1);
        setPrice(data.price ? String(data.price) : "");
        setLocation(data.location || ""); // Set location from data
        setImages(data.images || []);
      } else {
        alert("Item not found!");
      }
    } catch (error) {
      console.error("Error fetching item data:", error);
      alert("Failed to fetch item details.");
    }
  };

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
    }
  };

  const handleDelete = async () => {
    const firestore = getFirestore();
    Alert.alert(
      "Delete Item",
      "Are you sure you want to delete this item? This action cannot be undone.",
      [
        { text: "Cancel", style: "cancel" },
        {
          text: "Delete",
          style: "destructive",
          onPress: async () => {
            try {
              setLoading(true);
              await deleteDoc(doc(firestore, "items", itemId));
              setLoading(false);
              alert("Item deleted successfully");
              navigation.navigate("MainTabs", { screen: "Home" });
            } catch (error) {
              setLoading(false);
              console.error("Error deleting item:", error);
              alert("Failed to delete the item.");
            }
          },
        },
      ]
    );
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("updateItem")}</Text>
      </View>
      <ScrollView>
        <View style={styles.form}>
          {/* Images Section - Moved to Top */}
          <View style={styles.imageGroup}>
            <View style={styles.imageSection}>
              {images.length > 0 ? (
                <TouchableOpacity
                  style={styles.imageContainer}
                  onPress={handleImagePick}
                  disabled={loading}
                >
                  <Image source={{ uri: images[0] }} style={styles.image} />
                  <TouchableOpacity
                    style={styles.removeImage}
                    onPress={() => setImages([])}
                    disabled={loading}
                  >
                    <AntDesign name="close" size={16} color="#fff" />
                  </TouchableOpacity>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity
                  style={styles.addImageButton}
                  onPress={handleImagePick}
                  disabled={loading}
                >
                  <Text style={styles.addImageText}>{t("addImage")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Item Type Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("itemType")}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={itemType}
                onValueChange={(value) => {
                  setItemType(value);
                  if (value !== "other") setCustomItemType("");
                }}
                style={styles.picker}
              >
                <Picker.Item label={t("plastic")} value="Plastic" />
                <Picker.Item label={t("paper")} value="Paper" />
                <Picker.Item label={t("glass")} value="Glass" />
                <Picker.Item label={t("metal")} value="Metal" />
                <Picker.Item label={t("electronics")} value="Electronic" />
                <Picker.Item label={t("other")} value="Other" />
              </Picker>
            </View>
          </View>

          {/* Transaction Type Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("transactionType")}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={transactionType}
                onValueChange={setTransactionType}
                style={styles.picker}
              >
                <Picker.Item label={t("forSale")} value="sell" />
                <Picker.Item label={t("donation")} value="donate" />
              </Picker>
            </View>
          </View>

          {/* Title */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("title")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterItemTitle")}
              value={title}
              onChangeText={setTitle}
            />
          </View>

          {/* Description */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("description")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder={t("enterItemDescription")}
              multiline
              numberOfLines={4}
              value={description}
              onChangeText={setDescription}
            />
          </View>

          {/* Price */}
          {transactionType === "sell" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("price")} ({t("rs")})
              </Text>
              <TextInput
                style={styles.input}
                placeholder="Enter price"
                keyboardType="numeric"
                value={price}
                onChangeText={setPrice}
              />
            </View>
          )}

          {/* Quantity */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("quantity")}</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter quantity"
              keyboardType="numeric"
              value={String(quantity)}
              onChangeText={(text) => setQuantity(Number(text))}
            />
          </View>

          {/* Location */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("location")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterLocation")}
              value={location}
              onChangeText={setLocation}
            />
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleUpdate}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>{t("updating")}</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>{t("updateItem")}</Text>
            )}
          </TouchableOpacity>

          {/* Delete Button */}
          <TouchableOpacity
            style={[
              styles.deleteButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleDelete}
            disabled={loading}
          >
            <Text style={styles.deleteButtonText}>{t("deleteItem")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
    paddingHorizontal: 15,
    backgroundColor: "#fff",
    paddingBottom: 20,
  },
  goBackButton: {
    marginRight: 10,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008F4C",
  },
  form: {
    padding: 15,
    backgroundColor: "#f5f5f5",
  },
  inputGroup: {
    marginBottom: 15,
  },
  imageGroup: {
    marginBottom: 15,
    alignItems: "center",
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 5,
    marginLeft: 5,
  },
  input: {
    padding: 15,
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
    color: "#333",
  },
  textArea: {
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#fff",
    borderRadius: 15,
    borderWidth: 1,
    borderColor: "#ddd",
  },
  picker: {
    height: 55,
    width: "100%",
  },
  imageSection: {
    flexDirection: "row",
    alignItems: "center",
  },
  imageContainer: {
    position: "relative",
  },
  image: {
    margin: 10,
    width: 100,
    height: 100,
    borderRadius: 15,
  },
  removeImage: {
    position: "absolute",
    top: -8,
    right: -8,
    backgroundColor: "rgba(0, 0, 0, 0.5)",
    padding: 5,
    borderRadius: 12,
  },
  addImageButton: {
    backgroundColor: "#008F4C",
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  addImageText: {
    color: "#fff",
    fontWeight: "bold",
  },
  submitButton: {
    backgroundColor: "#008F4C",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
  },
  submitButtonDisabled: {
    backgroundColor: "#ccc",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  deleteButton: {
    backgroundColor: "#e57373",
    padding: 15,
    borderRadius: 15,
    alignItems: "center",
    marginTop: 15,
    marginBottom: 40,
  },
  deleteButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 10,
  },
});
