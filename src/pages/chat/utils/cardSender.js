import React from 'react';
import ReactDom from 'react-dom';
import Constant from './constant';
import { createLinksForMessage } from 'src/components/common/function';
import RelationControl from 'src/components/relationControl/relationControl';
import 'src/components/createTask/createTask';
import 'src/components/createCalendar/createCalendar';
import s from 'src/components/common/mstc/s/s';
import moment from 'moment';

const _initPost = function(acceptor, options, callback) {
  s({
    defaultPostType: options.defaultType,
    showType: options.showType,
    createShare: options.showSuccessTip || false,
    postMsg: options.postMsg,
    selectGroupOptions: {
      defaultValue: options.isPost ? acceptor.id : '',
      defaultValueAllowChange: false,
    },
    callback(post) {
      const message = {
        type: Constant.MSGTYPE_CARD,
        card: {
          md: post.postType === '7' ? 'vote' : 'post',
          entityid: post.postID,
          url: md.global.Config.WebUrl + 'feeddetail?itemID=' + post.postID,
          title: createLinksForMessage({
            message: post.message,
            rUserList: post.rUserList,
            rGroupList: post.rGroupList,
            categories: post.categories,
            noLink: true,
            filterFace: true,
            filterTask: true,
          }).slice(0, 300),
          text: '',
        },
      };
      callback(message);
    },
  });
};

/**
 * 创建任务
 * @param {*} acceptor
 * @param {*} options
 */
export const newTask = (acceptor, options = {}) => {
  return new Promise((resolve, reject) => {
    let members = {};
    if (acceptor.type === Constant.SESSIONTYPE_USER && acceptor.id !== Constant.FILE_TRANSFER.id) {
      members = [
        {
          accountId: acceptor.id,
          fullname: acceptor.name,
          avatar: acceptor.avatar,
        },
      ];
    }
    $.CreateTask({
      MemberArray: members,
      ProjectID: acceptor.isGroup ? acceptor.projectId : '',
      Description: options.description || '',
      createShare: options.showSuccessTip,
      callback(res) {
        if (res.status !== true) {
          reject(res);
          return false;
        }
        const task = res.data;
        const message = {
          type: Constant.MSGTYPE_CARD,
          card: {
            md: 'task',
            entityid: task.taskID,
            url: md.global.Config.WebUrl + 'apps/task/task_' + task.taskID,
            title: task.taskName,
            text: '',
          },
        };
        resolve(message);
      },
    });
  });
};

/**
 * 选择任务
 * @param {*} acceptor
 * @param {*} options
 */
export const selectTask = acceptor => {
  return new Promise((resolve, reject) => {
    const onSubmit = task => {
      const { sid, name } = task;
      const message = {
        type: Constant.MSGTYPE_CARD,
        card: {
          md: 'task',
          entityid: sid,
          url: md.global.Config.WebUrl + 'apps/task/task_' + sid,
          title: name,
          text: '',
        },
      };
      resolve(message);
    };

    ReactDom.render(<RelationControl types={[1]} onSubmit={onSubmit} />, document.createElement('div'));
  });
};

/**
 * 创建日程
 * @param {*} acceptor
 * @param {*} options
 */
export const newSchedule = (acceptor, options = {}) => {
  return new Promise((resolve, reject) => {
    let members = [];
    if (acceptor.type === Constant.SESSIONTYPE_USER && acceptor.id !== Constant.FILE_TRANSFER.id) {
      members = [
        {
          accountId: acceptor.id,
          fullname: acceptor.name,
          avatar: acceptor.avatar,
        },
      ];
    }
    $.CreateCalendar({
      MemberArray: members,
      createShare: options.showSuccessTip,
      Message: options.description || '',
      callback(calendar) {
        const message = {
          type: Constant.MSGTYPE_CARD,
          card: {
            md: 'calendar',
            entityid: calendar.calendarID,
            url: md.global.Config.WebUrl + 'apps/calendar/detail_' + calendar.calendarID,
            title: calendar.name,
            text: '',
          },
        };
        resolve(message);
      },
    });
  });
};

/**
 * 选择日程
 * @param {*} acceptor
 */
export const selectSchedule = acceptor => {
  return new Promise((resolve, reject) => {
    const onSubmit = item => {
      const { sid, name, sidext } = item;
      const message = {
        type: Constant.MSGTYPE_CARD,
        card: {
          md: 'calendar',
          entityid: sid,
          url: md.global.Config.WebUrl + 'apps/calendar/detail_' + sid,
          title: name,
          text: '',
        },
      };
      if (sidext) {
        message.card.url += '_' + moment(sidext).format('YYYYMMDDHHmmss');
        message.card.entityid += '_' + moment(sidext).format('YYYYMMDDHHmmss');
      }
      resolve(message);
    };

    ReactDom.render(<RelationControl types={[3]} onSubmit={onSubmit} />, document.createElement('div'));
  });
};

/**
 * 投票
 * @param {*} acceptor
 * @param {*} options
 */
export const newVote = (acceptor, options) => {
  return new Promise((resolve, reject) => {
    _initPost(
      acceptor,
      {
        defaultType: 7,
        isPost: acceptor.isPost,
        showSuccessTip: options.showSuccessTip,
        showType: ['post', 'vote'],
      },
      message => {
        resolve(message);
      },
    );
  });
};

/**
 * 动态
 * @param {*} acceptor
 * @param {*} options
 */
export const newFeed = (acceptor, options) => {
  return new Promise((resolve, reject) => {
    _initPost(
      acceptor,
      {
        defaultType: 0,
        isPost: acceptor.isPost,
        postMsg: options.postMsg || '',
        showSuccessTip: options.showSuccessTip,
        showType: ['post', 'attachment'],
      },
      message => {
        resolve(message);
      },
    );
  });
};
