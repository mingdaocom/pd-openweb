import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dialog } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SelectNodeObject,
  Member,
  SelectUserDropDown,
  ApprovalProcessSettings,
} from '../components';
import _ from 'lodash';
import { OPERATION_TYPE } from '../../enum';
import { clearFlowNodeMapParameter } from '../../utils';

export default class ApprovalProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      cacheKey: +new Date(),
      isCorrect: true,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps, nextState) {
    if (nextProps.selectNodeId !== this.props.selectNodeId) {
      this.getNodeDetail(nextProps);
    }

    if (
      nextProps.selectNodeName &&
      nextProps.selectNodeName !== this.props.selectNodeName &&
      nextProps.selectNodeId === this.props.selectNodeId &&
      !_.isEmpty(this.state.data)
    ) {
      this.updateSource({ name: nextProps.selectNodeName });
    }
  }

  /**
   * 获取节点详情
   */
  getNodeDetail(props, { sId, fields } = {}) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({
        processId,
        nodeId: selectNodeId,
        flowNodeType: selectNodeType,
        selectNodeId: sId,
        fields,
        instanceId,
      })
      .then(result => {
        if (sId) {
          result.name = data.name;
        }

        if (sId && !fields) {
          result.fields = [];
          result.flowNodeMap = Object.assign({ [OPERATION_TYPE.BEFORE]: result.flowNodeMap[OPERATION_TYPE.BEFORE] });
        }

        if (fields) {
          result = Object.assign(this.state.data, {
            fields: result.fields,
            flowNodeMap: Object.assign(result.flowNodeMap, {
              [OPERATION_TYPE.BEFORE]: this.state.data.flowNodeMap[OPERATION_TYPE.BEFORE],
            }),
          });
        }

        if (!result.processConfig.userTaskNullMaps || result.processConfig.userTaskNullMaps[0]) {
          result.processConfig.userTaskNullMaps = { [result.processConfig.userTaskNullPass ? 1 : 3]: [] };
          result.processConfig.userTaskNullPass = false;
        }

        this.setState({
          data: result,
          cacheKey: +new Date(),
          isCorrect: result.startAppId === result.selectNodeObj.appId || sId || fields,
        });
      });
  }

  /**
   * 更新data数据
   */
  updateSource = (obj, callback = () => {}) => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) }, callback);
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { appId, name, selectNodeId, accounts, processConfig, fields, flowNodeMap, addNotAllowView, formProperties } =
      data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个数据对象'), 2);
      return;
    }

    if (!accounts.length) {
      alert(_l('必须指定发起人'), 2);
      return;
    }

    if (
      (processConfig.initiatorMaps && processConfig.initiatorMaps[5] && !processConfig.initiatorMaps[5].length) ||
      (processConfig.userTaskNullMaps && processConfig.userTaskNullMaps[5] && !processConfig.userTaskNullMaps[5].length)
    ) {
      alert(_l('必须指定代理人'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        appId,
        name: name.trim(),
        selectNodeId,
        accounts,
        processConfig,
        fields,
        flowNodeMap: clearFlowNodeMapParameter(flowNodeMap),
        addNotAllowView,
        formProperties,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染内容
   */
  renderContent() {
    const { data, showSelectUserDialog, cacheKey, isCorrect } = this.state;

    return (
      <Fragment>
        <div className="Font13 mTop20 bold">{_l('发起审批的数据对象')}</div>
        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={isCorrect && data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={this.switchDataSource}
        />

        {data.selectNodeId && (
          <Fragment>
            <div className="Font13 mTop20 bold">{_l('发起人')}</div>
            {(data.accounts || []).length ? (
              <Member
                companyId={this.props.companyId}
                appId={this.props.relationType === 2 ? this.props.relationId : ''}
                accounts={data.accounts}
                updateSource={this.updateSource}
              />
            ) : (
              <div
                className="mTop12 flexRow ThemeColor3 workflowDetailAddBtn"
                onClick={() => this.setState({ showSelectUserDialog: true })}
              >
                <i className="Font28 icon-task-add-member-circle mRight10" />
                {_l('指定发起人')}
                <SelectUserDropDown
                  appId={this.props.relationType === 2 ? this.props.relationId : ''}
                  visible={showSelectUserDialog}
                  companyId={this.props.companyId}
                  processId={this.props.processId}
                  nodeId={this.props.selectNodeId}
                  onlyNodeRole
                  unique
                  accounts={data.accounts}
                  updateSource={this.updateSource}
                  onClose={() => this.setState({ showSelectUserDialog: false })}
                />
              </div>
            )}

            <ApprovalProcessSettings
              {...this.props}
              cacheKey={cacheKey}
              processId={data.appId}
              selectNodeId={data.startNodeId}
              data={data}
              getNodeDetail={({ fields }) => this.getNodeDetail(this.props, { sId: data.selectNodeId, fields })}
              updateSource={this.updateSource}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 切换数据对象
   */
  switchDataSource = selectNodeId => {
    const { data } = this.state;

    if (data.selectNodeId) {
      Dialog.confirm({
        title: <span style={{ color: '#f44336' }}>{_l('注意！你将要更改审批流程的数据对象')}</span>,
        description: _l(
          '更换为新的工作表后，所有相关节点配置的字段都将被重置，你需要重新配置这些节点。请确认你需要执行此操作',
        ),
        okText: _l('确认更改'),
        onOk: () => {
          this.getNodeDetail(this.props, { sId: selectNodeId });
        },
      });
    } else {
      this.getNodeDetail(this.props, { sId: selectNodeId });
    }
  };

  render() {
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-approval"
          bg="BGDarkBlue"
          removeNodeName
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="flowDetailStartHeader flexColumn BGDarkBlue" style={{ height: 245 }}>
              <div className="flowDetailStartIcon flexRow" style={{ background: 'rgba(0, 0, 0, 0.24)' }}>
                <i className="icon-approval Font40 white" />
              </div>
              <div className="Font16 mTop10">{_l('发起审批流程')}</div>
              <div className="Font14 mTop10">
                {_l('对自动化工作流中的数据发起审批流程，实现业务自动化和人工审批的打通')}
              </div>
            </div>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.accounts.length} onSave={this.onSave} />
      </Fragment>
    );
  }
}
