import { CameraView, useCameraPermissions } from 'expo-camera';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { FlipHorizontal, Zap, ZapOff } from 'lucide-react-native';
import React, { useRef, useState } from 'react';
import {
  ActivityIndicator,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';

import { BrandColors } from '@/constants/theme';
import type { AnalysisMode } from '@/types/analysis';

export default function CameraScreen() {
  const router = useRouter();
  const { mode, imageUriA } = useLocalSearchParams<{
    mode: AnalysisMode;
    imageUriA?: string;
  }>();
  const [permission, requestPermission] = useCameraPermissions();
  const [facing, setFacing] = useState<'back' | 'front'>('back');
  const [flash, setFlash] = useState(false);
  const [capturing, setCapturing] = useState(false);
  const cameraRef = useRef<CameraView>(null);
  const isBattleMode = mode === 'battle';
  const hasFirstBattleImage = Boolean(imageUriA);
  const guideMessage = isBattleMode
    ? hasFirstBattleImage
      ? '두 번째 제품의 원재료명을\n박스 안에 맞춰주세요'
      : '첫 번째 제품의 원재료명을\n박스 안에 맞춰주세요'
    : '원재료명 텍스트를\n이 박스 안에 맞춰주세요';

  if (!permission) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color={BrandColors.emerald} />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.centered}>
        <Text style={styles.permissionText}>
          카메라 접근 권한이 필요합니다
        </Text>
        <TouchableOpacity style={styles.permissionButton} onPress={requestPermission}>
          <Text style={styles.permissionButtonText}>권한 허용하기</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const takePicture = async () => {
    if (!cameraRef.current || capturing) return;
    setCapturing(true);
    try {
      const photo = await cameraRef.current.takePictureAsync({
        quality: 0.8,
      });
      if (photo) {
        if (isBattleMode && !hasFirstBattleImage) {
          router.replace({
            pathname: '/camera',
            params: {
              mode: 'battle',
              imageUriA: photo.uri,
            },
          });
          return;
        }

        if (isBattleMode) {
          router.replace({
            pathname: '/result',
            params: {
              mode: 'battle',
              imageUriA: imageUriA ?? '',
              imageUriB: photo.uri,
            },
          });
          return;
        }

        router.replace({
          pathname: '/result',
          params: { imageUri: photo.uri, mode: mode ?? 'single' },
        });
      }
    } finally {
      setCapturing(false);
    }
  };

  return (
    <View style={styles.container}>
      <CameraView
        ref={cameraRef}
        style={styles.camera}
        facing={facing}
        enableTorch={flash}
      >
        {isBattleMode ? (
          <View style={styles.modeBadge}>
            <Text style={styles.modeBadgeText}>
              {hasFirstBattleImage ? '제품 B 촬영' : '제품 A 촬영'}
            </Text>
          </View>
        ) : null}

        <View style={styles.overlay}>
          <View style={styles.guideBox}>
            <Text style={styles.guideText}>{guideMessage}</Text>
          </View>
        </View>

        <View style={styles.controls}>
          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFlash((f) => !f)}
          >
            {flash ? (
              <Zap size={24} color="#fff" />
            ) : (
              <ZapOff size={24} color="#fff" />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.captureButton}
            onPress={takePicture}
            disabled={capturing}
            activeOpacity={0.7}
          >
            {capturing ? (
              <ActivityIndicator color={BrandColors.emerald} />
            ) : (
              <View style={styles.captureInner} />
            )}
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.controlButton}
            onPress={() => setFacing((f) => (f === 'back' ? 'front' : 'back'))}
          >
            <FlipHorizontal size={24} color="#fff" />
          </TouchableOpacity>
        </View>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: BrandColors.white,
    padding: 24,
    gap: 16,
  },
  permissionText: {
    fontSize: 18,
    fontWeight: '600',
    color: BrandColors.charcoal,
    textAlign: 'center',
  },
  permissionButton: {
    backgroundColor: BrandColors.emerald,
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 12,
  },
  permissionButtonText: {
    color: BrandColors.white,
    fontSize: 16,
    fontWeight: '700',
  },
  camera: {
    flex: 1,
  },
  modeBadge: {
    position: 'absolute',
    top: 18,
    alignSelf: 'center',
    zIndex: 2,
    backgroundColor: 'rgba(0, 0, 0, 0.6)',
    borderRadius: 999,
    paddingHorizontal: 16,
    paddingVertical: 8,
  },
  modeBadgeText: {
    color: '#fff',
    fontSize: 14,
    fontWeight: '700',
  },
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  guideBox: {
    width: '86%',
    aspectRatio: 1.05,
    borderWidth: 2,
    borderColor: 'rgba(16, 185, 129, 0.8)',
    borderRadius: 12,
    borderStyle: 'dashed',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
  },
  guideText: {
    color: 'rgba(255, 255, 255, 0.9)',
    fontSize: 15,
    fontWeight: '600',
    textAlign: 'center',
    lineHeight: 22,
  },
  controls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingBottom: 50,
    paddingHorizontal: 24,
  },
  controlButton: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 4,
    borderColor: '#fff',
  },
  captureInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#fff',
  },
});
