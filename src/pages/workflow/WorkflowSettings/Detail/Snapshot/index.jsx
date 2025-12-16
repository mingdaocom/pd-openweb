import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Checkbox, Dropdown, Icon, LoadDiv, Radio, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import flowNode from '../../../api/flowNode';
import SelectStaticChartFromSheet from 'src/pages/widgetConfig/widgetSetting/components/embed/SelectStaticChartFromSheet';
import SelectOtherWorksheetDialog from 'src/pages/worksheet/components/SelectWorksheet/SelectOtherWorksheetDialog';
import { CustomTextarea, DetailFooter, DetailHeader, SpecificFieldsValue } from '../components';

export default class Snapshot extends Component {
  constructor(props) {
    super(props);
    this.state = {
      data: {},
      saveRequest: false,
      showCustomPage: false,
      showStatisticalCharts: false,
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
  getNodeDetail(props) {
    const { processId, selectNodeId, selectNodeType, instanceId } = props;

    flowNode
      .getNodeDetail({ processId, nodeId: selectNodeId, flowNodeType: selectNodeType, instanceId })
      .then(result => {
        result.appDetails = result.appDetails || {};
        result.width = result.width || 1200;
        result.height = result.height || 900;
        result.timeout = result.timeout || 60;

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
    const { name, actionId, appId, width, height, timeout, openSSL } = data;

    if (!appId) {
      alert(
        data.actionId === '1'
          ? _l('必须选择一个自定义页面')
          : data.actionId === '2'
            ? _l('必须选择一个统计图表')
            : _l('必须输入页面地址'),
        2,
      );
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
        actionId,
        name: name.trim(),
        appId,
        width: width || 1200,
        height: height || 900,
        timeout: timeout || 60,
        openSSL,
      })
      .then(result => {
        this.props.updateNodeData(result);
        this.props.closeDetail();
      });

    this.setState({ saveRequest: true });
  };

  /**
   * 渲染空内容
   */
  renderNullContent() {
    const LIST = [
      { text: _l('自定义页面'), value: '1', desc: _l('获取自定义页面的快照图片，供流程中其他节点使用。') },
      { text: _l('统计图表'), value: '2', desc: _l('获取统计图表的快照图片，供流程中其他节点使用。') },
      { text: _l('链接地址'), value: '3', desc: _l('通过链接地址获取页面的快照图片，供流程中其他节点使用。') },
    ];

    return (
      <Fragment>
        <div className="Font13 bold">{_l('页面类型')}</div>
        <ul className="typeList mTop10">
          {LIST.map((item, i) => {
            return (
              <li key={i} onClick={() => this.updateSource({ actionId: item.value, appDetails: {} })}>
                <Radio className="Font16" text={item.text} />
                <div className="Gray_75 Font13 mLeft30 mTop5">{item.desc}</div>
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
    const { data } = this.state;
    const TEXT = {
      1: _l('获取自定义页面的快照图片，供流程中其他节点使用。'),
      2: _l('获取统计图表的快照图片，供流程中其他节点使用。'),
      3: _l('通过链接地址获取页面的快照图片，供流程中其他节点使用。'),
    };
    const list = [
      { text: this.renderTitle('1'), value: '1' },
      { text: this.renderTitle('2'), value: '2' },
      { text: this.renderTitle('3'), value: '3' },
    ];

    return (
      <Fragment>
        <div className="Font14 Gray_75 workflowDetailDesc">{TEXT[data.actionId]}</div>

        <div className="mTop20 bold">{_l('页面类型')}</div>
        <Dropdown
          className="flowDropdown mTop10"
          data={list}
          value={data.actionId}
          border
          renderTitle={() => this.renderTitle(data.actionId)}
          onChange={actionId => this.updateSource({ actionId, appId: '', appDetails: {} })}
        />

        {_.includes(['1', '2'], data.actionId) && (
          <Fragment>
            <div className="mTop20 bold flexRow alignItemsCenter">
              {data.actionId === '1' ? _l('选择自定义页面') : _l('选择统计图表')}
              <span className="mLeft5 red">*</span>
              {data.actionId === '2' && (
                <Tooltip title={_l('快照不能获取已配置按权限访问的图表')} placement="topRight">
                  <span className="mLeft5" style={{ height: 18 }}>
                    <Icon className="Font16 Gray_9e" icon="info" />
                  </span>
                </Tooltip>
              )}
            </div>
            <div
              className="ThemeBorderColor3 actionControlBox pTop0 pBottom0 pLeft10 pRight10 mTop10 ellipsis pointer"
              onClick={() =>
                data.actionId === '1'
                  ? this.setState({ showCustomPage: true })
                  : this.setState({ showStatisticalCharts: true })
              }
            >
              {data.appId ? (
                <span
                  className={cx({
                    errorColor:
                      !data.appDetails.apkName ||
                      !data.appDetails.appName ||
                      (data.actionId === '2' && !data.appDetails.reportName),
                  })}
                >
                  {!data.appDetails.apkName ||
                  !data.appDetails.appName ||
                  (data.actionId === '2' && !data.appDetails.reportName)
                    ? _l('已删除')
                    : data.actionId === '1'
                      ? `${data.appDetails.appName}-${data.appDetails.apkName}`
                      : `${data.appDetails.appName}-${data.appDetails.reportName}(${data.appDetails.apkName})`}
                </span>
              ) : (
                <span className="Gray_75">{_l('请选择')}</span>
              )}
            </div>
          </Fragment>
        )}

        {data.actionId === '3' && (
          <Fragment>
            <div className="mTop20 bold">
              {_l('输入页面地址')}
              <span className="mLeft5 red">*</span>
            </div>
            <div className="mTop5 Gray_75">
              {_l(
                '请输入外部公开页面的完整URL地址。注意：无法获取需要登录的页面，且外部页面可能无法完整捕捉或可能出错，建议使用前进行简单的测试。',
              )}
            </div>
            <div className="mTop10">
              <CustomTextarea
                projectId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                type={2}
                height={0}
                content={data.appId}
                formulaMap={data.formulaMap}
                onChange={(err, value) => this.updateSource({ appId: value })}
                updateSource={this.updateSource}
              />
            </div>
          </Fragment>
        )}

        <div className="mTop20 bold">{_l('页面宽度')}</div>
        <div className="mTop10">
          <SpecificFieldsValue
            projectId={this.props.companyId}
            processId={this.props.processId}
            relationId={this.props.relationId}
            selectNodeId={this.props.selectNodeId}
            type="number"
            hasOtherField={false}
            allowedEmpty
            data={{ fieldValue: data.width }}
            updateSource={({ fieldValue }) => this.updateSource({ width: fieldValue })}
          />
        </div>

        {data.actionId !== '1' && (
          <Fragment>
            <div className="mTop20 bold">{_l('页面高度')}</div>
            <div className="mTop10">
              <SpecificFieldsValue
                projectId={this.props.companyId}
                processId={this.props.processId}
                relationId={this.props.relationId}
                selectNodeId={this.props.selectNodeId}
                type="number"
                hasOtherField={false}
                allowedEmpty
                data={{ fieldValue: data.height }}
                updateSource={({ fieldValue }) => this.updateSource({ height: fieldValue })}
              />
            </div>
          </Fragment>
        )}

        <div className="mTop20 bold">{_l('等待时长')}</div>
        <div className="mTop5 Gray_75">
          {_l('等待页面加载一段时间后再开始截图。当截取页面未完全加载时，可适当延长时间。单位秒，默认60秒。')}
        </div>
        <div className="mTop10">
          <SpecificFieldsValue
            projectId={this.props.companyId}
            processId={this.props.processId}
            relationId={this.props.relationId}
            selectNodeId={this.props.selectNodeId}
            type="number"
            hasOtherField={false}
            allowedEmpty
            data={{ fieldValue: data.timeout }}
            updateSource={({ fieldValue }) => this.updateSource({ timeout: fieldValue })}
          />
        </div>

        <div className="mTop20 bold">{_l('验证')}</div>
        <div className="mTop5">
          <Checkbox
            checked={data.openSSL}
            text={_l('开启SSL证书验证')}
            onClick={checked => this.updateSource({ openSSL: !checked })}
          />
        </div>
      </Fragment>
    );
  }

  /**
   * dropdown title
   */
  renderTitle(actionId) {
    const TYPES = {
      1: { icon: 'icon-dashboard', text: _l('自定义页面') },
      2: { icon: 'icon-worksheet_column_chart', text: _l('统计图表') },
      3: { icon: 'icon-link1', text: _l('链接地址') },
    };

    return (
      <Fragment>
        <span className={cx('Font16 Gray_75', TYPES[actionId].icon)} />
        <span className="Font14 mLeft10">{TYPES[actionId].text}</span>
      </Fragment>
    );
  }

  render() {
    const { data, showCustomPage, showStatisticalCharts } = this.state;

    if (_.isEmpty(data)) {
      return <LoadDiv className="mTop15" />;
    }

    return (
      <Fragment>
        <DetailHeader
          {...this.props}
          data={{ ...data }}
          icon="icon-camera_alt"
          bg="BGBlueAsh"
          updateSource={this.updateSource}
        />
        <div className="flex overflowHidden">
          <ScrollView>
            <div className="workflowDetailBox">{data.actionId ? this.renderContent() : this.renderNullContent()}</div>
          </ScrollView>
        </div>
        <DetailFooter {...this.props} isCorrect={data.appId} onSave={this.onSave} />

        {showCustomPage && (
          <SelectOtherWorksheetDialog
            projectId={this.props.companyId}
            title={_l('选择自定义页面')}
            worksheetType={1}
            selectedAppId={data.appDetails.apkId || this.props.relationId}
            selectedWorksheetId={data.appId}
            visible
            onOk={(selectedAppId, worksheetId, obj) => {
              this.updateSource({
                appId: worksheetId,
                appDetails: {
                  apkId: selectedAppId,
                  apkName: obj.appName,
                  appId: worksheetId,
                  appName: obj.workSheetName,
                },
              });
              this.setState({ showCustomPage: false });
            }}
            onHide={() => this.setState({ showCustomPage: false })}
          />
        )}

        {showStatisticalCharts && (
          <SelectStaticChartFromSheet
            projectId={this.props.companyId}
            appId={data.appDetails.apkId || this.props.relationId}
            sheetId={data.appDetails.appId}
            reportId={data.appId}
            onOk={obj => {
              this.updateSource({
                appId: obj.reportId,
                appDetails: {
                  apkId: obj.appId,
                  apkName: obj.appName,
                  appId: obj.sheetId,
                  appName: obj.sheetName,
                  reportId: obj.reportId,
                  reportName: obj.reportName,
                },
              });
              this.setState({ showStatisticalCharts: false });
            }}
            onCancel={() => this.setState({ showStatisticalCharts: false })}
          />
        )}
      </Fragment>
    );
  }
}
