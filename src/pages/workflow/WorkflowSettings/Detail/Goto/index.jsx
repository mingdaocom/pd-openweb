import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, Support } from 'ming-ui';
import { Modal, Select } from 'ming-ui/antd-components';
import flowNode from '../../../api/flowNode';
import { checkConditionsIsNull, getIcons } from '../../utils';
import { TriggerCondition } from '../components';

export default class Goto extends Component {
  state = {
    data: {},
    saveRequest: false,
  };

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  getNodeDetail = props => {
    const { processId, selectNodeId: nodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({
        processId,
        nodeId,
        flowNodeType: selectNodeType,
        instanceId,
      })
      .then(result => {
        const data = {
          ...result,
          jumpNodeList: result.jumpNodeList || [],
          flowNodeList: result.flowNodeList || [],
          conditions: result.conditions || [],
        };

        this.setState({ data, saveRequest: false });
      });
  };

  updateSource = obj => {
    this.props.haveChange(true);
    this.setState({ data: { ...this.state.data, ...obj } });
  };

  onChangeNode = jumpNodeId => this.updateSource({ jumpNodeId });

  onSave = () => {
    const { data, saveRequest } = this.state;

    if (saveRequest || !data.jumpNodeId) {
      return;
    }

    if (checkConditionsIsNull(data.conditions)) {
      alert(_l('筛选条件的判断值不能为空'), 2);
      return;
    }

    this.setState({ saveRequest: true });
    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: data.name,
        jumpNodeId: data.jumpNodeId,
        operateCondition: data.conditions,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });
  };

  renderTargetSelect() {
    const { data } = this.state;
    const options = data.jumpNodeList.map(item => {
      const isCurrentNode = item.id === this.props.selectNodeId;

      return {
        label: (
          <div className="flexRow alignItemsCenter">
            <i className={`${getIcons(item.type, item.appType, item.actionId)} Font16 textSecondary`} />
            <span className={`mLeft10 ellipsis textPrimary${isCurrentNode ? ' bold' : ''}`}>{item.name}</span>
            {isCurrentNode && (
              <span className="Font12 colorPrimary bgColorPrimaryTransparent boderRadAll_3 mLeft8 pLeft5 pRight5">
                {_l('当前节点')}
              </span>
            )}
          </div>
        ),
        value: item.id,
        searchText: item.name,
        disabled: isCurrentNode,
      };
    });
    const isDeleted = data.jumpNodeId && !data.jumpNodeList.some(item => item.id === data.jumpNodeId);

    if (isDeleted) {
      options.unshift({
        label: <span className="textError">{_l('节点已删除')}</span>,
        value: data.jumpNodeId,
        searchText: _l('节点已删除'),
      });
    }

    return (
      <Select
        className="w100 mTop10"
        showSearch
        optionFilterProp="searchText"
        placeholder={_l('请选择')}
        value={data.jumpNodeId || undefined}
        options={options}
        onChange={this.onChangeNode}
      />
    );
  }

  render() {
    const { data, saveRequest } = this.state;
    const { flowInfo, closeDetail, instanceId } = this.props;
    const isReadOnly = !!flowInfo.parentId || !!instanceId;

    return (
      <Modal
        className="workflowDialogBox"
        mask={{ closable: false }}
        open
        footer={isReadOnly ? null : undefined}
        styles={{ body: { pointerEvents: isReadOnly ? 'none' : undefined } }}
        title={
          <div className="flexColumn">
            <div className="flexRow alignItemsCenter">
              <span>{_l('跳转')}</span>
              <Support
                type={1}
                className="workflowDialogSupport mLeft8"
                href="https://help.mingdao.com/worksheet/field-filter"
              />
            </div>
            <div className="Font12 Normal textSecondary mTop5">
              {_l('仅支持主流程及当前所在分支中的节点，不支持跨分支跳转，最多跳转20次。')}
            </div>
          </div>
        }
        width={560}
        okButtonProps={{ disabled: !data.jumpNodeId || saveRequest }}
        onCancel={closeDetail}
        onOk={this.onSave}
      >
        {_.isEmpty(data) ? (
          <LoadDiv className="mTop15" />
        ) : (
          <Fragment>
            <div className="Font13 bold">{_l('跳转到')}</div>
            {this.renderTargetSelect()}

            <div className="Font13 bold mTop20">{_l('跳转条件')}</div>
            <div className="Font12 textSecondary mTop5">
              {_l('未设置条件时，流程执行到此节点后将直接跳转到目标节点。')}
            </div>

            {data.conditions.length ? (
              <TriggerCondition
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                isNodeHeader
                controls={data.flowNodeList}
                data={data.conditions}
                updateSource={conditions => this.updateSource({ conditions })}
                projectId={this.props.companyId}
                isPlugin={this.props.isPlugin}
              />
            ) : (
              <div
                className="Font13 addConditionBtn colorPrimary hoverColorPrimaryDark mTop15"
                onClick={() => this.updateSource({ conditions: [[{}]] })}
              >
                {_l('添加筛选条件')}
              </div>
            )}
          </Fragment>
        )}
      </Modal>
    );
  }
}
