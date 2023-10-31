import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dialog, Checkbox, Dropdown, Icon } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import {
  DetailHeader,
  DetailFooter,
  SelectNodeObject,
  Member,
  SelectUserDropDown,
  ApprovalProcessSettings,
} from '../components';
import cx from 'classnames';
import { Tooltip } from 'antd';
import _ from 'lodash';
import { OPERATION_TYPE } from '../../enum';

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
    const { processId, selectNodeId, selectNodeType } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId, fields })
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
    const { appId, name, selectNodeId, accounts, processConfig, fields, flowNodeMap } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个数据对象'), 2);
      return;
    }

    if (!accounts.length) {
      alert(_l('必须指定发起人'), 2);
      return;
    }

    if (
      (processConfig.initiatorMaps[5] && !processConfig.initiatorMaps[5].length) ||
      (processConfig.userTaskNullMaps[5] && !processConfig.userTaskNullMaps[5].length)
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
        flowNodeMap,
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
    const InitiatorAction = [
      { text: _l('允许发起人撤回'), key: 'allowRevoke' },
      { text: _l('允许发起人催办'), key: 'allowUrge' },
    ];

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
              <Member accounts={data.accounts} updateSource={this.updateSource} />
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

            <div className="Font13 mTop20 bold">{_l('发起人操作')}</div>
            {InitiatorAction.map((item, i) => (
              <Fragment key={i}>
                <Checkbox
                  className="mTop15 flexRow"
                  text={item.text}
                  checked={data.processConfig[item.key]}
                  onClick={checked =>
                    this.updateSource({
                      processConfig: Object.assign({}, data.processConfig, { [item.key]: !checked }),
                    })
                  }
                />
                {item.key === 'allowRevoke' && data.processConfig.allowRevoke && this.renderRevokeNode()}
              </Fragment>
            ))}

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

  /**
   * 渲染撤回节点
   */
  renderRevokeNode() {
    const { data } = this.state;
    const { revokeFlowNodes, revokeNodeIds } = data.processConfig;
    const list = revokeFlowNodes.map(item => {
      return {
        text: item.name,
        value: item.id,
        disabled: _.includes(revokeNodeIds, item.id),
      };
    });

    return (
      <div className="mTop10 mLeft25 flexRow" style={{ alignItems: 'center' }}>
        <div>{_l('节点')}</div>
        <Dropdown
          className="mLeft10 flex flowDropdown flowDropdownMoreSelect"
          menuStyle={{ width: '100%' }}
          data={list}
          value={revokeNodeIds.length || undefined}
          border
          openSearch
          renderTitle={() =>
            !!revokeNodeIds.length && (
              <ul className="tagWrap">
                {revokeNodeIds.map(id => {
                  const item = _.find(revokeFlowNodes, item => item.id === id);

                  return (
                    <li key={id} className={cx('tagItem flexRow', { error: !item })}>
                      <Tooltip title={item ? null : `ID：${id}`}>
                        <span className="tag">{item ? item.name : _l('节点已删除')}</span>
                      </Tooltip>
                      <span
                        className="delTag"
                        onClick={e => {
                          e.stopPropagation();
                          const ids = [].concat(revokeNodeIds);
                          _.remove(ids, item => item === id);

                          this.updateSource({
                            processConfig: Object.assign({}, data.processConfig, { revokeNodeIds: ids }),
                          });
                        }}
                      >
                        <Icon icon="close" className="pointer" />
                      </span>
                    </li>
                  );
                })}
              </ul>
            )
          }
          onChange={revokeNodeId =>
            this.updateSource({
              processConfig: Object.assign({}, data.processConfig, {
                revokeNodeIds: revokeNodeIds.concat(revokeNodeId),
              }),
            })
          }
        />
        <div className="mLeft10">{_l('通过后不允许撤回')}</div>
      </div>
    );
  }

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
