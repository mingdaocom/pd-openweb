import _ from 'lodash';
import moment from 'moment';
import Emotion from 'src/components/emotion/emotion';
import { INBOXTYPES } from 'src/pages/chat/components/Inbox/constants';
import { htmlDecodeReg } from 'src/utils/common';
import { dateConvertToUserZone } from 'src/utils/project';
import Constant from './constant';

export const formatMsgDate = (dateStr, isHourMinute = true) => {
  const dateTime = moment(dateStr);
  const now = moment();
  const diff = now.diff(dateTime);
  const milliseconds = diff;
  const seconds = Math.floor(milliseconds / 1000);
  const minutes = Math.floor(seconds / 60);
  const year = dateTime.format('YYYY');
  const simpleMonth = dateTime.format('M');
  const simpleDay = dateTime.format('D');
  const hour = dateTime.format('HH');
  const minute = dateTime.format('mm');
  const hourMinute = `${hour}:${minute}`;

  // 处理未来时间的情况
  if (diff < 0) return hourMinute;

  if (minutes < 60) {
    return hourMinute;
  } else if (dateTime.isSame(now, 'd')) {
    return _l('今天') + ` ${hourMinute}`;
  } else if (dateTime.isSame(now.subtract(1, 'd'), 'd')) {
    return _l('昨天') + (isHourMinute ? ` ${hourMinute}` : '');
  } else if (dateTime.format('YYYY') === now.format('YYYY')) {
    return `${_l('%0月%1日', simpleMonth, simpleDay)}` + (isHourMinute ? ` ${hourMinute}` : '');
  }

  return `${_l('%0年%1月%2日', year, simpleMonth, simpleDay)}` + (isHourMinute ? ` ${hourMinute}` : '');
};

const sortTop = (list, value) => {
  const res = [];
  const countList = list.filter(item => item.count);
  const otherList = list.filter(item => !item.count);
  list = countList.concat(otherList);
  if (value) {
    const top = [];
    list.forEach(item => {
      if (item.value == value) {
        top.push(item);
      } else {
        res.push(item);
      }
    });
    return top.concat(res);
  } else {
    return list;
  }
};

/**
 * 对置顶和草稿的数据进行排序
 * @param  {Array} sessions 列表
 * @return {Array}          排序之后的结果
 */
export const sortSession = (sessions, value, messageListShowType = md.global.Account.messageListShowType) => {
  sessions = _.orderBy(sessions, ['sendMsg']);
  const other = [];
  const top = [];
  const count = [];

  if (messageListShowType === 1) {
    sessions.forEach(item => {
      const isTop = item.top_info ? item.top_info.isTop : false;
      if (isTop) {
        top.push(item);
      } else if (item.count && ('isPush' in item ? item.isPush : true)) {
        count.push(item);
      } else {
        other.push(item);
      }
    });
    const sortList = sortTop(top, value).sort((a, b) => {
      const aHasValue = a.count != null && a.count !== 0;
      const bHasValue = b.count != null && b.count !== 0;
      if (aHasValue && !bHasValue) return -1;
      if (!aHasValue && bHasValue) return 1;
      return 0;
    });
    return count.concat(sortList, other);
  } else {
    sessions.forEach(item => {
      const isTop = item.top_info ? item.top_info.isTop : false;
      if (isTop) {
        top.push(item);
      } else {
        other.push(item);
      }
    });
    return sortTop(top, value).concat(other);
  }
};

/**
 * 处理会话列表的数据
 * @param {*} sessionList
 */
export const formatSessionList = sessionList => {
  sessionList = sessionList.filter(item => item);
  return sessionList.map(item => {
    return formatSession(item);
  });
};

const formatSession = item => {
  if (item.from && !item.sysType) {
    const { iswd } = item;
    const isSelf = item.from.id === md.global.Account.accountId;
    const isAdmin = item.wdAdminid === md.global.Account.accountId;
    const isFileTransfer = item.value === 'file-transfer';
    const wdAdminid = item.wdAdminid;
    if (isSelf) {
      let con = '';
      if (isFileTransfer) {
        con = item.msg.con;
      } else if (iswd) {
        con = wdAdminid ? `${_l('管理员撤回了一条你的消息')}` : `${_l('你')}${item.msg.con}`;
      } else {
        con = `${_l('我')}: ${item.msg.con}`;
      }
      item.msg.con = con;
    } else {
      let con = '';
      if (iswd) {
        if (wdAdminid) {
          con = isAdmin ? `${_l('你撤回了成员“%0”的一条消息', item.from.name)}` : `${_l('管理员撤回了一条成员消息')}`;
        } else {
          con = `"${item.from.name}"${item.msg.con}`;
        }
      } else {
        con = `${item.from.name}: ${item.msg.con}`;
      }
      item.msg.con = con;
    }
  } else {
    switch (item.type) {
      case Constant.SESSIONTYPE_SYSTEM:
        item.name = _l('系统');
        item.iconType = 'system';
        break;
      case Constant.SESSIONTYPE_POST:
        item.name = _l('动态');
        item.iconType = 'post';
        break;
      case Constant.SESSIONTYPE_CALENDAR:
        item.name = _l('日程');
        item.iconType = 'calendar';
        break;
      case Constant.SESSIONTYPE_TASK:
        item.name = _l('任务');
        item.iconType = 'task';
        break;
      case Constant.SESSIONTYPE_KNOWLEDGE:
        item.name = _l('知识');
        item.iconType = 'knowledge';
        break;
      case Constant.SESSIONTYPE_HR:
        item.name = _l('人事');
        item.iconType = 'hr';
        break;
      case Constant.SESSIONTYPE_WORKSHEET:
        item.name = _l('应用');
        item.iconType = 'worksheet';
        break;
      case Constant.SESSIONTYPE_WORKFLOW:
        item.name = _l('工作流');
        item.iconType = 'workflow';
        break;
      default:
        break;
    }
  }

  item._time = item.time;
  item.time = formatMsgDate(dateConvertToUserZone(item.time), false);
  item.type = Number(item.type);
  item.messageAtlist = item.atlist;
  item.sendMsg = localStorage.getItem(`textareaValue${item.value}`);
  item.msg.con = htmlDecodeReg(item.msg.con);

  return item;
};

/**
 * 过滤重复的会话消息
 * @param {*} list
 */
export const filterSessionList = list => {
  list = _.chain(list)
    .groupBy('value')
    .map(value => {
      return value[0];
    })
    .value();
  return list;
};

/**
 * 处理聊天消息的数据
 * @param {*} messages
 */
export const formatMessages = messages => {
  return messages.map((item, index) => {
    return formatMessage(item, messages[index - 1]);
  });
};

export const formatMessage = (message, prevMessage) => {
  message.timestamp = formatMsgDate(dateConvertToUserZone(message.time));
  message.isMine = message.from === md.global.Account.accountId;
  // 连续消息
  if (
    message &&
    prevMessage &&
    message.from === prevMessage.from &&
    moment(message.time).valueOf() - moment(prevMessage.time).valueOf() <= 60 * 3000
  ) {
    message.timestamp = null;
    if (prevMessage.iswd || prevMessage.sysType) {
      message.isDuplicated = false;
    } else {
      const isText = message.type === Constant.MSGTYPE_TEXT;
      message.isDuplicated = isText;
      if (isText) {
        message.timestamp = null;
      }
    }
    if (message.unreadLine) {
      message.isDuplicated = false;
    }
  }

  return message;
};

/**
 * 处理收到的新消息
 * @param {*} message
 */
export const formatNewMessage = (message, prevMessage) => {
  message.iswd = false;
  message.fromAccount = {
    id: message.from,
    name: message.uname,
    logo: message.logo,
  };
  return formatMessage(message, prevMessage);
};

/**
 * 处理收到的新消息处理成会话
 * @param {*} message
 */
export const formatNewSession = message => {
  if ('dtype' in message) {
    // 系统消息
    message.msg = {
      con: message.msg,
    };
    message.time = getCurrentTime();
    message.value = message.id;
  } else {
    // 个人或者群组消息
    message.iswd = false;
    message.name = message.isGroup ? message.groupname : message.uname;
    message.msgid = message.id;
    message.value = message.isGroup
      ? message.to
      : md.global.Account.accountId === message.from
        ? message.to
        : message.from;
    message.logo = message.isGroup ? message.avatar : message.logo;
    message.type = message.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
    message.time = message.time ? message.time : getCurrentTime();
    message.from = {
      id: message.from,
      name: message.uname,
      avatar: message.logo,
    };
  }
  return formatSession(message);
};

/**
 * 获取UUID
 */
export const getUUID = (function () {
  function id() {
    return Math.floor((1 + Math.random()) * 0x10000)
      .toString(16)
      .substring(1);
  }

  return function () {
    return id() + id() + '-' + id() + '-' + id() + '-' + id() + '-' + id() + id() + id();
  };
})();

/**
 * 获取服务器时间
 */
export const getCurrentTime = () => {
  return moment().format('YYYY-MM-DD HH:mm:ss.SSS');
};

export const cardDisposeName = card => {
  const { md, entityid, extra } = card;
  switch (md) {
    case 'task':
      return {
        name: _l('任务'),
        param: {
          task: entityid,
        },
      };
    case 'calendar':
      return {
        name: _l('日程'),
        param: {
          calendar: entityid,
        },
      };
    case 'post':
      return {
        name: _l('动态'),
        noTiele: true,
        isPost: true,
        param: {
          post: entityid,
        },
      };
    case 'vote':
      return {
        name: _l('投票'),
        noTiele: true,
        param: {
          post: entityid,
        },
      };
    case 'kcfile':
      return {
        name: _l('知识'),
      };
    case 'kcfolder':
      return {
        name: _l('知识文件夹'),
        noTiele: true,
      };
    case 'url':
      return {
        name: _l('链接'),
      };
    case 'worksheetrow':
      const { rowId } = extra || {};
      return {
        param: {
          worksheetrow: `${entityid}>${rowId}`,
        },
      };
    case 'worksheet':
      return {
        name: _l('应用'),
        // param: {
        //   worksheet: entityid,
        // }
      };
    default:
      return {
        name: _l('链接'),
      };
  }
};

/**
 * 链接转化,将字符串中的链接转化为成a 标签
 * @param {*} str
 */
export const toLink = str => {
  // url前面加一个空格
  // str = str.replace(/(http|https|ftp):\/\//ig, ' $1://');
  const urlReg = /((http|https|ftp):\/\/|w{1,3}\.)[^\s|<|\u4E00-\u9FA5]+/gi;
  // var urlReg = /((http|https|ftp):\/\/|www)[^\s\|<\|\u4E00-\u9FA5]*[^(http|https|ftp:\/\/)]/ig;
  return str.replace(urlReg, m => {
    let _href = m;
    if (m.match(/^w{1,3}/)) {
      _href = 'http://' + m;
    }
    return '<a class="convertLink" target="_blank" href="' + _href + '">' + m.replace('&', '&amp;') + '</a>';
  });
};

/**
 * 标签转化
 * @param {*} msg
 */
export const tagConvert = msg => {
  return msg.replace(/</g, '&lt').replace(/>/g, '&gt;');
};

/**
 * 解析消息中的文本
 * @param {*} message
 */
export const messageContentParser = message => {
  return Emotion.parse(toLink(tagConvert(message)).replace(/\n/g, '<br>').replace(/\s{2}/g, ' &nbsp;'));
};

/**
 * 格式化文件大小，像8MB20KB这样的显示格式
 * @param {*} size
 */
export const formatFileSize = (size = 0) => {
  let byteSize = Math.round((size / 1024) * 100) / 100;
  let suffix = 'K';
  if (byteSize > 1024) {
    byteSize = Math.round((byteSize / 1024) * 100) / 100;
    suffix = 'M';
  } else {
    byteSize = Number(byteSize).toFixed(0);
  }

  return byteSize + suffix;
};

/**
 * 抖动聊天窗口
 * @param {*} id
 */
export const shake = id => {
  const el = $(`#ChatPanel-${id}`).find('.ChatPanel-sessionList');
  el.addClass('ChatPanel-shake').on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
    $(this).removeClass('ChatPanel-shake');
  });
};

/**
 * 引用消息高亮
 * @param {*} id
 */
export const highlightReferMessage = id => {
  setTimeout(() => {
    const el = $(`#ChatPanel-${id}`).find('.ChatPanel-MessageRefer');
    highlight(el);
  }, 0);
};

/**
 * 消息高亮
 * @param {*} id
 */
export const highlightMessage = id => {
  const el = $(`#Message-${id}`).find('.Message-container');
  highlight(el);
};

/**
 * 高亮dom
 * @param {*} el
 */
const highlight = el => {
  const className = 'highlight';
  el.addClass(className).on('webkitAnimationEnd oAnimationEnd MSAnimationEnd animationend', function () {
    $(this).removeClass(className);
  });
};

/**
 * 滚动到底部
 * @param {*} id
 * @param {*} isBottom
 */
export const scrollEnd = (id, isBottom = false) => {
  const scrollView = window[`scrollView-${id}`];
  if (scrollView) {
    const { scrollTop, maxScrollTop } = scrollView.getScrollInfo();
    if (maxScrollTop && (isBottom || maxScrollTop - scrollTop < 200)) {
      scrollView.scrollTo({ top: maxScrollTop });
    }
  }
};

/**
 * 会话列表滚动到顶部
 * @param {*} id
 */
export const sessionListScrollTop = () => {
  const scrollView = $('.ChatList-sessionList-wrapper .scroll-viewport')[0];
  scrollView.scrollTo({ top: 0 });
};

/**
 * 开启消息提示
 */
let flashTitleInterval = null;
export const flashTitle = () => {
  if (!window.isOpenMessageTwinkle) return;
  if (flashTitleInterval) return;
  flashTitleInterval = window.setInterval(() => {
    let _title = window.document.title;
    if (_title.indexOf('【' + _l('新消息') + '】') === -1) {
      window.document.title = '【' + _l('新消息') + '】' + _title.replace('【　　　】', '');
    } else {
      window.document.title = '【　　　】' + _title.replace('【' + _l('新消息') + '】', '');
    }
    _title = window.document.title;
  }, 600);
};

/**
 * 关闭消息提示
 */
export const removeFlashTitle = (value, sessionList) => {
  const list = sessionList.filter(session => session.value !== value);
  if (!isCount(list)) {
    window.clearInterval(flashTitleInterval);
    flashTitleInterval = null;
    window.document.title = window.document.title.replace('【' + _l('新消息') + '】', '').replace('【　　　】', '');
  }
};

/**
 * 聊天新消息的语音提示
 */
export const playSessionNewMsgAudio = () => {
  if (!window.isOpenMessageSound || !window.isNewTab()) return;
  document.getElementById('sessionNewMsgAudio').play();
};

/**
 * 系统新消息的语音提示
 */
export const playSystemNewMsgAudio = () => {
  if (!window.isOpenMessageSound || !window.isNewTab()) return;
  document.getElementById('systemNewMsgAudio').play();
};

/**
 * 新聊天页
 * @param {*} id
 * @param {*} isGroup
 */
export const windowOpen = (id, name, isGroup) => {
  const type = isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER;
  const iTop = (window.screen.availHeight - 660) / 2; // 获得窗口的垂直位置;
  const iLeft = (window.screen.availWidth - 930) / 2; // 获得窗口的水平位置;
  const options = 'width=930,height=598,toolbar=no,menubar=no,location=no,status=no,top=' + iTop + ',left=' + iLeft;
  window.open(`/chat_window?id=${id}&name=${name}&type=${type}`, '_blank', options);
};

/**
 * 管理全局聊天的窗口
 */
export const chatWindow = {
  set(id) {
    safeLocalStorageSetItem(`chat_window_${id}`, true);
  },
  remove(id) {
    localStorage.removeItem(`chat_window_${id}`);
  },
  is(id) {
    return !!localStorage.getItem(`chat_window_${id}`);
  },
};

/**
 * 获取光标的位置
 * @param {*} el
 */
export const getCursortPosition = el => {
  let cursorIndex = 0;
  if (document.selection) {
    el.focus();
    let range = document.selection.createRange();
    range.moveStart('character', -el.value.length);
    cursorIndex = range.text.length;
  } else if (el.selectionStart || el.selectionStart == 0) {
    cursorIndex = el.selectionStart;
  }
  return cursorIndex;
};

/**
 * 记录光标的位置
 * @param {*} id
 */
export const recordCursortPosition = id => {
  const el = $(`#ChatPanel-${id} textarea`);
  window.currentCursortPosition = getCursortPosition(el.get(0));
};

/**
 * 获取 inbox 的 value
 * @param {*} type
 */
export const getInboxId = function (type) {
  switch (type * 1) {
    case Constant.SESSIONTYPE_SYSTEM:
      return 'system';
    case Constant.SESSIONTYPE_POST:
      return 'post';
    case Constant.SESSIONTYPE_CALENDAR:
      return 'calendar';
    case Constant.SESSIONTYPE_TASK:
      return 'task';
    case Constant.SESSIONTYPE_KNOWLEDGE:
      return 'knowledge';
    case Constant.SESSIONTYPE_HR:
      return 'hr';
    case Constant.SESSIONTYPE_WORKSHEET:
      return 'worksheet';
    case Constant.SESSIONTYPE_WORKFLOW:
      return 'workflow';
    default:
      return '';
  }
};

export const getIsInbox = id => _.toArray(INBOXTYPES).includes(id);

/**
 * 是否还存在计数
 * @param {*} list
 */
export const isCount = list => {
  let isCount = false;
  for (let i = 0; i < list.length; i++) {
    const session = list[i] || {};
    const hasPush = 'isPush' in session ? session.isPush : true;
    const notSilient = 'isSilent' in session ? !session.isSilent || [1, 2].includes(session.showBadge) : true;
    if (session && session.count && hasPush && notSilient) {
      isCount = true;
      continue;
    }
  }
  return isCount;
};

export const getToolbarConfig = () => {
  const mingoFixing = localStorage.getItem('mingoFixing') === 'true';
  const sessionListFixing = localStorage.getItem('sessionListFixing') === 'true';
  const favoriteFixing = localStorage.getItem('favoriteFixing') === 'true';
  const toolBarOpenType = localStorage.getItem('toolBarOpenType');
  return {
    mingoVisible: toolBarOpenType === 'mingo' && mingoFixing,
    mingoFixing,
    sessionListVisible: toolBarOpenType === 'sessionList' && sessionListFixing,
    sessionListFixing,
    favoriteVisible: toolBarOpenType === 'favorite' && favoriteFixing,
    favoriteFixing,
  };
};

export const convertGroupAbout = value => {
  return value ? toLink(tagConvert(value)).replace(/\r\n|\n/gi, '<br/>') : _l('暂无群公告');
};
