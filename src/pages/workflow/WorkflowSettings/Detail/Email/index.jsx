import React, { Component, Fragment } from 'react';
import { ScrollView, LoadDiv } from 'ming-ui';
import { NODE_TYPE } from '../../enum';
import flowNode from '../../../api/flowNode';
import { Member, SelectUserDropDown, SingleControlValue, DetailHeader, DetailFooter } from '../components';

export default class Email extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
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
   * 修改选中的字段
   */
  genFields = data => {
    const { controls, fields } = data;
    controls.forEach(item => {
      fields.push({
        fieldId: item.controlId,
        type: item.type,
        enumDefault: item.enumDefault,
        nodeId: '',
        nodeName: '',
        fieldValueId: '',
        fieldValueName: '',
        fieldValue: item.type === 26 || item.type === 27 ? '[]' : '',
      });
    });

    this.updateSource({ fields });
  };

  /**
   * 获取节点详情
   */
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType } = props;

    flowNode.getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType }).then(result => {
      this.setState({ data: result, cacheKey: +new Date() });
      if (!result.fields.length) {
        this.genFields(result);
      }
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
    const { name, accounts } = data;
    let hasError = false;

    if (!accounts.length) {
      alert(_l('必须先选择一个发送人'), 2);
      return;
    }

    if (saveRequest) {
      return;
    }

    data.controls.forEach(item => {
      if (item.required) {
        data.fields.forEach(o => {
          if (item.controlId === o.fieldId && !o.fieldValue && !o.fieldValueId) {
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
        fields: data.fields,
        actionId: data.actionId,
        appType: data.appType,
        accounts,
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
    const { data, showSelectUserDialog, cacheKey } = this.state;

    return (
      <Fragment>
        <div className="mTop20 bold">{_l('发送给')}</div>

        <Member type={NODE_TYPE.MESSAGE} accounts={data.accounts} updateSource={this.updateSource} />

        <div
          className="flexRow mTop15 ThemeColor3 workflowDetailAddBtn"
          onClick={() => this.setState({ showSelectUserDialog: true })}
        >
          <i className="Font28 icon-task-add-member-circle mRight10" />
          {_l('选择人员、邮箱地址或输入邮箱')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
            specialType={5}
            visible={showSelectUserDialog}
            companyId={this.props.companyId}
            processId={this.props.processId}
            nodeId={this.props.selectNodeId}
            unique={false}
            accounts={data.accounts}
            updateSource={this.updateSource}
            onClose={() => this.setState({ showSelectUserDialog: false })}
          />
        </div>

        {data.fields.map((item, i) => {
          const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId);
          return (
            <div key={i} className="relative">
              <div className="mTop15 ellipsis Font13 bold">
                {singleObj.controlName}
                {singleObj.required && <span className="mLeft5 red">*</span>}
              </div>
              {singleObj.controlId === 'attachments' && (
                <div className="mTop5 Gray_75">{_l('附件总大小不超过10M')}</div>
              )}
              <SingleControlValue
                key={cacheKey + i}
                companyId={this.props.companyId}
                processId={this.props.processId}
                selectNodeId={this.props.selectNodeId}
                controls={data.controls}
                formulaMap={data.formulaMap}
                fields={data.fields}
                updateSource={this.updateSource}
                item={item}
                i={i}
              />
            </div>
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
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-workflow_email"
          bg="BGBlueAsh"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter isCorrect={!!data.accounts.length} onSave={this.onSave} closeDetail={this.props.closeDetail} />
      </Fragment>
    );
  }
}
