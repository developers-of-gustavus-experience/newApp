import React, { useState, useEffect } from 'react';
import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Image } from 'react-native';
import { Tabs } from 'expo-router';
import { useColorScheme } from 'react-native';

import Colors from '@/constants/Colors';
import { ProfileImageProvider, useProfileImage } from '../context/ProfileImageContext';

// Fallback FontAwesome icon component
function TabBarIcon(props: {
  name: React.ComponentProps<typeof FontAwesome>['name'];
  color: string;
}) {
  return <FontAwesome size={28} style={{ marginBottom: -3 }} {...props} />;
}

// Updated ProfileTabIcon with load failure handling and recovery
function ProfileTabIcon({ color }: { color: string }) {
  const { profileUri } = useProfileImage();
  const [imageError, setImageError] = useState(false);

  useEffect(() => {
    // Reset error state when image URI changes
    setImageError(false);
  }, [profileUri]);

  if (!profileUri || profileUri.trim() === '' || imageError) {
    return <TabBarIcon name="user-circle" color={color} />;
  }

  return (
    <Image
      source={{ uri: profileUri }}
      style={{
        width: 28,
        height: 28,
        borderRadius: 14,
        marginBottom: -3,
      }}
      onError={() => setImageError(true)}
    />
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();

  return (
    <ProfileImageProvider>
      <Tabs
        screenOptions={{
          tabBarActiveTintColor: Colors[colorScheme ?? 'light'].tint,
          headerShown: false,
        }}
      >
        <Tabs.Screen
          name="Home"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <TabBarIcon name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Discover"
          options={{
            title: 'Discover',
            tabBarIcon: ({ color }) => <TabBarIcon name="safari" color={color} />,
          }}
        />
        <Tabs.Screen
          name="Notifications2"
          options={{
            title: 'Social',
            tabBarIcon: ({ color }) => <TabBarIcon name="bell" color={color} />,
          }}
        />
        <Tabs.Screen
          name="You"
          options={{
            title: 'You',
            tabBarIcon: ({ color }) => <ProfileTabIcon color={color} />,
          }}
        />
        <Tabs.Screen
          name="index"
          options={{
            href: null,
          }}
        />
      </Tabs>
    </ProfileImageProvider>
  );
}
