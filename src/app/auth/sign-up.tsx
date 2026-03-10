import { useRouter } from 'expo-router';
import React, { useState } from 'react';
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

export default function SignUpScreen() {
  const router = useRouter();
  const { initialized, isConfigured, user } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const signUp = async () => {
    const supabase = getSupabaseClient();
    if (!supabase || !isConfigured) {
      setMessage('로그인 설정을 확인해주세요.');
      return;
    }

    if (!email.trim() || !password || !passwordConfirm) {
      setMessage('이메일, 비밀번호, 비밀번호 확인을 입력해주세요.');
      return;
    }

    if (password !== passwordConfirm) {
      setMessage('비밀번호와 비밀번호 확인이 일치하지 않습니다.');
      return;
    }

    try {
      setSubmitting(true);
      setMessage(null);

      const { error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
      });

      if (error) {
        throw error;
      }

      if (user) {
        router.replace('/');
        return;
      }

      router.replace({
        pathname: '/auth/sign-in',
        params: {
          email: email.trim(),
          message: '회원가입 요청이 완료되었습니다. 이메일 인증이 켜져 있다면 메일을 확인해주세요.',
        },
      });
    } catch (error) {
      setMessage(error instanceof Error ? error.message : '회원가입 처리 중 오류가 발생했습니다.');
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
          <Text style={styles.title}>회원가입</Text>
          <Text style={styles.subtitle}>
            계정을 만들면 분석 기록을 저장하고 다른 기기에서도 같은 계정으로 이어서 사용할 수 있습니다.
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
              textContentType="newPassword"
              style={styles.input}
            />
            <TextInput
              value={passwordConfirm}
              onChangeText={setPasswordConfirm}
              placeholder="비밀번호 확인"
              placeholderTextColor={BrandColors.gray}
              secureTextEntry
              autoCorrect={false}
              selectionColor={BrandColors.emerald}
              textContentType="newPassword"
              style={styles.input}
            />

            <TouchableOpacity
              style={styles.primaryButton}
              onPress={signUp}
              disabled={submitting}
            >
              <Text style={styles.primaryButtonText}>
                {submitting ? '처리 중...' : '회원가입'}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => router.replace('/auth/sign-in')}
              disabled={submitting}
            >
              <Text style={styles.secondaryButtonText}>로그인으로 이동</Text>
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
