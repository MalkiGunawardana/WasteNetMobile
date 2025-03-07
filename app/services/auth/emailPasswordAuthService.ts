import {
  sendEmailVerification,
  signInWithEmailAndPassword,
} from "firebase/auth";
import { auth } from "../../../firebaseConfig";
import { CustomUser } from "../../types/customUser";
import { getUserProfile } from "../firebase";

export const signInWithEmailPassword = async (
  email: string,
  password: string,
  setUser: (user: CustomUser | null) => void  //update user after valid login
) => {
  try {
    if (!email.trim()) {        //if the email or password is empty > send error
      throw "Please enter your email.";
    }
    if (!password.trim()) {
      throw "Please enter your password.";
    }

    const userCredential = await signInWithEmailAndPassword(auth, email, password);
    const user = userCredential.user; //authenticate the user with the provided email and password.

    if (!user.emailVerified) {    //check email verification
      await sendEmailVerification(user);
      throw "Your email is not verified. Please check your inbox.";
    }

    const userProfile = await getUserProfile(user.uid);

    const userData: CustomUser = {
      uid: user.uid,
      email: user.email,
      displayName: user.displayName,
      emailVerified: user.emailVerified,
      photoURL: user.photoURL,
      phoneNumber: user.phoneNumber,
      createdAt: userProfile?.createdAt || null,
      metadata: {
        creationTime: user.metadata.creationTime as string | undefined,
        lastSignInTime: user.metadata.lastSignInTime as string | undefined,
      },
    };

    setUser(userData);    //update user details
  } catch (error: any) {
    throw error.message;
  }
};
