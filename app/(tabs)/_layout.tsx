import { Tabs } from "expo-router";
import React from "react";
import { Platform } from "react-native";
import { HapticTab } from "@/components/HapticTab";
import { IconSymbol } from "@/components/ui/IconSymbol";
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
        tabBarBackground: TabBarBackground,
        tabBarStyle: Platform.select({
          ios: { position: "absolute" },
          default: {
            height: 80,
          },
        }),
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <IconSymbol name="home" color={color} />,
          tabBarItemStyle: {
            marginVertical: "auto",
          },
        }}
      />
      <Tabs.Screen
        name="signup"
        options={{
          title: "Sign up",
          tabBarIcon: ({ color }) => (
            <IconSymbol name="person-add" color={color} />
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
          tabBarIcon: ({ color }) => <IconSymbol name="login" color={color} />,
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
          tabBarIcon: ({ color }) => <IconSymbol name="create" color={color} />,
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
          tabBarIcon: ({ color }) => (
            <IconSymbol name="calendar-month" color={color} />
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
          tabBarIcon: ({ color }) => <IconSymbol name="person" color={color} />,
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
          tabBarIcon: ({ color }) => (
            <IconSymbol name="settings" color={color} />
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
