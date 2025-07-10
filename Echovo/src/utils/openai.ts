
// 📁 src/utils/openai.ts
import type { StatsSummary } from '../types/interview'; // 예시 경로

const API_KEY = import.meta.env.VITE_OPENAI_API_KEY;
export async function generateQuestion(field: string, stack: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `
넌 실제 기업의 프론트엔드 기술 면접관이야.
말투는 "어떻게 하셨나요?", "무엇인가요?", "어떤 차이가 있었나요?"처럼 정중하지만 단호하게 해.
질문은 반드시 하나씩, 짧고 명확하게 묻고, 단순 정의 수준은 피하고 원리, 배경, 실전 경험, 실수와 개선 등을 중심으로 묻도록 해.

면접자의 기술 이해도를 파악하기 위해 아래 항목들을 중심으로 질문해.
- 원리 설명: 단순 사용법보다 "왜 그렇게 동작하는지", "기저 기술은 무엇인지"
- 실제 경험: 사용해본 기술이라면 어떤 문제를 해결했는지, 실수한 적은 없는지
- 대안 비교: 비슷한 기술과 비교했을 때 어떤 차이와 선택 이유가 있었는지
- 흐름 설명: 특정 개념이 실제 코드 실행 중 어떻게 작동하는지 단계별 설명 요청

면접자가 프론트엔드 엔지니어를 희망한다면, 아래 주제들 중 하나라도 모르면 통과하기 어렵다고 판단해.

중요도 4 (핵심 원리 중심):
- 브라우저 렌더링 과정은 어떻게 이루어지나요?
- Reflow와 Repaint는 언제 발생하며 어떤 비용이 따르나요?
- 사용자가 주소창에 google.com을 입력했을 때 실제로 어떤 일들이 발생하나요?
- 호이스팅이 발생하는 정확한 메커니즘은 무엇인가요?
- 클로저를 직접 사용해 본 경험이 있으신가요? 어떤 용도로 사용하셨나요?
- CSS에서 margin과 padding이 실제 박스 크기에 어떻게 영향을 주나요?
- CSS의 position 속성 값들 간 차이와 사용 경험에 대해 말씀해주세요.
- REST API 설계 시 어떤 기준으로 자원과 메서드를 설계하셨나요?

중요도 3~2:
- this가 가리키는 대상을 동적으로 바꾸어 본 경험이 있나요?
- LocalStorage, SessionStorage, Cookie의 차이와 실제 사용 시 보안/수명 측면에서 고려한 점은?
- JavaScript의 비동기 구조는 어떻게 구성되어 있나요? Event Loop 관점에서 설명해보세요.
- 마이크로태스크와 태스크 큐의 차이를 예제 중심으로 설명해보시겠어요?
- 이벤트 전파(버블링, 캡처링) 과정에서 실수한 경험이 있다면 말씀해주세요.
- 타입스크립트를 도입하면서 가장 어려웠던 점은 무엇이었나요?
- CSR과 SSR을 비교해서 어떤 상황에 어떤 것을 선택하시겠어요?
- null과 undefined는 어떻게 구별해서 사용하시나요?

반드시 다음을 지켜:
- 하나의 질문만 던져
- 짧고 본질적인 질문을 해
- 사용자의 경험을 검증하려고 해
- "정의해주세요"보단 "어떻게 사용하셨나요?"라고 물어
`
                },

                {
                    role: 'user',
                    content: `면접 분야: ${field}, 기술 스택: ${stack}에 대해 실제 기업 면접에서 나올 법한, 구체적이고 본질을 묻는 질문 하나만 생성해줘.`
                }

            ],
        }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '질문 생성 실패';
}

export async function transcribeAudio(blob: Blob): Promise<string> {
    const formData = new FormData();
    formData.append('file', blob, 'audio.webm');
    formData.append('model', 'whisper-1');

    const res = await fetch('https://api.openai.com/v1/audio/transcriptions', {
        method: 'POST',
        headers: {
            Authorization: `Bearer ${API_KEY}`,
        },
        body: formData,
    });
    const data = await res.json();
    return data.text;
}

export async function getFeedback(question: string, answer: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `넌 현업 IT분야 기술 면접관이야. 피드백은 구체적으로, 기술적으로, 실무 경험에 기반해 작성해. 
지원자가 어떤 점을 명확히 잘 설명했는지, 어떤 부분은 잘못됐거나 보완이 필요한지 구분해서 피드백해줘. 
답변이 너무 모호하거나 단편적이면, 추가로 어떤 내용을 더 말했어야 하는지도 알려줘.`
                },
                {
                    role: 'user',
                    content: `면접 질문: "${question}"\n면접자 답변: "${answer}"\n위 답변에 대해 반드시 모범답안 예시: 이 형식에 맞춰서 기술적 피드백을 제공하지만 모범답안 예시와 너가 제시하는 피드백은 줄나눔으로 구분이 되어야해해 그리고 답변을 제시해주세요.`
                }
            ]

        }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content || '피드백 실패';
}


export async function summarizeQuestion(question: string): Promise<string> {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${import.meta.env.VITE_OPENAI_API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: '너는 면접 기록을 요약하는 도우미야. 면접 질문을 사용자가 리스트에서 보기 쉽게 1줄로 핵심 주제만 간결하게 요약해줘. 최대 12자 이내가 이상적이야. 예) useEffect 정리, 이벤트 전파 등'
                },
                {
                    role: 'user',
                    content: `면접 질문: "${question}" 요약해줘.`
                }
            ]
        }),
    });
    const data = await res.json();
    return data.choices?.[0]?.message?.content?.trim() || '요약 실패';
}



    export function generateCareerLevelPrompt(stats: StatsSummary, field?: string): string {
        const 분야설명 = field ? `사용자의 분야는 ${field}입니다.\n` : '';
        return `
    ${분야설명}아래는 사용자의 모의 면접 기록 요약입니다:

    - 평균 점수: ${stats.averageScore.toFixed(1)}
    - 평균 응답 길이: ${stats.averageLength.toFixed(1)}자
    - 평균 응답 시간: ${stats.averageDuration.toFixed(1)}초
    - 연습 횟수: ${stats.totalSessions}회

    이 데이터를 기반으로 사용자의 면접 실력을 분석해서, 다음 3단계 중 하나로 판단해줘:
    - beginner (초보자): 실력이 아직 부족하고 학습이 필요한 수준
    - intermediate (중급자): 일정 수준 이상의 이해와 응답이 가능한 수준
    - advanced (경력자): 실무 수준의 답변이 가능하고 응답이 유창한 수준

    반드시 다음 JSON 형식으로 응답해줘:

    {
    "level": "intermediate",
    "reason": "평균 점수와 응답 길이가 중급자 수준이며, 연습 횟수도 충분합니다."
    }
    `.trim();
    }

    export async function getCareerLevelFromAI(prompt: string): Promise<string> {
        const res = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: `Bearer ${API_KEY}`,
            },
            body: JSON.stringify({
                model: 'gpt-4',
                messages: [
                    {
                        role: 'system',
                        content: `넌 면접 기록을 기반으로 사용자의 실력을 평가하는 도우미야. 아래 데이터를 바탕으로 사용자의 수준을 beginner / intermediate / advanced 중 하나로 분류하고 그 이유를 JSON 형식으로 설명해줘.`,
                    },
                    {
                        role: 'user',
                        content: prompt,
                    },
                ],
            }),
        });

        const data = await res.json();
        return data.choices?.[0]?.message?.content?.trim() || '분석 실패';
    }
    import type { RecordItem } from '../types/interview'; // 필요 시 상단에 추가

    export function calculateStats(records: RecordItem[]): StatsSummary {
        const scores = records.map(r => r.score ?? 0);
        const durations = records.map(r => r.duration ?? 0);
        const lengths = records.map(r => r.answer?.length ?? 0);

        const average = (arr: number[]) =>
            arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;

        return {
            averageScore: parseFloat(average(scores).toFixed(1)),
            averageLength: parseFloat(average(lengths).toFixed(1)),
            averageDuration: parseFloat(average(durations).toFixed(1)),
            totalSessions: records.length,
        };
    }




// ✅ GPT로 점수 + 피드백 함께 요청
export const getScoredFeedback = async (
    question: string,
    answer: string
): Promise<{ feedback: string; score: number; modelAnswer: string }> => {
    const res = await fetch('https://api.openai.com/v1/chat/completions', {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${API_KEY}`,
        },
        body: JSON.stringify({
            model: 'gpt-4',
            messages: [
                {
                    role: 'system',
                    content: `넌 10년차 실무 기반 IT 기술 면접관이야.
지원자의 답변을 평가할 때는 다음 기준을 고려해:
- 논리성, 관련성, 구체성, 전달력

그에 따라 1~5점 점수를 주고, 실용적인 피드백을 작성해.
그리고 반드시 "이렇게 답하는것이 질문에 대한 최선의 답변이다"이라는 모범답안을 제시해.
`,
                },
                {
                    role: 'user',
                    content: `
면접 질문: ${question}
면접자 답변: ${answer}

다음 형식을 반드시 지켜서 응답해:

점수: X
피드백: (간단하고 실용적인 피드백)
모범답안 예시: (실무 기반 예시 답변)
`,
                },
            ],
        }),
    });

    const data = await res.json();
    const content = data.choices?.[0]?.message?.content || '';

    const scoreMatch = content.match(/점수[:：]?\s*(\d)/);
    const feedbackMatch = content.match(/피드백[:：]?\s*(.*)/);
    const modelAnswerMatch = content.match(/모범답안 예시[:：]?\s*([\s\S]*)/); // 끝까지 추출

    const score = scoreMatch ? parseInt(scoreMatch[1], 10) : 1;
    const feedback = feedbackMatch?.[1]?.trim() || '피드백을 가져오지 못했습니다.';
    const modelAnswer = modelAnswerMatch?.[1]?.trim() || '모범답안을 가져오지 못했습니다.';

    return { score, feedback, modelAnswer };
};
