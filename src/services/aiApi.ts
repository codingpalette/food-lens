import { File as ExpoFile } from 'expo-file-system';

import type { AnalysisResult, ComparisonResult } from '@/types/analysis';

const API_KEY = process.env.EXPO_PUBLIC_OPENAI_API_KEY ?? '';
const API_URL = 'https://api.openai.com/v1/responses';
const MODEL_NAME = 'gpt-4.1-mini';

function uint8ToBase64(bytes: Uint8Array): string {
  let binary = '';
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

async function imageToBase64(uri: string): Promise<string> {
  const file = new ExpoFile(uri);
  const buffer = await file.arrayBuffer();
  return uint8ToBase64(new Uint8Array(buffer));
}

function getMimeType(uri: string) {
  const sanitizedUri = uri.split('?')[0] ?? '';
  const extension = sanitizedUri.split('.').pop()?.toLowerCase();

  switch (extension) {
    case 'png':
      return 'image/png';
    case 'webp':
      return 'image/webp';
    case 'gif':
      return 'image/gif';
    default:
      return 'image/jpeg';
  }
}

async function imageToDataUrl(uri: string): Promise<string> {
  const base64 = await imageToBase64(uri);
  return `data:${getMimeType(uri)};base64,${base64}`;
}

function parseAnalysisResponse(text: string): AnalysisResult {
  try {
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    if (!jsonMatch) throw new Error('No JSON found');
    return JSON.parse(jsonMatch[0]) as AnalysisResult;
  } catch {
    throw new Error('AI 응답을 파싱할 수 없습니다. 다시 시도해주세요.');
  }
}

function extractOutputText(data: Record<string, unknown>) {
  const directText = data.output_text;
  if (typeof directText === 'string' && directText.length > 0) {
    return directText;
  }

  const output = data.output;
  if (!Array.isArray(output)) {
    throw new Error('OpenAI 응답에서 텍스트를 찾을 수 없습니다.');
  }

  const texts: string[] = [];

  for (const item of output) {
    if (!item || typeof item !== 'object') {
      continue;
    }

    const message = item as { content?: unknown };
    if (!Array.isArray(message.content)) {
      continue;
    }

    for (const contentItem of message.content) {
      if (!contentItem || typeof contentItem !== 'object') {
        continue;
      }

      const textValue = (contentItem as { text?: unknown }).text;
      if (typeof textValue === 'string' && textValue.length > 0) {
        texts.push(textValue);
      }
    }
  }

  if (texts.length === 0) {
    throw new Error('OpenAI 응답에서 텍스트를 찾을 수 없습니다.');
  }

  return texts.join('\n');
}

async function callOpenAI(
  imageDataUrl: string,
  prompt: string
): Promise<string> {
  if (!API_KEY) {
    throw new Error('OpenAI API 키가 설정되지 않았습니다.');
  }

  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${API_KEY}`,
    },
    body: JSON.stringify({
      model: MODEL_NAME,
      max_output_tokens: 2048,
      text: {
        format: {
          type: 'json_object',
        },
      },
      input: [
        {
          role: 'user',
          content: [
            {
              type: 'input_text',
              text: prompt,
            },
            {
              type: 'input_image',
              image_url: imageDataUrl,
              detail: 'high',
            },
          ],
        },
      ],
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`API 호출 실패: ${response.status} - ${error}`);
  }

  const data = await response.json();
  return extractOutputText(data as Record<string, unknown>);
}

const SINGLE_PROMPT = `이 식품 라벨/원재료명 이미지를 분석해주세요. 반드시 아래 JSON 형식으로만 응답하세요. JSON 외의 텍스트는 포함하지 마세요.

{
  "productName": "제품명 (이미지에서 추출하거나 원재료로 추정)",
  "overallScore": 7,
  "summary": "한 줄 요약 평가",
  "goodIngredients": [
    {"name": "성분명", "status": "good", "description": "이 성분이 좋은 이유"}
  ],
  "cautionIngredients": [
    {"name": "성분명", "status": "caution", "description": "주의가 필요한 이유"}
  ],
  "details": {
    "sugar": "당류 정보",
    "sodium": "나트륨 정보",
    "additives": "첨가물 수",
    "calories": "칼로리 정보"
  }
}

점수 기준: 10점(매우 건강) ~ 1점(매우 불건강). 한국어로 작성하세요.`;

const COMPARE_PROMPT = `두 식품의 원재료명/라벨을 비교 분석해주세요. 이 이미지는 제품 A입니다. 반드시 아래 JSON 형식으로만 응답하세요.

{
  "productName": "제품명",
  "overallScore": 7,
  "summary": "한 줄 요약",
  "goodIngredients": [
    {"name": "성분명", "status": "good", "description": "좋은 이유"}
  ],
  "cautionIngredients": [
    {"name": "성분명", "status": "caution", "description": "주의 이유"}
  ],
  "details": {
    "sugar": "당류",
    "sodium": "나트륨",
    "additives": "첨가물 수",
    "calories": "칼로리"
  }
}

한국어로 작성하세요.`;

export async function analyzeSingleProduct(
  imageUri: string
): Promise<AnalysisResult> {
  const imageDataUrl = await imageToDataUrl(imageUri);
  const responseText = await callOpenAI(imageDataUrl, SINGLE_PROMPT);
  return parseAnalysisResponse(responseText);
}

export async function compareProducts(
  imageUriA: string,
  imageUriB: string
): Promise<ComparisonResult> {
  const [resultA, resultB] = await Promise.all([
    (async () => {
      const imageDataUrl = await imageToDataUrl(imageUriA);
      const text = await callOpenAI(imageDataUrl, COMPARE_PROMPT);
      return parseAnalysisResponse(text);
    })(),
    (async () => {
      const imageDataUrl = await imageToDataUrl(imageUriB);
      const text = await callOpenAI(imageDataUrl, COMPARE_PROMPT);
      return parseAnalysisResponse(text);
    })(),
  ]);

  const winner = resultA.overallScore >= resultB.overallScore ? 'A' : 'B';
  const winnerProduct = winner === 'A' ? resultA : resultB;

  return {
    productA: resultA,
    productB: resultB,
    winner,
    winnerReason: `${winnerProduct.productName}이(가) 전체 점수 ${winnerProduct.overallScore}/10으로 더 우수합니다.`,
  };
}
