import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('❌ Permission denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Face Detected', 'Logging in', [
        {
          text: 'OK',
          onPress: () => router.replace('/camera'), // ✅ Redirect to camera
        },
      ]);
    }
  };

  const handleLogin = () => {
    if (username === 'yourUsername' && password === 'yourPassword') {
      Alert.alert('✅ Login successful', 'Welcome back!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/camera'), // ✅ Redirect to camera
        },
      ]);
    } else {
      Alert.alert('❌ Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RemindRx</Text>

      <TouchableOpacity style={styles.faceIDButton} onPress={openCamera}>
        <Text style={styles.buttonText}>Face ID</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e9c9',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: '#224d74',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#224d74',
    color: '#e1e9c9',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  faceIDButton: {
    backgroundColor: '#e1e9c9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#e1e9c9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#224d74',
    fontSize: 16,
    fontWeight: '600',
  },
});




/*import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';

export default function LoginScreen() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const router = useRouter();

  const openCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('❌ Permission denied', 'Camera access is required.');
      return;
    }

    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled) {
      Alert.alert('Face Detected', 'Logging in', [
        {
          text: 'OK',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    }
  };

  const handleLogin = () => {
    if (username === 'yourUsername' && password === 'yourPassword') {
      Alert.alert('✅ Login successful', 'Welcome back!', [
        {
          text: 'Continue',
          onPress: () => router.replace('/(tabs)'),
        },
      ]);
    } else {
      Alert.alert('❌ Invalid credentials');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>RemindRx</Text>

      <TouchableOpacity style={styles.faceIDButton} onPress={openCamera}>
        <Text style={styles.buttonText}>Face ID</Text>
      </TouchableOpacity>

      <TextInput
        style={styles.input}
        placeholder="Username"
        placeholderTextColor="#aaa"
        value={username}
        onChangeText={setUsername}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />
      <TouchableOpacity style={styles.loginButton} onPress={handleLogin}>
        <Text style={styles.buttonText}>Login</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e9c9',
    justifyContent: 'center',
    padding: 24,
  },
  title: {
    fontSize: 28,
    color: '#224d74',
    marginBottom: 40,
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#224d74',
    color: '#e1e9c9',
    padding: 12,
    marginBottom: 16,
    borderRadius: 8,
  },
  faceIDButton: {
    backgroundColor: '#e1e9c9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#e1e9c9',
    padding: 14,
    borderRadius: 8,
    alignItems: 'center',
    marginTop: 8,
  },
  buttonText: {
    color: '#224d74',
    fontSize: 16,
    fontWeight: '600',
  },
});*/