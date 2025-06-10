import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import { Checkbox, Dropdown, LoadDiv, Radio, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { ACTION_ID, APP_TYPE, NODE_TYPE } from '../../enum';
import {
  DetailFooter,
  DetailHeader,
  ProcessVariablesInput,
  SelectNodeObject,
  SpecificFieldsValue,
  TransferTriggerUser,
} from '../components';

export default class SubProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      subProcessDialog: false,
      processVariables: [],
      cacheKey: +new Date(),
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
  getNodeDetail(props, obj = {}) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { data } = this.state;

    flowNode
      .getNodeDetail({
        processId,
        nodeId: selectNodeId,
        flowNodeType: selectNodeType,
        selectNodeId: obj.selectNodeId,
        appId: obj.subProcessId,
        instanceId,
      })
      .then(result => {
        this.setState({
          data: _.isEmpty(obj) ? result : { ...result, name: data.name, executeType: data.executeType },
          cacheKey: +new Date(),
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
    const {
      name,
      selectNodeId,
      executeType,
      subProcessId,
      nextExecute,
      fields,
      executeAll,
      executeAllCount,
      fromTrigger,
    } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
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
        name: name.trim(),
        selectNodeId,
        executeType,
        subProcessId,
        nextExecute,
        fields,
        executeAll,
        executeAllCount,
        fromTrigger,
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
    const { data, cacheKey } = this.state;
    const executeTypes = [
      {
        text: _l('并行'),
        value: 1,
        desc: _l('多个数据对象将同时执行各自的流程。即便某条子流程运行中止，也不影响其他子流程的执行。'),
      },
      {
        text: _l('逐条执行，中止时不再触发后续子流程'),
        value: 2,
        desc: _l(
          '多个数据对象将依次执行流程。每条子流程需要等前一条子流程通过后再开始触发；如果某条子流程运行中止，则后续的子流程都不再触发。',
        ),
      },
      {
        text: _l('逐条执行，中止时继续下一条'),
        value: 3,
        desc: _l('如果某条子流程运行中止，则跳过该条继续执行下一条子流程'),
      },
    ];
    const clearSubProcess = data.subProcessId
      ? [{ text: <span className="Gray_75">{_l('清除选择')}</span>, value: '' }]
      : [];

    return (
      <Fragment>
        <div className="Font13 bold">{_l('选择数据对象')}</div>
        <div className="Font13 Gray_75 mTop10">{_l('当前流程中的节点对象，作为子流程数据源')}</div>
        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => this.getNodeDetail(this.props, { selectNodeId })}
        />

        {_.isObject(data.selectNodeObj) &&
          (_.includes(
            [NODE_TYPE.GET_MORE_RECORD, NODE_TYPE.FIND_MORE_MESSAGE, NODE_TYPE.PBC],
            data.selectNodeObj.nodeTypeId,
          ) ||
            data.selectNodeObj.actionId === ACTION_ID.BATCH_ACTION) && (
            <Fragment>
              {data.selectNodeObj.appType === APP_TYPE.SHEET &&
                data.selectNodeObj.actionId === ACTION_ID.FROM_WORKSHEET && (
                  <Fragment>
                    <div className="Font13 bold mTop20">{_l('工作表数据对象')}</div>
                    <div className="mTop15">
                      <Checkbox
                        className="InlineFlex TxtTop"
                        text={_l('获取工作表所有记录')}
                        checked={data.executeAll}
                        onClick={checked => this.updateSource({ executeAll: !checked })}
                      />
                    </div>
                    <div style={{ marginLeft: 26 }}>
                      <div className="Font13 Gray_75">
                        {_l(
                          '勾选后，当子流程数据源为工作表多条数据对象时，所有符合筛选条件的记录都将进入子流程，并忽略数据对象节点配置的排序规则和限制数量',
                        )}
                      </div>
                      {data.executeAll && (
                        <Fragment>
                          <div className="Font13 mTop10">{_l('获取记录数量上限')}</div>
                          <div className="mTop10 flexRow alignItemsCenter">
                            <div style={{ width: 170 }}>
                              <SpecificFieldsValue
                                hasOtherField={false}
                                type="number"
                                min={10000}
                                max={1000000}
                                data={{ fieldValue: data.executeAllCount }}
                                updateSource={({ fieldValue }) => this.updateSource({ executeAllCount: fieldValue })}
                              />
                            </div>
                            <div className="Gray_75 mLeft10">{_l('行（最大 100 万行）')}</div>
                          </div>
                        </Fragment>
                      )}
                    </div>
                  </Fragment>
                )}

              <div className="Font13 bold mTop20">{_l('多条数据执行方式')}</div>
              <div className="Font13 Gray_75 mTop10">{_l('您选择了多条数据对象，将根据数据的条数执行多条子流程')}</div>

              {executeTypes.map((item, i) => {
                return (
                  <div className="mTop15" key={i}>
                    <Radio
                      text={item.text}
                      checked={data.executeType === item.value}
                      onClick={() => this.updateSource({ executeType: item.value })}
                    />
                    <div className="mTop10 mLeft30 Gray_75">{item.desc}</div>
                  </div>
                );
              })}
            </Fragment>
          )}

        <div className="mTop20 relative">
          <span className="Font13 bold">{_l('执行子流程')}</span>
          {!!(data.processList || []).length && (
            <Dropdown
              className="flowSubProcessDropdown"
              renderTitle={() => <span className="ThemeColor3">{_l('选择已有流程')}</span>}
              menuStyle={{ left: 'inherit', right: 0 }}
              data={clearSubProcess.concat(
                data.processList.map(item => {
                  return {
                    text: item.name,
                    value: item.id,
                    disabled: data.subProcessId === item.id,
                  };
                }),
              )}
              value={data.subProcessId}
              onChange={subProcessId =>
                this.getNodeDetail(this.props, { selectNodeId: data.selectNodeId, subProcessId })
              }
            />
          )}
        </div>

        {data.selectNodeId && (
          <Fragment>
            <div className="workflowDetailDesc mTop10 flexRow" style={{ padding: '10px 12px' }}>
              {!data.subProcessId ? (
                <div className="Gray_75 ellipsis">{_l('节点保存后，将自动创建一个新的子流程')}</div>
              ) : (
                <Fragment>
                  <div className="ellipsis">{data.subProcessName}</div>
                  {!data.subProcessEnabled && (
                    <div className="flex" style={{ color: '#f44336' }}>
                      （{_l('未开启')}）
                    </div>
                  )}
                </Fragment>
              )}
            </div>
            <div className="mTop15">
              <Checkbox
                className="InlineFlex TxtTop"
                text={_l('子流程执行完毕后，再开始下一个节点')}
                checked={data.nextExecute}
                onClick={checked => this.updateSource({ nextExecute: !checked })}
              />
            </div>
            <div className="Font13 Gray_75" style={{ marginLeft: 26 }}>
              {_l('勾选后，当子流程数据源为单条对象，之后节点可使用子流程中的参数')}
            </div>

            <ProcessVariablesInput
              {...this.props}
              key={cacheKey}
              data={data}
              selectProcessId={data.subProcessId}
              desc={_l('向子流程的流程参数传递初始值，供子流程执行时使用')}
              updateSource={this.updateSource}
            />

            <TransferTriggerUser {...this.props} data={data} updateSource={this.updateSource} />
          </Fragment>
        )}
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
          icon="icon-subprocess"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.selectNodeId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
