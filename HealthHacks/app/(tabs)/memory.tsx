import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';

// ✅ Get screen height for full-screen paging
const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MemoryScreen() {
  const [memories, setMemories] = useState<{ uri: string; date: Date }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const addMemory = async () => {
    // ✅ Request media library permission
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    // ✅ Launch image picker with EXIF enabled
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];

      // ✅ Extract EXIF date or fallback to today
      const rawDate = image.exif?.DateTimeOriginal || image.exif?.DateTime;
      const parsedDate = rawDate
        ? new Date(rawDate.replace(/:/g, '-').replace(' ', 'T'))
        : new Date();

      // ✅ Add memory and sort by date (newest first)
      const newMemories = [
        ...memories,
        { uri: image.uri, date: parsedDate },
      ].sort((a, b) => b.date.getTime() - a.date.getTime());

      setMemories(newMemories);
    }
  };

  const updateDate = (_event: any, selectedDate?: Date) => {
    if (selectedDate && editingIndex !== null) {
      const updated = [...memories];
      updated[editingIndex].date = selectedDate;

      // ✅ Re-sort after edit
      const sorted = updated.sort((a, b) => b.date.getTime() - a.date.getTime());
      setMemories(sorted);
    }
    setEditingIndex(null);
  };

  return (
    <View style={styles.container}>
      {/* ✅ Add button to pick image */}
      <TouchableOpacity style={styles.addButton} onPress={addMemory}>
        <Text style={styles.addText}>＋</Text>
      </TouchableOpacity>

      {/* ✅ FlatList with full-screen vertical paging */}
      <FlatList
        data={memories}
        keyExtractor={(_, index) => index.toString()}
        pagingEnabled
        snapToInterval={SCREEN_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: SCREEN_HEIGHT,
          offset: SCREEN_HEIGHT * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={styles.memoryCard}>
            <Image source={{ uri: item.uri }} style={styles.image} />
            <TouchableOpacity
              style={styles.dateOverlay}
              onPress={() => setEditingIndex(index)}
            >
              <Text style={styles.dateText}>{item.date.toDateString()}</Text>
            </TouchableOpacity>
          </View>
        )}
        style={{ flex: 1 }}
      />

      {/* ✅ Date picker for editing */}
      {editingIndex !== null && (
        <DateTimePicker
          value={memories[editingIndex].date}
          mode="date"
          display="default"
          onChange={updateDate}
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
    width: '100%',
    height: SCREEN_HEIGHT, // ✅ full screen height
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    height: SCREEN_HEIGHT, // ✅ force image to fill screen
    resizeMode: 'cover',
  },
  dateOverlay: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 8,
    borderRadius: 6,
  },
  dateText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '600',
  },
});