import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv, Radio, Icon } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, SelectNodeObject, CustomTextarea, WriteFields } from '../components';

export default class Link extends Component {
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
    const { name, selectNodeId, linkType, linkName, formProperties } = data;

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
        linkType,
        linkName,
        formProperties,
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

    return (
      <Fragment>
        <div className="Gray_75 workflowDetailDesc pTop15 pBottom15">
          {_l(
            '根据当前流程节点中的记录对象，生成特定的对外分享链接。可以通过在邮件、短信的正文里引用此节点，邀请外部用户查看或填写指定的记录。',
          )}
        </div>

        <div className="mTop20 bold">{_l('获取链接对象')}</div>
        <div className="Gray_75 mTop5">{_l('当前流程中的节点对象')}</div>

        <SelectNodeObject
          appList={data.appList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={this.onChange}
        />

        <div className="mTop20 bold">{_l('获取方式')}</div>
        <div className="mTop15">
          <Radio text={_l('分享链接')} checked={data.linkType === 1} onClick={() => this.switchLinkType(1)} />
        </div>
        <div className="mTop10">
          <Radio text={_l('填写链接')} checked={data.linkType === 2} onClick={() => this.switchLinkType(2)} />
          <div className="mLeft30 Gray_9e Font12">{_l('填写完成后链接失效')}</div>
        </div>

        <div className="mTop20">
          <span className="bold">{_l('链接名称（仅用于发送邮件时）')}</span>
          <span
            className="pointer Gray_9e workflowDetailTipsWidth"
            data-tip={_l(
              '通过工作流发送邮件时，链接可以按照设置的链接名称显示。如：在邮件中将链接显示为【点击查看记录】',
            )}
          >
            <Icon className="Font16" icon="workflow_help" />
          </span>
        </div>
        <div className="mTop10">
          <CustomTextarea
            processId={this.props.processId}
            selectNodeId={this.props.selectNodeId}
            type={2}
            height={0}
            content={data.linkName}
            formulaMap={data.formulaMap}
            onChange={(err, value, obj) => this.updateSource({ linkName: value })}
            updateSource={this.updateSource}
          />
        </div>

        {data.selectNodeId && (
          <Fragment>
            <div className="Font13 bold mTop25">{_l('设置字段')}</div>
            <WriteFields
              processId={this.props.processId}
              nodeId={this.props.selectNodeId}
              selectNodeId={data.selectNodeId}
              data={data.formProperties}
              hideTypes={data.linkType === 1 ? [2, 3] : []}
              readonlyControlTypes={[21, 26, 27]}
              updateSource={this.updateSource}
            />
          </Fragment>
        )}
      </Fragment>
    );
  }

  /**
   * 下拉框更改
   */
  onChange = selectNodeId => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);

    this.updateSource({ selectNodeId, selectNodeObj });
  };

  /**
   * 切换链接方式
   */
  switchLinkType(linkType) {
    const { data } = this.state;
    const formProperties = _.cloneDeep(data.formProperties);

    // 从填写切换到分享 字段降级
    if (linkType === 1) {
      formProperties.forEach(item => {
        if (item.property !== 4) {
          item.property = 1;
        }
      });
    }

    this.updateSource({ linkType, formProperties });
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
          icon="icon-link2"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.appId || !!data.selectNodeId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
