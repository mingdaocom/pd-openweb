import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Select } from 'antd';
import { ActionSheet } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import { PERIODS } from 'worksheet/views/GunterView/config';
import { getSearchData } from 'worksheet/views/util';
import SearchRecord from 'src/pages/worksheet/views/components/SearchRecord';
import { browserIsMobile } from 'src/utils/common';
import Zoom from './Zoom';
import './index.less';

const ToolBarWrap = styled.div(
  ({ isMobile }) => `
  position: absolute;
  bottom: 20px;
  left: ${isMobile ? '16px' : 'auto'};
  right:  ${isMobile ? 'auto' : '20px'};
  background-color: #fff;
  border-radius: 26px;
  height: ${isMobile ? '40px' : '44px'}
  padding:${isMobile ? '0 18px' : '0 22px 0 16px'};
  z-index: 10;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 6px;
  .icon-download:hover {
    color: #1677ff !important;
  }
  .line{
    height: 20px;
    margin: 10px 0 10px 10px;
    border: 1px solid #e8e8e8;
  }
`,
);

const SelectWrap = styled(Select)`
  width: 85px;
  .ant-select-selector {
    padding-left: 0 !important;
  }
  .ant-select-selection-item {
    text-align: center;
    padding-right: 11px !important;
  }
  &.ant-select-single.ant-select-open .ant-select-selection-item {
    color: inherit;
  }
  .ant-select-selection-search-input {
    display: none;
  }
  &:hover {
    .icon-arrow-down {
      color: #1677ff !important;
    }
  }
  &.mobile {
    width: 60px;
    .ant-select-selector {
      padding-left: 0 !important;
    }
  }
`;

@connect(
  state => ({
    ..._.pick(state.sheet, ['base']),
    ..._.pick(state.sheet.gunterView, ['periodType']),
    searchData: browserIsMobile() ? getSearchData(state.sheet) : {},
    mobileViewType: _.get(state.mobile, ['base', 'type']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ToolBar extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
  }

  renderPeriodSelect() {
    const { periodType, changeViewType, isMobile } = this.props;
    return (
      <SelectWrap
        className={cx({ mobile: isMobile })}
        suffixIcon={<Icon className="Font12 Gray_9e" icon="arrow-down" />}
        defaultActiveFirstOption={false}
        defaultOpen={false}
        dropdownClassName="gunterToolBarSelectWrapper"
        value={periodType}
        bordered={false}
        virtual={false}
        onChange={changeViewType}
      >
        {PERIODS.map(item => (
          <Select.Option key={item.value} value={item.value} className="gunterToolBarSelectOptionWrapper">
            {item.name}
          </Select.Option>
        ))}
      </SelectWrap>
    );
  }

  changeMobileViewType = () => {
    const { changeViewType } = this.props;

    this.actionSheetHandler = ActionSheet.show({
      actions: PERIODS.map(item => ({
        key: item.value,
        text: item.name,
      })),
      extra: (
        <div className="flexRow header">
          <span className="Font13 ">{_l('颗粒度')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        const value = (_.find(PERIODS, (v, i) => i === index) || []).value;
        changeViewType(value);
        this.actionSheetHandler.close();
      },
    });
  };
  render() {
    const { searchData, isMobile, mobileViewType, periodType } = this.props;
    const isMobileSingleView = mobileViewType == 'single';

    return (
      <ToolBarWrap isMobile={isMobile} className="flexRow valignWrapper toolBarWrap">
        {isMobile ? (
          <div onClick={this.changeMobileViewType}>
            {(_.find(PERIODS, v => v.value === periodType) || {}).name || _l('展开')}
            <Icon className="Font12 Gray_9e mLeft6" icon="arrow-down" />
          </div>
        ) : (
          this.renderPeriodSelect()
        )}
        {isMobile && <div className="line"></div>}
        <Zoom />
        {isMobile && <div className="line"></div>}
        {isMobile && (
          <SearchRecord
            overlayClassName={isMobileSingleView ? 'singleViewSearchRecordDropdown' : 'mobileSearchRecordDropdown'}
            queryKey={searchData.queryKey}
            data={searchData.data}
            onSearch={record => {
              this.props.updateGunterSearchRecord(record);
            }}
            onClose={() => {
              this.props.updateGunterSearchRecord(null);
            }}
          >
            <Icon className="Gray_75 Font18 pLeft2 mLeft16" icon="search" />
          </SearchRecord>
        )}
        {!isMobile && (
          <Tooltip title={_l('导出为图片')}>
            <Icon
              icon="download"
              className="Gray_75 Font18 mRight14 pointer mLeft24"
              onClick={() => {
                const { base } = this.props;
                window.open(
                  `${window.subPath || ''}/app/${base.appId}/${base.worksheetId}/${base.viewId}/gunterExport`,
                );
              }}
            />
          </Tooltip>
        )}
      </ToolBarWrap>
    );
  }
}
