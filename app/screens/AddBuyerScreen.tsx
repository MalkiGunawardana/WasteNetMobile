import * as React from "react";
import { useState } from "react";
import {
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { Picker } from "@react-native-picker/picker";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation, NavigationProp } from "@react-navigation/native";
import { t } from "i18next";
import { addDoc, collection } from "firebase/firestore";
import { db } from "../../firebaseConfig";

type RootStackParamList = {
  [key: string]: undefined;
};

export default function AddBuyerScreen() {
  const navigation = useNavigation<NavigationProp<RootStackParamList>>();

  const [name, setName] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [location, setLocation] = useState("");
  const [itemType, setItemType] = useState("Plastic");
  const [price, setPrice] = useState("");
  const [description, setDescription] = useState(""); // New description state
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    setLoading(true);
    const newBuyer = {
      name,
      phoneNumber,
      location,
      itemType,
      price,
      description, // Include description in the data
      createdAt: new Date(),
    };

    try {
      await addDoc(collection(db, "buyers"), newBuyer);
      setLoading(false);
      navigation.goBack();
    } catch (error) {
      console.error("Error adding buyer: ", error);
      setLoading(false);
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
        <Text style={styles.headerText}>{t("addBuyer")}</Text>
      </View>

      <ScrollView>
        <View style={styles.form}>
          {/* Name */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("name")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterName")}
              value={name}
              onChangeText={setName}
            />
          </View>

          {/* Phone Number */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("phoneNumber")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterPhoneNumber")}
              keyboardType="phone-pad"
              value={phoneNumber}
              onChangeText={setPhoneNumber}
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

          {/* Item Type Picker */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("itemType")}</Text>
            <View style={styles.pickerContainer}>
              <Picker
                selectedValue={itemType}
                onValueChange={setItemType}
                style={styles.picker}
                itemStyle={styles.pickerItem}
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

          {/* Price */}
          <View style={styles.inputGroup}>
            <Text style={styles.label}>
              {t("price")} ({t("perKgOrItem")})
            </Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterPrice")}
              keyboardType="numeric"
              value={price}
              onChangeText={setPrice}
            />
          </View>

          {/* Description */}
          {/*<View style={styles.inputGroup}>
            <Text style={styles.label}>{t("description")}</Text>
            <TextInput
              style={[styles.input, styles.textArea]} // Text area styling
              placeholder={t("enterDescription")}
              value={description}
              onChangeText={setDescription}
              multiline={true} // Enable multiline input
              numberOfLines={4} // Set initial number of lines
            />
          </View>*/}

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
              <Text style={styles.submitButtonText}>{t("addBuyer")}</Text>
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
    fontSize: 14,
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
  // New styles for text area
  textArea: {
    textAlignVertical: "top", // Align text to the top
    height: 100, // Initial height of the text area
  },
});
