import React, { Component, Fragment } from 'react';
import { number, string, arrayOf, shape } from 'prop-types';
import cx from 'classnames';
import { Icon, Button, Menu, MenuItem } from 'ming-ui';
import { FLOW_NODE_TYPE_STATUS } from 'src/pages/workflow/MyProcess/config';
import { ACTION_LIST, OPERATION_LIST, SELECT_USER_TITLE, ACTION_TO_METHOD, OPERATION_TYPE } from './config';
import SvgIcon from 'src/components/SvgIcon';
import OtherAction from './OtherAction';
import AddApproveWay from './AddApproveWay';
import 'src/components/dialogSelectUser/dialogSelectUser';
import instance from '../../api/instance';
import webCacheAjax from 'src/api/webCache';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import _ from 'lodash';
import moment from 'moment';

export default class Header extends Component {
  static propTypes = {
    projectId: string,
    data: shape({
      flowNode: shape({ name: string, type: number }),
      operationTypeList: arrayOf(arrayOf(number)),
    }),
    currentWorkItem: shape({ operationTime: string }),
    errorMsg: string,
  };

  static defaultProps = {
    projectId: '',
    data: {},
    currentWorkItem: {},
    errorMsg: '',
  };

  state = {
    action: '',
    moreOperationVisible: false,
    addApproveWayVisible: false,
    otherActionVisible: false,
    selectedUser: {},
    selectedUsers: [],
    isRequest: false,
  };

  /**
   * 切换状态
   */
  switchStatus = (field, status) => {
    this.setState({
      [field]: status !== undefined ? status : !this.state[field],
    });
  };

  /**
   * 头部更多操作的处理逻辑
   */
  handleMoreOperation = action => {
    const { projectId, id, workId, data } = this.props;
    const { app } = data;

    if (action === 'print') {
      safeLocalStorageSetItem('plus_projectId', projectId);
      let printId = '';
      let isDefault = true;
      let printData = {
        printId,
        isDefault, // 系统打印模板
        worksheetId: '',
        projectId,
        id,
        rowId: '',
        getType: 1,
        viewId: '',
        appId: app.id,
        workId,
      };
      let printKey = Math.random()
        .toString(36)
        .substring(2);
      webCacheAjax.add({
        key: `${printKey}`,
        value: JSON.stringify(printData),
      });
      window.open(`${window.subPath || ''}/printForm/${app.id}/flow/new/print/${printKey}`);
    }

    if (action === 'addApprove') {
      $({}).dialogSelectUser({
        title: SELECT_USER_TITLE[action],
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          filterAccountIds: [md.global.Account.accountId],
          callback: selectedUsers => {
            this.setState({
              action,
              selectedUsers,
              otherActionVisible: true,
            });
          },
        },
      });
    }
  };

  handleClick = id => {
    const { projectId, onSubmit, data } = this.props;
    const { ignoreRequired } = (data || {}).flowNode || {};
    /**
     * 填写
     */
    if (id === 'submit') {
      this.request('submit');
      return;
    }

    /**
     * 撤回
     */
    if (id === 'revoke') {
      this.request('revoke');
      return;
    }

    /**
     * 催办
     */
    if (id === 'urge') {
      this.request('operation', { operationType: 18 }, true);
      return;
    }

    /**
     * 加签
     */
    if (id === 'sign') {
      this.setState({ action: id });
      this.switchStatus('addApproveWayVisible', true);
      return;
    }

    /**
     * 暂存
     */
    if (id === 'stash') {
      this.request('operation', { operationType: 13 });
      return;
    }

    /**
     * 转审 || 转交
     */
    if (_.includes(['transferApprove', 'transfer'], id)) {
      $({}).dialogSelectUser({
        title: SELECT_USER_TITLE[id],
        showMoreInvite: false,
        SelectUserSettings: {
          projectId,
          filterAll: true,
          filterFriend: true,
          filterOthers: true,
          filterOtherProject: true,
          filterAccountIds: [md.global.Account.accountId],
          unique: true,
          callback: user => {
            const selectedUser = user[0];
            this.setState({
              action: id,
              selectedUser,
              otherActionVisible: true,
            });
          },
        },
      });

      return;
    }

    if (ignoreRequired) {
      this.setState({ action: id, otherActionVisible: true });
    } else {
      onSubmit({
        noSave: true,
        callback: err => {
          if (!err) {
            this.setState({ action: id, otherActionVisible: true });
          }
        },
      });
    }
  };

  handleAction = ({ action, content, userId, backNodeId, signature }) => {
    const { ignoreRequired } = (this.props.data || {}).flowNode || {};

    content = content.trim();
    /**
     * 加签
     */
    if (_.includes(['before', 'after'], action)) {
      this.request(
        ACTION_TO_METHOD[action],
        { before: action === 'before', opinion: content, forwardAccountId: userId, signature },
        action === 'before',
      );
    }

    /**
     * 转审或转交
     */
    if (_.includes(['transferApprove', 'transfer'], action)) {
      this.request(ACTION_TO_METHOD[action], { opinion: content, forwardAccountId: userId }, true);
    }

    /**
     * 通过或拒绝审批
     */
    if (_.includes(['pass', 'overrule'], action)) {
      this.request(
        ACTION_TO_METHOD[action],
        { opinion: content, backNodeId, signature },
        action === 'overrule' && ignoreRequired,
      );
    }

    /**
     * 添加审批人
     */
    if (_.includes(['addApprove'], action)) {
      this.request(
        'operation',
        { opinion: content, forwardAccountId: userId, operationType: OPERATION_TYPE[action] },
        true,
      );
    }
  };

  /**
   * 请求后台接口，因参数一致故统一处理
   */
  request = (action, restPara = {}, noSave = false) => {
    const { id, workId, onSave, onClose, onSubmit } = this.props;
    const { isRequest } = this.state;
    const isStash = restPara.operationType === 13;
    const saveFunction = ({ error, logId }) => {
      if (error && error !== 'empty') {
        this.setState({ isRequest: false });
      } else {
        instance[action]({ id, workId: restPara.operationType === 18 ? '' : workId, logId, ...restPara }).then(() => {
          onSave(isStash);
          onClose();
        });
      }
    };

    if (isRequest) {
      return;
    }

    this.setState({ isRequest: true, action });

    if (noSave) {
      saveFunction({});
    } else {
      onSubmit({ callback: saveFunction, ignoreError: isStash, ignoreAlert: isStash, silent: isStash });
    }
  };

  render() {
    const {
      projectId,
      currentWorkItem,
      data,
      errorMsg,
      id,
      workId,
      onSubmit,
      sheetSwitchPermit = [],
      viewId,
      works,
    } = this.props;
    const { flowNode, operationTypeList, btnMap = {}, app, processName } = data;
    const {
      moreOperationVisible,
      addApproveWayVisible,
      otherActionVisible,
      selectedUser,
      selectedUsers,
      action,
      isRequest,
    } = this.state;

    if (errorMsg) {
      return (
        <header className="flexRow workflowStepHeader">
          <div className="stepTitle flexRow errorHeader Gray_9e">
            <Icon icon="Import-failure" className="Font18" />
            <span className="Font14 ellipsis mLeft6">{errorMsg || 'text'}</span>
          </div>
        </header>
      );
    }

    if (flowNode) {
      const { text, color } =
        currentWorkItem && currentWorkItem.type && currentWorkItem.type !== 0
          ? FLOW_NODE_TYPE_STATUS[currentWorkItem.type][currentWorkItem.operationType] || {}
          : {};
      const urgeTime = (
        (works || [])
          .filter(o => o.allowUrge && o.urgeTime)
          .sort((a, b) => (moment(a.urgeTime) < moment(b.urgeTime) ? 1 : -1))[0] || {}
      ).urgeTime;

      return (
        <Fragment>
          <header className="flexRow workflowStepHeader">
            <div className="workflowStepIcon" style={{ background: app.iconColor }}>
              <SvgIcon url={app.iconUrl} fill="#fff" size={20} addClassName="mTop1" />
            </div>
            <div className="flex mLeft10 mRight30 Font17 bold overflow_ellipsis" title={`${app.name} · ${processName}`}>
              {`${app.name} · ${processName}`}
            </div>

            {currentWorkItem && currentWorkItem.operationTime && !!operationTypeList[0].length && urgeTime && (
              <div className="operationTime flexRow Gray_9e Font14">
                {createTimeSpan(urgeTime)}
                <span className="mLeft5 Gray_9e">{_l('已催办')}</span>
              </div>
            )}

            {currentWorkItem && currentWorkItem.operationTime && !operationTypeList[0].length ? (
              <div className="operationTime flexRow Gray_9e Font14">
                {createTimeSpan(urgeTime || currentWorkItem.operationTime)}
                {!!urgeTime && <span className="mLeft5 Gray_9e">{_l('已催办')}</span>}
                {text && !urgeTime && (
                  <span className="mLeft5" style={{ color }}>
                    {text}
                  </span>
                )}
              </div>
            ) : (
              <div className="operation flexRow">
                {operationTypeList[0]
                  .map(key => {
                    return Object.assign({}, ACTION_LIST[key], { key });
                  })
                  .sort((a, b) => a.sort - b.sort)
                  .map(item => {
                    let { id, text, icon, key } = item;
                    return (
                      <Button
                        disabled={isRequest && id === action}
                        key={id}
                        size={'tiny'}
                        onClick={() => this.handleClick(id)}
                        className={cx('headerBtn mLeft16', id)}
                      >
                        {icon && <Icon type={icon} className="Font16 mRight3" />}
                        {isRequest && id === action ? _l('处理中...') : btnMap[key] || text}
                      </Button>
                    );
                  })}
              </div>
            )}

            <div
              className="more flexRow tip-bottom mLeft15"
              onClick={() => this.setState({ moreOperationVisible: !moreOperationVisible })}
            >
              <div className="iconWrap flexRow" data-tip={_l('更多操作')}>
                <Icon icon="more_horiz Gray_9e ThemeHoverColor3" />
              </div>

              {moreOperationVisible && (
                <Menu className="moreOperation" onClickAway={() => this.setState({ moreOperationVisible: false })}>
                  {operationTypeList[1].map(
                    (item, index) =>
                      //打印需要绑定权限
                      !(
                        OPERATION_LIST[item].id === 'print' &&
                        !isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId)
                      ) && (
                        <MenuItem key={index} onClick={() => this.handleMoreOperation(OPERATION_LIST[item].id)}>
                          <Icon icon={OPERATION_LIST[item].icon} />
                          <span className="actionText">{OPERATION_LIST[item].text}</span>
                        </MenuItem>
                      ),
                  )}

                  <MenuItem onClick={() => window.open(`/app/${app.id}/workflowdetail/record/${id}/${workId}`)}>
                    <Icon icon="launch" />
                    <span className="actionText">{_l('新页面打开')}</span>
                  </MenuItem>
                </Menu>
              )}
            </div>
          </header>

          {addApproveWayVisible && (
            <AddApproveWay
              projectId={projectId}
              data={data}
              onOk={this.handleAction}
              onCancel={() => this.switchStatus('addApproveWayVisible', false)}
              onSubmit={onSubmit}
            />
          )}

          {otherActionVisible && (
            <OtherAction
              selectedUser={selectedUser}
              selectedUsers={selectedUsers}
              workId={workId}
              data={data}
              action={action}
              onOk={this.handleAction}
              onCancel={() => this.switchStatus('otherActionVisible', false)}
            />
          )}
        </Fragment>
      );
    }

    return null;
  }
}
