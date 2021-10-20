export default {
  /**
   * 会话类型
   */
  SESSIONTYPE_USER: 1,
  SESSIONTYPE_GROUP: 2,
  SESSIONTYPE_SYSTEM: 3,
  SESSIONTYPE_POST: 4,
  SESSIONTYPE_CALENDAR: 5,
  SESSIONTYPE_TASK: 6,
  SESSIONTYPE_KNOWLEDGE: 7,
  SESSIONTYPE_HR: 8,
  SESSIONTYPE_WORKSHEET: 9,
  SESSIONTYPE_WORKFLOW: 10,
  /**
   * 消息的发送模式
   */
  INPUT_MODE_ENTER: 1, // enter 提交方式
  INPUT_MODE_CTRLENTER: 2, // ctrl+enter 提交方式
  /**
   * 消息类型
   * @type {number}
   */
  MSGTYPE_TEXT: 1, // 文本消息
  MSGTYPE_PIC: 2, // 图片消息
  MSGTYPE_EMOTION: 2, // 图片类型的表情消息
  MSGTYPE_AUDIO: 3, // 音频消息
  MSGTYPE_FILE: 4, // 文件消息
  MSGTYPE_CARD: 5, // 卡片消息
  MSGTYPE_MAP: 6, // 地理位置消息
  MSGTYPE_APP_VIDEO: 7, // 短视频消息
  MSGTYPE_SYSTEM_SUCCESS: 1, // 成功型系统消息
  MSGTYPE_SYSTEM_ERROR: 2, // 错误型系统消息

  GROUPACTION: {
    Delete: '0', // 删除群组
    Add: '1', // 创建群组
    RENAME: 'RENAME', // 群组重命名
    ADD_MEMBER: 'ADD_MEMBER', // 群组加人
    ADD_MEMBERS: 'ADD_MEMBERS', // 群组加多人
    REMOVE_MEMBER: 'REMOVE_MEMBER', // 群组移除成员
    ADD_ADMIN: 'ADD_ADMIN', // 群组设置群组管理员
    REMOVE_ADMIN: 'REMOVE_ADMIN', // 群组移除管理员
    EXIT_GROUP: 'EXIT_GROUP', // 退出群组
    DELETE: 'DELETE',
    CLOSE_GROUP: 'CLOSE_GROUP', // 关闭群组
    UPDATE_POST: 'UPDATE_POST', // 讨论组转群组
    TROUBLE_FREE: 'TROUBLE_FREE', // 消息免打扰,
    UPDATE_AVATAR: 'UPDATE_AVATAR', // 群组头像
    UPDATE_DESC: 'UPDATE_DESC',
    FORBID_SPEAK: 'FORBID_SPEAK',
    FORBID_INVITE: 'FORBID_INVITE',
  },

  FILE_TRANSFER: {
    id: 'file-transfer',
    type: 1,
    avatar: '/src/common/mdcss/Themes/icons/chat_uploadhelper.png',
    name: _l('文件传输助手'),
    description: _l('支持在设备之间轻松传输多种类型文件'),
  },
};
