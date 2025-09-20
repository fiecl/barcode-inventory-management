import React, { useState } from "react";
import { View, Text, TextInput, Button, Alert, StyleSheet } from "react-native";
import axios from "axios";

export default function ScanFormScreen({ route, navigation }: any) {
  const { product } = route.params;
  const [purpose, setPurpose] = useState("");
  const [scannedBy, setScannedBy] = useState("");

  const handleSubmit = async () => {
    if (!purpose || !scannedBy) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }

    try {
      const response = await axios.post("http://192.168.1.14:8000/scan_logs/", {
        product_id: product.id,
        purpose,
        scanned_by: scannedBy,
      });

      Alert.alert("Success", "Scan log saved!");
      navigation.goBack();
    } catch (error: any) {
      console.error(error);
      Alert.alert("Error", error?.message || "Failed to save scan log");
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.label}>Product: {product.name}</Text>

      <Text style={styles.label}>Purpose</Text>
      <TextInput
        style={styles.input}
        value={purpose}
        onChangeText={setPurpose}
        placeholder="Enter purpose"
      />

      <Text style={styles.label}>Your Name</Text>
      <TextInput
        style={styles.input}
        value={scannedBy}
        onChangeText={setScannedBy}
        placeholder="Enter your name"
      />

      <Text style={styles.label}>Scanned At</Text>
      <Text>{new Date().toLocaleString()}</Text>

      <Button title="Submit" onPress={handleSubmit} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: "#fff" },
  label: { fontSize: 16, fontWeight: "600", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderColor: "#ccc",
    padding: 10,
    borderRadius: 8,
    marginTop: 5,
  },
});
