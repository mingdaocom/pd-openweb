import _ from 'lodash';
import Constant from './constant';
import { htmlDecodeReg } from 'src/util';

/**
 * 时间戳的转换
 * @param dateStr
 * @returns {*}
 */
export const createTimeSpan = dateStr => {

  if (!dateStr) return dateStr;

  const dateTime = new Date();

  const date = dateStr.split(' ')[0];
  const year = date.split('-')[0];
  const month = date.split('-')[1] - 1;
  const day = date.split('-')[2];

  const time = dateStr.split(' ')[1];
  const hour = time.split(':')[0];
  const minute = time.split(':')[1];
  const second = time.split(':')[2];

  dateTime.setFullYear(year);
  dateTime.setMonth(month);
  dateTime.setDate(day);
  dateTime.setHours(hour);
  dateTime.setMinutes(minute);
  dateTime.setSeconds(second);

  const now = new Date();

  const today = new Date();
  today.setFullYear(now.getFullYear());
  today.setMonth(now.getMonth());
  today.setDate(now.getDate());
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  let milliseconds = 0;
  let timeSpanStr;
  if (dateTime - today >= 0) {
    timeSpanStr = hour + ':' + minute;
  } else {
    milliseconds = today - dateTime;
    if (milliseconds < 86400000) {
      timeSpanStr = _l('昨天') + ' ' + hour + ':' + minute;
    } else if (milliseconds > 86400000 && year == today.getFullYear()) {
      timeSpanStr = _l('%0月%1日', month + 1, day) + ' ' + hour + ':' + minute;
    } else {
      timeSpanStr = _l('%0/%1/%2/', year, month + 1, day) + ' ' + hour + ':' + minute;
    }
  }
  return timeSpanStr;
};

export const formatMsgDate = (dateStr, isText = false) => {
  const dateTime = new Date();

  const date = dateStr.split(' ')[0];
  const year = date.split('-')[0];
  const month = date.split('-')[1] - 1;
  const day = date.split('-')[2];

  const time = dateStr.split(' ')[1];
  const hour = time.split(':')[0];
  const minute = time.split(':')[1];
  const second = time.split(':')[2];

  dateTime.setFullYear(year);
  dateTime.setMonth(month);
  dateTime.setDate(day);
  dateTime.setHours(hour);
  dateTime.setMinutes(minute);
  dateTime.setSeconds(second);

  const now = new Date();

  const today = new Date();
  today.setFullYear(now.getFullYear());
  today.setMonth(now.getMonth());
  today.setDate(now.getDate());
  today.setHours(0);
  today.setMinutes(0);
  today.setSeconds(0);

  let milliseconds = 0;
  let timeSpanStr;
  if (dateTime - today >= 0) {
    timeSpanStr = hour + ':' + minute;
  } else {
    milliseconds = today - dateTime;
    if (milliseconds < 86400000) {
      timeSpanStr = _l('昨天') + ' ' + hour + ':' + minute;
    } else if (milliseconds > 86400000 && year == today.getFullYear()) {
      timeSpanStr = _l('%0月%1日', month + 1, day);
    } else {
      let text = isText ? '%0年%1月%2日' : '%0/%1/%2';
      timeSpanStr = _l(text, year, month + 1, day);
    }
  }
  return timeSpanStr;
};

/**
 * 获取时间戳
 * @param {*} time
 */
const getTimeStamp = (time, prevTime, force) => {
  let _time = time;
  force = force === true;

  // 传来的时间戳的类型有：
  // 后台来的时间格式：2015-9-17 16:3725.337
  // 自己发送消息的毫秒数：1442479105055
  if (_time && typeof _time !== 'number') {
    _time = _time.replace(/-/g, '/');
    const ms = Number(_time.substring(_time.lastIndexOf('.') + 1));
    _time = new Date(_time.substring(0, _time.lastIndexOf('.'))).getTime() + ms;
  } else {
    _time = moment(getCurrentTime())
      .toDate()
      .getTime();
  }

  let timeStamp = '';
  const now = moment(getCurrentTime()).toDate();

  prevTime = prevTime || 0;

  // 间隔时间小于一分钟的消息将不会显示时间戳
  if (Math.abs(_time - prevTime) > 1000 * 60 || force) {
    timeStamp = createTimeSpan(moment(_time).format('YYYY-MM-DD HH:mm:ss.S'));
    prevTime = _time;
  }

  return timeStamp.replace(_l('刚刚'), now.getHours() + ':' + (now.getMinutes() < 10 ? '0' : '') + now.getMinutes());
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
    // res.sort(function(a, b) {
    //   return Date.parse(b._time) - Date.parse(a._time);
    // });
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
export const sortSession = (sessions, value) => {
  sessions = _.orderBy(sessions, ['sendMsg']);
  const other = [];
  const top = [];
  sessions.forEach(item => {
    const isTop = item.top_info ? item.top_info.isTop : false;
    if (isTop) {
      top.push(item);
    } else {
      other.push(item);
    }
  });

  // if (!value) {
  //   top.sort(function(a, b) {
  //     return Date.parse(b.top_info.time) - Date.parse(a.top_info.time);
  //   });
  // }

  return sortTop(top, value).concat(other);
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
    const wdAdminid = item.wdAdminid;
    if (isSelf) {
      let con = '';
      if (iswd) {
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
  item.time = formatMsgDate(item.time);
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
  list = _(list)
    .groupBy('value')
    .map((value, key) => {
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
  message.timestamp = createTimeSpan(message.time);
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
    message.count = message.count;
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
    message.count = message.count;
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
  const urlReg = /((http|https|ftp):\/\/|w{1,3}\.)[^\s\|<\|\u4E00-\u9FA5]+/gi;
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
  return $.fn.emotion.parse(
    toLink(tagConvert(message))
      .replace(/\n/g, '<br>')
      .replace(/\s{2}/g, ' &nbsp;'),
  );
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
  const className = navigator.userAgent.indexOf('Firefox') > 0 ? 'highlight' : 'highlight';
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
  const scrollView = $(`#ChatPanel-${id}`).find('.ChatPanel-sessionList .has-scrollbar');
  if (!scrollView.size()) {
    return;
  }
  const { nanoscroller } = scrollView.get(0);
  const { maxScrollTop, contentScrollTop } = nanoscroller || {};
  if (nanoscroller && (isBottom || maxScrollTop - contentScrollTop < 50)) {
    scrollView.nanoScroller({ flash: true }).nanoScroller({
      scroll: 'bottom',
    });
  }
};

/**
 * 会话列表滚动到顶部
 * @param {*} id
 */
export const sessionListScrollTop = () => {
  const scrollView = $('.ChatList-sessionList-wrapper .nano');
  scrollView.nanoScroller({ flash: true }).nanoScroller({
    scroll: 'top',
  });
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
 * 新消息的语音提示
 */
export const playReceiveAudio = () => {
  if (!window.isOpenMessageSound) return;
  if (Modernizr.audio) {
    document.getElementById('wcSound').play();
  } else {
    document.getElementById('wcSoundForIe').object.play();
  }
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

/**
 * 是否还存在计数
 * @param {*} list
 * @param {*} filterValue
 */
export const isCount = (list, filterValue) => {
  let isCount = false;
  for (let i = 0; i < list.length; i++) {
    const session = list[i] || {};
    const hasPush = 'isPush' in session ? session.isPush : true;
    if (session && session.count && hasPush) {
      isCount = true;
      continue;
    }
  }
  return isCount;
};

export const setVisible = () => {
  const value = localStorage.getItem('chatList_isUp');
  if (value === 'true') {
    return true;
  } else if (value === 'false') {
    return false;
  } else {
    safeLocalStorageSetItem('chatList_isUp', false);
    return false;
  }
};
