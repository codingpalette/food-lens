import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import React from 'react';

import { BrandColors } from '@/constants/theme';
import { AuthProvider } from '@/providers/auth-provider';

export default function RootLayout() {
  return (
    <AuthProvider>
      <StatusBar style="dark" />
      <Stack
        screenOptions={{
          headerStyle: { backgroundColor: BrandColors.white },
          headerTintColor: BrandColors.charcoal,
          headerTitleStyle: { fontWeight: '600' },
          contentStyle: { backgroundColor: BrandColors.white },
        }}
      >
        <Stack.Screen
          name="(tabs)"
          options={{ headerShown: false }}
        />
        <Stack.Screen
          name="camera"
          options={{
            title: '촬영',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            title: '분석 결과',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="history/[id]"
          options={{
            title: '기록 상세',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="auth/sign-in"
          options={{
            title: '로그인',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
        <Stack.Screen
          name="auth/sign-up"
          options={{
            title: '회원가입',
            headerBackButtonDisplayMode: 'minimal',
          }}
        />
      </Stack>
    </AuthProvider>
  );
}
