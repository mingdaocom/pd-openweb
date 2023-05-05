import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, TimeSelect, SpecificFieldsValue } from '../components';
import { TIME_TYPE } from '../../enum';
import _ from 'lodash';

export default class Delay extends Component {
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
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
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
    if (data.actionId === '300' && !data.fieldValue && !data.fieldNodeId) {
      alert(_l('日期不能为空'), 2);
      return;
    }

    if (
      data.actionId === '301' &&
      (!data.numberFieldValue.fieldValue || data.numberFieldValue.fieldValue === '0') &&
      !data.numberFieldValue.fieldNodeId &&
      (!data.hourFieldValue.fieldValue || data.hourFieldValue.fieldValue === '0') &&
      !data.hourFieldValue.fieldNodeId &&
      (!data.minuteFieldValue.fieldValue || data.minuteFieldValue.fieldValue === '0') &&
      !data.minuteFieldValue.fieldNodeId &&
      (!data.secondFieldValue.fieldValue || data.secondFieldValue.fieldValue === '0') &&
      !data.secondFieldValue.fieldNodeId
    ) {
      alert(_l('时间不能为空'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    if (data.actionId === '300') {
      if (data.fieldControlType === 16 && data.fieldControlName) {
        data.time = null;
      } else {
        data.unit = TIME_TYPE.DAY;
        data.time = data.time || '8:00';
      }
    }

    flowNode
      .saveNode({
        processId: this.props.processId,
        nodeId: this.props.selectNodeId,
        flowNodeType: this.props.selectNodeType,
        ...data,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  renderDelayTo() {
    const { data } = this.state;

    if (data.executeTimeType !== 0) {
      data.day = 1;
    }

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc">
          {_l('在上一个节点完成后，延时到指定的日期和时间后再继续执行流程')}
        </div>
        <div className="mTop24 bold">{_l('日期')}</div>
        <div className="mTop10">
          <SpecificFieldsValue
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            updateSource={this.updateSource}
            type="date"
            data={data}
          />
        </div>
        <div className="mTop30 bold">{_l('时间')}</div>
        <TimeSelect data={data} dateNoTime={data.fieldControlType !== 16} updateSource={this.updateSource} />
      </Fragment>
    );
  }

  renderDelayFor() {
    const { data } = this.state;
    const TYPES = [
      { key: 'numberFieldValue', text: _l('天') },
      { key: 'hourFieldValue', text: _l('小时') },
      { key: 'minuteFieldValue', text: _l('分钟') },
      { key: 'secondFieldValue', text: _l('秒钟') },
    ];

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">{_l('上一节点完成后，延时一段时间再继续执行流程')}</div>
        <div className="mTop25 bold">{_l('时间')}</div>

        {TYPES.map(({ key, text }) => {
          return (
            <Fragment key={key}>
              <div className="mTop15">{text}</div>
              {key === 'secondFieldValue' && (
                <div className="mTop5 Gray_9e">{_l('实际运行时停留的秒钟数可能比设置的时间略长')}</div>
              )}
              <div className="mTop10">
                <SpecificFieldsValue
                  processId={this.props.processId}
                  selectNodeId={this.props.selectNodeId}
                  updateSource={obj => this.updateSource({ [key]: obj })}
                  type={key}
                  data={data[key] || {}}
                />
              </div>
            </Fragment>
          );
        })}
      </Fragment>
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
          icon="icon-workflow_delayed"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              {data.actionId === '300' ? this.renderDelayTo() : this.renderDelayFor()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            !(
              (data.actionId === '300' && !data.fieldValue && !data.fieldNodeId) ||
              (data.actionId === '301' &&
                (!data.numberFieldValue.fieldValue || data.numberFieldValue.fieldValue === '0') &&
                !data.numberFieldValue.fieldNodeId &&
                (!data.hourFieldValue.fieldValue || data.hourFieldValue.fieldValue === '0') &&
                !data.hourFieldValue.fieldNodeId &&
                (!data.minuteFieldValue.fieldValue || data.minuteFieldValue.fieldValue === '0') &&
                !data.minuteFieldValue.fieldNodeId &&
                (!data.secondFieldValue.fieldValue || data.secondFieldValue.fieldValue === '0') &&
                !data.secondFieldValue.fieldNodeId)
            )
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
