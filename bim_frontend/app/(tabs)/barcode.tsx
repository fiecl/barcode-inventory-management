import { useState } from "react";
import {
  View,
  Text,
  TextInput,
  Alert,
  StyleSheet,
  useColorScheme,
  TouchableOpacity,
} from "react-native";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import API_URL from "@/constants/api";

export default function BarcodeScreen() {
  const [name, setName] = useState("");
  const [threshold, setThreshold] = useState("");
  const [quantity, setQuantity] = useState("");
  const [quantityToOrder, setQuantityToOrder] = useState("");
  const [classification, setClassification] = useState("");
  const colorScheme = useColorScheme(); // "dark" or "light"
  const isDark = colorScheme === "dark";

  // ----------------------------
  // Handle Generate Barcode
  // ----------------------------
  const handleGenerate = async () => {
    if (!name || !threshold || !quantity || !classification) {
      Alert.alert("Error", "Please fill in all fields");
      return;
    }
    const qty = parseInt(quantity, 10);
    const thr = parseInt(threshold, 10);
    const qtyToOrder = parseInt(quantityToOrder, 10);

    // Validation check
    if (qty > 999999 || thr > 999999 || qtyToOrder > 999999) {
      Alert.alert(
        "Validation Error",
        "Quantity and Threshold cannot exceed 999,999"
      );
      return;
    }

    try {
      const response = await axios.post(`${API_URL}/products`, {
        name,
        threshold: parseInt(threshold, 10),
        quantity: parseInt(quantity, 10),
        quantity_to_order: parseInt(quantityToOrder, 10),
        classification
      });

      Alert.alert("Success", `Barcode generated: ${response.data.barcode}`);
    } catch (error: any) {
      if (axios.isAxiosError(error)) {
        const status = error.response?.status;
        const serverMessage =
          error.response?.data?.detail ||
          JSON.stringify(error.response?.data) ||
          "No details from server";

        console.error("Axios error:", {
          status,
          data: error.response?.data,
          headers: error.response?.headers,
        });

        Alert.alert(
          "Request Failed",
          `Status: ${status || "Network Error"}\nMessage: ${serverMessage}`
        );
      } else {
        console.error("Unexpected error:", error);
        Alert.alert("Error", "Unexpected issue: " + error.message);
      }
    }
  };

  // ----------------------------
  // Handle Upload / Take Barcode Photo
  // ----------------------------
  const handleUploadBarcode = async () => {
    try {
      const result = await ImagePicker.launchCameraAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const imageUri = result.assets[0].uri;

        const formData = new FormData();
        formData.append("file", {
          uri: imageUri,
          name: "barcode.png",
          type: "image/png",
        } as any);

        const response = await axios.post(
          `${API_URL}/products/upload-barcode/`,
          formData,
          { headers: { "Content-Type": "multipart/form-data" } }
        );

        Alert.alert("Success", `Product added: ${response.data.name}`);
      }
    } catch (error: any) {
      console.error("Upload error:", error);
      Alert.alert(
        "Upload Failed",
        error?.response?.data?.detail || error.message
      );
    }
  };

  return (
    <View
      style={[
        styles.container,
        { backgroundColor: isDark ? "#121212" : "#f5f5f5" },
      ]}
    >
      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Product Name
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#333" : "#ccc",
          },
        ]}
        value={name}
        onChangeText={setName}
        placeholder="Enter product name"
        placeholderTextColor={isDark ? "#aaa" : "#888"}
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Classification
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#333" : "#ccc",
          },
        ]}
        value={classification}
        onChangeText={setClassification}
        placeholder="Enter classification"
        placeholderTextColor={isDark ? "#aaa" : "#888"}
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Threshold
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#333" : "#ccc",
          },
        ]}
        value={threshold}
        onChangeText={setThreshold}
        placeholder="Enter threshold"
        keyboardType="numeric"
        placeholderTextColor={isDark ? "#aaa" : "#888"}
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Quantity
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#333" : "#ccc",
          },
        ]}
        value={quantity}
        onChangeText={setQuantity}
        placeholder="Enter quantity"
        keyboardType="numeric"
        placeholderTextColor={isDark ? "#aaa" : "#888"}
      />

      <Text style={[styles.label, { color: isDark ? "#fff" : "#000" }]}>
        Quantity to Order
      </Text>
      <TextInput
        style={[
          styles.input,
          {
            backgroundColor: isDark ? "#1e1e1e" : "#fff",
            color: isDark ? "#fff" : "#000",
            borderColor: isDark ? "#333" : "#ccc",
          },
        ]}
        value={quantityToOrder}
        onChangeText={setQuantityToOrder}
        placeholder="Enter quantity to order"
        keyboardType="numeric"
        placeholderTextColor={isDark ? "#aaa" : "#888"}
      />

      <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? "#4caf50" : "#007aff" },
        ]}
        onPress={handleGenerate}
      >
        <Text style={styles.buttonText}>Generate Barcode</Text>
      </TouchableOpacity>

      {/* <TouchableOpacity
        style={[
          styles.button,
          { backgroundColor: isDark ? "#2196f3" : "#34c759", marginTop: 15 },
        ]}
        onPress={handleUploadBarcode}
      >
        <Text style={styles.buttonText}>Upload / Take Barcode Photo</Text>
      </TouchableOpacity> */}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, paddingTop: 75, paddingLeft: 30, paddingRight: 30 },
  label: { fontSize: 16, fontWeight: "600", marginTop: 15 },
  input: {
    borderWidth: 1,
    borderRadius: 10,
    padding: 12,
    marginTop: 5,
    fontSize: 16,
  },
  button: {
    padding: 15,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 20,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 16,
  },
});
