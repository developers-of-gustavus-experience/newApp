import React, { useEffect } from 'react';
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
} from 'react-native';
import { useRouter } from 'expo-router';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { LinearGradient } from 'expo-linear-gradient';
//import { trackTagClicks, getTopTags } from '../utils/tracking';
//import * as Notifications from 'expo-notifications';
import data from '../../constants/homeScreenData';

const defaultImage = require('../../assets/images/cards/default.png');
const welcomeBackground = require('../../assets/images/welcome_bg.png');

// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,
//     shouldPlaySound: false,
//     shouldSetBadge: false,
//   }),
// });

export default function HomeScreen() {
  const router = useRouter();

  // Notifications permission setup commented out
  // useEffect(() => {
  //   const askNotificationPermission = async () => {
  //     const { status: existingStatus } = await Notifications.getPermissionsAsync();
  //     let finalStatus = existingStatus;

  //     if (existingStatus !== 'granted') {
  //       const { status } = await Notifications.requestPermissionsAsync();
  //       finalStatus = status;
  //     }

  //     if (finalStatus !== 'granted') {
  //       console.warn('❌ Notification permission not granted');
  //     } else {
  //       console.log('✅ Notification permission granted');
  //     }
  //   };

  //   askNotificationPermission();
  // }, []);

  // Notifications scheduling commented out
  // useEffect(() => {
  //   const interval = setInterval(async () => {
  //     const topTags = await getTopTags();

  //     await Notifications.scheduleNotificationAsync({
  //       content: {
  //         title: '📊 Top Interests',
  //         body: `Your top tags: ${topTags.join(', ')}`,
  //       },
  //       trigger: null,
  //     });
  //   }, 10000);

  //   return () => clearInterval(interval);
  // }, []);

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour >= 5 && hour < 12) return 'Good Morning 🌅';
    if (hour >= 12 && hour < 17) return 'Good Afternoon ☀️';
    if (hour >= 17 && hour < 21) return 'Good Evening 🌇';
    return 'Good Night 🌃';
  };

  const resetClickStats = async () => {
    await AsyncStorage.removeItem('clickStats');
    Alert.alert('Success', 'Click stats have been reset.');
  };

  const handleCardPress = (section: string, index: number) => {
    const item = data[section][index];
    //trackTagClicks(item.tags || []);
    router.push({
      pathname: '/HomeCard',
      params: {
        section,
        index: index.toString(),
      },
    });
  };

  const renderCard = (item, index, section, type = 'small') => {
    const style = type === 'medium' ? styles.mediumCard : styles.smallCard;

    return (
      <TouchableOpacity key={item.title + index} style={style} onPress={() => handleCardPress(section, index)}>
        <ImageBackground
          source={item.image || defaultImage}
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

  return (
    <ScrollView style={styles.container} contentContainerStyle={{ paddingBottom: 90 }}>
      {/* <TouchableOpacity onPress={resetClickStats} style={styles.resetButton}>
        <Text style={styles.resetButtonText}>Reset Stats</Text>
      </TouchableOpacity> */}

      <ImageBackground source={welcomeBackground} style={styles.welcomeBackground}>
        <LinearGradient colors={['rgba(0,0,0,0.2)', 'rgba(0,0,0,0.9)']} style={styles.gradientOverlay}>
          <View style={styles.welcomeOverlay}>
            <Text style={styles.welcomeText}>Welcome to GAC</Text>
            <Text style={styles.subText}>{getGreeting()}</Text>
          </View>
        </LinearGradient>
      </ImageBackground>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Featured Events</Text>
        <TouchableOpacity
          style={styles.largeCard}
          onPress={() => handleCardPress('featured', 0)}
        >
          <ImageBackground
            source={data.featured[0].image}
            style={styles.cardImage}
            imageStyle={{ borderRadius: 15 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientBottom}
            >
              <Text style={styles.cardText}>{data.featured[0].title}</Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        <FlatList
          data={data.featured.slice(1)}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index + 1, 'featured')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <LinearGradient colors={['transparent', '#ccc', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fadedDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Where to Eat</Text>
        <FlatList
          data={data.dining}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index, 'dining', 'medium')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <LinearGradient colors={['transparent', '#ccc', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fadedDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Latest News</Text>
        <TouchableOpacity
          style={styles.largeCard}
          onPress={() => handleCardPress('news', 0)}
        >
          <ImageBackground
            source={data.news[0].image}
            style={styles.cardImage}
            imageStyle={{ borderRadius: 15 }}
          >
            <LinearGradient
              colors={['transparent', 'rgba(0,0,0,0.8)']}
              style={styles.gradientBottom}
            >
              <Text style={styles.cardText}>{data.news[0].title}</Text>
            </LinearGradient>
          </ImageBackground>
        </TouchableOpacity>
        <FlatList
          data={data.news.slice(1)}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index + 1, 'news')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <LinearGradient colors={['transparent', '#ccc', 'transparent']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.fadedDivider} />

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Explore</Text>
        <FlatList
          data={data.explore}
          horizontal
          renderItem={({ item, index }) => renderCard(item, index, 'explore', 'medium')}
          keyExtractor={(item, idx) => item.title + idx}
          showsHorizontalScrollIndicator={false}
        />
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#fff' },
  resetButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#e74c3c',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  resetButtonText: { color: '#fff', fontWeight: '600', fontSize: 14 },
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
