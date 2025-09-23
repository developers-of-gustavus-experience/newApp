import React from 'react';
import { View, Text, Image, StyleSheet, Dimensions, Pressable, Touchable, ScrollView } from 'react-native';
import { useLocalSearchParams, Stack } from 'expo-router';
import homeScreenData from '../constants/homeScreenData';
import { TouchableOpacity, Linking } from 'react-native';
import * as WebBrowser from 'expo-web-browser';

const screenWidth = Dimensions.get('window').width;

export default function HomeCard() {
  const { section, index } = useLocalSearchParams();

  const card =
    homeScreenData[section as keyof typeof homeScreenData]?.[parseInt(index as string)];

  return (
    <>
    <ScrollView>
      <Stack.Screen options={{ headerShown: true, title: '' }} />

      <View style={styles.container}>
        {card?.image && (
          <Image
            source={card.image}
            style={styles.image}
            resizeMode="cover"
          />
        )}

        <Text style={styles.title}>{card?.title}</Text>
        <Text style={styles.description}>{card?.description}</Text>

        {card?.menu && (
          <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(card?.menu)}>
            <Text style={styles.link}>View Menu</Text>
          </TouchableOpacity>
        )}
        {card?.link && (
          <TouchableOpacity onPress={() => WebBrowser.openBrowserAsync(card?.link)}>
            <Text style={styles.link}>View interactive map</Text>
          </TouchableOpacity>
        )}
        {card?.info && (
          <Text style={styles.description}>{card?.info}</Text>
        )}

        {card?.CampusSafetyphoneNumbers && (
          <View>
              <View style={{ marginTop: 20 }}>
                {card.CampusSafetyphoneNumbers.map((entry, idx) => (
                  <TouchableOpacity key={idx} onPress={() => Linking.openURL(`tel:${entry.number}`)}>
                    <Text key={idx} style={styles.phoneNumber  }>
                      {entry.name}: {entry.number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            
          </View>
        )}
        {card?.HealthServicesPhoneNumbers && (
          <View>
              <View style={{ marginTop: 20 }}>
                {card.HealthServicesPhoneNumbers.map((entry, idx) => (
                  <TouchableOpacity key={idx} onPress={() => Linking.openURL(`tel:${entry.number}`)}>
                    <Text key={idx} style={styles.phoneNumber  }>
                      {entry.name}: {entry.number}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            
          </View>
        )}

      </View>
      </ScrollView>

      
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 60,
    backgroundColor: '#fff',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
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
    textAlign: 'center',
    color: '#7f8c8d',
  },
  link: {
    fontSize: 16,
    textAlign: 'center',
    color: '#3498db',
    marginTop: 10,
  },
  phoneNumber: {
    fontSize: 16,
    marginBottom: 6,
    color: '#2980b9',
    textDecorationLine: 'underline',
    borderRadius: 5,
    borderColor: '#2980b9',
    //borderWidth: 1,
    paddingBottom: 10,

  }
});
