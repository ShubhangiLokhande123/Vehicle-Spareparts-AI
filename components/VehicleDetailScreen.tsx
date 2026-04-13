import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { VehicleIdentification, Part } from '../types';

interface VehicleDetailScreenProps {
  vehicle: VehicleIdentification;
  onScanPart: () => void;
  onBrowseCatalog: () => void;
  onBack: () => void;
  onViewPartDetail: (part: Part) => void;
}

export default function VehicleDetailScreen({
    vehicle,
    onScanPart,
    onBrowseCatalog,
    onBack,
    onViewPartDetail
}: VehicleDetailScreenProps) {

  // Create a placeholder image URL based on make and model
  const placeholderImageUrl = `https://placehold.co/800x400.png?text=${vehicle.make}+${vehicle.model}`;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-4 pt-12 pb-4 bg-white flex-row items-center absolute top-0 left-0 right-0 z-10 bg-transparent">
        <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
        >
           <Text className="text-white text-xl font-bold">←</Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" bounces={false}>
        <View className="w-full h-72 bg-gray-200">
            <Image
                source={{ uri: vehicle.localImageUri || vehicle.image_storage_path || placeholderImageUrl }}
                className="w-full h-full"
                resizeMode="cover"
            />
            <View className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
            <View className="absolute bottom-6 left-6 right-6">
                <View className="bg-blue-600 self-start px-3 py-1 rounded-full mb-3">
                    <Text className="text-white text-xs font-bold uppercase tracking-wider">{vehicle.yearStart}-{vehicle.yearEnd}</Text>
                </View>
                <Text className="text-4xl font-extrabold text-white mb-1 shadow-sm">{vehicle.make}</Text>
                <Text className="text-2xl font-bold text-gray-200">{vehicle.model} {vehicle.variant}</Text>
            </View>
        </View>

        <View className="p-6">
            <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 flex-row justify-between">
                <View className="items-center flex-1 border-r border-gray-100">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Status</Text>
                    <Text className="text-green-600 font-bold">Confirmed</Text>
                </View>
                <View className="items-center flex-1">
                    <Text className="text-gray-400 text-xs font-bold uppercase mb-1">Added On</Text>
                    <Text className="text-gray-800 font-bold">
                        {new Date(vehicle.created_at).toLocaleDateString()}
                    </Text>
                </View>
            </View>

            <Text className="text-xl font-bold text-gray-900 mb-4 px-1">Find Parts</Text>

            <View className="space-y-4">
                <TouchableOpacity
                    className="bg-blue-600 p-5 rounded-2xl flex-row items-center shadow-sm mb-4"
                    onPress={onBrowseCatalog}
                >
                    <View className="w-12 h-12 bg-blue-500 rounded-xl items-center justify-center mr-4">
                        <Text className="text-2xl">📚</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-white font-bold text-lg mb-0.5">Browse Catalog</Text>
                        <Text className="text-blue-100 text-sm">View all compatible parts for this vehicle</Text>
                    </View>
                    <Text className="text-white text-xl">›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    className="bg-white border-2 border-blue-100 p-5 rounded-2xl flex-row items-center shadow-sm"
                    onPress={onScanPart}
                >
                    <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                        <Text className="text-2xl">📸</Text>
                    </View>
                    <View className="flex-1">
                        <Text className="text-blue-900 font-bold text-lg mb-0.5">Identify a Part</Text>
                        <Text className="text-blue-600/70 text-sm">Take a photo of a specific component</Text>
                    </View>
                    <Text className="text-blue-600 text-xl">›</Text>
                </TouchableOpacity>
            </View>
        </View>
      </ScrollView>
    </View>
  );
}
