import React, { useState } from 'react';
import {
  View,
  Text,
  FlatList,
  Image,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Platform,
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import DateTimePicker from '@react-native-community/datetimepicker';
import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

export default function MemoryScreen() {
  const tabBarHeight = useBottomTabBarHeight();
  const IMAGE_HEIGHT = SCREEN_HEIGHT - tabBarHeight;

  const [memories, setMemories] = useState<{ uri: string; date: Date }[]>([]);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [isCalendarVisible, setIsCalendarVisible] = useState(false); // ✅ toggle state

  const addMemory = async () => {
    const permissionResult = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permissionResult.granted) {
      alert('Permission to access media library is required!');
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: false,
      quality: 1,
      exif: true,
    });

    if (!result.canceled && result.assets?.length > 0) {
      const image = result.assets[0];
      const rawDate = image.exif?.DateTimeOriginal || image.exif?.DateTime;

      let parsedDate = new Date();
      if (rawDate && typeof rawDate === 'string') {
        try {
          const cleaned = rawDate.replace(/^(\d{4}):(\d{2}):(\d{2})/, '$1-$2-$3').replace(' ', 'T');
          const testDate = new Date(cleaned);
          if (!isNaN(testDate.getTime())) {
            parsedDate = testDate;
          }
        } catch (err) {
          console.warn('⚠️ Failed to parse EXIF date:', rawDate);
        }
      }

      const newMemories = [
        ...memories,
        { uri: image.uri, date: parsedDate },
      ].sort((a, b) => b.date.getTime() - a.date.getTime());

      setMemories(newMemories);
    }
  };

  const toggleCalendar = (index: number) => {
    if (editingIndex === index && isCalendarVisible) {
      setIsCalendarVisible(false); // ✅ collapse
      setEditingIndex(null);
    } else {
      setEditingIndex(index); // ✅ open
      setIsCalendarVisible(true);
    }
  };

  const updateDate = (_event: any, selectedDate?: Date) => {
    if (selectedDate && editingIndex !== null) {
      const updated = [...memories];
      updated[editingIndex].date = selectedDate;
      const sorted = updated.sort((a, b) => b.date.getTime() - a.date.getTime());
      setMemories(sorted);
    }
    setIsCalendarVisible(false);
    setEditingIndex(null);
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
        snapToInterval={IMAGE_HEIGHT}
        decelerationRate="fast"
        getItemLayout={(_, index) => ({
          length: IMAGE_HEIGHT,
          offset: IMAGE_HEIGHT * index,
          index,
        })}
        showsVerticalScrollIndicator={false}
        renderItem={({ item, index }) => (
          <View style={[styles.memoryCard, { height: IMAGE_HEIGHT }]}>
            <Image source={{ uri: item.uri }} style={[styles.image, { height: IMAGE_HEIGHT }]} />
            <TouchableOpacity
              style={[styles.dateOverlay, { bottom: tabBarHeight + 20 }]}
              onPress={() => toggleCalendar(index)} // ✅ toggle on tap
            >
              <Text style={styles.dateText}>{item.date.toDateString()}</Text>
            </TouchableOpacity>
            {editingIndex === index && isCalendarVisible && (
              <View style={[styles.pickerContainer, { bottom: tabBarHeight + 70 }]}>
                <DateTimePicker
                  value={item.date}
                  mode="date"
                  display={Platform.OS === 'ios' ? 'inline' : 'calendar'}
                  onChange={updateDate}
                  style={styles.datePicker}
                />
              </View>
            )}
          </View>
        )}
        style={{ flex: 1 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#e1e9c9',
  },
  addButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 10,
    backgroundColor: '#e1e9c9',
    borderRadius: 20,
    padding: 10,
  },
  addText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  memoryCard: {
    width: '100%',
    justifyContent: 'center',
    alignItems: 'center',
  },
  image: {
    width: '100%',
    resizeMode: 'cover',
  },
  dateOverlay: {
    position: 'absolute',
    left: 20,
    backgroundColor: '#e1e9c9',
    padding: 8,
    borderRadius: 6,
  },
  dateText: {
    color: '#224d74',
    fontSize: 18,
    fontWeight: '600',
  },
  pickerContainer: {
    position: 'absolute',
    left: 20,
    right: 20,
    backgroundColor: '#224d74',
    borderRadius: 10,
    padding: 10,
  },
  datePicker: {
    width: '100%',
  },
});