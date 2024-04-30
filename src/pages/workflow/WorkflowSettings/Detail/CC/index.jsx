import React, { Component, Fragment } from 'react';
import flowNode from '../../../api/flowNode';
import { ScrollView, LoadDiv, Dropdown, Checkbox } from 'ming-ui';
import cx from 'classnames';
import {
  SelectUserDropDown,
  Member,
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  CustomTextarea,
  WriteFields,
} from '../components';
import worksheet from 'src/api/worksheet';
import _ from 'lodash';

export default class CC extends Component {
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
    const { processId, selectNodeId, selectNodeType, isApproval, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        this.setState({ data: result });

        if (result.appId) {
          this.getWorksheetInfo(result.appId);
        }

        if (isApproval && !result.selectNodeId) {
          this.onChange(result.flowNodeList[0].nodeId);
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
    const { accounts, selectNodeId, name, sendContent, formProperties, viewId, addNotAllowView, showTitle } = data;

    if (!selectNodeId) {
      alert(_l('必须指定数据对象'), 2);
      return;
    }

    if (!formProperties.length && !viewId) {
      alert(_l('必须指定视图'), 2);
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
        selectNodeId,
        sendContent: sendContent.trim(),
        accounts,
        formProperties,
        viewId,
        addNotAllowView,
        showTitle: sendContent.trim() ? showTitle : true,
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
    const views = this.state.views.map(o => ({
      text: o.name,
      value: o.viewId,
      className: data.viewId === o.viewId ? 'ThemeColor3' : '',
    }));
    const selectView = _.find(views, o => o.value === data.viewId);

    return (
      <Fragment>
        <div className="Font13 bold">{_l('数据对象')}</div>
        <SelectNodeObject
          disabled={this.props.isApproval}
          smallBorder={true}
          appList={data.appList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={this.onChange}
        />

        {data.selectNodeId && !!data.formProperties.length && (
          <Fragment>
            <div
              className="workflowDetailDesc pTop15 pBottom15 mTop20"
              style={{ background: 'rgba(255, 163, 64, 0.12)' }}
            >
              <div className="Gray_9e mBottom5">
                {_l(
                  '新版发送记录可以选择一个视图，按照所选视图配置的显示字段发送。如果通知人分发了此视图，可以直接按权限编辑记录、执行自定义动作。',
                )}
                <span style={{ color: '#ffa340' }}>
                  {_l('注意：切换为新方式并保存配置后，将无法恢复到旧的配置方式')}
                </span>
              </div>
              <span
                className="ThemeColor3 ThemeHoverColor2 pointer"
                onClick={() => this.updateSource({ formProperties: [] })}
              >
                {_l('切换为新版配置方式')}
              </span>
            </div>
            <div className="Font13 bold mTop20">{_l('设置字段')}</div>
            <WriteFields
              processId={this.props.processId}
              nodeId={this.props.selectNodeId}
              selectNodeId={data.selectNodeId}
              data={data.formProperties}
              addNotAllowView={data.addNotAllowView}
              updateSource={this.updateSource}
              hideTypes={[2, 3]}
            />
          </Fragment>
        )}

        {!data.formProperties.length && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('视图')}</div>
            <div className="Font13 Gray_9e mTop5">
              {_l('按照所选视图配置的显示字段发送，如果通知人被分发了此视图，可以直接按权限编辑记录、执行自定义动作')}
            </div>
            <Dropdown
              className={cx('flowDropdown mTop10', {
                'errorBorder errorBG': data.viewId && !!views.length && !selectView,
              })}
              isAppendToBody
              disabled={!data.selectNodeId}
              data={views}
              value={data.viewId}
              renderTitle={
                !data.viewId || !views.length
                  ? () => <span className="Gray_9e">{_l('请选择')}</span>
                  : data.viewId && !selectView
                  ? () => <span className="errorColor">{_l('视图无效或已删除')}</span>
                  : () => <span>{selectView.text}</span>
              }
              border
              onChange={viewId => this.updateSource({ viewId })}
            />
          </Fragment>
        )}

        <div className="Font13 bold mTop20">{_l('抄送人')}</div>
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
          {_l('添加抄送人')}
          <SelectUserDropDown
            appId={this.props.relationType === 2 ? this.props.relationId : ''}
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

        <div className="Font13 bold mTop20">{_l('通知内容')}</div>
        <div className="Font13 Gray_9e mTop5">
          {_l('可不设，默认显示记录标题。设置后，显示设置的通知内容和记录标题（可选）')}
        </div>
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
        <div className="mTop10">
          <Checkbox
            className="InlineFlex"
            disabled={!data.sendContent}
            text={_l('显示记录标题')}
            checked={data.showTitle || !data.sendContent}
            onClick={checked => this.updateSource({ showTitle: !checked })}
          />
        </div>
      </Fragment>
    );
  }

  /**
   * 下拉框更改
   */
  onChange = selectNodeId => {
    const { data } = this.state;
    const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);

    this.updateSource({ selectNodeId, selectNodeObj, viewId: '' });
    this.getWorksheetInfo(selectNodeObj.appId);
  };

  /**
   * 获取工作表详情
   */
  getWorksheetInfo(worksheetId) {
    worksheet.getWorksheetInfo({ worksheetId, getViews: true }).then(data => {
      if (data.resultCode === 1) {
        this.setState({ views: data.views });
      }
    });
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
          icon="icon-workflow_notice"
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex">
          <ScrollView>
            <div className="workflowDetailBox">{this.renderContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={!!data.accounts.length && data.selectNodeId} onSave={this.onSave} />
      </Fragment>
    );
  }
}
