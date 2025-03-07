import React, { useState } from "react";
import {
  SafeAreaView,
  StyleSheet,
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  Alert,
  Linking,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import { addDoc, collection, getFirestore } from "firebase/firestore";
import { getAuth } from "firebase/auth";
import { useTranslation } from "react-i18next"; // Import the useTranslation hook

const HelpAndSupportScreen = () => {
  const navigation = useNavigation();
  const { t } = useTranslation(); // Initialize translation function
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSendFeedback = async () => {
    if (!name.trim() || !email.trim() || !message.trim()) {
      Alert.alert(t("error"), t("fillInAllFields")); // Use translations
      return;
    }

    setLoading(true);

    try {
      const db = getFirestore();
      const auth = getAuth();
      const user = auth.currentUser;

      const feedbackData = {
        name,
        email,
        message,
        timestamp: new Date(),
        userId: user ? user.uid : null,
      };

      await addDoc(collection(db, "feedback"), feedbackData);

      Alert.alert(t("feedbackSent"), t("thankYouForFeedback"));

      setName("");
      setEmail("");
      setMessage("");
    } catch (error) {
      Alert.alert(t("error"), t("failedToSendFeedback"));
      console.error("Error sending feedback:", error);
    } finally {
      setLoading(false);
    }
  };

  const openExternalLink = async (url: string) => {
    const supported = await Linking.canOpenURL(url);
    if (supported) {
      await Linking.openURL(url);
    } else {
      Alert.alert(t("failedToOpenLink"));
    }
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.headerContainer}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#008f4c" />
        </TouchableOpacity>
        <Text style={styles.header}>{t("helpAndSupport")}</Text>
      </View>

      <ScrollView style={styles.container}>
        <View style={styles.faqContainer}>
          <Text style={styles.subHeader}>{t("faq")}</Text>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => Alert.alert(t("faq"), t("faqDetail1"))}
          >
            <Text style={styles.faqQuestion}>{t("faqQuestion1")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => Alert.alert(t("faq"), t("faqDetail2"))}
          >
            <Text style={styles.faqQuestion}>{t("faqQuestion2")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.faqItem}
            onPress={() => Alert.alert(t("faq"), t("faqDetail3"))}
          >
            <Text style={styles.faqQuestion}>{t("faqQuestion3")}</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.contactContainer}>
          <Text style={styles.subHeader}>{t("contactSupport")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("yourName")}
            value={name}
            onChangeText={setName}
          />
          <TextInput
            style={styles.input}
            placeholder={t("yourEmail")}
            keyboardType="email-address"
            value={email}
            onChangeText={setEmail}
          />
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder={t("yourMessage")}
            value={message}
            onChangeText={setMessage}
            multiline
          />
          <TouchableOpacity
            style={styles.button}
            onPress={handleSendFeedback}
            disabled={loading}
          >
            <Text style={styles.buttonText}>
              {loading ? t("sending") : t("sendMessage")}
            </Text>
          </TouchableOpacity>
        </View>

        <View style={styles.linksContainer}>
          <Text style={styles.subHeader}>{t("quickLinks")}</Text>
          <TouchableOpacity
            style={styles.link}
            onPress={() => openExternalLink("#")}
          >
            <Text style={styles.linkText}>{t("helpCenter")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => openExternalLink("#")}
          >
            <Text style={styles.linkText}>{t("privacyPolicy")}</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={styles.link}
            onPress={() => openExternalLink("#")}
          >
            <Text style={styles.linkText}>{t("termsOfService")}</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#f9f9f9",
  },
  headerContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingTop: 40,
    padding: 20,
    backgroundColor: "#fff",
    borderBottomWidth: 1,
    borderBottomColor: "#fff",
  },
  backButton: {
    marginRight: 16,
    color: "#008f4c",
  },
  header: {
    fontSize: 22,
    fontWeight: "900",
    color: "#008f4c",
  },
  container: {
    flex: 1,
    padding: 16,
  },
  subHeader: {
    fontSize: 18,
    fontWeight: "600",
    color: "#444",
    marginBottom: 12,
  },
  faqContainer: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: "#fff",
    padding: 12,
    marginBottom: 8,
    borderRadius: 8,
    elevation: 1,
  },
  faqQuestion: {
    fontSize: 16,
    color: "#333",
  },
  contactContainer: {
    marginBottom: 24,
  },
  input: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 12,
  },
  textArea: {
    height: 100,
    textAlignVertical: "top",
  },
  button: {
    backgroundColor: "#008f4c",
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  linksContainer: {
    marginBottom: 24,
  },
  link: {
    padding: 12,
    backgroundColor: "#fff",
    borderRadius: 8,
    marginBottom: 8,
    elevation: 1,
  },
  linkText: {
    fontSize: 16,
    color: "#008f4c",
    fontWeight: 700,
  },
});

export default HelpAndSupportScreen;
