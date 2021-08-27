import React, { Fragment, Component } from 'react';
import { connect } from 'react-redux';
import { Icon, ScrollView } from 'ming-ui';
import cx from 'classnames';
import { Flex, ActivityIndicator, ActionSheet, Modal, Drawer, List, WhiteSpace, Tabs } from 'antd-mobile';
import worksheetAjax from 'src/api/worksheet';
import instance from 'src/pages/workflow/api/instance';
import instanceVersion from 'src/pages/workflow/api/instanceVersion';
import CustomFields from 'src/components/newCustomFields';
import RelationRow from '../RelationRow';
import StepItem from 'src/pages/workflow/components/ExecDialog/StepItem';
import { formatControlToServer, controlState } from 'src/components/newCustomFields/tools/utils';
import { isRelateRecordTableControl } from 'worksheet/util';
import Back from '../components/Back';
import SelectUser from '../components/SelectUser';
import {
  ACTION_TYPES,
  ACTION_LIST,
  OPERATION_LIST,
  ACTION_TO_METHOD,
  SELECT_USER_TITLE,
  OPERATION_TYPE,
} from 'src/pages/workflow/components/ExecDialog/config';
import OtherAction from './OtherAction';
import * as actions from '../RecordList/redux/actions';
import './index.less';
import SvgIcon from 'src/components/SvgIcon';

const isWxWork = window.navigator.userAgent.toLowerCase().includes('wxwork');
const isWeLink = window.navigator.userAgent.toLowerCase().includes('huawei-anyoffice');

class ProcessRecord extends Component {
  constructor(props) {
    super(props);
    this.state = {
      sheetRow: {},
      instance: {},
      receiveControls: [],
      loading: true,
      open: false,
      otherActionVisible: false,
      action: '',
      selectedUser: {},
      rowId: '',
      worksheetId: '',
      submitLoading: false,
      submitAction: null,
      isError: false,
      selectUserVisible: false,
    };
  }
  componentDidMount() {
    const { params } = this.props.match;
    worksheetAjax
      .getWorkItem({
        instanceId: params.instanceId,
        workId: params.workId,
      })
      .then(({ rowId, worksheetId }) => {
        if (_.isEmpty(rowId) || _.isEmpty(worksheetId)) {
          this.setState({ isError: true, loading: false });
          return;
        }
        Promise.all([
          worksheetAjax.getRowByID({
            ...params,
            rowId,
            worksheetId,
            getType: 9,
          }),
          instanceVersion.get({
            id: params.instanceId,
            workId: params.workId,
          }),
        ]).then(([sheetRow, instance]) => {
          const { receiveControls } = sheetRow;
          const newReceiveControls = receiveControls
            .filter(item => item.type !== 21)
            .map(item => {
              item.fieldPermission = '111';
              return item;
            });
          sheetRow.receiveControls = newReceiveControls;
          this.setState({
            receiveControls: newReceiveControls,
            sheetRow,
            loading: false,
            instance,
            rowId,
            worksheetId,
          });
        });
      })
      .fail(error => {
        this.setState({ isError: true, loading: false });
      });
  }
  componentWillUnmount() {
    ActionSheet.close();
  }
  customwidget = React.createRef();
  handleOpenChange = () => {
    this.setState({
      open: !this.state.open,
    });
  }
  showActionSheet() {
    const { sheetRow, instance, rowId, worksheetId } = this.state;
    const { params } = this.props.match;
    const { app } = instance;
    const BUTTONS = [_l('查看讨论'), _l('取消')];
    ActionSheet.showActionSheetWithOptions(
      {
        options: BUTTONS,
        cancelButtonIndex: BUTTONS.length - 1,
      },
      buttonIndex => {
        if (buttonIndex === 0) {
          this.props.history.push(`/mobile/discuss/${app.id}/${worksheetId}/${params.viewId}/${rowId}`);
        }
      },
    );
  }
  handleOperation = (buttonIndex) => {
    const { instance } = this.state;
    const { operationTypeList } = instance;
    const newOperationTypeList = operationTypeList[1].filter(item => item !== 12);
    if (newOperationTypeList[buttonIndex]) {
      const { id } = OPERATION_LIST[newOperationTypeList[buttonIndex]];
      if (id === 'sign') {
        this.setState({ actionSheetVisible: false });
        const BUTTONS = [_l('通过申请后增加一位审批人'), _l('在我审批前增加一位审批人'), _l('取消')];
        const run = action => {
          this.setState({
            action,
            actionSheetVisible: false,
            selectUserVisible: true,
          });
        }
        ActionSheet.showActionSheetWithOptions(
          {
            options: BUTTONS,
            cancelButtonIndex: BUTTONS.length - 1,
          },
          buttonIndex => {
            if (buttonIndex === 0) {
              run('after');
            }
            if (buttonIndex === 1) {
              run('before');
            }
          }
        );
      }
      if (id === 'transferApprove' || id === 'transfer') {
        this.setState({
          action: id,
          actionSheetVisible: false,
          selectUserVisible: true
        });
      }
      if (id === 'addApprove') {
        this.setState({
          action: id,
          actionSheetVisible: false,
          selectUserVisible: true
        });
      }
    }
  }
  handleSave(fn) {
    const { worksheetId, rowId, sheetRow } = this.state;
    const { params } = this.props.match;
    const { projectId } = sheetRow;
    const { data, updateControlIds, hasError, hasRuleError } = this.customwidget.current.getSubmitData();
    const cells = data
      .filter(item => updateControlIds.indexOf(item.controlId) > -1 && item.type !== 30)
      .map(formatControlToServer);

    if (hasError) {
      alert(_l('请正确填写记录'), 3);
      return;
    }

    if (hasRuleError || _.isEmpty(cells)) {
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
          alert(_l('保存成功'));
          this.props.dispatch(actions.emptySheetRows());
          fn && fn();
        } else {
          alert(_l('保存失败，请稍后重试'), 2);
        }
      })
      .fail(error => {
        alert(_l('保存失败，请稍后重试'), 2);
      });
  }
  handleFooterBtnClick = id => {
    const { hasError, hasRuleError } = this.customwidget.current.getSubmitData();

    const { submitLoading } = this.state;
    if (submitLoading) return;

    this.setState({ submitAction: id });

    if (hasError) {
      alert(_l('请正确填写记录'), 3);
      return;
    }

    if (hasRuleError) {
      return;
    }

    if (id === 'submit') {
      this.handleSave(() => {
        this.request('submit');
      });
      return;
    }
    if (id === 'revoke') {
      this.handleSave(() => {
        this.request('revoke');
      });
      return;
    }
    this.setState({
      action: id,
      otherActionVisible: true,
    });
  }
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
     * 通过或拒绝审批
     */
    if (_.includes(['pass', 'overrule'], action)) {
      this.handleSave(() => {
        this.request(ACTION_TO_METHOD[action], { opinion: content, backNodeId, signature });
      });
    }

    /**
     * 添加审批人
     */
    if (_.includes(['addApprove'], action)) {
      this.request('operation', { opinion: content, forwardAccountId, operationType: OPERATION_TYPE[action] });
    }
  }
  request = (action, restPara = {}) => {
    const { params } = this.props.match;
    const { instanceId, workId } = params;
    const { submitLoading } = this.state;
    if (submitLoading) return;
    this.setState({ submitLoading: true, otherActionVisible: false });
    instance[action]({ id: instanceId, workId, ...restPara }).then(() => {
      this.props.history.push('/mobile/processMatters');
    });
  }
  renderActionSheet() {
    const { params } = this.props.match;
    const { instance, rowId, worksheetId, sheetRow, action, selectUserVisible } = this.state;
    const { operationTypeList, app } = instance;
    const newOperationTypeList = operationTypeList[1].filter(item => item !== 12);
    const buttons = newOperationTypeList.map(item => {
      return OPERATION_LIST[item].text;
    });
    return (
      <Fragment>
        <Modal
          popup
          animationType="slide-up"
          className="actionSheetModal"
          visible={this.state.actionSheetVisible}
          onClose={() => {
            this.setState({ actionSheetVisible: false });
          }}
        >
          <List className="mobileActionSheetList">
            <div className="actionHandleList">
              {isWxWork || isWeLink ? null : (
                <List.Item
                  onClick={() => {
                    this.props.history.push(
                      `/mobile/discuss/${app.id}/${worksheetId}/${params.viewId}/${rowId}?processRecord`,
                    );
                  }}
                >
                  {_l('查看讨论')}
                </List.Item>
              )}
              {
                buttons.map((item, index) => (
                  <List.Item key={index} onClick={() => { this.handleOperation(index) }}>{item}</List.Item>
                ))
              }
            </div>
            <WhiteSpace size="sm" />
            <List.Item
              onClick={() => {
                this.setState({ actionSheetVisible: false });
              }}
            >
              {_l('取消')}
            </List.Item>
          </List>
        </Modal>
        {selectUserVisible && (
          <SelectUser
            projectId={sheetRow.projectId}
            visible={selectUserVisible}
            type="user"
            onlyOne={action === 'addApprove' ? false : true}
            onClose={() => {
              this.setState({
                selectUserVisible: false,
              });
            }}
            onSave={(user) => {
              const selectedUser = action === 'addApprove' ? user : user[0];
              this.setState({
                selectedUser,
                otherActionVisible: true,
              });
            }}
          />
        )}
      </Fragment>
    );
  }
  renderFooterHandle() {
    const { instance, submitLoading, submitAction } = this.state;
    const { operationTypeList, btnMap = {} } = instance;
    const actionList = operationTypeList[0];
    return (
      <div className="footerHandle flexRow">
        {actionList.map((item, index) => {
          let { id, text } = ACTION_LIST[item];
          return (
            <div
              key={id}
              className={cx('headerBtn pointer flex', id, { disable: submitLoading && submitAction === id })}
              onClick={() => {
                this.handleFooterBtnClick(id);
              }}
            >
              {submitLoading && submitAction === id ? (
                _l('提交中...')
              ) : (
                <Fragment>
                  {id === 'pass' || id === 'submit' || id === 'revoke' ? <Icon icon="plus-interest" /> : null}
                  {id === 'overrule' ? <Icon icon="closeelement-bg-circle" /> : null}
                  <span>{btnMap[item] || text}</span>
                </Fragment>
              )}
            </div>
          );
        })}
      </div>
    );
  }
  renderSidebar() {
    const { instance } = this.state;
    const { app, processName, works, info, currentWork, currentWorkItem } = instance;
    const width = document.documentElement.clientWidth - 60;
    return (
      <div className="flexColumn h100" style={{ width }}>
        <div className="workflowStepHeader flexRow">
          <div className="workflowStepIcon" style={{ background: app.iconColor }}>
            <SvgIcon url={app.iconUrl} fill="#fff" size={20} addClassName="mTop2" />
          </div>
          <div className="flex mLeft10 ellipsis Font14 Gray_9e bold">{`${app.name} · ${processName}`}</div>
          <Icon
            icon="close"
            className="Font20 Gray_9e ThemeHoverColor3 pointer mLeft20"
            onClick={this.handleOpenChange}
          />
        </div>
        <div className="flex">
          <ScrollView>
            <ul className="stepList">
              {works.map((item, index) => {
                return (
                  <StepItem
                    key={index}
                    data={item}
                    currentWork={currentWork}
                    currentType={(currentWorkItem || {}).type}
                  />
                );
              })}
            </ul>
          </ScrollView>
        </div>
      </div>
    );
  }
  renderErrorContent() {
    return (
      <Fragment>
        <div className="workflowStepListWrapper flexRow valignWrapper justifyCenter Font15">
          {_l('流程已关闭或删除')}
        </div>
        <Back
          className="low"
          onClick={() => {
            history.back();
          }}
        />
      </Fragment>
    );
  }
  renderCustomFields() {
    const { sheetRow, rowId, worksheetId, instance, otherActionVisible } = this.state;
    const { operationTypeList, flowNode } = instance;
    const { type } = flowNode;
    return (
      <Fragment>
        <div className="flex" style={{ overflow: 'hidden auto' }}>
          <CustomFields
            from={6}
            ref={this.customwidget}
            projectId={sheetRow.projectId}
            disabled={!sheetRow.allowEdit || type === 5}
            recordCreateTime={sheetRow.createTime}
            recordId={rowId}
            worksheetId={worksheetId}
            data={sheetRow.receiveControls}
            openRelateSheet={(appId, worksheetId, rowId) => {
              this.props.history.push(`/mobile/record/${appId}/${worksheetId}/null/${rowId}`);
            }}
          />
        </div>
        {_.isEmpty(operationTypeList[0]) ? null : this.renderFooterHandle()}
        {otherActionVisible && (
          <OtherAction
            visible={otherActionVisible}
            action={this.state.action}
            selectedUser={this.state.selectedUser}
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
      return (
        <div className={cx('flexColumn h100', { hideAddWrapper: flowNode.type === 5 })}>
          <RelationRow
            controlId={tab.id}
            workId={params.workId}
            instanceId={params.instanceId}
            rowId={rowId}
            worksheetId={worksheetId}
          />
        </div>
      );
    } else {
      return (
        <div className="flexColumn h100">
          {this.renderCustomFields()}
        </div>
      );
    }
  }
  renderContent() {
    const { sheetRow, instance, rowId, worksheetId } = this.state;
    const { params } = this.props.match;
    const { operationTypeList, flowNode, backFlowNodes, app } = instance;
    const { name, type, appType } = flowNode;
    const newOperationTypeList = operationTypeList[1].filter(item => item !== 12);
    const action = ACTION_TYPES[type];
    const recordMuster = sheetRow.receiveControls.filter(item => isRelateRecordTableControl(item) && controlState(item, 6).visible);
    const tabs = [{
      title: _l('详情'),
      index: 0,
    }].concat(recordMuster.map((item, index) => {
      return {
        id: item.controlId,
        title: `${item.controlName} (${item.value})`,
        index: index + 1
      }
    }));
    return (
      <Drawer
        className="workflowStepListWrapper"
        position="right"
        sidebar={this.renderSidebar()}
        open={this.state.open}
        onOpenChange={this.handleOpenChange}
      >
        <div className="flexColumn h100">
          <div className="header">
            <div className="flexRow valignWrapper">
              <div className="flex">
                <div
                  className={cx('sheetName', action.id, typeof action.icon === 'string' ? '' : action.icon[appType])}
                >
                  <Icon
                    icon={typeof action.icon === 'string' ? action.icon : action.icon[appType]}
                    className="Font18"
                  />
                  <span>{name}</span>
                </div>
              </div>
              <Icon icon="workflow" className="Font20 mRight10" onClick={this.handleOpenChange} />
              {
                (!_.isEmpty(newOperationTypeList) || !(isWxWork || isWeLink)) && (
                  <Icon icon="more_horiz" className="Font24" onClick={() => { this.setState({ actionSheetVisible: true }) }} />
                )
              }
            </div>
          </div>
          <div className="title pLeft15 pRight15">
            <span className="value overflow_ellipsis">{sheetRow.worksheetName}</span>
          </div>
          {recordMuster.length ? (
            <div className="viewTabs flex">
              <Tabs
                tabBarInactiveTextColor="#9e9e9e"
                tabs={tabs}
                renderTab={tab => <span>{tab.title}</span>}
              >
                {this.renderTabContent}
              </Tabs>
            </div>
          ) : (
            <div className="flexColumn flex Height26">
              {this.renderCustomFields()}
            </div>
          )}
        </div>
        <Back
          style={{ bottom: _.isEmpty(operationTypeList[0]) ? 20 : 60 }}
          onClick={() => {
            history.back();
          }}
        />
        {this.renderActionSheet()}
      </Drawer>
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

export default connect(state => {
  return {};
})(ProcessRecord);
