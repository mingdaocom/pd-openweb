import { isEqual } from 'lodash';
import { CHANGE_STATUS } from '../constants';
import { createChangeRow, formatChangedValue, getContrastSides } from './changeModel';

/** 沙盒环境中 originalData 是当前侧、data 是基线侧；正式环境由调用方交换两侧。 */
const parseProcessSnapshot = value => {
  const root = safeParse(value) || {};

  return { root, process: root.process || {} };
};

const ARTIFICIAL_NODE_CONFIG_KEYS = [
  'allowRevoke',
  'revokeNodeIds',
  'startEventPass',
  'userTaskPass',
  'userTaskNullPass',
  'required',
  'requiredIds',
  'sendTaskPass',
];

const pickConfig = (config = {}, keys) =>
  Object.fromEntries(
    keys.filter(key => Object.prototype.hasOwnProperty.call(config, key)).map(key => [key, config[key]]),
  );

const omitConfig = (config = {}, keys) =>
  Object.fromEntries(Object.entries(config).filter(([key]) => !keys.includes(key)));

const getPbcConfig = process => process?.pbcConfig || process?.config?.pbcConfig;

const getProcessBasicInfoRows = (before, after) => {
  const rows = [];
  const beforeArtificialConfig = pickConfig(before.config, ARTIFICIAL_NODE_CONFIG_KEYS);
  const afterArtificialConfig = pickConfig(after.config, ARTIFICIAL_NODE_CONFIG_KEYS);
  const beforePbcConfig = getPbcConfig(before);
  const afterPbcConfig = getPbcConfig(after);

  if (before.name !== after.name) {
    rows.push(
      createChangeRow({
        id: 'process-name',
        name: _l('名称'),
        content: [formatChangedValue(before.name, after.name)],
      }),
    );
  }

  if (before.explain !== after.explain) {
    rows.push(createChangeRow({ id: 'process-description', name: _l('说明'), content: [CHANGE_STATUS.UPDATED] }));
  }

  if (!isEqual(beforeArtificialConfig, afterArtificialConfig)) {
    rows.push(
      createChangeRow({ id: 'process-artificial-node', name: _l('人工节点'), content: [CHANGE_STATUS.UPDATED] }),
    );
  }

  const ignoredConfigKeys = [...ARTIFICIAL_NODE_CONFIG_KEYS, 'pbcConfig'];

  if (!isEqual(omitConfig(before.config, ignoredConfigKeys), omitConfig(after.config, ignoredConfigKeys))) {
    rows.push(createChangeRow({ id: 'process-config', name: _l('流程设置'), content: [CHANGE_STATUS.UPDATED] }));
  }

  if ((beforePbcConfig !== undefined || afterPbcConfig !== undefined) && !isEqual(beforePbcConfig, afterPbcConfig)) {
    rows.push(createChangeRow({ id: 'process-pbc', name: _l('平台 API 能力'), content: [CHANGE_STATUS.UPDATED] }));
  }

  return rows;
};

const getProcessParameterControls = snapshot =>
  Object.values(snapshot.root.config || {}).flatMap(item => item?.template?.controls || []);

const getProcessParameterRows = (before, after) => {
  const beforeMap = new Map(getProcessParameterControls(before).map(control => [control.controlId, control]));
  const afterMap = new Map(getProcessParameterControls(after).map(control => [control.controlId, control]));
  const changes = [...new Set([...beforeMap.keys(), ...afterMap.keys()])]
    .filter(Boolean)
    .map(id => {
      const beforeControl = beforeMap.get(id);
      const afterControl = afterMap.get(id);

      if (beforeControl?.controlName === afterControl?.controlName) return null;
      if (!beforeControl) return _l('%0：新增', afterControl.controlName || _l('未命名参数'));
      if (!afterControl) return _l('%0：删除', beforeControl.controlName || _l('未命名参数'));
      return _l('名称：%0', formatChangedValue(beforeControl.controlName, afterControl.controlName));
    })
    .filter(Boolean);

  return changes.length
    ? [createChangeRow({ id: 'process-parameter-name', name: _l('流程参数名称'), content: changes })]
    : [];
};

/**
 * 节点连线在增删节点时会跟随变化，不重复归为相邻节点配置更新。
 * _id 只用于配对；其余保留字段是节点自身的业务配置。
 */
const IGNORED_NODE_FIELDS = new Set(['_id', 'nextId', 'prveId', 'prevId', 'flowIds']);

const getComparableNode = node => {
  if (!node) return { name: '', config: undefined };

  const normalized = Object.fromEntries(Object.entries(node).filter(([key]) => !IGNORED_NODE_FIELDS.has(key)));
  const { name = '', ...config } = normalized;

  return { name, config };
};

const getNodeRows = (before, after) => {
  const beforeMap = new Map((before.flowNodes || []).map(node => [node._id, node]));
  const afterMap = new Map((after.flowNodes || []).map(node => [node._id, node]));

  return [...new Set([...beforeMap.keys(), ...afterMap.keys()])]
    .filter(Boolean)
    .map(id => {
      const beforeNode = beforeMap.get(id);
      const afterNode = afterMap.get(id);
      const beforeComparable = getComparableNode(beforeNode);
      const afterComparable = getComparableNode(afterNode);

      if (beforeNode && afterNode && isEqual(beforeComparable, afterComparable)) {
        return null;
      }

      const action = !beforeNode ? CHANGE_STATUS.ADDED : !afterNode ? CHANGE_STATUS.DELETED : CHANGE_STATUS.UPDATED;
      const content = [];

      if (action === CHANGE_STATUS.UPDATED && beforeComparable.name !== afterComparable.name) {
        content.push(_l('名称：%0', formatChangedValue(beforeComparable.name, afterComparable.name)));
      }

      if (action === CHANGE_STATUS.UPDATED && !isEqual(beforeComparable.config, afterComparable.config)) {
        content.push(CHANGE_STATUS.UPDATED);
      }

      return createChangeRow({
        id: `process-node-${id}`,
        name: afterNode?.name || beforeNode?.name || _l('未命名节点'),
        action,
        content: content.length ? content : [action],
      });
    })
    .filter(Boolean);
};

/** 将工作流两侧快照整理为基础信息和节点明细。 */
export const normalizeProcessContrastDetail = (detail, options) => {
  if (!detail) return {};

  const { before, after } = getContrastSides(
    parseProcessSnapshot(detail.data),
    parseProcessSnapshot(detail.originalData),
    options,
  );

  return {
    basicInfo: [...getProcessBasicInfoRows(before.process, after.process), ...getProcessParameterRows(before, after)],
    nodes: getNodeRows(before.process, after.process),
  };
};
