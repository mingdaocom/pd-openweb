import React, { Fragment, Component } from 'react';
import cx from 'classnames';
import { Icon, VerifyPasswordInput } from 'ming-ui';
import { Button, ActionSheet } from 'antd-mobile';
import OtherAction from '../OtherAction';
import {
  ACTION_TYPES,
  ACTION_LIST,
  ACTION_TO_METHOD,
  MOBILE_OPERATION_LIST,
} from 'src/pages/workflow/components/ExecDialog/config';
import instanceApi from 'src/pages/workflow/api/instance';
import { verifyPassword } from 'src/util';
import customBtnWorkflow from 'mobile/components/socket/customBtnWorkflow';
import './index.less';

export default class Footer extends Component {
  constructor(props) {
    super(props);
    this.state = {
      isRequest: false,
      isUrged: false,
      action: '',
      otherActionVisible: false,
    };
  }

  componentDidMount() {
    customBtnWorkflow();
  }

  componentWillUnmount() {
    this.actionVerifyPasswordHandler && this.actionVerifyPasswordHandler.close();
    this.actionOperationHandler && this.actionOperationHandler.close();
    this.actionSelectOperationHandler && this.actionSelectOperationHandler.close();
  }
  writeVerifyPassword = removeNoneVerification => {
    this.actionVerifyPasswordHandler = ActionSheet.show({
      actions: [],
      extra: (
        <div className="TxtLeft sheetProcessRowRecord">
          <div className="Font17 Bold Gray mBottom10">{_l('提交记录')}</div>
          <VerifyPasswordInput
            autoFocus={true}
            showSubTitle={false}
            isRequired={true}
            allowNoVerify={!removeNoneVerification}
            onChange={({ password, isNoneVerification }) => {
              if (password !== undefined) this.password = password;
              if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
            }}
          />
          <div className="flexRow btnsWrapper mTop20 pAll0 Border0 ">
            <Button
              className="Font13 flex bold Gray_75 mRight10"
              onClick={() => {
                this.actionSheetHandler.close();
              }}
            >
              <span>{_l('取消')}</span>
            </Button>
            <Button
              className="Font13 flex bold"
              color="primary"
              onClick={() => {
                if (!this.password || !this.password.trim()) {
                  alert(_l('请输入密码'), 3);
                  return;
                }
                verifyPassword({
                  password: this.password,
                  closeImageValidation: true,
                  isNoneVerification: this.isNoneVerification,
                  success: () => {
                    this.request('submit');
                    this.actionSheetHandler.close();
                  },
                });
              }}
            >
              {_l('保存')}
            </Button>
          </div>
        </div>
      ),
      onAction: (action) => {
        this.actionSheetHandler.close();
      }
    });
  };
  safeAuthentication = (success = () => {}) => {
    const { instance } = this.props;
    verifyPassword({
      projectId: instance.companyId,
      checkNeedAuth: true,
      success,
      fail: result => {
        this.writeVerifyPassword(result === 'showPassword');
      },
    });
  };
  handleClick = id => {
    const { onSubmit, instance } = this.props;
    const { ignoreRequired, encrypt, auth } = (instance || {}).flowNode || {};

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
     * 暂存
     */
    if (id === 'stash') {
      this.request('operation', { operationType: 13 });
      return;
    }

    const openOperatorDialog = () => {
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

    if (ignoreRequired || _.includes(['transferApprove', 'transfer'], id)) {
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
  request = (action, restPara = {}, noSave = false) => {
    const { instanceId, workId, onSave = _.noop, onClose = _.noop, onSubmit } = this.props;
    const { isRequest } = this.state;
    const isStash = restPara.operationType === 13;

    const saveFunction = ({ error, logId }) => {
      if (error && error !== 'empty') {
        this.setState({ isRequest: false });
      } else {
        instanceApi[action === 'return' ? 'overrule' : action]({
          id: instanceId,
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
          } else {
            onSave();
            onClose({ id: instanceId, workId });
          }
        });
      }
    };

    if (isRequest) {
      return;
    }

    this.setState({ isRequest: true, submitAction: action });

    if (noSave) {
      saveFunction({});
    } else {
      onSubmit({ callback: saveFunction, ignoreError: isStash, ignoreAlert: isStash, silent: isStash });
    }
  };
  handleAction = ({ action, content = '', forwardAccountId, backNodeId, signature, files }) => {
    const { instance } = this.props;
    const { ignoreRequired } = (instance || {}).flowNode || {};

    content = content.trim();

    /**
     * 加签
     */
    if (_.includes(['before', 'after'], action)) {
      this.request(
        ACTION_TO_METHOD[action],
        { before: action === 'before', opinion: content, forwardAccountId, signature, files },
        action === 'before',
      );
    }

    /**
     * 转审、转交
     */
    if (_.includes(['transferApprove', 'transfer'], action)) {
      this.request(ACTION_TO_METHOD[action], { opinion: content, forwardAccountId }, true);
    }

    /**
     * 通过、否决、退回
     */
    if (_.includes(['pass', 'overrule', 'return'], action)) {
      if (action === 'return' && !backNodeId) {
        backNodeId = _.get(instance, 'backFlowNodes[0].id') || '';
      }

      this.request(
        ACTION_TO_METHOD[action],
        { opinion: content, backNodeId, signature, files },
        _.includes(['overrule', 'return'], action) && ignoreRequired,
      );
    }

    /**
     * 添加审批人
     */
    if (_.includes(['addApprove'], action)) {
      this.request('operation', { opinion: content, forwardAccountId, operationType: 16 }, true);
    }

    /**
     * 审批人撤回
     */
    if (action === 'taskRevoke') {
      this.request(ACTION_TO_METHOD[action], { opinion: content, backNodeId, files }, true);
    }

    this.setState({ otherActionVisible: false });
  };
  handleOperation = id => {
    const { instance } = this.props;
    const run = action => {
      this.setState({
        action,
        otherActionVisible: true,
      });
    };

    if (id === 'sign') {
      if (instance.signOperationType === 1) {
        run('before');
      } else if (instance.signOperationType === 2) {
        run('after');
      } else {
        this.actionOperationHandler = ActionSheet.show({
          actions: [{
            key: 'after',
            text: <div className="Gray bold">{_l('通过申请后增加一位审批人')}</div>
          },{
            key: 'before',
            text: <div className="Gray bold">{_l('在我审批前增加一位审批人')}</div>
          }],
          extra: (
            <div className="flexRow header">
              <span className="Font13">{_l('加签')}</span>
              <div className="closeIcon" onClick={() => this.actionOperationHandler.close()}>
                <Icon icon="close" />
              </div>
            </div>
          ),
          onAction: (action, index) => {
            if (index === 0) {
              run('after');
            }
            if (index === 1) {
              run('before');
            }
            this.actionOperationHandler.close();
          }
        });
      }
      return;
    }

    run(id);
  };
  handleSelectOperation = buttons => {
    const { instance } = this.props;
    const { btnMap = {} } = instance;
    this.actionSelectOperationHandler = ActionSheet.show({
      actions: buttons.map((item, index) => {
        return {
          key: index,
          text: (
            <Fragment>
              <Icon className="mRight10 Gray_9e Font22" icon={item.icon} />
              <span className="Bold ellipsis">{btnMap[item.type] || item.text}</span>
            </Fragment>
          )
        }
      }),
      extra: (
        <div className="flexRow header">
          <span className="Font13">{_l('审批')}</span>
          <div className="closeIcon" onClick={() => this.actionSelectOperationHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        this.handleOperation(buttons[index].id);
        this.actionSelectOperationHandler.close();
      }
    });
  };
  get getHandleBtnConfig() {
    const { instance } = this.props;
    const { operationTypeList, btnMap = {} } = instance;
    const baseActionList = [3, 4, 5, 9, 17, 18, 19];
    const actionList = operationTypeList[0].filter(n => baseActionList.includes(n));
    const newOperationTypeList = operationTypeList[1]
      .concat(operationTypeList[0].filter(n => !baseActionList.includes(n)))
      .filter(item => ![12, 13].includes(item));
    const buttons = newOperationTypeList.map(item => {
      return {
        ...MOBILE_OPERATION_LIST[item],
        type: item,
      };
    });
    return {
      actionList,
      buttons,
    };
  }
  renderFlowIcon() {
    return (
      <div
        className="flexColumn optionBtn bold"
        onClick={() => {
          this.props.handleClickFlow();
          setTimeout(() => {
            document.querySelector('.mobileSheetRowRecord .recordScroll').scrollTop =
              document.querySelector('.stepList').offsetTop - 50;
          }, 500);
        }}
      >
        <div>
          <Icon icon="flow" className="Font20" />
        </div>
        <div className="Font12">{_l('流程')}</div>
      </div>
    );
  }
  render() {
    const { isRequest, isUrged, submitAction, otherActionVisible } = this.state;
    const { instance } = this.props;
    const { btnMap = {}, works } = instance;
    const { actionList, buttons } = this.getHandleBtnConfig;

    if (!actionList.length && !buttons.length) {
      return null;
    }

    return (
      <div className="processRecordFooterHandle flexRow">
        {this.renderFlowIcon()}
        <div className="flexRow flex">
          {actionList.map((item, index) => {
            const { id, text } = ACTION_LIST[item];
            const disable = (isRequest && submitAction === id) || (isUrged && id === 'urge');
            return (
              <div
                key={id}
                className={cx('headerBtn pointer flex bold', id, { disable })}
                onClick={event => {
                  if (disable) return;
                  this.handleClick(id);
                }}
              >
                {isRequest && submitAction === id ? (
                  _l('提交中...')
                ) : (
                  <Fragment>
                    <span className="ellipsis">{id === 'urge' && isUrged ? _l('已催办') : btnMap[item] || text}</span>
                  </Fragment>
                )}
              </div>
            );
          })}
        </div>
        {!!buttons.length &&
          (buttons.length > 1 ? (
            <div
              className="flexColumn optionBtn optionArrowBtn bold"
              onClick={() => {
                this.handleSelectOperation(buttons);
              }}
            >
              <Icon icon="arrow-up-border" />
            </div>
          ) : (
            buttons.map((item, index) => (
              <div
                key={index}
                className="flexColumn optionBtn bold"
                style={{ maxWidth: 100 }}
                onClick={() => {
                  this.handleOperation(item.id);
                }}
              >
                <div>
                  <Icon icon={item.icon} className="Font20" />
                </div>
                <div className="Font12 ellipsis">{btnMap[item.type] || item.text}</div>
              </div>
            ))
          ))}
        {otherActionVisible && (
          <OtherAction
            visible={otherActionVisible}
            action={this.state.action}
            projectId={instance.companyId}
            instance={instance}
            onAction={this.handleAction}
            onHide={() => this.setState({ otherActionVisible: false })}
          />
        )}
      </div>
    );
  }
}
