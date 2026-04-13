import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, Image, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { Part } from '../types';
import { supabase } from '../lib/supabase';

interface SavedPartsScreenProps {
  session: Session;
  onViewDetails: (part: Part) => void;
  onBack: () => void;
}

export default function SavedPartsScreen({ session, onViewDetails, onBack }: SavedPartsScreenProps) {
  const [savedParts, setSavedParts] = useState<Part[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchSavedParts = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('saved_parts')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: Part[] = data.map(item => ({
          id: item.id,
          name: item.name,
          sku: item.sku,
          description: item.description,
          category: item.category,
          imageUrl: item.image_url,
        }));
        setSavedParts(formattedData);
      }
    } catch (error) {
      console.error('Error fetching saved parts:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchSavedParts();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchSavedParts().then(() => setRefreshing(false));
  }, []);

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-4 p-2 -ml-2">
           <Text className="text-gray-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Saved Parts</Text>
      </View>

      <ScrollView
        className="flex-1 p-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!loading && savedParts.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center justify-center mt-10 border-dashed">
                <Text className="text-5xl mb-4 text-gray-300">🔖</Text>
                <Text className="text-xl font-bold text-gray-800 mb-2">No Saved Parts</Text>
                <Text className="text-gray-500 text-center">Parts you star will appear here for quick access later.</Text>
            </View>
        ) : (
            savedParts.map((part) => (
                <TouchableOpacity
                    key={part.id}
                    className="bg-white rounded-2xl p-4 mb-4 shadow-sm border border-gray-100 flex-row"
                    onPress={() => onViewDetails(part)}
                >
                    <View className="w-20 h-20 bg-gray-100 rounded-xl mr-4 overflow-hidden border border-gray-200">
                        {part.imageUrl ? (
                            <Image source={{ uri: part.imageUrl }} className="w-full h-full" resizeMode="cover" />
                        ) : (
                            <View className="flex-1 items-center justify-center">
                                <Text className="text-2xl">⚙️</Text>
                            </View>
                        )}
                    </View>

                    <View className="flex-1 justify-center">
                        <Text className="text-gray-500 text-xs font-bold uppercase mb-1">{part.category}</Text>
                        <Text className="text-lg font-bold text-gray-900 mb-0.5" numberOfLines={1}>{part.name}</Text>
                        <Text className="text-gray-500 font-mono text-sm">SKU: {part.sku}</Text>
                    </View>
                    <View className="justify-center pl-2">
                         <Text className="text-gray-400 text-xl">›</Text>
                    </View>
                </TouchableOpacity>
            ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
