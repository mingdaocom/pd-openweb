import _ from 'lodash';
import mingoAjax from 'src/api/mingo';
import { emitter } from 'src/utils/common';
import { formatAiGenControlValue } from 'src/utils/control';

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
  const { worksheetInfo = {}, worksheetId } = propsRef.current;
  let content = [];
  if (text) {
    content.push({
      type: 'text',
      text,
    });
  }
  if (filesList?.length) {
    content.push(
      ...filesList.map(file => ({
        type: 'image_url',
        image_url: {
          url: file.url,
        },
      })),
    );
    content.push({
      type: 'text',
      hidden: true,
      text: `[用户上传的图片链接] ${filesList.map(file => file.url).join('、')}`,
    });
  }
  aiParseRef.current = mingoAjax.generateRecordByMobile({
    projectId: worksheetInfo?.projectId || projectId,
    worksheetId: worksheetInfo?.worksheetId || worksheetId,
    messageList: [
      {
        role: 'user',
        content,
      },
    ],
  });

  aiParseRef.current
    .then((data = '') => {
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
    .catch(({ errorCode }) => {
      if (errorCode !== 1) {
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
