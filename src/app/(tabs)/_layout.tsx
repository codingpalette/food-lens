import { Tabs } from 'expo-router';
import { History, House, UserRound } from 'lucide-react-native';
import React from 'react';

import { BrandColors } from '@/constants/theme';

export default function TabsLayout() {
  return (
    <Tabs
      screenOptions={{
        headerStyle: { backgroundColor: BrandColors.white },
        headerTitleStyle: { fontWeight: '700' },
        headerTintColor: BrandColors.charcoal,
        tabBarActiveTintColor: BrandColors.emerald,
        tabBarInactiveTintColor: BrandColors.gray,
        tabBarStyle: {
          height: 78,
          paddingTop: 8,
          paddingBottom: 12,
          borderTopColor: BrandColors.grayBorder,
          backgroundColor: BrandColors.white,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '700',
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: '홈',
          tabBarIcon: ({ color, size }) => <House color={color} size={size} />,
          headerShown: false,
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: '기록',
          tabBarIcon: ({ color, size }) => <History color={color} size={size} />,
        }}
      />
      <Tabs.Screen
        name="my"
        options={{
          title: '내 정보',
          tabBarIcon: ({ color, size }) => <UserRound color={color} size={size} />,
        }}
      />
    </Tabs>
  );
}
