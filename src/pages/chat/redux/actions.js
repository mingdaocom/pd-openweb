import _ from 'lodash';
import { dateConvertToUserZone } from 'src/utils/project';
import * as utils from '../utils';
import * as ajax from '../utils/ajax';
import Constant from '../utils/constant';
import * as socket from '../utils/socket';

/**
 * 设置会话列表
 * @param {*} result
 */
export const setSessionList = result => (dispatch, getState) => {
  const { toolbarConfig } = getState().chat;
  dispatch({
    type: 'SET_SESSION_LIST',
    result: utils.sortSession(utils.formatSessionList(result), '', toolbarConfig.messageListShowType),
  });
};

/**
 * 添加更多的会话
 * @param {*} result
 */
export const addSessionList = result => (dispatch, getState) => {
  const { toolbarConfig } = getState().chat;
  dispatch({
    type: 'ADD_SESSION_LIST',
    result: utils.sortSession(utils.formatSessionList(result), '', toolbarConfig.messageListShowType),
  });
};

/**
 * 更新会话列表数据
 * @param {*} result
 */
export const updateSessionList = result => (dispatch, getState) => {
  const { sessionList, currentSessionList, toolbarConfig } = getState().chat;
  const newSessionList = _.cloneDeep(sessionList);
  const { id } = result;
  const adjust = [];

  newSessionList.forEach(item => {
    if (item.value === id) {
      // 草稿
      if ('sendMsg' in result) {
        item.sendMsg = result.sendMsg ? result.sendMsg : null;
        if (result.sendMsg) {
          adjust.push(item);
        }
      }
      // 计数
      if ('count' in result) {
        item.count = 'weak' in result ? item.count : (item.count || 0) + result.count;
        item.time = utils.formatMsgDate(dateConvertToUserZone(result.time || utils.getCurrentTime()));
        item.msg.con = result.msg;
        item.id = result.msgId;
        item.isPush = result.isPush;
        adjust.push(item);
        // 日程弱消息
        if ('weak' in result) {
          if (result.weak) {
            item.weak_count = result.count;
            item.isPush = item.count ? true : false;
          } else {
            item.count = item.count + result.count;
            item.isPush = true;
          }
        }
      }
      // 清除计数
      if ('clearCount' in result) {
        item.count = 0;
        item.messageCount = result.clearCount;
        if ('weak_count' in item) {
          item.weak_count = 0;
        }
      }
      // 清除未读消息计数
      if ('messageCount' in result) {
        item.messageCount = 0;
        item.messageAtlist = [];
      }
      // 添加会话
      if ('addMsg' in result) {
        item.time = utils.formatMsgDate(dateConvertToUserZone(result.time || utils.getCurrentTime()));
        item.msg.con = result.addMsg;
        adjust.push(item);
        delete item.isSession;
        let isSetTop = false;
        const newCurrentSessionList = currentSessionList.map(n => {
          if (n.id === item.value && 'isSession' in n) {
            isSetTop = true;
            n.isTop = false;
            delete n.isSession;
          }
          return n;
        });
        if (isSetTop) {
          dispatch({
            type: 'UPDATE_CURRENT_SESSION',
            result: newCurrentSessionList,
          });
        }
      }
      // 设置 @ 消息
      if ('atlist' in result) {
        item.atlist = result.atlist;
        if (result.atlist.length) {
          item.messageAtlist = result.atlist;
        } else if (result.isWithdraw) {
          // 如果是撤回的，必须得清空
          item.messageAtlist = [];
        }
        if (result.at_msg) {
          item.at_msg = result.at_msg;
        }
      }
      // 回复我
      if ('refer' in result) {
        item.refer = result.refer;
      }
      if ('reflist' in result) {
        item.reflist = result.reflist;
      }
      // 置顶
      if ('isTop' in result) {
        item.top_info = {
          isTop: result.isTop,
          time: result.time,
        };
        adjust.push(item);
      }
      // 标记非好友，不能聊天
      if ('isContact' in result) {
        item.isContact = result.isContact;
      }
      // 系统消息
      if ('showBadge' in result) {
        item.showBadge = result.showBadge;
      }
    }
  });
  // 新的计数会话排到第一个位置
  if (adjust.length) {
    const { value } = adjust[0];
    const list = newSessionList.filter(item => value !== item.value);
    dispatch({
      type: 'SET_SESSION_LIST',
      result: utils.sortSession(adjust.concat(list), value, toolbarConfig.messageListShowType),
    });
  } else {
    dispatch({
      type: 'SET_SESSION_LIST',
      result: newSessionList,
    });
  }
};

/**
 * 删除会话
 * @param {*} result
 */
export const removeSession = id => {
  return {
    type: 'REMOVE_SESSION',
    id,
  };
};

/**
 * 添加会话
 * @param {*} result
 */
export const addSession = (result, id) => (dispatch, getState) => {
  const { sessionList } = getState().chat;

  // 兼容连续消息
  if (id) {
    const session = sessionList.filter(item => item.value === id)[0];
    const isSelf = md.global.Account.accountId === result.from;
    const name = isSelf ? _l('我') : result.uname;
    const msg = {
      count: 0,
      id,
      msg: `${name}: ${result.msg.con}`,
      isPush: result.isPush,
    };
    if (session) {
      dispatch(updateSessionList(msg));
      return;
    }
  }

  result = utils.formatNewSession(result);
  if (!result.id) {
    result.isSession = false;
  }
  dispatch({
    type: 'ADD_SESSION',
    result: [result],
  });
};

/**
 * 添加群组会话
 * @param {*} groupId
 * @param {*} msg
 */
export const addGroupSession =
  (groupId, msg = {}, isOpen = true) =>
  (dispatch, getState) => {
    const { sessionList } = getState().chat;
    // if (utils.chatWindow.is(groupId)) {
    //   return;
    // }
    const session = sessionList.filter(item => item.value == groupId)[0];
    if (session) {
      isOpen && dispatch(setCurrentSessionId(groupId));
    } else {
      if (msg.avatar) {
        const message = Object.assign(
          {
            count: 0,
            isGroup: true,
            sysType: 1,
          },
          msg,
        );
        dispatch(addSession(message));
        if (isOpen) {
          dispatch(setCurrentSessionId(groupId));
          socket.Contact.recordAction({
            id: groupId,
            type: 2,
          });
        }
      } else {
        ajax
          .chatSessionItem({
            type: Constant.SESSIONTYPE_GROUP,
            value: groupId,
          })
          .then(group => {
            const message = Object.assign(
              {
                isGroup: true,
                count: 0,
                to: groupId,
                avatar: group.avatar,
                groupname: group.name,
                msg: { con: '' },
                sysType: 1,
              },
              msg,
            );
            dispatch(addSession(message, groupId));
            if (isOpen) {
              dispatch(setCurrentSessionId(groupId));
              socket.Contact.recordAction({
                id: groupId,
                type: 2,
              });
            }
          });
      }
    }
  };

/**
 * 添加个人会话
 * @param {*} id
 * @param {*} msg
 * @param {*} isOpen
 * @param {*} cb
 */
export const addUserSession =
  (id, msg = {}, isOpen = true, cb) =>
  (dispatch, getState) => {
    const { sessionList } = getState().chat;
    // if (utils.chatWindow.is(id)) {
    //   return;
    // }
    const session = sessionList.filter(item => item.value == id)[0];
    if (session) {
      isOpen && dispatch(setCurrentSessionId(id));
      cb && cb();
    } else {
      if (msg.logo) {
        const message = Object.assign(
          {
            count: 0,
            from: id,
            msg: { con: '' },
            isGroup: false,
          },
          msg,
        );
        dispatch(addSession(message));
        if (isOpen) {
          dispatch(setCurrentSessionId(id));
          socket.Contact.recordAction({
            id: id,
            type: 1,
          });
        }
        cb && cb();
      } else {
        ajax
          .chatSessionItem({
            type: Constant.SESSIONTYPE_USER,
            value: id,
          })
          .then(user => {
            const message = Object.assign(
              {
                count: 0,
                from: id,
                logo: user.avatar,
                uname: user.fullname,
                msg: { con: '' },
                isGroup: false,
                sysType: 1,
                isPush: true,
              },
              msg,
            );
            dispatch(addSession(message, id));
            if (isOpen) {
              dispatch(setCurrentSessionId(id));
              socket.Contact.recordAction({
                id: id,
                type: 1,
              });
            }
            cb && cb();
          });
      }
    }
  };

/**
 * 添加系统消息
 * @param {*} id
 * @param {*} msg
 */
export const addSysSession =
  (id, msg = {}) =>
  (dispatch, getState) => {
    const { sessionList } = getState().chat;
    const session = sessionList.filter(item => item.value == id)[0];
    if (session) {
      dispatch(setCurrentSessionId(id));
    } else {
      dispatch(addSession(msg));
      dispatch(setCurrentSessionId(id));
    }
  };

/**
 * 窗口同步
 * @param {*} status
 */
export const operate = status => (dispatch, getState) => {
  const { sessionList } = getState().chat;
  const { contact, isclose, isopen } = status;
  const session = sessionList.filter(item => item.value === contact.id)[0];
  if ('showBadge' in contact) {
    session.showBadge = contact.showBadge;
  }
  if (isclose) {
    // 关闭窗口
    dispatch(setNewCurrentSession({}));
  } else if (isopen) {
    // 开启窗口
    if (session) {
      dispatch(setNewCurrentSession(session));
    } else {
      if (contact.type === 1) {
        dispatch(
          addUserSession(contact.id, {
            msg: { con: '' },
            sysType: 1,
          }),
        );
      } else if (contact.type === 2) {
        dispatch(addGroupSession(contact.id));
      } else {
        const { id } = contact;
        dispatch(addSysSession(id.dtype, id));
      }
    }
  }
};

/**
 * 发送设置置顶的会话
 * @param {*} message
 */
export const sendSetTop = message => (dispatch, getState) => {
  const { sessionList } = getState().chat;
  const { isTop } = message;

  const count = sessionList.reduce((count, item) => {
    const { top_info } = item;
    const n = top_info ? (top_info.isTop ? 1 : 0) : 0;
    return count + n;
  }, 0);

  if (count >= 10 && isTop) {
    alert(_l('置顶数最多10条'), 3);
  } else {
    socket.Contact.setTop(message);
  }
};

/**
 * 设置置顶
 * @param {*} message
 */
export const setTop = message => (dispatch, getState) => {
  const { currentSessionList, sessionList, currentSession } = getState().chat;
  const session = sessionList.filter(item => item.value === message.value)[0];
  const isTop = message.top_info ? message.top_info.isTop : false;
  const time = message.top_info ? message.top_info.time : '';
  if (session) {
    const newCurrentSessionList = currentSessionList.map(item => {
      if (item.id === message.value) {
        item.isTop = isTop;
        delete item.isSession;
      }
      return item;
    });
    dispatch({
      type: 'UPDATE_CURRENT_SESSION',
      result: newCurrentSessionList,
    });
    dispatch(
      updateSessionList({
        id: message.value,
        isTop,
        time,
      }),
    );

    if (message.value === currentSession.value) {
      let _current = sessionList.find(l => l.value === message.value);
      dispatch(
        setNewCurrentSession({
          ..._current,
          top_info: {
            ..._current.top_info,
            isTop: isTop,
          },
        }),
      );
    }
  }
};

/**
 * 同步删除会话
 * @param {*} message
 */
export const sessionRemoved = message => (dispatch, getState) => {
  const { id, type } = message;
  const { currentSession, sessionList } = getState().chat;
  const value = type > 2 ? utils.getInboxId(type) : id;
  dispatch(removeSession(value));
  dispatch(removeCurrentSession(value));
  dispatch(removeCurrentInbox(value));
  dispatch(removeMessages(value));
  if (value === currentSession.value) {
    dispatch(setNewCurrentSession({}));
  }
  utils.removeFlashTitle(value, sessionList);
};

/**
 * 清除会话未读消息计数
 * @param {*} message
 */
export const clearUnread = message => (dispatch, getState) => {
  const { sessionList } = getState().chat;
  const { id } = message;
  dispatch(updateSessionList({ id, atlist: [] }));
  dispatch(updateSessionList({ id, reflist: [] }));
  dispatch(updateSessionList({ id, refer: null }));
  dispatch(updateSessionList({ id, clearCount: 0 }));
  utils.removeFlashTitle(id, sessionList);
};

/**
 * 清除所有计数
 */
export const clearAllUnread = () => (dispatch, getState) => {
  const { sessionList } = getState().chat;
  const newSessionList = _.cloneDeep(sessionList).map(item => {
    if (item.count) {
      item.count = 0;
    }
    if (item.atlist && item.atlist.length) {
      item.atlist = [];
    }
    if (item.reflist && item.reflist.length) {
      item.reflist = [];
    }
    if (item.refer) {
      item.refer = null;
    }
    return item;
  });
  utils.removeFlashTitle('', newSessionList);
  dispatch({
    type: 'UPDATE_SESSION_LIST',
    result: newSessionList,
  });
};

/**
 * 清除 inbox 的未读计数
 * @param {*} message
 */
export const clearNotification = message => (dispatch, getState) => {
  const { sessionList, currentSession } = getState().chat;
  const { type } = message;
  dispatch(updateSessionList({ id: type, clearCount: 0 }));
  if (currentSession.id === type && currentSession.count) {
    dispatch({
      type: 'SET_CURRENT_SESSION',
      result: Object.assign(currentSession, { count: 0 }),
    });
  }
  utils.removeFlashTitle(type, sessionList);
};

/**
 * 删除群组
 * @param {*} data
 */
export const removedFromGroup = data => (dispatch, getState) => {
  const { currentSession } = getState().chat;
  const { id } = data;
  if (currentSession.value === id) {
    dispatch(setNewCurrentSession({}));
  }
  dispatch(removeCurrentSession(id));
  dispatch(removeSession(id));
  dispatch(removeMessages(id));
};

/**
 * 关闭聊天
 */
export const closeSessionPanel = () => (dispatch, getState) => {
  const { currentSession } = getState().chat;
  if (currentSession.value) {
    dispatch(setNewCurrentSession({}));
    socket.Contact.recordAction({ id: '' });
  }
};

/**
 * 设置一个新的会话信息
 * @param {*} result
 */
export const setNewCurrentSession = result => dispatch => {
  socket.Contact.setCurrentChat(result);
  dispatch({
    type: 'SET_CURRENT_SESSION',
    result,
  });
  if (result.value !== 'workflow') {
    dispatch({
      type: 'REMOVE_INBOX_SESSION',
      id: 'workflow',
    });
  }
};

/**
 * 设置会话信息
 * @param {*} id
 * @param {*} message
 */
export const setCurrentSessionId =
  (id, message = {}) =>
  (dispatch, getState) => {
    const { sessionList } = getState().chat;
    const session = sessionList.filter(item => item.value === id)[0];
    socket.Contact.setCurrentChat(session);
    dispatch({
      type: 'SET_CURRENT_SESSION',
      result: Object.assign(session, message),
    });
  };

/**
 * 添加聊过的会话消息
 * @param {*} result
 */
export const addCurrentSession = result => (dispatch, getState) => {
  const { currentSessionList, sessionList } = getState().chat;
  result.isGroup = 'isPost' in result;
  result.id = result.isGroup ? result.groupId : result.accountId;
  if (currentSessionList.length >= 2) {
    const { id } = currentSessionList[0];
    dispatch(removeCurrentSession(id));
    dispatch(removeMessages(id));
  }
  const session = _.filter(sessionList, { value: result.id })[0];
  const isTop = session.top_info ? session.top_info.isTop : false;
  result.isTop = isTop;
  if ('isSession' in session) {
    result.isSession = session.isSession;
  }
  dispatch({
    type: 'ADD_CURRENT_SESSION',
    result,
  });
};

/**
 * 添加打开过 inbox 消息
 * @param {*} result
 */
export const addCurrentInbox = result => (dispatch, getState) => {
  const { currentInboxList = [] } = getState().chat;
  if (currentInboxList.length >= 3) {
    const { id } = currentInboxList[0];
    dispatch(removeCurrentInbox(id));
  }
  result.requestNow = Date.now();
  dispatch({
    type: 'ADD_INBOX_SESSION',
    result,
  });
};

/**
 * 更新 inbox 时间
 * @param {*} result
 */
export const updateInoxRequestNow = id => {
  return {
    type: 'UPDATE_INBOX_SESSION',
    id,
    data: {
      requestNow: Date.now(),
    },
  };
};

/**
 * 删除聊过的会话信息
 * @param {*} result
 */
export const removeCurrentSession = id => {
  return {
    type: 'REMOVE_CURRENT_SESSION',
    id,
  };
};

/**
 * 删除打开过的 inbox 信息
 * @param {*} result
 */
export const removeCurrentInbox = id => {
  return {
    type: 'REMOVE_INBOX_SESSION',
    id,
  };
};

/**
 * 修改群名称
 * @param {*} id
 * @param {*} name
 */
export const resetGroupName = (groupId, name) => (dispatch, getState) => {
  const { currentSessionList, sessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.name = name;
    }
    return item;
  });
  const newSessionList = sessionList.map(item => {
    if (item.value === groupId) {
      item.name = name;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
  dispatch({
    type: 'UPDATE_SESSION_LIST',
    result: newSessionList,
  });
};

/**
 * 讨论转换成群组
 * @param {*} id
 * @param {*} name
 */
export const resetGroupIsPost = (groupId, projectId) => (dispatch, getState) => {
  const { currentSessionList, sessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.isPost = true;
      item.project = projectId ? _.find(md.global.Account.projects, { projectId }) : undefined;
    }
    return item;
  });
  const newSessionList = sessionList.map(item => {
    if (item.value === groupId) {
      item.isPost = true;
      item.project = projectId ? _.find(md.global.Account.projects, { projectId }) : undefined;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
  dispatch({
    type: 'UPDATE_SESSION_LIST',
    result: newSessionList,
  });
};

/**
 * 修改群头像
 * @param {*} groupId
 * @param {*} name
 */
export const updateGroupAvatar = (groupId, avatar) => (dispatch, getState) => {
  const { sessionList } = getState().chat;
  const newSessionList = sessionList.map(item => {
    if (item.value === groupId) {
      item.logo = avatar;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_SESSION_LIST',
    result: newSessionList,
  });
};

/**
 * 修改群公告
 * @param {*} groupId
 * @param {*} about
 */
export const updateGroupAbout = (groupId, about) => (dispatch, getState) => {
  const { currentSessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.about = about;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
};

/**
 * 消息免打扰
 * @param {*} groupId
 * @param {*} isPushNotice
 */
export const updateGroupPushNotice = (groupId, isPushNotice) => (dispatch, getState) => {
  const { currentSessionList, sessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.isPushNotice = isPushNotice;
    }
    return item;
  });
  const newSessionList = sessionList.map(item => {
    if (item.value === groupId) {
      item.isPush = isPushNotice;
    }
    return item;
  });

  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
  dispatch({
    type: 'UPDATE_SESSION_LIST',
    result: newSessionList,
  });
};

/**
 * 仅允许群主及管理员邀请新成员
 * @param {*} groupId
 * @param {*} isForbidInvite
 */
export const updateForbIdInvite = (groupId, isForbidInvite) => (dispatch, getState) => {
  const { currentSessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.isForbidInvite = isForbidInvite;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
};

/**
 * 设为官方群组
 * @param {*} groupId
 * @param {*} isVerified
 */
export const updateVerify = (groupId, isVerified) => (dispatch, getState) => {
  const { currentSessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.isVerified = isVerified;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
};

/**
 * 更改管理员
 * @param {*} groupId
 * @param {*} isAdmin
 */
export const updateAdmin = (groupId, isAdmin) => (dispatch, getState) => {
  const { currentSessionList } = getState().chat;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.isAdmin = isAdmin;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
};

/**
 * 更新成员人数
 * @param {*} groupId
 * @param {*} count
 */
export const updateMember = (groupId, count) => (dispatch, getState) => {
  const { currentSessionList, currentSession } = getState().chat;
  const { iconType } = currentSession;
  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.id === groupId) {
      item.groupMemberCount = item.groupMemberCount + count;
    }
    return item;
  });
  if (iconType) {
    currentSession.isRender = false;
    dispatch({
      type: 'SET_CURRENT_SESSION',
      result: currentSession,
    });
  }
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
};

/**
 * 获取聊天的消息列表
 * @param {*} result
 */
export const setMessage = (id, result) => (dispatch, getState) => {
  const { messages } = getState().chat;
  dispatch({
    type: messages[id] ? 'ADD_PAGE_MESSAGE' : 'SET_MESSAGE',
    id,
    result,
  });
};

/**
 * 重新填充聊天记录
 * @param {*} id
 * @param {*} result
 */
export const resetMessage = (id, result) => {
  return {
    type: 'SET_MESSAGE',
    id,
    result,
  };
};

/**
 * 向上加载一页的数据
 * @param {*} id
 * @param {*} result
 */
export const addPageMessage = (id, result) => {
  return {
    type: 'ADD_PAGE_MESSAGE',
    id,
    result,
  };
};

/**
 * 向下加载一页的数据
 * @param {*} id
 * @param {*} result
 */
export const pushPageMessage = (id, result) => {
  return {
    type: 'PUSH_PAGE_MESSAGE',
    id,
    result,
  };
};

/**
 * 发送新消息
 * @param {*} newMessage
 * @param {*} prevMessage
 */
export const addMessage = (newMessage, prevMessage) => dispatch => {
  const { Account: account } = md.global;
  const message = {
    waitingId: newMessage.waitingid,
    // id: newMessage.waitingid,
    from: account.accountId,
    fromAccount: {
      email: account.email,
      id: account.accountId,
      logo: account.avatar,
      name: account.fullname,
    },
    msg: {
      con: newMessage.msg,
    },
    to: newMessage.togroup || newMessage.touser,
    type: newMessage.type,
    time: utils.getCurrentTime(),
    iswd: false,
    sendMsg: newMessage, // 保留发给后端的消息数据，便于重发
    isMineMessage: true,
  };

  // 系统消息
  if (newMessage.sysType) {
    message.sysType = newMessage.sysType;
  }

  // 包含引用消息
  if (newMessage.refer) {
    const { referMessage } = newMessage;
    message.refer = {
      msg: referMessage.msg.con,
      type: referMessage.type,
      user: {
        full_name: referMessage.fromAccount.name,
      },
    };
  }

  if (newMessage.type === Constant.MSGTYPE_CARD) {
    // 卡片消息
    message.card = newMessage.card;
  } else if (newMessage.type === Constant.MSGTYPE_PIC) {
    // 图片消息
    newMessage.file.url = window.config.FilePath + newMessage.file.key;
    message.msg.files = newMessage.file;
    message.isPrepare = newMessage.isPrepare || false;
  } else if (newMessage.type === Constant.MSGTYPE_FILE || newMessage.type === Constant.MSGTYPE_APP_VIDEO) {
    // 附件消息
    message.msg.files = newMessage.file;
    message.isPrepare = newMessage.isPrepare || false;
  }

  const id = newMessage.togroup || newMessage.touser;

  if (_.isEmpty(id)) return;

  if (prevMessage) {
    dispatch({
      type: 'ADD_MESSAGE',
      id,
      result: utils.formatMessage(message, prevMessage),
    });
  } else {
    dispatch({
      type: 'SET_MESSAGE',
      id,
      result: [utils.formatMessage(message, prevMessage)],
    });
  }
};

/**
 * 删除单个消息
 * @param {*} id
 * @param {*} messageId
 */
export const removeMessage = (id, messageId) => {
  return {
    type: 'REMOVE_MESSAGE',
    id,
    messageId,
  };
};

/**
 * 删除消息列表
 * @param {*} id
 */
export const removeMessages = id => {
  return {
    type: 'REMOVE_MESSAGES',
    id,
  };
};

/**
 * 更新某个消息
 * @param {*} message
 */
export const updateMessage = message => (dispatch, getState) => {
  const { messages } = getState().chat;
  const { to, waitingid, socket } = message;
  const currentMessage = messages[to] || [];
  const newCurrentMessage = currentMessage
    .filter(item => item)
    .map(item => {
      if (item.waitingId === waitingid) {
        item.id = message.id;
        // 替换成服务器的时间
        if (socket && socket.time) {
          item.timestamp = utils.formatMsgDate(dateConvertToUserZone(socket.time));
        }
        // 引用消息
        if (item.refer) {
          const { referMessage } = message;
          item.refer = {
            msgid: referMessage.id,
            msg: referMessage.msg.con,
            msgdetail: socket.refer.msgdetail,
            type: referMessage.type,
            time: referMessage.time,
            iswd: referMessage.iswd,
            user: {
              account_id: referMessage.fromAccount.id,
              full_name: referMessage.fromAccount.name,
              avatar: referMessage.fromAccount.logo,
            },
          };
          // item.refer = message.refer;
        }
        // 转成系统消息
        if ('isContact' in message) {
          item.sysType = Constant.MSGTYPE_SYSTEM_ERROR;
          item.msg = { con: '' };
          item.isContact = false;
        }
        // 图片消息，替换 url
        if (socket && socket.msg.files) {
          item.msg.files.url = socket.msg.files.url;
        }
      }
      return item;
    });
  dispatch({
    type: 'SET_MESSAGE',
    id: to,
    result: newCurrentMessage,
  });
};

/**
 * 将卡片类型的知识文件更新成附件类型
 * @param {*} message
 */
export const updateFileMessage = (newMessage, to) => (dispatch, getState) => {
  const { messages } = getState().chat;
  const { id } = newMessage;
  const currentMessage = messages[to];
  const newCurrentMessage = currentMessage.map(item => {
    if (item.id === id) {
      return newMessage;
    }
    return item;
  });
  dispatch({
    type: 'SET_MESSAGE',
    id: to,
    result: newCurrentMessage,
  });
};

/**
 * 将消息改为已经撤回的消息
 * @param {*} newMessage
 */
export const updateWithdrawMessage = (id, newMessage) => (dispatch, getState) => {
  const { messages, referMessage, bottomUnreadMessage } = getState().chat;
  const { id: messageId, msg } = newMessage;
  const currentMessage = messages[id];
  const bottomUnread = bottomUnreadMessage[id] || [];

  if (!currentMessage) {
    return;
  }

  currentMessage.forEach((item, index) => {
    if (item.id == messageId) {
      const nextMessage = currentMessage[index + 1];
      item.iswd = true;
      if (item.from === md.global.Account.accountId && !item.msg.oldCon) {
        item.msg.oldCon = item.msg.con;
      }
      item.msg.con = msg.con;
      if (nextMessage) {
        nextMessage.isDuplicated = false;
      }
    }
    // 引用的消息被撤回了
    if (item.refer && item.refer.msgid == messageId) {
      item.refer.iswd = true;
    }
  });

  bottomUnread.forEach((item, index) => {
    if (item.id == messageId) {
      const nextMessage = bottomUnread[index + 1];
      item.iswd = true;
      item.msg.con = msg.con;
      if (nextMessage) {
        nextMessage.isDuplicated = false;
      }
    }
    // 引用的消息被撤回了
    if (item.refer && item.refer.msgid == messageId) {
      item.refer.iswd = true;
    }
  });

  if (referMessage[id] && referMessage[id].id == messageId) {
    dispatch(removeReferMessage(id));
  }

  dispatch({
    type: 'UPDATE_BOTTOM_UNREAD_MESSAGE',
    id,
    message: bottomUnread,
  });
  dispatch({
    type: 'SET_MESSAGE',
    id,
    result: currentMessage,
  });
};

/**
 * 收到新消息
 * @param {*} message
 */
export const receiveMessage = (id, message) => (dispatch, getState) => {
  const { messages } = getState().chat;
  const currentMessage = messages[id];
  const unnecessary = _.findIndex(currentMessage, { id: message.id }) === -1 ? false : true;
  if (currentMessage && !unnecessary) {
    message = utils.formatNewMessage(message, currentMessage[currentMessage.length - 1]);
    const isGroup = 'groupname' in message;
    const sessionId = isGroup ? message.to : message.isMine ? message.to : message.from;
    const bottom = $(`#ChatPanel-${sessionId}`).data('isBottom');
    const isBottom = bottom == undefined ? true : bottom;
    if (!message.isMine && !isBottom) {
      dispatch(addBottomUnreadMessage(sessionId, message));
      return;
    } else {
      setTimeout(() => {
        utils.scrollEnd(message.to, true);
      }, 100);
    }
    dispatch({
      type: 'ADD_MESSAGE',
      id,
      result: message,
    });
  }
};

/**
 * 系统消息
 * @param {*} message
 */
export const newNotifyMessage = message => (dispatch, getState) => {
  const { currentSession, sessionList } = getState().chat;
  const showBadge = [0, 1].includes(message.type) ? message.type + 1 : 0;
  switch (message.dtype) {
    case 0:
      message.id = 'post';
      message.type = Constant.SESSIONTYPE_POST;
      break;
    case 1:
      message.id = 'system';
      message.type = Constant.SESSIONTYPE_SYSTEM;
      break;
    case 2:
      message.id = 'calendar';
      message.type = Constant.SESSIONTYPE_CALENDAR;
      break;
    case 3:
      message.id = 'task';
      message.type = Constant.SESSIONTYPE_TASK;
      break;
    case 4:
      message.id = 'knowledge';
      message.type = Constant.SESSIONTYPE_KNOWLEDGE;
      break;
    case 5:
      message.id = 'hr';
      message.type = Constant.SESSIONTYPE_HR;
      break;
    case 6:
      message.id = 'worksheet';
      message.type = Constant.SESSIONTYPE_WORKSHEET;
      break;
    case 7:
      message.id = 'workflow';
      message.type = Constant.SESSIONTYPE_WORKFLOW;
      break;
    default:
      break;
  }

  if (message.name) {
    message.msg = `${message.name}: ${message.msg}`;
  }

  const result = sessionList.filter(item => item.value === message.id);

  if (result.length) {
    dispatch(
      updateSessionList({
        id: message.id,
        count: 1,
        time: utils.getCurrentTime(),
        msg: message.msg,
        isPush: !message.weak,
        weak: message.weak,
        showBadge: showBadge,
      }),
    );
    if (currentSession.value !== message.id) {
      dispatch(removeCurrentInbox(message.id));
    }
  } else {
    message.count = 1;
    dispatch(addSession(message));
  }

  if ('isSilent' in message ? (!message.isSilent || [1, 2].includes(showBadge)) && !message.weak : !message.weak) {
    utils.flashTitle();
    utils.playSystemNewMsgAudio();
  }
};

/**
 * 个人信息
 * @param {*} message
 */
export const newUserMessage = message => (dispatch, getState) => {
  const { currentSession, sessionList, isWindow } = getState().chat;
  const id = md.global.Account.accountId === message.from ? message.to : message.from;
  const isSelf = md.global.Account.accountId === message.from;
  const result = sessionList.filter(item => item.value === id);
  const isWindowSession = utils.chatWindow.is(id);
  if (isWindow && !result.length) {
    return;
  }
  if (result.length) {
    const name = isSelf ? _l('我') : message.uname;
    const count = isWindowSession ? 0 : currentSession.value === id || isSelf ? 0 : 1;
    dispatch(receiveMessage(id, message));
    dispatch(
      updateSessionList({
        id,
        count,
        time: message.time,
        msg: `${name}: ${message.msg.con}`,
        msgId: message.id,
        isPush: true,
      }),
    );
    if (count) {
      utils.flashTitle();
      utils.playSessionNewMsgAudio();
      utils.sessionListScrollTop();
    }
  } else {
    // 如果是自己，打开多个页面需要消息同步
    if (isSelf) {
      dispatch(
        addUserSession(
          id,
          {
            sysType: 0,
            msg: message.msg,
            from: message.from,
            to: message.to,
            id: message.id,
          },
          false,
        ),
      );
    } else {
      message.count = isWindowSession ? 0 : 1;
      message.isGroup = false;
      dispatch(addSession(message, id));
      if (message.count) {
        utils.flashTitle();
        utils.playSessionNewMsgAudio();
        utils.sessionListScrollTop();
      }
    }
  }
};

/**
 * 个人抖动消息
 * @param {*} message
 */
export const userShake = message => (dispatch, getState) => {
  const addShakeMessage = () => {
    const { currentSession, messages } = getState().chat;
    if (currentSession.value === message.aid) {
      const currentMessages = messages[message.aid] || [];
      const sendMsg = {
        waitingid: utils.getUUID(),
        msg: _l('你收到了一个抖动'),
        sysType: Constant.MSGTYPE_SYSTEM_SUCCESS,
        touser: message.aid,
      };
      utils.shake(message.aid);
      socket.Contact.clearUnread({
        type: 1,
        value: message.aid,
      }).then(() => {
        dispatch(updateSessionList({ id: message.aid, clearCount: 0 }));
      });
      dispatch(addMessage(sendMsg, currentMessages[currentMessages.length - 1]));
      return;
    }
  };

  dispatch(
    addUserSession(message.aid, {}, true, () => {
      const { currentSessionList } = getState().chat;
      const session = currentSessionList.filter(item => item.id == message.aid)[0];
      if (session) {
        addShakeMessage();
      } else {
        setTimeout(addShakeMessage, 1000);
      }
    }),
  );
};

/**
 * 创建群组
 * @param {*} message
 */
export const newGroup = message => dispatch => {
  const { admins } = message;
  const index = _.findIndex(admins, { aid: md.global.Account.accountId });
  const isSelf = index === -1 ? false : true;
  const s = $('#easyDialogBoxMDUpdater_container').size() ? true : false;
  // message.uCount 1 -> 群组
  // message.uCount 2 -> 聊天
  dispatch(
    addGroupSession(
      message.id,
      {
        to: message.id,
        avatar: message.logo,
        groupname: message.name,
        isPost: message.isPost,
        isPush: message.isPush,
        msg: { con: `${_l('我')}：${_l('群组创建成功')}` },
      },
      s ? false : isSelf,
    ),
  );
};

/**
 * 收到群组信息
 * @param {*} message
 */
export const newGroupMessage = message => (dispatch, getState) => {
  const { currentSession, sessionList, isWindow } = getState().chat;
  const result = sessionList.filter(item => item.value === message.to);
  const isWindowSession = utils.chatWindow.is(message.to);

  // 全局聊天下，不是当前的聊天消息过来过滤掉
  if (isWindow && !result.length) {
    return;
  }

  if (result.length) {
    const isSelf = md.global.Account.accountId === message.from;
    const name = isSelf ? _l('我') : message.uname;
    const count = isWindowSession ? 0 : currentSession.value === message.to || isSelf ? 0 : 1;
    dispatch(receiveMessage(message.to, message));
    dispatch(
      updateSessionList({
        id: message.to,
        count: message.sysType ? 0 : count,
        time: message.time,
        msg: message.sysType ? message.msg.con : `${name}: ${message.msg.con}`,
        msgId: message.id,
        isPush: message.isPush,
        refer: currentSession.value === message.to ? null : message.refer,
      }),
    );
    if (message.isPush && count && !('sysType' in message)) {
      utils.flashTitle();
      utils.playSessionNewMsgAudio();
      utils.sessionListScrollTop();
    }
  } else {
    message.count = message.sysType ? 0 : isWindowSession ? 0 : 1;
    message.isGroup = true;
    message.isPush = message.sysType ? true : message.isPush;
    dispatch(addSession(message, message.to));
    if (message.isPush && message.count && !('sysType' in message)) {
      utils.flashTitle();
      utils.playSessionNewMsgAudio();
      utils.sessionListScrollTop();
    }
  }
};

/**
 * 收到群组 @ 消息
 * @param {*} message
 */
export const groupShake = message => (dispatch, getState) => {
  const { currentSession, sessionList } = getState().chat;
  const session = sessionList.filter(item => item.value === message.gid)[0];
  const isWindowSession = utils.chatWindow.is(message.gid);
  const { msg } = message;
  if (currentSession.value === message.gid) {
    utils.shake(message.gid);
  } else {
    const atlist = session.atlist ? session.atlist.filter(atId => atId !== message.id) : [];
    const listMsg = {
      id: message.gid,
      atlist: isWindowSession ? [] : atlist.concat(msg.msgid),
      at_msg: {
        time: msg.time,
        message_id: msg.msgid,
        msgid: msg.msgid,
      },
    };
    dispatch(updateSessionList(listMsg));
  }
};

/**
 * 收到群组撤回消息
 * @param {*} message
 */
export const newWithdrawGroupMessage = message => (dispatch, getState) => {
  const { sessionList } = getState().chat;
  const session = sessionList.filter(item => item.value === message.gid)[0];
  dispatch(updateWithdrawMessage(message.gid, message));
  dispatch(
    updateSessionList({
      id: message.gid,
      addMsg: message.msg.con,
    }),
  );

  if (session && session.atlist) {
    const atlist = session.atlist.filter(atId => atId !== message.id);
    dispatch(
      updateSessionList({
        id: message.gid,
        atlist,
        isWithdraw: true,
      }),
    );
  }

  if (session && session.refer) {
    dispatch(
      updateSessionList({
        id: message.gid,
        refer: null,
        isWithdraw: true,
      }),
    );
  }

  if (session && session.reflist) {
    dispatch(
      updateSessionList({
        id: message.gid,
        reflist: [],
        isWithdraw: true,
      }),
    );
  }
};

/**
 * 设置引用消息
 * @param {*} id
 * @param {*} message
 */
export const setReferMessage = (id, message) => {
  return {
    type: 'SET_REFER_MESSAGE',
    id,
    message,
  };
};

/**
 * 添加未读消息
 * @param {*} id
 * @param {*} message
 */
export const addBottomUnreadMessage = (id, message) => (dispatch, getState) => {
  const { bottomUnreadMessage } = getState().chat;
  const currentMessage = bottomUnreadMessage[id];
  if (currentMessage) {
    dispatch({
      type: 'ADD_BOTTOM_UNREAD_MESSAGE',
      id,
      message,
    });
  } else {
    dispatch({
      type: 'SET_BOTTOM_UNREAD_MESSAGE',
      id,
      message,
    });
  }
};

export const removeBottomUnreadMessage = id => {
  return {
    type: 'REMOVE_BOTTOM_UNREAD_MESSAGE',
    id,
  };
};

/**
 * 删除引用消息
 * @param {*} id
 */
export const removeReferMessage = id => {
  return {
    type: 'REMOVE_REFER_MESSAGE',
    id,
  };
};

/**
 * 设置需要滚动到指定的消息
 * @param {*} id
 * @param {*} messageId
 */
export const setGotoMessage = (id, messageId) => {
  return {
    type: 'SET_GOTO_MESSAGE',
    id,
    messageId,
  };
};

/**
 * 删除指定的消息
 * @param {*} id
 */
export const removeGotoMessage = id => {
  return {
    type: 'REMOVE_GOTO_MESSAGE',
    id,
  };
};

/**
 * 更新是否在标签页聊天的状态
 * @param {*} isWindow
 */
export const setIsWindow = isWindow => {
  return {
    type: 'UPDATE_IS_WINDOW',
    result: isWindow,
  };
};

/**
 * 更新通讯录的显示
 * @param {*} isShowAddressBook
 */
export const setShowAddressBook = isShowAddressBook => dispatch => {
  dispatch({
    type: 'UPDATE_SHOW_ADD_RESSBOOK',
    result: isShowAddressBook,
  });
};

/**
 * 重连后重置聊天状态
 */
export const refresh = () => (dispatch, getState) => {
  const { currentSession, currentInboxList, currentSessionList } = getState().chat;
  const { id } = currentSession;
  ajax
    .chatSessionList({
      pageIndex: 1,
      pageSize: 30,
    })
    .then(res => {
      if (id) {
        res.forEach(item => {
          if (item && item.value == id) {
            item.count = 0;
          }
        });
        dispatch(setSessionList(res));
        currentInboxList.forEach(inbox => {
          if (inbox.id !== id) {
            dispatch(removeCurrentInbox(inbox.id));
          }
        });
        const newCurrentSessionList = currentSessionList.filter(item => item.id === id)[0];
        if (!newCurrentSessionList) {
          return;
        }
        const { isGroup } = newCurrentSessionList;
        ajax
          .getMessage({
            id,
            type: isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER,
          })
          .then(res => {
            res = $.isArray(res) ? res.reverse() : [];
            const newMessages = {
              [id]: utils.formatMessages(res),
            };
            dispatch({
              type: 'UPDATE_CURRENT_SESSION',
              result: [newCurrentSessionList],
            });
            dispatch({
              type: 'UPDATE_MESSAGE',
              result: newMessages,
            });
          });
      } else {
        dispatch(setSessionList(res));
        dispatch({
          type: 'UPDATE_CURRENT_SESSION',
          result: [],
        });
        dispatch({
          type: 'SET_CURRENT_SESSION',
          result: {},
        });
        dispatch({
          type: 'UPDATE_MESSAGE',
          result: {},
        });
        dispatch({
          type: 'REMOVE_ALL_INBOX_SESSION',
        });
      }
    });
};

/**
 * 发送设置免打扰
 * @param {*} message
 */
export const sendSetSlience = message => () => {
  socket.Contact.setSlience(message);
};

/**
 * 设置免打扰
 * @param {*} message
 */
export const setSlience = message => (dispatch, getState) => {
  const { currentSessionList, sessionList, currentSession } = getState().chat;
  const isSilent = message.isSilent ? message.isSilent : false;
  const showBadge = message.showBadge ? message.showBadge : 0;

  const newCurrentSessionList = currentSessionList.map(item => {
    if (item.value === message.value) {
      item.isSilent = isSilent;
      item.showBadge = showBadge;
    }
    return item;
  });
  const newSessionList = sessionList.map(item => {
    if (item.value === message.value) {
      item.isSilent = isSilent;
      item.showBadge = showBadge;
    }
    return item;
  });
  dispatch({
    type: 'UPDATE_CURRENT_SESSION',
    result: newCurrentSessionList,
  });
  dispatch({
    type: 'UPDATE_SESSION_LIST',
    result: newSessionList,
  });
  if (message.value === currentSession.value) {
    let _current = newSessionList.find(l => l.value === message.value);
    dispatch(setNewCurrentSession(_current));
  }
};

/**
 * 更新 socket 状态
 * @param {*} state
 */
export const setSocketState = state => {
  return {
    type: 'UPDATE_SOCKET_STATE',
    result: state,
  };
};

/**
 * 更新 toolbarConfig 配置
 * @param {*} config
 */
export const setToolbarConfig = config => {
  return {
    type: 'SET_TOOLBAR_CONFIG',
    result: config,
  };
};
