import worksheetAjax from 'src/api/worksheet';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import {
  DATA_FILTER_FIELD_TYPES,
  FILTER_CONDITION_TYPE,
  SPLICE_TYPE,
  SUPPORT_FIELD_TYPES,
  SYSTEM_FIELD_IDS,
} from './config';

export const getFileIcon = fileName => {
  if (!fileName) return 'file';

  const ext = fileName.split('.').pop().toLowerCase();

  const map = {
    doc: 'fileIcon-word',
    docx: 'fileIcon-word',
    xls: 'fileIcon-excel',
    xlsx: 'fileIcon-excel',
    csv: 'fileIcon-excel',
    pdf: 'fileIcon-pdf',
    ppt: 'fileIcon-ppt',
    pptx: 'fileIcon-ppt',
    md: 'fileIcon-md',
  };

  return map[ext] || 'fileIcon-txt';
};

export const formatFileSize = (size, decimals = 2) => {
  const fileSize = Number(size);

  if (fileSize <= 0 || Number.isNaN(fileSize)) return '0 B';

  const units = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const base = 1024;

  const index = Math.floor(Math.log(fileSize) / Math.log(base));
  const value = fileSize / Math.pow(base, index);

  return `${parseFloat(value.toFixed(decimals))} ${units[index]}`;
};

const isValidValue = v => v !== undefined && v !== null && v !== '';

/**
 * 将筛选条件转中文描述（选项类 key -> 中文，等级范围处理，去掉括号可按需处理）
 * @param {Array} filters - 条件数组
 * @param {Array} controls - 控件列表，每个包含 { controlId, controlName, options? }
 * @returns {string} 中文描述
 */
export const formatFilterConditionToText = (filters = [], controls = []) => {
  const spliceText = type => SPLICE_TYPE[type] || '且';

  const controlMap = new Map(controls.map(c => [c.controlId, c]));
  const getControl = id => controlMap.get(id);

  const formatFilterValues = f => {
    const control = getControl(f.controlId);

    // 选项类字段：9、10、11
    // [1, 2] -> ['选项1', '选项2']
    if ([9, 10, 11].includes(f.dataType) && control?.options?.length) {
      const valueKeys = Array.isArray(f.values) ? f.values : isValidValue(f.value) ? [f.value] : [];

      return valueKeys.map(k => {
        const opt = control.options.find(o => o.key === k);
        return opt?.value ?? String(k);
      });
    }

    // 等级类型 28
    if (f.dataType === 28) {
      if ([11, 12].includes(f.filterType)) {
        const min = isValidValue(f.minValue) ? f.minValue : '';
        const max = isValidValue(f.maxValue) ? f.maxValue : '';
        return min !== '' || max !== '' ? [`${min}-${max}`] : [];
      }

      if ([13, 14, 15, 16].includes(f.filterType)) {
        return isValidValue(f.value) ? [f.value] : [];
      }
    }

    // 其他类型
    if (Array.isArray(f.values)) return f.values;
    if (isValidValue(f.value)) return [f.value];
    return [];
  };

  const formatSingle = f => {
    const control = getControl(f.controlId);
    const fieldName = control ? control.controlName : f.controlId;
    const filterText = (FILTER_CONDITION_TYPE[f.dataType] && FILTER_CONDITION_TYPE[f.dataType][f.filterType]) || '';

    // 空/不为空不展示值
    if ([7, 8].includes(f.filterType)) {
      return `${fieldName} ${filterText}`.trim();
    }

    const values = formatFilterValues(f);
    const valueStr = values.filter(isValidValue).join(', ');

    return valueStr ? `${fieldName} ${filterText} ${valueStr}` : `${fieldName} ${filterText}`.trim();
  };

  const formatList = list => {
    if (!Array.isArray(list) || list.length === 0) return '';

    return list
      .map((item, index) => {
        const text = parseFilter(item);
        if (index === 0) return text;
        return `${spliceText(item.spliceType)} ${text}`;
      })
      .join(' ');
  };

  const parseFilter = f => {
    if (!f) return '';

    if (f.isGroup && Array.isArray(f.groupFilters) && f.groupFilters.length > 0) {
      const groupText = formatList(f.groupFilters);
      return groupText ? `(${groupText})` : '';
    }

    return formatSingle(f);
  };

  return formatList(filters);
};

export const parseKidHash = () => {
  const hash = window.location.hash.replace(/^#/, '');
  const [type, value] = hash.split('=');

  if (!type || !value) return null;

  return { type, value };
};

// 是否是他表-存储字段
export const isOtherTableField = ({ type, strDefault }) => type === 30 && strDefault?.[0] === '0';

// 数据筛选支持的字段
export const isSupportFilterField = control =>
  DATA_FILTER_FIELD_TYPES.includes(control.type) ||
  (isOtherTableField(control) && DATA_FILTER_FIELD_TYPES.includes(control.sourceControlType));

/**
 * 级联 35，单条
 * 关联记录 29，单条
 * 他表存储，SUPPORT_FIELD_TYPES
 */
export const externalSupportField = control => {
  return (
    (control.type === 35 && control.enumDefault === 1) ||
    (control.type === 29 && control.enumDefault === 1) ||
    (isOtherTableField(control) &&
      SUPPORT_FIELD_TYPES.includes(control.sourceControlType) &&
      !SYSTEM_FIELD_IDS.includes(control.sourceControl?.controlId))
  );
};

export const isCustomField = ({ advancedSetting }) => ['1', '2'].includes(advancedSetting?.customtype);

export async function fetchFilterData({ worksheetId, filterId, setWorksheetControlsMap, setFilterConditionsMap }) {
  if (!filterId) return;

  try {
    const [worksheetInfo, filterData] = await Promise.all([
      worksheetAjax.getWorksheetInfo({ worksheetId, getTemplate: true }),
      worksheetAjax.getWorksheetFilterById({ filterId }),
    ]);

    const { template = {} } = worksheetInfo;
    const { controls = [] } = template;

    const dataFilterFields = controls.filter(isSupportFilterField);

    setWorksheetControlsMap(prev => ({
      ...prev,
      [worksheetId]: dataFilterFields,
    }));

    const { items = [] } = filterData;

    setFilterConditionsMap(prev => ({
      ...prev,
      [filterId]: items,
    }));

    return {
      controls: dataFilterFields,
      filterConditions: items,
    };
  } catch (err) {
    console.error(err);
    return null;
  }
}

export const getControlIcon = control => {
  if (!control) return '';
  const type = control.type === 30 ? control.sourceControlType : control.type;

  return getIconByType(type);
};

export const isDisabledKnowledge = (projectId, isSilence = false, callback = () => {}) => {
  const featureType = getFeatureStatus(projectId, VersionProductType.vectorKnowledgeBase);
  const isDisabled = featureType === '2';

  if (isDisabled && !isSilence) {
    buriedUpgradeVersionDialog(projectId, VersionProductType.vectorKnowledgeBase);
    callback();
  }

  return isDisabled;
};

export const removeKidHashFromUrl = () => {
  const { hash, pathname, search } = window.location;

  if (hash.startsWith('#kid')) {
    const cleanUrl = pathname + search;
    window.history.replaceState(null, '', cleanUrl);
  }
};
