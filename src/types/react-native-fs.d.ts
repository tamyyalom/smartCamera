declare module 'react-native-fs' {
  export const DocumentDirectoryPath: string;
  export function exists(path: string): Promise<boolean>;
  export function mkdir(path: string): Promise<void>;
  export function copyFile(from: string, to: string): Promise<void>;
  export function unlink(path: string): Promise<void>;
}
