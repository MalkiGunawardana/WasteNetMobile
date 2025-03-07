import React from "react";
import {
  StyleSheet,
  View,
  ScrollView,
  Text,
  TouchableOpacity,
  Linking,
  Alert,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useNavigation } from "@react-navigation/native";
import { Ionicons } from "@expo/vector-icons";
import AntDesign from "@expo/vector-icons/AntDesign";
import { t } from "i18next";
export default function EnvironmentalInfoScreen() {
  const navigation = useNavigation();

  const documents = [
    {
      title: t("t1"),
      url: "https://drive.google.com/file/d/1e8vFN1haZEsCPvRhwZMrd637HJoR25Re/view?usp=drive_link",
    },
    {
      title: t("t2"),
      url: "https://drive.google.com/file/d/1vzPQz-Q3-oraq8yOnG3NG_gW_ttE0-pC/view?usp=drive_link",
    },
    {
      title: t("t3"),
      url: "https://drive.google.com/file/d/113Tvne4Ws3sndrEySP9Bcw1JRXBEqsSF/view?usp=drive_link",
    },
  ];

  const handleDownload = async (url: string) => {
    try {
      await Linking.openURL(url);
    } catch (error) {
      console.error("Error opening URL:", error);
      alert(t("failedToOpenDoc"));
    }
  };

  const handleCallHotline = () => {
    Alert.alert(t("envhl"), t("callhl"), [
      {
        text: t("cancel"),
        style: "cancel",
      },
      {
        text: t("yes"),
        onPress: async () => {
          const phoneNumber = "tel:1981";
          try {
            await Linking.openURL(phoneNumber);
          } catch (error) {
            console.error("Error opening dialer:", error);
            alert(t("failedToCall"));
          }
        },
      },
    ]);
  };

  return (
    <SafeAreaView edges={["top", "left", "right"]} style={styles.container}>
      <View style={styles.header}>
        {/* Back Button */}
        <TouchableOpacity
          style={styles.goBackButton}
          onPress={() => navigation.goBack()}
        >
          <Ionicons name="arrow-back" size={24} color="#008F4C" />
        </TouchableOpacity>

        {/* Screen Title */}
        <Text style={styles.headerText}>{t("envinfo")}</Text>
      </View>

      <ScrollView contentContainerStyle={styles.scrollView}>
        <View style={styles.section}>
          <TouchableOpacity
            style={styles.hotlineContainer}
            onPress={handleCallHotline}
          >
            <Text style={styles.hotlineLabel}>{t("hotline")}</Text>

            {/* Touchable to trigger call action */}
            <TouchableOpacity>
              <Text style={styles.hotlineNumber}>1981</Text>
            </TouchableOpacity>
          </TouchableOpacity>

          <View style={styles.divider} />

          {/* Document List Section */}
          <View style={styles.documentsContainer}>
            {documents.map((doc, index) => (
              <TouchableOpacity
                key={index}
                style={styles.downloadButton}
                onPress={() => handleDownload(doc.url)}
              >
                <AntDesign name="clouddownloado" size={30} color="#008F4C" />
                <Text style={styles.downloadText}>{doc.title}</Text>
              </TouchableOpacity>
            ))}
          </View>
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
    fontSize: 22,
    fontWeight: "bold",
    color: "#008f4c",
    flex: 1,
  },
  scrollView: {
    paddingVertical: 0,
  },
  section: {
    padding: 20,
  },
  hotlineContainer: {
    backgroundColor: "#e6f4ea",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
    marginBottom: 20,
  },
  hotlineLabel: {
    fontSize: 16,
    color: "#666",
    marginBottom: 8,
    textAlign: "center",
  },
  hotlineNumber: {
    fontSize: 28,
    fontWeight: "600",
    color: "#008F4C",
  },
  divider: {
    height: 1,
    backgroundColor: "#fff",
    marginVertical: 10,
  },
  subtitle: {
    fontSize: 18,
    fontWeight: "600",
    color: "#121212",
    marginBottom: 16,
  },
  documentsContainer: {
    gap: 12,
  },
  downloadButton: {
    flexDirection: "row",
    alignItems: "center",
    padding: 16,
    paddingBottom: 25,
    paddingTop: 25,
    backgroundColor: "#f0eded",
    borderRadius: 10,
    gap: 12,
  },
  downloadText: {
    flex: 1,
    fontSize: 16,
    color: "#333",
  },
});
