import * as ImageManipulator from 'expo-image-manipulator';

export const compressImage = async (uri: string) => {
  try {
    const manipulatedImage = await ImageManipulator.manipulateAsync(
      uri,
      [{ resize: { width: 500 } }],
      { compress: 0.7, format: ImageManipulator.SaveFormat.JPEG }
    );
    return manipulatedImage;
  } catch (error) {
    throw new Error('Error compressing image');
  }
};

export const validateImage = (fileSize: number, fileType: string) => {
  const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
  const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/jpg'];

  if (fileSize > MAX_FILE_SIZE) {
    throw new Error('File size too large. Maximum size is 5MB');
  }

  if (!ALLOWED_TYPES.includes(fileType)) {
    throw new Error('Invalid file type. Only JPEG and PNG are allowed');
  }
};