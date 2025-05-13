import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import MaterialIcons from "@expo/vector-icons/MaterialIcons";

import { useAuth } from "@/context/AuthContext";

export default function TabLayout() {
  const { token } = useAuth();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: "white",
        headerShown: false,
        tabBarButton: HapticTab,
        tabBarStyle: Platform.select({
          ios: {
            position: "absolute",
            height: 100,
            display: token ? "flex" : "none",
          },
          default: {
            height: 100,
          },
        }),
        tabBarLabelPosition: "below-icon",
        tabBarIconStyle: {
          marginTop: 15,
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
          href: token ? "/(tabs)" : null,
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
        }}
      />
    </Tabs>
  );
}
