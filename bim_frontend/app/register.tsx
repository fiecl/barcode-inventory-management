// app/register.tsx
import React, { useState } from "react";
import { 
  View, TextInput, Button, Alert, StyleSheet, Text, TouchableOpacity, Modal, FlatList, useColorScheme 
} from "react-native";
import axios from "axios";
import { useRouter } from "expo-router";
import API_URL from "@/constants/api";

const roles = ["GM", "Handler", "OfficeStaff"];

export default function RegisterScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState("GM"); // default
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const handleRegister = async () => {
    try {
      await axios.post(`${API_URL}/auth/register`, { email, password, role });
      Alert.alert("Success", "Account created. Please login.");
      router.replace("/login");
    } catch (err: any) {
      console.error(err);
      Alert.alert("Registration Failed", err.response?.data?.detail || "Error");
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: colorScheme === "dark" ? "#121212" : "#fff" },
      ]}
    >
      <TextInput
        placeholder="Email"
        placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
        value={email}
        onChangeText={setEmail}
        style={[
          styles.input,
          {
            color: colorScheme === "dark" ? "#fff" : "#000",
            borderColor: colorScheme === "dark" ? "#555" : "#ccc",
          },
        ]}
        autoCapitalize="none"
      />

      <TextInput
        placeholder="Password"
        placeholderTextColor={colorScheme === "dark" ? "#aaa" : "#888"}
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

      <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000", marginBottom: 4 }}>
        Select Role
      </Text>

      <TouchableOpacity
        onPress={() => setShowRoleDropdown(true)}
        style={[
          styles.dropdown,
          {
            borderColor: colorScheme === "dark" ? "#555" : "#ccc",
            backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
          },
        ]}
      >
        <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>{role}</Text>
      </TouchableOpacity>

      <Modal
        transparent
        visible={showRoleDropdown}
        animationType="fade"
        onRequestClose={() => setShowRoleDropdown(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          onPress={() => setShowRoleDropdown(false)}
        >
          <View style={[styles.modalContent, { backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff" }]}>
            <FlatList
              data={roles}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  onPress={() => {
                    setRole(item);
                    setShowRoleDropdown(false);
                  }}
                  style={styles.roleItem}
                >
                  <Text style={{ color: colorScheme === "dark" ? "#fff" : "#000" }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </TouchableOpacity>
      </Modal>

      <Button title="Register" onPress={handleRegister} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", padding: 20 },
  input: { borderWidth: 1, padding: 10, marginBottom: 15, borderRadius: 8 },
  dropdown: { borderWidth: 1, padding: 10, borderRadius: 8, marginBottom: 15 },
  modalOverlay: { flex: 1, justifyContent: "center", backgroundColor: "#00000050" },
  modalContent: { marginHorizontal: 40, borderRadius: 8, padding: 10 },
  roleItem: { padding: 12, borderBottomWidth: 1, borderBottomColor: "#ccc" },
});