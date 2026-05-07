import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailFooter, DetailHeader, VectorKnowledge } from '../components';

export default class Vector extends Component {
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
        if (!result.searchMode) {
          result.searchMode = 'vector';
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
    const { name, actionId, knowledgeIds, query, types, searchMode, topK, rrfK, minRelevance } = data;

    if (!knowledgeIds.length) {
      alert(_l('请选择知识库'), 2);
      return;
    }

    if (!query) {
      alert(_l('请输入检索内容'), 2);
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
        actionId,
        name: name.trim(),
        knowledgeIds,
        query,
        types,
        searchMode,
        topK,
        rrfK,
        minRelevance,
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
          icon="icon-a-knowledge_search"
          bg="BGDarkViolet"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">
              <VectorKnowledge {...this.props} data={data} updateSource={this.updateSource} />
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.knowledgeIds.length} onSave={this.onSave} />
      </Fragment>
    );
  }
}
