import _ from 'lodash';
import { getStrBytesLength, getStringBytes } from 'src/utils/core/string';
import { getNewRecordPageUrl } from 'src/utils/domain/worksheet/record';
import { pathCompletion } from 'src/utils/platform/navigation/path';

/**
 * 根据记录状态生成新增记录或已有记录的站内访问地址。
 */
const getCodeUrl = ({ appId, worksheetId, viewId, recordId }) => {
  if (!recordId) {
    return getNewRecordPageUrl({ appId, worksheetId, viewId });
  }

  let baseUrl = `/app/${appId}/${worksheetId}`;
  if (viewId) baseUrl += `/${viewId}`;
  return pathCompletion(`${baseUrl}/row/${recordId}`);
};

/**
 * 按条码控件配置生成记录链接、记录 ID 或字段文本，并限制条码文本字节数。
 */
export const getBarCodeValue = ({ data, control, codeInfo }) => {
  const { enumDefault, enumDefault2, dataSource } = control;
  if ((enumDefault === 1 || (enumDefault === 2 && enumDefault2 === 3)) && !dataSource) return '';
  if (dataSource === 'rowid') return codeInfo.recordId;
  if (enumDefault === 2 && enumDefault2 === 1) return getCodeUrl(codeInfo);

  const selectedControl = _.find(data, item => item.controlId === dataSource);
  if (!selectedControl?.value) return '';
  if (enumDefault === 1) {
    const value = String(selectedControl.value).replace(/[^a-zA-Z0-9@#$%&-=_;:,<>?!/^*()+[\]{}|.\s]/g, '');
    return getStringBytes(value) <= 128 ? value : getStrBytesLength(value, 128);
  }

  const value = String(selectedControl.value);
  return getStringBytes(value) <= 500 ? value : getStrBytesLength(value, 500);
};
