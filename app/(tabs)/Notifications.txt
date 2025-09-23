import React, { useState } from 'react';
import {
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { useNotifications } from '../hooks/useNotifications';
import { startAutoNotificationLoop } from '../utils/notifications';

// 🔁 Start auto push (every 10s, store max 100 notifications)
startAutoNotificationLoop(10000, 100);

export default function NewsScreen() {
  const [searchQuery, setSearchQuery] = useState('');
  const { notifications } = useNotifications();

  const filteredNews = notifications.filter((article) =>
    article.header.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <TextInput
        style={styles.searchInput}
        placeholder="Search notifications..."
        value={searchQuery}
        onChangeText={setSearchQuery}
        placeholderTextColor="#888"
      />

      <FlatList
        data={filteredNews}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <TouchableOpacity
            style={styles.newsCard}
            onPress={() => WebBrowser.openBrowserAsync(item.url)}
          >
            <Text style={styles.newsHeader}>{item.header}</Text>
            <Text style={styles.newsDetails}>{item.details}</Text>
          </TouchableOpacity>
        )}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <Text style={styles.noResultsText}>No notifications yet.</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingHorizontal: 16,
    backgroundColor: '#fff',
  },
  searchInput: {
    height: 45,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 20,
    fontSize: 16,
    color: '#000',
  },
  newsCard: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 2,
  },
  newsHeader: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  newsDetails: {
    fontSize: 14,
    color: '#555',
  },
  noResultsText: {
    textAlign: 'center',
    color: '#888',
    fontSize: 16,
    marginTop: 50,
  },
});
