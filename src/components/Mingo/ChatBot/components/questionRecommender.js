// 应用内「提问」tab 的推荐问题：组装喂给 app-question-recommender agent 的 user message，
// 并把 agent 流式回吐的纯文本（每行一个问题）解析成问题列表。
// 数据源：appInfo（getApp getSection:true 的结果，含 name / description / sections）。
import { parse as parsePartial } from 'partial-json';

// 递归收集应用下所有工作表（type 0），childSection（type 2）下钻。
// appInfo.sections[].workSheetInfo 项只有 workSheetName，remark 多数不在该结构里，有则带、无则只给 name。
function collectWorksheets(appInfo) {
  const out = [];

  const walk = sections => {
    (sections || []).forEach(section => {
      (section.workSheetInfo || []).forEach(ws => {
        if (ws.type === 2) {
          const child = (section.childSections || []).find(c => c.appSectionId === ws.workSheetId);

          if (child) walk([child]);
          return;
        }

        if (ws.type === 0) out.push({ name: ws.workSheetName || '', remark: ws.remark || '' });
      });
    });
  };

  walk(appInfo && appInfo.sections);
  return out.filter(w => w.name);
}

// 组装 user message：① 应用 name+说明 ② 工作表列表 name(+remark)。
export function buildRecommenderMessage({ appInfo }) {
  const appName = (appInfo && appInfo.name) || '';
  const appRemark = (appInfo && (appInfo.description || appInfo.remark)) || '';
  const worksheets = collectWorksheets(appInfo);
  const wsText = worksheets.length
    ? worksheets.map(w => `- ${w.name}${w.remark ? `：${w.remark}` : ''}`).join('\n')
    : _l('（暂无工作表）');

  return [
    _l('# 应用信息'),
    `${_l('名称')}：${appName}`,
    `${_l('说明')}：${appRemark || _l('无')}`,
    '',
    _l('# 工作表列表'),
    wsText,
  ].join('\n');
}

// agent 输出为流式 JSON：{ "questions": ["问题1", "问题2", ...] }。
// 用 partial-json 容忍半截 JSON，边流边解析 questions 数组：未闭合的对象/数组/字符串都能尽力取出已到内容，
// 末条问题会随增量逐步补全。空白/异常状态统一返回 []。
export function parseQuestions(raw) {
  if (!raw) return [];

  try {
    const obj = parsePartial(raw);
    const list = obj && obj.questions;

    if (Array.isArray(list)) {
      return list.filter(q => typeof q === 'string' && q.trim()).map(q => q.trim());
    }
  } catch {
    /* 半截 JSON 解析失败，等待下一个增量 */
  }

  return [];
}
