const config = {
  defaultState: {
    viewType: 1, // 子母视图
    projectId: '', // 当前网络id
    lastMyProjectId: 'all', // 我的任务记住网络的筛选项
    attachmentViewType: 1, // 文件视图 1 列表视图 2 缩略图视图
    folderId: '', // 项目id
    filterUserId: '', // 他人id
    taskFilter: 6, // 全部
    listStatus: 0, // 任务状态 0  1  -1 未完成 已完成 全部
    listSort: 10, // 列表排序
    completeTime: '', // 完成日期
    keyWords: '',
    searchKeyWords: '', // 搜索关键字
    isSubUser: false, // 是否是下属
    filterSettings: {
      tags: [],
      customFilter: {},
      selectChargeIds: [], // 选中的负责人id
      folderSearchRange: 6, // 项目搜索范围  6: 所有任务  7: 与我相关
    },
  },

  isGetData: false, // 重新拉取数据

  clearFilterSettings: {
    keyWords: '',
    searchKeyWords: '',
    filterSettings: {
      tags: [],
      customFilter: {},
      selectChargeIds: [],
      folderSearchRange: 6,
    },
  },

  folderViewType: {
    treeView: 1, // 子母视图
    stageView: 2, // 阶段视图
    folderDetail: 3, // 项目详情
    attachment: 4, // 项目文件
    folderChart: 5, // 项目统计
    taskGantt: 6, // 甘特图
  },

  taskFilterDict: {
    6: 'all',
    2: 'responsible',
    3: 'trust',
    1: 'participate',
    7: 'otherAndMe',
    8: 'star',
    9: 'subordinate',
    10: 'visibleOtherResponsible',
  },

  MYTASKTYPES: {
    0: _l('待完成'),
    1: _l('今天要做'),
    2: _l('最近要做'),
    3: _l('以后考虑'),
  },

  // `我的任务`分类
  TIPS: {
    0: _l('待完成的任务，点击任务前的按钮分配何时开始任务'),
    1: _l('这个分类下是你计划今天要做的任务'),
    2: _l('这个分类下是你计划近期开始要做的任务'),
    3: _l('这个分类下是你计划以后要做的任务'),
  },

  // 权限
  auth: {
    None: 0, // 无权限
    Charger: 1, // 负责人权限
    Member: 2, // 成员有权限
    Look: 3, // 查看权限
    Null: 4, // 表示查看的对象不存在
    FolderCharger: 5, // 项目负责人
    FolderMember: 6, // 项目成员
    SubordinateUsers: 7, // 下属任务
    FolderAdmin: 8, // 项目管理员
    VisibleGroup: 9, // 可见群组
  },

  structure: {
    list: 0,
    folderList: 1,
    myClassify: 2,
  },

  isDrop: false, // 是否拖拽
  $prevNode: null,
  pageSize: Math.ceil(($(window).height() - 140) / 48) + 5 > 20 ? Math.ceil(($(window).height() - 140) / 48) + 5 : 20,
  selectize: '',
  isMyTask: true, // 是否是`我的任务`
  FilterMeTaskClassify: [3], // 排除的`我的任务`分类 默认
  FilterTaskID: [], // 排除的`我的任务` 打开分类 的 已有taskID
  BrowserScrollWidth: 0, // 滚动条宽度
  groundGlassHtml: '<div class="ThemeBG taskGroundGlass"></div>',
  detailDescMaxLength: 20000, // 任务描述最长字数

  configHtml: {
    searchNullHtml:
      '<div id="taskSearchNullTask"><div class="searchNullTip boderRadAll_3"><i class="taskNullSearch"></i><div>' +
      _l('没有搜索到相关任务') +
      '</div></div><div class="ThemeBG taskGroundGlass"></div></div>',
    filterNullHtml:
      '<div id="taskSearchNullTask"> <div class="filterNullTip boderRadAll_3"><i class="taskNullFilter"></i><div>' +
      _l('没有筛选结果') +
      '</div></div><div class="ThemeBG taskGroundGlass"></div></div>',
    noCompleteNullHtml:
      '<div id="taskSearchNullTask"><div class="noCompleteTip boderRadAll_3"><i class="taskNullFilter"></i><div>' +
      _l('没有已完成任务') +
      '</div></div><div class="ThemeBG taskGroundGlass"></div></div>',
  },
};

export default config;

export const OPEN_TYPE = {
  slide: 1,
  detail: 2,
  dialog: 3,
};

export const RELATION_TYPES = {
  task: 1,
  folder: 2,
};
