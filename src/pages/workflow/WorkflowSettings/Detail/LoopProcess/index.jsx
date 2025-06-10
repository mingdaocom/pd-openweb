import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { LoadDiv, Radio, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { ACTION_ID } from '../../enum';
import { checkConditionsIsNull } from '../../utils';
import {
  DetailFooter,
  DetailHeader,
  LoopProcessParameters,
  SpecificFieldsValue,
  TransferTriggerUser,
  TriggerCondition,
} from '../components';

export default class LoopProcess extends Component {
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
    const { processId, selectNodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        if (result.actionId === ACTION_ID.CONDITION_LOOP && !result.conditions.length) {
          result.conditions = [[{}]];
        }

        result.controls = result.subProcessVariables;
        result.fields = result.fields.map(item => {
          return {
            ...item,
            controlName: result.subProcessVariables.find(o => o.controlId === item.fieldId).controlName,
          };
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
    const { conditions } = data;

    if (saveRequest) {
      return;
    }

    if (data.actionId === ACTION_ID.CONDITION_LOOP && !conditions.length) {
      alert(_l('循环退出条件不能为空'), 2);
      return;
    }

    if (checkConditionsIsNull(conditions)) {
      alert(_l('循环退出条件的判断值不能为空'), 2);
      return;
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

  /**
   * 渲染内容
   */
  renderContent() {
    const { data } = this.state;
    const END_LIST = [
      { text: _l('跳出并进入下一次循环'), value: 1 },
      { text: _l('跳出并终止循环，继续后面的流程'), value: 2 },
      { text: _l('中止流程'), value: 0 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold">
          {data.actionId === ACTION_ID.CONDITION_LOOP ? _l('满足条件时循环') : _l('循环指定次数')}
        </div>
        <div className="flexRow mTop5 alignItemsCenter mBottom20">
          <div className="ellipsis">
            {data.subProcessName || <span style={{ color: '#f44336' }}>{_l('流程已删除')}</span>}
          </div>
          {data.subProcessId && data.subProcessName && (
            <i
              className="mLeft5 icon-task-new-detail Font12 ThemeColor3 ThemeHoverColor2 pointer"
              onMouseDown={this.openSubProcess}
            />
          )}
          <div className="flex" />
        </div>

        <LoopProcessParameters {...this.props} data={data} updateSource={this.updateSource} />

        <div className="Font13 mTop20 bold">{_l('循环退出条件')}</div>
        <div className="Font13 mTop5 Gray_75">
          {data.actionId === ACTION_ID.CONDITION_LOOP
            ? _l('参数满足下面条件时退出循环，请在循环中更新参数值以触发条件')
            : _l('当“start”参数值大于“end”参数值时，退出循环')}
        </div>

        {data.actionId === ACTION_ID.CONDITION_LOOP && (
          <Fragment>
            {!data.conditions.length ? (
              this.renderConditionBtn()
            ) : (
              <TriggerCondition
                projectId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                controls={data.subProcessVariables}
                data={data.conditions}
                updateSource={data => this.updateSource({ conditions: data })}
                allowEmptyIgnore={false}
              />
            )}
          </Fragment>
        )}

        <div className="Font13 mTop20 bold">{_l('最大循环次数')}</div>
        <div className="mTop10">
          <SpecificFieldsValue
            type="number"
            hasOtherField={false}
            min={1}
            max={10000}
            allowedEmpty
            data={{ fieldValue: data.maxLoopCount }}
            updateSource={({ fieldValue }) => this.updateSource({ maxLoopCount: fieldValue })}
          />
        </div>
        <div className="Font13 mTop10 Gray_75">
          {_l('值范围为1~10000。为避免影响性能或超时，到达最大循环次数时将自动终止循环并进入后续流程。')}
        </div>

        <TransferTriggerUser {...this.props} data={data} updateSource={this.updateSource} />

        <div className="Font13 mTop20 bold">{_l('循环中流程中止时')}</div>
        {END_LIST.map(item => (
          <div className="mTop10" key={item.value}>
            <Radio
              text={item.text}
              checked={data.executeType === item.value}
              onClick={() => this.updateSource({ executeType: item.value })}
            />
          </div>
        ))}
      </Fragment>
    );
  }

  /**
   * 渲染筛选条件按钮
   */
  renderConditionBtn() {
    const { data } = this.state;

    return (
      <div className="addActionBtn mTop15">
        <span
          className={data.appId ? 'ThemeBorderColor3' : 'Gray_bd borderColor_c'}
          onClick={() => this.updateSource({ conditions: [[{}]] })}
        >
          <i className="icon-add Font16" />
          {_l('筛选条件')}
        </span>
      </div>
    );
  }

  openSubProcess = evt => {
    const { data } = this.state;

    evt.stopPropagation();
    window.open(`/workflowedit/${data.subProcessId}`);
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
          icon="icon-arrow_loop"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect onSave={this.onSave} />
      </Fragment>
    );
  }
}
