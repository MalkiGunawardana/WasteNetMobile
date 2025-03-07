import React, { useState, useEffect } from "react";
import { useNavigation } from "@react-navigation/native";
import {
  Alert,
  BackHandler,
  ActivityIndicator,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  Image,
  StyleSheet,
  View,
} from "react-native";
import { signInWithEmailPassword } from "../../services/auth/emailPasswordAuthService";
import { useUser } from "../../context/UserContext";
import { useGoogleSignIn } from "../../services/auth/googleAuthService";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import { t } from "i18next";

type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  ForgotPasswordScreen: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignInScreen() {
  const navigation = useNavigation<NavigationProp>();
  const { setUser } = useUser(); // Access the context's setUser function
  const { handleGoogleSignIn } = useGoogleSignIn();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loadingEmailPassword, setLoadingEmailPassword] = useState(false);
  const [loadingGoogle, setLoadingGoogle] = useState(false);

  const handleEmailSignIn = async () => {  //sign in with email
    if (!email.trim()) {
      Alert.alert("Sign In Error", "Please enter your email.");
      return;
    }
    if (!password.trim()) {
      Alert.alert("Sign In Error", "Please enter your password.");
      return;
    }
  
    setLoadingEmailPassword(true);
    try {
      await signInWithEmailPassword(email, password, setUser);
      navigation.reset({
        index: 0,
        routes: [{ name: "MainTabs" }],
      });
    } catch (error: any) {
      const errorMessage = typeof error === "string" ? error : "An error occurred";
      Alert.alert("Sign In Error", "Email or password is incorrect. Check and try again.", [{ text: "OK", onPress: () => setPassword("") }]);
    } finally {
      setLoadingEmailPassword(false);
    }
  };
  
  
  

  // google sign in
  // In SignInScreen component
  const handleGoogleSignInButton = async () => {
    setLoadingGoogle(true);
    try {
      const isSuccess = await handleGoogleSignIn(setUser);
      if (isSuccess) {
        navigation.reset({
          index: 0,
          routes: [{ name: "MainTabs" }],
        });
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Something went wrong";
      Alert.alert("Google Sign-In Error", errorMessage);
    } finally {
      setLoadingGoogle(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image
            source={require("../../assets/wastenet-icon.png")}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>
        <Text style={styles.title}>{t("signIn")}</Text>
        <Text style={styles.subtitle}>{t("welcomeBack")}</Text>
      </View>
  
      <View style={styles.form}>
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("email")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("enterYourEmail")}
            keyboardType="email-address"
            autoCapitalize="none"
            value={email}
            onChangeText={setEmail}
            autoComplete="email"
          />
        </View>
  
        <View style={styles.inputContainer}>
          <Text style={styles.label}>{t("password")}</Text>
          <TextInput
            style={styles.input}
            placeholder={t("enterYourPassword")}
            secureTextEntry
            value={password}
            onChangeText={setPassword}
          />
        </View>
  
        <TouchableOpacity style={styles.forgotPassword}>
          <Text
            style={styles.forgotPasswordText}
            onPress={() => navigation.navigate("ForgotPasswordScreen")}
          >
            {t("forgotPassword")}
          </Text>
        </TouchableOpacity>
  
        <TouchableOpacity
          style={[
            styles.signInButton,
            loadingEmailPassword && styles.disabledButton,
          ]}
          onPress={handleEmailSignIn}
          disabled={loadingEmailPassword}
        >
          {loadingEmailPassword ? (
            <ActivityIndicator size="small" color="#fff" />
          ) : (
            <Text style={styles.signInButtonText}>{t("signIn")}</Text>
          )}
        </TouchableOpacity>
  
        <View style={styles.footer}>
          <Text style={styles.footerText}>{t("dontHaveAnAccount")}</Text>
          <TouchableOpacity onPress={() => navigation.navigate("SignUp")}>
            <Text style={styles.footerLink}>{t("signUp")}</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 26, fontWeight: "bold", color: "#008F4C" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8 },
  form: { padding: 20, gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: "500", color: "#333" },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
  },
  forgotPassword: { alignSelf: "flex-end" },
  forgotPasswordText: { color: "#008F4C", fontSize: 14 },
  signInButton: {
    backgroundColor: "#008F4C",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  logo: {
    width: 100,
    height: 100,
  },
  logoContainer:{
    alignSelf: "flex-end",
  },
  disabledButton: {},
  googleSignInButton: {
    flexDirection: "row",
    justifyContent: "center",
    backgroundColor: "#4285F4",
    paddingVertical: 16,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 8,
  },
  googleIcon: { width: 24, height: 24, marginRight: 12 },
  signInButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { color: "#666", fontSize: 14 },
  footerLink: { color: "#008F4C", fontSize: 14, fontWeight: "500" },
});
