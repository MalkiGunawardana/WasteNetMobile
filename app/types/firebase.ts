export interface FirestoreUserData {
  uid: string;
  displayName: string | null;
  email: string | null;
  createdAt: string;
  profileImage: string;
}

export interface CustomUser {
  uid: string;
  displayName: string | null;
  email: string | null;
}
