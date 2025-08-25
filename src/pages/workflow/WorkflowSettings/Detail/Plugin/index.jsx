import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailFooter, DetailHeader, ProcessParameters } from '../components';

export default class Plugin extends Component {
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
        result.fields = result.controls.map(item => {
          const staticValue = (JSON.parse(_.get(item, 'advancedSetting.defsource') || '[]')[0] || {}).staticValue || '';

          return Object.assign(
            {
              ...item,
              fieldId: item.controlId,
              nodeId: '',
              nodeName: '',
              fieldValueId: '',
              fieldValueName: '',
              fieldValue: item.type === 26 || item.type === 27 ? '[]' : staticValue || '',
            },
            result.fields.find(o => o.fieldId === item.controlId) || {},
          );
        });

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
    const { name, fields, controls } = data;
    let hasError = false;

    if (saveRequest) {
      return;
    }

    controls.forEach(item => {
      if (item.required) {
        data.fields.forEach(o => {
          if (item.controlId === o.fieldId && !o.nodeId && !o.fieldValue && !o.fieldValueId) {
            hasError++;
          }
        });
      }
    });

    if (hasError > 0) {
      alert(_l('有必填字段未填写'), 2);
      return;
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        name: name.trim(),
        fields,
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
        <DetailHeader {...this.props} data={{ ...data }} icon="icon-workflow" updateSource={this.updateSource} />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">
              {data.app.describe && <div className="Font14 Gray_75 workflowDetailDesc">{data.app.describe}</div>}

              <div style={{ marginTop: data.app.describe ? 0 : -15 }}>
                <ProcessParameters
                  {...this.props}
                  data={Object.assign({}, data, { subProcessVariables: data.controls })}
                  updateSource={this.updateSource}
                />
              </div>
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect onSave={this.onSave} />
      </Fragment>
    );
  }
}
