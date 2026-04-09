// app/(tabs)/_layout.tsx
import { Tabs } from "expo-router";
import React, { useEffect, useState } from "react";
import { Alert } from "react-native";

import { HapticTab } from "@/components/haptic-tab";
import { IconSymbol } from "@/components/ui/icon-symbol";
import { Colors } from "@/constants/theme";
import { useColorScheme } from "@/hooks/use-color-scheme";
import * as SecureStore from "expo-secure-store";

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    const fetchRole = async () => {
      const storedRole = await SecureStore.getItemAsync("role");
      setRole(storedRole);
    };
    fetchRole();
  }, []);

  if (!role) {
    return null; // could show a loader here
  }

  // Map of allowed tabs per role
  const allowedTabs: Record<string, string[]> = {
    GM: ["index", "exported"],
    Handler: ["scan"],
    OfficeStaff: ["index", "exported", "barcode", "emails"],
  };

  const checkAccess = (tabName: string) => {
    return allowedTabs[role]?.includes(tabName);
  };

  // Function to handle unauthorized access
  const blockAccess = (tabName: string) => {
    Alert.alert("Access Denied", `Your account is not allowed to access ${tabName}`);
  };

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
        initialParams={{ role }}
        options={{
          title: "Products",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="cube.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!checkAccess("index")) {
              e.preventDefault();
              blockAccess("Products");
            }
          },
        }}
      />

      <Tabs.Screen
        name="exported"
        initialParams={{ role }}
        options={{
          title: "Exported",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="icloud.and.arrow.down" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!checkAccess("exported")) {
              e.preventDefault();
              blockAccess("Exported");
            }
          },
        }}
      />

      <Tabs.Screen
        name="scan"
        options={{
          title: "Scan",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="camera.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!checkAccess("scan")) {
              e.preventDefault();
              blockAccess("Scan");
            }
          },
        }}
      />

      <Tabs.Screen
        name="barcode"
        options={{
          title: "Barcode",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="barcode" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!checkAccess("barcode")) {
              e.preventDefault();
              blockAccess("Barcode");
            }
          },
        }}
      />

      <Tabs.Screen
        name="emails"
        options={{
          title: "Emails",
          tabBarIcon: ({ color }) => <IconSymbol size={28} name="envelope.fill" color={color} />,
        }}
        listeners={{
          tabPress: (e) => {
            if (!checkAccess("emails")) {
              e.preventDefault();
              blockAccess("Emails");
            }
          },
        }}
      />
    </Tabs>
  );
}
// ============================== UNCOMMENT CODE BELOW TO ROLLBACK ==========================================
// import { Tabs } from "expo-router";
// import React from "react";

// import { HapticTab } from "@/components/haptic-tab";
// import { IconSymbol } from "@/components/ui/icon-symbol";
// import { Colors } from "@/constants/theme";
// import { useColorScheme } from "@/hooks/use-color-scheme";

// export default function TabLayout() {
//   const colorScheme = useColorScheme();

//   return (
//     <Tabs
//       screenOptions={{
//         tabBarActiveTintColor: Colors[colorScheme ?? "light"].tint,
//         headerShown: false,
//         tabBarButton: HapticTab,
//       }}
//     >
//       <Tabs.Screen
//         name="index"
//         options={{
//           title: "Products",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="cube.fill" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="exported"
//         options={{
//           title: "Exported",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="icloud.and.arrow.down" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="scan"
//         options={{
//           title: "Scan",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="camera.fill" color={color} />
//           ),
//         }}
//       />
//       <Tabs.Screen
//         name="barcode"
//         options={{
//           title: "Barcode",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="barcode" color={color} />
//           ),
//         }}
//       />

//       <Tabs.Screen
//         name="emails"
//         options={{
//           title: "Emails",
//           tabBarIcon: ({ color }) => (
//             <IconSymbol size={28} name="envelope.fill" color={color} />
//           ),
//         }}
//       />
//     </Tabs>
//   );
// }
