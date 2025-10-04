import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  // Request permissions for camera and media library
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alert('Camera and media permissions are required!');
      return false;
    }
    return true;
  };

  // Analyze image text using OCR.space API
  const analyzeImageText = async (uri: string) => {
    setLoading(true);
    setError(null);
    setTags([]);

    try {
      const base64Img = await FileSystem.readAsStringAsync(uri, {
        encoding: 'base64',
      });

      const formData = new FormData();
      formData.append('base64Image', 'data:image/jpeg;base64,' + base64Img);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          apikey: 'K86463749088957', // Your API key here
          'Content-Type': 'multipart/form-data',
        },
      });

      const parsed = response.data.ParsedResults?.[0];
      const text = parsed?.ParsedText;

      console.log('Extracted text:', text);

      if (text) {
        const lines: string[] = text.split('\n').filter((line: string) => line.trim() !== '');
        setTags(lines);
      } else {
        setError('No text detected.');
      }
    } catch (err) {
      console.error('OCR error:', err);
      setError('Error analyzing image for text.');
    } finally {
      setLoading(false);
    }
  };

  // Pick image from library
  const pickImage = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        setImageUri(image.uri);
        analyzeImageText(image.uri);
      }
    } catch {
      setError('Error selecting image.');
    }
  };

  // Take photo with camera
  const takePhoto = async () => {
    const hasPermissions = await requestPermissions();
    if (!hasPermissions) return;

    try {
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        setImageUri(image.uri);
        analyzeImageText(image.uri);
      }
    } catch {
      setError('Error taking photo.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📷 Smart Text Scanner</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📁 Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.card}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 20 }} />}

      {error && <Text style={styles.error}>{error}</Text>}

      {tags.length > 0 && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>📝 Extracted Text:</Text>
          {tags.map((line, idx) => (
            <Text key={idx} style={styles.resultText}>
              {line}
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e6f2ff',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#333',
  },
  buttonRow: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#4a90e2',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontWeight: '500',
    fontSize: 16,
  },
  card: {
    marginTop: 10,
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#fff',
  },
  image: {
    width: 300,
    height: 300,
  },
  error: {
    marginTop: 10,
    color: '#d9534f',
    fontWeight: '500',
  },
  result: {
    marginTop: 20,
    alignItems: 'flex-start',
  },
  resultTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 8,
    color: '#000',
  },
  resultText: {
    fontSize: 16,
    color: '#000',
  },
});
