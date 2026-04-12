import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, Alert } from 'react-native';
import { Part } from '../types';
import { supabase } from '../lib/supabase';

interface PartDetailScreenProps {
  part: Part;
  onBack: () => void;
}

export default function PartDetailScreen({ part, onBack }: PartDetailScreenProps) {
  const [isSaved, setIsSaved] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
      checkIfSaved();
  }, [part.sku]);

  const checkIfSaved = async () => {
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) return;

          const { data, error } = await supabase
              .from('saved_parts')
              .select('id')
              .eq('user_id', session.user.id)
              .eq('sku', part.sku)
              .maybeSingle();

          if (data) {
              setIsSaved(true);
          }
      } catch (error) {
          console.error("Error checking saved state:", error);
      }
  };

  const handleToggleSave = async () => {
      setLoading(true);
      try {
          const { data: { session } } = await supabase.auth.getSession();
          if (!session?.user) {
              Alert.alert("Authentication Required", "Please sign in to save parts.");
              setLoading(false);
              return;
          }

          if (isSaved) {
              const { error } = await supabase
                  .from('saved_parts')
                  .delete()
                  .eq('user_id', session.user.id)
                  .eq('sku', part.sku);

              if (!error) setIsSaved(false);
          } else {
              const { error } = await supabase
                  .from('saved_parts')
                  .insert({
                      user_id: session.user.id,
                      name: part.name,
                      sku: part.sku,
                      description: part.description,
                      category: part.category,
                      image_url: part.imageUrl
                  });

              if (!error) setIsSaved(true);
          }
      } catch (error) {
          console.error("Error saving part:", error);
          Alert.alert("Error", "Failed to update saved parts.");
      } finally {
          setLoading(false);
      }
  };

  return (
    <View className="flex-1 bg-white">
      <View className="px-4 pt-12 pb-4 flex-row items-center justify-between absolute top-0 left-0 right-0 z-10 bg-transparent">
        <TouchableOpacity
            onPress={onBack}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
        >
           <Text className="text-white text-xl font-bold">←</Text>
        </TouchableOpacity>

        <TouchableOpacity
            onPress={handleToggleSave}
            disabled={loading}
            className="w-10 h-10 bg-black/50 rounded-full items-center justify-center backdrop-blur-md"
        >
           <Text className={`text-xl ${isSaved ? 'text-blue-400' : 'text-white'}`}>
               {isSaved ? '★' : '☆'}
           </Text>
        </TouchableOpacity>
      </View>

      <ScrollView className="flex-1" bounces={false}>
        <View className="w-full h-80 bg-gray-100 items-center justify-center pt-8">
            {part.imageUrl ? (
                <Image
                    source={{ uri: part.imageUrl }}
                    className="w-full h-full"
                    resizeMode="contain"
                />
            ) : (
                <Text className="text-6xl text-gray-300">⚙️</Text>
            )}
        </View>

        <View className="p-6 -mt-6 bg-white rounded-t-3xl shadow-lg">
            <View className="flex-row items-center justify-between mb-2">
                <View className="bg-blue-100 px-3 py-1 rounded-full">
                    <Text className="text-blue-800 text-xs font-bold uppercase">{part.category}</Text>
                </View>
                {part.confidenceScore && (
                    <Text className="text-green-600 font-bold text-sm">
                        {part.confidenceScore}% AI Confidence
                    </Text>
                )}
            </View>

            <Text className="text-3xl font-extrabold text-gray-900 mb-2 leading-tight">{part.name}</Text>

            <View className="flex-row items-center mb-6 bg-gray-50 self-start px-4 py-2 rounded-xl border border-gray-200">
                <Text className="text-gray-500 font-semibold mr-2">SKU</Text>
                <Text className="text-gray-900 font-mono font-bold text-lg">{part.sku}</Text>
            </View>

            <View className="mb-8">
                <Text className="text-xl font-bold text-gray-900 mb-3">Description</Text>
                <Text className="text-gray-600 leading-relaxed text-base">
                    {part.description || 'No detailed description available for this part.'}
                </Text>
            </View>

            <TouchableOpacity
                className="bg-blue-600 py-4 rounded-xl items-center shadow-md flex-row justify-center"
            >
                <Text className="text-white font-bold text-lg mr-2">Find Retailers</Text>
                <Text className="text-lg">🛒</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </View>
  );
}
