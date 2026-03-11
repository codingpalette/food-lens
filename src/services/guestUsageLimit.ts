import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = 'guest_analysis_usage';
const DAILY_LIMIT = 3;

type UsageData = {
  date: string;
  count: number;
};

type GuestUsage = {
  count: number;
  remaining: number;
  limitReached: boolean;
};

function getTodayString(): string {
  return new Date().toLocaleDateString('en-CA');
}

export async function getGuestUsage(): Promise<GuestUsage> {
  try {
    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: UsageData = JSON.parse(raw);
      if (data.date === getTodayString()) {
        const remaining = Math.max(DAILY_LIMIT - data.count, 0);
        return { count: data.count, remaining, limitReached: remaining <= 0 };
      }
    }
  } catch {
    // fail-open: 읽기 실패 시 분석 허용
  }
  return { count: 0, remaining: DAILY_LIMIT, limitReached: false };
}

export async function incrementGuestUsage(): Promise<void> {
  try {
    const today = getTodayString();
    let count = 0;

    const raw = await AsyncStorage.getItem(STORAGE_KEY);
    if (raw) {
      const data: UsageData = JSON.parse(raw);
      if (data.date === today) {
        count = data.count;
      }
    }

    await AsyncStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({ date: today, count: count + 1 })
    );
  } catch {
    // fail-open: 저장 실패 시 무시
  }
}

export { DAILY_LIMIT };
