const initialState = {
  loading: true,
  isEdit: false,//是否更改
  projectId: '',
  showEdit: false, //是否编辑规则
  editType: '', //编辑规则type
  data: [],
  dataByRuleId: [],
  ruleId: '',
}

export default (state = initialState, action) => {
  const { showEdit, type, editType = '', projectId, data, ruleId, isSaveing } = action;
  switch (type) {
    case 'ACTION_ING':
      return {
        ...state,
        loading: true,
      }
    case 'ACTION_END':
      return {
        ...state,
        loading: false,
      }
    case 'ISLOADING':
      return {
        ...state,
        isSaveing,
      }
    case 'UPDATE_PROJECT_ID':
      return {
        ...state,
        projectId
      }
    case 'UPDATE_EDITTYPW'://是否编辑规则
      return {
        ...state,
        showEdit,
        editType: showEdit ? editType : '',
      };
    case 'RULES_ALL':
      return {
        ...state,
        data: data,
        dataByRuleId: [],
        showEdit: false,
        isEdit: false,
        ruleId: '',
      };
    case 'RULES_BY_RULEID':
      return {
        ...state,
        ruleId,
        dataByRuleId: data,
        isEdit: false
      };
    case 'UPDATE_RULES_BY_RULEID':
      return {
        ...state,
        dataByRuleId: data,
        isEdit: true
      }
    default:
      return state;
  }
};
