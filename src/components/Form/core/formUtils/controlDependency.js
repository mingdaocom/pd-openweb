import _ from 'lodash';

const addDependency = (dependencySets, controlId, targetControl) => {
  if (!controlId || !targetControl) return;

  if (!dependencySets[controlId]) {
    dependencySets[controlId] = new Set();
  }

  dependencySets[controlId].add(targetControl);
};

const setsToArrays = dependencySets =>
  Object.keys(dependencySets).reduce((result, controlId) => {
    result[controlId] = Array.from(dependencySets[controlId]);
    return result;
  }, {});

export const buildControlDependencyIndex = (data = []) => {
  const controlIds = data.map(item => item.controlId).filter(Boolean);
  const effectDependencySets = {};
  const asyncEffectDependencySets = {};
  const filterRegexDependencySets = {};

  data.forEach(targetControl => {
    const { advancedSetting = {}, dataSource = '', sourceControlId = '', type } = targetControl;
    const defaultFunctionExpression = _.get(safeParse(advancedSetting.defaultfunc), 'expression') || '';
    const filterRegex = type === 2 ? advancedSetting.filterregex || '' : '';
    const sourceExpressions = [dataSource, type === 38 ? sourceControlId : '', defaultFunctionExpression].filter(
      Boolean,
    );

    controlIds.forEach(controlId => {
      if (sourceExpressions.some(expression => expression.indexOf(controlId) > -1)) {
        addDependency(effectDependencySets, controlId, targetControl);
      }

      if (filterRegex.indexOf(controlId) > -1) {
        addDependency(filterRegexDependencySets, controlId, targetControl);
      }
    });

    safeParse(advancedSetting.defsource || '[]', 'array').forEach(source => {
      const dependencyControlId = source.rcid && source.cid ? source.rcid : !source.rcid ? source.cid : undefined;

      addDependency(
        source.isAsync ? asyncEffectDependencySets : effectDependencySets,
        dependencyControlId,
        targetControl,
      );
    });

    if (type === 37) {
      addDependency(effectDependencySets, dataSource.slice(1, -1), targetControl);
    }
  });

  return {
    effectControlDependencyMap: setsToArrays(effectDependencySets),
    asyncEffectControlDependencyMap: setsToArrays(asyncEffectDependencySets),
    filterRegexDependencyMap: setsToArrays(filterRegexDependencySets),
  };
};

export const buildRelationControlParentMap = (data = []) =>
  data.reduce((parentMap, parentControl) => {
    (parentControl.relationControls || []).forEach(control => {
      if (!control.controlId) return;

      parentMap[control.controlId] = parentMap[control.controlId] || [];
      if (!parentMap[control.controlId].includes(parentControl)) {
        parentMap[control.controlId].push(parentControl);
      }
    });

    return parentMap;
  }, {});

export const resolveLoadingControlId = ({
  controlId,
  parentControlId,
  controlMap = {},
  relationControlParentMap = {},
  data = [],
}) => {
  if (!controlId) return;

  if (parentControlId) {
    const parentControl = controlMap[parentControlId];
    const isOwnControl = parentControlId === controlId;
    const isRelationControl = (parentControl?.relationControls || []).some(
      control => control.controlId === controlId || controlId.includes(control.controlId),
    );

    return parentControl && (isOwnControl || isRelationControl) ? parentControlId : controlId;
  }

  if (controlMap[controlId]) {
    return controlId;
  }

  const exactParentControls = relationControlParentMap[controlId] || [];

  if (exactParentControls.length === 1) {
    return exactParentControls[0].controlId;
  }

  if (exactParentControls.length > 1) {
    return controlId;
  }

  if (data.some(item => controlId.includes(item.controlId))) {
    return controlId;
  }

  const matchingParentControls = data.filter(item =>
    (item.relationControls || []).some(control => controlId.includes(control.controlId)),
  );

  return matchingParentControls.length === 1 ? matchingParentControls[0].controlId : controlId;
};
