import React, { Component } from 'react';
import cx from 'classnames';
import './index.less';
import config from '../../utils/config';
import * as cardSender from '../../utils/cardSender';
import Constant from '../../utils/constant';
import Trigger from 'rc-trigger';
import taskCenter from 'src/api/taskCenter';
import calendar from 'src/api/calendar';
import moment from 'moment';

const items = [
  {
    name: _l('任务'),
    icon: 'icon-task',
    classname: 'menuItem-task',
    fn: 'onSelectTask',
  },
  {
    name: _l('日程'),
    icon: 'icon-bellSchedule',
    classname: 'menuItem-calendar',
    fn: 'onSelectSchedule',
  },
  {
    name: _l('投票'),
    icon: 'icon-votenobg',
    classname: 'menuItem-votenobg',
    fn: 'onNewVote',
  },
  {
    name: _l('动态'),
    icon: 'icon-chat-inputer-post',
    classname: 'menuItem-post',
    fn: 'onNewFeed',
  },
];

export default class CardToolbar extends Component {
  constructor(props) {
    super(props);
    const { session } = this.props;
    this.state = {
      visible: false,
    };
    this.acceptor = {
      avatar: session.avatar,
      id: session.id,
      isPost: session.isPost,
      projectId: session.projectId ? session.project.projectId : '',
      type: session.isGroup ? Constant.SESSIONTYPE_GROUP : Constant.SESSIONTYPE_USER,
    };
  }
  get toolItems() {
    const { isGroup } = this.props.session;
    const forbidSuites = _.uniq(md.global.SysSettings.forbidSuites.split('|')).filter(item => item !== '5');
    return items.filter(item => {
      if (item.icon === 'icon-task') {
        return !forbidSuites.includes('2');
      }
      if (item.icon === 'icon-bellSchedule') {
        return !forbidSuites.includes('3');
      }
      return isGroup ? !forbidSuites.includes('1') : false;
    });
  }
  handleOpen(item) {
    item.fn && this[item.fn]();
    this.setState({
      visible: false,
    });
  }
  onSelectTask() {
    cardSender.selectTask(this.acceptor).then((result) => {
      if (!this.props.session.isGroup) {
        taskCenter
          .batchAddTaskMember({
            taskIDstr: result.card.entityid,
            memberstr: this.acceptor.id,
            specialAccounts: {},
          })
          .then(() => {
            this.props.onSendCardMsg(result);
          });
      } else {
        this.props.onSendCardMsg(result);
      }
    });
  }
  onSelectSchedule() {
    cardSender.selectSchedule(this.acceptor).then((result) => {
      if (!this.props.session.isGroup) {
        const calendarOpts = result.card.entityid.split('_');
        calendar
          .addMembers({
            calendarID: calendarOpts[0],
            memberIDs: this.acceptor.id,
            specialAccounts: {},
            isAllCalendar: true,
            recurTime: calendarOpts[1] ? moment(calendarOpts[1]).toISOString() : '',
          })
          .then(() => {
            this.props.onSendCardMsg(result);
          });
      } else {
        this.props.onSendCardMsg(result);
      }
    });
  }
  onNewVote() {
    cardSender
      .newVote(this.acceptor, {
        showSuccessTip: false,
      })
      .then((result) => {
        this.props.onSendCardMsg(result);
      });
  }
  onNewFeed() {
    cardSender
      .newFeed(this.acceptor, {
        showSuccessTip: false,
      })
      .then((result) => {
        this.props.onSendCardMsg(result);
      });
  }
  handleChange(visible) {
    this.setState({
      visible,
    });
  }
  renderToolbar() {
    return (
      <div className="ChatPanel-addToolbar-menu">
        {this.toolItems.map((item, index) => (
          <div
            key={index}
            className={cx('menuItem ThemeBGColor3')}
            onClick={this.handleOpen.bind(this, item)}
          >
            <i className={item.icon} />
            <div className="menuItem-text">{item.name}</div>
          </div>
        ))}
      </div>
    );
  }
  render() {
    const { visible } = this.state;
    
    if (!this.toolItems.length) {
      return (
        <div className="ChatPanel-addToolbar noTool" />
      );
    }

    return (
      <Trigger
        popupVisible={visible}
        onPopupVisibleChange={this.handleChange.bind(this)}
        popupClassName="ChatPanel-Trigger"
        action={['click']}
        popupPlacement="top"
        builtinPlacements={config.builtinPlacements}
        popup={this.renderToolbar()}
        popupAlign={{ offset: [64, -10] }}
        getPopupContainer={() => document.querySelector('.ChatPanel-wrapper')}
      >
        <div className={cx('ChatPanel-addToolbar ThemeBorderColor3 ThemeBGColor3', { addToolbarHover: !visible })}>
          <i className="icon-plus" />
        </div>
      </Trigger>
    );
  }
}
