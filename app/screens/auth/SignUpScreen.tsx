import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  SafeAreaView,
  TextInput,
  Alert,
  ActivityIndicator,
  ScrollView,
  Image,
} from "react-native";
import { useNavigation } from "@react-navigation/native";
import type { NativeStackNavigationProp } from "@react-navigation/native-stack";
import {
  getAuth,
  createUserWithEmailAndPassword,
  sendEmailVerification,
} from "firebase/auth";
import { auth, db } from "../../../firebaseConfig";  //authentication and firebase database store data
import { useState } from "react";
import { doc, setDoc } from "firebase/firestore";
import { t } from "i18next";

type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
};

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

export default function SignUpScreen() {
  const navigation = useNavigation<NavigationProp>();

  const [displayName, setDisplayName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [isLoading, setIsLoading] = useState(false);
  const [errors, setErrors] = useState({
    displayName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const validateEmail = (email: string) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const validateInputs = () => {  //check all fields complete , password matching
    let valid = true;
    let newErrors = { displayName: "", email: "", password: "", confirmPassword: "" };

    if (!displayName.trim()) {
      newErrors.displayName = t("fullNameIsRequired");
      valid = false;
    }
    if (!email.trim()) {
      newErrors.email = t("emailIsRequired");
      valid = false;
    } else if (!validateEmail(email)) {
      newErrors.email = t("invalidEmailFormat");
      valid = false;
    }
    if (!password.trim()) {
      newErrors.password = t("passwordIsRequired");
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = t("passwordMustBeAtLeast8Characters");
      valid = false;
    }
    if (!confirmPassword.trim()) {
      newErrors.confirmPassword = t("confirmPasswordIsRequired");
      valid = false;
    } else if (confirmPassword !== password) {
      newErrors.confirmPassword = t("passwordsDoNotMatch");
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  };

  const handleSignUp = async () => {
    if (!validateInputs()) return;

    setIsLoading(true);

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await sendEmailVerification(user);

      await setDoc(doc(db, "users", user.uid), {
        id: user.uid,
        displayName,
        email,
        createdAt: new Date().toISOString(),
      });

      Alert.alert(t("success"), t("welcomeAlert"));
      navigation.navigate("SignIn");
    } catch (error: any) {
      Alert.alert("Error", t("accountCreationError"));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoContainer}>
          <Image source={require("../../assets/wastenet-icon.png")} style={styles.logo} resizeMode="contain" />
        </View>
        <Text style={styles.title}>{t("createAccount")}</Text>
        <Text style={styles.subtitle}>{t("joinCommiunitytoday")}</Text>
      </View>
      <ScrollView>
        <View style={styles.form}>
          {/* Full Name */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("fullName")}</Text>
            <TextInput
              style={[styles.input, errors.displayName && styles.inputError]}
              placeholder={t("enterYourDisplayName")}
              autoCapitalize="words"
              value={displayName}
              onChangeText={setDisplayName}
            />
            {errors.displayName ? <Text style={styles.errorText}>{errors.displayName}</Text> : null}
          </View>

          {/* Email */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("email")}</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder={t("enterYourEmail")}
              keyboardType="email-address"
              autoCapitalize="none"
              value={email}
              onChangeText={setEmail}
            />
            {errors.email ? <Text style={styles.errorText}>{errors.email}</Text> : null}
          </View>

          {/* Password */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("password")}</Text>
            <TextInput
              style={[styles.input, errors.password && styles.inputError]}
              placeholder={t("enterYourPassword")}
              secureTextEntry
              value={password}
              onChangeText={setPassword}
            />
            {errors.password ? <Text style={styles.errorText}>{errors.password}</Text> : null}
          </View>

          {/* Confirm Password with dynamic border color */}
          <View style={styles.inputContainer}>
            <Text style={styles.label}>{t("confirmPassword")}</Text>
            <TextInput
              style={[
                styles.input,
                errors.confirmPassword && styles.inputError,
                confirmPassword
                  ? confirmPassword === password
                    ? styles.inputSuccess
                    : styles.inputMismatch
                  : null,
              ]}
              placeholder={t("enterYourConfirmPassword")}
              secureTextEntry
              value={confirmPassword}
              onChangeText={setConfirmPassword}
            />
            {errors.confirmPassword ? <Text style={styles.errorText}>{errors.confirmPassword}</Text> : null}
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity style={styles.signUpButton} onPress={handleSignUp} disabled={isLoading}>
            {isLoading ? <ActivityIndicator size="small" color="#fff" /> : <Text style={styles.signUpButtonText}>{t("signUp")}</Text>}
          </TouchableOpacity>

          {/* Footer */}
          <View style={styles.footer}>
            <Text style={styles.footerText}>{t("alreadyhaveAnAccount")}</Text>
            <TouchableOpacity onPress={() => navigation.navigate("SignIn")}>
              <Text style={styles.footerLink}>{t("signIn")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },
  header: { paddingHorizontal: 20, paddingTop: 40, paddingBottom: 20 },
  title: { fontSize: 24, fontWeight: "bold", color: "#008F4C" },
  logo: { width: 100, height: 100 },
  logoContainer: { alignSelf: "flex-end" },
  subtitle: { fontSize: 16, color: "#666", marginTop: 8 },
  form: { padding: 20, gap: 16 },
  inputContainer: { gap: 8 },
  label: { fontSize: 14, fontWeight: "500", color: "#333" },
  input: { borderWidth: 1, borderColor: "#ddd", borderRadius: 8, padding: 12, fontSize: 16 },
  inputError: { borderColor: "red" },
  inputSuccess: { borderColor: "green" },
  inputMismatch: { borderColor: "red" },
  errorText: { color: "red", fontSize: 12 },
  signUpButton: { backgroundColor: "#008F4C", paddingVertical: 16, borderRadius: 8, alignItems: "center", marginTop: 8 },
  signUpButtonText: { color: "#fff", fontSize: 16, fontWeight: "600" },
  footer: { flexDirection: "row", justifyContent: "center", marginTop: 16 },
  footerText: { color: "#666", fontSize: 14 },
  footerLink: { color: "#008F4C", fontSize: 14, fontWeight: "500" },
});
