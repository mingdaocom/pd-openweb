import React, { Component, Fragment } from 'react';
import { ScrollView, Checkbox, LoadDiv } from 'ming-ui';
import { NODE_TYPE } from '../../enum';
import flowNode from '../../../api/flowNode';
import {
  SelectUserDropDown,
  Member,
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  WriteFields,
  ButtonName,
  Schedule,
} from '../components';

export default class Write extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
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
   * 下拉框更改
   */
  onChange = selectNodeId => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);

    this.updateSource({ selectNodeId, selectNodeObj });
  };

  /**
   * 更新data数据
   */
  updateSource = obj => {
    this.props.haveChange(true);
    this.setState({ data: Object.assign({}, this.state.data, obj) });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const { selectNodeId, name, accounts, allowTransfer, formProperties, submitBtnName, schedule } = data;

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
        accounts,
        allowTransfer,
        formProperties,
        submitBtnName: submitBtnName.trim() || _l('提交'),
        schedule,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  render() {
    const { data, showSelectUserDialog } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-workflow_write"
          bg="BGSkyBlue"
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              <div className="Font13 bold">{_l('填写对象')}</div>
              <div className="Font13 Gray_9e mTop10">{_l('当前流程中的节点对象')}</div>

              <SelectNodeObject
                appList={data.appList}
                selectNodeId={data.selectNodeId}
                selectNodeObj={data.selectNodeObj}
                onChange={this.onChange}
              />

              <div className="Font13 mTop25 bold">{_l('指定填写对象')}</div>
              {(data.accounts || []).length ? (
                <Member accounts={data.accounts} updateSource={this.updateSource} />
              ) : (
                <div
                  className="mTop12 flexRow ThemeColor3 workflowDetailAddBtn"
                  onClick={() => this.setState({ showSelectUserDialog: true })}
                >
                  <i className="Font28 icon-task-add-member-circle mRight10" />
                  {_l('指定填写人')}
                  <SelectUserDropDown
                    appId={this.props.relationType === 2 ? this.props.relationId : ''}
                    visible={showSelectUserDialog}
                    companyId={this.props.companyId}
                    processId={this.props.processId}
                    nodeId={this.props.selectNodeId}
                    unique
                    accounts={data.accounts}
                    updateSource={this.updateSource}
                    onClose={() => this.setState({ showSelectUserDialog: false })}
                  />
                </div>
              )}

              <div className="Font13 mTop25 bold">{_l('填写设置')}</div>
              <Checkbox
                className="mTop15 flexRow"
                text={_l('允许转交他人填写')}
                checked={data.allowTransfer}
                onClick={checked => this.updateSource({ allowTransfer: !checked })}
              />
              <Checkbox
                className="mTop15 flexRow"
                text={<span>{_l('开启限时处理')}</span>}
                checked={(data.schedule || {}).enable}
                onClick={checked =>
                  this.updateSource({ schedule: Object.assign({}, data.schedule, { enable: !checked }) })
                }
              />
              <Schedule schedule={data.schedule} updateSource={this.updateSource} {...this.props} />

              <div className="Font13 bold mTop25">{_l('指定填写字段')}</div>
              {data.selectNodeId && (
                <WriteFields
                  processId={this.props.processId}
                  nodeId={this.props.selectNodeId}
                  selectNodeId={data.selectNodeId}
                  data={data.formProperties}
                  updateSource={this.updateSource}
                  showCard={true}
                />
              )}

              {(!data.selectNodeId ||
                (data.selectNodeId && !data.selectNodeObj.nodeName && !data.selectNodeObj.appName)) && (
                <div className="Gray_9e Font13 flexRow flowDetailTips">
                  <i className="icon-task-setting_promet Font16" />
                  <div className="flex mLeft10">{_l('必须先指定一个填写对象后，才能设置可填写字段')}</div>
                </div>
              )}

              {data.selectNodeId && data.selectNodeObj.nodeName && !data.selectNodeObj.appName && (
                <div className="Gray_9e Font13 flexRow flowDetailTips">
                  <i className="icon-task-setting_promet Font16" />
                  <div
                    className="flex mLeft10"
                    dangerouslySetInnerHTML={{
                      __html: _l(
                        '节点所使用的数据来源%0中的工作表已删除。必须修复此节点中的错误，或重新指定一个有效的对象后才能设置可填写字段。',
                        `<span class="mLeft5 mRight5 flowDetailTipsColor">“${data.selectNodeObj.nodeName}”</span>`,
                      ),
                    }}
                  />
                </div>
              )}

              <div className="Font13 bold mTop25">{_l('按钮名称')}</div>
              <ButtonName
                dataKey="submitBtnName"
                name={data.submitBtnName}
                buttonName={_l('提交按钮')}
                onChange={this.updateSource}
              />
            </div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.selectNodeId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
