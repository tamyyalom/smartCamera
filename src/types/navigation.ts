import type {NativeStackScreenProps} from '@react-navigation/native-stack';

export type RootStackParamList = {
  Splash: undefined;
  Home: undefined;
  SceneSelect: {mode: 'photo' | 'video'};
  TripodConnect: {sceneId: string; mode: 'photo' | 'video'};
  Camera: {sceneId: string; mode: 'photo' | 'video'};
  MediaPreview: {fileId: string};
  Edit: {fileId: string};
};

export type RootStackScreenProps<T extends keyof RootStackParamList> =
  NativeStackScreenProps<RootStackParamList, T>;
