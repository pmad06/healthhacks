import React, { useEffect, useState } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StyleSheet, Alert } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function IndexScreen() {
  const [medTaken, setMedTaken] = useState(false);

  useEffect(() => {
    // Configure notification behavior
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Send notification when tab loads
    const sendNotificationOnLoad = async () => {
      const { status } = await Notifications.requestPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable notifications in settings.');
        return;
      }

      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Amoxicillin - 250mg',
          body: '1 Tablet',
        },
        trigger: { seconds: 2 },
      });

      console.log('🚀 Notification scheduled on tab load');
    };

    sendNotificationOnLoad();

    // Optional: log delivery and tap
    const receivedSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('✅ Notification received:', notification);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📲 User tapped notification:', response);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  const handleMedTaken = () => {
    setMedTaken(true);
    console.log('✅ Medication marked as taken');
    Alert.alert('Great!', 'Medication marked as taken.');
  };

  return (
    <SafeAreaView style={styles.container}>
      

      <Pressable style={styles.button} onPress={handleMedTaken}>
        <Text style={styles.buttonText}>
          {medTaken ? '✅ Medication Taken' : 'Have you taken your medication?'}
        </Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#e1e9c9',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#224d74',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
  },
  buttonText: {
    color: '#e1e9c9',
    fontWeight: 'bold',
    fontSize: 16,
  },
});




/*import React, { useEffect } from 'react';
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, Pressable, StyleSheet, Alert, Platform } from 'react-native';
import * as Notifications from 'expo-notifications';

export default function IndexScreen() {
  useEffect(() => {
    // Configure notification behavior (optional but good practice)
    Notifications.setNotificationHandler({
      handleNotification: async () => ({
        shouldShowAlert: true,
        shouldPlaySound: true,
        shouldSetBadge: false,
      }),
    });

    // Listen for delivery and tap
    const receivedSub = Notifications.addNotificationReceivedListener(notification => {
      console.log('✅ Notification received:', notification);
    });

    const responseSub = Notifications.addNotificationResponseReceivedListener(response => {
      console.log('📲 User tapped notification:', response);
    });

    return () => {
      receivedSub.remove();
      responseSub.remove();
    };
  }, []);

  const sendTestNotification = async () => {
    console.log('🔔 Button tapped');

    const { status } = await Notifications.requestPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Required', 'Please enable notifications in settings.');
      return;
    }

    try {
      await Notifications.scheduleNotificationAsync({
        content: {
          title: 'Amoxicillin- 250mg',
          body: '1 Tablet',
        },
        trigger: {
          seconds: 5,
        } as Notifications.NotificationTriggerInput,
      });

      console.log('🚀 Notification scheduled');
    } catch (error) {
      console.error('❌ Notification scheduling failed:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Text style={styles.title}>Welcome to HealthHacks</Text>

      <Pressable style={styles.button} onPress={sendTestNotification}>
        <Text style={styles.buttonText}>Send Test Notification</Text>
      </Pressable>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 40,
  },
  button: {
    backgroundColor: '#4CAF50',
    paddingVertical: 12,
    paddingHorizontal: 20,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: 'red', // 🔍 debug border
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
});*/