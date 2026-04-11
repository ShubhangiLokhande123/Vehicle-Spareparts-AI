import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView, RefreshControl } from 'react-native';
import { Session } from '@supabase/supabase-js';
import { VehicleIdentification } from '../types';
import { supabase } from '../lib/supabase';

interface HomeScreenProps {
  onStart: () => void;
  session: Session;
  onViewParts: (vehicle: VehicleIdentification) => void;
  onGoToSettings: () => void;
  onGoToSavedParts: () => void;
  onGoToHistory: () => void;
  onSignOut: () => void;
}

export default function HomeScreen({
  onStart,
  session,
  onViewParts,
  onGoToSettings,
  onGoToSavedParts,
  onGoToHistory,
  onSignOut
}: HomeScreenProps) {
  const [recentVehicles, setRecentVehicles] = useState<VehicleIdentification[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const fetchRecentVehicles = async () => {
    if (!session?.user) return;
    try {
      const { data, error } = await supabase
        .from('vehicle_identifications')
        .select('*')
        .eq('user_id', session.user.id)
        .order('created_at', { ascending: false })
        .limit(3);

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
        setRecentVehicles(formattedData);
      }
    } catch (error) {
      console.error('Error fetching recent vehicles:', error);
    }
  };

  useEffect(() => {
    fetchRecentVehicles();
  }, [session]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchRecentVehicles().then(() => setRefreshing(false));
  }, []);

  const userName = session.user.user_metadata?.full_name || session.user.email?.split('@')[0] || 'User';

  return (
    <ScrollView
      className="flex-1 bg-gray-50"
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View className="px-6 pt-6 pb-4 bg-white border-b border-gray-100 flex-row justify-between items-center">
        <View>
          <Text className="text-gray-500 text-sm font-medium">Welcome back,</Text>
          <Text className="text-2xl font-bold text-gray-900">{userName}</Text>
        </View>
        <TouchableOpacity
          onPress={onGoToSettings}
          className="bg-gray-100 p-3 rounded-full"
        >
          <Text className="text-xl">⚙️</Text>
        </TouchableOpacity>
      </View>

      <View className="p-6">
        <View className="bg-blue-600 rounded-3xl p-6 shadow-md mb-8">
          <Text className="text-white text-2xl font-bold mb-2">Identify a Vehicle</Text>
          <Text className="text-blue-100 mb-6 text-base">Take a photo to instantly identify make, model, and find compatible parts.</Text>

          <TouchableOpacity
            className="bg-white rounded-xl py-4 items-center shadow-sm"
            onPress={onStart}
          >
            <Text className="text-blue-600 font-bold text-lg">Scan Vehicle 📸</Text>
          </TouchableOpacity>
        </View>

        <View className="flex-row justify-between mb-8">
          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-2xl mr-2 shadow-sm border border-gray-100 items-center"
            onPress={onGoToSavedParts}
          >
             <Text className="text-2xl mb-2">🔖</Text>
             <Text className="font-semibold text-gray-800">Saved Parts</Text>
          </TouchableOpacity>
          <TouchableOpacity
            className="flex-1 bg-white p-4 rounded-2xl ml-2 shadow-sm border border-gray-100 items-center"
            onPress={onGoToHistory}
          >
             <Text className="text-2xl mb-2">🕒</Text>
             <Text className="font-semibold text-gray-800">History</Text>
          </TouchableOpacity>
        </View>

        <View className="mb-4 flex-row justify-between items-end">
          <Text className="text-xl font-bold text-gray-900">Recent Vehicles</Text>
          {recentVehicles.length > 0 && (
            <TouchableOpacity onPress={onGoToHistory}>
                <Text className="text-blue-600 font-medium">View All</Text>
            </TouchableOpacity>
          )}
        </View>

        {recentVehicles.length === 0 ? (
          <View className="bg-white p-8 rounded-2xl border border-gray-100 items-center justify-center border-dashed">
             <Text className="text-4xl mb-4">🚗</Text>
             <Text className="text-gray-500 text-center font-medium">Your virtual garage is empty. Scan a vehicle to get started.</Text>
          </View>
        ) : (
          recentVehicles.map((vehicle) => (
            <TouchableOpacity
              key={vehicle.identification_id}
              className="bg-white p-4 rounded-2xl mb-3 shadow-sm border border-gray-100 flex-row items-center"
              onPress={() => onViewParts(vehicle)}
            >
              <View className="w-12 h-12 bg-blue-50 rounded-xl items-center justify-center mr-4">
                 <Text className="text-xl">🚘</Text>
              </View>
              <View className="flex-1">
                <Text className="text-lg font-bold text-gray-900">{vehicle.yearStart} {vehicle.make}</Text>
                <Text className="text-gray-500">{vehicle.model} {vehicle.variant}</Text>
              </View>
              <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
          ))
        )}
      </View>
    </ScrollView>
  );
}
