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

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [faces, setFaces] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [mode, setMode] = useState<'face' | 'read' | null>(null);

  const apiKey = 'acc_6329f34077fecdb'; // 🔑 Replace with your actual key

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();

    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alert('Camera and media permissions are required!');
    }
  };

  const pickImage = async () => {
    try {
      await requestPermissions();
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
          console.log('🧠 Ready to run OCR or reading logic here');
        }
        // else if (mode === 'face') {
        //   detectFaces(image.uri);
        // }
      }
    } catch (error) {
      setError('Error selecting image.');
    }
  };

  const takePhoto = async () => {
    try {
      await requestPermissions();
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: false,
        quality: 1,
        aspect: [4, 3],
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        setImageUri(image.uri);

        if (mode === 'read') {
          console.log('🧠 Ready to run OCR or reading logic here');
        }
        // else if (mode === 'face') {
        //   detectFaces(image.uri);
        // }
      }
    } catch (error) {
      setError('Error taking photo.');
    }
  };

  // const detectFaces = async (uri: string) => {
  //   try {
  //     const formData = new FormData();
  //     const file = {
  //       uri,
  //       type: 'image/jpeg',
  //       name: 'photo.jpg',
  //     } as any;

  //     formData.append('image', file);

  //     const response = await axios.post('https://api.imagga.com/v2/faces', formData, {
  //       headers: {
  //         Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
  //         'Content-Type': 'multipart/form-data',
  //       },
  //     });

  //     const facesDetected = response.data.result.faces;

  //     if (facesDetected.length > 0) {
  //       setFaces(facesDetected);
  //       setError(null);
  //     } else {
  //       setError('No faces detected.');
  //       setFaces(null);
  //     }
  //   } catch (error) {
  //     setError('Error during face detection.');
  //   }
  // };

  useEffect(() => {
    if (imageUri) {
      setMode(null); // Reset mode after action
    }
  }, [imageUri]);

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>📷 Smart Image Reader</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={() => { setMode('read'); pickImage(); }}>
          <Text style={styles.buttonText}>📁 Upload Image</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={() => { setMode('read'); takePhoto(); }}>
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>

        {/* <TouchableOpacity style={styles.button} onPress={() => { setMode('face'); takePhoto(); }}>
          <Text style={styles.buttonText}>🔒 Use Camera for Face ID</Text>
        </TouchableOpacity> */}
      </View>

      {imageUri && (
        <View style={styles.card}>
          <Image source={{ uri: imageUri }} style={styles.image} />
        </View>
      )}

      {error && <Text style={styles.error}>{error}</Text>}

      {faces && (
        <View style={styles.result}>
          <Text style={styles.resultTitle}>👤 Faces Detected: {faces.length}</Text>
          {faces.map((face: any, idx: number) => (
            <Text key={idx} style={styles.resultText}>
              • Face {idx + 1} — Confidence: {(face.confidence * 100).toFixed(2)}%
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
    backgroundColor: '#e6f2ff', // 🌤️ light blue
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
    color: '#444',
  },
});