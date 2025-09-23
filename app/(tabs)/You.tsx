import React, { useEffect, useState } from 'react';
import {
  Dimensions,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Image,
  Modal,
  SafeAreaView,
  Pressable,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { WebView } from 'react-native-webview';
import { auth } from '../../FirebaseConfig';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
} from 'firebase/auth';
import { useProfileImage } from '../context/ProfileImageContext';

const screenHeight = Dimensions.get('window').height;
const defaultImage = require('../../assets/images/default.png');
const PROFILE_KEY = 'profileImageUri';

const menuItems = [
  { label: 'GusMail', url: 'https://mail.google.com/mail/u/0/' },
  { label: 'MyGustavus', url: 'https://my.gustavus.edu' },
  { label: 'Accounts', url: 'https://gustavus.edu/accounts' },
  { label: 'Notifications', url: 'https://gustavus.edu/notifications' },
  { label: 'ID Card', url: 'https://gustavus.edu/idcard' },
  { label: 'Moodle', url: 'https://moodle.gustavus.edu/' },
];

export default function YouScreen() {
  // 👤 User state and login form input
  const [user, setUser] = useState(null); // Firebase user object
  const [email, setEmail] = useState(''); // Login email input
  const [password, setPassword] = useState(''); // Login password input

  // 🌐 WebView modal state
  const [modalVisible, setModalVisible] = useState(false);
  const [currentUrl, setCurrentUrl] = useState(null); // Currently loaded URL in the WebView

  // 📷 Profile image state (from a custom hook using AsyncStorage)
  const { profileUri, setProfileUri } = useProfileImage();

  // 📝 Profile name state
  const [profileName, setProfileName] = useState('Gustavus Adolphus');
  const [isEditingName, setIsEditingName] = useState(false); // Toggles edit mode

  // 🚀 Run on first render: attach auth listener and load saved profile data
  useEffect(() => {
    // Listen for auth state changes (login/logout)
    const unsubscribe = onAuthStateChanged(auth, (u) => setUser(u));

    // Load saved profile image and name from AsyncStorage
    loadProfileImage();
    loadProfileName();

    // Cleanup listener on unmount
    return () => unsubscribe();
  }, []);

  // 🔁 Load profile image URI from AsyncStorage
  const loadProfileImage = async () => {
    const uri = await AsyncStorage.getItem(PROFILE_KEY);
    if (uri) setProfileUri(uri);
  };

  // 🔁 Load saved profile name from AsyncStorage
  const loadProfileName = async () => {
    const saved = await AsyncStorage.getItem('profileName');
    if (saved) setProfileName(saved);
  };

  // 💾 Save profile name and exit edit mode
  const saveProfileName = async () => {
    await AsyncStorage.setItem('profileName', profileName);
    setIsEditingName(false);
  };

  // 📸 Handle profile image change logic with options (Camera or Library)
  const handleImagePress = async () => {
    Alert.alert('Update Profile Picture', 'Choose a method', [
      {
        text: 'Take Photo',
        onPress: async () => {
          // Request camera permission
          const cameraPerm = await ImagePicker.requestCameraPermissionsAsync();
          if (!cameraPerm.granted) {
            Alert.alert('Camera permission needed');
            return;
          }

          // Open camera and allow image editing
          const result = await ImagePicker.launchCameraAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });

          // Save photo URI if valid
          if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setProfileUri(uri);
            await AsyncStorage.setItem(PROFILE_KEY, uri);
          }
        },
      },
      {
        text: 'Choose From Library',
        onPress: async () => {
          // Request photo library permission
          const libPerm = await ImagePicker.requestMediaLibraryPermissionsAsync();
          if (!libPerm.granted) {
            Alert.alert('Library permission needed');
            return;
          }

          // Open library and allow image selection/editing
          const result = await ImagePicker.launchImageLibraryAsync({
            allowsEditing: true,
            aspect: [1, 1],
            quality: 0.5,
          });

          // Save selected image URI if valid
          if (!result.canceled && result.assets.length > 0) {
            const uri = result.assets[0].uri;
            setProfileUri(uri);
            await AsyncStorage.setItem(PROFILE_KEY, uri);
          }
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
  };

  // 🔐 Sign in with Firebase Auth
  const signIn = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Login Failed', error.message);
    }
  };

  // ➕ Sign up (create account) with Firebase Auth
  const signUp = async () => {
    try {
      await createUserWithEmailAndPassword(auth, email, password);
    } catch (error: any) {
      Alert.alert('Signup Failed', error.message);
    }
  };

  // 🚪 Log out user and clear input fields
  const handleLogout = async () => {
    await signOut(auth);
    setEmail('');
    setPassword('');
  };

  // 🌐 Open in-app browser modal with a given URL
  const openWebView = (url: string) => {
    setCurrentUrl(url);
    setModalVisible(true);
  };

  // 🛑 Not logged in → show login/signup UI
  // if (!user) {
  //   return (
  //     <SafeAreaView style={styles.loginContainer}>
  //       <Text style={styles.title}>Login</Text>
  //       <TextInput
  //         style={styles.textInput}
  //         placeholder="Email"
  //         value={email}
  //         onChangeText={setEmail}
  //         autoCapitalize="none"
  //       />
  //       <TextInput
  //         style={styles.textInput}
  //         placeholder="Password"
  //         value={password}
  //         onChangeText={setPassword}
  //         secureTextEntry
  //       />
  //       <TouchableOpacity style={styles.button} onPress={signIn}>
  //         <Text style={styles.buttonText}>Log In</Text>
  //       </TouchableOpacity>
  //       <TouchableOpacity style={styles.button} onPress={signUp}>
  //         <Text style={styles.buttonText}>Create Account</Text>
  //       </TouchableOpacity>
  //     </SafeAreaView>
  //   );
  // }

  // ✅ Logged in → show profile + menu
  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 👤 Profile Section */}
      <View style={styles.profileContainer}>
        {/* Tap image to change */}
        <TouchableOpacity onPress={handleImagePress}>
          <Image
            source={profileUri ? { uri: profileUri } : defaultImage}
            style={styles.profileImage}
          />
        </TouchableOpacity>

        {/* Editable name field */}
        {isEditingName ? (
          <TextInput
            style={[styles.profileName, styles.editableInput]}
            value={profileName}
            onChangeText={setProfileName}
            onBlur={saveProfileName} // Save when editing ends
            autoFocus
          />
        ) : (
          <TouchableOpacity onPress={() => setIsEditingName(true)}>
            <Text style={styles.profileName}>{profileName}</Text>
          </TouchableOpacity>
        )}
      </View>

      {/* 🧭 Menu Links */}
      <View style={styles.menuContainer}>
        {menuItems.map((item, index) => (
          <TouchableOpacity
            key={index}
            style={styles.menuItem}
            onPress={() => openWebView(item.url)}
          >
            <Text style={styles.menuText}>{item.label}</Text>
          </TouchableOpacity>
        ))}

        {/* 🚪 Log Out Option */}
        <TouchableOpacity style={styles.menuItem} onPress={handleLogout}>
          <Text style={styles.menuText}>Log Out</Text>
        </TouchableOpacity>
      </View>

      {/* 🌐 In-App Browser Modal */}
      <Modal visible={modalVisible} animationType="slide">
        <SafeAreaView style={{ flex: 1 }}>
          {/* Header with Close Button */}
          <View style={styles.webviewHeader}>
            <Pressable onPress={() => setModalVisible(false)}>
              <Text style={styles.closeButton}>Close</Text>
            </Pressable>
          </View>

          {/* Render WebView if URL is loaded */}
          {currentUrl && <WebView source={{ uri: currentUrl }} />}
        </SafeAreaView>
      </Modal>
    </ScrollView>
  );
}


const styles = StyleSheet.create({
  loginContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FAFAFA',
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    marginBottom: 40,
    color: '#000',
  },
  textInput: {
    height: 50,
    width: '90%',
    backgroundColor: '#fff',
    borderColor: '#E8EAF6',
    borderWidth: 2,
    borderRadius: 15,
    marginVertical: 15,
    paddingHorizontal: 25,
    fontSize: 16,
    color: '#3C4858',
    shadowColor: '#9E9E9E',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 4,
  },
  button: {
    width: '90%',
    marginVertical: 10,
    backgroundColor: '#FFC72C',
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#FFC72C',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.4,
    shadowRadius: 5,
    elevation: 5,
  },
  buttonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
  container: {
    paddingTop: 60,
    paddingBottom: 60,
    paddingHorizontal: 20,
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  profileContainer: {
    alignItems: 'center',
    marginBottom: 30,
  },
  profileImage: {
    width: screenHeight * 0.25,
    height: screenHeight * 0.25,
    borderRadius: screenHeight * 0.09,
    borderWidth: 2,
    borderColor: '#ccc',
    backgroundColor: '#eee',
  },
  profileName: {
    marginTop: 12,
    fontSize: 22,
    fontWeight: '600',
    color: '#2c3e50',
  },
  editableInput: {
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
    paddingHorizontal: 4,
  },
  menuContainer: {
    width: '100%',
    marginTop: 20,
  },
  menuItem: {
    paddingVertical: 16,
    paddingHorizontal: 20,
    borderBottomColor: '#eee',
    borderBottomWidth: 1,
  },
  menuText: {
    fontSize: 18,
    color: '#34495e',
  },
  webviewHeader: {
    padding: 16,
    backgroundColor: '#f5f5f5',
    alignItems: 'flex-end',
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  closeButton: {
    fontSize: 16,
    color: '#007AFF',
    fontWeight: '600',
  },
});
