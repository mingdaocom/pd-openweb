import React, { Component, Fragment } from 'react';
import { ScrollView, Dropdown, LoadDiv, Radio } from 'ming-ui';
import cx from 'classnames';
import flowNode from '../../../api/flowNode';
import { DetailHeader, DetailFooter, CustomTextarea, SelectNodeObject } from '../components';
import { PUSH_TYPE, PUSH_LIST } from '../../enum';
import worksheet from 'src/api/worksheet';
import homeApp from 'src/api/homeApp';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';

export default class Push extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      currentAppList: [],
      otherAppName: '',
      worksheetInfo: null,
      showOtherWorksheet: false,
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

      // 获取工作表详情
      if (result.appId) {
        this.getWorksheetInfo(result.appId);
      }

      if (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], result.pushType)) {
        this.getWorksheetsByAppId();
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
    const { name, pushType, openMode, selectNodeId, viewId, content, appId } = data;

    if (_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.LINK], pushType) && !content.trim()) {
      alert(pushType === PUSH_TYPE.ALERT ? _l('提示内容不允许为空') : _l('链接不允许为空'), 2);
      return;
    }

    if (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], pushType) && !appId) {
      alert(pushType === PUSH_TYPE.PAGE ? _l('自定义页面不允许为空') : _l('工作表不允许为空'), 2);
      return;
    }

    if (pushType === PUSH_TYPE.DETAIL && !selectNodeId) {
      alert(_l('记录不允许为空'), 2);
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
        pushType,
        openMode,
        appId,
        selectNodeId,
        viewId,
        content,
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
   * 获取应用详情
   */
  getAppDetail(appId) {
    homeApp.getAppDetail({ appId }).then(result => {
      this.setState({ otherAppName: result.name });
    });
  }

  /**
   * 获取工作表详情
   */
  getWorksheetInfo(worksheetId) {
    const { relationId } = this.props;
    const { data, otherAppName } = this.state;
    let ajax;

    if (data.pushType === PUSH_TYPE.PAGE) {
      ajax = homeApp.getPageInfo({ id: worksheetId });
    } else {
      ajax = worksheet.getWorksheetInfo({ worksheetId, getViews: true });
    }

    ajax.then(data => {
      if (data.resultCode === 1) {
        this.setState({ worksheetInfo: data });
        if (data.appId !== relationId && otherAppName === '') {
          this.getAppDetail(data.appId);
        }
      } else {
        this.setState({ worksheetInfo: {} });
      }
    });
  }

  /**
   * 渲染文本内容
   */
  renderTextContent() {
    const { data } = this.state;
    const isAlert = data.pushType === PUSH_TYPE.ALERT;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">
          {isAlert ? _l('提示内容') : _l('链接')}
          <span className="mLeft5 red">*</span>
        </div>
        <CustomTextarea
          className="minH100"
          processId={this.props.processId}
          selectNodeId={this.props.selectNodeId}
          type={2}
          content={data.content}
          formulaMap={data.formulaMap}
          onChange={(err, value, obj) => this.updateSource({ content: value })}
          updateSource={this.updateSource}
        />
      </Fragment>
    );
  }

  /**
   * 渲染选择表
   */
  renderSelectSheet() {
    const { data, currentAppList, worksheetInfo, otherAppName } = this.state;
    const isCustomPage = data.pushType === PUSH_TYPE.PAGE;
    const otherWorksheet = [
      {
        text: isCustomPage ? _l('其它应用下的自定义页面') : _l('其它应用下的工作表'),
        value: 'other',
        className: 'Gray_75',
      },
    ];

    return (
      <Fragment>
        <div className="Font13 bold mTop20">
          {isCustomPage ? _l('自定义页面') : _l('工作表')}
          <span className="mLeft5 red">*</span>
        </div>
        <Dropdown
          className={cx('flowDropdown mTop10', {
            'errorBorder errorBG': data.appId && worksheetInfo !== null && _.isEmpty(worksheetInfo),
          })}
          data={[currentAppList.filter(item => item.type === (isCustomPage ? 1 : 0)), otherWorksheet]}
          value={data.appId}
          renderTitle={
            !data.appId || worksheetInfo === null
              ? () => <span className="Gray_9e">{_l('请选择')}</span>
              : data.appId && _.isEmpty(worksheetInfo)
              ? () => (
                  <span className="errorColor">
                    {isCustomPage ? _l('自定义页面无效或已删除') : _l('工作表无效或已删除')}
                  </span>
                )
              : () => (
                  <Fragment>
                    <span>{worksheetInfo.name}</span>
                    {otherAppName && <span className="Gray_9e">（{otherAppName}）</span>}
                  </Fragment>
                )
          }
          border
          openSearch
          onChange={appId => {
            if (appId === 'other') {
              this.setState({ showOtherWorksheet: true });
            } else {
              this.switchWorksheet(appId);
            }
          }}
        />
      </Fragment>
    );
  }

  /**
   * 渲染视图
   */
  renderView() {
    const { data, worksheetInfo } = this.state;

    if (!worksheetInfo || _.isEmpty(worksheetInfo) || worksheetInfo.worksheetId !== data.appId) {
      return null;
    }

    const views = worksheetInfo.views.map(o => ({
      text: o.name,
      value: o.viewId,
      className: data.viewId === o.viewId ? 'ThemeColor3' : '',
    }));
    const selectView = _.find(views, o => o.value === data.viewId);

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('视图')}</div>
        <div className="Font13 Gray_9e mTop5">
          {_l('按照所选视图配置的显示字段发送，如果操作者被分发了此视图，可以直接按权限编辑记录、执行自定义动作')}
        </div>
        <Dropdown
          className={cx('flowDropdown mTop10', {
            'errorBorder errorBG': data.viewId && !selectView,
          })}
          data={views}
          value={data.viewId}
          renderTitle={
            !data.viewId
              ? () => <span className="Gray_9e">{_l('请选择')}</span>
              : data.viewId && !selectView
              ? () => <span className="errorColor">{_l('视图无效或已删除')}</span>
              : () => <span>{selectView.text}</span>
          }
          border
          onChange={viewId => this.updateSource({ viewId })}
        />
      </Fragment>
    );
  }

  /**
   * 渲染打开详情页面
   */
  renderOpenDetail() {
    const { data } = this.state;

    return (
      <Fragment>
        <div className="Font13 bold mTop20">
          {_l('记录')}
          <span className="mLeft5 red">*</span>
        </div>
        <SelectNodeObject
          smallBorder={true}
          appList={data.appList}
          selectNodeId={data.selectNodeId}
          selectNodeObj={data.selectNodeObj}
          onChange={selectNodeId => {
            const selectNodeObj = _.find(data.appList, item => item.nodeId === selectNodeId);
            this.updateSource({ selectNodeId, selectNodeObj }, () => this.switchWorksheet(selectNodeObj.appId));
          }}
        />
      </Fragment>
    );
  }

  /**
   * 渲染打开方式
   */
  renderOpenType() {
    const { data } = this.state;
    const type = [
      { text: _l('刷新当前页面'), value: 1 },
      { text: _l('弹层'), value: 3 },
      { text: _l('打开新页面'), value: 2 },
      { text: _l('推送模态窗口'), value: 4 },
    ];
    const isRemove = value => {
      switch (data.pushType) {
        case PUSH_TYPE.DETAIL:
          return _.includes([1, 4], value);
        case PUSH_TYPE.VIEW:
        case PUSH_TYPE.PAGE:
          return _.includes([3, 4], value);
        case PUSH_TYPE.LINK:
          return _.includes([3], value);
      }
    };

    _.remove(type, item => isRemove(item.value));

    return (
      <Fragment>
        <div className="Font13 bold mTop20">{_l('打开方式')}</div>
        {type.map(item => {
          return (
            <div className="mTop15" key={item.value}>
              <Radio
                text={item.text}
                checked={item.value === data.openMode}
                onClick={() => this.updateSource({ openMode: item.value })}
              />
            </div>
          );
        })}
      </Fragment>
    );
  }

  /**
   * 切换工作表
   */
  switchWorksheet = (appId, name, otherApkId = '', otherApkName = '') => {
    this.setState({ otherAppName: otherApkId ? otherApkName : null });
    this.updateSource({ appId, viewId: '' }, () => this.getWorksheetInfo(appId));
  };

  render() {
    const { isPBCProcess } = this.props;
    const { data, showOtherWorksheet, currentAppList } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    const pushList = _.cloneDeep(PUSH_LIST);
    pushList.forEach(item => {
      if (item.value === data.pushType) {
        item.className = 'ThemeColor3';
      }
    });

    return (
      <Fragment>
        <DetailHeader
          data={{ ...data, selectNodeType: this.props.selectNodeType }}
          icon="icon-notifications_11"
          bg="BGBlue"
          closeDetail={this.props.closeDetail}
          updateSource={this.updateSource}
        />
        <div className="flex mTop20">
          <ScrollView>
            <div className="workflowDetailBox">
              <div className="Font14 Gray_75 workflowDetailDesc">
                {isPBCProcess &&
                  _l('仅通过自定义页面上的按钮调用的PBP支持界面推送功能（通过API和工作流调用时此节点无法生效）。')}
                {_l(
                  '触发按钮后，直接推送指定内容给按钮操作者。不能是一个延时反馈（该节点与触发器之间不能有延时、人工和子流程节点）如果流程执行中触发了多个界面推送节点，只生效第一个',
                )}
              </div>
              <div className="Font13 bold mTop20">{_l('推送内容')}</div>
              <Dropdown
                className="flowDropdown mTop10"
                data={pushList}
                value={data.pushType}
                border
                onChange={pushType => {
                  this.setState({ worksheetInfo: null });
                  this.updateSource({ pushType, openMode: 2, appId: '', content: '', viewId: '' });
                  if (
                    (pushType === PUSH_TYPE.CREATE || pushType === PUSH_TYPE.VIEW || pushType === PUSH_TYPE.PAGE) &&
                    !currentAppList.length
                  ) {
                    this.getWorksheetsByAppId();
                  }
                }}
              />

              {_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.LINK], data.pushType) && this.renderTextContent()}

              {_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], data.pushType) &&
                this.renderSelectSheet()}

              {data.pushType === PUSH_TYPE.DETAIL && this.renderOpenDetail()}

              {_.includes([PUSH_TYPE.VIEW, PUSH_TYPE.DETAIL], data.pushType) && this.renderView()}

              {!_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.CREATE], data.pushType) && this.renderOpenType()}
            </div>
          </ScrollView>
        </div>
        <DetailFooter
          isCorrect={
            (_.includes([PUSH_TYPE.ALERT, PUSH_TYPE.LINK], data.pushType) && data.content.trim()) ||
            (_.includes([PUSH_TYPE.CREATE, PUSH_TYPE.VIEW, PUSH_TYPE.PAGE], data.pushType) && data.appId) ||
            (data.pushType === PUSH_TYPE.DETAIL && data.selectNodeId)
          }
          onSave={this.onSave}
          closeDetail={this.props.closeDetail}
        />

        {showOtherWorksheet && (
          <SelectOtherWorksheetDialog
            projectId={this.props.companyId}
            worksheetType={data.pushType === PUSH_TYPE.PAGE ? 1 : 0}
            selectedAppId={this.props.relationId}
            selectedWrorkesheetId={data.appId}
            visible
            onOk={(selectedAppId, selectedWrorkesheetId, obj) => {
              const isCurrentApp = this.props.relationId === selectedAppId;
              this.switchWorksheet(
                selectedWrorkesheetId,
                obj.workSheetName,
                !isCurrentApp && selectedAppId,
                !isCurrentApp && obj.appName,
              );
            }}
            onHide={() => this.setState({ showOtherWorksheet: false })}
          />
        )}
      </Fragment>
    );
  }
}
