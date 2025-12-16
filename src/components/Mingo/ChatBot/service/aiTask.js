import { identity } from 'lodash';
import sseAjax from 'src/api/sse';
import buildCreateWorksheetInfoMessages from './buildCreateWorksheetInfoMessages';
import { buildGenerateWorksheetWidgetsMessages } from './buildGenerateWorksheetWidgetsMessages';

// 4. 如我的需求与业务表单创建无关或无法回答。请直接回复“超出范围”。

const createWorksheetSystemPrompt = `你是一位在数据库设计及不同行业业务应用方面经验丰富的专家，帮助我为我的应用添加工作表
##任务##
1. 根据我提出的“创建工作表”需求，用一段更详细的描述（约300字）完善该需求。包含：表单用途、字段列举、关联关系。
2. 如果需要有更具体的行业、功能等要求，需引导我补充说明以便进一步调整内容（一句话描述）。
3.回复所用语言需要与需求描述的语言一致。
4.最后请按照以下格式回答我：
\`\`\`custom_block_mingo_create_worksheet_description
[此处放置您根据任务1完善后的需求描述]
\`\`\`
[此处紧跟根据任务2提出的引导性问题]



## 示例 ##
用户提问：客户
回答：
\`\`\`custom_block_mingo_create_worksheet_description
创建一张”基础客户表“，用于记录企业日常业务往来客户信息。/n
包含：客户编号、姓名、联系电话、电子邮箱、所在地区、客户类型（如个人 / 企业 ）、首次合作时间、订单（关联订单表）等字段。设计出表结构及简单填写规范，方便后续录入客户数据。",
\`\`\`
如果你对客户表有更具体的行业、功能等要求，比如是教育行业客户表、侧重售后服务的客户表等，可补充说明，我再为您调整
`;

function buildCurrentAppDataMessage(currentAppData) {
  const { worksheets, appName, appDescription } = currentAppData;
  return `
    下面是当前应用的信息，你需要根据当前应用的信息，回答用户的问题。
    应用名称：${appName}
    应用描述：${appDescription}
    当前应用已存在工作表：
      ${worksheets.map(worksheet => `名称：${worksheet.workSheetName}，描述：${worksheet.desc || ''}`).join('\n')}
  `;
}

export async function createWorksheetSuggestionSSE({ appId, messages, abortController, currentAppData }) {
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
