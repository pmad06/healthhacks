import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';
import base64 from 'base-64';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tags, setTags] = useState<any[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'read' | null>(null);

  // 🔑 Replace these with your actual Imagga API key and secret
  const apiKey = 'acc_6329f34077fecdb';
  const apiSecret = 'YOUR_IMAGGA_API_SECRET';

  // Request camera and media library permissions
  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alert('Camera and media permissions are required!');
      return false;
    }
    return true;
  };

  // Analyze image with Imagga tags API
  const analyzeImageTags = async (uri: string) => {
    try {
      setError(null);
      setTags([]);

      const formData = new FormData();

      const file = {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any;

      formData.append('image', file);

      const authHeader = 'Basic ' + base64.encode(apiKey + ':' + apiSecret);

      const response = await axios.post('https://api.imagga.com/v2/tags', formData, {
        headers: {
          Authorization: authHeader,
          'Content-Type': 'multipart/form-data',
        },
      });

      const tagsResult = response.data.result.tags;

      if (tagsResult.length > 0) {
        setTags(tagsResult);
      } else {
        setError('No tags detected.');
      }
    } catch (err) {
      console.error('Image analysis error:', err);
      setError('Error analyzing image.');
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

        if (mode === 'read') {
          analyzeImageTags(image.uri);
        }
      }
    } catch (err) {
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

        if (mode === 'read') {
          analyzeImageTags(image.uri);
        }
      }
    } catch (err) {
      setError('Error taking photo.');
    }
  };

  // Reset mode and clear tags/error when new image is picked
  useEffect(() => {
    if (imageUri) {
      setMode(null);
      setError(null);
    }
  }, [imageUri]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📷 Smart Image Reader</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setMode('read');
            pickImage();
          }}
        >
          <Text style={styles.buttonText}>📁 Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => {
            setMode('read');
            takePhoto();
          }}
        >
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.card}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {tags.length > 0 && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>🔖 Image Tags:</Text>
          {tags.map((tag, idx) => (
            <Text key={idx} style={styles.resultText}>
              • {tag.tag.en} ({(tag.confidence * 100).toFixed(2)}%)
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
  },
  resultText: {
    fontSize: 16,
    color: '#000',
  },
});
