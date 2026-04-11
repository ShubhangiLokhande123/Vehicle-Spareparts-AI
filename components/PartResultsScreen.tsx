import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image } from 'react-native';
import { Part } from '../types';

interface PartResultsScreenProps {
  results: Part[];
  onViewDetails: (part: Part) => void;
  onBack: () => void;
}

export default function PartResultsScreen({ results, onViewDetails, onBack }: PartResultsScreenProps) {

  if (!results || results.length === 0) {
    return (
      <View className="flex-1 bg-gray-50 justify-center items-center p-6">
        <Text className="text-6xl mb-4">🔍</Text>
        <Text className="text-2xl font-bold text-gray-900 mb-2">No Parts Found</Text>
        <Text className="text-gray-500 text-center mb-8">We couldn't find matching parts for this request.</Text>
        <TouchableOpacity
            className="bg-blue-600 px-8 py-4 rounded-xl w-full items-center"
            onPress={onBack}
        >
            <Text className="text-white font-bold text-lg">Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  // Group parts by category if there are multiple results (like from catalog)
  const isCatalogView = results.length > 1;

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-4 p-2 -ml-2">
           <Text className="text-gray-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">
            {isCatalogView ? 'Compatible Parts' : 'Identified Part'}
        </Text>
      </View>

      <ScrollView className="flex-1 p-4">
        {results.map((part, index) => (
          <TouchableOpacity
            key={part.id || index}
            className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row"
            onPress={() => onViewDetails(part)}
          >
            <View className="w-24 h-24 bg-gray-100 rounded-xl mr-4 overflow-hidden border border-gray-200">
               {part.imageUrl ? (
                   <Image source={{ uri: part.imageUrl }} className="w-full h-full" resizeMode="cover" />
               ) : (
                   <View className="flex-1 items-center justify-center">
                       <Text className="text-3xl">⚙️</Text>
                   </View>
               )}
            </View>

            <View className="flex-1 justify-center">
                <View className="bg-gray-100 self-start px-2 py-1 rounded md mb-1">
                    <Text className="text-gray-500 text-xs font-bold uppercase">{part.category}</Text>
                </View>
                <Text className="text-lg font-bold text-gray-900 mb-1" numberOfLines={2}>{part.name}</Text>
                <Text className="text-gray-500 font-mono text-sm">SKU: {part.sku}</Text>

                {!isCatalogView && part.confidenceScore && (
                    <Text className={`text-xs font-bold mt-2 ${part.confidenceScore > 80 ? 'text-green-600' : 'text-yellow-600'}`}>
                        {part.confidenceScore}% Match Confidence
                    </Text>
                )}
            </View>
          </TouchableOpacity>
        ))}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
