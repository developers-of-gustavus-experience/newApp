import { useState, useEffect } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';
import { collection, doc, getDoc, onSnapshot } from 'firebase/firestore';
import { db } from '@/FirebaseConfig'; // Adjust path as needed

type LinkItem = {
  title: string;
  url: string;
};

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');
  const [links, setLinks] = useState<LinkItem[]>([]);
  const [loading, setLoading] = useState(true);

  // --------------------------------------------------------------
  // 1. Real-time listener: Fetch discover/links document
  // --------------------------------------------------------------
  useEffect(() => {
    const linksRef = doc(db, 'discover', 'links');

    const unsubscribe = onSnapshot(
      linksRef,
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          const linkList: LinkItem[] = [];

          // Loop through all fields
          Object.keys(data).forEach((title) => {
            const url = data[title];
            if (typeof url === 'string' && url.startsWith('http')) {
              linkList.push({ title, url });
            }
          });

          // Optional: Sort alphabetically
          linkList.sort((a, b) => a.title.localeCompare(b.title));

          setLinks(linkList);
        } else {
          console.warn('discover/links document not found');
          setLinks([]);
        }
        setLoading(false);
      },
      (error) => {
        console.error('Firestore error:', error);
        Alert.alert('Error', 'Failed to load links.');
        setLoading(false);
      }
    );

    return () => unsubscribe();
  }, []);

  // --------------------------------------------------------------
  // 2. Filter links based on search
  // --------------------------------------------------------------
  const filteredData = links.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSiteSearch = () => {
    if (query.trim() !== '') {
      const searchUrl = `https://gustavus.edu/search/?q=${encodeURIComponent(query.trim())}`;
      WebBrowser.openBrowserAsync(searchUrl);
    }
  };

  // --------------------------------------------------------------
  // Render
  // --------------------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#552C00" />
        <Text style={styles.loadingText}>Loading links...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search Discover..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
        placeholderTextColor="#888"
      />

      {filteredData.length === 0 && query.trim() !== '' && (
        <TouchableOpacity style={styles.searchButton} onPress={handleSiteSearch}>
          <Text style={styles.searchButtonText}>Search "{query}" on gustavus.edu</Text>
        </TouchableOpacity>
      )}

      <ScrollView contentContainerStyle={styles.scrollContent}>
        {filteredData.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.card}
            onPress={() => WebBrowser.openBrowserAsync(item.url)}
          >
            <Text style={styles.cardText}>{item.title}</Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

// --------------------------------------------------------------
// Styles
// --------------------------------------------------------------
const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: 16,
    backgroundColor: '#ffffffff',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#ffffffff',
  },
  loadingText: {
    marginTop: 12,
    fontSize: 16,
    color: '#552C00',
  },
  searchInput: {
    height: 45,
    borderBottomColor: '#030303ff',
    borderBottomWidth: 2,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#000000',
  },
  searchButton: {
    backgroundColor: '#552C00',
    paddingVertical: 12,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonText: {
    color: '#ffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  cardText: {
    fontSize: 16,
    color: '#070707ff',
  },
});