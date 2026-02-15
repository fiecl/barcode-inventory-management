import React, { useState } from "react";
import { View, Text, StyleSheet, Alert } from "react-native";
import { CameraView, useCameraPermissions } from "expo-camera";
import { useRouter } from "expo-router";
import axios from "axios";
import API_URL from "@/constants/api";

export default function ScanScreen() {
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const router = useRouter();

  if (!permission) return <View />;
  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text>We need your camera permission to scan barcodes</Text>
        <Text onPress={requestPermission} style={styles.grantBtn}>Grant Permission</Text>
      </View>
    );
  }

  const handleBarCodeScanned = async ({ data }: { data: string }) => {
    if (scanned) return;
    setScanned(true);

    try {
      const response = await axios.get(`${API_URL}/products/barcode/${data}`);
      const product = response.data;
      if (!product) {
        Alert.alert("Error", "Product not found");
        setScanned(false);
        return;
      }

      // Navigate to ScanFormScreen with product_id and barcode
      router.push({
        pathname: "/scanForm",
        params: {
          barcode: product.barcode,
          product_id: product.id.toString(),
          product_quantity: product.quantity,
          product_threshold: product.threshold,
          product_classification: product.classification
        },
      });
    } catch (error: any) {
      console.error("Fetch product error:", error);
      Alert.alert("Error", error?.message || "Something went wrong");
    } finally {
      setTimeout(() => setScanned(false), 6000);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        style={styles.camera}
        facing="back"
        onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
      />
      <Text style={styles.instruction}>Scan a product barcode</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  camera: { flex: 1 },
  instruction: {
    position: "absolute",
    bottom: 40,
    width: "100%",
    textAlign: "center",
    fontSize: 18,
    color: "white",
    backgroundColor: "rgba(0,0,0,0.6)",
    padding: 10,
  },
  centered: { flex: 1, justifyContent: "center", alignItems: "center" },
  grantBtn: { color: "#007aff", marginTop: 10, fontSize: 16 },
});
