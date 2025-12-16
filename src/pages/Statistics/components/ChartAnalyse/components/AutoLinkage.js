import React, { Component, Fragment } from 'react';
import store from 'redux/configureStore';
import { Button, Checkbox, ConfigProvider, Modal } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import reportApi from 'statistics/api/report';
import { enumWidgetType } from 'src/pages/customPage/util';

const Con = styled(Modal)`
  .ant-modal-header {
    padding: 20px 24px 10px !important;
  }
  .searchWrap {
    padding: 5px 0;
    border-bottom: 1px solid #f5f5f5;
    margin-bottom: 20px;
    input {
      padding: 3px;
      border: none;
      min-width: 0;
    }
  }
`;

const getReportObject = (components, reports) => {
  return components
    .filter(c => [enumWidgetType.analysis, 'analysis'].includes(c.type))
    .map(c => {
      const objectId = _.get(c, 'config.objectId');
      const data = { objectId };
      // 已经存在的图表
      if (enumWidgetType.analysis === c.type) {
        const report = _.find(reports, { id: c.value }) || {};
        data.name = report.name || c.name;
        data.worksheetId = report.appId;
        data.reportId = report.id;
      }
      // 刚刚创建的图表
      if ('analysis' === c.type) {
        data.name = c.name;
        data.worksheetId = c.worksheetId;
        data.reportId = c.value;
      }
      return data;
    });
};

export default class AutoLinkage extends Component {
  constructor(props) {
    super(props);
    const { customPage } = store.getState();
    this.state = {
      modalVisible: false,
      components: [],
      selectIds: [],
      searchValue: '',
    };
    this.customPage = customPage || {};
  }
  componentDidMount() {
    const { reportId, worksheetInfo, currentReport } = this.props;
    const { autoLinkageChartObjectIds } = currentReport.style;
    reportApi
      .listByPageId({
        appId: this.customPage.pageId,
      })
      .then(data => {
        data = getReportObject(this.customPage.components, data)
          .filter(c => c.reportId !== reportId)
          .filter(c => c.worksheetId === worksheetInfo.worksheetId);
        const filterIds =
          autoLinkageChartObjectIds && autoLinkageChartObjectIds.filter(id => _.find(data, { objectId: id }));
        this.setState({
          components: data,
          selectIds: filterIds ? (filterIds.length === 0 ? [] : filterIds) : data.map(n => n.objectId),
        });
      });
  }
  handleSave = () => {
    const { selectIds, components } = this.state;
    let value = selectIds;
    if (selectIds.length === 0) {
      value = [];
    }
    if (selectIds.length === components.length) {
      value = null;
    }
    this.setState({ modalVisible: false });
    this.props.onChangeStyle({
      autoLinkageChartObjectIds: value,
    });
  };
  renderFooter() {
    return (
      <div className="mTop20 mBottom10 pRight8">
        <ConfigProvider autoInsertSpaceInButton={false}>
          <Button type="link" onClick={() => this.setState({ modalVisible: false })}>
            {_l('取消')}
          </Button>
          <Button type="primary" onClick={this.handleSave}>
            {_l('确认')}
          </Button>
        </ConfigProvider>
      </div>
    );
  }
  renderModal() {
    const { modalVisible, components, selectIds, searchValue } = this.state;
    return (
      <Con
        title={
          <Fragment>
            {_l('选择联动筛选相关组件')}({selectIds.length}/{components.length})
            <Tooltip title={_l('联动筛选指定组件后，将取消自动模式下，使用相同数据集的组件自动关联。')}>
              <Icon className="mLeft5 Gray_9e pointer" icon="info" />
            </Tooltip>
          </Fragment>
        }
        width={480}
        className="chartModal"
        visible={modalVisible}
        centered={true}
        destroyOnClose={true}
        closeIcon={<Icon icon="close" className="Font20 pointer Gray_9e" />}
        footer={this.renderFooter()}
        onCancel={() => this.setState({ modalVisible: false })}
      >
        <div className="searchWrap flexRow alignItemsCenter">
          <Icon className="Gray_9e Font20 mRight5" icon="search" />
          <input
            placeholder={_l('搜索组件名称')}
            className="flex"
            value={searchValue}
            onChange={e => {
              this.setState({ searchValue: e.target.value });
            }}
          />
        </div>
        <Checkbox
          className="mBottom8"
          indeterminate={!!selectIds.length && selectIds.length < components.length}
          checked={selectIds.length === components.length}
          onChange={e => {
            const { checked } = e.target;
            this.setState({
              selectIds: checked ? components.map(n => n.objectId) : [],
            });
          }}
        >
          {_l('全选')}
        </Checkbox>
        {components
          .filter(c => c.name.includes(searchValue))
          .map(c => (
            <div key={c.objectId} className="mBottom8">
              <Checkbox
                checked={selectIds.includes(c.objectId)}
                onChange={e => {
                  const { checked } = e.target;
                  this.setState({
                    selectIds: checked
                      ? selectIds.concat(c.objectId)
                      : selectIds.filter(objectId => c.objectId !== objectId),
                  });
                }}
              >
                {c.name}
              </Checkbox>
            </div>
          ))}
      </Con>
    );
  }
  renderState() {
    const { components } = this.state;
    const { currentReport } = this.props;
    const { config } = this.customPage;
    const { autoLinkageChartObjectIds } = currentReport.style;

    if (autoLinkageChartObjectIds === null) {
      return _l('自动联动');
    }
    if (autoLinkageChartObjectIds) {
      const filterIds = autoLinkageChartObjectIds.filter(id => _.find(components, { objectId: id }));
      return filterIds.length ? `${_l('已设置')} (${filterIds.length}/${components.length})` : _l('未设置');
    }
    return config.autoLinkage ? _l('自动联动') : _l('未设置');
  }
  render() {
    return (
      <Fragment>
        <div
          className="entranceWrap flexRow valignWrapper pointer pLeft10 mBottom10"
          onClick={() => this.setState({ modalVisible: true })}
        >
          {this.renderState()}
        </div>
        {this.renderModal()}
      </Fragment>
    );
  }
}
