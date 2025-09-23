import { useState } from 'react';
import {
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const sampleData = [
  { title: 'Campus Events', url: 'https://gustavus.edu/events/' },
  { title: 'Student Clubs', url: 'https://gustavus.edu/studentorgs/organizations/' },
  { title: 'Dining Services', url: 'https://gustavus.edu/diningservices/' },
  { title: 'Bookstore Deals', url: 'https://www.bookmark.gustavus.edu/' },
  { title: 'Gus Bus', url: 'https://gustavus.edu/safety/shuttle/' },
  { title: 'Tutoring Hours', url: 'https://gustavus.edu/asc/' },
  { title: 'Athletic Games', url: 'https://athletics.gustavus.edu/' },
  { title: 'Career Services', url: 'https://gustavus.edu/careercenter/' },
  { title: 'Campus Map', url: 'https://gustavus.edu/virtualtour/' },
  { title: 'Library Info', url: 'https://gustavus.edu/library/' },
];

export default function DiscoverScreen() {
  const [query, setQuery] = useState('');

  const filteredData = sampleData.filter((item) =>
    item.title.toLowerCase().includes(query.toLowerCase())
  );

  const handleSiteSearch = () => {
    if (query.trim() !== '') {
      const searchUrl = `https://gustavus.edu/search/?q=${encodeURIComponent(query.trim())}`;
      WebBrowser.openBrowserAsync(searchUrl);
    }
  };

  return (
    <View style={styles.container}>
      <TextInput
        placeholder="Search Discover..."
        value={query}
        onChangeText={setQuery}
        style={styles.searchInput}
        placeholderTextColor="#888"
        backgroundColor="#ffffffff"
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

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 80,
    paddingBottom: 50,
    paddingHorizontal: 16,
    backgroundColor: '#ffffffff',
  },
  searchInput: {
    height: 45,
    borderBottomColor: '#030303ff',
    borderBottomWidth: 2,
    //bottomBorderRadius: 0,
   // borderBottomRadius: 8,
    paddingHorizontal: 12,
    marginBottom: 12,
    fontSize: 16,
    color: '#ffffffff',
  },
  searchButton: {
    backgroundColor: '#ffffffff',
    paddingVertical: 10,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 16,
  },
  searchButtonText: {
    color: '#ffffffff',
    fontWeight: '600',
    fontSize: 16,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  card: {
    backgroundColor: '#ffee00ff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 12,
    alignItems: 'center',
  },
  cardText: {
    fontSize: 16,
    color: '#070707ff',
  },
});
