import * as ImagePicker from 'expo-image-picker';
import { useRouter } from 'expo-router';
import { Camera, Images, Swords, ScanSearch } from 'lucide-react-native';
import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import type { AnalysisMode } from '@/types/analysis';

export default function HomeScreen() {
  const router = useRouter();
  const { user } = useAuth();
  const [mode, setMode] = useState<AnalysisMode>('single');

  const openCamera = () => {
    router.push({ pathname: '/camera', params: { mode } });
  };

  const pickImage = async () => {
    if (mode === 'battle') {
      const firstResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (firstResult.canceled || !firstResult.assets[0]) {
        return;
      }

      const secondResult = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        quality: 0.8,
      });

      if (secondResult.canceled || !secondResult.assets[0]) {
        return;
      }

      router.push({
        pathname: '/result',
        params: {
          mode,
          imageUriA: firstResult.assets[0].uri,
          imageUriB: secondResult.assets[0].uri,
        },
      });
      return;
    }

    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ['images'],
      quality: 0.8,
    });

    if (!result.canceled && result.assets[0]) {
      router.push({
        pathname: '/result',
        params: { imageUri: result.assets[0].uri, mode },
      });
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.logo}>CleanPick</Text>
        <Text style={styles.subtitle}>AI 식품 성분 분석기</Text>
      </View>

      <View style={styles.heroCard}>
        <ScanSearch size={48} color={BrandColors.emerald} />
        <Text style={styles.heroTitle}>
          식품 뒷면의 원재료명을{'\n'}촬영해보세요
        </Text>
        <Text style={styles.heroDesc}>
          AI가 성분을 분석하여 건강한 선택을 도와드립니다
        </Text>
      </View>

      <View style={styles.accountBanner}>
        <Text style={styles.accountTitle}>
          {user ? '로그인됨' : '비회원 모드'}
        </Text>
        <Text style={styles.accountText}>
          {user
            ? '로그인 사용자는 분석 기록이 자동 저장됩니다.'
            : '지금도 분석은 가능하고, 로그인하면 기록이 서버에 저장됩니다.'}
        </Text>
      </View>

      <View style={styles.modeSelector}>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'single' && styles.modeActive]}
          onPress={() => setMode('single')}
          activeOpacity={0.7}
        >
          <ScanSearch
            size={20}
            color={mode === 'single' ? BrandColors.white : BrandColors.emerald}
          />
          <Text
            style={[styles.modeText, mode === 'single' && styles.modeTextActive]}
          >
            단일 분석
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.modeButton, mode === 'battle' && styles.modeActive]}
          onPress={() => setMode('battle')}
          activeOpacity={0.7}
        >
          <Swords
            size={20}
            color={mode === 'battle' ? BrandColors.white : BrandColors.emerald}
          />
          <Text
            style={[styles.modeText, mode === 'battle' && styles.modeTextActive]}
          >
            A vs B 대결
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity
          style={styles.primaryButton}
          onPress={openCamera}
          activeOpacity={0.8}
        >
          <Camera size={24} color={BrandColors.white} />
          <Text style={styles.primaryButtonText}>카메라로 촬영하기</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.secondaryButton}
          onPress={pickImage}
          activeOpacity={0.8}
        >
          <Images size={24} color={BrandColors.emerald} />
          <Text style={styles.secondaryButtonText}>
            {mode === 'battle' ? '갤러리에서 두 장 고르기' : '갤러리에서 불러오기'}
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.white,
    paddingHorizontal: 24,
  },
  header: {
    alignItems: 'center',
    marginTop: 16,
  },
  logo: {
    fontSize: 32,
    fontWeight: '800',
    color: BrandColors.emerald,
    letterSpacing: -0.5,
  },
  subtitle: {
    fontSize: 14,
    color: BrandColors.gray,
    marginTop: 4,
  },
  heroCard: {
    backgroundColor: BrandColors.grayLight,
    borderRadius: 16,
    padding: 32,
    alignItems: 'center',
    marginTop: 28,
    gap: 12,
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '700',
    color: BrandColors.charcoal,
    textAlign: 'center',
    lineHeight: 28,
  },
  heroDesc: {
    fontSize: 14,
    color: BrandColors.gray,
    textAlign: 'center',
  },
  accountBanner: {
    marginTop: 18,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    backgroundColor: BrandColors.emeraldLight,
  },
  accountTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: BrandColors.emeraldDark,
  },
  accountText: {
    marginTop: 4,
    fontSize: 13,
    lineHeight: 18,
    color: BrandColors.charcoal,
  },
  modeSelector: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modeButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 2,
    borderColor: BrandColors.emerald,
    backgroundColor: BrandColors.white,
  },
  modeActive: {
    backgroundColor: BrandColors.emerald,
  },
  modeText: {
    fontSize: 15,
    fontWeight: '600',
    color: BrandColors.emerald,
  },
  modeTextActive: {
    color: BrandColors.white,
  },
  actions: {
    marginTop: 'auto',
    marginBottom: 18,
    gap: 12,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BrandColors.emerald,
    paddingVertical: 18,
    borderRadius: 16,
    shadowColor: BrandColors.emerald,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryButtonText: {
    color: BrandColors.white,
    fontSize: 17,
    fontWeight: '700',
  },
  secondaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    backgroundColor: BrandColors.white,
    paddingVertical: 18,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: BrandColors.grayBorder,
  },
  secondaryButtonText: {
    color: BrandColors.charcoal,
    fontSize: 17,
    fontWeight: '600',
  },
});
