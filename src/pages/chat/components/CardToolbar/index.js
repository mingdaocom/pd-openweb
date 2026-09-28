import React, { Component } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { Icon } from 'ming-ui';
import { Dropdown } from 'ming-ui/antd-components';
import calendar from 'src/api/calendar';
import taskCenter from 'src/api/taskCenter';
import * as cardSender from '../../utils/cardSender';
import Constant from '../../utils/constant';
import './index.less';

const items = [
  {
    name: _l('任务'),
    icon: 'task',
    classname: 'menuItem-task',
    fn: 'onSelectTask',
  },
  {
    name: _l('日程'),
    icon: 'bellSchedule',
    classname: 'menuItem-calendar',
    fn: 'onSelectSchedule',
  },
  {
    name: _l('投票'),
    icon: 'votenobg',
    classname: 'menuItem-votenobg',
    fn: 'onNewVote',
  },
  {
    name: _l('动态'),
    icon: 'chat-inputer-post',
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
      if (item.icon === 'task') {
        return !forbidSuites.includes('2');
      }

      if (item.icon === 'bellSchedule') {
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
    cardSender.selectTask(this.acceptor).then(result => {
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
    cardSender.selectSchedule(this.acceptor).then(result => {
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
      .then(result => {
        this.props.onSendCardMsg(result);
      });
  }
  onNewFeed() {
    cardSender
      .newFeed(this.acceptor, {
        showSuccessTip: false,
      })
      .then(result => {
        this.props.onSendCardMsg(result);
      });
  }
  handleChange(visible) {
    this.setState({
      visible,
    });
  }
  renderMenuItems() {
    return this.toolItems.map(item => ({
      key: item.fn,
      icon: <Icon icon={item.icon} className="Font16 textSecondary" />,
      label: item.name,
      onClick: this.handleOpen.bind(this, item),
    }));
  }
  render() {
    const { visible } = this.state;

    if (!this.toolItems.length) {
      return <div className="ChatPanel-addToolbar noTool" />;
    }

    return (
      <Dropdown
        getPopupContainer={() => document.querySelector('.ChatPanel-wrapper')}
        menu={{ items: this.renderMenuItems(), style: { width: 180 } }}
        open={visible}
        placement="topLeft"
        trigger={['click']}
        onOpenChange={this.handleChange.bind(this)}
      >
        <div className={cx('ChatPanel-addToolbar addToolbarHover')}>
          <i className="icon-plus" />
        </div>
      </Dropdown>
    );
  }
}
