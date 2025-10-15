import React, { Component, Fragment } from 'react';
import { connect } from 'react-redux';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import { Dialog, RichText, ScrollView, UserHead } from 'ming-ui';
import Icon from 'ming-ui/components/Icon';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { dialogSelectUser, quickSelectUser } from 'ming-ui/functions';
import ajaxRequest from 'src/api/taskCenter';
import Commenter from 'src/components/comment/commenter';
import CommentList from 'src/components/comment/commentList';
import Editor from 'src/pages/PageHeader/AppPkgHeader/AppDetail/EditorDiaLogContent';
import editFolder from '../../components/editFolder/editFolder';
import { clearFolderTip } from '../../redux/actions';
import { checkIsProject, errorMessage } from '../../utils/utils';
import './folderDetail.less';

class FolderDetail extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isEditing: false,
      data: {},
      discussions: [],
      tabIndex: 1,
      onlyLook: false,
      logPageIndex: 1,
      logs: [],
    };
  }

  // 获取详情
  folderPostPromise = null;

  componentDidMount() {
    this.mounted = true;
    this.getFolderDetail();
  }

  componentWillReceiveProps(nextProps) {
    if (nextProps.taskConfig.folderId && nextProps.taskConfig.folderId !== this.props.taskConfig.folderId) {
      // 解决props未更新问题
      setTimeout(() => {
        this.setState({
          isEditing: false,
          tabIndex: 1,
          onlyLook: false,
          logPageIndex: 1,
          logs: [],
        });
        $('.taskList .scroll-viewport').scrollTop(0);
        this.getFolderDetail();
      }, 0);
    }
  }

  componentWillUnmount() {
    this.mounted = false;
  }

  /**
   * 获取项目详情
   */
  getFolderDetail() {
    const { folderId } = this.props.taskConfig;
    const { isNotice } = this.props.folderSettings;

    if (this.folderPostPromise) {
      this.folderPostPromise.abort();
    }

    // 获取描述
    this.folderPostPromise = ajaxRequest.getFolderDetail({ folderID: folderId });
    this.folderPostPromise.then(result => {
      this.folderPostPromise = false;

      if (!this.mounted) {
        return;
      }

      if (isNotice) {
        const $li = $('.folderList li[data-id=' + folderId + ']');
        let count = 0;

        // 清除当前小红点
        $li.find('.folderNewTip').remove();

        // 文件夹下小红点计数
        const $projectFolder = $li.closest('.projectFolder');
        if ($projectFolder.length) {
          const length = $projectFolder.find('.projectFolderUl .folderNewTip').length;
          if (!length) {
            $projectFolder.find('.folderTitle .folderNewTip').addClass('Hidden');
          }
        }

        // 网络下小红点计数
        let $networkFolderList = $li.closest('.networkFolderList');
        if ($networkFolderList.length) {
          count = parseInt($networkFolderList.attr('data-count'), 10) - 1;
          $networkFolderList.attr('data-count', count);
          if (!count) {
            $networkFolderList.find('.allFolders .folderNewTip').addClass('Hidden');
          }
        }

        // 置顶项目小红点处理
        const $topFolderList = $li.closest('.topFolderList');
        // 打开的是置顶项目  项目对应的网络未展开
        if ($topFolderList.length && $li.length === 1) {
          let projectId = $li.data('projectid');
          let isExist = false;
          $.map(md.global.Account.projects, project => {
            if (projectId === project.projectId) {
              isExist = true;
              return;
            }
          });

          projectId = !isExist ? '' : projectId;

          if (!projectId) return;

          $networkFolderList = $('.networkFolderList[data-projectid=' + projectId + ']');
          count = parseInt($networkFolderList.attr('data-count'), 10) - 1;
          $networkFolderList.attr('data-count', count);
          if (!count) {
            $networkFolderList.find('.allFolders .folderNewTip').addClass('Hidden');
          }
        }
      }

      this.props.dispatch(clearFolderTip());
      this.setState({ data: result.data });
    });
  }

  /**
   * 更新描述
   */
  updateFolderDesc = describe => {
    const { data } = this.state;

    // 退出编辑
    this.setState({ isEditing: false });

    if (data.describe !== describe) {
      ajaxRequest
        .updateFolderDes({
          folderID: this.props.taskConfig.folderId,
          describe,
        })
        .then(source => {
          if (source.status) {
            alert('修改成功');
            this.setState({ data: Object.assign({}, data, { describe: source.data }) });
          } else {
            errorMessage(source.error);
          }
        });
    }
  };

  /**
   * 渲染项目负责人
   */
  renderFolderCharge() {
    const { data } = this.state;
    const operation = (
      <span className="folderDetailOpBtn updateFolderCharge ThemeColor3" onClick={this.updateFolderChargeEvents}>
        {_l('项目托付给他人')}
      </span>
    );
    return (
      <li>
        <div className="folderMemberList">
          <UserHead
            user={{
              userHead: data.chargeUser.avatar,
              accountId: data.chargeUser.accountID,
            }}
            size={28}
            secretType={1}
            operation={data.chargeUser.accountID === md.global.Account.accountId ? operation : null}
          />
        </div>
      </li>
    );
  }

  /**
   * 将项目托付给他人
   */
  updateFolderChargeEvents = () => {
    const { data } = this.state;
    dialogSelectUser({
      sourceId: data.folderID,
      title: _l('选择负责人'),
      showMoreInvite: false,
      fromType: 6,
      SelectUserSettings: {
        filterAccountIds: [md.global.Account.accountId],
        projectId: checkIsProject(data.projectID) ? data.projectID : '',
        unique: true,
        callback: users => {
          this.updateFolderCharge(users[0].accountId, users[0].avatar, users[0].fullname);
        },
      },
    });
  };

  /**
   * 渲染项目管理员
   */
  renderFolderAdmin() {
    const { data } = this.state;
    const getOpHtml = item => {
      const { accountID, avatar, fullName } = item;
      if (data.chargeUser.accountID === md.global.Account.accountId) {
        return (
          <Fragment>
            <span
              className="folderDetailOpBtn updateFolderChargeFix borderRight ThemeColor3"
              onClick={() => this.clickEvents('updateFolderChargeFix', accountID, avatar, fullName)}
            >
              {_l('设为负责人')}
            </span>
            <span
              className="folderDetailOpBtn updateFolderMember borderRight ThemeColor3"
              onClick={() => this.clickEvents('updateFolderMember', accountID, avatar, fullName)}
            >
              {_l('设为成员')}
            </span>
            <span
              className="folderDetailOpBtn updateFolderLeave fixWidth ThemeColor3"
              onClick={() => this.clickEvents('updateFolderLeave', accountID, avatar, fullName)}
            >
              {_l('移出')}
            </span>
          </Fragment>
        );
      } else if (data.isAdmin) {
        return (
          <Fragment>
            <span
              className="folderDetailOpBtn updateFolderMember borderRight ThemeColor3"
              onClick={() => this.clickEvents('updateFolderMember', accountID, avatar, fullName)}
            >
              {_l('设为成员')}
            </span>
            <span
              className="folderDetailOpBtn updateFolderLeave ThemeColor3"
              onClick={() => this.clickEvents('updateFolderLeave', accountID, avatar, fullName)}
            >
              {accountID === md.global.Account.accountId ? _l('退出') : _l('移出')}
            </span>
          </Fragment>
        );
      }
      return null;
    };

    return (
      <li>
        {data.admins.map((item, i) => {
          return (
            <div key={i} className="folderMemberList">
              <UserHead
                user={{
                  userHead: item.avatar,
                  accountId: item.accountID,
                }}
                size={28}
                secretType={1}
                operation={data.isAdmin ? getOpHtml(item) : null}
              />
            </div>
          );
        })}

        {data.isAdmin && (
          <span data-tip={_l('添加项目管理员')}>
            <i
              className="icon-task-add-member-circle pointer ThemeColor3"
              onClick={evt => this.addFolderMembersEvents(evt, true)}
            />
          </span>
        )}
      </li>
    );
  }

  /**
   * 渲染项目成员
   */
  renderFolderMember() {
    const { data } = this.state;
    const getOpHtml = (item, isApply) => {
      const { accountID, avatar, fullName } = item;
      if (isApply && data.isAdmin) {
        return (
          <Fragment>
            <span
              className="folderDetailOpBtn updateFolderApplyAdmin borderRight ThemeColor3"
              onClick={() => this.clickEvents('updateFolderApplyAdmin', accountID, avatar, fullName)}
            >
              {_l('设为管理员')}
            </span>
            <span
              className="folderDetailOpBtn updateFolderApplyMember borderRight ThemeColor3"
              onClick={() => this.clickEvents('updateFolderApplyMember', accountID, avatar, fullName)}
            >
              {_l('设为成员')}
            </span>
            <span
              className="folderDetailOpBtn updateFolderRefuse fixWidth ThemeColor3"
              onClick={() => this.clickEvents('updateFolderRefuse', accountID, avatar, fullName)}
            >
              {_l('拒绝')}
            </span>
          </Fragment>
        );
      } else if (data.isAdmin) {
        // 负责人多一个设为负责人操作项
        return (
          <Fragment>
            {data.chargeUser.accountID === md.global.Account.accountId && (
              <span
                className="folderDetailOpBtn updateFolderChargeFix borderRight ThemeColor3"
                onClick={() => this.clickEvents('updateFolderChargeFix', accountID, avatar, fullName)}
              >
                {_l('设为负责人')}
              </span>
            )}
            <span
              className="folderDetailOpBtn updateFolderAdmin borderRight ThemeColor3"
              onClick={() => this.clickEvents('updateFolderAdmin', accountID, avatar, fullName)}
            >
              {_l('设为管理员')}
            </span>
            <span
              className={cx('folderDetailOpBtn updateFolderLeave ThemeColor3', {
                fixWidth: data.chargeUser.accountID === md.global.Account.accountId,
              })}
              onClick={() => this.clickEvents('updateFolderLeave', accountID, avatar, fullName)}
            >
              {_l('移出')}
            </span>
          </Fragment>
        );
      } else if (accountID === md.global.Account.accountId) {
        return (
          <span
            className="folderDetailOpBtn updateFolderLeave ThemeColor3"
            onClick={() => this.clickEvents('updateFolderLeave', accountID, avatar, fullName)}
          >
            {_l('退出')}
          </span>
        );
      }
    };

    return (
      <li>
        {data.ordinaryMembers.map((item, i) => {
          return (
            <div key={i} className="folderMemberList">
              <UserHead
                user={{
                  userHead: item.avatar,
                  accountId: item.accountID,
                }}
                size={28}
                secretType={1}
                operation={
                  data.isAdmin || item.accountID === md.global.Account.accountId ? getOpHtml(item, false) : null
                }
              />
            </div>
          );
        })}

        {data.applyMembers.map((item, i) => {
          return (
            <div key={i} className="folderMemberList">
              <span className="applyBox" />
              <UserHead
                user={{
                  userHead: item.avatar,
                  accountId: item.accountID,
                }}
                size={28}
                secretType={1}
                operation={data.isAdmin ? getOpHtml(item, true) : null}
              />
            </div>
          );
        })}

        {data.isAdmin && (
          <span data-tip={_l('添加项目成员')}>
            <i
              className="icon-task-add-member-circle pointer ThemeColor3"
              onClick={evt => this.addFolderMembersEvents(evt, false)}
            />
          </span>
        )}
      </li>
    );
  }

  /**
   * 绑定名片层事件
   */
  bindEvents(evt, accountId, avatar, fullname) {
    // 设为负责人
    evt.find('.updateFolderChargeFix').on('click', () => {
      this.updateFolderCharge(accountId, avatar, fullname);
    });

    // 设为成员
    evt.find('.updateFolderMember').on('click', () => {
      this.updateFolderMemberAuth(accountId, avatar, fullname, false);
    });

    // 设为管理员
    evt.find('.updateFolderAdmin').on('click', () => {
      this.updateFolderMemberAuth(accountId, avatar, fullname, true);
    });

    // 移出成员
    evt.find('.updateFolderLeave').on('click', () => {
      this.removeFolderMember(accountId);
    });

    // 申请用户设为管理员
    evt.find('.updateFolderApplyAdmin').on('click', () => {
      this.updateFolderMemberStatusAndAuth(accountId, avatar, fullname, true);
    });

    // 申请用户设为成员
    evt.find('.updateFolderApplyMember').on('click', () => {
      this.updateFolderMemberStatusAndAuth(accountId, avatar, fullname, false);
    });

    // 申请用户拒绝
    evt.find('.updateFolderRefuse').on('click', () => {
      this.refuseFolderMember(accountId);
    });
  }

  clickEvents(type, accountId, avatar, fullname) {
    switch (type) {
      // 设为负责人
      case 'updateFolderChargeFix':
        this.updateFolderCharge(accountId, avatar, fullname);
        return;
      // 设为成员
      case 'updateFolderMember':
        this.updateFolderMemberAuth(accountId, avatar, fullname, false);
        return;
      // 设为管理员
      case 'updateFolderAdmin':
        this.updateFolderMemberAuth(accountId, avatar, fullname, true);
        return;
      // 移出成员
      case 'updateFolderLeave':
        this.removeFolderMember(accountId);
        return;
      // 申请用户设为管理员
      case 'updateFolderApplyAdmin':
        this.updateFolderMemberStatusAndAuth(accountId, avatar, fullname, true);
        return;
      // 申请用户设为成员
      case 'updateFolderApplyMember':
        this.updateFolderMemberStatusAndAuth(accountId, avatar, fullname, false);
        return;
      // 申请用户拒绝
      case 'updateFolderRefuse':
        this.refuseFolderMember(accountId);
        return;
      default:
        return;
    }
  }

  /**
   * 添加项目人员事件
   */
  addFolderMembersEvents(evt, isAdmin) {
    const { data } = this.state;
    const { folderId, projectId } = this.props.taskConfig;
    let existsIds = [];
    const callback = users => {
      this.addFolderMembers(users, isAdmin);
    };

    existsIds = existsIds.concat(data.admins.map(item => item.accountID));

    if (!isAdmin) {
      existsIds = existsIds.concat(data.ordinaryMembers.map(item => item.accountID));
    }

    quickSelectUser(evt.target, {
      sourceId: folderId,
      projectId,
      fromType: 6,
      filterAccountIds: [data.chargeUser.accountID],
      selectedAccountIds: existsIds,
      SelectUserSettings: {
        filterAccountIds: [data.chargeUser.accountID],
        selectedAccountIds: existsIds,
        projectId: checkIsProject(projectId) ? projectId : '',
        callback,
      },
      selectCb: callback,
    });
  }

  /**
   * 更改项目负责人
   */
  updateFolderCharge(accountId, avatar, fullname) {
    Dialog.confirm({
      dialogClasses: 'updateFolderCharge',
      closable: false,
      title: <div style={{ color: '#f44336' }}>{_l('将项目负责人移交给“%0”', fullname)}</div>,
      children: (
        <div className="Font14" style={{ color: '#9e9e9e' }}>
          {_l('如果您移交后，将无法把自己重新设为该项目的负责人')}
        </div>
      ),
      okText: _l('确定'),
      onOk: () => {
        ajaxRequest
          .updateFolderCharge({
            folderID: this.props.taskConfig.folderId,
            chargeAccountID: accountId,
          })
          .then(source => {
            if (source.status) {
              const data = _.cloneDeep(this.state.data);
              const oldCharge = _.cloneDeep(data.chargeUser);

              data.chargeUser.accountID = accountId;
              data.chargeUser.avatar = avatar;
              data.chargeUser.fullName = fullname;

              data.admins.push(oldCharge);

              _.remove(data.ordinaryMembers, item => item.accountID === accountId);
              _.remove(data.applyMembers, item => item.accountID === accountId);

              this.setState({ data });

              // 左边列表更新
              const $navLi = $('.folderList .commFolder').filter('[data-id=' + this.props.taskConfig.folderId + ']');
              $navLi
                .data('charge', accountId)
                .data('auth', 8)
                .find('.folderCharge')
                .attr('src', avatar)
                .data('id', accountId)
                .data('hasbusinesscard', false)
                .off();
            } else {
              errorMessage(source.error);
            }
          });
      },
    });
  }

  /**
   * 设为成员和管理员
   */
  updateFolderMemberAuth(accountId, avatar, fullname, isAdmin) {
    ajaxRequest
      .updateFolderMemberAuth({
        folderID: this.props.taskConfig.folderId,
        accountID: accountId,
        isAdmin,
      })
      .then(source => {
        if (source.status) {
          const data = _.cloneDeep(this.state.data);
          const member = {
            accountID: accountId,
            avatar,
            fullName: fullname,
            status: 1,
          };

          _.remove(data.admins, item => item.accountID === accountId);
          _.remove(data.ordinaryMembers, item => item.accountID === accountId);

          if (isAdmin) {
            data.admins.push(member);
          } else {
            data.ordinaryMembers.push(member);
          }

          this.setState({ data });

          if (!isAdmin && accountId === md.global.Account.accountId) {
            // 自己将自己设为成员后 无法再修改
            data.isAdmin = false;
            this.setState({ data });
            $('.folderList .commFolder')
              .filter('[data-id=' + this.props.taskConfig.folderId + ']')
              .data('auth', 6);
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 移除项目成员
   */
  removeFolderMember(accountId) {
    const that = this;
    let msg = _l('是否确认移除该成员');
    if (accountId === md.global.Account.accountId) {
      msg = _l('确定退出该项目？');
    }

    Dialog.confirm({
      title: '',
      description: msg,
      onOk: () => {
        ajaxRequest
          .removeFolderMember({
            folderID: that.props.taskConfig.folderId,
            accountID: accountId,
            isRemoveTaskMember: false,
          })
          .then(source => {
            if (source.status) {
              if (accountId === md.global.Account.accountId) {
                alert(_l('退出成功'));

                if (location.href.indexOf('application') > -1) {
                  location.reload();
                } else {
                  $(".folderList .commFolder[data-id='" + that.props.taskConfig.folderId + "']").remove();
                  $('#taskNavigator .taskType li:first').click(); // 我的任务
                }
              } else {
                const data = _.cloneDeep(that.state.data);
                _.remove(data.admins, item => item.accountID === accountId);
                _.remove(data.ordinaryMembers, item => item.accountID === accountId);
                that.setState({ data });
                alert(_l('移除成功'));
              }
            } else {
              errorMessage(source.error);
            }
          });
      },
    });
  }

  /**
   * 申请用户设为管理员和成员
   */
  updateFolderMemberStatusAndAuth(accountId, avatar, fullname, isAdmin) {
    ajaxRequest
      .updateFolderMemberStatusAndAuth({
        folderID: this.props.taskConfig.folderId,
        memberID: accountId,
        isAdmin,
      })
      .then(source => {
        if (source.status) {
          const data = _.cloneDeep(this.state.data);
          const member = {
            accountID: accountId,
            avatar,
            fullName: fullname,
            status: 1,
          };

          _.remove(data.applyMembers, item => item.accountID === accountId);

          if (isAdmin) {
            data.admins.push(member);
          } else {
            data.ordinaryMembers.push(member);
          }

          this.setState({ data });
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 申请用户拒绝
   */
  refuseFolderMember(accountId) {
    const that = this;

    Dialog.confirm({
      title: '',
      description: _l('确认拒绝该成员？'),
      onOk: () => {
        ajaxRequest
          .refuseFolderMember({
            folderID: that.props.taskConfig.folderId,
            accountID: accountId,
          })
          .then(source => {
            if (source.status) {
              const data = _.cloneDeep(that.state.data);
              _.remove(data.applyMembers, item => item.accountID === accountId);
              that.setState({ data });
            } else {
              errorMessage(source.error);
            }
          });
      },
    });
  }

  /**
   * 添加项目人员
   */
  addFolderMembers(users, isAdmin, callbackInviteResult) {
    const userIdArr = [];
    const specialAccounts = {};

    // 外部用户
    if ($.isFunction(callbackInviteResult)) {
      users.forEach(item => {
        specialAccounts[item.account] = item.fullname;
      });
    } else {
      users.forEach(item => {
        userIdArr.push(item.accountId);
      });
    }

    ajaxRequest
      .addFolderMembers({
        folderID: this.props.taskConfig.folderId,
        memberIDs: userIdArr.join(','),
        specialAccounts: specialAccounts,
        isAdmin,
      })
      .then(source => {
        if ($.isFunction(callbackInviteResult)) {
          callbackInviteResult({ status: source.status });
        }

        if (source.status) {
          if (source.data && source.data.limitedCount) {
            alert(_l('有%0位外部用户邀请失败。外部用户短信邀请用量达到上限', source.data.limitedCount), 3);
          }
          if (source.data && source.data.successMember) {
            const data = _.cloneDeep(this.state.data);
            if (isAdmin) {
              data.admins = data.admins.concat(source.data.successMember);
            } else {
              data.ordinaryMembers = data.ordinaryMembers.concat(source.data.successMember);
            }
            this.setState({ data });
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 更改公开范围
   */
  editRange = () => {
    const { folderId, projectId } = this.props.taskConfig;
    const data = _.cloneDeep(this.state.data);
    const projectName =
      $('.networkFolderList[data-projectid=' + projectId + '] .allFolders .overflow_ellipsis').html() || _l('个人');

    editFolder({
      projectId,
      projectName,
      folderId,
      visibility: data.visibility,
      selectGroup: data.groupInfo.map(item => item.groupID).join(','),
      callback: folderObj => {
        data.visibility = folderObj.visibility;
        data.groupInfo = folderObj.groupInfo || [];
        this.setState({ data });
      },
    });
  };

  /**
   * 切换tabs
   */
  switchTabs(tabIndex) {
    const isForceUpdate = tabIndex === this.state.tabIndex;

    // 强制更新
    if (isForceUpdate) {
      if (tabIndex === 1) {
        this.commentList.updatePageIndex(true);
      } else {
        if (this.logPageIndex === 1) {
          this.getFolderLog();
        } else {
          this.setState({ logPageIndex: 1 }, () => {
            this.getFolderLog();
          });
        }
      }
    } else {
      this.setState({ tabIndex, logPageIndex: 1 }, () => {
        if (tabIndex === 2) {
          this.getFolderLog();
        }
      });
    }
  }

  /**
   * 滚动
   */
  scroll = () => {
    // 加载讨论
    if (this.state.tabIndex === 1 && this.commentList) {
      this.commentList.updatePageIndex();
    }

    // 日志滚动
    if (this.state.tabIndex === 2 && this.state.logs.length === this.state.logPageIndex * 20) {
      this.setState({ logPageIndex: this.state.logPageIndex + 1 }, () => {
        this.getFolderLog();
      });
    }
  };

  /**
   * 空讨论
   */
  nullCommentList() {
    return <div className="folderDetailNoTalk Font16">{_l('要经常对项目进行沟通和讨论喔…')}</div>;
  }

  /**
   * 添加讨论
   */
  onSubmit = item => {
    const discussions = [item].concat(this.state.discussions);
    this.setState({ discussions });
  };

  /**
   * 刪除讨论
   */
  removeDiscussionsCallback = discussionId => {
    const discussions = [].concat(this.state.discussions);
    _.remove(discussions, item => item.discussionId === discussionId);
    this.setState({ discussions });
  };

  /**
   * 获取日志
   */
  getFolderLog() {
    const { logPageIndex } = this.state;
    const { folderId } = this.props.taskConfig;

    if (this.folderPostPromise) {
      this.folderPostPromise.abort();
    }

    ajaxRequest
      .getFolderLog({
        folderID: folderId,
        pageIndex: logPageIndex,
        pageSize: 20,
      })
      .then(source => {
        if (source.status) {
          if (!this.mounted) {
            return;
          }

          this.folderPostPromise = false;
          if (logPageIndex === 1) {
            this.setState({ logs: source.data });
          } else {
            this.setState({ logs: this.state.logs.concat(source.data) });
          }
        } else {
          errorMessage(source.error);
        }
      });
  }

  /**
   * 渲染日志
   */
  renderLogItems(log, i) {
    return (
      <div key={i} className="projectLogs boxSizing">
        <i className={cx('logsType', this.returnIcons(log.type))} />
        <div dangerouslySetInnerHTML={{ __html: log.msg }} />
        <span className="logsTime">{createTimeSpan(log.createTime)}</span>
      </div>
    );
  }

  /**
   * return icons
   */
  returnIcons(type) {
    if (type === 17) {
      return 'icon-plus';
    } else if (type === 1 || type === 16) {
      return 'icon-task-pigeonhole';
    } else if (type === 2 || type === 3 || type === 12 || type === 13 || type === 14 || type === 18 || type === 21) {
      return 'icon-edit';
    } else if (type === 15) {
      return 'icon-eye';
    } else if (type === 19 || type === 99) {
      return 'icon-trash';
    }

    return 'icon-charger';
  }

  render() {
    const { data, isEditing, tabIndex, onlyLook, discussions, logs } = this.state;
    const { folderId } = this.props.taskConfig;
    const { folderName } = this.props.folderSettings;
    const { isAddedApk, apkName } = data;
    const commenterProps = {
      sourceId: folderId,
      textareaMinHeight: 22,
      sourceType: Commenter.TYPES.FOLDER,
      appId: md.global.APPInfo.taskFolderAppID,
      remark: `${folderId}|${folderName}|${_l('项目')}`,
      storageId: folderId,
      selectGroupOptions: { projectId: data.projectID },
      onSubmit: this.onSubmit,
    };
    const groupNames = (data.groupInfo || []).map(item => item.groupName).join(',');

    // 空状态
    if (_.isEmpty(data)) {
      return <LoadDiv />;
    }

    return (
      <ScrollView className="taskList" onScrollEnd={this.scroll}>
        <div className="folderDetailWrapper">
          <div className="folderDesc boderRadAll_3">
            <div className="descTitle flexRow pLeft20">
              <span className="projectDetail"> {_l('项目描述')}</span>
              {isAddedApk && (
                <div className="ellipsis mLeft8 Gray_75">
                  <Icon icon="info" className="Font17" />
                  <span className="mLeft3">{_l('此项目已被"%0"应用关联', apkName)}</span>
                </div>
              )}
            </div>
            <div className="descContainer">
              {!isEditing ? (
                <RichText
                  key={folderId}
                  className="taskDetailEdit"
                  dropdownPanelPosition={{ right: 'initial' }}
                  data={data.describe}
                  disabled={true}
                  maxHeight={500}
                  minHeight={40}
                  placeholder={_l('说明这个项目希望达成的目标和计划…')}
                  onClickNull={() => {
                    data.isAdmin &&
                      this.setState({
                        isEditing: true,
                      });
                  }}
                />
              ) : (
                <Editor
                  toorIsBottom
                  className="taskDetailEdit appIntroDescriptionEditor"
                  dropdownPanelPosition={{ right: 'initial' }}
                  maxHeight={500}
                  summary={data.describe}
                  isEditing={data.isAdmin && isEditing}
                  permissionType={100} //可编辑的权限
                  onSave={this.updateFolderDesc}
                  onCancel={() => this.setState({ isEditing: false })}
                  cacheKey={folderId}
                  title={_l('描述')}
                />
              )}
            </div>
          </div>

          <div className="folderDetailMembers boderRadAll_3 mTop10">
            <div className="folderDetailHead">
              {_l('项目所有成员')} ({data.admins.length + data.ordinaryMembers.length + 1})
              <Tooltip
                autoCloseDelay={0}
                title={() => {
                  return (
                    <Fragment>
                      <div>{_l('负责人：可以设置管理员来协助管理项目')}</div>
                      <div>{_l('管理员：可以修改项目和项目下的任务')}</div>
                      <div>{_l('成员：可以查看项目及项目下全部任务')}</div>
                    </Fragment>
                  );
                }}
              >
                <i className="icon-help Font16" />
              </Tooltip>
            </div>
            <div className="flexRow mTop6">
              <div className="folderDetailMemberLabel">{_l('负责人')}</div>
              <ul className="folderDetailMemberList flex">{this.renderFolderCharge()}</ul>
            </div>
            <div className="flexRow">
              <div className="folderDetailMemberLabel">{_l('管理员')}</div>
              <ul className="folderDetailMemberList flex">{this.renderFolderAdmin()}</ul>
            </div>
            <div className="flexRow">
              <div className="folderDetailMemberLabel">{_l('成员')}</div>
              <ul className="folderDetailMemberList flex">{this.renderFolderMember()}</ul>
            </div>
            <div className="folderDetailLine" />
            <div className="folderDetailRange">
              <div className="folderDetailRangeLabel">
                <i className="icon-folder-public Font14" /> {_l('项目公开范围：')}
              </div>
              <div className="folderDetailRanges">
                <span className="folderDetailRangesDesc">
                  {data.visibility === 0 ? (
                    _l('仅项目成员可见')
                  ) : data.visibility === 2 ? (
                    _l('对所有同事公开')
                  ) : (
                    <span
                      dangerouslySetInnerHTML={{
                        __html: _l('对群组 %0 公开', '<span class="bold">' + groupNames + '</span>'),
                      }}
                    />
                  )}
                </span>
                {data.isAdmin && (
                  <span className="ThemeColor3 pointer mLeft5" onClick={this.editRange}>
                    {_l('更改')}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="folderComment boderRadAll_3 mTop10 pAll10">
            <Commenter {...commenterProps} />
          </div>

          <div className="folderDetailTabList boderRadAll_3 mTop10">
            <ul className="folderDetailTab relative">
              <li
                className={cx('commItem ThemeBorderColor3 ThemeColor3', { active: tabIndex === 1 })}
                onClick={() => this.switchTabs(1)}
              >
                {_l('讨论')}
              </li>
              <li
                className={cx('commItem ThemeBorderColor3 ThemeColor3', { active: tabIndex === 2 })}
                onClick={() => this.switchTabs(2)}
              >
                {_l('日志')}
              </li>
              {tabIndex === 1 && (
                <span
                  className={cx('isOnlyLook', { checked: onlyLook })}
                  onClick={() => this.setState({ onlyLook: !onlyLook })}
                >
                  <i className="operationCheckbox icon-ok ThemeBGColor3 ThemeBorderColor3" />
                  {_l('只显示和我有关')}
                </span>
              )}
            </ul>
            <div className="folderDetailList">
              {tabIndex === 1 ? (
                <CommentList
                  isFocus={onlyLook}
                  sourceId={folderId}
                  sourceType={CommentList.TYPES.FOLDER}
                  commentList={discussions}
                  nullCommentList={this.nullCommentList()}
                  updateCommentList={list => this.setState({ discussions: list })}
                  removeComment={this.removeDiscussionsCallback}
                  manualRef={commentList => {
                    this.commentList = commentList;
                  }}
                >
                  <Commenter {...commenterProps} />
                </CommentList>
              ) : (
                logs.map((log, i) => this.renderLogItems(log, i))
              )}
            </div>
          </div>
        </div>
      </ScrollView>
    );
  }
}

export default connect(state => state.task)(FolderDetail);
