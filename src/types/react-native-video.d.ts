declare module 'react-native-video' {
  import type {Component} from 'react';
  import type {StyleProp, ViewStyle} from 'react-native';

  export interface VideoProperties {
    source: {uri: string};
    style?: StyleProp<ViewStyle>;
    resizeMode?: 'contain' | 'cover' | 'stretch' | 'none';
    paused?: boolean;
    muted?: boolean;
    repeat?: boolean;
    controls?: boolean;
    onError?: () => void;
  }

  export default class Video extends Component<VideoProperties> {}
}
