import React, { Component } from 'react';
import { connect } from 'react-redux';
import './members.less';
import { dialogSelectUser } from 'ming-ui/functions';
import config from '../../config/config';
import { addMembers } from '../../redux/actions';
import ajaxRequest from 'src/api/taskCenter';
import _ from 'lodash';
import { Dialog, UserHead } from 'ming-ui';

class Members extends Component {
  constructor(props) {
    super(props);
  }

  componentDidMount() {
    // 竖着滚动对应右侧竖着滚动
    $(this.ganttMembersList).on({
      mouseover() {
        config.scrollSelector = $(this);
      },
      scroll() {
        if (config.scrollSelector && !config.scrollSelector.is($('.ganttMain .timeBarContainer'))) {
          $('.ganttMain .timeBarContainer').scrollTop(this.scrollTop);
        }
      },
    });
  }

  /**
   * 添加成员
   * @param {object} evt
   */
  addMembers(evt) {
    const selectedAccountIds = this.props.accountTasksKV.map(item => item.account.accountId);

    dialogSelectUser({
      sourceId: config.folderId,
      title: _l('添加负责人'),
      showMoreInvite: false,
      fromType: 6,
      SelectUserSettings: {
        includeUndefinedAndMySelf: true,
        filterAccountIds: ['user-undefined'],
        selectedAccountIds,
        projectId: config.projectId,
        callback: users => {
          this.props.dispatch(addMembers(users));
          this.addMembersJoinFolder(users);
          $(this.ganttMembersList).scrollTop(0);
        },
      },
    });
  }

  /**
   * 询问选择的人员是否加入项目
   * @param {[]} users
   */
  addMembersJoinFolder(users) {
    ajaxRequest
      .checkAccountNeedAddIntoFolder({
        folderId: config.folderId,
        accountIds: _.map(users, user => user.accountId),
      })
      .then(source => {
        if (source.status) {
          if (source.data.length > 0) {
            this.addFolderMembers(source.data);
          }
        }
      });
  }

  /**
   * 添加项目成员
   * @param {[]} users
   */
  addFolderMembers(users) {
    const members = [];

    for (let i = 0; i < users.length && i < 3; i++) {
      members.push(`<span class="ThemeColor3">${users[i].fullname}</span>`);
    }

    const message = members.join('、') + (users.length > 3 ? _l('等%0人', users.length) : '');

    Dialog.confirm({
      title: _l('加为项目成员'),
      cancelText: _l('暂不需要'),
      okText: _l('加入项目'),
      closable: false,
      children: (
        <div style="color: #999;">
          {_l('您添加的%0不是项目成员也不在项目当前公开范围内，是否要将他们加入项目？', message)}
        </div>
      ),
      onOk: () => {
        ajaxRequest.addFolderMembers({
          folderID: config.folderId,
          memberIDs: _.map(users, user => user.accountId).join(','),
        });
      },
    });
  }

  /**
   * 获取任务计数
   * @param {[[]]} taskTimeBars
   * @return {number}
   */
  getTaskCount(taskTimeBars) {
    let count = 0;
    taskTimeBars.forEach(item => {
      count += item.length;
    });

    return count;
  }

  render() {
    const { accountTasksKV } = this.props;
    return (
      <div className="ganttMembers">
        <div className="flexColumn">
          <header>
            {_l('人员列表 (%0)', accountTasksKV.length)}
            <i className="icon-invite Font18 ThemeColor3 pointer" onClick={evt => this.addMembers(evt)} />
          </header>
          <ul
            className="ganttMembersList flex"
            ref={ganttMembersList => {
              this.ganttMembersList = ganttMembersList;
            }}
          >
            {accountTasksKV.map((item, i) => {
              return (
                <li key={i} style={{ height: item.taskTimeBars.length * 26 }}>
                  <UserHead
                    className="ganttMembersAvatar"
                    user={{
                      userHead: item.account.avatar,
                      accountId: item.account.accountId,
                    }}
                    size={24}
                  />
                  <span className="overflow_ellipsis">{item.account.fullname}</span>(
                  {this.getTaskCount(item.taskTimeBars)})
                </li>
              );
            })}
          </ul>
        </div>
      </div>
    );
  }
}

export default connect(state => {
  const { accountTasksKV } = state.task;

  return {
    accountTasksKV,
  };
})(Members);
