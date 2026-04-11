import React from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Vehicle } from '../types';

interface ResultsListScreenProps {
  results: Vehicle[];
  onConfirm: (vehicle: Vehicle) => void;
  onReject: () => void;
  onBack: () => void;
}

export default function ResultsListScreen({ results, onConfirm, onReject, onBack }: ResultsListScreenProps) {
  if (!results || results.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-6xl mb-4">🤷</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">No Match Found</Text>
        <Text className="text-gray-500 text-center mb-8">We couldn't clearly identify the vehicle in this image.</Text>
        <TouchableOpacity
            className="bg-blue-600 px-8 py-4 rounded-xl w-full items-center"
            onPress={onBack}
        >
            <Text className="text-white font-bold text-lg">Try Another Photo</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const primaryResult = results[0];
  const confidenceColor = primaryResult.confidenceScore > 80 ? 'text-green-600 bg-green-50 border-green-200' :
                          primaryResult.confidenceScore > 50 ? 'text-yellow-600 bg-yellow-50 border-yellow-200' :
                          'text-red-600 bg-red-50 border-red-200';

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-4 p-2 -ml-2">
           <Text className="text-gray-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Identification Result</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 mb-6">
            <View className="flex-row justify-between items-start mb-6">
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Make & Model</Text>
                    <Text className="text-3xl font-extrabold text-gray-900">{primaryResult.make}</Text>
                    <Text className="text-2xl font-bold text-gray-700">{primaryResult.model}</Text>
                </View>
                <View className={`px-3 py-1.5 rounded-lg border ${confidenceColor}`}>
                    <Text className="font-bold">{primaryResult.confidenceScore}% Match</Text>
                </View>
            </View>

            <View className="flex-row border-t border-gray-100 pt-6">
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Generation</Text>
                    <Text className="text-lg font-bold text-gray-800">{primaryResult.yearStart} - {primaryResult.yearEnd}</Text>
                </View>
                <View className="flex-1">
                    <Text className="text-sm font-semibold text-gray-400 uppercase tracking-wider mb-1">Variant</Text>
                    <Text className="text-lg font-bold text-gray-800">{primaryResult.variant}</Text>
                </View>
            </View>
        </View>

        <View className="bg-blue-50 p-4 rounded-xl border border-blue-100 mb-8 flex-row items-start">
            <Text className="text-xl mr-3 mt-0.5">ℹ️</Text>
            <Text className="text-blue-800 flex-1 leading-5 text-sm">
                Confirm this is the correct vehicle to explore its specific parts catalog.
            </Text>
        </View>

        <View className="space-y-4">
            <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl items-center shadow-md mb-4"
                onPress={() => onConfirm(primaryResult)}
            >
                <Text className="text-white font-bold text-lg">Yes, this is correct</Text>
            </TouchableOpacity>

            <TouchableOpacity
                className="bg-white border border-gray-300 py-4 rounded-xl items-center"
                onPress={onReject}
            >
                <Text className="text-gray-700 font-bold text-lg">No, try again</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
