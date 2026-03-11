import { identity } from 'lodash';
import sseAjax from 'src/api/sse';
import buildCreateWorksheetInfoMessages from './buildCreateWorksheetInfoMessages';

export async function createWorksheetSuggestionSSE({ appId, messages, abortController }) {
  const response = await sseAjax.buildSheetRequirements(
    {
      appId,
      messageList: [
        // {
        //   role: 'user',
        //   content: buildCurrentAppDataMessage(currentAppData),
        // },
        ...messages,
      ],
    },
    {
      abortController,
      isReadableStream: true,
    },
  );
  // const response = await sseAjax.buildWorkSheet(
  //   {
  //     appId,
  //     messageList: [
  //       {
  //         role: 'system',
  //         content: createWorksheetSystemPrompt,
  //       },
  //       {
  //         role: 'user',
  //         content: buildCurrentAppDataMessage(currentAppData),
  //       },
  //       ...messages,
  //     ],
  //     // params: {},
  //   },
  //   {
  //     abortController,
  //     isReadableStream: true,
  //   },
  // );
  return response;
}

export async function generateWorksheetWidgetsSSE({ appId, messages, abortController }) {
  const response = await sseAjax.buildWorkSheet(
    {
      appId,
      messageList: [
        // ...buildGenerateWorksheetWidgetsMessages(),
        ...messages,
      ],
    },
    {
      abortController,
      isReadableStream: true,
    },
  );
  return response;
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
