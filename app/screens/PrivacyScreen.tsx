import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Image,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import Ionicons from "@expo/vector-icons/Ionicons";
import { useNavigation } from "@react-navigation/native";
import {
  fetchUserProfile,
  handleImageUpload,
  updateUserProfileImage,
  updateUserDisplayName,
  updateUserPassword,
} from "../services/privacyServices";
import { t } from "i18next";

const PrivacyScreen: React.FC = () => {
  const navigation = useNavigation();
  const [displayName, setDisplayName] = useState("");
  const [originalDisplayName, setOriginalDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [profileImage, setProfileImage] = useState(
    "https://via.placeholder.com/100"
  );
  const [isUpdatingProfile, setIsUpdatingProfile] = useState(false);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);
  const [confirmPasswordBorderColor, setConfirmPasswordBorderColor] =
    useState("#ccc");

  useFocusEffect(
    React.useCallback(() => {
      const loadProfile = async () => {
        try {
          const profile = await fetchUserProfile();
          if (profile) {
            setDisplayName(profile.displayName);
            setOriginalDisplayName(profile.displayName);
            setEmail(profile.email);
            setProfileImage(profile.profileImage);
          }
        } catch (error) {
          console.error("Error loading profile:", error);
        }
      };
      loadProfile();
    }, [])
  );

  const handleImageSelection = async () => {
    try {
      const imageUrl = await handleImageUpload();
      if (imageUrl) {
        await updateUserProfileImage(imageUrl);
        setProfileImage(imageUrl);
        Alert.alert("Success", "Profile updated successfully!");
      }
    } catch (error) {
      Alert.alert("Error", t("imageUpdateFailed"));
    }
  };

  const handleProfileUpdate = async () => {
    setIsUpdatingProfile(true);
    try {
      await updateUserDisplayName(displayName);
      setOriginalDisplayName(displayName);
      Alert.alert("Success", t("imageUpdateSuccess"));
    } catch (error: any) {
      Alert.alert("Error", t("nameUpdateFailed"));
    } finally {
      setIsUpdatingProfile(false);
    }
  };

  const handleNewPasswordChange = (text: string) => {
    setNewPassword(text);
    validatePasswordMatch(text, confirmPassword);
  };

  const handleConfirmPasswordChange = (text: string) => {
    setConfirmPassword(text);
    validatePasswordMatch(newPassword, text);
  };

  const validatePasswordMatch = (password: string, confirmPassword: string) => {
    if (password && confirmPassword && password === confirmPassword) {
      setConfirmPasswordBorderColor("#008F4C"); 
    } else {
      setConfirmPasswordBorderColor("#FF4444"); 
    }
  };

  const handlePasswordUpdate = async () => {
    if (newPassword !== confirmPassword) {
      Alert.alert("Error", t("passwordsNotMatch"));
      return;
    }

    if (!currentPassword) {
      Alert.alert("Error", t("currentPWReq"));
      return;
    }

    setIsUpdatingPassword(true);
    try {
      await updateUserPassword(currentPassword, newPassword);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
      Alert.alert("Success", t("PWUpSuccess"));
    } catch (error: any) {
      Alert.alert("Error", t("PWUpFailed"));
    } finally {
      setIsUpdatingPassword(false);
    }
  };

  const isDisplayNameChanged = displayName !== originalDisplayName;

  return (
    <SafeAreaView edges={["left", "right", "top"]} style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="chevron-back" size={24} color="#008F4C" />
        </TouchableOpacity>
        <Text style={styles.headerText}>{t("privacySettings")}</Text>
      </View>
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Update Section */}
        <View style={styles.profileContainer}>
          <Text style={styles.sectionTitle}>{t("updateProfile")}</Text>
          <TouchableOpacity
            onPress={handleImageSelection}
            style={styles.profileImageWrapper}
          >
            <Image style={styles.profileImage} source={{ uri: profileImage }} />
            <View style={styles.editIcon}>
              <Ionicons name="camera" size={20} color="#fff" />
            </View>
          </TouchableOpacity>
          <Text style={styles.email}>{email}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("displayName")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterYourDisplayName")}
              value={displayName}
              onChangeText={setDisplayName}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.saveButton,
              !isDisplayNameChanged && styles.saveButtonDisabled,
            ]}
            onPress={handleProfileUpdate}
            disabled={!isDisplayNameChanged || isUpdatingProfile}
          >
            <Text style={styles.saveButtonText}>
              {isUpdatingProfile ? t("updating") : t("updateProfile")}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Password Change Section */}
        <View style={styles.passwordContainer}>
          <Text style={styles.sectionTitle}>{t("changePassword")}</Text>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("currentPassword")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterYourPassword")}
              secureTextEntry
              value={currentPassword}
              onChangeText={setCurrentPassword}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("newPassword")}</Text>
            <TextInput
              style={styles.input}
              placeholder={t("enterYourNewPassword")}
              secureTextEntry
              value={newPassword}
              onChangeText={handleNewPasswordChange}
            />
          </View>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>{t("confirmPassword")}</Text>
            <TextInput
              style={[
                styles.input,
                { borderColor: confirmPasswordBorderColor },
              ]}
              placeholder={t("enterYourNewPassword")}
              secureTextEntry
              value={confirmPassword}
              onChangeText={handleConfirmPasswordChange}
            />
          </View>
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!currentPassword ||
                !newPassword ||
                !confirmPassword ||
                newPassword !== confirmPassword) &&
                styles.saveButtonDisabled,
            ]}
            onPress={handlePasswordUpdate}
            disabled={
              !currentPassword ||
              !newPassword ||
              !confirmPassword ||
              newPassword !== confirmPassword ||
              isUpdatingPassword
            }
          >
            <Text style={styles.saveButtonText}>
              {isUpdatingPassword ? t("updating") : t("changePassword")}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

export default PrivacyScreen;

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
    borderBottomColor: "#e0e0e0",
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  goBackButton: {
    marginRight: 12,
  },
  headerText: {
    fontSize: 22,
    fontWeight: "bold",
    color: "#008f4c",
    flex: 1,
  },
  scrollContainer: {
    padding: 20,
  },
  profileContainer: {
    marginBottom: 20,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    color: "#333",
  },
  profileImageWrapper: {
    justifyContent: "center",
    alignItems: "center",
    marginBottom: 20,
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: "#999",
  },
  editIcon: {
    position: "absolute",
    bottom: 0,
    right: 0,
    backgroundColor: "#008F4C",
    borderRadius: 12,
    padding: 6,
  },
  email: {
    fontSize: 16,
    color: "#008F4C",
    marginBottom: 16,
    fontWeight: "bold",
    textAlign: "center",
  },
  inputGroup: {
    marginBottom: 16,
  },
  label: {
    fontSize: 14,
    fontWeight: "500",
    color: "#333",
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 12,
    borderRadius: 8,
    backgroundColor: "#fff",
    fontSize: 14,
  },
  saveButton: {
    backgroundColor: "#008F4C",
    padding: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  saveButtonDisabled: {
    backgroundColor: "#ccc",
  },
  saveButtonText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 14,
  },
  passwordContainer: {
    marginBottom: 40,
    padding: 20,
    backgroundColor: "#fff",
    borderRadius: 12,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
});