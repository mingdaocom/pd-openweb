import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import * as actions from 'worksheet/redux/actions/gunterview';
import SearchRecord from 'src/pages/worksheet/views/components/SearchRecord';
import styled from 'styled-components';
import { Select } from 'antd';
import Zoom from './Zoom';
import { PERIODS } from 'worksheet/views/GunterView/config';
import { browserIsMobile } from 'src/util';
import { getSearchData } from 'worksheet/views/util';
import './index.less';

const ToolBarWrap = styled.div(
  ({ isMobile }) => `
  position: absolute;
  bottom: ${isMobile ? 20 : 32}px;
  left: 24px;
  background-color: #fff;
  border-radius: 26px;
  height: 44px;
  padding: 0 22px 0 16px;
  z-index: 10;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  .icon-download:hover {
    color: #2196f3 !important;
  }
`
);

const SelectWrap = styled(Select)`
  width: 70px;
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
      color: #2196f3 !important;
    }
  }
  &.mobile {
    width: 60px;
    .ant-select-selector {
      padding-left: 0 !important;
    }
  }
`;

const isMobile = browserIsMobile();

@connect(
  state => ({
    ..._.pick(state.sheet, ['base']),
    ..._.pick(state.sheet.gunterView, ['periodType']),
    searchData: isMobile ? getSearchData(state.sheet) : null,
  }),
  dispatch => bindActionCreators(actions, dispatch),
)
export default class ToolBar extends Component {
  constructor(props) {
    super(props);
  }
  renderPeriodSelect() {
    const { periodType, changeViewType } = this.props;
    return (
      <SelectWrap
        className={cx({ mobile: isMobile })}
        suffixIcon={(
          <Icon className="Font12 Gray_9e" icon="arrow-down" />
        )}
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
  render() {
    const { searchData } = this.props;
    return (
      <ToolBarWrap isMobile={isMobile} className="flexRow valignWrapper">
        {!isMobile && (
          <Tooltip text={<span>{_l('导出为图片')}</span>}>
            <Icon
              icon="download"
              className="Gray_75 Font18 mRight14 pointer"
              onClick={() => {
                const { base } = this.props;
                window.open(`/app/${base.appId}/${base.worksheetId}/${base.viewId}/gunterExport`);
              }}
            />
          </Tooltip>
        )}
        {this.renderPeriodSelect()}
        <Zoom />
        {isMobile && (
          <SearchRecord
            overlayClassName="mobileSearchRecordDropdown"
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
      </ToolBarWrap>
    );
  }
}
