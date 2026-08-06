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

  /**
   * 获取节点详情
   */

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (this.props.selectNodeId !== prevProps.selectNodeId) {
        this.getNodeDetail(this.props);
      }

      if (
        this.props.selectNodeName &&
        this.props.selectNodeName !== prevProps.selectNodeName &&
        this.props.selectNodeId === prevProps.selectNodeId &&
        !_.isEmpty(this.state.data)
      ) {
        this.updateSource({
          name: this.props.selectNodeName,
        });
      }
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
        if (!this.cacheResult) {
          this.cacheResult = _.cloneDeep(result);
        }

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

    if (saveRequest || _.isEqual(data, this.cacheResult)) {
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
            <div className="workflowDetailBox">{_l('内容')}</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            data.actionId === ACTION_ID.NUMBER_FORMULA && data.formulaValue && !_.isEqual(data, this.cacheResult)
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
