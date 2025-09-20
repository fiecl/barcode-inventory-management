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
          product_threshold: product.threshold
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




// // Scan.tsx
// import React, { useState } from "react";
// import { View, Text, StyleSheet, Button, Alert } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import axios from "axios";

// export default function ScanScreen() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);

//   if (!permission) {
//     return <View />;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.centered}>
//         <Text>We need your camera permission to scan barcodes</Text>
//         <Button title="Grant Permission" onPress={requestPermission} />
//       </View>
//     );
//   }

//   const handleBarCodeScanned = async ({ data }: { data: string }) => {
//     if (scanned) return; // prevent multiple triggers
//     setScanned(true);

//     console.log("Scanned barcode:", data);

//     try {
//       // ✅ Axios handles JSON automatically
//       const response = await axios.post(`http://192.168.1.14:8000/products/scan/${data}`);

//       Alert.alert(
//         "Scan Success",
//         `Product: ${response.data.name}\nQuantity: ${response.data.quantity}`
//       );
//     } catch (error: any) {
//       console.error("Scan error:", error);
//       const message =
//         error?.response?.data?.detail ||
//         error?.message ||
//         "Something went wrong";
//       Alert.alert("Error", message);
//     } finally {
//       // allow re-scanning after a short delay
//       setTimeout(() => setScanned(false), 2000);
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={styles.camera}
//         facing="back"
//         onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//       />
//       <Text style={styles.instruction}>Scan a product barcode</Text>
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: { flex: 1 },
//   camera: { flex: 1 },
//   instruction: {
//     position: "absolute",
//     bottom: 40,
//     width: "100%",
//     textAlign: "center",
//     fontSize: 18,
//     color: "white",
//     backgroundColor: "rgba(0,0,0,0.6)",
//     padding: 10,
//   },
//   centered: { flex: 1, justifyContent: "center", alignItems: "center" },
// });


// import React, { useState, useEffect } from "react";
// import { View, Text, Button, StyleSheet, Alert } from "react-native";
// import { CameraView, useCameraPermissions } from "expo-camera";
// import axios from "axios";

// export default function ScanScreen() {
//   const [permission, requestPermission] = useCameraPermissions();
//   const [scanned, setScanned] = useState(false);

//   if (!permission) {
//     // Permission is still loading
//     return <Text>Requesting camera permission...</Text>;
//   }

//   if (!permission.granted) {
//     return (
//       <View style={styles.container}>
//         <Text>No access to camera</Text>
//         <Button onPress={requestPermission} title="Grant Permission" />
//       </View>
//     );
//   }

//   const handleBarCodeScanned = async ({ type, data }: { type: string; data: string }) => {
//     setScanned(true);
//     Alert.alert("Scanned!", `Type: ${type}\nData: ${data}`);

//     try {
//       console.log("Scanned barcode:", data);
//       const response = await axios.post("http://192.168.1.14:8000/products/scan/${scannedData}", {
//         barcode: data,
//       });
//       Alert.alert("Stock Updated", JSON.stringify(response.data));
//     } catch (error: any) {
//       Alert.alert("Error", error?.response?.data?.detail || "Failed to update stock");
//     }
//   };

//   return (
//     <View style={styles.container}>
//       <CameraView
//         style={StyleSheet.absoluteFillObject}
//         facing="back"
//         onBarcodeScanned={scanned ? undefined : handleBarCodeScanned}
//         barcodeScannerSettings={{
//           barcodeTypes: ["code128", "ean13", "ean8", "qr"],
//         }}
//       />
//       {scanned && <Button title="Tap to Scan Again" onPress={() => setScanned(false)} />}
//     </View>
//   );
// }

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     flexDirection: "column",
//     justifyContent: "flex-end",
//   },
// });
