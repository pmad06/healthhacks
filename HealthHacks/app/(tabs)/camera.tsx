import React, { useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as FileSystem from 'expo-file-system/legacy';
import axios from 'axios';

export default function CameraScreen() {
  const [imageUri, setImageUri] = useState<string | null>(null);
  const [tags, setTags] = useState<string[]>([]);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [drugEventData, setDrugEventData] = useState<any[]>([]);

  const openFDAKey = '3HvAqsee8LTDH2ERCbrdrnVnattSEZH3abUgKtMr';

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      Alert.alert('Camera and media permissions are required!');
      return false;
    }
    return true;
  };

  const knownDrugs = [
    'Amoxicillin', 'Ibuprofen', 'Paracetamol', 'Metformin', 'Atorvastatin',
    'Omeprazole', 'Amlodipine', 'Lisinopril', 'Hydrochlorothiazide', 'Simvastatin',
    'Azithromycin', 'Albuterol', 'Levothyroxine', 'Gabapentin', 'Sertraline'
  ];

  const analyzeImageText = async (uri: string) => {
    setLoading(true);
    setError(null);
    setTags([]);
    setDrugEventData([]);

    try {
      const base64Img = await FileSystem.readAsStringAsync(uri, { encoding: 'base64' });

      const formData = new FormData();
      formData.append('base64Image', 'data:image/jpeg;base64,' + base64Img);
      formData.append('language', 'eng');
      formData.append('isOverlayRequired', 'false');

      const response = await axios.post('https://api.ocr.space/parse/image', formData, {
        headers: {
          apikey: 'K86463749088957',
          'Content-Type': 'multipart/form-data',
        },
      });

      const parsed = response.data.ParsedResults?.[0];
      const text = parsed?.ParsedText;

      if (text) {
        const lines: string[] = text.split('\n').filter((line: string) => line.trim() !== '');
        const medicineRegex = /\b([A-Za-z]{4,})\b/g;
        const allWords = lines.join(' ').match(medicineRegex) || [];

        const filteredMeds = Array.from(new Set(
          allWords.filter((word) =>
            knownDrugs.some((drug) => drug.toLowerCase() === word.toLowerCase())
          )
        ));

        if (filteredMeds.length > 0) {
          setTags(filteredMeds);
          filteredMeds.slice(0, 5).forEach((med) => fetchDrugEventData(med));
        } else {
          setError('No valid medication names found in extracted text.');
        }
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

  const fetchDrugEventData = async (searchTerm: string) => {
    try {
      const response = await axios.get(
        `https://api.fda.gov/drug/drugsfda.json?api_key=${openFDAKey}&search=products.brand_name:"${searchTerm}"&limit=5`
      );

      const data = response.data;
      if (data.results && data.results.length > 0) {
        const taggedResults = data.results.map((r: any) => ({
          ...r,
          sourceDrug: searchTerm,
        }));
        setDrugEventData((prev) => [...prev, ...taggedResults]);
      } else {
        console.warn(`No FDA drug info found for "${searchTerm}".`);
      }
    } catch (err) {
      console.error(`Error fetching data for ${searchTerm}:`, err);
    }
  };

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
      <Text style={styles.title}>Scanner</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity style={styles.button} onPress={takePhoto}>
          <Text style={styles.buttonText}>📸 Take Photo</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.button} onPress={pickImage}>
          <Text style={styles.buttonText}>📁 Upload Image</Text>
        </TouchableOpacity>
      </View>

      {imageUri && (
        <View style={styles.imageBlock}>
          <View style={styles.card}>
            <Image source={{ uri: imageUri }} style={styles.image} />
          </View>

          <View style={styles.tagStack}>
            {tags.map((tag, idx) => (
              <View key={idx} style={styles.tagBox}>
                <Text style={styles.tagText}>{tag}</Text>
              </View>
            ))}
          </View>
        </View>
      )}

      {loading && <ActivityIndicator size="large" color="#4a90e2" style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}

      {drugEventData.length > 0 && (
        <View style={styles.result}>
          {drugEventData.map((event, idx) => (
            <View key={idx} style={styles.eventItem}>
              <Text style={styles.resultText}>Medicine: {event?.sourceDrug ?? 'N/A'}</Text>
              <Text style={styles.resultText}>Event ID: {event?.primaryid ?? 'N/A'}</Text>
              <Text style={styles.resultText}>
                Reaction: {Array.isArray(event?.patient?.reaction)
                  ? event.patient.reaction.map((r: any) => r.reactionmeddrapt).join(', ')
                  : 'N/A'}
              </Text>
              <Text style={styles.resultText}>
                Drug: {Array.isArray(event?.drug)
                  ? event.drug.map((d: any) => d.medicinalproduct).join(', ')
                  : 'N/A'}
              </Text>
            </View>
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
    backgroundColor: '#e1e9c9',
    padding: 24,
  },
  title: {
    fontSize: 24,
    fontWeight: '600',
    marginBottom: 20,
    color: '#224d74',
  },
  buttonRow: {
    width: '100%',
    marginBottom: 20,
  },
  button: {
    backgroundColor: '#224d74',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#e1e9c9',
    fontWeight: '500',
    fontSize: 16,
  },
  imageRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
  },
  tagColumn: {
    marginRight: 12,
    alignItems: 'flex-end',
  },
    tagBox: {
    backgroundColor: '#224d74',
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 6,
    marginBottom: 8,
    minWidth: 100,
    alignItems: 'center',
  },
  tagText: {
    color: '#e1e9c9',
    fontWeight: '600',
    fontSize: 14,
  },
  card: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 3,
    backgroundColor: '#e1e9c9',
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
  resultText: {
    fontSize: 16,
    color: '#224d74',
    marginBottom: 4,
  },
  eventItem: {
    marginBottom: 16,
    padding: 12,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    width: '100%',
  },
});