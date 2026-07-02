import React from 'react';
import {NavigationContainer} from '@react-navigation/native';
import {createNativeStackNavigator} from '@react-navigation/native-stack';
import {
  CameraScreen,
  EditScreen,
  HomeScreen,
  MediaPreviewScreen,
  SceneSelectScreen,
  SplashScreen,
  TripodConnectScreen,
} from '../screens';
import type {RootStackParamList} from '../types/navigation';

const Stack = createNativeStackNavigator<RootStackParamList>();

export function RootNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="Splash"
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
        }}>
        <Stack.Screen name="Splash" component={SplashScreen} />
        <Stack.Screen name="Home" component={HomeScreen} />
        <Stack.Screen name="SceneSelect" component={SceneSelectScreen} />
        <Stack.Screen name="TripodConnect" component={TripodConnectScreen} />
        <Stack.Screen name="Camera" component={CameraScreen} />
        <Stack.Screen name="MediaPreview" component={MediaPreviewScreen} />
        <Stack.Screen name="Edit" component={EditScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
