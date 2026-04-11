import React, { useState } from 'react';
import { View, Text, TouchableOpacity, Alert, ActivityIndicator } from 'react-native';
import * as ImagePicker from 'expo-image-picker';

interface SelectImageScreenProps {
  onImageSelected: (uri: string) => void;
  onClose: () => void;
  title?: string;
}

export default function SelectImageScreen({ onImageSelected, onClose, title = "Upload Photo" }: SelectImageScreenProps) {
  const [loading, setLoading] = useState(false);

  const requestCameraPermission = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert('Permission Denied', 'Sorry, we need camera roll permissions to make this work!');
      return false;
    }
    return true;
  };

  const handleTakePhoto = async () => {
    const hasPermission = await requestCameraPermission();
    if (!hasPermission) return;

    setLoading(true);
    try {
      let result = await ImagePicker.launchCameraAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
      Alert.alert("Error", "Could not open camera.");
    } finally {
      setLoading(false);
    }
  };

  const handlePickImage = async () => {
    setLoading(true);
    try {
      let result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [4, 3],
        quality: 0.8,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        onImageSelected(result.assets[0].uri);
      }
    } catch (error) {
       Alert.alert("Error", "Could not pick image.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-900 justify-center px-6">
      <TouchableOpacity
        className="absolute top-12 right-6 p-2 bg-gray-800 rounded-full z-10"
        onPress={onClose}
      >
        <Text className="text-white text-lg font-bold">✕</Text>
      </TouchableOpacity>

      <View className="items-center mb-12">
          <Text className="text-3xl font-bold text-white mb-2">{title}</Text>
          <Text className="text-gray-400 text-center px-4">Ensure the subject is well-lit and clearly visible in the frame.</Text>
      </View>

      <View className="space-y-4">
          <TouchableOpacity
            className="bg-blue-600 p-5 rounded-2xl flex-row items-center justify-center shadow-lg mb-4"
            onPress={handleTakePhoto}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" className="mr-2" /> : <Text className="text-2xl mr-3">📷</Text>}
            <Text className="text-white font-bold text-xl">Take Photo</Text>
          </TouchableOpacity>

          <TouchableOpacity
            className="bg-gray-800 border border-gray-700 p-5 rounded-2xl flex-row items-center justify-center shadow-lg"
            onPress={handlePickImage}
            disabled={loading}
          >
            {loading ? <ActivityIndicator color="white" className="mr-2" /> : <Text className="text-2xl mr-3">🖼️</Text>}
            <Text className="text-white font-bold text-xl">Choose from Gallery</Text>
          </TouchableOpacity>
      </View>
    </View>
  );
}
