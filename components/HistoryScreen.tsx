import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl, Image } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { VehicleIdentification } from '../types';
import { supabase } from '../lib/supabase';

interface HistoryScreenProps {
  session: Session;
  onViewVehicle: (vehicle: VehicleIdentification) => void;
  onBack: () => void;
}

export default function HistoryScreen({ session, onViewVehicle, onBack }: HistoryScreenProps) {
  const [history, setHistory] = useState<VehicleIdentification[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('vehicle_identifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false });

      if (error) throw error;

      if (data) {
        const formattedData: VehicleIdentification[] = data.map(item => ({
          identification_id: item.id,
          created_at: item.created_at,
          user_confirmed: item.user_confirmed,
          make: item.identified_make,
          model: item.identified_model,
          yearStart: item.identified_year_start,
          yearEnd: item.identified_year_end,
          variant: item.identified_variant,
          confidenceScore: item.ai_confidence_score,
          image_storage_path: item.image_storage_path
        }));
        setHistory(formattedData);
      }
    } catch (error) {
      console.error('Error fetching history:', error);
    } finally {
        setLoading(false);
    }
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchHistory().then(() => setRefreshing(false));
  }, []);

  const formatDate = (dateString: string) => {
      const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'short', day: 'numeric' };
      return new Date(dateString).toLocaleDateString(undefined, options);
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center justify-between z-10">
        <View className="flex-row items-center">
            <TouchableOpacity onPress={onBack} className="mr-4 p-2 -ml-2">
               <Text className="text-gray-500 text-lg">←</Text>
            </TouchableOpacity>
            <Text className="text-xl font-bold text-gray-900">Virtual Garage</Text>
        </View>
        <Text className="text-gray-400 font-medium">{history.length} Vehicles</Text>
      </View>

      <ScrollView
        className="flex-1 px-4 pt-4"
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} />}
      >
        {!loading && history.length === 0 ? (
            <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center justify-center mt-10 border-dashed">
                <Text className="text-5xl mb-4 text-gray-300">🚘</Text>
                <Text className="text-xl font-bold text-gray-800 mb-2">Garage is Empty</Text>
                <Text className="text-gray-500 text-center">Vehicles you identify will be saved here automatically.</Text>
            </View>
        ) : (
            history.map((vehicle) => (
                <TouchableOpacity
                    key={vehicle.identification_id}
                    className="bg-white rounded-2xl mb-4 shadow-sm border border-gray-100 overflow-hidden"
                    onPress={() => onViewVehicle(vehicle)}
                >
                    <View className="flex-row">
                        <View className="w-28 h-28 bg-gray-200">
                            {vehicle.image_storage_path ? (
                                <Image
                                    source={{ uri: vehicle.image_storage_path }}
                                    className="w-full h-full"
                                    resizeMode="cover"
                                />
                            ) : (
                                <View className="flex-1 items-center justify-center bg-blue-50">
                                    <Text className="text-3xl">🚘</Text>
                                </View>
                            )}
                            <View className="absolute top-2 left-2 bg-black/60 px-2 py-0.5 rounded backdrop-blur-sm">
                                <Text className="text-white text-xs font-bold">{vehicle.yearStart}</Text>
                            </View>
                        </View>
                        <View className="flex-1 p-3 justify-between">
                            <View>
                                <Text className="text-lg font-bold text-gray-900 leading-tight mb-0.5" numberOfLines={1}>
                                    {vehicle.make}
                                </Text>
                                <Text className="text-gray-600 font-medium text-sm" numberOfLines={1}>
                                    {vehicle.model} {vehicle.variant}
                                </Text>
                            </View>
                            <View className="flex-row justify-between items-end">
                                <Text className="text-gray-400 text-xs">
                                    Added {formatDate(vehicle.created_at)}
                                </Text>
                                <View className={`px-2 py-1 rounded ${vehicle.user_confirmed ? 'bg-green-100' : 'bg-yellow-100'}`}>
                                    <Text className={`text-[10px] font-bold uppercase ${vehicle.user_confirmed ? 'text-green-700' : 'text-yellow-700'}`}>
                                        {vehicle.user_confirmed ? 'Confirmed' : 'Pending'}
                                    </Text>
                                </View>
                            </View>
                        </View>
                    </View>
                </TouchableOpacity>
            ))
        )}
        <View className="h-10" />
      </ScrollView>
    </View>
  );
}
