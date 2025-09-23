// // utils/tracking.ts

// import AsyncStorage from '@react-native-async-storage/async-storage';

// export const trackTagClicks = async (tags: string[]) => {
//   try {
//     const json = await AsyncStorage.getItem('clickStats');
//     const currentStats = json ? JSON.parse(json) : {};

//     tags.forEach(tag => {
//       currentStats[tag] = (currentStats[tag] || 0) + 1;
//     });

//     await AsyncStorage.setItem('clickStats', JSON.stringify(currentStats));
//     console.log('✅ Updated Tag Stats:', currentStats);
//   } catch (e) {
//     console.error('❌ Tracking error:', e);
//   }
// };

// export const getTopTags = async (count = 3): Promise<string[]> => {
//   try {
//     const json = await AsyncStorage.getItem('clickStats');
//     const stats = json ? JSON.parse(json) : {};
//     const sorted = Object.entries(stats)
//       .sort(([, a], [, b]) => b - a)
//       .slice(0, count)
//       .map(([tag]) => tag);
//     return sorted;
//   } catch (e) {
//     console.error('❌ Failed to retrieve top tags:', e);
//     return [];
//   }
// };
