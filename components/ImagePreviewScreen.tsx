import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';

interface ImagePreviewScreenProps {
  fileUri: string;
  onIdentify: () => void;
  onBack: () => void;
  error?: string | null;
  buttonText?: string;
}

export default function ImagePreviewScreen({
    fileUri,
    onIdentify,
    onBack,
    error,
    buttonText = "Identify Image"
}: ImagePreviewScreenProps) {
  return (
    <View className="flex-1 bg-black">
      <View className="flex-1 justify-center items-center p-4">
        <View className="w-full aspect-[4/3] rounded-3xl overflow-hidden bg-gray-900 border-2 border-gray-800 shadow-2xl relative">
            <Image
                source={{ uri: fileUri }}
                className="w-full h-full"
                resizeMode="cover"
            />
            {error && (
                <View className="absolute bottom-4 left-4 right-4 bg-red-500/90 p-4 rounded-xl backdrop-blur-md">
                    <Text className="text-white font-semibold text-center">{error}</Text>
                </View>
            )}
        </View>
      </View>

      <View className="p-6 bg-gray-900 rounded-t-3xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
          <Text className="text-white text-xl font-bold text-center mb-6">Looks good?</Text>
          <View className="flex-row space-x-4">
              <TouchableOpacity
                className="flex-1 bg-gray-800 border border-gray-700 py-4 rounded-xl items-center mr-2"
                onPress={onBack}
              >
                  <Text className="text-white font-bold text-lg">Retake</Text>
              </TouchableOpacity>

              <TouchableOpacity
                className="flex-[2] bg-blue-600 py-4 rounded-xl items-center flex-row justify-center ml-2"
                onPress={onIdentify}
              >
                  <Text className="text-white font-bold text-lg">{buttonText}</Text>
                  <Text className="ml-2 text-xl">✨</Text>
              </TouchableOpacity>
          </View>
      </View>
    </View>
  );
}
