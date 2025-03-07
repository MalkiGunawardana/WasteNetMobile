import React, { useState, useCallback } from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Alert,
  Image,
  Modal,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation, useFocusEffect } from "@react-navigation/native";
import { getUserProfile } from "../services/firebase";
import { auth } from "../../firebaseConfig";
import { getAuth, signOut } from "firebase/auth";
import Feather from "@expo/vector-icons/Feather";
import { t } from "i18next";
import { useLanguage } from "../context/LanguageContext";

interface MenuItem {
  icon: keyof typeof Feather.glyphMap;
  label: string;
  action: () => void;
  color?: string;
}

export default function ProfileScreen() {
  const navigation = useNavigation();
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const { language, setLanguage } = useLanguage();
  const [modalVisible, setModalVisible] = useState(false);

  const fetchUserProfile = async () => {   //fetch data
    try {
      setLoading(true);
      const currentUser = auth.currentUser;
      if (currentUser) {
        const profile = await getUserProfile(currentUser.uid);
        if (profile) {
          setUser(profile);
        } else {
          setUser(null);
        }
      } else {
        setUser(null);
      }
    } catch (error) {
      console.error("Error fetching user profile:", error);
      alert("Failed to load profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useFocusEffect(
    useCallback(() => {
      fetchUserProfile();
    }, [])
  );

  const menuItems: MenuItem[] = [
    {
      icon: "bell",
      label: t("notifications"),
      action: () => navigation.navigate("Notifications" as never),
      //action: () => {},
    },
     {
       icon: "shield",
       label: t("privacy"),
       action: () => navigation.navigate("PrivacyScreen" as never),
     },
     {
       icon: "file-text",
       label: t("environmentalInfo"),
       action: () => navigation.navigate("EnvironmentalInfo" as never),
     },
     {
       icon: "help-circle",
       label: t("helpAndSupport"),
       action: () => navigation.navigate("HelpAndSupportScreen" as never),
     },
    {
      icon: "globe",
      label: t("changeLanguage"),
      action: () => setModalVisible(true),
    },
    {
      icon: "log-out",
      label: t("logOut"),
      action: () => handleLogOut(),
      color: "#ff4444",
    },
  ];

  const languageOptions: {
    label: string;
    value: "en" | "si";
    nativeText: string;
  }[] = [
    { label: "English", value: "en", nativeText: "English" },
    { label: "සිංහල", value: "si", nativeText: "සිංහල" },
  ];

  const handleLogOut = () => { //logout
    Alert.alert(t("confirmLogOut"), t("confirmLogOutMessage"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("yes"),
        style: "destructive",
        onPress: () => {
          const auth = getAuth();
          signOut(auth)
            .then(() => {
              setUser(null);
              navigation.reset({
                index: 0,
                routes: [{ name: "Welcome" as never }],
              });
            })
            .catch((error) => {
              console.error("Logout Error:", error);
            });
        },
      },
    ]);
  };

  const handleLanguageChange = (lang: "en" | "si") => {
    setLanguage(lang);
    setModalVisible(false);
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView>
        {!user ? (
          <View style={styles.header}>
            <View style={[styles.profileAvatar, styles.skeleton]} />
            <View
              style={[
                styles.skeletonText,
                { width: 120, height: 22, marginTop: 10 },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                { width: 180, height: 16, marginTop: 10 },
              ]}
            />
            <View
              style={[
                styles.skeletonText,
                { width: 140, height: 14, marginTop: 8 },
              ]}
            />
          </View>
        ) : (
          <View style={styles.header}>
            <View style={styles.profileAvatar}>
              {user?.profileImage ? (
                <Image
                  source={{ uri: user.profileImage }}
                  style={styles.profileImage}
                />
              ) : (
                <Text style={styles.avatarText}>
                  {user?.displayName?.charAt(0)?.toUpperCase()}
                </Text>
              )}
            </View>
            <Text style={styles.profileName}>{user?.displayName}</Text>
            <Text style={styles.profileEmail}>{user?.email}</Text>
            <Text style={styles.profileCreatedAt}>
              Member Since {new Date(user?.createdAt).toDateString()}
            </Text>
          </View>
        )}

        <View style={styles.menuSection}>
          {menuItems.map((item, index) => (
            <TouchableOpacity
              key={index}
              style={styles.menuItem}
              onPress={item.action}
            >
              <View style={styles.menuItemLeft}>
                <Feather
                  name={item.icon}
                  size={24}
                  color={item.color || "#008F4C"}
                />
                <Text
                  style={[
                    styles.menuItemText,
                    item.color && { color: item.color },
                  ]}
                >
                  {item.label}
                </Text>
              </View>
              <Feather
                name="chevron-right"
                size={20}
                color={item.color || "#666"}
              />
            </TouchableOpacity>
          ))}
        </View>

        <Modal
          animationType="fade"
          transparent={true}
          visible={modalVisible}
          onRequestClose={() => setModalVisible(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalView}>
              <Text style={styles.modalTitle}>{t("changeLanguage")}</Text>
              {languageOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.languageOption,
                    language === option.value && styles.selectedLanguage,
                  ]}
                  onPress={() => handleLanguageChange(option.value)}
                >
                  <Text
                    style={[
                      styles.languageOptionText,
                      language === option.value && styles.selectedLanguageText,
                    ]}
                  >
                    {option.nativeText}
                  </Text>
                </TouchableOpacity>
              ))}

              <TouchableOpacity
                style={styles.closeButton}
                onPress={() => setModalVisible(false)}
              >
                <Text style={styles.closeButtonText}>{t("close")}</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
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
    alignItems: "center",
    padding: 20,
    paddingTop: 40,
    backgroundColor: "#fff",
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  profileAvatar: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: "#008F4C",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 12,
    elevation: 4,
  },
  avatarText: {
    color: "#008F4C",
    fontSize: 36,
    fontWeight: "700",
  },
  profileImage: {
    width: 100,
    height: 100,
    borderRadius: 50,
  },
  profileName: {
    fontSize: 24,
    fontWeight: "700",
    color: "#000",
    marginTop: 8,
  },
  profileEmail: {
    fontSize: 16,
    color: "#7d7d7d",
    marginTop: 4,
  },
  profileCreatedAt: {
    fontSize: 12,
    color: "#008F4C",
    marginTop: 8,
  },
  menuSection: {
    padding: 20,
  },
  menuItem: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 16,
    backgroundColor: "#fff",
    borderRadius: 12,
    marginBottom: 10,
    paddingHorizontal: 16,
    elevation: 1,
  },
  menuItemLeft: {
    flexDirection: "row",
    alignItems: "center",
  },
  menuItemText: {
    marginLeft: 12,
    fontSize: 16,
    fontWeight: "500",
    color: "#333",
  },
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.5)",
  },
  modalView: {
    margin: 20,
    backgroundColor: "white",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
    width: "80%",
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#008F4C",
    marginBottom: 16,
  },
  languageOption: {
    width: "100%",
    padding: 16,
    borderRadius: 8,
    marginVertical: 4,
  },
  selectedLanguage: {
    backgroundColor: "#E8F5E9",
  },
  languageOptionText: {
    fontSize: 16,
    textAlign: "center",
    color: "#333",
  },
  selectedLanguageText: {
    color: "#008F4C",
    fontWeight: "600",
  },
  closeButton: {
    marginTop: 16,
    padding: 12,
    width: "100%",
    borderRadius: 8,
    backgroundColor: "#F3F4F6",
  },
  closeButtonText: {
    textAlign: "center",
    color: "#666",
    fontSize: 14,
    fontWeight: "500",
  },
  skeleton: {
    backgroundColor: "#e0e0e0",
    borderRadius: 8,
  },
  skeletonText: {
    backgroundColor: "#e0e0e0",
    borderRadius: 4,
    alignSelf: "center",
  },
});
