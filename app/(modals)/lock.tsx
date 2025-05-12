import { View, Text, SafeAreaView, StyleSheet, TouchableOpacity, useAnimatedValue } from 'react-native'
import React, { useEffect, useState } from 'react'
import { useRouter } from 'expo-router';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { impactAsync, ImpactFeedbackStyle, notificationAsync, NotificationFeedbackType } from 'expo-haptics';
import Animated, { useAnimatedStyle, useSharedValue, withRepeat, withSequence, withTiming } from 'react-native-reanimated';
import * as LocalAuthentication from 'expo-local-authentication';

const Page = () => {
  const [code, setCode] = useState<number[]>([]);
  const codeLength = Array(6).fill(0);
  const router = useRouter();

  const offset = useSharedValue(0);

  const style = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: offset.value }]
    }
  });

  const OFFSET = 20;
  const TIME = 80;

  useEffect(() => {
    if (code.length === 6) {
      if (code.join('') === '123456') {
        router.replace('/');
        setCode([]);
      } else {
        offset.value = withSequence(
          withTiming(-OFFSET, { duration: TIME / 2 }),
          withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
          withTiming(0, { duration: TIME / 2 }),
        );
        notificationAsync(NotificationFeedbackType.Error);
        setCode([]);

      }
    }
  }, [code])


  const checkBiometricSupport = async () => {
    const hasHardware = await LocalAuthentication.hasHardwareAsync();
    const isEnrolled = await LocalAuthentication.isEnrolledAsync();

    if (!hasHardware) {
      console.log('No biometric hardware detected (common in emulators if not configured).');
      return false;
    }

    if (!isEnrolled) {
      console.log('No biometric enrolled. Simulate enrollment in emulator controls.');
      return false;
    }

    console.log('Biometric is supported and enrolled.');
    return true;
  };

  const onNumberPress = (number: number) => {
    impactAsync(ImpactFeedbackStyle.Light)
    setCode([...code, number]);
  }

  const numberBackspace = () => {
    impactAsync(ImpactFeedbackStyle.Light)
    setCode(code.slice(0, -1));
  }

  const onBiometricPress = async () => {
    const isSupported = await checkBiometricSupport();
    if (!isSupported) {
      alert('Biometric authentication is not available.');
      return;
    }

    const result = await LocalAuthentication.authenticateAsync();
    console.log('result', result);
    if (result.success) {
      router.replace('/');
    } else {
      offset.value = withSequence(
        withTiming(-OFFSET, { duration: TIME / 2 }),
        withRepeat(withTiming(OFFSET, { duration: TIME }), 4, true),
        withTiming(0, { duration: TIME / 2 }),
      );
      notificationAsync(NotificationFeedbackType.Error);
    }
  }

  return (
    <SafeAreaView>
      <Text style={styles.greeting}>Welcome back, Wiwatsapon</Text>
      <Animated.View style={[styles.codeView, style]}>
        {codeLength.map((_, index) => (
          <View key={index} style={[styles.codeEmpty, { backgroundColor: code[index] ? '#000' : '#ccc' }]} />
        ))}
      </Animated.View>
      <View style={styles.numbersView}>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[1, 2, 3].map((number) => (
            <TouchableOpacity key={number} onPress={() => onNumberPress(number)}>
              <Text style={styles.number}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[4, 5, 6].map((number) => (
            <TouchableOpacity key={number} onPress={() => onNumberPress(number)}>
              <Text style={styles.number}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
        <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
          {[7, 8, 9].map((number) => (
            <TouchableOpacity key={number} onPress={() => onNumberPress(number)}>
              <Text style={styles.number}>
                {number}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
          <TouchableOpacity onPress={onBiometricPress}>
            <MaterialCommunityIcons name="face-recognition" size={32} color="black" />
          </TouchableOpacity>
          <TouchableOpacity onPress={() => onNumberPress(0)}>
            <Text style={styles.number}>0</Text>
          </TouchableOpacity>
          <View style={{ minWidth: 30 }}>
            {
              code.length > 0 && (
                <TouchableOpacity onPress={numberBackspace}>
                  <MaterialCommunityIcons name="backspace-outline" size={32} color="black" />
                </TouchableOpacity>
              )
            }
          </View>
        </View>
        <Text style={{ textAlign: 'center', marginTop: 20, color: '#888' }}>
          Forgot your passcode?
        </Text>
      </View>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  greeting: {
    fontSize: 20,
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: 80,
  },
  codeView: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginVertical: 100,
    gap: 20,
  },
  codeEmpty: {
    width: 20,
    height: 20,
    borderRadius: 10,
  },
  numbersView: {
    marginHorizontal: 80,
    gap: 60,
  },
  number: {
    fontSize: 32,
  }
})

export default Page
