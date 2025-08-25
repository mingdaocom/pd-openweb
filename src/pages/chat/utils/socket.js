import Constant from './constant';

export const Message = {
  /**
   * 发送消息
   * @param {*} type 个人消息 or 群组消息
   * @param {*} param 消息内容
   */
  send(type, param) {
    delete param.atParam;
    return new Promise((resolve, reject) => {
      if (type === Constant.SESSIONTYPE_USER) {
        IM.socket.emit('send message', param, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } else if (type === Constant.SESSIONTYPE_GROUP) {
        IM.socket.emit('send group message', param, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }
    });
  },
  /**
   * 抖动窗口
   * @param {*} type 个人消息 or 群组消息
   * @param {*} param
   */
  sendShake(type, param) {
    return new Promise((resolve, reject) => {
      if (type === Constant.SESSIONTYPE_USER) {
        IM.socket.emit('shake shake', param, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      } else if (type === Constant.SESSIONTYPE_GROUP) {
        IM.socket.emit('group shake', param, (err, data) => {
          if (err) {
            reject(err);
          } else {
            resolve(data);
          }
        });
      }
    });
  },
  /**
   * 语音消息标记已读
   * @param {*} param
   */
  markAudioAsRead(param) {
    IM.socket.emit('voice as read', param, () => {});
  },
  /**
   * 消息撤回
   * @param {*} type
   * @param {*} param
   */
  sendWithdrawMessgae(type, param) {
    return new Promise((resolve, reject) => {
      if (type === Constant.SESSIONTYPE_USER) {
        IM.socket.emit('withdraw user message', param, (err, data) => {
          if (err) {
            reject(data);
          } else {
            resolve(data);
          }
        });
      } else if (type === Constant.SESSIONTYPE_GROUP) {
        IM.socket.emit('withdraw group message', param, (err, data) => {
          if (err) {
            reject(data);
          } else {
            resolve(data);
          }
        });
      }
    });
  },
};

/**
 * 联系人相关
 */
export const Contact = {
  /**
   * 清除单个联系人未读计数
   * @param {*} param
   */
  clearUnread(param) {
    return new Promise((resolve, reject) => {
      switch (param.type) {
        case 1:
        case 2:
          break;
        case 3:
          param.type = 'system';
          break;
        case 4:
          param.type = 'post';
          break;
        case 5:
          param.type = 'calendar';
          break;
        case 6:
          param.type = 'task';
          break;
        case 7:
          param.type = 'knowledge';
          break;
        case 8:
          param.type = 'hr';
          break;
        case 9:
          param.type = 'worksheet';
          break;
        case 10:
          param.type = 'workflow';
          break;
        default:
          break;
      }
      if (param.type <= 2) {
        IM.socket.emit(
          'clear unread',
          {
            type: param.type,
            id: param.value,
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          },
        );
      } else {
        IM.socket.emit(
          'clear notification',
          {
            type: param.type,
            value: 0,
            clear: true,
          },
          (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          },
        );
      }
    });
  },
  /**
   * 清除所以未读计数
   */
  clearAllUnread() {
    return new Promise(resolve => {
      IM.socket.emit('clear all unread', {}, data => {
        resolve(data);
      });
    });
  },
  /**
   * 删除最近联系人
   * @param {*} param
   */
  remove(param) {
    return new Promise(resolve => {
      IM.socket.emit('remove session', param, data => {
        resolve(data);
      });
    });
  },
  /**
   * 设置当前联系人
   * @param {*} contact
   */
  setCurrentChat(contact) {
    if (contact && contact.value) {
      contact.id = contact.value;
      IM.socket.emit('current chat', contact, () => {});
    } else {
      IM.socket.emit('clear chat', {}, () => {});
    }
  },
  /**
   * 记录会话操作，同步到其他页面
   * @param {*} contact
   */
  recordAction(contact) {
    return new Promise(resolve => {
      IM.socket.emit(
        'operate',
        {
          contact: contact,
          isclose: contact.id ? false : true,
          isopen: contact.id ? true : false,
          // ismin: '',
          // closeAll: '',
        },
        function (data) {
          resolve(data);
        },
      );
    });
  },
  /**
   * 设置置顶
   * @param {*} param
   */
  setTop(param) {
    return new Promise(resolve => {
      IM.socket.emit('sticky on top', param, data => {
        resolve(data);
      });
    });
  },
  /**
   * 设置免打扰
   * @param {*} param
   */
  setSlience(param) {
    return new Promise(resolve => {
      IM.socket.emit('silence message', param, data => {
        resolve(data);
      });
    });
  },
};

/**
 * 获取上传token
 * @param {*} param
 */
export const fetchUploadToken = param => {
  return new Promise((resolve, reject) => {
    IM.socket.emit('upload token', param, (err, data) => {
      if (data.token && data.key) {
        resolve(data);
      } else {
        reject(data);
      }
    });
  });
};
