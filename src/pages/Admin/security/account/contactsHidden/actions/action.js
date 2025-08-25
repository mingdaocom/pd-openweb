import projectUserRule from 'src/api/projectUserRule.js';

export const showEditFn =
  (showEdit, editType = '', ruleId = '') =>
  dispatch => {
    dispatch({
      type: 'UPDATE_EDITTYPW',
      showEdit,
      editType,
    });
    if (showEdit) {
      if (!ruleId) {
        dispatch({
          type: 'RULES_BY_RULEID',
          ruleId: '',
          data: [],
        });
      } else {
        dispatch(getRulesByRuleId(ruleId));
      }
    }
  };

/**
 * action: 设置当前网络id
 * @param projectId
 */
export const updateProjectId = projectId => dispatch => {
  dispatch({
    type: 'UPDATE_PROJECT_ID',
    projectId,
  });
};

export const getRulesAll = projectId => dispatch => {
  dispatch({
    type: 'ACTION_ING',
  });
  //获取所有规则（带主作用对象）
  projectUserRule
    .getRulesWithMainTarget({
      projectId,
    })
    .then(data => {
      dispatch({
        type: 'ACTION_END',
      });
      dispatch({
        type: 'RULES_ALL',
        data,
      });
    });
};

export const deleteRules = (projectId, ruleId) => dispatch => {
  dispatch({
    type: 'ACTION_ING',
  });
  //删除 限制查看外部门规则
  projectUserRule
    .removeRule({
      projectId,
      ruleId,
    })
    .then(data => {
      if (data) {
        alert(_l('删除成功'));
        dispatch(getRulesAll(projectId));
      } else {
        dispatch({
          type: 'ACTION_END',
        });
        alert(_l('删除失败'), 2);
      }
    });
};

//获取单条规则
export const getRulesByRuleId = ruleId => (dispatch, getState) => {
  dispatch({
    type: 'ACTION_ING',
  });
  //获取单条规则
  projectUserRule
    .getRule({
      projectId: getState().contact.projectId,
      ruleId,
    })
    .then(data => {
      dispatch({
        type: 'ACTION_END',
      });
      dispatch({
        type: 'RULES_BY_RULEID',
        ruleId,
        data,
      });
    });
};

//update单条规则
export const updateRulesByRuleId = data => dispatch => {
  dispatch({
    type: 'UPDATE_RULES_BY_RULEID',
    data,
  });
};

export const saveFn = (projectId, items, ruleId, ruleType, errorCallback) => dispatch => {
  dispatch({
    type: 'ISLOADING',
    isSaveing: true,
  });
  let callback = res => {
    dispatch({
      type: 'ISLOADING',
      isSaveing: false,
    });
    if (res.success) {
      errorCallback([]);
      dispatch(showEditFn(false));
      dispatch(getRulesAll(projectId));
    } else {
      errorCallback(res.errorIds);
      alert(_l(res.errorMessage || '已设置规则成员， 不能重复设置'), 2, 5000);
    }
  };
  if (!ruleId) {
    projectUserRule
      .addRule({
        projectId,
        items,
        ruleType,
      })
      .then(
        res => {
          callback(res);
        },
        () => {},
      );
  } else {
    projectUserRule
      .resetRule({
        ruleId,
        projectId,
        items,
      })
      .then(
        res => {
          callback(res);
        },
        () => {},
      );
  }
};
