import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ActivityIndicator, KeyboardAvoidingView, Platform, ScrollView } from 'react-native';

interface LoginScreenProps {
  onGoogleLogin: () => void;
  onEmailLogin: (e: string, p: string) => void;
  onEmailSignUp: (e: string, p: string) => void;
  onForgotPassword: (e: string) => void;
  authError: string | null;
  successMessage: string | null;
  loading: boolean;
}

export default function LoginScreen({
    onGoogleLogin,
    onEmailLogin,
    onEmailSignUp,
    onForgotPassword,
    authError,
    successMessage,
    loading
}: LoginScreenProps) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isSignUp, setIsSignUp] = useState(false);

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      className="flex-1"
    >
      <ScrollView contentContainerClassName="flex-grow justify-center p-6 bg-gray-50">
        <View className="items-center mb-10">
          <Text className="text-4xl font-extrabold text-blue-600 mb-2">spareparts.ai</Text>
          <Text className="text-gray-500 text-center">Intelligent Vehicle & Part Identification</Text>
        </View>

        <View className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
            {authError && (
              <View className="bg-red-50 p-3 rounded-lg mb-4 border border-red-100">
                  <Text className="text-red-600 text-sm">{authError}</Text>
              </View>
            )}

            {successMessage && (
              <View className="bg-green-50 p-3 rounded-lg mb-4 border border-green-100">
                  <Text className="text-green-600 text-sm">{successMessage}</Text>
              </View>
            )}

            <View className="mb-4">
                <Text className="text-gray-700 text-sm font-semibold mb-1 ml-1">Email</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholder="you@example.com"
                    value={email}
                    onChangeText={setEmail}
                    autoCapitalize="none"
                    keyboardType="email-address"
                />
            </View>

            <View className="mb-6">
                <Text className="text-gray-700 text-sm font-semibold mb-1 ml-1">Password</Text>
                <TextInput
                    className="bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-800"
                    placeholder="••••••••"
                    value={password}
                    onChangeText={setPassword}
                    secureTextEntry
                />
                {!isSignUp && (
                    <TouchableOpacity
                        className="mt-2 self-end"
                        onPress={() => onForgotPassword(email)}
                    >
                        <Text className="text-blue-600 text-sm font-medium">Forgot Password?</Text>
                    </TouchableOpacity>
                )}
            </View>

            <TouchableOpacity
                className="bg-blue-600 rounded-xl py-4 items-center mb-4 flex-row justify-center"
                onPress={() => isSignUp ? onEmailSignUp(email, password) : onEmailLogin(email, password)}
                disabled={loading}
            >
                {loading ? (
                    <ActivityIndicator color="white" className="mr-2" />
                ) : null}
                <Text className="text-white font-bold text-lg">
                    {isSignUp ? 'Create Account' : 'Sign In'}
                </Text>
            </TouchableOpacity>

            <View className="flex-row justify-center items-center mb-6">
                <Text className="text-gray-500">
                    {isSignUp ? 'Already have an account?' : "Don't have an account?"}
                </Text>
                <TouchableOpacity onPress={() => setIsSignUp(!isSignUp)}>
                    <Text className="text-blue-600 font-bold ml-1">
                        {isSignUp ? 'Sign In' : 'Sign Up'}
                    </Text>
                </TouchableOpacity>
            </View>

            <View className="flex-row items-center mb-6">
                <View className="flex-1 h-px bg-gray-200" />
                <Text className="text-gray-400 px-4 font-medium">OR</Text>
                <View className="flex-1 h-px bg-gray-200" />
            </View>

            <TouchableOpacity
                className="bg-white border border-gray-300 rounded-xl py-3.5 items-center flex-row justify-center"
                onPress={onGoogleLogin}
                disabled={loading}
            >
                <Text className="text-gray-700 font-semibold text-base">Continue with Google</Text>
            </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}
