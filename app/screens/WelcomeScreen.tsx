import React, { useState } from "react";
import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Modal,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { RootStackParamList } from "../types/navigation";
import Feather from "@expo/vector-icons/Feather";
import { useLanguage } from "../context/LanguageContext";
import { useTranslation } from "react-i18next";

const languageOptions: {
  label: string;
  value: "en" | "si";
  nativeText: string;
}[] = [
  { label: "English", value: "en", nativeText: "English" },
  { label: "සිංහල", value: "si", nativeText: "සිංහල" },
];

export default function WelcomeScreen() {  //main functional component
  const navigation =
    useNavigation<NativeStackNavigationProp<RootStackParamList>>();
  const { language, setLanguage } = useLanguage();
  const { t } = useTranslation();
  const [modalVisible, setModalVisible] = useState(false);  // modal visibility state

  const handleLanguageChange = (lang: "en" | "si") => {
    setLanguage(lang);          //update langu
    setModalVisible(false);     // close modal   
  };

  const getCurrentLanguageLabel = () => {
    return languageOptions.find((option) => option.value === language)
      ?.nativeText;
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.languageButton}
          onPress={() => setModalVisible(true)}
        >
          <Feather name="globe" size={20} color="#008F4C" />
          <Text style={styles.languageButtonText}>
            {getCurrentLanguageLabel()}
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.logoContainer}>  
        <Image
          source={require("../assets/wastenet-icon.png")}
          style={styles.logo}
          resizeMode="contain"
        />
      </View>

      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={styles.loginButton}
          onPress={() => navigation.navigate("SignIn")}
        >
          <Text style={styles.loginButtonText}>{t("signIn")}</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.signupButton}
          onPress={() => navigation.navigate("SignUp")}
        >
          <Text style={styles.signupButtonText}>{t("signUp")}</Text>
        </TouchableOpacity>
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
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
  },
  header: {
    padding: 16,
    alignItems: "flex-end",
  },
  languageButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 20,
    padding: 8,
    borderRadius: 20,
    backgroundColor: "#F3F4F6",
  },
  languageButtonText: {
    marginLeft: 8,
    color: "#008F4C",
    fontSize: 14,
    fontWeight: "500",
  },
  logoContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
  logo: {
    width: 150,
    height: 150,
  },
  tagline: {
    textAlign: "center",
    marginTop: 8,
    color: "#008F4C",
    fontSize: 14,
    fontWeight: "500",
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 40,
    gap: 12,
  },
  loginButton: {
    backgroundColor: "#008F4C",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
  },
  loginButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  signupButton: {
    backgroundColor: "#fff",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#008F4C",
  },
  signupButtonText: {
    color: "#008F4C",
    fontSize: 16,
    fontWeight: "600",
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
    shadowOffset: {
      width: 0,
      height: 2,
    },
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
});
