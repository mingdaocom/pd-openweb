// 选择文件对话框选择结果的类型
export const PICK_TYPE = {
  MY: 1,
  ROOT: 2,
  NODE: 3,

  STARED: 4,
  RECENT: 5,
  GLOBAL_SEARCH: 6,
  RECYCLE_BIN: -1,
};

// 共享文件夹过滤类型
export const ROOT_FILTER_TYPE = {
  ALL: 0,
  JOIN: 2,
  OWN: 1,
  DELETE: -1,
};

export const ROOT_PERMISSION_TYPE = {
  NONE: -1,
  ALL: 0,
  OWNER: 1, // 拥有者
  ADMIN: 2, // 管理员
  NORMAL: 3, // 可编辑（原普通成员）
  READONLY: 4, // 只读
};

export const PERMISSION_TYPE_NAME = {
  1: '拥有者',
  2: '管理员',
  3: '可编辑',
  4: '只读',
};

// 节点状态
export const NODE_STATUS = {
  DELETED: -1,
  ALL: 0, // 所有
  NORMAL: 1, // 正常
  RECYCLED: 2, // 回收站
};

// 节点类型
export const NODE_TYPE = {
  ALL: 0,
  FOLDER: 1,
  FILE: 2,
};
// 节点排序字段
export const NODE_SORT_BY = {
  CREATE_TIME: 1,
  UPDATE_TIME: 2,
  NAME: 3,
  SIZE: 4,
};
// 节点排序类型
export const NODE_SORT_TYPE = {
  ASC: 1,
  DESC: 2,
};
// 节点操作类型
export const NODE_OPERATOR_TYPE = {
  MOVE: 1,
  COPY: 2,
};

// 节点可见类型
export const NODE_VISIBLE_TYPE = {
  CLOSE: 1, // 关闭分享
  PROJECT: 2, // 本网络可见
  MDUSER: 3, // 登录后可见
  PUBLIC: 4, // 允许任何人查看
};

// 文件预览类型
export const NODE_VIEW_TYPE = {
  OTHER: -1,
  NONE: 0,
  PICTURE: 1, // 图片
  IFRAME: 2, // 通过 iframe 预览，如 Office 文件和 txt 文件
  CODE: 3, // 代码文件
  MARKDOWN: 4, // markdown
  LINK: 5, // 链接文件
};

// 重名时选择的操作类型
export const EXIST_NAME_TYPE = {
  NONE: 0, // 不操作
  REWRITENAME: 1, // 重写名称
  MERGE: 2, // 合并节点
};
// 上传状态
export const UPLOAD_STATUS = {
  QUEUE: 1,
  UPLOADING: 2,
  COMPLETE: 3,
  ERROR: 4,
};
// 上传错误类型
export const UPLOAD_ERROR = {
  INVALID_FILES: 1,
  TOO_MANY_FILES: 2,
};

// 七牛 bucket 类型
export const QINIU_BUCKET = {
  MD_PUB: 2,
  MD_DOC: 3,
  MD_PIC: 4,
  MD_FILE: 5,
};

// 日志类型
export const LOG_TYPE = {
  CREATE: 1, // 创建
  RECYCLED: 2, // 放入回收站
  DELETED: 3, // 彻底删除
  RECOVERY: 4, // 恢复节点
  RENAME: 5, // 重命名
  SHARE: 6, // 变更节点分享范围
  MOVE: 7, // 移动节点
  COPY: 8, // 复制节点
  DOWNLOAD: 9, // 变更节点下载
  EDIT: 10, // 变更节点编辑
  NEWVERSION: 16, // 上传了新版本
  CHILDADD: 201, // 子节点新增
  CHILDMOVE: 202, // 子节点移动
  CHILDRECYCLED: 203, // 子节点放入回收站
  CHILDDELETED: 204, // 子节点彻底删除
  CHILDRESTORE: 205, // 子节点恢复
  OFFICEEDIT: 206, // office文档被修改
  EDITLINK: 15, // 链接内容被修改
};

export const ROOT_LOG_TYPE = {
  CREATE: 1, // 创建
  RECYCLED: 2, // 放入回收站
  DELETED: 3, // 彻底删除
  RECOVERY: 4, // 恢复节点
  ADDMEMBER: 5, // 新增成员
  DELETEMEMBER: 6, // 删除成员
  SHARE: 7, // 变更成员权限
  RENAME: 8, // 重命名
  EXITMEMBER: 9, // 退出共享文件夹
  INVITEMEMBER: 10, // 邀请成员
  CHILDADD: 201, // 子节点新增
  CHILDMOVE: 202, // 子节点移动
  CHILDRECYCLED: 203, // 子节点放入回收站
  CHILDDELETED: 204, // 子节点彻底删除
  CHILDRESTORE: 205, // 子节点恢复
};

// 返回值类型
export const EXECUTE_RESULT = {
  FAIL: 0, // 失败
  SUCCESS: 1, // 成功
  NO_RIGHT: 2, // 没有权限
  EXIST_NAME: 3, // 节点名称存在
  NO_EXIST_PATH: 4, // 节点路径已不存在, 移到根节点下，属于成功
  NO_EXIST_NODE: 5, // 节点已删除
};

export const EXECUTE_ERROR_MESSAGE = {
  fail: '操作失败，请稍后重试！',
  success: '操作成功',
  noRight: '操作成功（部分文件您无权操作）',
  existName: '操作失败，目标位置存在同名文件夹',
  noExistPath: '目标位置不存在',
  noExistNode: '操作失败，您选中的文件不存在',
  error: '发生多种错误，如需确认，请逐条操作',
};

export const CONSTANT = {
  MAX_FILE_COUNT: 300,
};
