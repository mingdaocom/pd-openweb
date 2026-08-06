import _ from 'lodash';
import agentApi from 'src/api/agent';
import { buildFormFieldsControls } from 'src/components/Mingo/ChatBot/utils';
import { genBotSessionId } from 'src/utils/agentSession';
import { emitter } from 'src/utils/common';
import { formatAiGenControlValue } from 'src/utils/control';

const IMAGE_FILE_EXTS = ['.jpg', '.jpeg', '.png', '.heic'];

const normalizeFileExt = fileExt => {
  if (!fileExt) return '';
  return String(fileExt).startsWith('.') ? String(fileExt).toLowerCase() : `.${String(fileExt).toLowerCase()}`;
};

const isImageAttachment = (file = {}) => {
  const type = String(file.type || '').toLowerCase();
  return (
    type === 'image' || /^image\//.test(type) || IMAGE_FILE_EXTS.includes(normalizeFileExt(file.fileExt || file.ext))
  );
};

export const normalizeGenerateRecordAttachments = (filesList = []) => {
  return (filesList || [])
    .map(file => ({
      type: isImageAttachment(file) ? 'image' : 'doc',
      url: file.url,
      name: file.name || file.originalFileName || file.originalFilename || file.fileName,
      size: file.size || file.fileSize,
    }))
    .filter(file => file.url);
};

export const generateRecord = ({
  text = '',
  filesList = [],
  setType,
  setVisible,
  propsRef,
  aiParseRef,
  projectId,
  setFilledByAiMap,
}) => {
  setType('parse');
  const { worksheetInfo = {} } = propsRef.current;
  const currentProjectId = worksheetInfo?.projectId || projectId;

  const request = agentApi.agentExecute({
    agentName: 'record-precise-filler',
    sessionId: genBotSessionId(),
    projectId: currentProjectId,
    forceReroute: false,
    message: text ? _l('【当前用户正在使用语音输入，文本内容与选项内容无需完全匹配，可以进行模糊匹配】') + text : '',
    attachments: normalizeGenerateRecordAttachments(filesList),
    context: {
      formFields: JSON.stringify(buildFormFieldsControls(worksheetInfo, { from: 'generate-record' })),
      userLanguage: window.getCurrentLang() || 'zh-Hans',
    },
  });
  aiParseRef.current = request;

  aiParseRef.current
    .then(result => {
      const data = _.get(result, 'data.response.text') || '';

      if (data.length) {
        try {
          if (!data.includes('custom_block_mingo_generate_record_jsonl')) {
            alert(_l('未识别到有效信息'), 3);
            return;
          }

          const match = data.match(/```custom_block_mingo_generate_record_jsonl([\s\S]*?)```/);
          const jsonlStr = match[1].trim();
          const fieldsData = jsonlStr.split('\n').filter(Boolean);
          const parsedArray = fieldsData.map(line => safeParse(line));

          if (!parsedArray?.length) {
            alert(_l('未识别到有效信息'), 3);
            return;
          }

          const controls = _.get(worksheetInfo, 'template.controls');
          const aiValue = parsedArray.reduce((acc, cur) => {
            const control = _.find(controls, { controlId: cur.controlId });
            if (!control) return acc;
            acc[cur.controlId] = formatAiGenControlValue(control, cur.value);
            return acc;
          }, {});
          setFilledByAiMap(prev => ({
            ...prev,
            ..._.mapValues(aiValue, value => value !== undefined),
          }));
          emitter.emit('MINGO_FILL_NEW_RECORD_VALUE_BY_AI_MOBILE', aiValue);
          alert(_l('信息已填充'));
        } catch (error) {
          console.error(error);
        }
      } else {
        alert(_l('未识别到有效信息'), 3);
      }
    })
    .catch(error => {
      if (error?.name !== 'AbortError' && error?.errorCode !== 1) {
        alert(_l('识别失败'), 2);
      }
    })
    .finally(() => {
      setVisible(false);
      setType('');
    });
};

export function secondToMMSS(seconds) {
  const minutes = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${minutes.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}
