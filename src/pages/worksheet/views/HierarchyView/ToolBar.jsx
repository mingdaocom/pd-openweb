import React, { Component } from 'react';
import { string, number, func } from 'prop-types';
import styled, { css } from 'styled-components';
import cx from 'classnames';
import { Icon, Tooltip } from 'ming-ui';
import { Select } from 'antd';
import { FlexCenter } from 'worksheet/styled';
import { getItem, setItem } from './util';
import { browserIsMobile } from 'src/util';
import SearchRecord from 'src/pages/worksheet/views/components/SearchRecord';
import 'src/pages/worksheet/views/GunterView/Chart/components/ToolBar/index.less';

const SCALE_LIMIT = {
  min: 50,
  max: 100,
};

const ToolBarWrap = styled(FlexCenter)`
  position: absolute;
  bottom: 32px;
  left: 24px;
  background-color: #fff;
  border-radius: 26px;
  height: 44px;
  padding: 0 22px 0 16px;
  z-index: 9;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.16);
  ${props =>
    props.browserIsMobile &&
    css`
      left: 0;
      bottom: 20px;
      margin-left: 16px;
      padding: 0 22px 0 10px;
    `};
  .adjustScale {
    display: flex;
    align-items: center;
    .searchIcon {
      color: #757575;
    }
  }
  .toOrigin {
    margin: 0 12px;
  }
  .genScreenshot,
  .toOrigin {
    cursor: pointer;
  }
  .disableAdjustSize {
    opacity: 0.5;
    cursor: not-allowed;
  }
  .scale {
    font-size: 13px;
    color: #515151;
  }
  .expand {
    .Dropdown--input {
      padding: 5px 7px 5px 18px;
      .value {
        font-size: 13px;
      }
      .icon {
        margin-left: 4px !important;
      }
    }
  }
`;

const SelectWrap = styled(Select)`
  width: 80px;
  .ant-select-selection-item {
    text-align: center;
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
`;

const DISPLAY_HIERARCHY = [
  { value: 1, name: _l('1级') },
  { value: 2, name: _l('2级') },
  { value: 3, name: _l('3级') },
  { value: 4, name: _l('4级') },
  { value: 5, name: _l('5级') },
];
export default class ToolBar extends Component {
  updateStorage = data => {
    const { viewId } = this.props.currentView;
    const config = getItem(`hierarchyConfig-${viewId}`) || {};
    setItem(`hierarchyConfig-${viewId}`, { ...config, ...data });
  };

  changeDisplayLevel = value => {
    this.props.showLevelData({ layer: value });
    this.updateStorage({ level: value });
  };

  adjustSize = type => {
    const { scale, onClick } = this.props;
    const nextScale = type === 'shrink' ? Math.max(SCALE_LIMIT.min, scale - 10) : Math.min(SCALE_LIMIT.max, scale + 10);
    onClick('adjustScale', { scale: nextScale });
    this.updateStorage({ scale: nextScale });
  };
  render() {
    const { scale, level, onClick, searchData, updateSearchRecord, view } = this.props;
    return (
      <ToolBarWrap browserIsMobile={browserIsMobile()} className="flexRow valignWrappe">
        {!browserIsMobile() && (
          <Tooltip text={<span>{_l('导出为图片')}</span>}>
            <Icon
              icon="download"
              className="Gray_75 Font18 mRight14 pointer"
              onClick={() => onClick('genScreenshot')}
            />
          </Tooltip>
        )}
        <SelectWrap
          suffixIcon={<Icon className="Font12 Gray_9e" icon="arrow-down" />}
          defaultActiveFirstOption={false}
          defaultOpen={false}
          dropdownClassName="gunterToolBarSelectWrapper"
          value={level || _l('展开')}
          bordered={false}
          virtual={false}
          onChange={this.changeDisplayLevel}
        >
          {DISPLAY_HIERARCHY.map(item => (
            <Select.Option key={item.value} value={item.value} className="gunterToolBarSelectOptionWrapper">
              {item.name}
            </Select.Option>
          ))}
        </SelectWrap>
        {/* <div data-tip={_l('回到原点')} className="toolItem toOrigin" onClick={() => onClick('toOrigin')}>
          <Icon className="Font16 Gray_75" icon="Position" />
        </div> */}
        <div className="toolItem adjustScale">
          {!browserIsMobile() ? <div className="scale">{`${scale}%`}</div> : null}
          <Tooltip text={browserIsMobile() ? null : <span>{_l('缩小')}</span>}>
            <Icon
              className={cx('Font19 Gray_75 pointer mRight12 mLeft12', {
                disableAdjustSize: scale <= SCALE_LIMIT.min,
              })}
              icon="minus"
              onClick={() => scale > SCALE_LIMIT.min && this.adjustSize('shrink')}
            />
          </Tooltip>
          <Tooltip text={browserIsMobile() ? null : <span>{_l('放大')}</span>}>
            <Icon
              className={cx('Font19 Gray_75 pointer mLeft6', {
                disableAdjustSize: scale >= SCALE_LIMIT.max,
              })}
              icon="add1"
              onClick={() => scale < SCALE_LIMIT.max && this.adjustSize('enlarge')}
            />
          </Tooltip>
          {browserIsMobile() && (
            <SearchRecord
              overlayClassName="mobileSearchRecordDropdown"
              queryKey={searchData.queryKey}
              data={searchData.data}
              onSearch={record => {
                updateSearchRecord(view, record);
              }}
              onClose={() => {
                updateSearchRecord(view, null);
              }}
            >
              <Icon className="searchIcon Font18 mLeft16" icon="search" />
            </SearchRecord>
          )}
        </div>
      </ToolBarWrap>
    );
  }
}
