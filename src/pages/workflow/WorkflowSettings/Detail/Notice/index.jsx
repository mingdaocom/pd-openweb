import React, { Component, Fragment } from 'react';
import flowNode from '../../../api/flowNode';
import { ScrollView, LoadDiv } from 'ming-ui';
import {
  SelectUserDropDown,
  Member,
  DetailHeader,
  DetailFooter,
  CustomTextarea,
  PromptSoundDialog,
} from '../components';
import _ from 'lodash';
import { OPERATION_TYPE } from '../../enum';
import { clearFlowNodeMapParameter } from '../../utils';

export default class Notice extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      views: [],
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
    const { accounts, name, sendContent, flowNodeMap } = data;

    if (!sendContent.trim()) {
      alert(_l('通知内容不允许为空'), 2);
      return;
    }

    if (!accounts.length) {
      alert(_l('必须指定通知人'), 2);
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
        sendContent: sendContent.trim(),
        accounts,
        flowNodeMap: clearFlowNodeMapParameter(flowNodeMap),
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
    const { data, showSelectUserDialog } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold">{_l('通知内容')}</div>
        <CustomTextarea
          className="minH100"
          projectId={this.props.companyId}
          processId={this.props.processId}
          relationId={this.props.relationId}
          selectNodeId={this.props.selectNodeId}
          type={2}
          content={data.sendContent}
          formulaMap={data.formulaMap}
          onChange={(err, value, obj) => this.updateSource({ sendContent: value })}
          updateSource={this.updateSource}
        />

        <div className="Font13 bold mTop20">{_l('通知人')}</div>
        <div className="Font13 Gray_75 mTop10">{_l('将通过系统消息发送')}</div>

        <Member
          companyId={this.props.companyId}
          appId={this.props.relationType === 2 ? this.props.relationId : ''}
          accounts={data.accounts}
          updateSource={this.updateSource}
        />
        <div
          className="flexRow mTop15 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('添加通知人')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
            visible={showSelectUserDialog}
            companyId={this.props.companyId}
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            unique={false}
            accounts={data.accounts}
            isIncludeSubDepartment={true}
            updateSource={this.updateSource}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>

        <PromptSoundDialog
          {...this.props}
          promptSound={data.flowNodeMap[OPERATION_TYPE.PROMPT_SOUND].promptSound}
          formulaMap={data.flowNodeMap[OPERATION_TYPE.PROMPT_SOUND].formulaMap}
          updateSource={obj =>
            this.updateSource({
              flowNodeMap: Object.assign({}, data.flowNodeMap, {
                [OPERATION_TYPE.PROMPT_SOUND]: Object.assign({}, data.flowNodeMap[OPERATION_TYPE.PROMPT_SOUND], obj),
              }),
            })
          }
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
          {...this.props}
          data={{ ...data }}
          icon="icon-hr_message_reminder"
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={!!(data.sendContent || '').trim() && !!data.accounts.length}
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
