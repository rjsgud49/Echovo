// // 📁 api/openai.ts
// export default async function handler(req: Request) {
//     if (req.method !== 'POST') {
//         return new Response(JSON.stringify({ error: 'Method Not Allowed' }), { status: 405 });
//     }

//     const apiKey = process.env.OPENAI_API_KEY;
//     if (!apiKey) return new Response(JSON.stringify({ error: 'API key missing' }), { status: 401 });

//     const { type, payload } = await req.json();

//     let openaiUrl = '';
//     let body = {};

//     switch (type) {
//         case 'chat':
//             openaiUrl = 'https://api.openai.com/v1/chat/completions';
//             body = {
//                 model: 'gpt-4',
//                 messages: payload.messages,
//             };
//             break;
//         case 'transcribe':
//             openaiUrl = 'https://api.openai.com/v1/audio/transcriptions';
//             return await fetch(openaiUrl, {
//                 method: 'POST',
//                 headers: { Authorization: `Bearer ${apiKey}` },
//                 body: payload.formData, // FormData 직접 전달됨
//             });
//         default:
//             return new Response(JSON.stringify({ error: 'Invalid type' }), { status: 400 });
//     }

//     const response = await fetch(openaiUrl, {
//         method: 'POST',
//         headers: {
//             'Content-Type': 'application/json',
//             Authorization: `Bearer ${apiKey}`,
//         },
//         body: JSON.stringify(body),
//     });

//     const data = await response.json();
//     return new Response(JSON.stringify(data), {
//         headers: { 'Content-Type': 'application/json' },
//     });
// }
