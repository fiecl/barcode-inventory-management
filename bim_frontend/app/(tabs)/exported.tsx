import React, { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  RefreshControl,
  TouchableOpacity,
  Alert,
  useColorScheme,
} from "react-native";
import axios from "axios";
import API_URL from "@/constants/api";

export default function ScanLogsScreen() {
  const [logs, setLogs] = useState<any[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [showControls, setShowControls] = useState(false); // manage controls
  const colorScheme = useColorScheme();

  const fetchLogs = async () => {
    try {
      const response = await axios.get(`${API_URL}/scan_logs/`);
      const sortedLogs = response.data.sort(
        (a: any, b: any) =>
          new Date(b.scanned_at).getTime() - new Date(a.scanned_at).getTime(),
      );
      setLogs(sortedLogs);
    } catch (err) {
      console.error("Error fetching scan logs:", err);
    }
  };

  useEffect(() => {
    fetchLogs();
  }, []);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await fetchLogs();
    setRefreshing(false);
  }, []);

  const handleDelete = async (id: number) => {
    try {
      await axios.delete(`${API_URL}/scan_logs/${id}`);
      Alert.alert("Deleted", "Scan log deleted successfully");
      fetchLogs();
    } catch (err) {
      console.error("Delete error:", err);
      Alert.alert("Error", "Failed to delete scan log");
    }
  };

  const renderItem = ({ item }: { item: any }) => {
    const product = item.product;
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
          {product.name} ({product.barcode})
        </Text>

        <View style={styles.row}>
          <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
            Exported: {item.decremented_by}
          </Text>
          <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
            Remaining QTY: {item.quantity}
          </Text>
        </View>

        <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
          Classification: {item.classification}
        </Text>
        <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
          Threshold: {item.threshold}
        </Text>

        <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
          Purpose: {item.purpose}
        </Text>
        <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
          Scanned by: {item.scanned_by}
        </Text>

        <Text style={{ color: colorScheme === "dark" ? "#ccc" : "#555" }}>
          At: {new Date(item.scanned_at).toLocaleString()}
        </Text>

        {showControls && (
          <TouchableOpacity
            style={[styles.deleteBtn, { backgroundColor: "#f44336" }]}
            onPress={() => handleDelete(item.id)}
          >
            <Text style={styles.buttonText}>Delete</Text>
          </TouchableOpacity>
        )}
      </View>
    );
  };

  return (
    <View style={{ flex: 1 }}>
      {/* Show/Hide Controls toggle */}
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
        data={logs}
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
  name: { fontWeight: "bold", fontSize: 18, marginBottom: 8 },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },
  deleteBtn: {
    marginTop: 10,
    padding: 10,
    borderRadius: 8,
    alignItems: "center",
  },
  buttonText: { color: "#fff", fontWeight: "600" },
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
  settingsText: { color: "#fff", fontWeight: "600" },
});
