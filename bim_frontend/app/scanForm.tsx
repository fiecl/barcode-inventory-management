import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import { useLocalSearchParams, useRouter } from "expo-router";
import axios from "axios";
import { useColorScheme } from "react-native";
import API_URL from "@/constants/api";

export default function ScanFormScreen() {
  const params = useLocalSearchParams<{
    barcode: string;
    product_id: string;
    product_quantity: string;
    product_threshold: string;
  }>();
  const { barcode, product_id, product_quantity, product_threshold } = params;
  const router = useRouter();
  const colorScheme = useColorScheme();

  const [purpose, setPurpose] = useState("");
  const [name, setName] = useState("");

  const handleSubmit = async () => {
    if (!purpose || !name) {
      Alert.alert("Error", "Please fill all fields");
      return;
    }

    try {
      // Decrement product quantity
      await axios.post(`${API_URL}/products/scan/${barcode}`);

      // Save scan log
      const response = await axios.post(`${API_URL}/scan_logs/`, {
        purpose,
        scanned_by: name,
        product_id: parseInt(product_id, 10),
        quantity:
          product_quantity !== undefined
            ? Math.max(parseInt(product_quantity, 10) - 1, 0)
            : 0,
        threshold:
          product_threshold !== undefined ? parseInt(product_threshold, 10) : 0,
      });

      Alert.alert("Success", `Scan log saved for barcode: ${barcode}`);
      router.back();
    } catch (error: any) {
      console.error("Submit error:", error);
      Alert.alert(
        "Error",
        error?.response?.data?.detail ||
          error?.message ||
          "Something went wrong"
      );
    }
  };

  const isDark = colorScheme === "dark";

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#fff" },
      ]}
    >
      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Product Barcode
      </Text>
      <Text style={[styles.readOnly, { color: isDark ? "#ccc" : "#555" }]}>
        {barcode}
      </Text>

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Purpose
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Enter purpose"
        placeholderTextColor={isDark ? "#888" : "#666"}
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Your Name
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#f2f2f2",
            color: isDark ? "#fff" : "#000",
          },
        ]}
        value={name}
        onChangeText={setName}
        placeholder="Enter your name"
        placeholderTextColor={isDark ? "#888" : "#666"}
      />

      <View style={{ marginTop: 20 }}>
        <Button title="Submit Scan Log" onPress={handleSubmit} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginTop: 15,
  },
  readOnly: {
    fontSize: 16,
    marginTop: 5,
  },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 8,
    padding: 10,
    marginTop: 5,
  },
});
