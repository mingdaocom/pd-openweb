import React, { Fragment, Component } from 'react';
import { Icon } from 'ming-ui';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import cx from 'classnames';
import { Flex, ActivityIndicator, Drawer, Button, WingBlank, Tabs, ActionSheet } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instance';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import CustomFields from 'src/components/newCustomFields';
import RelationList from 'mobile/RelationRow/RelationList';
import RelationAction from 'mobile/RelationRow/RelationAction';
import * as actions from 'mobile/RelationRow/redux/actions';
import WorkflowStepItem from './WorkflowStepItem';
import OtherAction from './OtherAction';
import {
  formatControlToServer,
  controlState,
  getTitleTextFromControls,
} from 'src/components/newCustomFields/tools/utils';
import { isRelateRecordTableControl, getSubListError } from 'worksheet/util';
import RecordAction from 'mobile/Record/RecordAction';
import ChatCount from '../components/ChatCount';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import { verifyPassword } from 'src/util';
import VerifyPassword from 'src/pages/workflow/components/ExecDialog/components/VerifyPassword';
import {
  ACTION_TYPES,
  ACTION_LIST,
  ACTION_TO_METHOD,
  MOBILE_OPERATION_LIST,
} from 'src/pages/workflow/components/ExecDialog/config';
import './index.less';
import _ from 'lodash';

const { operation } = instance;

class ProcessRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      random: '',
      sheetRow: {},
      instance: {},
      receiveControls: [],
      tempFormData: [],
      loading: true,
      open: false,
      isEdit: false,
      otherActionVisible: false,
      action: '',
      viewId: '',
      rowId: '',
      worksheetId: '',
      submitLoading: false,
      submitAction: null,
      isError: false,
      recordActionVisible: false,
      originalData: null,
      customBtns: [],
      currentTab: {},
      isHasten: false,
      switchPermit: [],
      btnDisable: {},
    };
    this.cellObjs = {};
  }
  customwidget = React.createRef();
  recordRef = React.createRef();
  operrationRef = React.createRef();
  componentDidMount() {
    const { params } = this.props.match;
    worksheetAjax
      .getWorkItem({
        instanceId: params.instanceId,
        workId: params.workId,
      })
      .then(({ rowId, worksheetId, viewId }) => {
        if (_.isEmpty(rowId) || _.isEmpty(worksheetId)) {
          this.setState({ isError: true, loading: false });
          return;
        }
        this.setState(
          {
            viewId,
            rowId,
            worksheetId,
          },
          () => {
            this.loadRow();
          },
        );
      })
      .fail(error => {
        this.setState({ isError: true, loading: false });
      });
  }
  componentWillUnmount() {
    ActionSheet.close();
  }
  loadRow = () => {
    const { params } = this.props.match;
    const { viewId, rowId, worksheetId, instance } = this.state;
    Promise.all([
      worksheetAjax.getRowDetail({
        ...params,
        viewId,
        rowId,
        worksheetId,
        getType: 9,
        checkView: true,
        getTemplate: true,
      }),
      instanceVersion.get({
        id: params.instanceId,
        workId: params.workId,
      }),
    ]).then(([sheetRow, instance]) => {
      const { templateControls, view = {}, rowData } = sheetRow;
      const newReceiveControls = viewId ? templateControls : templateControls.filter(item => item.type !== 21);
      const newFormData = newReceiveControls.map(cc => ({
        ...cc,
        value: safeParse(rowData)[cc.controlId],
        hidden: cc.hidden || (view.controls || []).includes(cc.controlId),
      }));
      sheetRow.receiveControls = newFormData;
      this.setState(
        {
          receiveControls: newFormData,
          originalData: newFormData,
          sheetRow,
          loading: false,
          instance,
          random: Date.now(),
        },
        () => {
          viewId && this.loadCustomBtns();
          this.loadSwitchPermit();
        },
      );
    });
  };
  loadCustomBtns = () => {
    const { viewId, rowId, worksheetId } = this.state;
    worksheetAjax
      .getWorksheetBtns({
        viewId,
        rowId,
        worksheetId,
      })
      .then(data => {
        this.setState({
          customBtns: data,
        });
      });
  };
  loadSwitchPermit = () => {
    const { instance, worksheetId } = this.state;
    const { app } = instance;
    worksheetAjax
      .getSwitchPermit({
        appId: app.id,
        worksheetId,
      })
      .then(res => {
        this.setState({
          switchPermit: res,
        });
      });
  };
  handleVerify = (fn, id) => {
    const { viewId, instance } = this.state;
    const { ignoreRequired } = _.get(instance, 'flowNode') || {};
    let result = true;

    let { data, updateControlIds, hasError, hasRuleError } = this.customwidget.current.getSubmitData({
      ignoreAlert: true,
    });
    const cells = data
      .filter(item => updateControlIds.indexOf(item.controlId) > -1 && item.type !== 30)
      .map(formatControlToServer);

    const { cellObjs } = this;
    const subListControls = data.filter(item => item.type === 34).filter(c => controlState(c).editable);
    function getRows(controlId) {
      try {
        return cellObjs[controlId].cell.props.rows;
      } catch (err) {
        return [];
      }
    }
    function getControls(controlId) {
      try {
        return cellObjs[controlId].cell.controls;
      } catch (err) {
        return;
      }
    }
    if (subListControls.length) {
      const errors = subListControls
        .map(control => ({
          id: control.controlId,
          value: getSubListError(
            {
              rows: getRows(control.controlId),
              rules: _.get(cellObjs || {}, `${control.controlId}.cell.props.rules`),
            },
            getControls(control.controlId) || control.relationControls,
            control.showControls,
            3,
          ),
        }))
        .filter(c => !_.isEmpty(c.value));
      if (errors.length) {
        hasError = true;
        errors.forEach(error => {
          const errorSublist = cellObjs[error.id];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: !_.isEmpty(error.value),
              cellErrors: error.value,
            });
          }
        });
      } else {
        subListControls.forEach(control => {
          const errorSublist = cellObjs[control.controlId];
          if (errorSublist) {
            errorSublist.cell.setState({
              error: false,
              cellErrors: {},
            });
          }
        });
      }
      if (this.con.querySelector('.cellControlErrorTip')) {
        hasError = true;
      }
    }

    if (hasError && id !== 'stash' && !ignoreRequired) {
      alert(_l('请正确填写记录'), 3);
      result = false;
    }

    if (viewId && _.isEmpty(cells)) {
      this.setState({ isEdit: false, random: Date.now() });
      result = false;
    }

    if (hasRuleError) {
      fn && fn();
      result = false;
    }

    return {
      result,
      cells,
    };
  };
  handleSave(fn, id) {
    const { worksheetId, rowId, sheetRow } = this.state;
    const { params } = this.props.match;
    const { projectId, receiveControls } = sheetRow;
    const { result, cells } = this.handleVerify(fn, id);

    if (!result) return;
    if (_.isEmpty(cells)) {
      fn && fn();
      return;
    }

    worksheetAjax
      .updateWorksheetRow({
        ...params,
        getType: 9,
        projectID: projectId,
        rowId,
        worksheetId,
        newOldControl: cells,
      })
      .then(result => {
        if (result && result.data) {
          alert(_l('操作成功'));
          const newReceiveControls = receiveControls.map(c => _.assign({}, c, { value: result.data[c.controlId] }));
          this.setState({
            isEdit: false,
            random: Date.now(),
            sheetRow: Object.assign(sheetRow, { receiveControls: newReceiveControls, logId: result.requestLogId }),
            originalData: newReceiveControls,
          });
          fn && fn();
        } else {
          alert(_l('操作失败，请稍后重试'), 2);
        }
      })
      .fail(error => {
        alert(_l('操作失败，请稍后重试'), 2);
      });
  }
  handleSelectOperation = buttons => {
    const { instance } = this.state;
    const { btnMap = {} } = instance;
    ActionSheet.showActionSheetWithOptions(
      {
        options: buttons.map(item => (
          <Fragment>
            <Icon className="mRight10 Gray_9e Font22" icon={item.icon} />
            <span className="Bold ellipsis">{btnMap[item.type] || item.text}</span>
          </Fragment>
        )),
        message: (
          <div className="flexRow header">
            <span className="Font13">{_l('审批')}</span>
            <div
              className="closeIcon"
              onClick={() => {
                ActionSheet.close();
              }}
            >
              <Icon icon="close" />
            </div>
          </div>
        ),
      },
      buttonIndex => {
        if (buttonIndex === -1) return;
        this.handleOperation(buttons[buttonIndex].id);
      },
    );
  };
  writeVerifyPassword = () => {
    ActionSheet.showActionSheetWithOptions(
      {
        options: [],
        message: (
          <div className="TxtLeft sheetProcessRowRecord">
            <div className="Font17 Bold Gray mBottom10">{_l('提交记录')}</div>
            <VerifyPassword
              autoFocus={true}
              onChange={({ password, isNoneVerification }) => {
                if (password !== undefined) this.password = password;
                if (isNoneVerification !== undefined) this.isNoneVerification = isNoneVerification;
              }}
            />
            <div className="flexRow btnsWrapper mTop20 pAll0 Border0 ">
              <Button
                className="Font13 flex bold Gray_75 mRight10"
                onClick={() => {
                  ActionSheet.close();
                }}
              >
                <span>{_l('取消')}</span>
              </Button>
              <Button
                className="Font13 flex bold"
                type="primary"
                onClick={() => {
                  verifyPassword({
                    password: this.password,
                    closeImageValidation: true,
                    isNoneVerification: this.isNoneVerification,
                    success: () => {
                      this.handleSave(() => {
                        this.request('submit');
                      });
                    },
                  });
                }}
              >
                {_l('保存')}
              </Button>
            </div>
          </div>
        ),
      },
      buttonIndex => {},
    );
  };
  handleFooterBtnClick = id => {
    const { hasError, hasRuleError } = this.customwidget.current.getSubmitData({ ignoreAlert: true });
    let { instance } = this.state;
    const { flowNode } = instance;
    const { ignoreRequired, encrypt } = flowNode;
    if (hasError && id !== 'stash' && (!ignoreRequired || (ignoreRequired && id !== 'overrule'))) {
      alert(_l('请正确填写记录'), 3);
      return;
    }

    if (hasRuleError) {
      return;
    }

    const { submitLoading } = this.state;
    if (submitLoading) return;

    this.setState({ submitAction: id });

    if (id === 'submit') {
      if (encrypt) {
        verifyPassword({
          checkNeedAuth: true,
          success: () => {
            this.handleSave(() => {
              this.request('submit');
            });
          },
          fail: () => {
            this.writeVerifyPassword();
          },
        });
      } else {
        this.handleSave(() => {
          this.request('submit');
        });
      }
      return;
    }
    if (id === 'revoke') {
      this.handleSave(() => {
        this.request('revoke');
      });
      return;
    }
    if (id === 'urge') {
      this.request('operation', { operationType: 18 });
      return;
    }
    if (id === 'stash') {
      this.handleSave(() => {
        this.request('operation', { operationType: 13 });
      }, id);
      return;
    }
    if (ignoreRequired) {
      this.setState({
        action: id,
        otherActionVisible: true,
      });
    } else {
      const { result } = this.handleVerify();
      if (result) {
        this.setState({
          action: id,
          otherActionVisible: true,
        });
      }
    }
  };
  handleOperation = id => {
    if (id === 'sign') {
      const run = action => {
        this.setState({
          action,
          otherActionVisible: true,
        });
      };
      ActionSheet.showActionSheetWithOptions(
        {
          options: [
            <div className="Gray bold">{_l('通过申请后增加一位审批人')}</div>,
            <div className="Gray bold">{_l('在我审批前增加一位审批人')}</div>,
          ],
          message: (
            <div className="flexRow header">
              <span className="Font13">{_l('加签')}</span>
              <div className="closeIcon" onClick={() => ActionSheet.close()}>
                <Icon icon="close" />
              </div>
            </div>
          ),
        },
        buttonIndex => {
          if (buttonIndex === 0) {
            run('after');
          }
          if (buttonIndex === 1) {
            run('before');
          }
        },
      );
      return;
    }
    this.setState({
      action: id,
      otherActionVisible: true,
    });
  };
  handleAction = (action, content, forwardAccountId, backNodeId, signature) => {
    content = content.trim();
    /**
     * 加签
     */
    if (_.includes(['before', 'after'], action)) {
      this.handleSave(() => {
        this.request(ACTION_TO_METHOD[action], { before: action === 'before', opinion: content, forwardAccountId });
      });
    }

    /**
     * 转审或转交
     */
    if (_.includes(['transferApprove', 'transfer'], action)) {
      this.request(ACTION_TO_METHOD[action], { opinion: content, forwardAccountId });
    }

    /**
     * 通过或拒绝审批、退回
     */
    if (_.includes(['pass', 'overrule', 'return'], action)) {
      this.handleSave(() => {
        this.request(ACTION_TO_METHOD[action], { opinion: content, backNodeId, signature });
      });
    }

    /**
     * 添加审批人
     */
    if (_.includes(['addApprove'], action)) {
      this.request('operation', { opinion: content, forwardAccountId, operationType: 16 });
    }
  };
  request = (action, restPara = {}) => {
    const { isModal, onClose } = this.props;
    const { params } = this.props.match;
    const { instanceId, workId } = params;
    const { submitLoading, sheetRow } = this.state;
    const isStash = restPara.operationType === 13;
    if (submitLoading) return;
    this.setState({ submitLoading: true, otherActionVisible: false });
    instance[action === 'return' ? 'overrule' : action]({
      id: instanceId,
      workId: restPara.operationType === 18 ? '' : workId,
      logId: sheetRow.logId,
      ...restPara,
    }).then(() => {
      if (isModal) {
        onClose({ id: instanceId, isStash });
      } else {
        window.mobileNavigateTo('/mobile/processMatters');
      }
      if (_.get(window, 'JSBridgeAdapter.approvalEvent') && _.includes(['pass', 'overrule'], action)) {
        window.JSBridgeAdapter.approvalEvent({
          type: action === 'pass' ? 1 : 2,
          enterType: 2,
          result: data,
          workData: this.state.instance
        });
      }
    });
  };
  handleScroll = event => {
    const { loadParams, updatePageIndex, isModal } = this.props;
    const { isEdit, currentTab } = this.state;
    const { clientHeight, scrollHeight, scrollTop, className } = event.target;
    const targetVlaue = scrollHeight - clientHeight - 30;
    const { loading, isMore, pageIndex } = loadParams;
    if (isEdit || !className.includes('processRecordScroll')) {
      return;
    }
    if (targetVlaue <= scrollTop && currentTab.value && !loading && isMore) {
      updatePageIndex(pageIndex + 1);
    }
    const tabsEl = document.querySelector('.tabsWrapper');
    const fixedTabsEl = document.querySelector('.fixedTabs');
    if (tabsEl && tabsEl.offsetTop - (isModal ? 55 : 0) <= scrollTop) {
      fixedTabsEl && fixedTabsEl.classList.remove('hide');
    } else {
      fixedTabsEl && fixedTabsEl.classList.add('hide');
    }
  };
  renderProcessHandle() {
    const { instance, submitLoading, submitAction, isHasten } = this.state;
    const { operationTypeList, btnMap = {}, works } = instance;
    const baseActionList = [3, 4, 5, 9, 18];
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
    const allowUrgeWork = _.find(works, { allowUrge: true }) || {};
    return (
      <div className="footerHandle flexRow">
        <div
          className="flexColumn optionBtn bold"
          onClick={() => {
            document.querySelector('.processRecordScroll').scrollTop =
              document.querySelector('.stepList').offsetTop - 50;
          }}
        >
          <div>
            <Icon icon="flow" className="Font20" />
          </div>
          <div className="Font12">{_l('流程')}</div>
        </div>
        <div className="flexRow flex">
          {allowUrgeWork.allowUrge && (
            <div
              className="headerBtn pointer flex bold hasten"
              onClick={() => {
                if (!isHasten) {
                  this.setState({ isHasten: true });
                  operation({ id: allowUrgeWork.instanceId, operationType: 18 });
                }
              }}
            >
              {isHasten ? _l('已催办') : _l('催办')}
            </div>
          )}
          {actionList.map((item, index) => {
            let { id, text } = ACTION_LIST[item];
            return (
              <div
                key={id}
                className={cx('headerBtn pointer flex bold', id, { disable: submitLoading && submitAction === id })}
                onClick={() => {
                  this.handleFooterBtnClick(id);
                }}
              >
                {submitLoading && submitAction === id ? (
                  _l('提交中...')
                ) : (
                  <Fragment>
                    <span className="ellipsis">{btnMap[item] || text}</span>
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
      </div>
    );
  }

  updateBtnDisabled = val => {
    this.setState({ btnDisable: val });
  };

  renderRecordHandle() {
    const { sheetRow, rowId, worksheetId, viewId, customBtns, isEdit, currentTab } = this.state;
    let copyCustomBtns = _.cloneDeep(customBtns);
    let showBtnsOut =
      copyCustomBtns.length && copyCustomBtns.length >= 2
        ? customBtns.slice(0, 2)
        : copyCustomBtns.length
        ? copyCustomBtns
        : [];

    if (currentTab.id) {
      return sheetRow.allowEdit ? <RelationAction controlId={currentTab.id} /> : null;
    }

    if (!sheetRow.allowEdit && _.isEmpty(customBtns)) {
      return null;
    }

    return (
      <Fragment>
        <div className="footerHandle btnsWrapper flexRow">
          {isEdit ? (
            <Fragment>
              <WingBlank className="flex" size="sm">
                <Button
                  className="Font13 bold Gray_75"
                  onClick={() => {
                    const { sheetRow, originalData } = this.state;
                    this.setState({
                      isEdit: false,
                      random: Date.now(),
                      sheetRow: {
                        ...sheetRow,
                        receiveControls: originalData,
                      },
                    });
                  }}
                >
                  <span>{_l('取消')}</span>
                </Button>
              </WingBlank>
              <WingBlank className="flex" size="sm">
                <Button
                  type="primary"
                  className="Font13 bold"
                  onClick={() => {
                    this.handleSave(() => {
                      this.loadCustomBtns();
                    });
                  }}
                >
                  {_l('保存')}
                </Button>
              </WingBlank>
            </Fragment>
          ) : (
            <Fragment>
              {sheetRow.allowEdit && (
                <WingBlank className="flex mLeft6 mRight6" size="sm">
                  <Button
                    className="Font13 edit letterSpacing"
                    onClick={() => {
                      this.setState({ isEdit: true, random: Date.now() });
                    }}
                  >
                    <Icon icon="workflow_write" className="Font15 mRight7" />
                    <span>{_l('编辑')}</span>
                  </Button>
                </WingBlank>
              )}
              {showBtnsOut.map(item => {
                let disabled = (this.recordRef.current && this.state.btnDisable[item.btnId]) || item.disabled;
                return (
                  <WingBlank className="flex flexShink mLeft6 mRight6" size="sm" key={item.btnId}>
                    <Button
                      className={cx('Font13 optBtn', 'bold', { disabled })}
                      style={
                        disabled
                          ? {}
                          : {
                              backgroundColor: item.color,
                              color: '#fff',
                              maxWidth: sheetRow.allowEdit && showBtnsOut.length === 2 ? '98px' : 'unset',
                            }
                      }
                      onClick={() => {
                        if (disabled) {
                          return;
                        }
                        if (this.recordRef.current) {
                          this.recordRef.current.handleTriggerCustomBtn(item);
                        }
                      }}
                    >
                      <Icon
                        icon={item.icon || 'custom_actions'}
                        className={cx('Font15 mRight7', { opcIcon: !item.icon && !disabled })}
                      />
                      <span>{item.name}</span>
                    </Button>
                  </WingBlank>
                );
              })}
              {!_.isEmpty(customBtns) && customBtns.length > 2 && (
                <div
                  className="moreOperation Font12 bold"
                  onClick={() => {
                    this.setState({ recordActionVisible: true });
                  }}
                >
                  <Icon icon="expand_less" className="Font20" />
                </div>
              )}
            </Fragment>
          )}
        </div>
        <RecordAction
          rowId={rowId}
          worksheetId={worksheetId}
          viewId={viewId}
          sheetRow={sheetRow}
          customBtns={customBtns}
          loadRow={this.loadRow}
          loadCustomBtns={this.loadCustomBtns}
          recordActionVisible={this.state.recordActionVisible}
          hideRecordActionVisible={() => {
            this.setState({ recordActionVisible: false });
          }}
          ref={this.recordRef}
          updateBtnDisabled={this.updateBtnDisabled}
        />
      </Fragment>
    );
  }
  renderErrorContent() {
    const { isModal, onClose } = this.props;
    return (
      <div className="workflowStepListWrapper flexColumn">
        {isModal && (
          <div className="header">
            <div className="flexRow valignWrapper">
              <div className="flex" />
              <Icon icon="closeelement-bg-circle" className="Font20 " onClick={onClose} />
            </div>
          </div>
        )}
        <div className="flex flexRow valignWrapper justifyCenter Font15">{_l('流程已关闭或删除')}</div>
      </div>
    );
  }
  renderCustomFields() {
    const { viewId, isEdit, random, sheetRow, rowId, worksheetId, instance, otherActionVisible, switchPermit } = this.state;
    const { operationTypeList, flowNode, app } = instance;
    const { type } = flowNode;
    const { params } = this.props.match;
    const { instanceId, workId } = params;

    return (
      <Fragment>
        <div className="flex" ref={con => (this.con = con)}>
          <CustomFields
            mobileApprovalRecordInfo={{ instanceId, workId }}
            from={6}
            ignoreLock={true}
            flag={random.toString()}
            appId={app.id}
            ref={this.customwidget}
            projectId={sheetRow.projectId}
            isWorksheetQuery={true}
            disabled={sheetRow.allowEdit ? !_.isEmpty(viewId) && !isEdit : true}
            recordCreateTime={sheetRow.createTime}
            recordId={rowId}
            worksheetId={worksheetId}
            data={sheetRow.receiveControls}
            registerCell={({ item, cell }) => (this.cellObjs[item.controlId] = { item, cell })}
            sheetSwitchPermit={switchPermit}
            controlProps={{
              updateRelationControls: (worksheetIdOfControl, newControls) => {
                this.setState(oldState => ({
                  random: Date.now(),
                  sheetRow: {
                    ...oldState.sheetRow,
                    receiveControls: oldState.sheetRow.receiveControls.map(item => {
                      if (item.type === 34 && item.dataSource === worksheetIdOfControl) {
                        return { ...item, relationControls: newControls };
                      } else {
                        return item;
                      }
                    }),
                  },
                }));
              },
            }}
            onChange={data => {
              this.setState({
                tempFormData: data.map(c => (c.type === 34 ? { ...c, value: undefined } : c)),
                isEdit: true,
              });
            }}
          />
          <WorkflowStepItem instance={instance} worksheetId={worksheetId} recordId={rowId} />
        </div>
        {otherActionVisible && (
          <OtherAction
            visible={otherActionVisible}
            action={this.state.action}
            projectId={sheetRow.projectId}
            instance={instance}
            onAction={this.handleAction}
            onHide={() => {
              this.setState({
                otherActionVisible: false,
              });
            }}
          />
        )}
      </Fragment>
    );
  }
  renderTabContent = tab => {
    const { rowId, worksheetId, instance } = this.state;
    const { flowNode } = instance;
    const { params } = this.props.match;
    if (tab.id) {
      const props = {
        controlId: tab.id,
        workId: params.workId,
        instanceId: params.instanceId,
        rowId,
        worksheetId,
      };
      return (
        <div className="flexColumn h100">
          <RelationList {...props} />
        </div>
      );
    } else {
      return <div className="flexColumn h100">{this.renderCustomFields()}</div>;
    }
  };
  renderTabs(tabs, isRenderContent = true) {
    const { currentTab } = this.state;
    const index = currentTab.id ? _.findIndex(tabs, { id: currentTab.id }) : 0;
    return (
      <Tabs
        tabBarInactiveTextColor="#757575"
        tabs={tabs}
        page={index}
        swipeable={false}
        prerenderingSiblingsNumber={0}
        destroyInactiveTab={true}
        animated={false}
        renderTab={tab =>
          tab.value ? (
            <Fragment>
              <span className="tabName ellipsis mRight2">{tab.title}</span>
              <span>{`(${tab.value})`}</span>
            </Fragment>
          ) : (
            <span className="tabName ellipsis">{tab.title}</span>
          )
        }
        onChange={tab => {
          this.setState({
            currentTab: tab,
          });
          this.props.reset();
        }}
      >
        {isRenderContent && this.renderTabContent}
      </Tabs>
    );
  }
  renderHeader() {
    const { isModal, onClose } = this.props;
    const { instance } = this.state;
    const { name, type, appType } = instance.flowNode;
    const isStash = _.includes(instance.operationTypeList[0], 13);
    const action = ACTION_TYPES[type];

    return (
      <div className="header">
        <div className="flexRow valignWrapper">
          <div className="flex">
            <div
              className={cx(
                'sheetName ellipsis Font13',
                action.id,
                typeof action.icon === 'string' ? '' : action.icon[appType],
              )}
            >
              <Icon icon={typeof action.icon === 'string' ? action.icon : action.icon[appType]} className="Font18" />
              <span>{name}</span>
            </div>
          </div>
          {isStash && (
            <Icon className="Font22 mRight10 Gray_9e" icon="save1" onClick={() => this.handleFooterBtnClick('stash')} />
          )}
          {isModal && <Icon icon="closeelement-bg-circle" className="Font20 " onClick={onClose} />}
        </div>
      </div>
    );
  }
  renderContent() {
    const {
      viewId,
      sheetRow,
      tempFormData,
      instance,
      rowId,
      worksheetId,
      currentTab,
      isEdit,
      switchPermit,
      originalData,
      customBtns,
    } = this.state;
    const { relationRow, isModal } = this.props;
    const { operationTypeList, flowNode, backFlowNodes, app } = instance;
    const { name, type } = flowNode;
    const newOperationTypeList = operationTypeList[1].filter(item => item !== 12);
    const action = ACTION_TYPES[type];
    const recordTitle = getTitleTextFromControls(tempFormData.length ? tempFormData : sheetRow.receiveControls || []);
    const recordMuster = _.sortBy(
      sheetRow.receiveControls.filter(item => isRelateRecordTableControl(item) && controlState(item, 6).visible),
      'row',
    );
    const tabs = [
      {
        title: _l('详情'),
        index: 0,
      },
    ].concat(
      recordMuster.map((item, index) => {
        const isCurrentTab = currentTab.id === item.controlId;
        const value = Number(item.value);
        const newValue = isCurrentTab ? relationRow.count || value : value;
        if (isCurrentTab) {
          item.value = newValue;
        }
        return {
          id: item.controlId,
          title: item.controlName,
          value: newValue,
          index: index + 1,
        };
      }),
    );
    return (
      <div className="workflowRecordWrapper">
        {isModal && this.renderHeader()}
        <div className="flexColumn flex processRecordScroll" onScroll={this.handleScroll}>
          <Fragment>
            {!isModal && this.renderHeader()}
            <div className="title">
              <span className="value">{recordTitle}</span>
            </div>
          </Fragment>
          {recordMuster.length ? (
            <div className={cx('processRecordViewTabs tabsWrapper flex')}>{this.renderTabs(tabs)}</div>
          ) : (
            <div className="flexColumn flex">{this.renderCustomFields()}</div>
          )}
        </div>
        {!_.isEmpty(recordMuster) && (
          <div className={cx('fixedTabs processRecordViewTabs Fixed w100 hide', { top: isModal })}>
            {this.renderTabs(tabs, false)}
          </div>
        )}
        {_.isEmpty(operationTypeList[0])
          ? viewId && this.renderRecordHandle()
          : _.isEmpty(currentTab.id) && this.renderProcessHandle()}
        {(isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId) ||
          isOpenPermit(permitList.recordLogSwitch, switchPermit, viewId) ||
          !_.isEmpty(newOperationTypeList)) && (
          <ChatCount
            className={
              _.isEmpty(operationTypeList[0]) &&
              (_.isEmpty(viewId) || (!sheetRow.allowEdit && _.isEmpty(customBtns))) &&
              'low'
            }
            recordDiscussSwitch={isOpenPermit(permitList.recordDiscussSwitch, switchPermit, viewId)}
            recordLogSwitch={isOpenPermit(permitList.recordLogSwitch, switchPermit, viewId)}
            worksheetId={worksheetId}
            rowId={rowId}
            appId={app.id}
            viewId={viewId}
            originalData={originalData}
            projectId={sheetRow.projectId}
          />
        )}
      </div>
    );
  }
  render() {
    const { loading, isError } = this.state;
    return (
      <div className="sheetProcessRowRecord">
        {loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : isError ? (
          this.renderErrorContent()
        ) : (
          this.renderContent()
        )}
      </div>
    );
  }
}

export default connect(
  state => ({
    ..._.pick(state.mobile, ['loadParams', 'relationRow']),
  }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['updatePageIndex', 'reset']) }, dispatch),
)(ProcessRecord);
