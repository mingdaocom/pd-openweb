import React, { Component, Fragment } from 'react';
import flowNode from '../../../api/flowNode';
import { ScrollView, LoadDiv, Dropdown, Checkbox, Support } from 'ming-ui';
import cx from 'classnames';
import {
  SelectUserDropDown,
  Member,
  SelectNodeObject,
  DetailHeader,
  DetailFooter,
  CustomTextarea,
  WriteFields,
  EmailApproval,
} from '../components';
import worksheet from 'src/api/worksheet';
import _ from 'lodash';
import styled from 'styled-components';
import { OPERATION_TYPE } from '../../enum';
import { clearFlowNodeMapParameter } from '../../utils';

const TABS_ITEM = styled.div`
  display: inline-flex;
  padding: 0 12px 12px 12px;
  margin-right: 36px;
  font-weight: bold;
  font-size: 15px;
  cursor: pointer;
  position: relative;
  &.active {
    &::before {
      position: absolute;
      bottom: -2px;
      left: 0;
      right: 0;
      content: '';
      height: 0;
      border-bottom: 3px solid #2196f3;
    }
  }
`;

export default class CC extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showSelectUserDialog: false,
      views: [],
      tabIndex: 1,
      isNewCC: false,
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
    const { processId, selectNodeId, selectNodeType, isApproval, instanceId } = props;
    const { isNewCC } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId, selectNodeId: sId })
      .then(result => {
        if (isApproval && !result.selectNodeId) {
          this.setState({ isNewCC: true }, () => {
            this.getNodeDetail(props, result.flowNodeList[0].nodeId);
          });
        } else {
          this.setState({ data: result, isNewCC: !!result.viewId || !result.selectNodeId || isNewCC });

          if (result.appId) {
            this.getWorksheetInfo(result.appId);
          }
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
   * 更新节点对象数据
   */
  updateFlowMapSource = (key, obj) => {
    const { data } = this.state;

    this.updateSource({
      flowNodeMap: Object.assign({}, data.flowNodeMap, { [key]: Object.assign({}, data.flowNodeMap[key], obj) }),
    });
  };

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest, isNewCC } = this.state;
    const {
      accounts,
      selectNodeId,
      name,
      sendContent,
      formProperties,
      viewId,
      addNotAllowView,
      showTitle,
      flowNodeMap,
    } = data;

    if (!selectNodeId) {
      alert(_l('必须指定数据对象'), 2);
      return;
    }

    if (isNewCC && !viewId) {
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
    const { data, showSelectUserDialog, tabIndex, isNewCC } = this.state;
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
          onChange={sId => this.getNodeDetail(this.props, sId)}
        />

        {data.selectNodeId && !isNewCC && (
          <Fragment>
            <div
              className="workflowDetailDesc pTop15 pBottom15 mTop20"
              style={{ background: 'rgba(255, 163, 64, 0.12)' }}
            >
              <div className="Gray_75 mBottom5">
                {_l(
                  '新版发送记录可以选择一个视图，按照所选视图配置的显示字段发送。如果通知人分发了此视图，可以直接按权限编辑记录、执行自定义动作。',
                )}
                <span style={{ color: '#ffa340' }}>
                  {_l('注意：切换为新方式并保存配置后，将无法恢复到旧的配置方式')}
                </span>
              </div>
              <span
                className="ThemeColor3 ThemeHoverColor2 pointer"
                onClick={() => {
                  this.setState({ isNewCC: true });
                  this.updateSource({
                    formProperties: data.formProperties.map(item => Object.assign(item, { property: 1 })),
                  });
                }}
              >
                {_l('切换为新版配置方式')}
              </span>
            </div>
            <div className="Font13 bold mTop20">{_l('设置字段')}</div>
            <div className="Font13 mTop15">
              <WriteFields
                selectNodeType={this.props.selectNodeType}
                data={data.formProperties}
                addNotAllowView={data.addNotAllowView}
                updateSource={this.updateSource}
                hideTypes={[2, 3]}
              />
            </div>
          </Fragment>
        )}

        {data.selectNodeId && isNewCC && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('视图')}</div>
            <div className="Font13 Gray_75 mTop5">
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
                  ? () => <span className="Gray_75">{_l('请选择')}</span>
                  : data.viewId && !selectView
                  ? () => <span className="errorColor">{_l('视图无效或已删除')}</span>
                  : () => <span>{selectView.text}</span>
              }
              border
              onChange={viewId => this.updateSource({ viewId })}
            />
          </Fragment>
        )}

        {data.selectNodeId && (
          <Fragment>
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
          </Fragment>
        )}

        {data.selectNodeId && isNewCC && (
          <Fragment>
            {this.renderTabs()}

            {tabIndex === 1 && (
              <Fragment>
                <div className="Font13 bold mTop20">{_l('通知内容')}</div>
                <div className="Font13 Gray_75 mTop5">
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

                <div className="Font13 mTop25 bold">{_l('其他')}</div>
                <EmailApproval
                  {...this.props}
                  title={_l('启用邮件通知')}
                  desc={_l('启用后，待办消息同时会以邮件的形式发送给相关负责人；邮件0.03元/封，自动从账务中心扣费')}
                  flowNodeMap={data.flowNodeMap[OPERATION_TYPE.EMAIL]}
                  updateSource={obj => this.updateFlowMapSource(OPERATION_TYPE.EMAIL, obj)}
                />
              </Fragment>
            )}

            {tabIndex === 2 && (
              <Fragment>
                <div className="Gray_75 mTop20">
                  {_l('设为摘要的字段可以在待办列表和邮件通知中直接查看。')}
                  <Support
                    type={3}
                    text={_l('帮助')}
                    className="ThemeColor3 ThemeHoverColor2"
                    href="https://help.mingdao.com/worksheet/field-filter"
                  />
                </div>
                {data.selectNodeId ? (
                  <div className="Font13 mTop15">
                    <WriteFields
                      selectNodeType={this.props.selectNodeType}
                      data={data.formProperties}
                      addNotAllowView={data.addNotAllowView}
                      updateSource={this.updateSource}
                      showCard={true}
                      hideTypes={[1, 2, 3]}
                    />
                  </div>
                ) : (
                  <div className="Gray_75 Font13 flexRow flowDetailTips mTop15">
                    <i className="icon-task-setting_promet Font16 Gray_9e" />
                    <div className="flex mLeft10">{_l('必须先选择一个对象后，才能设置字段权限')}</div>
                  </div>
                )}
              </Fragment>
            )}
          </Fragment>
        )}
      </Fragment>
    );
  }

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

  /**
   * 渲染tabs
   */
  renderTabs() {
    const { tabIndex } = this.state;
    const TABS = [
      { text: _l('抄送设置'), value: 1 },
      { text: _l('字段设置'), value: 2 },
    ];

    return (
      <div className="mTop25" style={{ borderBottom: '1px solid #ddd' }}>
        {TABS.map(item => {
          return (
            <TABS_ITEM
              key={item.value}
              className={cx('pointerEventsAuto', { active: item.value === tabIndex })}
              onClick={() => this.setState({ tabIndex: item.value })}
            >
              {item.text}
            </TABS_ITEM>
          );
        })}
      </div>
    );
  }

  render() {
    const { data, isNewCC } = this.state;

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
        <DetailFooter
          {...this.props}
          isCorrect={!!data.accounts.length && data.selectNodeId && (!isNewCC || (isNewCC && data.viewId))}
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
