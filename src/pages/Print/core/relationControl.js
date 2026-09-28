export const mergeRelationControl = (control = {}, data = {}) => {
  const mergedControl = { ...control, ...data };
  const isSheetField = control.type === 30 || data.type === 30;

  if (!isSheetField) {
    return mergedControl;
  }

  const sourceOptions = data.sourceControl?.options?.length
    ? data.sourceControl.options
    : control.sourceControl?.options;

  return {
    ...mergedControl,
    type: 30,
    sourceControlType: control.sourceControlType || data.sourceControlType,
    ...((control.sourceControl || data.sourceControl) && {
      sourceControl: {
        ...(control.sourceControl || {}),
        ...(data.sourceControl || {}),
        ...(sourceOptions ? { options: sourceOptions } : {}),
      },
    }),
  };
};

export const getRelationCoverControlId = control => {
  const { coverCid, advancedSetting = {} } = control || {};
  const { showtype = '3', choosecoverid } = advancedSetting;

  return showtype === '3' ? choosecoverid : coverCid;
};

export const isUnsupportedRelationCardControl = control => {
  const sourceControlType = control?.sourceControlType || control?.sourceControl?.type;

  return [14, 41].includes(control?.type) || (control?.type === 30 && [14, 41].includes(sourceControlType));
};

export const getRelationTitleAdvancedSetting = ({
  relationAdvancedSetting = {},
  sourceAdvancedSetting,
  titleAdvancedSetting,
  sourceControlType,
}) => {
  if ([15, 16].includes(sourceControlType)) {
    return sourceAdvancedSetting && Object.keys(sourceAdvancedSetting).length
      ? sourceAdvancedSetting
      : titleAdvancedSetting || {};
  }

  return Object.assign(relationAdvancedSetting, sourceAdvancedSetting || {});
};

export const getRelationCardPrintConfig = (control, showControlIds = [], titleControlId) => {
  const relationControls = control?.relationControls || [];
  const displayControlIds = Array.isArray(showControlIds) ? showControlIds : [];
  const showControlsList = displayControlIds
    .map(controlId =>
      relationControls.find(
        item =>
          item.controlId === controlId && (titleControlId ? item.controlId !== titleControlId : item.attribute !== 1),
      ),
    )
    .filter(item => item && !isUnsupportedRelationCardControl(item));
  const coverControlId = getRelationCoverControlId(control);
  const hasCoverControl =
    !!coverControlId &&
    displayControlIds.includes(coverControlId) &&
    relationControls.some(item => item.controlId === coverControlId);

  return { showControlsList, coverControlId, hasCoverControl };
};
