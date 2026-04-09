// app/login.tsx
import { useRouter } from "expo-router";
import * as SecureStore from "expo-secure-store";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  useColorScheme,
  StyleSheet,
  Alert,
} from "react-native";
import { useState } from "react";
import axios from "axios";
import API_URL from "@/constants/api";

export default function LoginScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      Alert.alert("Validation Error", "Please enter email and password");
      return;
    }

    setLoading(true);
    try {
      const response = await axios.post(`${API_URL}/auth/login`, {
        email,
        password,
      });
      const token = response.data.access_token;
      const role = response.data.role; // get role from server

      // Save token and role
      await SecureStore.setItemAsync("token", token);
      await SecureStore.setItemAsync("role", role);
      await SecureStore.setItemAsync("email", email);

      // Redirect based on role
      if (role === "Handler") {
        router.replace("/scan"); // redirect Handler to Scan tab
      } else {
        router.replace("/exported"); // GM or OfficeStaff
      }
    } catch (err) {
      console.error("Login failed:", err);
      Alert.alert("Login Failed", "Invalid credentials");
    } finally {
      setLoading(false);
    }
  };
  //   const handleLogin = async () => {
  //     if (!email || !password) {
  //       Alert.alert("Validation Error", "Please enter email and password");
  //       return;
  //     }

  //     setLoading(true);
  //     try {
  //       const response = await axios.post(`${API_URL}/auth/login`, {
  //         email,
  //         password,
  //       });

  //       const token = response.data.access_token;
  //       const role = response.data.role; // <-- make sure backend returns role

  //       if (!role) {
  //         Alert.alert("Login Failed", "User role not found");
  //         setLoading(false);
  //         return;
  //       }

  //       // Store token and role securely
  //       await SecureStore.setItemAsync("token", token);
  //       await SecureStore.setItemAsync("role", role);

  //       // Navigate to tabs layout
  //       // You can choose which tab to open initially
  //       router.replace(`/(tabs)/exported?role=${role}`);
  //     } catch (err) {
  //       console.error("Login failed:", err);
  //       Alert.alert("Login Failed", "Invalid credentials");
  //     } finally {
  //       setLoading(false);
  //     }
  //   };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#121212" : "#fff" },
      ]}
    >
      <Text
        style={[
          styles.title,
          { color: colorScheme === "dark" ? "#fff" : "#000" },
        ]}
      >
        Login
      </Text>

      <TextInput
        placeholder="Email"
        placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        keyboardType="email-address"
        style={[
          styles.input,
          {
            color: colorScheme === "dark" ? "#fff" : "#000",
            borderColor: colorScheme === "dark" ? "#555" : "#ccc",
          },
        ]}
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
        value={password}
        onChangeText={setPassword}
        secureTextEntry
        style={[
          styles.input,
          {
            color: colorScheme === "dark" ? "#fff" : "#000",
            borderColor: colorScheme === "dark" ? "#555" : "#ccc",
          },
        ]}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: "#007aff", opacity: loading ? 0.6 : 1 },
        ]}
        onPress={handleLogin}
        disabled={loading}
      >
        <Text style={styles.buttonText}>
          {loading ? "Logging in..." : "Login"}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.signupContainer}
        onPress={() => router.push("/register")}
      >
        <Text style={{ color: "#007aff" }}>Don't have an account? Sign Up</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", paddingHorizontal: 24 },
  title: {
    fontSize: 28,
    fontWeight: "bold",
    marginBottom: 24,
    alignSelf: "center",
  },
  input: { borderWidth: 1, borderRadius: 8, padding: 12, marginBottom: 16 },
  button: { padding: 14, borderRadius: 8, alignItems: "center", marginTop: 8 },
  buttonText: { color: "#fff", fontWeight: "600", fontSize: 16 },
  signupContainer: { marginTop: 20, alignItems: "center" },
});

//========================= UNCOMMENT BELOW TO ROLLBACK ============================
// import { useRouter } from "expo-router";
// import * as SecureStore from "expo-secure-store";
// import {
//   View,
//   Text,
//   TextInput,
//   TouchableOpacity,
//   useColorScheme,
//   StyleSheet,
//   Alert,
// } from "react-native";
// import { useState } from "react";
// import axios from "axios";
// import API_URL from "@/constants/api";

// export default function LoginScreen() {
//   const router = useRouter();
//   const colorScheme = useColorScheme();

//   const [email, setEmail] = useState("");
//   const [password, setPassword] = useState("");
//   const [loading, setLoading] = useState(false);

//   const handleLogin = async () => {
//     if (!email || !password) {
//       Alert.alert("Validation Error", "Please enter email and password");
//       return;
//     }

//     setLoading(true);
//     try {
//       const response = await axios.post(`${API_URL}/auth/login`, {
//         email,
//         password,
//       });
//       const token = response.data.access_token;
//       await SecureStore.setItemAsync("token", token);

//       // Navigate to the main (tabs) screen
//       router.replace("/(tabs)/exported");
//     } catch (err) {
//       console.error("Login failed:", err);
//       Alert.alert("Login Failed", "Invalid credentials");
//     } finally {
//       setLoading(false);
//     }
//   };

//   return (
//     <View
//       style={[
//         styles.container,
//         { backgroundColor: colorScheme === "dark" ? "#121212" : "#fff" },
//       ]}
//     >
//       <Text
//         style={[
//           styles.title,
//           { color: colorScheme === "dark" ? "#fff" : "#000" },
//         ]}
//       >
//         Login
//       </Text>

//       <TextInput
//         placeholder="Email"
//         placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
//         value={email}
//         onChangeText={setEmail}
//         autoCapitalize="none"
//         keyboardType="email-address"
//         style={[
//           styles.input,
//           {
//             color: colorScheme === "dark" ? "#fff" : "#000",
//             borderColor: colorScheme === "dark" ? "#555" : "#ccc",
//           },
//         ]}
//       />

//       <TextInput
//         placeholder="Password"
//         placeholderTextColor={colorScheme === "dark" ? "#888" : "#999"}
//         value={password}
//         onChangeText={setPassword}
//         secureTextEntry
//         style={[
//           styles.input,
//           {
//             color: colorScheme === "dark" ? "#fff" : "#000",
//             borderColor: colorScheme === "dark" ? "#555" : "#ccc",
//           },
//         ]}
//       />

//       <TouchableOpacity
//         style={[
//           styles.button,
//           { backgroundColor: "#007aff", opacity: loading ? 0.6 : 1 },
//         ]}
//         onPress={handleLogin}
//         disabled={loading}
//       >
//         <Text style={styles.buttonText}>{loading ? "Logging in..." : "Login"}</Text>
//       </TouchableOpacity>

//       <TouchableOpacity
//         style={styles.signupContainer}
//         onPress={() => router.push("/register")}
//       >
//         <Text style={{ color: "#007aff" }}>Don't have an account? Sign Up</Text>
//       </TouchableOpacity>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: "center",
//     paddingHorizontal: 24,
//   },
//   title: {
//     fontSize: 28,
//     fontWeight: "bold",
//     marginBottom: 24,
//     alignSelf: "center",
//   },
//   input: {
//     borderWidth: 1,
//     borderRadius: 8,
//     padding: 12,
//     marginBottom: 16,
//   },
//   button: {
//     padding: 14,
//     borderRadius: 8,
//     alignItems: "center",
//     marginTop: 8,
//   },
//   buttonText: {
//     color: "#fff",
//     fontWeight: "600",
//     fontSize: 16,
//   },
//   signupContainer: {
//     marginTop: 20,
//     alignItems: "center",
//   },
// });
