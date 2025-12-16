import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Checkbox, Icon, Menu, MenuItem } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';

const SheetTabWrap = styled.div`
  padding: ${props => (props.disabled ? '' : '0 20px')};
  height: 36px;
  border-bottom: 1px solid #e0e0e0;
  display: -webkit-box;
  display: -moz-box;
  display: -ms-flexbox;
  display: -webkit-flex;
  display: flex;
  -webkit-flex-align: center;
  -ms-flex-align: center;
  -webkit-align-items: center;
  align-items: center;
  .workSheetViewsWrapper {
    width: 100%;
    height: 38px;
    position: relative;
    overflow: hidden;
    &::before,
    &::after {
      content: '';
      width: 20px;
      height: 36px;
      position: absolute;
      top: 0;
      z-index: 1;
    }
    &::before {
      left: 0;
      background-image: linear-gradient(to right, #fff 30%, rgba(255, 255, 255, 0) 100%);
    }
    &::after {
      right: 0;
      background-image: linear-gradient(to left, #fff 30%, rgba(255, 255, 255, 0) 100%);
    }
    .viewsScroll {
      display: flex;
      position: absolute;
      width: 100%;
      top: 0;
      left: 0;
      overflow-x: auto;
      overflow-y: hidden;
      .stance {
        height: 37px;
        min-width: 20px;
      }
    }
  }
  .selectSheetIcon {
    .showDisabledDot {
      position: absolute;
      right: 0;
      top: 0;
      width: 6px;
      height: 6px;
      border-radius: 50%;
      background-color: #ff9300;
    }
  }
`;

export default class WorksheetItem extends Component {
  constructor(props) {
    super(props);
    this.state = {
      directionVisible: false,
      hideDirection: 'left',
      sheetItemOperateVisible: false,
    };
  }
  componentWillReceiveProps() {
    this.computeDirectionVisible();
  }
  computeDirectionVisible() {
    if (!this.scrollWraperEl) return;
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    if (viewsScrollEl) {
      const { offsetWidth, scrollWidth } = viewsScrollEl;
      this.flag = true;
      this.setState({
        directionVisible: offsetWidth < scrollWidth,
      });
    }
  }
  updateScrollBtnState = () => {
    const { hideDirection } = this.state;
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    const { scrollWidth, scrollLeft, offsetWidth } = viewsScrollEl;
    const width = scrollLeft + offsetWidth;
    if (!scrollLeft && hideDirection !== 'left') {
      this.setState({
        hideDirection: 'left',
      });
      return;
    }
    if (width === scrollWidth && hideDirection !== 'right') {
      this.setState({
        hideDirection: 'right',
      });
      return;
    }
    if (scrollLeft && width < scrollWidth && hideDirection !== null) {
      this.setState({
        hideDirection: null,
      });
    }
  };
  handleScrollPosition = direction => {
    if (!this.scrollWraperEl) return;
    const { clientWidth } = this.scrollWraperEl;
    const distance = direction ? clientWidth / 2 : -(clientWidth / 2);
    const viewsScrollEl = this.scrollWraperEl.querySelector('.viewsScroll');
    const { scrollLeft } = viewsScrollEl;
    viewsScrollEl.scrollLeft = scrollLeft + distance;
  };
  // 点击编辑表名称
  editCurrentSheetName = () => {
    const { currentSheetInfo } = this.props;
    this.props.updateCurrentSheetInfo({ ...currentSheetInfo, isEditSheetName: true });
    this.setState({ sheetItemOperateVisible: false }, () => {
      if ($(this.editInput)) {
        $(this.editInput).focus();
      }
    });
  };

  render() {
    const {
      excelDetailData: sheetList,
      currentSheetInfo = {},
      selectedImportSheetIds = [],
      disabled,
      versionLimitSheetCount = 0,
      currentSheetCount = 0,
    } = this.props;
    const { directionVisible, hideDirection } = this.state;
    const showDisabledDot = _.some(sheetList, it => it.disabled);
    const worksheetExcelImportDataLimitCount = md.global.Config.IsLocal
      ? md.global.SysSettings.worksheetExcelImportDataLimitCount
      : 20000;

    return (
      <SheetTabWrap disabled={disabled}>
        {!disabled && (
          <div className="selectSheetIcon Relative">
            <Trigger
              popupClassName="selectImportSheetWrap"
              action={['click']}
              popupPlacement="bottom"
              builtinPlacements={{
                bottom: { points: ['tl', 'bl'] },
              }}
              popup={
                <Fragment>
                  <div className="Font14 bold">{_l('选择导入的sheet')}</div>
                  {(sheetList || []).map(item => {
                    const cellsLength = item.rows && item.rows.length && item.rows[0].cells.length;
                    const tipsTxt =
                      item.total - 1 > worksheetExcelImportDataLimitCount
                        ? _l('该sheet超过导入上限（上限%0行）', worksheetExcelImportDataLimitCount)
                        : cellsLength > 200
                          ? _l('该sheet超过导入上限（上限200列）')
                          : item.isMerge
                            ? _l('Sheet内不可以有合并单元格')
                            : !item.rows || _.isEmpty(item.rows)
                              ? _l('该sheet为空')
                              : _l('该sheet超过导入上限（上限%0张表）', versionLimitSheetCount);
                    return (
                      <div key={item.sheetId} className="pTop20 flexRow alignItemsCenter">
                        <Checkbox
                          checked={_.includes(selectedImportSheetIds, item.sheetId)}
                          disabled={item.disabled}
                          onClick={checked => {
                            let copySelectedSheetIds = [...selectedImportSheetIds];
                            let copySheetList = [];
                            if (!checked) {
                              copySelectedSheetIds.push(item.sheetId);
                              if (
                                versionLimitSheetCount !== 0 &&
                                copySelectedSheetIds.length > versionLimitSheetCount - currentSheetCount - 1
                              ) {
                                copySheetList = [...sheetList].map(m => {
                                  if (!_.includes(copySelectedSheetIds, m.sheetId)) {
                                    return { ...m, disabled: true };
                                  }
                                  return m;
                                });
                              }
                            } else {
                              if (copySelectedSheetIds.length === 1 && sheetList.some(t => !t.disabled)) {
                                return alert(_l('至少导入1张Sheet'), 3);
                              }
                              copySelectedSheetIds = selectedImportSheetIds.filter(it => it !== item.sheetId);
                              if (
                                versionLimitSheetCount !== 0 &&
                                copySelectedSheetIds.length < versionLimitSheetCount - currentSheetCount
                              ) {
                                copySheetList = [...sheetList].map(m => {
                                  if (
                                    !_.includes(copySelectedSheetIds, m.sheetId) &&
                                    !(
                                      !m.state ||
                                      !m.rows ||
                                      !m.rows.length ||
                                      (m.rows && m.rows.some(v => v.cells && v.cells.length > 200))
                                    )
                                  ) {
                                    return { ...m, disabled: false };
                                  }
                                  return m;
                                });
                              }
                            }
                            if (
                              copySelectedSheetIds.length &&
                              !_.includes(copySelectedSheetIds, currentSheetInfo.sheetId)
                            ) {
                              const temp = _.find(sheetList, it => it.sheetId === copySelectedSheetIds[0]);
                              this.props.updateCurrentSheetInfo(temp);
                            }
                            this.props.updateSelectedImportSheetIds(copySelectedSheetIds);
                            !_.isEmpty(copySheetList) && this.props.updateExcelDetailData(copySheetList);
                            this.setState({}, () => {
                              this.computeDirectionVisible();
                            });
                          }}
                        />
                        <span className={cx('flex ellipsis', { Gray_bd: item.disabled })}>
                          {item.sheetName}
                          {item.disabled && (
                            <Tooltip placement="bottom" title={tipsTxt}>
                              <Icon
                                icon="info_outline"
                                className={cx('mLeft2 Font16', {
                                  Colorff9: item.rows.length,
                                  Gray_bd: !item.rows.length,
                                })}
                              />
                            </Tooltip>
                          )}
                        </span>
                      </div>
                    );
                  })}
                </Fragment>
              }
              popupAlign={{ offset: [0, 0] }}
            >
              <Icon icon="menu" className="Font20 Gray_75" />
            </Trigger>
            {showDisabledDot && <div className="showDisabledDot"></div>}
          </div>
        )}
        <div
          className="valignWrapper flex workSheetViewsWrapper"
          ref={scrollWraperEl => {
            this.scrollWraperEl = scrollWraperEl;
          }}
        >
          <div className="viewsScroll" onScroll={this.updateScrollBtnState}>
            <div className="stance"></div>
            {sheetList
              .filter(it => _.includes(selectedImportSheetIds, it.sheetId))
              .map(item => {
                return item.sheetId === currentSheetInfo.sheetId ? (
                  <div
                    key={item.id}
                    className={cx('valignWrapper workSheetViewItem pointer', {
                      active: item.sheetId === currentSheetInfo.sheetId,
                    })}
                  >
                    <span
                      className={cx('ellipsis pLeft10 pRight10', {
                        ThemeColor: item.sheetId === currentSheetInfo.sheetId,
                      })}
                      onClick={() => {
                        this.props.updateCurrentSheetInfo(item);
                      }}
                    >
                      {currentSheetInfo.isEditSheetName ? (
                        <input
                          defaultValue={currentSheetInfo.sheetName}
                          ref={node => (this.editInput = node)}
                          className="editSheetNameInput Gray"
                          autoFocus
                          onFocus={() => {
                            setTimeout(() => {
                              this.editInput && this.editInput.current && this.editInput.current.select();
                            }, 0);
                          }}
                          onBlur={e => {
                            let val = e.target.value;
                            if (!_.trim(val)) {
                              $(this.editInput).focus();
                              return;
                            }
                            this.props.updateCurrentSheetInfo({
                              ...currentSheetInfo,
                              isEditSheetName: false,
                              sheetName: _.trim(val),
                            });
                          }}
                        />
                      ) : (
                        <span
                          onDoubleClick={() => {
                            if (disabled) return;
                            this.props.updateCurrentSheetInfo({ ...currentSheetInfo, isEditSheetName: true });
                            if ($(this.editInput)) {
                              $(this.editInput).focus();
                            }
                          }}
                        >
                          {item.sheetName}
                        </span>
                      )}
                    </span>
                    {!currentSheetInfo.isEditSheetName && !disabled && (
                      <Trigger
                        popupVisible={this.state.sheetItemOperateVisible}
                        onPopupVisibleChange={sheetItemOperateVisible => {
                          this.setState({ sheetItemOperateVisible });
                        }}
                        popupClassName="DropdownPanelTrigger"
                        action={['click']}
                        popupAlign={{
                          points: ['tl', 'bl'],
                          offset: [-80, 13],
                        }}
                        popup={
                          <Menu>
                            <MenuItem icon={<Icon icon="edit" />} onClick={() => this.editCurrentSheetName(item)}>
                              <span className="text">{_l('修改表名称')}</span>
                            </MenuItem>
                            <MenuItem
                              icon={<Icon icon="file_upload_off" />}
                              onClick={() => {
                                if (selectedImportSheetIds.length === 1) {
                                  return alert(_l('至少导入1张Sheet'), 3);
                                }
                                let ids = selectedImportSheetIds.filter(v => v !== item.sheetId);
                                if (ids.length && !_.includes(ids, currentSheetInfo.sheetId)) {
                                  const temp = _.find(sheetList, it => it.sheetId === ids[0]);
                                  this.props.updateCurrentSheetInfo(temp);
                                }
                                this.props.updateSelectedImportSheetIds(ids);
                                this.setState({ sheetItemOperateVisible: false }, () => {
                                  this.computeDirectionVisible();
                                });
                              }}
                            >
                              <span className="text">{_l('不导入此sheet')}</span>
                            </MenuItem>
                          </Menu>
                        }
                      >
                        <Icon icon="arrow-down" className="Gray_9d" />
                      </Trigger>
                    )}
                  </div>
                ) : (
                  <div
                    key={item.id}
                    className={cx('valignWrapper workSheetViewItem pointer', {
                      active: item.sheetId === currentSheetInfo.sheetId,
                    })}
                  >
                    <span
                      className={cx('ellipsis pLeft10 pRight10', {
                        ThemeColor: item.sheetId === currentSheetInfo.sheetId,
                      })}
                      onClick={() => {
                        this.props.updateCurrentSheetInfo(item);
                      }}
                    >
                      {item.sheetName}
                    </span>
                    {!disabled && <Icon icon="arrow-down" className="Gray_9d" />}
                  </div>
                );
              })}
            <div className="stance"></div>
          </div>
        </div>
        {directionVisible && (
          <div className="showMoreWrap">
            <Icon
              icon="arrow-left-tip"
              className={cx('Gray_9e pointer Font15', { Alpha3: hideDirection === 'left' })}
              onClick={() => this.handleScrollPosition(0)}
            />
            <Icon
              icon="arrow-right-tip"
              className={cx('Gray_9e pointer Font15', { Alpha3: hideDirection === 'right' })}
              onClick={() => this.handleScrollPosition(1)}
            />
          </div>
        )}
      </SheetTabWrap>
    );
  }
}
