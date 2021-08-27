export default {
  isReady: true,

  // 是否请求完成
  isRequestComplete: true,

  // 网络id
  projectId: '',

  // 项目id
  folderId: '',

  // 服务端时间
  timeStamp: '',

  // 项目中任务的最小的开始时间
  minStartTime: '',

  // 项目中任务的最大的结束时间
  maxEndTime: '',

  // 任务状态
  TASKSTATUS: {
    NO_COMPLETED: 0,
    COMPLETED: 1,
    ALL: -1,
  },

  // 工作时间段
  workingTimes: [['09:00', '18:00']],

  // 工作时长
  workingSumHours: 9,

  // 视图类型
  VIEWTYPE: {
    DAY: 1,
    WEEK: 2,
    MONTH: 3,
  },

  // 时间颗粒度
  GRANULARITY: {
    DAY: 8,
    WEEK: 4,
    MONTH: 1,
  },

  // 过滤周几
  filterWeekendDay: [0, 6],

  // 子任务层级
  SUBTASKLEVEL: {
    ALL: 0,
    ONE: 1,
    TWO: 2,
    THREE: 3,
    FOUR: 4,
    FIVE: 5,
  },

  // 单侧时间
  SINGLE_TIME: {
    START: 1,
    END: 2,
  },

  // 箭头状态
  ARROW_STATUS: {
    NULL: 0, // 无
    OPEN: 1, // 打开
    CLOSED: 2, // 关闭
  },

  // 任务名称长度
  TASK_NAME_SIZE: 136,

  // 提示文案最大长度
  TASK_MESSAGE_SIZE: 80,

  // DRAG 类型
  DRAG_GANTT: 'gantt',

  // 鼠标点击坐标
  mouseOffset: {
    left: 0,
    top: 0,
  },

  // 鼠标相对元素的位置偏移量
  offset: {
    x: 0,
    y: 0,
  },

  // 记录拖拽偏移小时数
  diffHours: 0,

  // 记录拖拽开始的原始时间
  originalStartTime: '',

  // 记录拖拽结束的原始时间
  originalEndTime: '',

  // 记录拖拽开始时间
  oldStartTime: '',

  // 记录拖拽结束时间
  oldEndTime: '',

  // 新开始时间
  newStartTime: '',

  // 新结束时间
  newEndTime: '',

  // 记录拖拽元素原始位置
  offsetX: 0,

  // 记录拖拽元素scrollLeft
  scrollLeft: 0,

  // 滚动条监听滚动
  setInterval: '',

  // 记录单侧拖动的taskId
  singleDragTaskId: '',

  // 记录任务时间类型
  recordSingleTime: '',

  // 隐藏最后的tips
  isHiddenLastTips: false,

  // 拖拽方向
  DRAG_DIRECTION: {
    LEFT: 1,
    RIGHT: 2,
  },

  // 单侧拖拽项
  dragItem: '',

  // 单侧拖拽项下标
  DARG_INDEX: 0,

  // 拖拽结束 防止弹出详情层
  isEndDrag: false,

  // 处理第一次拖单侧的时候触发了整个大的拖拽的bug
  isSingleDrag: false,

  // 滚动元素
  scrollSelector: '',
};
