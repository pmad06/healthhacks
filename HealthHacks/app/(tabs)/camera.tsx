import React, { useState } from 'react';
import { View, Button, Image, Text, StyleSheet, ScrollView } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import axios from 'axios';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [faces, setFaces] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);

  const apiKey = 'acc_6329f34077fecdb'; // 🔑 Replace this

  const requestPermissions = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      alert('Permission to access media library is required!');
    }
  };

  const pickImage = async () => {
    try {
      await requestPermissions();

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        allowsEditing: true,
        quality: 1,
      });

      if (!result.canceled && result.assets?.length > 0) {
        const image = result.assets[0];
        setImageUri(image.uri);
        detectFaces(image.uri);
      }
    } catch (error) {
      setError('Error selecting image.');
    }
  };

  const detectFaces = async (uri: string) => {
    try {
      const formData = new FormData();
      const file = {
        uri,
        type: 'image/jpeg',
        name: 'photo.jpg',
      } as any;

      formData.append('image', file);

      const response = await axios.post('https://api.imagga.com/v2/faces', formData, {
        headers: {
          Authorization: `Basic ${Buffer.from(apiKey + ':').toString('base64')}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      const facesDetected = response.data.result.faces;

      if (facesDetected.length > 0) {
        setFaces(facesDetected);
      } else {
        setError('No faces detected.');
        setFaces(null);
      }
    } catch (error) {
      setError('Error during face detection.');
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Button title="Pick an Image" onPress={pickImage} />
      {imageUri && <Image source={{ uri: imageUri }} style={styles.image} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {faces && (
        <View style={{ marginTop: 20 }}>
          <Text>👤 Faces Detected: {faces.length}</Text>
          {faces.map((face: any, idx: number) => (
            <Text key={idx}>
              Face {idx + 1} - Confidence: {(face.confidence * 100).toFixed(2)}%
            </Text>
          ))}
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    marginTop: 20,
    width: 300,
    height: 300,
    borderRadius: 8,
  },
  error: {
    marginTop: 10,
    color: 'red',
  },
});