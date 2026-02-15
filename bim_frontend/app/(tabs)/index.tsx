import React, { useState, useEffect, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  useColorScheme,
  TextInput,
  TouchableOpacity,
  Alert,
} from "react-native";
import axios from "axios";
import API_URL from "@/constants/api";

export default function ProductsScreen() {
  const [products, setProducts] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showControls, setShowControls] = useState(false); // manage mode
  const colorScheme = useColorScheme();

  const fetchProducts = async () => {
    try {
      const response = await axios.get(`${API_URL}/products`);
      const editableProducts = response.data.map((p: any) => ({
        ...p,
        editableQuantity: p.quantity.toString(),
        editableThreshold: p.threshold.toString(),
        editableQuantityToOrder: p.quantity_to_order.toString(),
        editableClassification: p.classification
      }));
      setProducts(editableProducts);
    } catch (err) {
      console.error("Error fetching products:", err);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchProducts();
    setRefreshing(false);
  }, []);

  const handleUpdate = async (
    barcode: string,
    quantity: string,
    threshold: string,
    quantityToOrder: string,
    classification: string
  ) => {
    const qty = parseInt(quantity, 10);
    const thr = parseInt(threshold, 10);
    const qtyToOrder = parseInt(quantityToOrder, 10);

    // Validation check
    if (qty > 999999 || thr > 999999 || qtyToOrder > 999999)  {
      Alert.alert(
        "Validation Error",
        "Quantity and Threshold cannot exceed 999,999"
      );
      return;
    }

    try {
      await axios.patch(`${API_URL}/products/${barcode}`, {
        quantity: parseInt(quantity, 10),
        threshold: parseInt(threshold, 10),
        quantity_to_order: parseInt(quantityToOrder, 10),
        classification: classification
      });
      Alert.alert("Success", "Product updated successfully");
      fetchProducts();
    } catch (err) {
      console.error("Update error:", err);
      Alert.alert("Error", "Failed to update product");
    }
  };

  const handleDelete = async (barcode: string) => {
    try {
      await axios.delete(`${API_URL}/products/${barcode}`);
      Alert.alert("Deleted", "Product deleted successfully");
      fetchProducts();
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Failed to delete product");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    return (
      <View
        style={[
          styles.item,
          {
            backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
            borderColor: colorScheme === "dark" ? "#333" : "#ccc",
          },
        ]}
      >
        <Text
          style={[
            styles.name,
            { color: colorScheme === "dark" ? "#fff" : "#000" },
          ]}
        >
          {item.name} ({item.barcode})
        </Text>

        <View style={styles.row}>
          <View style={styles.inputGroup}>
            <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
              Quantity
            </Text>
            <TextInput
              value={item.editableQuantity}
              onChangeText={(text) =>
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === item.id ? { ...p, editableQuantity: text } : p
                  )
                )
              }
              keyboardType="numeric"
              editable={showControls} // only editable in edit mode
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  borderColor: colorScheme === "dark" ? "#555" : "#ccc",
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
              Threshold
            </Text>
            <TextInput
              value={item.editableThreshold}
              onChangeText={(text) =>
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === item.id ? { ...p, editableThreshold: text } : p
                  )
                )
              }
              keyboardType="numeric"
              editable={showControls} // only editable in edit mode
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  borderColor: colorScheme === "dark" ? "#555" : "#ccc",
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
              QTY to Order
            </Text>
            <TextInput
              value={item.editableQuantityToOrder}
              onChangeText={(text) =>
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === item.id ? { ...p, editableQuantityToOrder: text } : p
                  )
                )
              }
              keyboardType="numeric"
              editable={showControls} // only editable in edit mode
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  borderColor: colorScheme === "dark" ? "#555" : "#ccc",
                },
              ]}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
              Classification
            </Text>
            <TextInput
              value={item.editableClassification}
              onChangeText={(text) =>
                setProducts((prev) =>
                  prev.map((p) =>
                    p.id === item.id ? { ...p, editableClassification: text } : p
                  )
                )
              }
              editable={showControls} // only editable in edit mode
              style={[
                styles.input,
                {
                  color: colorScheme === "dark" ? "#fff" : "#000",
                  borderColor: colorScheme === "dark" ? "#555" : "#ccc",
                },
              ]}
            />
          </View>
        </View>

        {showControls && (
          <View style={styles.row}>
            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#4caf50" }]}
              onPress={() =>
                handleUpdate(
                  item.barcode,
                  item.editableQuantity,
                  item.editableThreshold,
                  item.editableQuantityToOrder,
                  item.editableClassification
                )
              }
            >
              <Text style={styles.buttonText}>Update</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.button, { backgroundColor: "#f44336" }]}
              onPress={() => handleDelete(item.barcode)}
            >
              <Text style={styles.buttonText}>Delete</Text>
            </TouchableOpacity>
          </View>
        )}

        <Text
          style={{
            color:
              item.status === "High"
                ? "#4caf50"
                : item.status === "Warning"
                ? "#ff9800"
                : "#f44336",
            fontWeight: "600",
            marginTop: 8,
          }}
        >
          Status: {item.status}
        </Text>
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Settings toggle */}
      <View style={styles.settingsContainer}>
        <TouchableOpacity
          onPress={() => setShowControls(!showControls)}
          style={styles.settingsButton}
        >
          <Text style={styles.settingsText}>
            {showControls ? "Hide Controls" : "Show Controls"}
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={products}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        contentContainerStyle={[
          styles.listContainer,
          { backgroundColor: colorScheme === "dark" ? "#121212" : "#f5f5f5" },
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  listContainer: {
    paddingTop: 20,
    paddingLeft: 20,
    paddingRight: 20,
    paddingBottom: 20,
  },
  item: {
    padding: 16,
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 12,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowRadius: 5,
    shadowOffset: { width: 0, height: 2 },
    elevation: 3,
  },
  name: {
    fontWeight: "bold",
    fontSize: 18,
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 12,
  },
  inputGroup: {
    flex: 1,
    marginRight: 10,
  },
  input: {
    borderWidth: 1,
    borderRadius: 8,
    padding: 8,
    marginTop: 4,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
    marginRight: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "600",
  },
  settingsContainer: {
    paddingTop: 70,
    paddingHorizontal: 20,
    alignItems: "flex-end",
  },
  settingsButton: {
    backgroundColor: "#007aff",
    padding: 8,
    borderRadius: 8,
  },
  settingsText: {
    color: "#fff",
    fontWeight: "600",
  },
});
