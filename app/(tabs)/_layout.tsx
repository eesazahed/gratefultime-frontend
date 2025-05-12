import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";
import TabBarBackground from "@/components/ui/TabBarBackground";

import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const { token } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        headerShown: false,
        tabBarButton: HapticTab,
        // tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {
            height: 80,
          },
        }),
        tabBarLabelPosition: "below-icon",
        tabBarIconStyle: {
          marginBottom: 5,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: () => (
            <MaterialIcons name="home" color="white" size={28} />
          ),
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: "Sign up",
          tabBarIcon: () => (
            <MaterialIcons name="person-add" color="white" size={28} />
          ),
          href: !token ? "/(tabs)/signup" : null,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="login"
        options={{
          title: "Login",
          tabBarIcon: () => (
            <MaterialIcons name="login" color="white" size={28} />
          ),
          href: !token ? "/(tabs)/login" : null,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="grateful"
        options={{
          title: "Grateful",
          tabBarIcon: () => (
            <MaterialIcons name="create" color="white" size={28} />
          ),
          href: token ? "/(tabs)/grateful" : null,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="calendar"
        options={{
          title: "Calendar",
          tabBarIcon: () => (
            <MaterialIcons name="calendar-month" color="white" size={28} />
          ),
          href: token ? "/(tabs)/calendar" : null,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: () => (
            <MaterialIcons name="person" color="white" size={28} />
          ),
          href: token ? "/(tabs)/profile" : null,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Settings",
          tabBarIcon: () => (
            <MaterialIcons name="settings" color="white" size={28} />
          ),
          href: token ? "/(tabs)/settings" : null,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
    </Tabs>
  );
}
