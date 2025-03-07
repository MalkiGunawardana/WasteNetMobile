import * as React from "react";
import { NavigationContainer } from "@react-navigation/native";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import { createBottomTabNavigator } from "@react-navigation/bottom-tabs";
import WelcomeScreen from "./screens/WelcomeScreen";
import SignInScreen from "./screens/auth/SignInScreen";
import SignUpScreen from "./screens/auth/SignUpScreen";
import HomeScreen from "./screens/HomeScreen";
import ExploreScreen from "./screens/ExploreScreen";
import ChatScreen from "./screens/ChatScreen";
import ProfileScreen from "./screens/ProfileScreen";
import NotificationsScreen from "./screens/NotificationsScreen";
import AddItemScreen from "./screens/AddItemScreen";
import AddBuyerScreen from "./screens/AddBuyerScreen";
import UserItemsScreen from "./screens/UserItemsScreen";
import { StatusBar } from "expo-status-bar";
import { UserProvider } from "./context/UserContext";
import type { RootStackParamList, TabParamList } from "./types/navigation";
import ViewItemScreen from "./screens/ViewItemScreen";
import ViewBuyerScreen from "./screens/ViewBuyerScreen";
import EnvironmentalInfoScreen from "./screens/EnvironmentalInfo";
import HelpAndSupportScreen from "./screens/HelpAndSupportScreen";
import PrivacyScreen from "./screens/PrivacyScreen";
import UpdateItem from "./screens/UpdateItem";
import ViewChatScreen from "./screens/ViewChatScreen";
import AntDesign from "@expo/vector-icons/AntDesign";
import ForgotPasswordScreen from "./screens/auth/ForgotPasswordScreen";
import { LanguageProvider } from "./context/LanguageContext";
import AllBuyersScreen from "./screens/AllBuyersScreen";

const Stack = createNativeStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<TabParamList>();

function TabNavigator() {
  return (
    <LanguageProvider>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: "#008F4C",
          tabBarInactiveTintColor: "#666",
          tabBarStyle: {
            paddingBottom: 8,
            paddingTop: 8,
            height: 60,
          },
          headerStyle: {
            backgroundColor: "#fff",
          },
          headerTitleStyle: {
            color: "#000",
          },
        }}
      >
        <Tab.Screen
          name="Home"
          component={HomeScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <AntDesign name="home" size={25} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Explore"
          component={ExploreScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <AntDesign name="find" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="Chats"
          component={ChatScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <AntDesign name="message1" size={22} color={color} />
            ),
          }}
        />
        <Tab.Screen
          name="User"
          component={ProfileScreen}
          options={{
            headerShown: false,
            tabBarIcon: ({ color }) => (
              <AntDesign name="user" size={24} color={color} />
            ),
          }}
        />
      </Tab.Navigator>
    </LanguageProvider>
  );
}

export default function App() {
  return (
    <LanguageProvider>
      <UserProvider>
        <NavigationContainer>
          <StatusBar style="dark" />
          <Stack.Navigator
            initialRouteName="Welcome"
            screenOptions={{
              headerShown: false,
              contentStyle: { backgroundColor: "#fff" },
            }}
          >
            <Stack.Screen name="Welcome" component={WelcomeScreen} />
            <Stack.Screen name="SignIn" component={SignInScreen} />
            <Stack.Screen name="SignUp" component={SignUpScreen} />
            <Stack.Screen name="MainTabs" component={TabNavigator} />
            <Stack.Screen
              name="Notifications"
              component={NotificationsScreen}
              options={{
                headerShown: false,
                title: "Notifications",
              }}
            />
            <Stack.Screen
              name="EnvironmentalInfo"
              component={EnvironmentalInfoScreen}
              options={{
                headerShown: false,
                title: "Environmental Info",
              }}
            />
            <Stack.Screen
              name="AddItem"
              component={AddItemScreen}
              options={{
                headerShown: false,
                title: "Add New Item",
              }}
            />
            <Stack.Screen
              name="AddBuyer"
              component={AddBuyerScreen}
              options={{
                headerShown: false,
                title: "Add New Buyer",
              }}
            />
            <Stack.Screen
              name="UserItemsScreen"
              component={UserItemsScreen}
              options={{
                headerShown: false,
                title: "My Items",
              }}
            />
            <Stack.Screen
              name="AllBuyersScreen"
              component={AllBuyersScreen}
              options={{
                headerShown: false,
                title: "All Buyers",
              }}
            />
            <Stack.Screen
              name="ViewItemScreen"
              component={ViewItemScreen}
              options={{
                title: "Item Details",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="ViewBuyerScreen"
              component={ViewBuyerScreen}
              options={{
                title: "Buyer Details",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="HelpAndSupportScreen"
              component={HelpAndSupportScreen}
              options={{
                title: "Help And Support",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="PrivacyScreen"
              component={PrivacyScreen}
              options={{
                title: "Privacy Settings",
                headerShown: false,
              }}
            />
            <Stack.Screen
              name="UpdateItem"
              component={UpdateItem}
              options={{
                title: "Update Item",
                headerShown: false,
              }}
            />
            <Stack.Screen name="ViewChatScreen" component={ViewChatScreen} />
            <Stack.Screen
              name="ForgotPasswordScreen"
              component={ForgotPasswordScreen}
            />
          </Stack.Navigator>
        </NavigationContainer>
      </UserProvider>
    </LanguageProvider>
  );
}