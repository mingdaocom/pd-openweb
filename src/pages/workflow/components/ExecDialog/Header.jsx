import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { arrayOf, bool, func, number, shape, string } from 'prop-types';
import { Button, Dialog, Icon, Menu, MenuItem, SvgIcon, VerifyPasswordInput } from 'ming-ui';
import instance from '../../api/instance';
import verifyPassword from 'src/components/verifyPassword';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { FLOW_NODE_TYPE_STATUS } from 'src/pages/workflow/MyProcess/config';
import { getTranslateInfo } from 'src/utils/app';
import AddApproveWay from './components/AddApproveWay';
import OtherAction from './components/OtherAction';
import PrintList from './components/PrintList';
import { ACTION_LIST, ACTION_TO_METHOD, OPERATION_LIST } from './config';

export default class Header extends Component {
  static propTypes = {
    projectId: string,
    data: shape({
      flowNode: shape({ name: string, type: number }),
      operationTypeList: arrayOf(arrayOf(number)),
    }),
    currentWorkItem: shape({ operationTime: string }),
    errorMsg: string,
    instanceId: string,
    isLoading: bool,
    onRefresh: func,
  };

  static defaultProps = {
    projectId: '',
    data: {},
    currentWorkItem: {},
    errorMsg: '',
    instanceId: '',
    isLoading: false,
    onRefresh: () => {},
  };

  state = {
    action: '',
    moreOperationVisible: false,
    addApproveWayVisible: false,
    otherActionVisible: false,
    isRequest: false,
    isUrged: false,
  };

  password = '';

  /**
   * 头部更多操作的处理逻辑
   */
  handleMoreOperation = action => {
    if (action === 'addApprove') {
      this.setState({ action, otherActionVisible: true });
    }
  };

  handleClick = id => {
    const { onSubmit, data } = this.props;
    const { ignoreRequired, encrypt, auth } = (data || {}).flowNode || {};

    // 加签方式特殊处理
    if (id === 'sign') {
      if (data.signOperationType === 1) {
        id = 'before';
      } else if (data.signOperationType === 2) {
        id = 'after';
      }
    }

    /**
     * 填写
     */
    if (id === 'submit') {
      // 验证密码
      if (encrypt) {
        this.safeAuthentication(() => this.request('submit'));
      } else {
        this.request('submit');
      }
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
      this.setState({ action: id, addApproveWayVisible: true });
      return;
    }

    /**
     * 暂存
     */
    if (id === 'stash') {
      this.request('operation', { operationType: 13 });
      return;
    }

    // 打开操作层
    const openOperatorDialog = () => {
      // 通过、否决、退回 不配置 意见、签名、安全直接提交
      if (_.includes(['pass', 'overrule', 'return'], id)) {
        const typeList = auth[id === 'pass' ? 'passTypeList' : 'overruleTypeList'];

        if (typeList.length === 1 && typeList[0] === 101) {
          if (!encrypt) {
            this.handleAction({ action: id });
          } else {
            this.safeAuthentication(() => this.handleAction({ action: id }));
          }
        } else {
          this.setState({ action: id, otherActionVisible: true });
        }
      } else {
        this.setState({ action: id, otherActionVisible: true });
      }
    };

    if ((_.includes(['overrule', 'return'], id) && ignoreRequired) || _.includes(['transferApprove', 'transfer'], id)) {
      openOperatorDialog();
    } else {
      onSubmit({
        noSave: true,
        callback: err => {
          if (!err) {
            openOperatorDialog();
          }
        },
      });
    }
  };

  handleAction = ({ action, content = '', userId, backNodeId, signature, files, countersignType, nextUserRange }) => {
    const { ignoreRequired } = (this.props.data || {}).flowNode || {};

    content = content.trim();
    /**
     * 加签
     */
    if (_.includes(['before', 'after'], action)) {
      this.request(
        ACTION_TO_METHOD[action],
        { before: action === 'before', opinion: content, forwardAccountId: userId, signature, files, countersignType },
        action === 'before',
      );
    }

    /**
     * 转审、转交
     */
    if (_.includes(['transferApprove', 'transfer'], action)) {
      this.request(ACTION_TO_METHOD[action], { opinion: content, forwardAccountId: userId }, true);
    }

    /**
     * 通过、否决、退回、撤回
     */
    if (_.includes(['pass', 'overrule', 'return', 'revoke'], action)) {
      if (action === 'return' && !backNodeId) {
        backNodeId = _.get(this.props.data, 'backFlowNodes[0].id') || '';
      }

      this.request(
        ACTION_TO_METHOD[action],
        { opinion: content, backNodeId, signature, files, nextUserRange },
        (_.includes(['overrule', 'return'], action) && ignoreRequired) || action === 'revoke',
      );
    }

    /**
     * 添加审批人
     */
    if (action === 'addApprove') {
      this.request('operation', { opinion: content, forwardAccountId: userId, operationType: 16 }, true);
    }

    /**
     * 审批人撤回
     */
    if (action === 'taskRevoke') {
      this.request(ACTION_TO_METHOD[action], { opinion: content, backNodeId, files }, true);
    }
  };

  /**
   * 请求后台接口，因参数一致故统一处理
   */
  request = (action, restPara = {}, noSave = false) => {
    const { id, workId, onSave, onLoad, onClose, onSubmit } = this.props;
    const { isRequest } = this.state;
    const isStash = restPara.operationType === 13;
    const saveFunction = ({ error, logId }) => {
      if (error && error !== 'empty') {
        this.setState({ isRequest: false });
      } else {
        instance[action === 'return' ? 'overrule' : action]({
          id,
          workId: restPara.operationType === 18 ? '' : workId,
          logId,
          ...restPara,
        }).then(() => {
          if (_.includes([13, 18], restPara.operationType)) {
            if (isStash) {
              alert(_l('保存成功'));
              this.setState({ isRequest: false });
            } else {
              this.setState({ isRequest: false, isUrged: true });
            }
          } else if (onLoad) {
            onLoad();
            onClose();
          }
        });

        if (!_.includes([13, 18], restPara.operationType) && !onLoad) {
          onSave();
          onClose();
        }
      }
    };

    if (isRequest) {
      return;
    }

    this.setState({ isRequest: true, action });

    if (noSave) {
      saveFunction({});
    } else {
      onSubmit({
        callback: saveFunction,
        ignoreError: isStash,
        ignoreAlert: isStash,
        silent: isStash,
        ignoreDialog: action !== 'submit',
      });
    }
  };

  /**
   * 安全认证
   */
  safeAuthentication(success = () => {}) {
    const { projectId } = this.props;

    verifyPassword({
      projectId,
      checkNeedAuth: true,
      success,
      fail: result => {
        this.verifyPasswordDialog(result === 'showPassword', success);
      },
    });
  }

  /**
   * 验证码弹层
   */
  verifyPasswordDialog(removeNoneVerification, callback = () => {}) {
    const { projectId } = this.props;

    Dialog.confirm({
      title: _l('安全认证'),
      description: (
        <VerifyPasswordInput
          showSubTitle={false}
          isRequired={true}
          autoFocus={true}
          allowNoVerify={!removeNoneVerification}
          onChange={({ password, isNoneVerification }) => {
            if (password !== undefined) this.password = password;
            if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
          }}
        />
      ),
      onOk: () => {
        return new Promise((resolve, reject) => {
          if (!this.password || !this.password.trim()) {
            alert(_l('请输入密码'), 3);
            return;
          }
          verifyPassword({
            projectId,
            password: this.password,
            closeImageValidation: true,
            isNoneVerification: this.isNoneVerification,
            success: () => {
              callback();
              resolve();
            },
            fail: () => {
              reject(true);
            },
          });
        });
      },
    });
  }

  renderRefreshBtn = () => {
    const { onRefresh, isLoading } = this.props;

    return (
      <span
        className={cx('refreshBtn Font20 Gray_9e ThemeHoverColor3 Hand mRight10', {
          isLoading,
        })}
        onClick={onRefresh}
      >
        <i className="icon-task-later" />
      </span>
    );
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
      noAuth,
      instanceId,
    } = this.props;
    const { flowNode, operationTypeList, btnMap = {}, app, processName } = data;
    const { moreOperationVisible, addApproveWayVisible, otherActionVisible, action, isRequest, isUrged } = this.state;
    const translateInfo = getTranslateInfo(app.id, data.parentId, flowNode.id);

    if (errorMsg) {
      return (
        <header className="flexRow workflowStepHeader">
          {this.renderRefreshBtn()}
          <div className="stepTitle flexRow errorHeader Gray_75">
            <Icon icon="error1" className="Font18" />
            <span className="Font14 ellipsis mLeft6">{errorMsg || 'text'}</span>
          </div>
        </header>
      );
    }

    if (flowNode) {
      const { text, color, shallowBg } =
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
            {this.renderRefreshBtn()}
            <div className="workflowStepIcon" style={{ background: app.iconColor }}>
              <SvgIcon url={app.iconUrl} fill="#fff" size={20} addClassName="mTop1" />
            </div>
            <div className="flex mLeft10 mRight30 Font17 bold overflow_ellipsis" title={`${app.name} · ${processName}`}>
              {`${app.name} · ${processName}`}
            </div>

            {noAuth ? null : (
              <Fragment>
                {currentWorkItem && currentWorkItem.operationTime && !!operationTypeList[0].length && urgeTime && (
                  <div className="operationTime flexRow Gray_75 Font14">
                    {createTimeSpan(urgeTime)}
                    <span className="mLeft5 Gray_75">{_l('已催办')}</span>
                  </div>
                )}

                {currentWorkItem && currentWorkItem.operationTime && !operationTypeList[0].length ? (
                  <div className="operationTime flexRow Gray_75 Font14">
                    {createTimeSpan(urgeTime || currentWorkItem.operationTime)}
                    {!!urgeTime && <span className="mLeft5 Gray_75">{_l('已催办')}</span>}
                    {text && !urgeTime && (
                      <span className="mLeft5" style={{ color: shallowBg || color }}>
                        {text}
                      </span>
                    )}
                  </div>
                ) : (
                  <div className="operation flexRow">
                    {operationTypeList[0]
                      .map(key => {
                        const action = ACTION_LIST[key];
                        return {
                          ...action,
                          text: translateInfo[`btnmap_${key}`] || btnMap[key] || action.text,
                          key,
                        };
                      })
                      .sort((a, b) => a.sort - b.sort)
                      .map(item => {
                        let { id, text, icon } = item;
                        return (
                          <Button
                            disabled={isRequest || (isUrged && id === 'urge')}
                            key={id}
                            size={'tiny'}
                            onClick={() => this.handleClick(id)}
                            className={cx('headerBtn mLeft10', id)}
                          >
                            <Icon type={icon} className="Font16 mRight3" />
                            {isRequest && id === action
                              ? _l('处理中...')
                              : isUrged && id === 'urge'
                                ? _l('已催办')
                                : text}
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
                    <Icon icon="more_horiz Gray_75 ThemeHoverColor3" />
                  </div>

                  {moreOperationVisible && (
                    <Menu
                      className="moreOperation"
                      onClickAwayExceptions={['.workflowExecPrintTrigger']}
                      onClickAway={() => this.setState({ moreOperationVisible: false })}
                    >
                      {operationTypeList[1].map((item, index) => (
                        <MenuItem key={index} onClick={() => this.handleMoreOperation(OPERATION_LIST[item].id)}>
                          <Icon icon={OPERATION_LIST[item].icon} />
                          <span className="actionText">{OPERATION_LIST[item].text}</span>
                        </MenuItem>
                      ))}

                      {isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId) && (
                        <PrintList {...this.props} onClose={() => this.setState({ moreOperationVisible: false })} />
                      )}

                      <MenuItem onClick={() => window.open(`/app/${app.id}/workflowdetail/record/${id}/${workId}`)}>
                        <Icon icon="launch" />
                        <span className="actionText">{_l('新页面打开')}</span>
                      </MenuItem>
                    </Menu>
                  )}
                </div>
              </Fragment>
            )}
          </header>

          {addApproveWayVisible && (
            <AddApproveWay
              onOk={action => this.setState({ action, addApproveWayVisible: false, otherActionVisible: true })}
              onCancel={() => this.setState({ addApproveWayVisible: false })}
              onSubmit={onSubmit}
            />
          )}

          {otherActionVisible && (
            <OtherAction
              projectId={projectId}
              data={data}
              action={action}
              instanceId={instanceId}
              workId={workId}
              onOk={this.handleAction}
              onCancel={() => this.setState({ otherActionVisible: false })}
            />
          )}
        </Fragment>
      );
    }

    return null;
  }
}
