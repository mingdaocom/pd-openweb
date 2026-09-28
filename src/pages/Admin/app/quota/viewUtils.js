import _ from 'lodash';

/** 获取批量编辑允许的最大额度；未限制的业务返回 undefined。 */
export const getBatchMax = ({ businessType, limitRowTotal }) => {
  if (businessType === 1) return md.global.SysSettings.fileUploadLimitSize || 4 * 1024;
  if (businessType !== 2) return undefined;
  return (window.platformENV.isLocal || window.platformENV.isOverseas) && limitRowTotal ? limitRowTotal * 10 : 1000;
};

/** 根据业务类型和重置数量生成确认弹层文案。 */
export const getResetDescription = ({ businessType, resetRows = [], selectedCount = resetRows.length }) => {
  const resetCount = resetRows.length;
  const unsavedCount = Math.max(selectedCount - resetCount, 0);

  if (unsavedCount) {
    return businessType === 4
      ? _l(
          '所选%0个应用中，%1个尚未保存，需保存后才能重置。确定将把其余%2个应用的工作流执行数重置为0吗？',
          selectedCount,
          unsavedCount,
          resetCount,
        )
      : _l(
          '所选%0个应用中，%1个尚未保存，需保存后才能重置。确定将把其余%2个应用的已使用附件上传量重置为0吗？',
          selectedCount,
          unsavedCount,
          resetCount,
        );
  }

  if (resetCount > 1) {
    return businessType === 4
      ? _l('确定将所选%0个应用的工作流执行数重置为0吗？', resetCount)
      : _l('确定将所选%0个应用的已使用附件上传量重置为0吗？', resetCount);
  }

  const appName = _.get(resetRows[0], 'app.appName');

  return businessType === 4
    ? _l('确定将“%0”的工作流执行数重置为0吗？', appName)
    : _l('确定将“%0”的已使用附件上传量重置为0吗？', appName);
};

/** 生成不同额度业务在页面顶部展示的配置说明。 */
export const getLimitSizeInfo = ({ businessType, limitRowTotal }) => {
  const limitSize = md.global.SysSettings.fileUploadLimitSize || 4 * 1024;

  switch (businessType) {
    case 1:
      return _l(
        '系统支持的附件大小上限为 %0，可设置组织下允许的附件大小上限',
        `${window.platformENV.isOverseas || window.platformENV.isLocal ? limitSize + 'M' : '4G'}`,
      );
    case 2:
      return limitRowTotal || !(window.platformENV.isLocal || window.platformENV.isOverseas)
        ? _l(
            '设置每个工作表行记录数量上限。可为所有工作表全局配置，也可以为特殊的工作表单独设置。组织可设置最大上限为 %0万行 / 每个表',
            window.platformENV.isLocal || window.platformENV.isOverseas ? limitRowTotal : 100,
          )
        : _l('设置每个工作表行记录数量上限。可为所有工作表全局配置，也可以为特殊的工作表单独设置');
    case 3:
      return _l('设置应用中工作表附件字段、讨论附件，上传量的上限。可为所有应用全局配置，也可以为特殊的应用单独设置。');
    case 4:
      return _l('设置一天内每个应用的工作流执行次数上限。可为所有应用全局配置，也可以为特殊的应用单独设置。');
    default:
      return '';
  }
};
