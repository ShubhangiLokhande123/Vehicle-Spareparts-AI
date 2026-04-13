import React, { useEffect, useRef } from 'react';
import { View, Text, Animated, Easing } from 'react-native';

interface ProcessingScreenProps {
  title?: string;
  subtitle?: string;
}

export default function ProcessingScreen({
    title = "Analyzing Image...",
    subtitle = "Our AI is crunching the details"
}: ProcessingScreenProps) {
  const pulseAnim = useRef(new Animated.Value(1)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Pulse animation
    Animated.loop(
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 1000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Rotate animation
    Animated.loop(
        Animated.timing(rotateAnim, {
            toValue: 1,
            duration: 3000,
            easing: Easing.linear,
            useNativeDriver: true,
        })
    ).start();
  }, []);

  const spin = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '360deg']
  });

  return (
    <View className="flex-1 bg-white justify-center items-center p-6">
      <View className="items-center mb-12 relative justify-center">
          {/* Outer rotating ring */}
          <Animated.View
            className="absolute w-40 h-40 border-4 border-blue-100 rounded-full border-t-blue-500"
            style={{ transform: [{ rotate: spin }] }}
          />

          {/* Inner pulsing icon */}
          <Animated.View style={{ transform: [{ scale: pulseAnim }] }}>
            <View className="w-24 h-24 bg-blue-600 rounded-full items-center justify-center shadow-lg shadow-blue-500/50">
                <Text className="text-4xl">✨</Text>
            </View>
          </Animated.View>
      </View>

      <Text className="text-2xl font-bold text-gray-900 mb-2 text-center">{title}</Text>
      <Text className="text-gray-500 text-center text-lg">{subtitle}</Text>
    </View>
  );
}
