import { get, identity } from 'lodash';
import agentApi from 'src/api/agent';
import sseAjax from 'src/api/sse';
import buildCreateWorksheetInfoMessages from './buildCreateWorksheetInfoMessages';

export async function createWorksheetSuggestionSSE({ message, agentParams, context, sessionId, abortController }) {
  const response = await agentApi.agentExecuteStream(
    {
      agentName: 'worksheet-requirement-agent',
      ...agentParams,
      sessionId,
      message,
      context,
    },
    { abortController },
  );
  return response;
}

export async function generateWorksheetWidgetsSSE({ agentParams, context, sessionId, abortController }) {
  const response = await agentApi.agentExecuteStream(
    {
      agentName: 'worksheet-generator-agent',
      forceReroute: false,
      context,
      sessionId,
      ...agentParams,
    },
    { abortController },
  );
  return response;
}

/** worksheet-name-icon-recommender：POST /api/agent/execute（非流式） */
export async function fetchWorksheetNameIconRecommend({ message, context, projectId, sessionId, abortController }) {
  try {
    const result = await agentApi.agentExecute(
      {
        agentName: 'worksheet-name-icon-recommender',
        message,
        sessionId,
        context,
        ...(projectId ? { projectId: String(projectId) } : {}),
      },
      { abortController, silent: true },
    );

    return {
      worksheetName: get(result, 'data.worksheetName', ''),
      icons: get(result, 'data.icons', []),
    };
  } catch (err) {
    identity(err);
    return { worksheetName: '', icons: [] };
  }
}

export async function getWorksheetNameAndIcon(appId, createPrompt, abortController) {
  return new Promise(async resolve => {
    const response = await sseAjax.buildWorkSheet(
      {
        appId,
        messageList: buildCreateWorksheetInfoMessages(createPrompt),
      },
      {
        abortController: abortController || new AbortController(),
        isReadableStream: true,
      },
    );
    const reader = response.body.getReader();
    let result = '';
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();

      if (done) {
        break;
      }

      result += decoder.decode(value);
    }

    try {
      const responseDataStr = result
        .split('\n')
        .map(a => a.slice(6))
        .filter(t => t[0] === '{')
        .map(t => JSON.parse(t).choices[0]?.delta.content)
        .join('');
      resolve(JSON.parse(responseDataStr));
    } catch (err) {
      identity(err);
      resolve(null);
    }
  });
}
