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
  const [drugEventData, setDrugEventData] = useState<any[]>([]);

  const openFDAKey = '3HvAqsee8LTDH2ERCbrdrnVnattSEZH3abUgKtMr';

  const requestPermissions = async () => {
    const { status: cameraStatus } = await ImagePicker.requestCameraPermissionsAsync();
    const { status: mediaStatus } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (cameraStatus !== 'granted' || mediaStatus !== 'granted') {
      alert('Camera and media permissions are required!');
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

//     if (text) {
//       const lines: string[] = text.split('\n').filter((line: string) => line.trim() !== '');
//       const medicineRegex = /\b([A-Z][a-z]{3,}(?:\s[A-Z][a-z]{3,})?)\b/g;
//       const allMatches = lines.join(' ').match(medicineRegex) || [];

//       const blacklist = [
//         'Patient', 'Name', 'Color', 'Tablet', 'Capsule', 'Take', 'Daily',
//         'Once', 'Twice', 'Before', 'After', 'Mg', 'Ml', 'Dose', 'Every',
//         'Morning', 'Evening', 'Night', 'Day', 'Week', 'Month', 'White',
//         'Blue', 'Red', 'Yellow', 'Green', 'Pill', 'Medicine', 'Medication',
//         'Use', 'For', 'The', 'And', 'Of', 'In', 'To', 'A', 'Is', 'With',
//         'Capsules', 'Tablets', 'As', 'Needed', 'Not', 'More', 'Than', 'This',
//         'Donald', 'Kong', 'Amoxy', 'On', 'Cap'
//       ];


//   const filteredMeds = Array.from(new Set(
//   allMatches.filter((word) => {
//     const lower = word.toLowerCase();
//     return !blacklist.some((b) => lower.includes(b.toLowerCase()));
//   })
// ));
//       if (filteredMeds.length > 0) {
//         setTags(filteredMeds);
//         filteredMeds.slice(0, 5).forEach((med) => fetchDrugEventData(med));
//       } else {
//         setError('No valid medication names found in extracted text.');
//       }
//     } else {
//       setError('No text detected.');
//     }
//   } catch (err) {
//     console.error('OCR error:', err);
//     setError('Error analyzing image for text.');
//   } finally {
//     setLoading(false);
//   }

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
      }else{
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

      {drugEventData.length > 0 && (
        <View style={styles.result}>
          {drugEventData.map((event, idx) => (
            <View key={idx} style={styles.eventItem}>
              <Text style={styles.resultText}>
                Medicine: {event?.sourceDrug ?? 'N/A'}
              </Text>
              <Text style={styles.resultText}>
                Event ID: {event?.primaryid ?? 'N/A'}
              </Text>
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
  resultText: {
    fontSize: 16,
    color: '#000',
    marginBottom: 4,
  },
  eventItem: {
    marginBottom: 10,
    padding: 10,
    backgroundColor: '#f9f9f9',
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 1,
  },
});
