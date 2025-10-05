import { Tabs } from 'expo-router';
import { Image } from 'react-native';

export default function TabsLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index"
        options={{
          title: '',
          tabBarIcon: ({ focused }) => (
            <Image
              source={require('../../assets/logo.png')}
              style={{
                width: 24,
                height: 24,
                //tintColor: focused ? '#4CAF50' : '#aaa',
              }}
            />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: 'Camera',
        }}
      />
      <Tabs.Screen
        name="memory"
        options={{
          title: 'Memory',
        }}
      />
    </Tabs>
  );
}