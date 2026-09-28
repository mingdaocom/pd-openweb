import _ from 'lodash';

const COMPLEX_CONTROL_TYPES = new Set([29, 34]);

const getControlIdsFromFilter = (filter = {}) => {
  const ids = [];

  if (filter.controlId) {
    ids.push(filter.controlId);
  }

  (filter.dynamicSource || []).forEach(item => {
    if (item.cid) {
      ids.push(item.cid);
    }
  });

  return ids;
};

const getControlIdsFromRule = rule => {
  const ids = [];

  (rule.filters || []).forEach(filterGroup => {
    (filterGroup.groupFilters || []).forEach(filter => {
      ids.push(...getControlIdsFromFilter(filter));
    });
  });

  (rule.ruleItems || []).forEach(ruleItem => {
    (ruleItem.controls || []).forEach(control => {
      if (control.controlId) {
        ids.push(control.controlId);
      }
    });
  });

  return _.uniq(ids.filter(_.identity));
};

const getTargetControlIdsFromRule = rule => {
  const ids = [];

  (rule.ruleItems || []).forEach(ruleItem => {
    (ruleItem.controls || []).forEach(control => {
      if (control.controlId) {
        ids.push(control.controlId);
      }

      (control.childControlIds || []).forEach(childControlId => {
        ids.push(childControlId);
      });
    });
  });

  return _.uniq(ids.filter(_.identity));
};

const hasComplexControl = (rule, controlTypeMap) => {
  return (
    (rule.filters || []).some(filterGroup =>
      (filterGroup.groupFilters || []).some(filter => COMPLEX_CONTROL_TYPES.has(controlTypeMap[filter.controlId])),
    ) ||
    (rule.ruleItems || []).some(ruleItem =>
      (ruleItem.controls || []).some(
        control =>
          (control.childControlIds || []).length || COMPLEX_CONTROL_TYPES.has(controlTypeMap[control.controlId]),
      ),
    )
  );
};

export const buildRuleDependencyIndex = (rules = [], data = []) => {
  const controlTypeMap = data.reduce((map, item) => {
    map[item.controlId] = item.type;
    return map;
  }, {});
  const depsMap = {};
  const alwaysRules = [];
  const ruleTargetControlIdsMap = new Map();

  rules.forEach(rule => {
    const ids = getControlIdsFromRule(rule);
    ruleTargetControlIdsMap.set(rule, getTargetControlIdsFromRule(rule));

    if (!ids.length || hasComplexControl(rule, controlTypeMap)) {
      alwaysRules.push(rule);
      return;
    }

    ids.forEach(id => {
      depsMap[id] = depsMap[id] || [];
      depsMap[id].push(rule);
    });
  });

  return { depsMap, alwaysRules, ruleTargetControlIdsMap };
};

export const getRuleUpdateContext = ({
  rules = [],
  ruleDependencyIndex,
  updateControlIds = [],
  currentRuleControlIds = [],
  checkAllUpdate = false,
}) => {
  const dependencyControlIds = _.uniq(updateControlIds.concat(currentRuleControlIds).filter(_.identity));

  if (checkAllUpdate || !ruleDependencyIndex || !dependencyControlIds.length) {
    return {
      rules,
      affectedControlIds: [],
      isPartial: false,
    };
  }

  const affectedRules = new Set(rules.filter(rule => rule.type !== 1).concat(ruleDependencyIndex.alwaysRules || []));
  const stateDependencyControlIds = new Set(dependencyControlIds);
  const propagatedRules = new Set();
  const controlQueue = dependencyControlIds.slice();

  const addStateDependencyControlIds = rule => {
    ((ruleDependencyIndex.ruleTargetControlIdsMap || new Map()).get(rule) || []).forEach(controlId => {
      if (!stateDependencyControlIds.has(controlId)) {
        stateDependencyControlIds.add(controlId);
        controlQueue.push(controlId);
      }
    });
  };

  (ruleDependencyIndex.alwaysRules || []).forEach(rule => {
    if (rule.type !== 1) {
      propagatedRules.add(rule);
      addStateDependencyControlIds(rule);
    }
  });

  dependencyControlIds.forEach(controlId => {
    (ruleDependencyIndex.depsMap[controlId] || []).forEach(rule => affectedRules.add(rule));
  });

  while (controlQueue.length) {
    const controlId = controlQueue.shift();

    (ruleDependencyIndex.depsMap[controlId] || []).forEach(rule => {
      affectedRules.add(rule);

      if (rule.type !== 1 && !propagatedRules.has(rule)) {
        propagatedRules.add(rule);
        addStateDependencyControlIds(rule);
      }
    });
  }

  const nextRules = rules.filter(rule => rule.type !== 1 || affectedRules.has(rule));
  const affectedControlIds = _.uniq(
    Array.from(affectedRules).reduce(
      (ids, rule) => ids.concat((ruleDependencyIndex.ruleTargetControlIdsMap || new Map()).get(rule) || []),
      [],
    ),
  );

  return {
    rules: nextRules,
    affectedControlIds,
    isPartial: nextRules.length < rules.length,
  };
};

export const filterRulesByDependency = props => {
  return getRuleUpdateContext(props).rules;
};
