import { Tabs } from "expo-router";
import React from "react";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
        headerShown: false,
        tabBarButton: HapticTab,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="cube.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="exported"
        options={{
          title: "Exported",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="icloud.and.arrow.down" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="camera.fill" color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="barcode"
        options={{
          title: "Barcode",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="barcode" color={color} />
          ),
        }}
      />

      <Tabs.Screen
        name="emails"
        options={{
          title: "Emails",
          tabBarIcon: ({ color }) => (
            <IconSymbol size={28} name="envelope.fill" color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
