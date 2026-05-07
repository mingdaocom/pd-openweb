export const initialState = {
  loading: false,
  appId: null,
  projectId: null,
  aiLoading: true,
  // 工作表是否准备完成（AI推荐只返回工作表ID，需要通过ID获取工作表信息，icon，description）
  worksheetIsLoaded: false,
  // AI推荐方案列表
  recommendSchemes: [],
  // 默认自定义方案
  activeScheme: { id: 'createKnowledge' },
  activeStep: {
    id: 'selectSheet',
    title: _l('选择知识源（1/3）'),
  },
  stepList: [
    {
      id: 'selectSheet',
      title: _l('选择知识源（1/3）'),
    },
    {
      id: 'configFields',
      title: _l('配置字段（2/3）'),
    },
    {
      id: 'setNameAndDesc',
      title: _l('设置名称和说明（3/3）'),
    },
  ],
  /**
   * 已选工作表列表
   * worksheetId: 工作表 ID
   * worksheetName: 工作表名称
   * worksheet: 工作表基础信息
   * fields: 选择范围字段列表
   * filterConditions: 数据过滤条件
   * filterId: 数据过滤条件 ID
   * parseEnhanced: 解析增强 true | false
   * attachmentParseEnhanced: 附件解析增强 true | false
   * discussionEnabled: 记录讨论 true | false
   */
  selectedWorksheetList: [],
  backupData: {},
  // 所有工作表列表
  allWorksheetList: [],
  knowledgeName: '',
  knowledgeDesc: '',
};

export const reducer = (state = initialState, action) => {
  switch (action.type) {
    case 'SET_LOADING':
      return { ...state, loading: action.loading };
    case 'SET_BASIC_INFO':
      return { ...state, appId: action.appId, projectId: action.projectId };
    case 'UPDATE_ACTIVE_SCHEME':
      return { ...state, activeScheme: action.scheme };
    case 'UPDATE_ACTIVE_STEP':
      return {
        ...state,
        activeStep: action.step,
      };
    case 'SET_ALL_WORKSHEET_LIST':
      return { ...state, allWorksheetList: action.list };
    case 'SET_SELECTED_WORKSHEET_LIST':
      return { ...state, selectedWorksheetList: action.list };
    case 'ADD_SELECTED_WORKSHEET':
      return {
        ...state,
        selectedWorksheetList: [
          ...state.selectedWorksheetList,
          {
            ...action.sheet,
            fields: [],
            filterConditions: [],
            filterId: null,
            parseEnhanced: false,
            discussionEnabled: false,
            attachmentParseEnhanced: false,
          },
        ],
      };
    case 'REMOVE_SELECTED_WORKSHEET':
      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.filter(item => item.worksheetId !== action.worksheetId),
      };
    case 'RESET_SELECTED_WORKSHEET_LIST':
      return { ...state, selectedWorksheetList: [] };
    case 'ADD_SELECTED_FIELD':
      const { worksheetId, control } = action;
      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.map(item => {
          if (item.worksheetId !== worksheetId) return item;

          const fields = item.fields || [];
          const exists = fields.some(field => field.controlId === control.controlId);

          if (exists) return item;

          return {
            ...item,
            fields: [...fields, control],
          };
        }),
      };
    case 'REMOVE_SELECTED_FIELD': {
      const { worksheetId, control } = action;

      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.map(item => {
          if (item.worksheetId !== worksheetId) return item;

          return {
            ...item,
            fields: (item.fields || []).filter(field => field.controlId !== control.controlId),
          };
        }),
      };
    }

    case 'SET_FILTER_CONDITIONS':
      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.map(item =>
          item.worksheetId === action.worksheetId ? { ...item, filterConditions: action.filterConditions } : item,
        ),
      };
    case 'SET_WORKSHEET_PARSE_ENHANCED':
      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.map(item =>
          item.worksheetId === action.worksheetId ? { ...item, parseEnhanced: !item.parseEnhanced } : item,
        ),
      };
    case 'SET_WORKSHEET_ATTACHMENT_PARSE_ENHANCED':
      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.map(item =>
          item.worksheetId === action.worksheetId
            ? { ...item, attachmentParseEnhanced: !item.attachmentParseEnhanced }
            : item,
        ),
      };
    case 'SET_WORKSHEET_DISCUSSION_ENABLED':
      return {
        ...state,
        selectedWorksheetList: state.selectedWorksheetList.map(item =>
          item.worksheetId === action.worksheetId ? { ...item, discussionEnabled: !item.discussionEnabled } : item,
        ),
      };
    case 'SET_KNOWLEDGE_NAME':
      return {
        ...state,
        knowledgeName: action.name,
      };
    case 'SET_KNOWLEDGE_DESC':
      return {
        ...state,
        knowledgeDesc: action.desc,
      };
    case 'SET_AI_LOADING':
      return {
        ...state,
        aiLoading: action.loading,
      };
    case 'SET_KNOWLEDGE_RECOMMEND_SCHEMES':
      return {
        ...state,
        recommendSchemes: action.list,
      };
    case 'IMPROVE_KNOWLEDGE_RECOMMEND_SCHEMES':
      return {
        ...state,
        recommendSchemes: state.recommendSchemes.map(item =>
          item.id === action.id ? { ...item, ...action.preload } : item,
        ),
      };
    case 'SET_WORKSHEET_IS_LOADED':
      return {
        ...state,
        worksheetIsLoaded: action.loaded,
      };
    default:
      return state;
  }
};
