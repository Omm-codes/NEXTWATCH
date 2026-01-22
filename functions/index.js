const { onCall, HttpsError } = require('firebase-functions/v2/https');
const { defineSecret } = require('firebase-functions/params');

const GROQ_API_URL = 'https://api.groq.com/openai/v1/chat/completions';
const DEFAULT_MODEL = 'llama-3.1-8b-instant';
const groqApiKey = defineSecret('GROQ_API_KEY');

exports.groqChat = onCall({ secrets: [groqApiKey] }, async (request) => {
  const { messages, max_tokens, temperature, model } = request.data || {};
  const apiKey = groqApiKey.value();

  if (!apiKey) {
    throw new HttpsError('failed-precondition', 'GROQ_API_KEY is not configured');
  }

  if (!Array.isArray(messages) || messages.length === 0) {
    throw new HttpsError('invalid-argument', 'messages must be a non-empty array');
  }

  const payload = {
    model: model || DEFAULT_MODEL,
    messages,
    max_tokens: typeof max_tokens === 'number' ? max_tokens : 200,
    temperature: typeof temperature === 'number' ? temperature : 0.7
  };

  let response;
  try {
    response = await fetch(GROQ_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${apiKey}`
      },
      body: JSON.stringify(payload)
    });
  } catch (error) {
    throw new HttpsError('unavailable', 'Failed to reach Groq API');
  }

  if (!response.ok) {
    const errorBody = await response.json().catch(() => ({}));
    throw new HttpsError(
      'internal',
      `Groq API error: ${response.status}`,
      errorBody
    );
  }

  const data = await response.json();
  const content = data?.choices?.[0]?.message?.content || '';

  return { content };
});
