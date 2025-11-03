import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  FlatList,
  ScrollView,
  StyleSheet,
  Text,
  View,
  ImageBackground,
  TouchableOpacity,
  Alert,
  ActivityIndicator,   // ← NEW
  Linking,
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
import * as WebBrowser from 'expo-web-browser';


import getCampusData from '../../constants/homeScreenData'; 

import { collection, getDocs } from 'firebase/firestore';
import { db } from '@/FirebaseConfig';

const defaultImage = require('../../assets/images/cards/default.png');
const welcomeBackground = require('../../assets/images/welcome_bg.png');

interface Card {
  title: string;
  description: string;
  image: string;
  menuLink?: string;
  link?: string;
  info?: string;
  CampusSafetyphoneNumbers?: { name: string; number: string }[];
  HealthServicesPhoneNumbers?: { name: string; number: string }[];
}

interface CampusData {
  featured: Card[];
  news: Card[];
  dining: Card[];
  explore: Card[];
}

export default function HomeScreen() {
  const router = useRouter();
  const [campusData, setCampusData] = useState<CampusData | null>(null);
  const [loading, setLoading] = useState(true);

  const openUrl = (url?: string) => {
      if (!url) return;
      WebBrowser.openBrowserAsync(url).catch(() => Linking.openURL(url));
    };
  
  // ----------------------------------------------------------------------
  // 1. Load data from Firestore (only once on mount)
  // ----------------------------------------------------------------------
  useEffect(() => {
    (async () => {
      try {
        const data = await getCampusData();     // ← your Firebase function
        setCampusData(data);
        //console.log('Loaded campus data:', data);
      } catch (err) {
        console.error('Failed to load campus data:', err);
        Alert.alert('Error', 'Could not load content. Using fallback.');
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning🌅';
    if (hour >= 12 && hour < 17) return 'Good Afternoon🌞';
    if (hour >= 17 && hour < 21) return 'Good Evening🌇';
    return 'Good Night🌙';
  };

  

  const handleCardPress = (section: keyof CampusData, index: number) => {
    router.push({
      pathname: '/HomeCard',
      params: {
        section,
        index: index.toString(),
      },
    });
  };

  const renderCard = (item: Card, index: number, section: keyof CampusData, type: 'small' | 'medium' = 'small') => {
    const style = type === 'medium' ? styles.mediumCard : styles.smallCard;

    return (
      <TouchableOpacity
        key={item.title + index}
        style={style}
        onPress={() => handleCardPress(section, index)}
      >
        <ImageBackground
          source={item.image ? { uri: item.image } : defaultImage}
          style={styles.cardImage}
          imageStyle={{ borderRadius: 12 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientBottom}
          >
            <Text style={styles.cardText}>{item.title}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  const renderCard2 = (item: Card, index: number, section: keyof CampusData, type: 'small' | 'medium' = 'small') => {
    const style = type === 'medium' ? styles.mediumCard : styles.smallCard;

    return (
      <TouchableOpacity
        key={item.title + index}
        style={style}
        onPress={() => openUrl(item.menuLink)}
      >
        <ImageBackground
          source={item.image ? { uri: item.image } : defaultImage}
          style={styles.cardImage}
          imageStyle={{ borderRadius: 12 }}
        >
          <LinearGradient
            colors={['transparent', 'rgba(0,0,0,0.8)']}
            style={styles.gradientBottom}
          >
            <Text style={styles.cardText}>{item.title}</Text>
          </LinearGradient>
        </ImageBackground>
      </TouchableOpacity>
    );
  };

  // ----------------------------------------------------------------------
  // 2. Show spinner while loading
  // ----------------------------------------------------------------------
  if (loading || !campusData) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#2c3e50" />
        <Text style={styles.loadingText}>Loading campus content…</Text>
      </View>
    );
  }

  // ----------------------------------------------------------------------
  // 3. Main UI – exactly your old layout, now using `campusData`
  // ----------------------------------------------------------------------
  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>
      <ImageBackground source={welcomeBackground} style={styles.welcomeBackground}>
        <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']} style={styles.gradientOverlay}>
          <View style={styles.welcomeOverlay}>
            <Text style={styles.welcomeText}>Welcome to GAC</Text>
            <Text style={styles.subText}>{getGreeting()}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      {/* Featured Events */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Events</Text>
        <TouchableOpacity
          style={styles.largeCard}
          onPress={() => handleCardPress('featured', 0)}
        >
          <ImageBackground
            source={campusData.featured[0]?.image ? { uri: campusData.featured[0].image } : defaultImage}
            style={styles.cardImage}
            imageStyle={{ borderRadius: 15 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientBottom}
            >
              <Text style={styles.cardText}>{campusData.featured[0]?.title}</Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        <FlatList
          data={campusData.featured.slice(1)}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index + 1, 'featured')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <LinearGradient colors={['transparent', '#ccc', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fadedDivider} />

      {/* Where to Eat */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where to Eat</Text>
        <FlatList
          data={campusData.dining}
          horizontal
          renderItem={({ item, index }) => renderCard2(item, index, 'dining', 'medium')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <LinearGradient colors={['transparent', '#ccc', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fadedDivider} />

      {/* Latest News */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        <TouchableOpacity
          style={styles.largeCard}
          onPress={() => handleCardPress('news', 0)}
        >
          <ImageBackground
            source={campusData.news[0]?.image ? { uri: campusData.news[0].image } : defaultImage}
            style={styles.cardImage}
            imageStyle={{ borderRadius: 15 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientBottom}
            >
              <Text style={styles.cardText}>{campusData.news[0]?.title}</Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        <FlatList
          data={campusData.news.slice(1)}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index + 1, 'news')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <LinearGradient colors={['transparent', '#ccc', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fadedDivider} />

      {/* Explore */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <FlatList
          data={campusData.explore}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index, 'explore', 'medium')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
}

/* -------------------------------------------------------------------------- */
/* Styles – unchanged (kept exactly as you had them)                         */
/* -------------------------------------------------------------------------- */
const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  loadingContainer: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  loadingText: { marginTop: 12, fontSize: 16, color: '#2c3e50' },

  welcomeBackground: {
    width: '100%',
    height: 300,
    justifyContent: 'center',
    overflow: 'hidden',
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  gradientOverlay: { flex: 1, justifyContent: 'center', paddingHorizontal: 20 },
  welcomeOverlay: { paddingTop: 80 },
  welcomeText: { fontSize: 40, fontWeight: 'bold', color: '#fff' },
  subText: { fontSize: 28, color: '#ddd' },
  section: { marginTop: 20, marginBottom: 30, paddingHorizontal: 16 },
  sectionTitle: { fontSize: 22, fontWeight: '700', marginBottom: 12, color: '#2c3e50' },
  largeCard: {
    borderRadius: 15,
    marginBottom: 10,
    width: '95%',
    height: 200,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  mediumCard: {
    width: 200,
    height: 180,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  smallCard: {
    width: 240,
    height: 120,
    borderRadius: 12,
    marginRight: 12,
    overflow: 'hidden',
  },
  cardImage: { flex: 1, justifyContent: 'center' },
  gradientBottom: { flex: 1, justifyContent: 'flex-end', padding: 12, borderRadius: 12 },
  cardText: { color: '#fff', fontWeight: '600', fontSize: 16 },
  fadedDivider: {
    height: 1,
    width: '80%',
    alignSelf: 'center',
    marginVertical: 0,
  },
});