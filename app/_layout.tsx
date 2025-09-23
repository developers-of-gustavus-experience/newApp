// 📦 Importing necessary modules for UI, fonts, navigation, splash screen, and notifications
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { useEffect } from 'react';
import { useColorScheme, Platform } from 'react-native';
// import * as Notifications from 'expo-notifications';

// ✅ Configure how notifications behave when received while the app is in the foreground
// Notifications.setNotificationHandler({
//   handleNotification: async () => ({
//     shouldShowAlert: true,     // Show banner/alert when notification arrives
//     shouldPlaySound: true,     // Play sound
//     shouldSetBadge: false,     // Don't update app icon badge count
//   }),
// });

// 🚫 Prevent the splash screen from auto-hiding before custom fonts are loaded
SplashScreen.preventAutoHideAsync();

// 🛡️ Export an error boundary to catch crashes in the layout system
export {
  ErrorBoundary,
} from 'expo-router';

// ⚙️ Experimental setting: make the initial screen be the tab navigator instead of index
export const unstable_settings = {
  initialRouteName: '(tabs)',
};

// 🔄 This is the main root layout component that runs first
export default function RootLayout() {
  // 🧠 Load custom fonts (SpaceMono + FontAwesome icons)
  const [loaded, error] = useFonts({
    SpaceMono: require('../assets/fonts/SpaceMono-Regular.ttf'),
    ...FontAwesome.font,
  });

  // 🔔 On app load, set up notification permissions and Android channels
  // useEffect(() => {
  //   // Android-specific setup for default notification channel
  //   if (Platform.OS === 'android') {
  //     Notifications.setNotificationChannelAsync('default', {
  //       name: 'default',
  //       importance: Notifications.AndroidImportance.DEFAULT,
  //     });
  //   }

  //   // iOS: Request user permission for notifications
  //   async function requestPermissions() {
  //     const { status } = await Notifications.requestPermissionsAsync();
  //     if (status !== 'granted') {
  //       alert('Permission for notifications not granted');
  //     }
  //   }

  //   requestPermissions();
  // }, []);

  // ❗ If font loading fails, throw error to crash app and surface the problem
  useEffect(() => {
    if (error) throw error;
  }, [error]);

  // ✅ Once fonts are loaded, hide the splash screen and show the app
  useEffect(() => {
    if (loaded) {
      SplashScreen.hideAsync();
    }
  }, [loaded]);

  // ⏳ While fonts are still loading, render nothing
  if (!loaded) {
    return null;
  }

  // 🎯 If everything is ready, load the actual navigation UI
  return <RootLayoutNav />;
}

// 🧭 Defines the app’s navigation stack and theme switching (light/dark)
function RootLayoutNav() {
  const colorScheme = useColorScheme(); // 'light' or 'dark' mode from system

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        {/* Index screen (e.g. login) — no header shown */}
        <Stack.Screen name="index" options={{ headerShown: false }} />
        
        {/* Tab layout (loads bottom tab bar) — no header shown */}
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        
        {/* Modal screen — pops up over current screen like a sheet */}
        <Stack.Screen name="modal" options={{ presentation: 'modal' }} />
      </Stack>
    </ThemeProvider>
  );
}
