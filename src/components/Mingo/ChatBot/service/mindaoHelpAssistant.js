import { FAST_GPT_CONFIG } from 'src/utils/enum';

export default async function mindaoHelpAssignment({ chatId, messages, abortController }) {
  const response = await fetch(`${FAST_GPT_CONFIG.baseUrl}/v1/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${FAST_GPT_CONFIG.apiKey}`,
    },
    body: JSON.stringify({
      chatId,
      stream: true,
      messages: messages.filter(item => item.role === 'user').slice(-1),
    }),
    signal: abortController?.signal,
  });
  return response;
}
