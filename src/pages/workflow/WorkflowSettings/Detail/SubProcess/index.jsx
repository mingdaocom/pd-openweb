import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Checkbox, Dropdown, Radio, Dialog } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import process from '../../../api/process';
import { DetailHeader, DetailFooter, SelectNodeObject, UpdateFields } from '../components';
import { NODE_TYPE } from '../../enum';
import ProcessVariables from '../../ProcessConfig/components/ProcessVariables';

export default class SubProcess extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      subProcessDialog: false,
      processVariables: [],
      errorItems: {},
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
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({
        processId,
        nodeId: selectNodeId,
        flowNodeType: selectNodeType,
        selectNodeId: obj.selectNodeId,
        appId: obj.subProcessId,
      })
      .then(result => {
        this.setState({ data: result, errorItems: {} });
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
    const { name, selectNodeId, executeType, subProcessId, nextExecute, fields } = data;

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
    const { data, subProcessDialog, processVariables, errorItems } = this.state;
    const executeTypes = [
      {
        text: _l('并行'),
        value: 1,
        desc: _l('多个数据对象将同时执行各自的流程。即便某条子流程运行中止，也不影响其他子流程的执行。'),
      },
      {
        text: _l('逐条执行'),
        value: 2,
        desc: _l(
          '多个数据对象将依次执行流程。每条子流程需要等前一条子流程通过后再开始触发；如果某条子流程运行中止，则后续的子流程都不再触发。',
        ),
      },
    ];
    const clearSubProcess = data.subProcessId
      ? [{ text: <span className="Gray_9e">{_l('清除选择')}</span>, value: '' }]
      : [];

    return (
      <Fragment>
        <div className="Font13 bold">{_l('选择数据对象')}</div>
        <div className="Font13 Gray_9e mTop10">{_l('当前流程中的节点对象，作为子流程数据源')}</div>
        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => this.getNodeDetail(this.props, { selectNodeId })}
        />

        {_.isObject(data.selectNodeObj) &&
          _.includes([NODE_TYPE.GET_MORE_RECORD, NODE_TYPE.FIND_MORE_MESSAGE], data.selectNodeObj.nodeTypeId) && (
            <Fragment>
              <div className="Font13 bold mTop20">{_l('多条数据执行方式')}</div>
              <div className="Font13 Gray_9e mTop10">{_l('您选择了多条数据对象，将根据数据的条数执行多条子流程')}</div>

              {executeTypes.map((item, i) => {
                return (
                  <div className="mTop15" key={i}>
                    <Radio
                      text={item.text}
                      checked={data.executeType === item.value}
                      onClick={() => this.updateSource({ executeType: item.value })}
                    />
                    <div className="mTop10 mLeft30 Gray_9e">{item.desc}</div>
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
                className="InlineFlex"
                text={_l('子流程执行完毕后，再开始下一个节点')}
                checked={data.nextExecute}
                onClick={checked => this.updateSource({ nextExecute: !checked })}
              />
            </div>
            <div className="Font13 Gray_9e" style={{ marginLeft: 26 }}>
              {_l('勾选后，当子流程数据源为单条对象，之后节点可使用子流程中的参数')}
            </div>

            <div className="Font13 mTop20 flexRow">
              <div className="flex bold">{_l('参数传递')}</div>
              {data.subProcessId && (
                <div
                  className="pointer ThemeColor3 ThemeHoverColor2"
                  onClick={() => this.setState({ subProcessDialog: true, processVariables: data.subProcessVariables })}
                >
                  {_l('参数设置')}
                </div>
              )}
            </div>
            <div className="Font13 Gray_9e mTop10">{_l('向子流程的流程参数传递初始值，供子流程执行时使用')}</div>

            <UpdateFields
              type={2}
              isSubProcessNode={true}
              companyId={this.props.companyId}
              processId={this.props.processId}
              selectNodeId={this.props.selectNodeId}
              controls={data.subProcessVariables}
              fields={data.fields}
              formulaMap={data.formulaMap}
              updateSource={this.updateSource}
            />
          </Fragment>
        )}

        {subProcessDialog && (
          <Dialog
            visible
            className="subProcessDialog"
            onCancel={() => this.setState({ subProcessDialog: false })}
            onOk={this.saveSubPorcessOptions}
            title={_l('参数设置')}
          >
            <ProcessVariables
              processVariables={processVariables}
              errorItems={errorItems}
              setErrorItems={errorItems => this.setState({ errorItems })}
              updateSource={processVariables => this.setState(processVariables)}
            />
          </Dialog>
        )}
      </Fragment>
    );
  }

  /**
   * 保存子流程参数
   */
  saveSubPorcessOptions = () => {
    const { data, processVariables, errorItems } = this.state;

    if (_.find(errorItems, o => o)) {
      alert(_l('有参数配置错误'), 2);
      return;
    }

    if (processVariables.filter(item => !item.controlName).length) {
      alert(_l('参数名称不能为空'), 2);
      return;
    }

    process
      .saveProcessConfig({
        processId: data.subProcessId,
        isSaveVariables: true,
        processVariables,
      })
      .then(result => {
        if (result) {
          alert(_l('保存成功'));
          this.setState({ subProcessDialog: false });
          this.updateSource({ subProcessVariables: result });
        }
      });
  };

  render() {
    const { data } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-subprocess"
          bg="BGBlueAsh"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter isCorrect={data.selectNodeId} onSave={this.onSave} closeDetail={this.props.closeDetail} />
      </Fragment>
    );
  }
}
