import React, { Component, Fragment } from 'react';
import { Select } from 'antd';
import { ActionSheet } from 'antd-mobile';
import cx from 'classnames';
import styled, { css } from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import { FlexCenter } from 'worksheet/styled';
import SearchRecord from 'src/pages/worksheet/views/components/SearchRecord';
import 'src/pages/worksheet/views/GunterView/Chart/components/ToolBar/index.less';
import { browserIsMobile } from 'src/utils/common';

const SCALE_LIMIT = {
  min: 50,
  max: 100,
};

const ToolBarWrap = styled(FlexCenter)`
  position: absolute;
  bottom: 20px;
  right: 20px;
  background-color: #fff;
  border-radius: 26px;
  height: 44px;
  padding: 0 22px 0 16px;
  z-index: 9;
  box-shadow: rgba(0, 0, 0, 0.24) 0px 1px 6px;
  ${props =>
    props.isMobile &&
    css`
      left: 0;
      bottom: 20px;
      margin-left: 16px;
      padding: 0 18px;
      right: auto;
      height: 40px;
      .line {
        height: 20px;
        margin: 10px 0 10px 10px;
        border: 1px solid #e0e0e0;
      }
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
  width: 85px;
  .ant-select-selector {
    padding-left: 0 !important;
  }
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
  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
  }

  updateStorage = data => {
    const { viewId } = this.props.currentView;
    const config = safeParse(localStorage.getItem(`hierarchyConfig-${viewId}`));
    safeLocalStorageSetItem(`hierarchyConfig-${viewId}`, JSON.stringify({ ...config, ...data }));
  };

  changeDisplayLevel = value => {
    this.props.showLevelData({ layer: value });
    this.updateStorage({ level: value, levelUpdateTime: Date.now() });
  };

  adjustSize = type => {
    const { scale, onClick } = this.props;
    const nextScale = type === 'shrink' ? Math.max(SCALE_LIMIT.min, scale - 10) : Math.min(SCALE_LIMIT.max, scale + 10);
    onClick('adjustScale', { scale: nextScale });
    this.updateStorage({ scale: nextScale });
  };

  changeMobileDisplayLevel = () => {
    this.actionSheetHandler = ActionSheet.show({
      actions: DISPLAY_HIERARCHY.map(item => ({
        key: item.value,
        text: item.name,
      })),
      extra: (
        <div className="flexRow header">
          <span className="Font13 ">{_l('展开级数')}</span>
          <div className="closeIcon" onClick={() => this.actionSheetHandler.close()}>
            <Icon icon="close" />
          </div>
        </div>
      ),
      onAction: (action, index) => {
        const value = (_.find(DISPLAY_HIERARCHY, (v, i) => i === index) || []).value;
        this.changeDisplayLevel(value);
        this.actionSheetHandler.close();
      },
    });
  };

  render() {
    const {
      className,
      style = {},
      scale = 100,
      level,
      onClick,
      searchData,
      updateSearchRecord,
      view,
      allowAdjustScale = true,
      allowExportAsImage = true,
      customButtons = [],
      mobileViewType,
    } = this.props;
    const isMobileSingleView = mobileViewType === 'single';
    const isMobile = browserIsMobile();

    return (
      <ToolBarWrap isMobile={isMobile} className={cx('flexRow valignWrappe toolBarWrap', className)} style={style}>
        {isMobile ? (
          <div onClick={this.changeMobileDisplayLevel}>
            {(_.find(DISPLAY_HIERARCHY, v => v.value === level) || {}).name || _l('展开')}
            <Icon className="Font12 Gray_9e mLeft6" icon="arrow-down" />
          </div>
        ) : (
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
        )}
        {isMobile && <div className="line"></div>}
        {/* <div data-tip={_l('回到原点')} className="toolItem toOrigin" onClick={() => onClick('toOrigin')}>
          <Icon className="Font16 Gray_75" icon="Position" />
        </div> */}
        {allowAdjustScale && (
          <div className="toolItem adjustScale">
            {!isMobile ? <div className="scale">{`${scale}%`}</div> : null}
            <Tooltip text={isMobile ? null : <span>{_l('缩小')}</span>}>
              <Icon
                className={cx('Font19 Gray_75 pointer mRight12 mLeft12', {
                  disableAdjustSize: scale <= SCALE_LIMIT.min,
                })}
                icon="minus"
                onClick={() => scale > SCALE_LIMIT.min && this.adjustSize('shrink')}
              />
            </Tooltip>
            <Tooltip text={isMobile ? null : <span>{_l('放大')}</span>}>
              <Icon
                className={cx('Font19 Gray_75 pointer mLeft6', {
                  disableAdjustSize: scale >= SCALE_LIMIT.max,
                })}
                icon="add1"
                onClick={() => scale < SCALE_LIMIT.max && this.adjustSize('enlarge')}
              />
            </Tooltip>
            {isMobile && (
              <Fragment>
                <div className="line"></div>
                <SearchRecord
                  overlayClassName={
                    isMobileSingleView ? 'singleViewSearchRecordDropdown' : 'mobileSearchRecordDropdown'
                  }
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
              </Fragment>
            )}
          </div>
        )}
        {allowExportAsImage && !isMobile && (
          <Tooltip text={<span>{_l('导出为图片')}</span>}>
            <Icon icon="download" className="Gray_75 Font18 pointer mLeft24" onClick={() => onClick('genScreenshot')} />
          </Tooltip>
        )}
        {customButtons}
      </ToolBarWrap>
    );
  }
}
