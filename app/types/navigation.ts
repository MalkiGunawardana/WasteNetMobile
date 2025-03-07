export type RootStackParamList = {
  Welcome: undefined;
  SignIn: undefined;
  SignUp: undefined;
  MainTabs: undefined;
  Notifications: undefined;
  AddItem: undefined;
  AddBuyer: undefined;
  ManageItems: undefined;
  Explore: undefined;
  UserItemsScreen: undefined;
  ViewItemScreen: { itemId: string };
  ViewBuyerScreen: { buyerId: string };
  EnvironmentalInfo: undefined;
  HelpAndSupportScreen: undefined;
  PrivacyScreen: undefined;
  ChatScreen: { userId: string };
  EditItemScreen: { itemId: string };
  UpdateItem: { itemId: string };
  ViewChatScreen: { receiverId: string; receiverName: string };
  ForgotPasswordScreen: undefined;
  AllBuyersScreen: undefined;
  
};

export type TabParamList = {
  Home: undefined;
  Explore: undefined;
  Chats: undefined;
  User: undefined;
  
};
