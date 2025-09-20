// Emails.tsx
import React, { useEffect, useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  Button, 
  FlatList, 
  Alert, 
  StyleSheet, 
  useColorScheme,
  TouchableOpacity
} from "react-native";
import axios from "axios";
import API_URL from "@/constants/api";

interface EmailItem {
  id: number;
  email: string;
}

export default function EmailsScreen() {
  const colorScheme = useColorScheme();
  const isDark = colorScheme === "dark";

  const [emails, setEmails] = useState<EmailItem[]>([]);
  const [newEmail, setNewEmail] = useState("");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [editingEmail, setEditingEmail] = useState("");

  
  const API_URL2 = `${API_URL}/email`;

  useEffect(() => {
    fetchEmails();
  }, []);

  const fetchEmails = async () => {
    try {
      const res = await axios.get(API_URL2);
      if (res.data) setEmails(Array.isArray(res.data) ? res.data : [res.data]);
    } catch (err: any) {
      console.error("Fetch emails error:", err);
      Alert.alert("Error", "Failed to fetch emails");
    }
  };

  const handleAddEmail = async () => {
    if (!newEmail) return Alert.alert("Error", "Enter an email");
    try {
      const res = await axios.post(API_URL2, { email: newEmail });
      setEmails([...emails, res.data]);
      setNewEmail("");
    } catch (err: any) {
      console.error("Add email error:", err);
      Alert.alert("Error", "Failed to add email");
    }
  };

  const handleEditEmail = (item: EmailItem) => {
    setEditingId(item.id);
    setEditingEmail(item.email);
  };

  const handleSaveEdit = async () => {
    if (editingId === null) return;
    try {
      await axios.put(`${API_URL2}/${editingId}`, { email: editingEmail });
      setEmails(
        emails.map(e => (e.id === editingId ? { ...e, email: editingEmail } : e))
      );
      setEditingId(null);
      setEditingEmail("");
    } catch (err: any) {
      console.error("Update email error:", err);
      Alert.alert("Error", "Failed to update email");
    }
  };

  const handleDeleteEmail = async (id: number) => {
    try {
      await axios.delete(`${API_URL2}/${id}`);
      setEmails(emails.filter(e => e.id !== id));
    } catch (err: any) {
      console.error("Delete email error:", err);
      Alert.alert("Error", "Failed to delete email");
    }
  };

  const styles = createStyles(isDark);

  return (
    <View style={styles.container}>
      {/* Add new email */}
      <View style={styles.inputContainer}>
        <TextInput
          style={styles.input}
          placeholder="Enter new email"
          placeholderTextColor={isDark ? "#aaa" : "#555"}
          value={newEmail}
          onChangeText={setNewEmail}
        />
        <Button title="Add" onPress={handleAddEmail} />
      </View>

      {/* Email list */}
      <FlatList
        data={emails}
        keyExtractor={item => item.id.toString()}
        contentContainerStyle={{ paddingBottom: 100 }}
        renderItem={({ item }) => (
          <View style={styles.item}>
            {editingId === item.id ? (
              <>
                <TextInput
                  style={[styles.input, { flex: 1 }]}
                  value={editingEmail}
                  onChangeText={setEditingEmail}
                  placeholder="Edit email"
                  placeholderTextColor={isDark ? "#aaa" : "#555"}
                />
                <Button title="Save" onPress={handleSaveEdit} />
                <Button title="Cancel" onPress={() => setEditingId(null)} />
              </>
            ) : (
              <>
                <Text style={styles.itemText}>{item.email}</Text>
                <View style={styles.buttons}>
                  <TouchableOpacity onPress={() => handleEditEmail(item)} style={styles.editBtn}>
                    <Text style={styles.buttonText}>Edit</Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => handleDeleteEmail(item.id)} style={styles.deleteBtn}>
                    <Text style={styles.buttonText}>Delete</Text>
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        )}
      />
    </View>
  );
}

// Adaptive styling function
const createStyles = (isDark: boolean) =>
  StyleSheet.create({
    container: {
      flex: 1,
      paddingTop: 100,
      paddingLeft: 20,
      paddingRight: 20,
      backgroundColor: isDark ? "#121212" : "#fff",
    },
    inputContainer: {
      flexDirection: "row",
      marginBottom: 15,
      alignItems: "center",
    },
    input: {
      flex: 1,
      borderWidth: 1,
      borderColor: isDark ? "#555" : "#ccc",
      borderRadius: 8,
      padding: 10,
      marginRight: 10,
      color: isDark ? "#fff" : "#000",
      backgroundColor: isDark ? "#1E1E1E" : "#fff",
    },
    item: {
      flexDirection: "row",
      alignItems: "center",
      justifyContent: "space-between",
      padding: 12,
      borderWidth: 1,
      borderColor: isDark ? "#333" : "#ccc",
      borderRadius: 8,
      marginBottom: 10,
      backgroundColor: isDark ? "#1E1E1E" : "#f9f9f9",
    },
    itemText: {
      color: isDark ? "#fff" : "#000",
      flex: 1,
    },
    buttons: {
      flexDirection: "row",
      gap: 5,
    },
    editBtn: {
      backgroundColor: "#4caf50",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
      marginRight: 5,
    },
    deleteBtn: {
      backgroundColor: "#f44336",
      paddingHorizontal: 8,
      paddingVertical: 4,
      borderRadius: 5,
    },
    buttonText: {
      color: "#fff",
      fontWeight: "600",
    },
  });
