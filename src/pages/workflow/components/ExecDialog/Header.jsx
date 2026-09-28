import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import { arrayOf, bool, func, number, object, shape, string } from 'prop-types';
import { Icon, SvgIcon, VerifyPasswordConfirm } from 'ming-ui';
import { Button, Dropdown, Tooltip } from 'ming-ui/antd-components';
import verifyPassword from 'ming-ui/functions/verifyPassword';
import instance from '../../api/instance';
import { FLOW_NODE_TYPE_STATUS } from 'src/pages/workflow/MyProcess/config';
import { permitList } from 'src/utils/domain/control/formEnum';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getTranslateInfo } from 'src/utils/services/app';
import AddApproveWay from './components/AddApproveWay';
import OtherAction from './components/OtherAction';
import PrintList from './components/PrintList';
import { ACTION_LIST, ACTION_TO_METHOD, OPERATION_LIST } from './config';
import { canDirectSubmitApproveAction } from './utils';
import './Header.less';

const ACTION_BUTTON_PROPS = {
  overrule: { color: 'danger', variant: 'solid' },
  revoke: { color: 'danger', variant: 'solid' },
  taskRevokeEntrust: { color: 'danger', variant: 'solid' },
  pass: { color: 'var(--color-success)', variant: 'solid' },
  return: { color: 'var(--color-warning)', variant: 'solid' },
  taskRevoke: { color: 'var(--color-warning)', variant: 'solid' },
  transferApprove: { color: 'default', variant: 'outlined' },
  sign: { color: 'default', variant: 'outlined' },
  transfer: { color: 'default', variant: 'outlined' },
  stash: { color: 'default', variant: 'outlined' },
};
const DEFAULT_ACTION_BUTTON_PROPS = { type: 'primary' };

export default class Header extends Component {
  static propTypes = {
    projectId: string,
    data: shape({
      flowNode: shape({ name: string, type: number }),
      operationTypeList: arrayOf(arrayOf(number)),
    }),
    currentWork: shape({ workItems: arrayOf(object) }),
    currentWorkItem: shape({ operationTime: string }),
    errorMsg: string,
    instanceId: string,
    isLoading: bool,
    onRefresh: func,
  };

  static defaultProps = {
    projectId: '',
    data: {},
    currentWork: {},
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

  /**
   * 头部更多操作的处理逻辑
   */
  handleMoreOperation = action => {
    if (_.includes(['addCC', 'addApprove'], action)) {
      this.setState({ action, otherActionVisible: true });
    }
  };

  closeMoreOperation = () => {
    this.setState({ moreOperationVisible: false });
  };

  getMoreOperationItems = printMenuItem => {
    const { data, id, workId } = this.props;
    const { operationTypeList, app } = data;

    return [
      ...operationTypeList[1].map(item => {
        const operation = OPERATION_LIST[item];

        return {
          key: operation.id,
          icon: <Icon icon={operation.icon} />,
          label: operation.text,
          onClick: () => this.handleMoreOperation(operation.id),
        };
      }),
      printMenuItem,
      {
        key: 'openInNewPage',
        icon: <Icon icon="launch" />,
        label: _l('新页面打开'),
        onClick: () => window.open(pathCompletion(`/app/${app.id}/workflowdetail/record/${id}/${workId}`)),
      },
    ].filter(Boolean);
  };

  renderMoreOperation = printMenuItem => {
    const { moreOperationVisible } = this.state;

    return (
      <Dropdown
        trigger={['click']}
        open={moreOperationVisible}
        placement="bottomRight"
        menu={{ items: this.getMoreOperationItems(printMenuItem), onClick: this.closeMoreOperation }}
        onOpenChange={open => this.setState({ moreOperationVisible: open })}
      >
        <div className="flexRow mLeft15">
          <Tooltip title={_l('更多操作')} placement="bottom">
            <div className="iconWrap flexRow pointer">
              <Icon icon="more_horiz textSecondary hoverColorPrimary" />
            </div>
          </Tooltip>
        </div>
      </Dropdown>
    );
  };

  handleClick = id => {
    const { onSubmit, data } = this.props;
    const { ignoreRequired, encrypt, auth } = (data || {}).flowNode || {};
    const translateInfo = getTranslateInfo(_.get(data, 'app.id'), _.get(data, 'parentId'), _.get(data, 'flowNode.id'));
    const btnDescMap = data.btnDescMap || {};
    const actionBtnDescMap = {
      4: translateInfo.btndescmap_4 || btnDescMap[4],
      5: translateInfo.btndescmap_5 || btnDescMap[5],
      17: translateInfo.btndescmap_17 || btnDescMap[17],
    };

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

    /**
     * 撤回委托
     */
    if (id === 'taskRevokeEntrust') {
      this.request('operation', { operationType: 20 }, true);
      return;
    }

    // 打开操作层
    const openOperatorDialog = () => {
      // 通过、否决、退回 不配置 意见、签名、安全直接提交
      if (_.includes(['pass', 'overrule', 'return'], id)) {
        if (canDirectSubmitApproveAction({ action: id, auth, encrypt, btnDescMap: actionBtnDescMap })) {
          this.handleAction({ action: id });
        } else {
          this.setState({ action: id, otherActionVisible: true });
        }
      } else {
        this.setState({ action: id, otherActionVisible: true });
      }
    };

    if (
      (_.includes(['overrule', 'return'], id) && ignoreRequired) ||
      _.includes(['transferApprove', 'transfer', 'before'], id)
    ) {
      openOperatorDialog();
    } else {
      onSubmit({
        noSave: true,
        ignoreDialog: !_.includes(['submit', 'pass', 'overrule', 'return', 'after', 'revoke', 'taskRevoke'], id),
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
     * 添加抄送人
     */
    if (action === 'addCC') {
      this.request('operation', { opinion: content, forwardAccountId: userId, operationType: 11 }, true);
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
    const { id, workId, onSave, onLoad, onClose, onSubmit, onRefresh } = this.props;
    const { isRequest } = this.state;
    const isStash = restPara.operationType === 13;
    const keepDialogOpen = _.includes([11, 13, 18], restPara.operationType);

    const saveFunction = ({ error, logId }) => {
      if (error && error !== 'empty') {
        this.setState({ isRequest: false });
      } else {
        instance[action === 'return' ? 'overrule' : action]({
          id,
          workId: restPara.operationType === 18 ? '' : workId,
          logId,
          ...restPara,
        })
          .then(() => {
            if (keepDialogOpen) {
              if (isStash) {
                alert(_l('保存成功'));
                this.setState({ isRequest: false });
              } else if (restPara.operationType === 18) {
                this.setState({ isRequest: false, isUrged: true });
              } else {
                onRefresh();
                this.setState({ isRequest: false });
              }
            } else {
              onLoad ? onLoad() : onSave();
              onClose();
            }
          })
          .catch(() => {
            this.setState({ isRequest: false });
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
      onSubmit({
        callback: saveFunction,
        ignoreError: isStash,
        ignoreAlert: isStash,
        silent: isStash,
        // pass/overrule/return/after 在 handleClick 已预校验，保存时不再弹 newErrorDialog
        ignoreDialog: _.includes(['pass', 'overrule', 'return', 'after'], action) ? true : action !== 'submit',
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

    VerifyPasswordConfirm.confirm({
      title: _l('安全认证'),
      projectId,
      isRequired: true,
      showVerifyType: true,
      allowNoVerify: !removeNoneVerification,
      closeImageValidation: true,
      onOk: callback,
    });
  }

  renderRefreshBtn = () => {
    const { onRefresh, isLoading } = this.props;

    return (
      <span
        className={cx('refreshBtn Font20 textTertiary hoverColorPrimary Hand mRight10', {
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
      workId,
      onSubmit,
      sheetSwitchPermit = [],
      viewId,
      works,
      currentWork,
      noAuth,
      instanceId,
    } = this.props;
    const { flowNode, operationTypeList, app, processName } = data;
    const btnMap = data.btnMap || {};
    const { addApproveWayVisible, otherActionVisible, action, isRequest, isUrged } = this.state;
    const translateInfo = getTranslateInfo(app.id, data.parentId, flowNode.id);

    if (errorMsg) {
      return (
        <header className="flexRow workflowStepHeader">
          {this.renderRefreshBtn()}
          <div className="stepTitle flexRow errorHeader textSecondary">
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
      const urgeTime = _.get(
        _.maxBy(
          (works || []).filter(o => o.allowUrge && o.urgeTime),
          o => moment(o.urgeTime).valueOf(),
        ),
        'urgeTime',
      );

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
                  <div className="operationTime flexRow textSecondary Font14">
                    {createTimeSpan(urgeTime)}
                    <span className="mLeft5 textSecondary">{_l('已催办')}</span>
                  </div>
                )}

                {currentWorkItem && currentWorkItem.operationTime && !operationTypeList[0].length ? (
                  <div className="operationTime flexRow textSecondary Font14">
                    {createTimeSpan(urgeTime || currentWorkItem.operationTime)}
                    {!!urgeTime && <span className="mLeft5 textSecondary">{_l('已催办')}</span>}
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
                        const buttonText =
                          isRequest && id === action ? _l('处理中...') : isUrged && id === 'urge' ? _l('已催办') : text;
                        return (
                          <Button
                            {...(ACTION_BUTTON_PROPS[id] || DEFAULT_ACTION_BUTTON_PROPS)}
                            disabled={(isRequest && id !== action) || (isUrged && id === 'urge')}
                            loading={isRequest && id === action}
                            key={id}
                            title={buttonText}
                            icon={<Icon icon={icon} className="Font16" />}
                            onClick={() => this.handleClick(id)}
                            className="headerBtn mLeft10"
                          >
                            <span className="headerBtnText">{buttonText}</span>
                          </Button>
                        );
                      })}
                  </div>
                )}

                <PrintList
                  {...this.props}
                  systemPrintEnabled={isOpenPermit(permitList.recordPrintSwitch, sheetSwitchPermit, viewId)}
                  onClose={this.closeMoreOperation}
                >
                  {this.renderMoreOperation}
                </PrintList>
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
              currentWork={currentWork}
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
