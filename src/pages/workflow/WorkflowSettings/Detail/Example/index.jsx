import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { ACTION_ID } from '../../enum';
import { DetailFooter, DetailHeader } from '../components';

export default class Example extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps) {
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
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        this.setState({ data: result });
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
    const { name, actionId, fieldValue, fieldControlId, fieldNodeId, formulaValue, number } = data;

    if (saveRequest) {
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        actionId,
        name: name.trim(),
        fieldValue,
        fieldControlId,
        fieldNodeId,
        formulaValue: formulaValue.replace(/,\)/g, ')'),
        number,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
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
          icon="icon-workflow_function"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">内容</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={data.actionId === ACTION_ID.NUMBER_FORMULA && data.formulaValue}
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
