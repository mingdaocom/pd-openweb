import React, { Component } from 'react';
import _ from 'lodash';
import { LoadDiv, SvgIcon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import Icon from 'ming-ui/components/Icon';
import processVersionApi from '../../api/processVersion';
import homeAppApi from 'src/api/homeApp';
import './index.less';

const formatAppOptions = projects =>
  projects.map(project => ({
    label: project.projectName,
    options: (project.projectApps || []).map(app => ({
      label: app.name,
      value: app.id,
      app,
    })),
  }));

const renderAppOption = ({ data }) => (
  <div className="flexRow alignItemsCenter">
    <div
      className="appFilterIcon flexRow alignItemsCenter justifyContentCenter"
      style={{ backgroundColor: data.app.iconColor }}
    >
      <SvgIcon url={data.app.iconUrl} fill="#fff" size={20} addClassName="mTop2" />
    </div>
    <span className="flex ellipsis">{data.label}</span>
  </div>
);

export default class AppFilter extends Component {
  constructor(props) {
    super(props);
    this.state = {
      appOptions: [],
      processGroups: [],
      processLoading: false,
    };
  }
  componentDidMount() {
    this.getAppOptions();
    this.loadAppResources(this.props.apkId);
  }

  componentDidUpdate(prevProps) {
    if (this.props.apkId !== prevProps.apkId) {
      this.loadAppResources(this.props.apkId);
    }
  }
  componentWillUnmount() {
    this.appOptionsRequest?.abort?.();
    this.appOptionsRequest = null;
    this.processListRequest?.abort?.();
    this.processListRequest = null;
  }

  getAppOptions() {
    const request = homeAppApi.getAllHomeApp();
    this.appOptionsRequest = request;

    request.then(
      data => {
        if (this.appOptionsRequest !== request) return;
        this.appOptionsRequest = null;
        this.setState({
          appOptions: formatAppOptions(data.validProject || []),
        });
      },
      () => {
        if (this.appOptionsRequest === request) {
          this.appOptionsRequest = null;
        }
      },
    );
  }
  loadAppResources(apkId) {
    this.processListRequest?.abort?.();
    this.processListRequest = null;

    this.setState({
      processGroups: [],
      processLoading: !!apkId,
    });

    if (!apkId) return;

    this.getWorkflowList(apkId);
  }
  getWorkflowList(apkId) {
    const request = processVersionApi.listAll({ relationId: apkId });
    this.processListRequest = request;

    request.then(
      data => {
        if (this.processListRequest !== request) return;
        this.processListRequest = null;
        this.setState({
          processGroups: data || [],
          processLoading: false,
        });
      },
      () => {
        if (this.processListRequest !== request) return;
        this.processListRequest = null;
        this.setState({
          processGroups: [],
          processLoading: false,
        });
      },
    );
  }
  handleAppChange = apkId => {
    this.props.onChange({ apkId: apkId || '', worksheetId: '', processId: '' });
  };
  handleWorksheetChange = worksheetId => {
    const { apkId } = this.props;
    this.props.onChange({
      apkId,
      worksheetId: worksheetId || '',
      processId: '',
    });
  };
  handleProcessChange = processId => {
    const { apkId, worksheetId } = this.props;
    this.props.onChange({ apkId, worksheetId, processId: processId || '' });
  };
  renderWorksheetList() {
    const { processGroups, processLoading } = this.state;
    const { worksheetId } = this.props;
    const worksheetList = _.uniqBy(
      processGroups.map(item => ({ value: item.groupId, label: item.groupName })),
      'value',
    );

    return (
      <Select
        allowClear
        showPopupSearch
        value={worksheetId || undefined}
        placeholder={_l('请选择工作表')}
        className="w100 mTop16"
        loading={processLoading}
        optionFilterProp="label"
        notFoundContent={processLoading ? <LoadDiv size="small" /> : _l('暂无数据')}
        options={worksheetList}
        onChange={this.handleWorksheetChange}
      />
    );
  }
  renderWorkflowList() {
    const { processGroups, processLoading } = this.state;
    const { worksheetId, processId } = this.props;
    const processList = _.flatten(
      processGroups.filter(item => !worksheetId || item.groupId === worksheetId).map(item => item.processList || []),
    );

    return (
      <div className="mTop16">
        <Select
          allowClear
          showPopupSearch
          optionFilterProp="label"
          value={processId || undefined}
          placeholder={_l('请选择流程')}
          loading={processLoading}
          notFoundContent={
            processLoading ? (
              <LoadDiv size="small" />
            ) : (
              <div className="valignWrapper textTertiary">{_l('暂无数据')}</div>
            )
          }
          className="w100"
          suffixIcon={<Icon icon="expand_more" className="textSecondary Font20" />}
          onChange={this.handleProcessChange}
          options={processList.map(item => ({
            value: item.id,
            label: item.name,
          }))}
        />
      </div>
    );
  }
  render() {
    const { appOptions } = this.state;
    const { apkId } = this.props;

    return (
      <div>
        <div className="Font13 mBottom10">{_l('应用')}</div>
        <Select
          allowClear
          className="w100"
          showPopupSearch
          optionFilterProp="label"
          value={apkId || undefined}
          options={appOptions}
          optionRender={renderAppOption}
          notFoundContent={_l('暂无应用搜索结果')}
          onChange={this.handleAppChange}
        />
        {apkId && this.renderWorksheetList()}
        {apkId && this.renderWorkflowList()}
      </div>
    );
  }
}
