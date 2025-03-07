export interface CustomUser {
  uid: string;
  displayName: string | null;
  email: string | null;
  createdAt: string | null;
  emailVerified?: boolean;
  photoURL?: string | null;
  phoneNumber?: string | null;
  metadata?: {
    creationTime?: string;
    lastSignInTime?: string;
  };
}
