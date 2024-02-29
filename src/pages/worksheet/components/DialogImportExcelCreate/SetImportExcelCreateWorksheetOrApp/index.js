import React, { Component, Fragment } from 'react';
import { Dialog, Button, Icon, Checkbox, Menu, MenuItem, Tooltip, Support, LoadDiv } from 'ming-ui';
import { Select } from 'antd';
import Trigger from 'rc-trigger';
import WorksheetItem from './WorksheetItem';
import { DEFAULT_CONFIG } from 'src/pages/widgetConfig/config/widget.js';
import { FILEDS_TYPE_INFO } from '../util';
import { canSetAsTitle } from 'src/pages/widgetConfig/util';
import './index.less';
import ExcelControlSetting from './ExcelControlSetting';
import { connect } from 'react-redux';
import styled from 'styled-components';
import _ from 'lodash';

const ImportLoadingWrap = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  z-index: 1001;
  background: rgba(255, 255, 255, 0.5);
`;

const getWorksheetList = (list = [], total = []) => {
  list.map(item => {
    total = total.concat((item.workSheetInfo || []).filter(i => i.type === 0));
    if (item.childSections && item.childSections.length > 0) {
      total = total.concat(getWorksheetList(item.childSections, total));
    }
  });
  return total;
};

const { Option } = Select;
@connect(({ appPkg }) => ({
  worksheetList: getWorksheetList(appPkg.appGroups || []),
}))
export default class SetImportExcelCreateWorksheetOrApp extends Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  renderCells = () => {
    const { currentSheetInfo = {} } = this.props;
    const { rows = [], selectCells = [], matchControl } = currentSheetInfo;
    const cells = rows.length ? rows[0].cells : [];
    const titleCellNumber = _.get(
      _.find(Object.values(matchControl), v => v.attribute === 1),
      'row',
    );
    return (
      <div className="selectCellsWrap">
        <div className="bold Font14">{_l('选择导入的列')}</div>
        <div className="selectCellsItem">
          <Checkbox
            checked={selectCells.length}
            clearselected={selectCells.length && selectCells.length !== cells.length}
            onClick={checked => {
              if (selectCells.length !== cells.length) {
                this.props.updateCurrentSheetInfo({
                  ...currentSheetInfo,
                  selectCells: cells.map(it => it.columnNumber),
                });
              } else {
                this.props.updateCurrentSheetInfo({
                  ...currentSheetInfo,
                  selectCells: [titleCellNumber],
                });
              }
            }}
          />
          <span className="ellipsis flex">{_l('全选')}</span>
        </div>
        <div className="spaceLine"></div>
        {cells.map(item => {
          const isTitle =
            _.get(
              _.find(Object.values(matchControl), v => v.row === item.columnNumber),
              'attribute',
            ) === 1;
          return (
            <div key={item.columnNumber} className="selectCellsItem">
              <Checkbox
                disabled={isTitle}
                checked={_.includes(selectCells, item.columnNumber)}
                onClick={checked => {
                  if (!checked) {
                    this.props.updateCurrentSheetInfo({
                      ...currentSheetInfo,
                      selectCells: selectCells.concat(item.columnNumber),
                    });
                  } else {
                    this.props.updateCurrentSheetInfo({
                      ...currentSheetInfo,
                      selectCells: selectCells.filter(it => it !== item.columnNumber),
                    });
                  }
                }}
              />
              <div className="flexRow flex">
                <span className="ellipsis flex">{item.value}</span>
                {isTitle && (
                  <span>
                    <Tooltip text={<span>{_l('标题字段无法取消')}</span>} action={['hover']}>
                      <Icon icon="info_outline" className="Gray_bd Hand Font15" />
                    </Tooltip>
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  updateTriggerVisible = (it, action, visible) => {
    const { currentSheetInfo = {} } = this.props;
    let temp = {
      ...currentSheetInfo,
      rows: currentSheetInfo.rows.map((v, i) => {
        if (i === 0) {
          return {
            ...v,
            cells: v.cells.map((m, n) => {
              if (m.columnNumber === it.columnNumber) {
                return { ...m, [action]: visible };
              }
              return m;
            }),
          };
        }
        return v;
      }),
    };
    this.props.updateCurrentSheetInfo(temp);
  };

  renderSetCell = it => {
    const { currentSheetInfo = {} } = this.props;
    const { selectCells = [], matchControl = {} } = currentSheetInfo;
    const showSetTitle = canSetAsTitle(_.find(Object.values(matchControl), v => v.row === it.columnNumber));
    const isTitle =
      _.get(
        _.find(Object.values(matchControl), v => v.row === it.columnNumber),
        'attribute',
      ) === 1;
    return (
      <Menu>
        <MenuItem
          icon={<Icon icon="edit" />}
          onClick={() => {
            let temp = {
              ...currentSheetInfo,
              rows: currentSheetInfo.rows.map((v, i) => {
                if (i === 0) {
                  return {
                    ...v,
                    cells: v.cells.map((m, n) => {
                      if (m.columnNumber === it.columnNumber) {
                        return { ...m, cellActVisible: false, editFieldVisible: true };
                      }
                      return m;
                    }),
                  };
                }
                return v;
              }),
            };
            this.props.updateCurrentSheetInfo(temp);
          }}
        >
          <span>{_l('编辑字段')}</span>
        </MenuItem>
        {showSetTitle && (
          <MenuItem
            icon={<Icon icon="ic_title" />}
            onClick={() => {
              const temp = currentSheetInfo.matchControl
                ? Object.values(currentSheetInfo.matchControl).map((v, i) => {
                    if (i === it.columnNumber) {
                      return { ...v, attribute: 1 };
                    }
                    return { ...v, attribute: 0 };
                  })
                : [];
              const tempRows = currentSheetInfo.rows.map((v, i) => {
                if (i === 0) {
                  return {
                    ...v,
                    cells: v.cells.map((m, n) => {
                      if (m.columnNumber === it.columnNumber) {
                        return { ...m, cellActVisible: false };
                      }
                      return m;
                    }),
                  };
                }
                return v;
              });
              this.props.updateCurrentSheetInfo({
                ...currentSheetInfo,
                matchControl: Object.assign({}, temp),
                rows: tempRows,
              });
            }}
          >
            <span>{_l('设为标题')}</span>
          </MenuItem>
        )}
        <MenuItem
          disabled={isTitle}
          icon={<Icon icon="file_upload_off" />}
          onClick={() => {
            if (isTitle) return;
            const tempRows = currentSheetInfo.rows.map((v, i) => {
              if (i === 0) {
                return {
                  ...v,
                  cells: v.cells.map((m, n) => {
                    if (m.columnNumber === it.columnNumber) {
                      return { ...m, cellActVisible: false };
                    }
                    return m;
                  }),
                };
              }
              return v;
            });
            const data = {
              ...currentSheetInfo,
              selectCells: selectCells.filter(v => v !== it.columnNumber),
              rows: tempRows,
            };
            this.props.updateCurrentSheetInfo(data);
          }}
        >
          <div className="flexRow">
            <div className="flex">{_l('不导入此列')}</div>
            <span>
              {isTitle && (
                <Tooltip text={<span>{_l('标题字段无法取消')}</span>} action={['hover']}>
                  <Icon icon="info_outline" className="Gray_bd Hand Font15 disabledCellIcon" />
                </Tooltip>
              )}
            </span>
          </div>
        </MenuItem>
      </Menu>
    );
  };

  renderHeader = rowItem => {
    const { currentSheetInfo = {}, worksheetList = [], createType } = this.props;
    const { matchControl = [], rowNum, selectCells = [] } = currentSheetInfo;
    const rowItemCells = rowItem.cells.filter(it => _.includes(selectCells, it.columnNumber));
    return (
      <tr className="sheetHead" key={'tr' + rowItem.rowNumber}>
        <td className="index pointer">{rowNum}</td>
        {_.isEmpty(rowItemCells) ? (
          <td></td>
        ) : (
          rowItemCells.map(it => {
            const control = !_.isEmpty(matchControl) ? matchControl[it.columnNumber] : {};
            const mapFields = _.get(FILEDS_TYPE_INFO, `${control.type}.mapField`);
            const cellIcon = mapFields ? _.get(DEFAULT_CONFIG, `${mapFields}.icon`) : 'letter_a';

            return (
              <td key={'td-' + it.columnNumber}>
                <span className="flexRow alignItemsCenter">
                  {control.attribute === 1 && <Icon icon="ic_title " className="ThemeColor mRight5 Font16" />}
                  <Icon icon={cellIcon} className="Gray_9d Font16" />
                  <Trigger
                    popupVisible={it.editFieldVisible}
                    onPopupVisibleChange={editFieldVisible => {
                      this.updateTriggerVisible(it, 'editFieldVisible', editFieldVisible);
                    }}
                    popupPlacement="bottom"
                    popupAlign={{ offset: [-26, 0] }}
                    builtinPlacements={{
                      bottom: { points: ['tl', 'bl'] },
                    }}
                    action={['click']}
                    destroyPopupOnHide={true}
                    popup={() => (
                      <ExcelControlSetting
                        data={{ ...control }}
                        createType={createType}
                        onChange={newControl => {
                          const copyMatchControl = _.map(matchControl, i =>
                            i.controlId === newControl.controlId ? newControl : i,
                          );
                          const copyRows = _.map(currentSheetInfo.rows || [], (m, n) => {
                            if (n === 0) {
                              return {
                                ...m,
                                cells: _.map(m.cells || [], t => {
                                  const controlName = _.get(
                                    _.find(copyMatchControl, v => v.row === newControl.row),
                                    'controlName',
                                  );
                                  if (newControl.row === t.columnNumber) {
                                    return { ...t, value: controlName };
                                  }
                                  return t;
                                }),
                              };
                            }
                            return m;
                          });
                          this.props.updateCurrentSheetInfo({
                            ...currentSheetInfo,
                            matchControl: copyMatchControl,
                            rows: copyRows,
                          });
                        }}
                        worksheetList={worksheetList}
                      />
                    )}
                  >
                    <span className="flex ellipsis InlineBlock bold Hand" title={it.value}>
                      {it.value}
                    </span>
                  </Trigger>
                  <Trigger
                    popupVisible={it.cellActVisible}
                    onPopupVisibleChange={cellActVisible => {
                      this.updateTriggerVisible(it, 'cellActVisible', cellActVisible);
                    }}
                    popupPlacement="bottom"
                    popupAlign={{ offset: [-130, 10] }}
                    builtinPlacements={{
                      bottom: { points: ['tc', 'bc'] },
                    }}
                    action={['click']}
                    popup={() => this.renderSetCell(it)}
                  >
                    <Icon icon="arrow-down" className="Gray_9d Font12 Hand Hover_21" />
                  </Trigger>
                </span>
              </td>
            );
          })
        )}
      </tr>
    );
  };

  getTableWidth = () => {
    const { currentSheetInfo = {} } = this.props;
    const { rows = [], selectCells = [] } = currentSheetInfo;
    const tableWidth =
      rows.length && rows[0].cells && rows[0].cells.length
        ? rows[0].cells.filter(it => _.includes(selectCells, it.columnNumber)).length * 150 + 60
        : 0;
    return tableWidth;
  };

  render() {
    const {
      visible,
      createType = 'worksheet',
      excelDetailData = {},
      currentSheetInfo = {},
      selectedImportSheetIds = [],
      versionLimitSheetCount,
      currentSheetCount,
      importLoading,
    } = this.props;
    const { rows = [], selectCells = [], rowNum } = currentSheetInfo;
    const cells = rows.length ? rows[0].cells : [];
    const showRows = rows.filter((it, index) => index === 0).concat(rows.slice(rowNum, rowNum + 10));
    return (
      <Fragment>
        {importLoading && createType === 'worksheet' && (
          <ImportLoadingWrap className="laodingWrap flexRow justifyContentCenter alignItemsCenter">
            <LoadDiv />
          </ImportLoadingWrap>
        )}
        <Dialog
          dialogClasses="setImportDataContainer"
          width={1000}
          title={<span className="Bold">{_l('设置导入数据')}</span>}
          visible={visible}
          onCancel={this.props.onCancel}
          footer={
            <div className="flexRow footerContent">
              <div className="Gray_9e">
                {_.isEmpty(selectedImportSheetIds)
                  ? ''
                  : _l(
                      '当前表共%0行，仅显示前%1行',
                      currentSheetInfo.total - 1,
                      currentSheetInfo.total - 1 >= 10 ? 10 : currentSheetInfo.total - 1,
                    )}
              </div>
              <div className="footer">
                <Support
                  type={2}
                  text={_l('帮助')}
                  href="https://help.mingdao.com/sheet50"
                  className="Gray_bd mRight30"
                />
                <Button type="link" className="mRight15 cancelBtn" onClick={this.props.onCancel}>
                  {_l('取消')}
                </Button>
                <Button
                  type="primary"
                  disabled={_.isEmpty(selectedImportSheetIds)}
                  onClick={() => this.props.handleNext()}
                >
                  {createType === 'worksheet' ? _l('开始导入') : _l('下一步')}
                </Button>
              </div>
            </div>
          }
        >
          {importLoading && (
            <ImportLoadingWrap className="laodingWrap flexRow justifyContentCenter alignItemsCenter">
              <LoadDiv />
            </ImportLoadingWrap>
          )}
          <div className="flexColumn h100">
            <WorksheetItem
              excelDetailData={excelDetailData}
              currentSheetInfo={currentSheetInfo}
              selectedImportSheetIds={selectedImportSheetIds}
              versionLimitSheetCount={versionLimitSheetCount}
              currentSheetCount={currentSheetCount}
              updateCurrentSheetInfo={this.props.updateCurrentSheetInfo}
              updateSelectedImportSheetIds={this.props.updateSelectedImportSheetIds}
              updateExcelDetailData={this.props.updateExcelDetailData}
            />
            {_.isEmpty(selectedImportSheetIds) ? (
              <div className="flexColumn h100 Gray_75 Font16 alignItemsCenter justifyContentCenter">
                <div>{_l('没有可导入Sheet')}</div>
                <div>{_l('请检查导入文件')}</div>
              </div>
            ) : (
              <Fragment>
                <div className="operateWrap flexRow alignItemsCenter">
                  <div className="selectTableHeadRow flex">
                    <span className="mRight8">{_l('表头行')}</span>
                    <Select
                      value={currentSheetInfo.rowNum}
                      style={{ width: '174px' }}
                      className="mLeft2 mRight2"
                      onChange={val => {
                        this.props.updateCurrentSheetInfo({ ...currentSheetInfo, rowNum: val });
                      }}
                    >
                      {rows.length
                        ? rows
                            .slice(0, 11)
                            .map(v =>
                              v.rowNumber === 0 ? '' : <Option value={v.rowNumber}>{_l('第%0行', v.rowNumber)}</Option>,
                            )
                        : ''}
                    </Select>
                    <Tooltip
                      text={
                        <span>
                          {_l(
                            '只有表头下方的数据才会被导入;表头字段不得为空，否则将导致空值字段之后的字段无法被导入。',
                          )}
                        </span>
                      }
                      action={['hover']}
                    >
                      <Icon icon="info_outline" className="Gray_bd mLeft8 Hand Font16" />
                    </Tooltip>
                  </div>
                  <div className="exportCol Hand">
                    <Trigger
                      popupPlacement="bottom"
                      popupAlign={{ offset: [0, 0] }}
                      builtinPlacements={{
                        bottom: { points: ['tr', 'br'] },
                      }}
                      action={['click']}
                      popup={this.renderCells}
                    >
                      <span>
                        <Icon icon="tune_new" className="Gray_75 mRight5" />
                        <span>
                          {selectCells.length === cells.length
                            ? _l('导入所有列')
                            : _l('导入%0/%1列', selectCells.length, cells.length)}
                        </span>
                        <Icon icon="arrow-down-border" className="mLeft5 Gray_9e" />
                      </span>
                    </Trigger>
                  </div>
                </div>
                <div className="tableWrap flex" ref={node => (this.tableWrap = node)}>
                  <table
                    cellSpacing="0"
                    cellPadding="0"
                    style={{
                      width: this.getTableWidth(),
                    }}
                  >
                    <tbody>
                      {showRows.map((item, index) => {
                        if (index === 0) return this.renderHeader(item);
                        const rowCells = item.cells.filter(v => _.includes(selectCells, v.columnNumber));
                        return (
                          <tr key={'tr-' + item.rowNumber}>
                            <td className="index pointer">{index + rowNum}</td>
                            {_.isEmpty(rowCells) ? (
                              <td></td>
                            ) : (
                              rowCells.map((it, i) => {
                                return (
                                  <td key={'td-' + it.columnNumber} title={it.value}>
                                    {it.value}
                                  </td>
                                );
                              })
                            )}
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </Fragment>
            )}
          </div>
        </Dialog>
      </Fragment>
    );
  }
}
