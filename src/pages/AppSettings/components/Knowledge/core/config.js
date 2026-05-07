// 数据筛选只支持 单选、多选、等级、检查框
export const DATA_FILTER_FIELD_TYPES = [9, 10, 11, 28, 36];

// 支持的基础字段，文本、文本组合、附件、富文本、
export const SUPPORT_FIELD_TYPES = [2, 14, 32, 41, 100];

export const SYSTEM_FIELD_IDS = [
  'uaid',
  'wfname',
  'wfcuaids',
  'wfcaid',
  'wfctime',
  'wfrtime',
  'wfftime',
  'wfstatus',
  'rowid',
  'ownerid',
  'caid',
  'ctime',
  'utime',
  'daid',
  'wfcotime',
  'wfdtime',
];

export const ViewMode = {
  LIST: 'list',
  DETAIL: 'detail',
};

export const KnowledgeDetailViewMode = {
  WORKSHEET: 'worksheet',
  CHUNK_PREVIEW: 'chunkPreview',
};

export const STATUS_FROM = {
  KNOWLEDGE: 'knowledge',
  COLLECTION: 'collection',
};
// 分块类型，接口 types
export const CHUNK_TYPE = {
  record: ['record'],
  attachment: ['record_attachment', 'discussion_attachment'],
  record_attachment: ['record_attachment'],
  discussion_attachment: ['discussion_attachment'],
  discussion: ['discussion'],
};

export const CHUNK_TYPE_TEXT = {
  record: _l('记录'),
  record_attachment: _l('记录附件'),
  discussion_attachment: _l('讨论附件'),
  discussion: _l('讨论'),
};

// 分块预览tab类型
export const TAB_TYPE = {
  RECORD: 'record',
  ATTACHMENT: 'attachment',
  DISCUSSION: 'discussion',
};

// 附件类型
export const ATTACHMENT_TYPE = {
  RECORD_ATTACHMENT: 'record_attachment',
  DISCUSSION_ATTACHMENT: 'discussion_attachment',
};

export const ATTACHMENT_TYPE_ENUM = [ATTACHMENT_TYPE.RECORD_ATTACHMENT, ATTACHMENT_TYPE.DISCUSSION_ATTACHMENT];

// 分块预览tab列表
export const CHUNK_PREVIEW_TABS = [
  { text: _l('记录'), value: TAB_TYPE.RECORD },
  { text: _l('附件'), value: TAB_TYPE.ATTACHMENT },
  { text: _l('讨论'), value: TAB_TYPE.DISCUSSION },
];

export const SEARCH_TYPE_ENUM = {
  RECORD: 'record',
  DISCUSSION: 'discussion',
  RECORD_ATTACHMENT: 'record_attachment',
  DISCUSSION_ATTACHMENT: 'discussion_attachment',
};

export const All_SEARCH_TYPES = [
  SEARCH_TYPE_ENUM.RECORD,
  SEARCH_TYPE_ENUM.DISCUSSION,
  SEARCH_TYPE_ENUM.RECORD_ATTACHMENT,
  SEARCH_TYPE_ENUM.DISCUSSION_ATTACHMENT,
];

export const SELECT_SEARCH_DOC_TYPES = [
  { label: _l('记录'), value: SEARCH_TYPE_ENUM.RECORD },
  { label: _l('讨论'), value: SEARCH_TYPE_ENUM.DISCUSSION },
  { label: _l('记录附件'), value: SEARCH_TYPE_ENUM.RECORD_ATTACHMENT },
  { label: _l('讨论附件'), value: SEARCH_TYPE_ENUM.DISCUSSION_ATTACHMENT },
];

export const SEARCH_MODE = {
  VECTOR: 'vector',
  KEYWORD: 'keyword',
  HYBRID: 'hybrid',
};

export const SELECT_SEARCH_MODES = [
  { label: _l('混合检索'), value: SEARCH_MODE.HYBRID },
  { label: _l('语义检索'), value: SEARCH_MODE.VECTOR },
  { label: _l('关键词检索'), value: SEARCH_MODE.KEYWORD },
];

export const ATTACHMENT_TYPE_FILTERS = [
  { label: _l('记录附件'), value: ATTACHMENT_TYPE.RECORD_ATTACHMENT },
  { label: _l('讨论附件'), value: ATTACHMENT_TYPE.DISCUSSION_ATTACHMENT },
];

// 默认值
export const DEFAULT_TOP_K = 10;
export const DEFAULT_MIN_RELEVANCE = 0.4;
export const DEFAULT_RRF_K = 60;

// 范围
export const TOP_K_RANGE = {
  min: 1,
  max: 20,
  step: 1,
};
export const MIN_RELEVANCE_RANGE = {
  min: 0.1,
  max: 1,
  step: 0.1,
};
export const RRF_K_RANGE = {
  min: 0,
  max: 100,
  step: 1,
};

export const SPLICE_TYPE = {
  1: '且',
  2: '或',
};

export const FILTER_CONDITION_TYPE = {
  // 单选
  9: {
    2: _l('是其中一个'),
    6: _l('不是任何一个'),
    7: _l('为空'),
    8: _l('不为空'),
    51: _l('是'),
  },
  11: {
    2: _l('是其中一个'),
    6: _l('不是任何一个'),
    7: _l('为空'),
    8: _l('不为空'),
    51: _l('是'),
  },
  // 多选
  10: {
    2: _l('包含其中一个'),
    6: _l('不包含任何一个'),
    7: _l('为空'),
    8: _l('不为空'),
    26: _l('等于'),
    27: _l('不等于'),
    28: _l('同时包含'),
  },
  // 等级
  28: {
    2: _l('是其中一个'),
    6: _l('不是任何一个'),
    7: _l('为空'),
    8: _l('不为空'),
    11: _l('在范围内'),
    12: _l('不在范围内'),
    13: _l('大于'),
    14: _l('大于等于'),
    15: _l('小于'),
    16: _l('小于等于'),
  },
  // 检查项
  36: {
    2: _l('选中'),
    6: _l('未选中'),
  },
};

// 知识库状态
export const KNOWLEDGE_STATUS = {
  INIT_QUEUED: 'INIT_QUEUED',
  INITIALIZING: 'INITIALIZING',
  INIT_SUCCESS: 'INIT_SUCCESS',
  INIT_FAILED: 'INIT_FAILED',
  CHUNK_QUEUED: 'CHUNK_QUEUED',
  CHUNKING: 'CHUNKING',
  CHUNK_SUCCESS: 'CHUNK_SUCCESS',
  CHUNK_FAILED: 'CHUNK_FAILED',
  VECTOR_QUEUED: 'VECTOR_QUEUED',
  VECTORIZING: 'VECTORIZING',
  VECTOR_SUCCESS: 'VECTOR_SUCCESS',
  VECTOR_FAILED: 'VECTOR_FAILED',
};

// 是否显示知识库检索按钮
export const SHOW_KNOWLEDGE_SEARCH_STATUS = [
  KNOWLEDGE_STATUS.VECTOR_QUEUED,
  KNOWLEDGE_STATUS.VECTORIZING,
  KNOWLEDGE_STATUS.VECTOR_SUCCESS,
  KNOWLEDGE_STATUS.VECTOR_FAILED,
];

// 是否需要刷新知识源列表
export const COLLECTION_TASK_STATUS_NEEDS_REFRESH = [
  KNOWLEDGE_STATUS.INIT_QUEUED,
  KNOWLEDGE_STATUS.INITIALIZING,
  KNOWLEDGE_STATUS.INIT_SUCCESS,
  KNOWLEDGE_STATUS.CHUNK_QUEUED,
  KNOWLEDGE_STATUS.CHUNKING,
  KNOWLEDGE_STATUS.VECTOR_QUEUED,
  KNOWLEDGE_STATUS.VECTORIZING,
];

// 知识库分块计算中
export const KNOWLEDGE_STATUS_CHUNKING = [
  KNOWLEDGE_STATUS.INIT_QUEUED,
  KNOWLEDGE_STATUS.INITIALIZING,
  KNOWLEDGE_STATUS.INIT_SUCCESS,
  KNOWLEDGE_STATUS.CHUNK_QUEUED,
  KNOWLEDGE_STATUS.CHUNKING,
];

// 知识库向量化入库中
export const KNOWLEDGE_STATUS_INITIALIZING = [KNOWLEDGE_STATUS.VECTOR_QUEUED, KNOWLEDGE_STATUS.VECTORIZING];

// 知识库操作按钮可见状态
export const KNOWLEDGE_ACTION_VISIBLE_STATUS = {
  cancelVector: [KNOWLEDGE_STATUS.VECTOR_QUEUED, KNOWLEDGE_STATUS.VECTORIZING],
  reset: [KNOWLEDGE_STATUS.VECTOR_SUCCESS, KNOWLEDGE_STATUS.VECTOR_FAILED],
};

// 知识源操作按钮可见状态
export const COLLECTION_ACTION_VISIBLE_STATUS = {
  rePullData: [KNOWLEDGE_STATUS.INIT_FAILED],
  preview: [
    KNOWLEDGE_STATUS.CHUNK_SUCCESS,
    KNOWLEDGE_STATUS.CHUNK_FAILED,
    KNOWLEDGE_STATUS.VECTOR_QUEUED,
    KNOWLEDGE_STATUS.VECTORIZING,
    KNOWLEDGE_STATUS.VECTOR_SUCCESS,
    KNOWLEDGE_STATUS.VECTOR_FAILED,
  ],
  changeScope: [
    KNOWLEDGE_STATUS.CHUNK_SUCCESS,
    KNOWLEDGE_STATUS.CHUNK_FAILED,
    KNOWLEDGE_STATUS.VECTOR_SUCCESS,
    KNOWLEDGE_STATUS.VECTOR_FAILED,
  ],
};

export const SELECT_FIELD_TIP = _l(
  '选择向量化内容：支持标题、文本、文本组合、富文本、级联/关联（单条）、附件字段，以及讨论（含附件）。每条记录为一个分块，包含字段名和字段值，最高容纳 3500 字；附件、记录讨论按规则单独分块。',
);

export const FIELD_RULE_TIP_URL =
  'https://help.mingdao.com/application/vector-knowledge-base#configure-vectorization-fields';

export const LIMIT_TOAST = _l('知识库用量超限，请联系组织管理员增购额度');
