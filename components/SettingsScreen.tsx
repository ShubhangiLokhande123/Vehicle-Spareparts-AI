import React from 'react';
import { View, Text, TouchableOpacity, ScrollView, Alert } from 'react-native';
import { Session } from '@supabase/supabase-js';

interface SettingsScreenProps {
  session: Session;
  onBack: () => void;
  onSignOut: () => void;
}

export default function SettingsScreen({ session, onBack, onSignOut }: SettingsScreenProps) {
  const userName = session.user.user_metadata?.full_name || 'User';
  const userEmail = session.user.email;

  const handleSignOutConfirm = () => {
      Alert.alert(
          "Sign Out",
          "Are you sure you want to sign out?",
          [
              { text: "Cancel", style: "cancel" },
              { text: "Sign Out", onPress: onSignOut, style: "destructive" }
          ]
      );
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="px-6 pt-12 pb-4 bg-white border-b border-gray-100 flex-row items-center">
        <TouchableOpacity onPress={onBack} className="mr-4 p-2 -ml-2">
           <Text className="text-gray-500 text-lg">← Back</Text>
        </TouchableOpacity>
        <Text className="text-xl font-bold text-gray-900">Settings</Text>
      </View>

      <ScrollView className="flex-1 p-6">
        <View className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 mb-6 items-center">
            <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center mb-4">
                <Text className="text-3xl text-blue-600 font-bold">
                    {userName.charAt(0).toUpperCase()}
                </Text>
            </View>
            <Text className="text-xl font-bold text-gray-900 mb-1">{userName}</Text>
            <Text className="text-gray-500">{userEmail}</Text>
        </View>

        <View className="bg-white rounded-2xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <TouchableOpacity className="p-4 border-b border-gray-50 flex-row justify-between items-center">
                <Text className="text-gray-800 font-medium text-lg">Account Details</Text>
                <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-4 border-b border-gray-50 flex-row justify-between items-center">
                <Text className="text-gray-800 font-medium text-lg">Notifications</Text>
                <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-4 border-b border-gray-50 flex-row justify-between items-center">
                <Text className="text-gray-800 font-medium text-lg">Privacy & Terms</Text>
                <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
            <TouchableOpacity className="p-4 flex-row justify-between items-center">
                <Text className="text-gray-800 font-medium text-lg">Help & Support</Text>
                <Text className="text-gray-400">›</Text>
            </TouchableOpacity>
        </View>

        <TouchableOpacity
            className="bg-red-50 border border-red-100 p-4 rounded-xl items-center"
            onPress={handleSignOutConfirm}
        >
            <Text className="text-red-600 font-bold text-lg">Sign Out</Text>
        </TouchableOpacity>

        <View className="items-center mt-12 mb-6">
            <Text className="text-gray-400 font-medium text-sm">spareparts.ai</Text>
            <Text className="text-gray-400 text-xs mt-1">Version 1.0.0</Text>
        </View>
      </ScrollView>
    </View>
  );
}
