// screens/HomeCard.tsx   (or wherever you keep the file)
import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Linking,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import * as WebBrowser from 'expo-web-browser';

// ---------------------------------------------------------------------
// 1. DATA FETCHING
// ---------------------------------------------------------------------
import getCampusData from '../constants/homeScreenData'; // adjust path

// ---------------------------------------------------------------------
// 2. TYPE DEFINITIONS – match Firestore exactly
// ---------------------------------------------------------------------
interface PhoneNumber {
  name: string;
  number: string;
}

interface BaseCard {
  title: string;
  description: string;
  image: string;                 // Firestore gives a direct URL
  tags?: string[];               // optional – not used on detail screen
}

/* dining cards */
interface DiningCard extends BaseCard {
  menuLink?: string;             // <-- field name in Firestore
}

/* explore cards – some have a link, some have phone arrays */
interface ExploreCard extends BaseCard {
  link?: string;
  info?: string;
  CampusSafetyphoneNumbers?: PhoneNumber[];
  HealthServicesPhoneNumbers?: PhoneNumber[];
}

/* final shape returned by getCampusData() */
interface CampusData {
  featured: BaseCard[];
  news: BaseCard[];
  dining: DiningCard[];
  explore: ExploreCard[];
}

// ---------------------------------------------------------------------
// 3. COMPONENT
// ---------------------------------------------------------------------
const { width: screenWidth } = Dimensions.get('window');

export default function HomeCard() {
  const { section, index } = useLocalSearchParams();
  const [data, setData] = useState<CampusData | null>(null);
  const [loading, setLoading] = useState(true);

  // -------------------------------------------------
  // Load data once
  // -------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const campus = await getCampusData();
        setData(campus);
      } catch (e) {
        console.error('Failed to load campus data', e);
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // -------------------------------------------------
  // Find the card that belongs to the route
  // -------------------------------------------------
  const idx = Number(index);
  const sectionKey = section as keyof CampusData;

  const card =
    data && !Number.isNaN(idx) ? data[sectionKey]?.[idx] : undefined;

  // -------------------------------------------------
  // Loading / not-found UI
  // -------------------------------------------------
  if (loading) {
    return (
      <View style={styles.loading}>
        <ActivityIndicator size="large" color="#2c3e50" />
      </View>
    );
  }

  if (!card) {
    return (
      <View style={styles.centered}>
        <Text style={styles.title}>Card not found</Text>
      </View>
    );
  }

  // -------------------------------------------------
  // Helper – open any URL in the system browser
  // -------------------------------------------------
  const openUrl = (url?: string) => {
    if (!url) return;
    WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
  };

  // -------------------------------------------------
  // Render
  // -------------------------------------------------
  return (
    <ScrollView contentContainerStyle={styles.scroll} style={{  backgroundColor: 'white',}}>
      <Stack.Screen options={{ headerShown: true, title: card.title }} />

      <View style={styles.container}>
        {/* ---------- IMAGE ---------- */}
        <Image
          source={{ uri: card.image }}
          style={styles.image}
          resizeMode="cover"
        />

        {/* ---------- TITLE & DESCRIPTION ---------- */}
        <Text style={styles.title}>{card.title}</Text>
        <Text style={styles.description}>{card.description}</Text>

        {/* ---------- DINING MENU LINK ---------- */}
        {'menuLink' in card && card.menuLink && (
          <TouchableOpacity onPress={() => openUrl(card.menuLink)}>
            <Text style={styles.link}>View Menu</Text>
          </TouchableOpacity>
        )}

        {/* ---------- EXPLORE LINK (map, info page, …) ---------- */}
        {'link' in card && card.link && (
          <TouchableOpacity onPress={() => openUrl(card.link)}>
            <Text style={styles.link}>More Info</Text>
          </TouchableOpacity>
        )}

        {/* ---------- GUSBUS INFO (plain text) ---------- */}
        {'info' in card && card.info && (
          <Text style={styles.infoText}>{card.info}</Text>
        )}

        {/* ---------- CAMPUS SAFETY PHONE NUMBERS ---------- */}
        {'CampusSafetyphoneNumbers' in card &&
          card.CampusSafetyphoneNumbers?.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => Linking.openURL(`tel:${p.number}`)}
            >
              <Text style={styles.phone}>{p.name}: {p.number}</Text>
            </TouchableOpacity>
          ))}

        {/* ---------- HEALTH SERVICES PHONE NUMBERS ---------- */}
        {'HealthServicesPhoneNumbers' in card &&
          card.HealthServicesPhoneNumbers?.map((p, i) => (
            <TouchableOpacity
              key={i}
              onPress={() => Linking.openURL(`tel:${p.number}`)}
            >
              <Text style={styles.phone}>{p.name}: {p.number}</Text>
            </TouchableOpacity>
          ))}
      </View>
    </ScrollView>
  );
}

// ---------------------------------------------------------------------
// 4. STYLES – clean, grouped, easy to tweak
// ---------------------------------------------------------------------
const styles = StyleSheet.create({
  scroll: { flexGrow: 1 },
  container: {
    paddingTop: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#ffffffff',
  },
  loading: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  centered: { flex: 1, justifyContent: 'center', alignItems: 'center' },

  image: {
    width: screenWidth * 0.9,
    height: 250,
    borderRadius: 20,
    marginBottom: 20,
  },

  title: {
    fontSize: 26,
    fontWeight: '700',
    textAlign: 'center',
    color: '#2c3e50',
    marginBottom: 10,
  },
  description: {
    fontSize: 16,
    textAlign: 'left',
    letterSpacing: 0.5,
    color: '#000000ff',
    marginBottom: 12,
    lineHeight: 30,
  },
  infoText: {
    fontSize: 15,
    color: '#555',
    lineHeight: 22,
    marginTop: 12,
    textAlign: 'center',
  },

  link: {
    fontSize: 16,
    color: '#3498db',
    textDecorationLine: 'underline',
    marginTop: 12,
  },
  phone: {
    fontSize: 16,
    color: '#2980b9',
    textDecorationLine: 'underline',
    marginVertical: 6,
  },
});