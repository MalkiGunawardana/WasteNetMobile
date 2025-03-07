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
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import AntDesign from "@expo/vector-icons/AntDesign";
import * as ImagePicker from "expo-image-picker";
import { ItemService } from "../services/AddItemService";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import Ionicons from "@expo/vector-icons/Ionicons";
import { t } from "i18next";

type RootStackParamList = {
  [key: string]: undefined;
};

export default function AddItemScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [itemType, setItemType] = useState("Plastic");
  const [customItemType, setCustomItemType] = useState("");
  const [transactionType, setTransactionType] = useState("sell");
  const [images, setImages] = useState<string[]>([]);
  const [quantity, setQuantity] = useState(1);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [price, setPrice] = useState("");
  const [loading, setLoading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [location, setLocation] = useState("");

  const { handleImagePick, handleSubmit, request } = ItemService({
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
  });

  useEffect(() => {     // permission for accec devices imagse
    requestPermissions();
  }, []);

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      alert("Permission to access media library is required!");
    }
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#008F4C" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("addItem")}</Text>
      </View>

      <ScrollView>
        <View style={styles.form}>
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
                itemStyle={styles.pickerItem} // Reference the style here
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

          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("location")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterLocation")}
              value={location}
              onChangeText={setLocation}
            />
          </View>


          {/* Price (Only for selling) */}
          {transactionType === "sell" && (
            <View style={styles.inputGroup}>
              <Text style={styles.label}>
                {t("price")} ({t("rs")}).{" "}
              </Text>
              <TextInput
                style={styles.input}
                placeholder={t("enterItemPrice")}
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

          {/* Images */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("image")}</Text>
            <View style={styles.imageSection}>
              <TouchableOpacity
                style={styles.addImageButton}
                onPress={handleImagePick}
                disabled={loading}
              >
                <Text style={styles.addImageText}>{t("image")}</Text>
              </TouchableOpacity>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imageList}>
                  {images.length > 0 && (
                    <View style={styles.imageContainer}>
                      <Image source={{ uri: images[0] }} style={styles.image} />
                      <TouchableOpacity
                        style={styles.removeImage}
                        onPress={() => setImages([])}
                        disabled={loading}
                      >
                        <AntDesign name="closecircle" size={16} color="#fff" />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              </ScrollView>
            </View>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            style={[
              styles.submitButton,
              loading && styles.submitButtonDisabled,
            ]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <View style={styles.loadingContainer}>
                <ActivityIndicator color="#fff" />
                <Text style={styles.loadingText}>Uploading...</Text>
              </View>
            ) : (
              <Text style={styles.submitButtonText}>{t("addItem")}</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  goBackButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#008f4c",
    flex: 1,
  },
  form: {
    padding: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: "bold",
    marginBottom: 5,
    color: "#333",
  },
  inputGroup: {
    marginBottom: 20,
  },
  input: {
    backgroundColor: "#f4f4f4",
    borderRadius: 5,
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    fontSize: 14,
  },
  textArea: {
    height: 120,
    textAlignVertical: "top",
  },
  pickerContainer: {
    backgroundColor: "#f4f4f4",
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 15,
  },
  picker: {
    height: 50,
    width: "100%",
  },
  pickerItem: {
    fontSize: 4,
  },
  imageSection: {
    marginTop: 10,
    alignItems: "center",
  },
  imageList: {
    flexDirection: "row",
    marginTop: 10,
  },
  imageContainer: {
    position: "relative",
    marginRight: 10,
  },
  image: {
    width: 80,
    height: 80,
    borderRadius: 8,
  },
  removeImage: {
    position: "absolute",
    top: -5,
    right: -5,
    backgroundColor: "#ff0000",
    borderRadius: 10,
    padding: 4,
  },
  addImageButton: {
    backgroundColor: "#007BFF",
    padding: 10,
    borderRadius: 5,
  },
  addImageText: {
    color: "#fff",
    fontSize: 16,
  },
  submitButton: {
    backgroundColor: "#008f4c",
    paddingVertical: 15,
    borderRadius: 5,
    alignItems: "center",
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  loadingContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  loadingText: {
    color: "#fff",
    marginLeft: 8,
    fontSize: 16,
    fontWeight: "bold",
  },
});
