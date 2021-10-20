import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Dropdown } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, SelectNodeObject } from '../components';
import cx from 'classnames';

export default class File extends Component {
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
  getNodeDetail(props, sId) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, selectNodeId: sId })
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
    const { name, selectNodeId, appId } = data;

    if (!selectNodeId) {
      alert(_l('必须先选择一个对象'), 2);
      return;
    }

    if (!appId) {
      alert(_l('Word打印模板必选'), 2);
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
        appId,
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
    const appList = data.appList.map(item => {
      return {
        text: item.name,
        value: item.id,
        className: item.id === data.appId ? 'ThemeColor3' : '',
      };
    });
    const selectAppItem = appList.find(item => item.value === data.appId);

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
          {_l(
            '将记录转为PDF或Word文件，可以通过新增记录、更新记录或发送邮件节点将文件写入附件。注：文档大小不得超过100M。',
          )}
        </div>

        <div className="mTop20 bold">{_l('打印对象')}</div>
        <div className="Gray_75 mTop5">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.flowNodeList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={sId => this.getNodeDetail(this.props, sId)}
        />

        <div className="mTop20 bold">{_l('Word打印模板')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          className={cx('flowDropdown mTop10', { 'errorBorder errorBG': data.appId && !selectAppItem })}
          data={appList}
          value={data.appId}
          renderTitle={
            !data.appId
              ? () => <span className="Gray_9e">{_l('请选择')}</span>
              : data.appId && !selectAppItem
              ? () => <span className="errorColor">{_l('模板已删除')}</span>
              : () => <span>{selectAppItem.text}</span>
          }
          border
          openSearch
          noData={_l('暂无Word打印模板')}
          onChange={appId => this.updateSource({ appId })}
        />
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
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-print"
          bg="BGBlueAsh"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          isCorrect={!!data.selectNodeId && !!data.appId}
          onSave={this.onSave}
          closeDetail={this.props.closeDetail}
        />
      </Fragment>
    );
  }
}
