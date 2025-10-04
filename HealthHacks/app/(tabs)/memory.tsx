import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

export default function MemoryScreen() {
  const [memories, setMemories] = useState<{ uri: string; date: string }[]>([]);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const addMemory = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      setSelectedImage(image.uri);
      setShowDatePicker(true);
    }
  };

  const onDateSelected = (_event: any, date?: Date) => {
    setShowDatePicker(false);
    if (date && selectedImage) {
      setMemories([{ uri: selectedImage, date: date.toDateString() }, ...memories]);
      setSelectedImage(null);
    }
  };

  return (
    <View style={styles.container}>
      <TouchableOpacity style={styles.addButton} onPress={addMemory}>
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>

      <FlatList
        data={memories}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        showsVerticalScrollIndicator={false}
        renderItem={({ item }) => (
          <View style={styles.memoryCard}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <Text style={styles.date}>{item.date}</Text>
          </View>
        )}
      />

      {showDatePicker && (
        <DateTimePicker
          value={new Date()}
          mode="date"
          display="default"
          onChange={onDateSelected}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  addButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 10,
  },
  addText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  memoryCard: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    height: '100%',
    width: '100%',
    resizeMode: 'cover',
  },
  date: {
    position: 'absolute',
    bottom: 60,
    left: 20,
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
    backgroundColor: 'rgba(0,0,0,0.4)',
    padding: 8,
    borderRadius: 6,
  },
});