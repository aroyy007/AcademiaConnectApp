import { Platform } from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';

export interface ImagePickerResult {
  uri: string;
  type: string;
  name: string;
  size: number;
  file?: File; // For web compatibility
}

export interface DocumentPickerResult {
  uri: string;
  type: string;
  name: string;
  size: number;
  file?: File; // For web compatibility
}

/**
 * Pick an image from the device's gallery or camera
 */
export const pickImage = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
  allowsMultipleSelection?: boolean;
}): Promise<ImagePickerResult | null> => {
  if (Platform.OS === 'web') {
    return pickImageWeb();
  }

  const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access media library is required!');
  }

  const result = await ImagePicker.launchImageLibraryAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ FIXED
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: options?.quality ?? 0.8,
    allowsMultipleSelection: options?.allowsMultipleSelection ?? false,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `image_${Date.now()}.jpg`,
    size: asset.fileSize || 0,
  };
};

/**
 * Take a photo using the device's camera
 */
export const takePhoto = async (options?: {
  allowsEditing?: boolean;
  aspect?: [number, number];
  quality?: number;
}): Promise<ImagePickerResult | null> => {
  if (Platform.OS === 'web') {
    throw new Error('Camera is not available on web platform');
  }

  const { status } = await ImagePicker.requestCameraPermissionsAsync();
  if (status !== 'granted') {
    throw new Error('Permission to access camera is required!');
  }

  const result = await ImagePicker.launchCameraAsync({
    mediaTypes: ImagePicker.MediaTypeOptions.Images, // ✅ FIXED
    allowsEditing: options?.allowsEditing ?? true,
    aspect: options?.aspect ?? [1, 1],
    quality: options?.quality ?? 0.8,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: asset.type || 'image/jpeg',
    name: asset.fileName || `photo_${Date.now()}.jpg`,
    size: asset.fileSize || 0,
  };
};

/**
 * Pick a document/file from the device
 */
export const pickDocument = async (options?: {
  type?: string | string[];
  copyToCacheDirectory?: boolean;
  multiple?: boolean;
}): Promise<DocumentPickerResult | DocumentPickerResult[] | null> => {
  if (Platform.OS === 'web') {
    return pickDocumentWeb(options?.multiple);
  }

  const result = await DocumentPicker.getDocumentAsync({
    type: options?.type || '*/*',
    copyToCacheDirectory: options?.copyToCacheDirectory ?? true,
    multiple: options?.multiple ?? false,
  });

  if (result.canceled || !result.assets || result.assets.length === 0) {
    return null;
  }

  if (options?.multiple) {
    return result.assets.map(asset => ({
      uri: asset.uri,
      type: asset.mimeType || 'application/octet-stream',
      name: asset.name,
      size: asset.size || 0,
    }));
  }

  const asset = result.assets[0];
  return {
    uri: asset.uri,
    type: asset.mimeType || 'application/octet-stream',
    name: asset.name,
    size: asset.size || 0,
  };
};

/**
 * Web-specific image picker implementation
 */
const pickImageWeb = (): Promise<ImagePickerResult | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = 'image/jpeg,image/png,image/jpg,image/gif,image/webp';

    input.onchange = (event: any) => {
      const file = event.target.files[0];
      if (!file) {
        resolve(null);
        return;
      }

      if (file.size > 10 * 1024 * 1024) {
        throw new Error('File size must be less than 10MB');
      }

      if (!file.type.match(/^image\/(jpeg|jpg|png|gif|webp)$/)) {
        throw new Error('Please select a valid image file (JPG, PNG, GIF, WebP)');
      }

      const uri = URL.createObjectURL(file);
      resolve({
        uri,
        type: file.type,
        name: file.name,
        size: file.size,
        file,
      });
    };

    input.onerror = () => {
      resolve(null);
    };

    input.click();
  });
};

/**
 * Web-specific document picker implementation
 */
const pickDocumentWeb = (multiple = false): Promise<DocumentPickerResult | DocumentPickerResult[] | null> => {
  return new Promise((resolve) => {
    const input = document.createElement('input');
    input.type = 'file';
    input.multiple = multiple;
    input.accept = '*/*';

    input.onchange = (event: any) => {
      const files = Array.from(event.target.files || []) as File[];
      if (files.length === 0) {
        resolve(null);
        return;
      }

      const processFile = (file: File): DocumentPickerResult => {
        if (file.size > 50 * 1024 * 1024) {
          throw new Error('File size must be less than 50MB');
        }

        const uri = URL.createObjectURL(file);
        return {
          uri,
          type: file.type || 'application/octet-stream',
          name: file.name,
          size: file.size,
          file,
        };
      };

      try {
        if (multiple) {
          const results = files.map(processFile);
          resolve(results);
        } else {
          const result = processFile(files[0]);
          resolve(result);
        }
      } catch (error) {
        throw error;
      }
    };

    input.onerror = () => {
      resolve(null);
    };

    input.click();
  });
};

/**
 * Convert a URI to a File object for upload (mobile platforms)
 */
export const uriToFile = async (uri: string, fileName: string, mimeType: string, pickerResult?: any): Promise<File> => {
  if (Platform.OS === 'web') {
    if (pickerResult?.file) {
      return pickerResult.file;
    }

    const response = await fetch(uri);
    const blob = await response.blob();
    return new File([blob], fileName, { type: mimeType });
  }

  const response = await fetch(uri);
  const blob = await response.blob();
  return new File([blob], fileName, { type: mimeType });
};

/**
 * Validate image file constraints
 */
export const validateImageFile = (file: ImagePickerResult, maxSizeMB = 10): void => {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }

  const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
  if (!validTypes.includes(file.type.toLowerCase())) {
    throw new Error('Please select a valid image file (JPG, PNG, GIF, WebP)');
  }
};

/**
 * Validate document file constraints
 */
export const validateDocumentFile = (file: DocumentPickerResult, maxSizeMB = 50): void => {
  if (file.size > maxSizeMB * 1024 * 1024) {
    throw new Error(`File size must be less than ${maxSizeMB}MB`);
  }
};

/**
 * Show image picker options (mobile only)
 */
export const showImagePickerOptions = (): Promise<'camera' | 'gallery' | null> => {
  if (Platform.OS === 'web') {
    return Promise.resolve('gallery');
  }

  return new Promise((resolve) => {
    resolve('gallery'); // Replace with ActionSheet if needed
  });
};