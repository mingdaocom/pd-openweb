import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dropdown, LoadDiv, Radio, ScrollView } from 'ming-ui';
import flowNode from '../../../api/flowNode';
import homeApp from 'src/api/homeApp';
import { ACTION_ID, APP_TYPE, PUSH_LIST, PUSH_TYPE } from '../../enum';
import {
  CustomTextarea,
  DetailFooter,
  DetailHeader,
  Member,
  PromptSound,
  SelectUserDropDown,
  SingleControlValue,
  SpecificFieldsValue,
} from '../components';
import OpenActionContent from './OpenActionContent';

const MsgTypeBtn = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 36px;
  border: 1px solid #ddd;
  opacity: 1;
  border-radius: 3px;
  padding: 0 20px 0 15px;
  margin-right: 10px;
  cursor: pointer;
  &.active {
    position: relative;
    border-color: #1677ff;
    &::before {
      position: absolute;
      right: -8px;
      top: -8px;
      border-style: solid;
      border-width: 8px;
      border-color: #1677ff transparent transparent transparent;
      content: '';
      transform: rotateZ(-135deg);
    }
  }
  i {
    font-size: 20px;
    margin-right: 5px;
  }
`;

const BtnContent = styled.div`
  margin-top: 30px;
  border: 1px solid #ddd;
  border-radius: 4px;
  padding: 20px;
  position: relative;
  .workflowMessageTitle {
    position: absolute;
    top: -10px;
    left: 18px;
    background: #fff;
    padding: 0 3px;
  }
  .workflowMessageDelete {
    position: absolute;
    top: -9px;
    right: 18px;
    background: #fff;
    padding: 0 3px;
    font-size: 16px;
    color: #bdbdbd;
    cursor: pointer;
    &:hover {
      color: #1677ff;
    }
  }
  .Font13.bold {
    font-weight: normal;
  }
  .workflowOpenModeBox {
    display: flex;
    > div {
      margin-right: 50px;
    }
  }
`;

export default class Push extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      currentAppList: [],
      isCustomAccount: false,
      showSelectUserDialog: false,
    };
  }

  componentDidMount() {
    this.getNodeDetail(this.props);
  }

  componentWillReceiveProps(nextProps) {
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
  getNodeDetail(props, { appId, actionId } = {}) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;
    const { currentAppList } = this.state;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId, appId, actionId })
      .then(result => {
        if (result.pushType === PUSH_TYPE.AUDIO && result.promptSound.type === 0) {
          result.promptSound.type = 1;
        }

        this.setState({ data: result, isCustomAccount: !!result.accounts.length });
        !instanceId && !currentAppList.length && result.pushType !== PUSH_TYPE.AUDIO && this.getWorksheetsByAppId();
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
   * 更新按钮数据
   */
  updateButtonSource(obj, index, callback = () => {}) {
    const { data } = this.state;
    const buttons = data.buttons;

    buttons[index] = Object.assign({}, buttons[index], obj);
    this.updateSource(buttons, callback);
  }

  /**
   * 检查是否报错
   */
  checkHasError({ pushType, content, appId, selectNodeId, title, viewId }) {
    if (_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.LINK], pushType) && !content.trim()) {
      alert(pushType === PUSH_TYPE.ALERT ? _l('提示内容不允许为空') : _l('链接不允许为空'), 2);
      return true;
    }

    if (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], pushType) && !appId) {
      alert(pushType === PUSH_TYPE.PAGE ? _l('自定义页面不允许为空') : _l('工作表不允许为空'), 2);
      return true;
    }

    if (pushType === PUSH_TYPE.VIEW && !viewId) {
      alert(_l('视图不允许为空'), 2);
      return true;
    }

    if (pushType === PUSH_TYPE.DETAIL && !selectNodeId) {
      alert(_l('记录不允许为空'), 2);
      return true;
    }

    if (pushType === PUSH_TYPE.NOTIFICATION && !(title || '').trim()) {
      alert(_l('标题不允许为空'), 2);
      return true;
    }

    return false;
  }

  /**
   * 保存
   */
  onSave = () => {
    const { data, saveRequest } = this.state;
    const {
      name,
      promptType,
      pushType,
      openMode,
      selectNodeId,
      viewId,
      content,
      appId,
      duration,
      title,
      buttons,
      actionId,
      fields,
      promptSound,
      accounts,
    } = data;

    let hasError = false;

    (buttons || []).forEach(button => {
      if (this.checkHasError(button)) {
        hasError = true;
      }
    });

    if (this.checkHasError(data) || hasError) {
      return;
    }

    if (pushType === PUSH_TYPE.AUDIO && promptSound.type === 2 && !promptSound.content) {
      alert('内容不允许为空', 2);
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
        promptType,
        pushType,
        openMode,
        appId,
        selectNodeId,
        viewId,
        content,
        duration,
        title,
        buttons,
        actionId,
        fields: actionId === ACTION_ID.CREATE_RECORD ? fields : [],
        promptSound,
        accounts,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 获取本应用下的列表
   */
  getWorksheetsByAppId() {
    const { relationId } = this.props;

    homeApp.getWorksheetsByAppId({ appId: relationId }).then(result => {
      this.setState({
        currentAppList: result.map(({ workSheetName, workSheetId, type }) => ({
          text: workSheetName,
          value: workSheetId,
          type,
        })),
      });
    });
  }

  /**
   * 渲染空内容
   */
  renderNullContent() {
    const noticeList = [
      { text: _l('弹出提示'), value: PUSH_TYPE.ALERT, desc: _l('在顶部显示并自动消失。用于一句话的简短提示') },
      {
        text: _l('卡片通知'),
        value: PUSH_TYPE.NOTIFICATION,
        desc: _l('在底部显示并可设为不自动消失。可包含标题、描述、按钮，适合较多文字或带有操作的通知'),
      },
    ];

    return (
      <Fragment>
        <div className="Font13 bold">{_l('通知')}</div>
        <ul className="typeList mTop10">
          {noticeList.map((item, i) => {
            return (
              <li key={i} onClick={() => this.updateSource({ pushType: item.value })}>
                <Radio className="Font16" text={item.text} />
                <div className="Gray_75 Font13 mLeft30 mTop5">{item.desc}</div>
              </li>
            );
          })}
        </ul>

        <div className="Font13 bold mTop20">{_l('事件')}</div>
        <ul className="typeList">
          {PUSH_LIST.filter(o => !_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.NOTIFICATION], o.value)).map((item, i) => {
            return (
              <li
                key={i}
                className="pTop4 pBottom4"
                onClick={() => this.updateSource({ pushType: item.value, openMode: 2 })}
              >
                <Radio className="Font16" text={item.text} />
              </li>
            );
          })}
        </ul>
      </Fragment>
    );
  }

  /**
   * 渲染内容
   */
  renderContent() {
    const { flowInfo } = this.props;
    const { data, currentAppList, isCustomAccount, showSelectUserDialog } = this.state;
    const PUSH_ACCOUNTS = [
      { text: _l('触发者'), value: false },
      { text: _l('自定义'), value: true },
    ];

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">
          {flowInfo.startAppType === APP_TYPE.PBC &&
            !flowInfo.child &&
            _l('仅通过自定义页面上的按钮调用的PBP支持界面推送功能（通过API和工作流调用时此节点无法生效）。')}
          {data.pushType === PUSH_TYPE.ALERT
            ? _l('在顶部显示并自动消失。用于一句话的简短提示')
            : data.pushType === PUSH_TYPE.NOTIFICATION
              ? _l('在底部显示并可设为不自动消失。可包含标题、描述、按钮，适合较多文字或带有操作的通知')
              : _l(
                  '触发按钮后，直接推送指定内容给按钮操作者。不能是一个延时反馈（该节点与触发器之间不能有延时、人工和子流程节点）如果流程执行中触发了多个界面推送节点，只生效第一个',
                )}
        </div>

        <div className="Font13 bold mTop20">{_l('推送内容')}</div>
        {this.renderEventList(data.pushType)}

        {_.includes([PUSH_TYPE.NOTIFICATION], data.pushType) && (
          <Fragment>
            <div className="Font13 bold mTop20">{_l('推送人')}</div>
            <div className="flexRow mTop10">
              {PUSH_ACCOUNTS.map((item, index) => {
                return (
                  <Radio
                    key={index}
                    className="mRight60"
                    checked={item.value === isCustomAccount}
                    text={item.text}
                    onClick={() => {
                      this.setState({ isCustomAccount: item.value });
                      this.updateSource({ accounts: [] });
                    }}
                  />
                );
              })}
            </div>

            {isCustomAccount && (
              <Fragment>
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
                  {_l('添加推送人')}
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
              </Fragment>
            )}
          </Fragment>
        )}

        {data.pushType === PUSH_TYPE.ALERT && (
          <Fragment>
            {this.renderMessageType()}
            <div className="Font13 bold mTop20">
              {_l('描述')}
              <span className="mLeft5 red">*</span>
            </div>
            {this.renderTextContent()}
            {this.renderDurationContent()}
          </Fragment>
        )}

        {data.pushType === PUSH_TYPE.NOTIFICATION && (
          <Fragment>
            {this.renderMessageType()}
            <div className="Font13 bold mTop20">
              {_l('标题')}
              <span className="mLeft5 red">*</span>
            </div>
            {this.renderTextContent('title')}

            <div className="Font13 bold mTop20">{_l('描述')}</div>
            {this.renderTextContent()}

            {this.renderDurationContent()}

            <div className="Font13 bold mTop20">{_l('卡片按钮')}</div>

            {(data.buttons || []).map((button, index) => {
              return (
                <BtnContent>
                  <div className="workflowMessageTitle">{_l('按钮%0', index + 1)}</div>
                  <i
                    className="icon-trash workflowMessageDelete"
                    onClick={() => {
                      this.updateSource({ buttons: data.buttons.filter((o, i) => i !== index) });
                    }}
                  />

                  <div>{_l('名称')}</div>
                  <div className="mTop10 flexRow">
                    <input
                      type="text"
                      className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 flex"
                      value={button.name}
                      onChange={evt => this.updateButtonSource({ name: evt.target.value }, index)}
                      onBlur={evt => this.updateButtonSource({ name: evt.target.value.trim() || _l('按钮') }, index)}
                    />
                  </div>

                  <div className="mTop20">{_l('事件')}</div>
                  {this.renderEventList(button.pushType, index)}

                  <OpenActionContent
                    {...this.props}
                    data={button}
                    currentAppList={currentAppList}
                    flowNodeList={data.flowNodeList}
                    formulaMap={data.formulaMap}
                    switchWorksheet={obj => this.switchWorksheet(obj, index)}
                    updateSource={(obj, callback) => this.updateButtonSource(obj, index, callback)}
                    updateRootSource={this.updateSource}
                  />
                </BtnContent>
              );
            })}

            {(data.buttons || []).length < 2 && (
              <div className="addActionBtn mTop25">
                <span
                  className="ThemeBorderColor3"
                  onClick={() =>
                    this.updateSource({
                      buttons: (data.buttons || []).concat({
                        name: _l('按钮'),
                        pushType: 3,
                        openMode: 2,
                        appId: '',
                        selectNodeId: '',
                        viewId: '',
                        content: '',
                      }),
                    })
                  }
                >
                  <i className="icon-add Font16" />
                  {_l('添加按钮')}
                </span>
              </div>
            )}
          </Fragment>
        )}

        <OpenActionContent
          {...this.props}
          data={data}
          currentAppList={currentAppList}
          flowNodeList={data.flowNodeList}
          formulaMap={data.formulaMap}
          switchWorksheet={this.switchWorksheet}
          updateSource={this.updateSource}
          updateRootSource={this.updateSource}
        />

        {data.pushType === PUSH_TYPE.CREATE && (
          <Fragment>
            <div className="mTop15">
              <Checkbox
                text={_l('创建草稿记录')}
                checked={data.actionId === ACTION_ID.CREATE_RECORD}
                onClick={checked => {
                  if (!checked) {
                    this.getNodeDetail(this.props, { appId: data.appId, actionId: ACTION_ID.CREATE_RECORD });
                  } else {
                    this.updateSource({ actionId: '' });
                  }
                }}
              />
            </div>

            {data.actionId === ACTION_ID.CREATE_RECORD &&
              data.fields.map((item, i) => {
                const singleObj = _.find(data.controls, obj => obj.controlId === item.fieldId) || {};

                return (
                  <div key={item.fieldId} className="relative">
                    <div className="flexRow alignItemsCenter mTop15">
                      <div className="ellipsis Font13 flex mRight20">{singleObj.controlName}</div>
                    </div>
                    <SingleControlValue
                      companyId={this.props.companyId}
                      relationId={this.props.relationId}
                      processId={this.props.processId}
                      selectNodeId={this.props.selectNodeId}
                      sourceNodeId={data.selectNodeId}
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
        )}
      </Fragment>
    );
  }

  /**
   * 渲染事件列表
   */
  renderEventList(pushType, buttonIndex) {
    const pushList = _.cloneDeep(PUSH_LIST);

    if (buttonIndex !== undefined) {
      _.remove(pushList, o => _.includes([1, 7], o.value));
    }

    pushList.forEach(item => {
      if (item.value === pushType) {
        item.className = 'ThemeColor3';
      }
    });

    return (
      <Dropdown
        className="flowDropdown mTop10"
        data={pushList}
        value={pushType}
        border
        onChange={pushType => {
          const obj = {
            pushType,
            openMode: 2,
            appId: '',
            content: '',
            viewId: '',
            selectNodeId: '',
            duration: 5,
            accounts: [],
          };

          if (buttonIndex === undefined) {
            this.updateSource(Object.assign(obj, { promptType: 1, buttons: [] }));
          } else {
            this.updateButtonSource(obj, buttonIndex);
          }
        }}
      />
    );
  }

  /**
   * 渲染提示类型
   */
  renderMessageType() {
    const { data } = this.state;
    const list = [
      { text: _l('成功'), value: 1, color: '#4CAF50', icon: 'icon-check_circle' },
      { text: _l('失败'), value: 2, color: '#F44336', icon: 'icon-cancel' },
      { text: _l('警告'), value: 3, color: '#FFBA00', icon: 'icon-error1' },
      { text: _l('通知'), value: 4, color: '#1677ff', icon: 'icon-info' },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('提示类型')}</div>
        <div className="flexRow mTop15">
          {list.map(item => {
            return (
              <MsgTypeBtn
                key={item.value}
                className={cx({ active: data.promptType === item.value })}
                onClick={() => this.updateSource({ promptType: item.value })}
              >
                <i className={item.icon} style={{ color: item.color }} />
                {item.text}
              </MsgTypeBtn>
            );
          })}
        </div>
      </Fragment>
    );
  }

  /**
   * 渲染文本内容
   */
  renderTextContent(key = 'content') {
    const { data } = this.state;
    const height = key === 'title' ? { height: 0 } : {};

    return (
      <CustomTextarea
        className={cx({ minH100: key !== 'title' })}
        projectId={this.props.companyId}
        processId={this.props.processId}
        relationId={this.props.relationId}
        selectNodeId={this.props.selectNodeId}
        type={2}
        {...height}
        content={data[key]}
        formulaMap={data.formulaMap}
        onChange={(err, value) => this.updateSource({ [key]: value })}
        updateSource={this.updateSource}
      />
    );
  }

  /**
   * 渲染消失时间
   */
  renderDurationContent() {
    const { data } = this.state;
    const list = [
      { text: _l('指定时间后'), value: 1 },
      { text: _l('永不，需要手动关闭'), value: 2 },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('自动消失')}</div>

        {data.pushType === PUSH_TYPE.NOTIFICATION && (
          <div className="flexRow mTop10">
            {list.map(item => {
              return (
                <Radio
                  key={item.value}
                  className={cx({ mLeft50: item.value === 2 })}
                  checked={(data.duration > 0 && item.value === 1) || (data.duration === 0 && item.value === 2)}
                  text={item.text}
                  onClick={() => {
                    if (item.value === 2) {
                      this.updateSource({ duration: 0 });
                    } else if (item.value === 1 && data.duration === 0) {
                      this.updateSource({ duration: 5 });
                    }
                  }}
                />
              );
            })}
          </div>
        )}

        {(data.duration !== 0 || data.pushType === PUSH_TYPE.ALERT) && (
          <div className="flexRow mTop10 alignItemsCenter">
            <div className="flex">
              <SpecificFieldsValue
                updateSource={({ fieldValue }) => this.updateSource({ duration: fieldValue })}
                type="number"
                min={1}
                max={10}
                allowedEmpty
                hasOtherField={false}
                data={{ fieldValue: data.duration }}
              />
            </div>
            <div className="mLeft10">{_l('秒')}</div>
          </div>
        )}
      </Fragment>
    );
  }

  /**
   * 切换工作表
   */
  switchWorksheet = (appId, index) => {
    if (index === undefined) {
      this.updateSource({ appId, viewId: '', actionId: '' });
    } else {
      this.updateButtonSource({ appId, viewId: '' }, index);
    }
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
          icon={data.pushType === PUSH_TYPE.AUDIO ? 'icon-volume_up' : 'icon-interface_push'}
          bg="BGBlue"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">
              {data.pushType === PUSH_TYPE.AUDIO ? (
                <PromptSound
                  {...this.props}
                  promptSound={data.promptSound}
                  formulaMap={data.formulaMap}
                  updateSource={this.updateSource}
                />
              ) : data.pushType ? (
                this.renderContent()
              ) : (
                this.renderNullContent()
              )}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          {...this.props}
          isCorrect={
            (_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.LINK], data.pushType) && data.content.trim()) ||
            (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], data.pushType) && data.appId) ||
            (data.pushType === PUSH_TYPE.DETAIL && data.selectNodeId) ||
            (data.pushType === PUSH_TYPE.NOTIFICATION && (data.title || '').trim()) ||
            data.pushType === PUSH_TYPE.AUDIO
          }
          onSave={this.onSave}
        />
      </Fragment>
    );
  }
}
