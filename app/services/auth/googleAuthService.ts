import * as Google from "expo-auth-session/providers/google";
import { auth } from "../../../firebaseConfig";
import { GoogleAuthProvider, signInWithCredential } from "firebase/auth";
import Constants from "expo-constants";
import { CustomUser } from "../../types/customUser";

export const useGoogleSignIn = () => {
  // Access credentials from `app.json` via Constants
  const androidClientId =     //fetch google client IDs
    Constants.expoConfig?.extra?.EXPO_PUBLIC_ANDROID_CLIENT_ID;
  const iosClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_IOS_CLIENT_ID;
  const webClientId = Constants.expoConfig?.extra?.EXPO_PUBLIC_WEB_CLIENT_ID;

  // Configure Google Auth Request
  const [request, response, promptAsync] = Google.useIdTokenAuthRequest({
    clientId: webClientId,
    iosClientId: iosClientId,
    androidClientId: androidClientId,
  });

  const handleGoogleSignIn = async (   //handle google signin
    setUser: (user: CustomUser | null) => void
  ): Promise<boolean> => {
    if (!request) {
      console.error("Google Sign-In is not configured correctly.");
      return false;
    }

    try {
      const result = await promptAsync();
      if (result.type === "success") {
        const { id_token } = result.params;

        // Use the token to sign in to Firebase
        const credential = GoogleAuthProvider.credential(id_token);
        const userCredential = await signInWithCredential(auth, credential);
        const user = userCredential.user;

        // Process user data as in your original code
        setUser({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          emailVerified: user.emailVerified,
          photoURL: user.photoURL,
          phoneNumber: user.phoneNumber,
          metadata: {
            creationTime: user.metadata.creationTime as string | undefined,
            lastSignInTime: user.metadata.lastSignInTime as string | undefined,
          },
          createdAt: null,
        });

        return true;
      }
      return false;
    } catch (error) {
      console.error("Google Sign-In Error:", error);
      return false;
    }
  };

  return {
    handleGoogleSignIn,
  };
};
