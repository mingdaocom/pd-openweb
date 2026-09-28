import React, { Component } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { ActionSheet } from 'antd-mobile';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select, Tooltip } from 'ming-ui/antd-components';
import * as actions from 'worksheet/redux/actions/gunterview';
import { PERIODS } from 'worksheet/views/GunterView/config';
import SearchRecord from 'src/pages/worksheet/views/components/SearchRecord';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import { getSearchData } from 'src/utils/services/worksheet/view';
import Zoom from './Zoom';

const ToolBarWrap = styled.div(
  ({ $isMobile }) => `
  position: absolute;
  bottom: 20px;
  left: ${$isMobile ? '16px' : 'auto'};
  right:  ${$isMobile ? 'auto' : '20px'};
  background-color: var(--color-background-card);
  border-radius: 26px;
  height: ${$isMobile ? '40px' : '44px'};
  padding:${$isMobile ? '0 18px' : '0 22px 0 16px'};
  z-index: 10;
  box-shadow: var(--shadow-lg);
  .icon-download:hover {
    color: var(--color-primary) !important;
  }
  .line{
    height: 20px;
    margin: 10px 0 10px 10px;
    border: 1px solid var(--color-border-secondary);
  }
`,
);

let ToolBar = class ToolBar extends Component {
  constructor(props) {
    super(props);
  }

  componentWillUnmount() {
    this.actionSheetHandler && this.actionSheetHandler.close();
  }

  renderPeriodSelect() {
    const { periodType, changeViewType, isMobile } = this.props;
    return (
      <Select
        styles={{
          root: {
            width: isMobile ? 60 : 85,
          },
          popup: {
            root: {
              width: 120,
            },
          },
        }}
        suffixIcon={<Icon className="Font12 textTertiary" icon="arrow-down" />}
        defaultActiveFirstOption={false}
        defaultOpen={false}
        value={periodType}
        variant="borderless"
        virtual={false}
        onChange={changeViewType}
        options={PERIODS.map(item => ({
          value: item.value,
          label: item.name,
        }))}
      />
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
      <ToolBarWrap $isMobile={isMobile} className="flexRow valignWrapper toolBarWrap">
        {isMobile ? (
          <div onClick={this.changeMobileViewType}>
            {(_.find(PERIODS, v => v.value === periodType) || {}).name || _l('展开')}
            <Icon className="Font12 textTertiary mLeft6" icon="arrow-down" />
          </div>
        ) : (
          this.renderPeriodSelect()
        )}
        {isMobile && <div className="line"></div>}
        <Zoom />
        {isMobile && <div className="line"></div>}
        {isMobile && (
          <SearchRecord
            popupClassName={isMobileSingleView ? 'singleViewSearchRecordDropdown' : 'mobileSearchRecordDropdown'}
            queryKey={searchData.queryKey}
            data={searchData.data}
            onSearch={record => {
              this.props.updateGunterSearchRecord(record);
            }}
            onClose={() => {
              this.props.updateGunterSearchRecord(null);
            }}
          >
            <Icon className="textSecondary Font18 pLeft2 mLeft16" icon="search" />
          </SearchRecord>
        )}
        {!isMobile && (
          <Tooltip title={_l('导出为图片')}>
            <Icon
              icon="download"
              className="textSecondary Font18 mRight14 pointer mLeft24"
              onClick={() => {
                const { base } = this.props;
                window.open(pathCompletion(`/app/${base.appId}/${base.worksheetId}/${base.viewId}/gunterExport`));
              }}
            />
          </Tooltip>
        )}
      </ToolBarWrap>
    );
  }
};
ToolBar = connect(
  state => ({
    ..._.pick(state.sheet, ['base']),
    ..._.pick(state.sheet.gunterView, ['periodType']),
    searchData: browserIsMobile() ? getSearchData(state.sheet) : {},
    mobileViewType: _.get(state.mobile, ['base', 'type']),
  }),
  dispatch => bindActionCreators(actions, dispatch),
)(ToolBar);
export default ToolBar;
