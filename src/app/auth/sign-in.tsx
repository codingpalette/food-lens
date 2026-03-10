import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { BrandColors } from '@/constants/theme';
import { useAuth } from '@/providers/auth-provider';
import { getSupabaseClient } from '@/services/supabase/client';

export default function SignInScreen() {
  const router = useRouter();
  const { email: initialEmail, message: initialMessage } = useLocalSearchParams<{
    email?: string;
    message?: string;
  }>();
  const { initialized, isConfigured, user } = useAuth();
  const [email, setEmail] = useState(initialEmail ?? '');
  const [password, setPassword] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(initialMessage ?? null);

  useEffect(() => {
    if (user) {
      router.replace('/');
    }
  }, [router, user]);

  const signIn = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !isConfigured) {
      setMessage('로그인 설정을 확인해주세요.');
      return;
    }

    if (!email.trim() || !password) {
      setMessage('이메일과 비밀번호를 입력해주세요.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const { error } = await supabase.auth.signInWithPassword({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      setEmail('');
      setPassword('');
      router.replace('/');
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '로그인 처리 중 오류가 발생했습니다.');
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
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      >
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>로그인</Text>
          <Text style={styles.subtitle}>
            로그인하면 분석 기록이 계정 기준으로 저장되고 기록 탭에서 다시 볼 수 있습니다.
          </Text>

          <View style={styles.card}>
            <TextInput
              value={email}
              onChangeText={setEmail}
              placeholder="이메일"
              placeholderTextColor={BrandColors.gray}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              selectionColor={BrandColors.emerald}
              textContentType="emailAddress"
              style={styles.input}
            />
            <TextInput
              value={password}
              onChangeText={setPassword}
              placeholder="비밀번호"
              placeholderTextColor={BrandColors.gray}
              secureTextEntry
              autoCorrect={false}
              selectionColor={BrandColors.emerald}
              textContentType="password"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={signIn}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? '처리 중...' : '로그인'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/auth/sign-up')}
              disabled={submitting}
            >
              <Text style={styles.secondaryButtonText}>회원가입으로 이동</Text>
            </TouchableOpacity>

            {message ? <Text style={styles.message}>{message}</Text> : null}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BrandColors.grayLight,
  },
  flex: {
    flex: 1,
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
  input: {
    borderWidth: 1,
    borderColor: BrandColors.grayBorder,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
    backgroundColor: BrandColors.white,
    color: BrandColors.charcoal,
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
  message: {
    color: BrandColors.emeraldDark,
    lineHeight: 20,
  },
});
