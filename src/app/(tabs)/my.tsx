import React, { useState } from 'react';
import { useRouter } from 'expo-router';
import {
  ActivityIndicator,
  Alert,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { deleteCurrentAccount } from '@/services/supabase/accountDeletion';
import { getSupabaseClient } from '@/services/supabase/client';

export default function MyScreen() {
  const router = useRouter();
  const { initialized, isConfigured, user } = useAuth();
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signOut = async () => {
    const supabase = getSupabaseClient();
    if (!supabase) {
      return;
    }

    setSubmitting(true);
    const { error } = await supabase.auth.signOut();
    setSubmitting(false);

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('로그아웃되었습니다.');
  };

  const confirmDeleteAccount = () => {
    Alert.alert(
      '회원탈퇴',
      '계정을 삭제하면 저장된 분석 기록과 업로드한 이미지가 함께 삭제되고 복구할 수 없습니다.',
      [
        {
          text: '취소',
          style: 'cancel',
        },
        {
          text: '회원탈퇴',
          style: 'destructive',
          onPress: () => {
            void deleteAccount();
          },
        },
      ]
    );
  };

  const deleteAccount = async () => {
    try {
      setSubmitting(true);
      setMessage(null);
      await deleteCurrentAccount();
      setMessage('회원탈퇴가 완료되었습니다.');
    } catch (error) {
      const nextMessage =
        error instanceof Error ? error.message : '회원탈퇴 처리 중 오류가 발생했습니다.';
      setMessage(nextMessage);
    } finally {
      setSubmitting(false);
    }
  };

  if (!initialized) {
    return (
      <SafeAreaView style={styles.centered}>
        <ActivityIndicator size="large" color={BrandColors.emerald} />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.scrollContent}>
        <Text style={styles.title}>내 정보</Text>
        <Text style={styles.subtitle}>
          비회원으로도 분석은 가능하고, 로그인하면 기록이 계정 기준으로 저장됩니다.
        </Text>

        <View style={styles.card}>
          <Text style={styles.sectionTitle}>계정 상태</Text>
          {!isConfigured ? (
            <Text style={styles.helperText}>현재 로그인 기능이 비활성화되어 있습니다.</Text>
          ) : user ? (
            <>
              <Text style={styles.helperText}>현재 로그인: {user.email ?? user.id}</Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={signOut}
                disabled={submitting}
              >
                <Text style={styles.primaryButtonText}>로그아웃</Text>
              </TouchableOpacity>
              <Text style={styles.helperText}>
                회원탈퇴 시 저장된 분석 기록과 업로드 이미지가 함께 삭제됩니다.
              </Text>
              <TouchableOpacity
                style={styles.dangerButton}
                onPress={confirmDeleteAccount}
                disabled={submitting}
              >
                <Text style={styles.dangerButtonText}>
                  {submitting ? '처리 중...' : '회원탈퇴'}
                </Text>
              </TouchableOpacity>
            </>
          ) : (
            <>
              <Text style={styles.helperText}>
                로그인하지 않아도 분석은 가능하지만 기록 탭과 서버 저장은 로그인 후 사용할 수 있습니다.
              </Text>
              <TouchableOpacity
                style={styles.primaryButton}
                onPress={() => router.push('/auth/sign-in')}
              >
                <Text style={styles.primaryButtonText}>로그인</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={styles.secondaryButton}
                onPress={() => router.push('/auth/sign-up')}
              >
                <Text style={styles.secondaryButtonText}>회원가입</Text>
              </TouchableOpacity>
            </>
          )}

          {message ? <Text style={styles.message}>{message}</Text> : null}
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.grayLight,
  },
  centered: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: BrandColors.white,
  },
  scrollContent: {
    padding: 20,
    gap: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: '800',
    color: BrandColors.charcoal,
  },
  subtitle: {
    color: BrandColors.gray,
    lineHeight: 20,
  },
  card: {
    backgroundColor: BrandColors.white,
    borderRadius: 20,
    padding: 20,
    gap: 12,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: BrandColors.charcoal,
  },
  helperText: {
    color: BrandColors.gray,
    lineHeight: 20,
  },
  primaryButton: {
    backgroundColor: BrandColors.emerald,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: BrandColors.white,
    fontWeight: '700',
    fontSize: 16,
  },
  secondaryButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: BrandColors.grayBorder,
  },
  secondaryButtonText: {
    color: BrandColors.charcoal,
    fontWeight: '700',
    fontSize: 16,
  },
  dangerButton: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    backgroundColor: BrandColors.redLight,
  },
  dangerButtonText: {
    color: BrandColors.red,
    fontWeight: '700',
    fontSize: 16,
  },
  message: {
    color: BrandColors.emeraldDark,
    lineHeight: 20,
  },
});
