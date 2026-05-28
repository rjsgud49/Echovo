# Echovo — 트러블슈팅 기록

> AI 기반 모의 면접 연습 서비스 **Echovo** 개발 중 마주친 핵심 문제들과 해결 과정을 정리한 문서입니다.

---

## 목차

1. [SpeechRecognition 무한 재시작 루프](#1-speechrecognition-무한-재시작-루프)
2. [이중 MediaStream 획득으로 인한 마이크 충돌](#2-이중-mediastream-획득으로-인한-마이크-충돌)
3. [MediaRecorder ondataavailable 미수신 문제](#3-mediarecorder-ondataavailable-미수신-문제)
4. [GPT 응답 파싱 불안정](#4-gpt-응답-파싱-불안정)
5. [jsPDF 한글 렌더링 깨짐](#5-jspdf-한글-렌더링-깨짐)
6. [Web Speech API TypeScript 타입 오류](#6-web-speech-api-typescript-타입-오류)
7. [localStorage 면접 기록 중복 저장](#7-localstorage-면접-기록-중복-저장)

---

## 1. SpeechRecognition 무한 재시작 루프

### 문제 상황

Web Speech API를 활용해 실시간 음성 인식(`liveTranscript`)을 구현하던 중, 브라우저의 `SpeechRecognition`이 짧은 침묵 구간에서 자동으로 `onend`를 발생시킨다는 것을 발견했다.

끊김 없는 인식을 위해 `onend` 내부에 `recognition.start()`를 넣어 자동 재시작 로직을 추가했는데, **사용자가 녹음 중지 버튼을 눌러 `stop()`을 호출한 뒤에도 `onend`가 발화**되어 인식이 다시 시작되는 문제가 생겼다. 중지 버튼을 눌러도 계속 마이크가 켜져 있는 상태가 반복되었다.

```ts
// 문제가 된 초기 코드
recognition.onend = () => {
    recognition.start(); // 항상 재시작 → 수동 중지 후에도 루프 발생
};
```

### 원인 분석

`SpeechRecognition.stop()`은 인식을 즉시 중단하지 않고 현재 처리 중인 오디오를 마저 처리한 뒤 `onend`를 발화한다. 즉, **`stop()`을 명시적으로 호출해도 `onend`는 반드시 실행**된다. 자동 재시작 로직은 이 경우를 구분하지 못했다.

### 해결 방법

`useRef`로 **사용자 의도 중지 여부를 추적하는 플래그**를 만들어, `onend`에서 플래그를 확인해 재시작 여부를 결정했다.

```ts
// InterviewBox.tsx
const isRecognitionStoppedByUser = useRef(false);

const startSpeechRecognition = () => {
    // ...
    isRecognitionStoppedByUser.current = false; // 시작 시 플래그 초기화

    recognition.onend = () => {
        if (!isRecognitionStoppedByUser.current) {
            recognition.start(); // 자동 onend → 재시작
        } else {
            recognitionRef.current = null; // 사용자 중지 → 정리
        }
    };
    recognition.start();
};

const stopSpeechRecognition = () => {
    isRecognitionStoppedByUser.current = true; // 수동 중지임을 표시
    recognitionRef.current?.stop();
};
```

### 결과

플래그 도입 후 사용자가 중지 버튼을 누르면 루프 없이 인식이 완전히 종료되고, 침묵으로 인한 자연적 `onend`에서만 재시작이 이루어졌다.

---

## 2. 이중 MediaStream 획득으로 인한 마이크 충돌

### 문제 상황

`InterviewBox` 컴포넌트에서 녹음을 시작할 때 `getUserMedia`로 스트림을 얻고, 이를 자식 컴포넌트 `Recorder`의 `start(stream)` 메서드에 전달하도록 설계했다. 그런데 실제로 **OS 마이크 표시등이 두 번 깜빡이며 두 개의 마이크 스트림이 동시에 열리는 현상**이 발생했다.

### 원인 분석

`Recorder` 컴포넌트의 `RecorderHandle` 인터페이스는 `start(stream: MediaStream)`으로 외부 스트림을 받도록 선언되어 있었지만, **실제 `start` 구현부가 인자를 무시하고 내부에서 `getUserMedia`를 다시 호출**하고 있었다.

```ts
// Recorder.tsx — 인터페이스 선언 (의도)
export interface RecorderHandle {
    start: (stream: MediaStream) => void; // 외부 스트림 수신 의도
    stop: () => void;
}

// 실제 구현 (버그)
const start = async () => {
    // stream 인자가 있지만 사용하지 않고, 또 getUserMedia 호출
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    // ...
};
```

결과적으로 `InterviewBox`에서 1개, `Recorder` 내부에서 1개, 총 2개의 독립적인 마이크 스트림이 열렸다. `SpeechRecognition`도 별도 스트림을 사용하기 때문에 세 가지 오디오 소스가 경합하는 상황이었다.

### 해결 방법

두 컴포넌트의 스트림 관리 책임을 명확히 분리했다.

- **`InterviewBox`**: `getUserMedia`로 스트림을 단 한 번만 확보하고, `SpeechRecognition`과 `Recorder` 모두에 동일 스트림 사용
- **`Recorder`**: 외부에서 전달받은 `stream`을 `MediaRecorder`에 직접 주입하고, 내부 `getUserMedia` 제거

```ts
// InterviewBox.tsx — 스트림 한 번만 획득
const startRecording = async () => {
    const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
    streamRef.current = stream;

    startSpeechRecognition(); // SpeechRecognition은 자체 스트림 사용
    recorderRef.current?.start(stream); // Recorder에 스트림 전달
};

// Recorder.tsx — 외부 스트림 수신으로 변경
const start = (stream: MediaStream) => {
    const recorder = new MediaRecorder(stream, { mimeType: 'audio/webm' });
    // getUserMedia 제거
    // ...
};
```

또한 `stopRecording` 시 스트림 해제 책임도 `InterviewBox` 한 곳에서만 하도록 정리하여 중복 `track.stop()` 호출을 방지했다.

### 결과

마이크 스트림이 하나만 열리고, 스트림 생명주기를 단일 위치에서 관리하게 되어 예측 가능한 동작이 가능해졌다.

---

## 3. MediaRecorder `ondataavailable` 미수신 문제

### 문제 상황

녹음 종료 후 Whisper API로 오디오를 전송하는 과정에서, **생성된 Blob의 크기가 0**이거나 전사 결과가 빈 문자열로 돌아오는 문제가 간헐적으로 발생했다. 특히 짧게 녹음하고 종료할 때 재현율이 높았다.

### 원인 분석

`MediaRecorder.start()`를 인자 없이 호출하면 `ondataavailable` 이벤트는 **`stop()`이 호출될 때 단 한 번만 발화**된다. 그런데 `stop()`이 호출된 직후 `ondataavailable`이 비동기로 발생하기 전에 `onstop`이 실행되면서, `chunksRef`가 비어 있는 상태에서 Blob을 생성하는 타이밍 문제가 있었다.

```ts
// 문제 코드
recorder.start(); // timeslice 없음 → stop 시에만 데이터 발생

recorder.onstop = () => {
    // ondataavailable 보다 먼저 실행될 수 있음
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    onStop(blob); // blob.size === 0 케이스 발생
};
```

### 해결 방법

`recorder.start(1000)`처럼 **timeslice(밀리초)를 지정**하면 녹음 중에도 1초마다 `ondataavailable`이 발화되어 데이터가 청크 단위로 누적된다. 이렇게 하면 `stop()` 시점에는 이미 대부분의 데이터가 수집된 상태가 된다.

```ts
// Recorder.tsx — timeslice 지정
recorder.start(1000); // 1초마다 ondataavailable 호출

recorder.ondataavailable = (e) => {
    if (e.data.size > 0) {
        chunksRef.current.push(e.data); // 청크 누적
    }
};

recorder.onstop = () => {
    const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
    chunksRef.current = [];
    onStop(blob); // 항상 유효한 크기의 Blob 보장
};
```

### 결과

짧은 녹음에서도 Blob이 올바르게 생성되었고, Whisper API 전사 성공률이 안정화되었다.

---

## 4. GPT 응답 파싱 불안정

### 문제 상황

`getScoredFeedback` 함수에서 GPT-4의 응답 텍스트를 정규식으로 파싱해 `점수`, `피드백`, `모범답안 예시`를 추출하는데, **GPT가 응답 형식을 조금씩 다르게 생성**하는 경우 파싱이 실패했다. 결과적으로 피드백이 "피드백을 가져오지 못했습니다." 같은 fallback 값으로 저장되는 문제가 빈번했다.

```
// GPT 응답 변형 예시
"점수: 3점"   → 정규식 /점수[:：]?\s*(\d)/ 실패 (뒤에 '점' 문자)
"Score: 4"    → 영어로 응답 시 완전 실패
"**점수**: 3" → 마크다운 볼드 포함 시 실패
```

### 원인 분석

LLM은 동일한 프롬프트에도 출력 형식이 매번 조금씩 달라질 수 있다. 형식 준수를 강제하지 않은 채 정규식에 의존하면, 응답 하나가 조금만 달라져도 파싱 전체가 실패한다.

### 해결 방법

**시스템 프롬프트에 형식을 매우 구체적으로 명시**하고, 형식 이탈을 금지하는 문구를 추가했다.

```ts
// openai.ts — 프롬프트 강화
{
    role: 'system',
    content: `...
형식은 반드시 아래처럼 응답해. 불필요한 말이나 머리말 없이:

점수: (1~5 중 하나의 숫자)
피드백: (간단하고 실용적인 피드백)
모범답안 예시: (구체적인 실무 기반 답변, 반드시 포함할 것)

답변이 부실하더라도 모범답안은 반드시 포함할 것. 생략하지 마.`
}
```

추가로 정규식에도 **`s` 플래그(dotall)**를 적용해 여러 줄에 걸친 응답을 처리하고, 파싱 실패 시에도 빈 값이 아닌 의미있는 fallback을 반환하도록 했다.

```ts
const scoreMatch = content.match(/점수[:：]?\s*(\d)/);
const feedbackMatch = content.match(/피드백[:：]?\s*(.+?)(?:\n|$)/s);
const modelAnswerMatch = content.match(/모범답안 예시[:：]?\s*([\s\S]*)/);

const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 1;
const feedback = feedbackMatch?.[1]?.trim() || '피드백을 가져오지 못했습니다.';
const modelAnswer = modelAnswerMatch?.[1]?.trim() || '모범답안을 가져오지 못했습니다.';
```

### 결과

프롬프트 강화 후 GPT의 형식 준수율이 크게 향상되었고, 드물게 파싱이 실패하는 경우에도 사용자에게 빈 화면 대신 안내 문구가 표시되어 UX가 개선되었다.

---

## 5. jsPDF 한글 렌더링 깨짐

### 문제 상황

면접 기록 PDF 내보내기 기능을 구현했을 때, **PDF 파일에서 한글이 전부 빈칸 또는 깨진 문자**로 표시되는 문제가 발생했다.

### 원인 분석

jsPDF의 기본 내장 폰트(`Helvetica`, `Times New Roman` 등)는 **라틴 문자 기반 폰트**로, CJK(한중일) 문자 코드를 포함하지 않는다. 한글 텍스트를 렌더링하려면 한글을 지원하는 폰트를 직접 jsPDF에 등록해야 한다.

### 해결 방법

**NanumGothic TTF 폰트를 base64로 인코딩**해 TypeScript 모듈로 저장하고, jsPDF의 Virtual File System에 등록하는 방식을 사용했다.

```ts
// src/fonts/NanumGothic.ts
// TTF 파일을 base64로 변환한 문자열
const font = "AAEAAAA..."; // (매우 긴 base64 문자열)
export default font;
```

```ts
// ExportPage.tsx — 폰트 등록
import font from '../fonts/NanumGothic.js';

jsPDF.API.events.push(['addFonts', () => {
    jsPDF.API.addFileToVFS('NanumGothic.ttf', font);
    jsPDF.API.addFont('NanumGothic.ttf', 'NanumGothic', 'normal');
}]);

// PDF 생성 시 폰트 지정
const doc = new jsPDF();
doc.setFont('NanumGothic');
doc.text('한글 텍스트', 14, 20);
```

`jsPDF.API.events`의 `addFonts` 훅을 사용하면 새 jsPDF 인스턴스가 생성될 때마다 폰트가 자동으로 등록된다.

### 결과

PDF 파일에서 한글이 정상적으로 렌더링되었고, 질문·답변·피드백·모범답안 전체 내용을 PDF로 정상 출력할 수 있게 되었다.

---

## 6. Web Speech API TypeScript 타입 오류

### 문제 상황

`window.SpeechRecognition`, `window.webkitSpeechRecognition`, `SpeechRecognitionEvent` 등을 사용하려 하자 **TypeScript에서 타입이 없다는 컴파일 오류**가 발생했다.

```
// 오류 예시
Property 'SpeechRecognition' does not exist on type 'Window & typeof globalThis'
Property 'webkitSpeechRecognition' does not exist on type 'Window & typeof globalThis'
```

### 원인 분석

Web Speech API는 W3C 표준이지만 TypeScript의 기본 `lib.dom.d.ts`에 타입 정의가 **포함되어 있지 않다**. Chrome 계열 브라우저는 `webkitSpeechRecognition`이라는 벤더 프리픽스 방식으로 구현하므로, 이 역시 타입이 없다.

### 해결 방법

`src/types/global.d.ts`에 **Declaration Merging**을 활용해 `Window` 인터페이스와 관련 타입들을 직접 선언했다.

```ts
// src/types/global.d.ts
declare global {
    interface Window {
        SpeechRecognition: typeof SpeechRecognition;
        webkitSpeechRecognition: typeof SpeechRecognition;
    }

    interface SpeechRecognition extends EventTarget {
        lang: string;
        interimResults: boolean;
        continuous: boolean;
        start(): void;
        stop(): void;
        abort(): void;
        onresult?: (this: SpeechRecognition, ev: SpeechRecognitionEvent) => void;
        onend?: (this: SpeechRecognition, ev: Event) => void;
        onerror?: (this: SpeechRecognition, ev: SpeechRecognitionErrorEvent) => void;
        // ...
    }

    interface SpeechRecognitionEvent extends Event {
        readonly resultIndex: number;
        readonly results: SpeechRecognitionResultList;
    }
}

export {};
```

사용 측에서는 `window.SpeechRecognition || window.webkitSpeechRecognition`으로 크로스 브라우저 대응을 처리했다.

```ts
// InterviewBox.tsx
const SpeechRecognitionConstructor =
    window.SpeechRecognition || window.webkitSpeechRecognition;

if (!SpeechRecognitionConstructor) {
    alert('이 브라우저는 음성 인식을 지원하지 않습니다.');
    return;
}

const recognition = new (SpeechRecognitionConstructor as unknown as new () => SpeechRecognition)();
```

### 결과

TypeScript 오류 없이 Web Speech API를 사용할 수 있게 되었고, Chrome/Edge(Chromium) 기반 브라우저에서 실시간 음성 인식이 정상 동작한다.

---

## 7. localStorage 면접 기록 중복 저장

### 문제 상황

면접 답변 처리 중 오류가 발생해 재시도하거나, 피드백 생성 완료 후 컴포넌트가 재렌더링되면서 **동일한 질문에 대한 기록이 localStorage에 중복으로 저장**되는 문제가 발생했다.

### 원인 분석

`handleRecordingStop` 함수는 비동기 API 호출(Whisper 전사 → GPT 피드백)이 완료된 후에 localStorage에 쓰는 구조다. 네트워크 지연 중 사용자가 UI를 재조작하거나, React의 Strict Mode에서 `useEffect`가 두 번 실행되는 경우 중복 저장이 발생할 수 있었다.

### 해결 방법

저장 전에 **기존 기록에 동일한 질문이 있는지 확인**하고, 중복이면 저장을 건너뛰도록 했다. 또한 `isDuplicate` 상태로 저장 완료 또는 중복 감지 후 UI를 제어해 이중 제출을 방지했다.

```ts
// InterviewBox.tsx
const handleRecordingStop = async (blob: Blob) => {
    setIsSaving(true);
    const transcript = await transcribeAudio(blob);
    const { feedback: fb, score, modelAnswer: example } = await getScoredFeedback(...);

    // 빈 결과 방어
    if (!transcript?.trim() || !fb?.trim()) {
        setIsSaving(false);
        return;
    }

    const prev = JSON.parse(localStorage.getItem('interviewLogs') || '[]') as RecordItem[];

    // 중복 체크: 동일 질문이 이미 있으면 저장 스킵
    const alreadyExists = prev.some((log) => log.question === question);
    if (alreadyExists) {
        setIsDuplicate(true);
        setIsSaving(false);
        return;
    }

    localStorage.setItem('interviewLogs', JSON.stringify([record, ...prev]));
};
```

UI에서는 `isDuplicate`가 `true`일 때 녹음 버튼 대신 "다음 질문 요청" 버튼만 노출해 **같은 질문에 대한 재시도 자체를 UI 수준에서 차단**했다.

```tsx
{questionReady && !isDuplicate && !isSaving && (
    <button onClick={recording ? stopRecording : startRecording}>
        {recording ? '중지하기' : '시작하기'}
    </button>
)}

{!recording && isDuplicate && (
    <button onClick={regenerateQuestion}>
        🔄 다음 질문 요청
    </button>
)}
```

### 결과

중복 저장이 완전히 제거되었고, 저장 완료 이후에는 UI 자체가 재녹음을 막아 데이터 무결성이 보장되었다.

---

## 기술 스택 요약

| 구분 | 기술 |
|------|------|
| 프레임워크 | React 19 + TypeScript 5.8 |
| 빌드 도구 | Vite 7 |
| 스타일링 | Tailwind CSS 4 |
| 라우팅 | React Router v7 |
| AI/음성 | OpenAI GPT-4, Whisper API, Web Speech API |
| 오디오 | MediaRecorder API, MediaStream API |
| PDF | jsPDF + jspdf-autotable |
| 차트 | Recharts |
| 배포 | Vercel |
