import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';

import CameraScreen from './screens/CameraScreen';
import MemoryScreen from './screens/MemoryScreen';     // create this later
import MedicationScreen from './screens/MedicationScreen'; // create this later

const Tab = createBottomTabNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Tab.Navigator>
        <Tab.Screen name="Camera" component={CameraScreen} />
        <Tab.Screen name="Memories" component={MemoryScreen} />
        <Tab.Screen name="Medications" component={MedicationScreen} />
      </Tab.Navigator>
    </NavigationContainer>
  );
}