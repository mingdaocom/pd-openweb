import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { Button, Icon, Radio, Dialog, ScrollView, Tooltip } from 'ming-ui';
import createDecoratedComponent from 'ming-ui/decorators/createDecoratedComponent';
import withClickAway from 'ming-ui/decorators/withClickAway';
import './index.less';
import _ from 'lodash';

const titleLineArr = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
const ClickAwayable = createDecoratedComponent(withClickAway);

export default class ImportConfig extends Component {
  static propTypes = {
    hideImportConfig: PropTypes.func,
    nextStep: PropTypes.func,
    fileList: PropTypes.any,
    fileName: PropTypes.string,
  };
  constructor(props) {
    super(props);
    let maxColumn = 4;
    this.props.fileList.forEach(sheetItem => {
      sheetItem.rows.forEach(item => {
        if (item.rowNumber < 10 && item.cells.length > maxColumn) {
          maxColumn = item.cells.length;
        }
      });
      for (let i = 0; i < maxColumn; i++) {
        sheetItem.rows.forEach(rowItem => {
          if (!rowItem.cells[i]) {
            rowItem.cells.push({ columnNumber: i, value: '' });
          }
        });
      }
    });
    let maxColumnNumber = 0; // 获取第一个sheet 中实际列数最多的一行(第一列不为空且有值的列数最多)
    let maxValidColumn = 0; // 单行有效列数
    this.props.fileList[0].rows.forEach(rowItem => {
      if (rowItem.rowNumber < 10) {
        let validCells = rowItem.cells;
        if (_.findIndex(rowItem.cells, item => !item.value) > -1) {
          validCells = _.slice(
            rowItem.cells,
            0,
            _.findIndex(rowItem.cells, item => !item.value),
          );
        }
        if (rowItem.cells[0].value && validCells.length > maxValidColumn) {
          maxValidColumn = validCells.length;
          maxColumnNumber = rowItem.rowNumber;
        }
      }
    });

    const defaultSelectImportSheetIndex = _.findIndex(
      this.props.fileList,
      item => item.state && item.total <= md.global.SysSettings.worksheetExcelImportDataLimitCount,
    );
    const selectRow = Object.assign(
      {},
      defaultSelectImportSheetIndex !== -1
        ? this.props.fileList[defaultSelectImportSheetIndex].rows[maxColumnNumber]
        : {},
    );

    if (
      defaultSelectImportSheetIndex !== -1 &&
      _.findIndex(this.props.fileList[defaultSelectImportSheetIndex].rows[maxColumnNumber].cells, item => !item.value) >
        -1
    ) {
      selectRow.cells = _.slice(
        selectRow.cells,
        0,
        _.findIndex(
          this.props.fileList[defaultSelectImportSheetIndex].rows[maxColumnNumber].cells,
          item => !item.value,
        ),
      ).filter(item => item.value);
    }
    this.state = {
      fileList: props.fileList || [],
      titleLine: maxColumnNumber + 1,
      importSheetIndex: _.get(this.props.fileList[defaultSelectImportSheetIndex] || {}, 'sheetNumber'), // 默认第一个可用工作表
      selectRow,
      showCancelDialog: false, // 取消弹层
    };
  }

  onChange = value => {
    const { fileList } = this.props;
    const selectSheet = _.find(fileList, item => item.sheetNumber === value);
    let maxColumnNumber = 0; // 获取第一个sheet 中实际列数最多的一行
    let maxValidColumn = 0; // 单行有效列数
    let maxValidColumnRow = {}; // 有效列最多的一行

    selectSheet.rows.forEach(rowItem => {
      if (rowItem.rowNumber < 10) {
        let validCells = rowItem.cells;
        if (_.findIndex(rowItem.cells, item => !item.value) > -1) {
          validCells = _.slice(
            rowItem.cells,
            0,
            _.findIndex(rowItem.cells, item => !item.value),
          );
        }
        if (rowItem.cells[0].value && validCells.length > maxValidColumn) {
          maxValidColumn = validCells.length;
          maxColumnNumber = rowItem.rowNumber;
          maxValidColumnRow = { ...rowItem, cells: validCells };
        }
      }
    });

    this.setState({
      importSheetIndex: value,
      titleLine: maxColumnNumber + 1,
      hoverIndex: maxColumnNumber + 1,
      selectRow: maxValidColumnRow,
    });
  };

  renderSelectLine() {
    const { fileList } = this.props;
    const { importSheetIndex, showDownload } = this.state;
    const selectSheet = _.find(fileList, item => item.sheetNumber === importSheetIndex);

    return (
      <ClickAwayable
        className={cx('LineDropDown', { Hidden: !showDownload })}
        onClickAway={() => this.setState({ showDownload: false })}
      >
        {titleLineArr.map((item, index) => (
          <div
            key={index}
            onClick={() => {
              const rowItem = selectSheet.rows[item - 1];
              let selectCells = Object.assign({}, rowItem).cells;
              if (_.findIndex(rowItem.cells, item => !item.value) > -1) {
                selectCells = _.slice(
                  rowItem.cells,
                  0,
                  _.findIndex(rowItem.cells, item => !item.value),
                );
              }
              const selectRow = {
                ...rowItem,
                cells: selectCells,
              };
              this.setState({ titleLine: item, showDownload: false, selectRow });
            }}
          >
            {item}
          </div>
        ))}
      </ClickAwayable>
    );
  }

  selectLine(rowItem, rowIndex) {
    let selectCells = Object.assign({}, rowItem).cells;
    if (_.findIndex(rowItem.cells, item => !item.value) > -1) {
      selectCells = _.slice(
        rowItem.cells,
        0,
        _.findIndex(rowItem.cells, item => !item.value),
      );
    }
    const selectRow = {
      ...rowItem,
      cells: selectCells,
    };
    this.setState({ titleLine: rowIndex + 1, selectRow });
  }

  //行数超2w行提示
  renderTooltip(item) {
    return (
      <Tooltip
        text={
          <span>
            {item.state
              ? _l(
                  '当前sheet行数超过单次导入上限（%0行），无法导入。',
                  md.global.SysSettings.worksheetExcelImportDataLimitCount,
                )
              : _l('当前工作表剩余总行数不足，无法导入此sheet。')}
          </span>
        }
        popupPlacement="bottom"
      >
        <span className="icon-error1 Font18" />
      </Tooltip>
    );
  }

  render() {
    const { fileName, fileList, hideImportConfig } = this.props;
    const { importSheetIndex, titleLine, selectRow, showCancelDialog, hoverIndex } = this.state;
    const selectSheet = _.find(fileList, item => item.sheetNumber === importSheetIndex) || {};

    // 过滤掉空行
    const emptyRows = (selectSheet.rows || []).filter(item => !(item.cells || []).some(cell => cell.value));
    const rows = (selectSheet.rows || []).filter(item => (item.cells || []).some(cell => cell.value));
    selectSheet.rows = rows.concat(emptyRows);
    selectSheet.rows.map((item, index) => {
      item.rowNumber = index;
    });
    const hasSheetImport = _.findIndex(fileList, item => item.state) > -1;

    return (
      <Fragment>
        <Dialog
          className="workSheetImportExcel"
          visible={true}
          width="960"
          title={_l('导入数据 - 选择内容（2/3）')}
          footer={null}
          anim={false}
          overlayClosable={false}
          onCancel={hideImportConfig}
        >
          <div className="flexColumn h100">
            <div className="importConfigure flexRow flex">
              <div className="excelInfo h100 flexColumn">
                <div className="mLeft24 bold ellipsis Font15 mTop10" title={fileName}>
                  {fileName}
                </div>
                <ScrollView className="flex mTop15">
                  {fileList.map(item => {
                    const disabled =
                      !item.state || item.total > md.global.SysSettings.worksheetExcelImportDataLimitCount;
                    return (
                      <Radio
                        className={cx('sheetItem Block', {
                          ThemeBGColor5: !disabled && item.sheetNumber === importSheetIndex,
                        })}
                        text={item.sheetName}
                        value={item.sheetNumber}
                        children={disabled ? this.renderTooltip(item) : null}
                        checked={item.sheetNumber === importSheetIndex}
                        disabled={disabled}
                        size="small"
                        onClick={this.onChange}
                      />
                    );
                  })}
                </ScrollView>
              </div>
              {hasSheetImport && importSheetIndex >= 0 ? (
                <div className="importInfo mLeft24 mRight24 flex flexColumn">
                  <div className="excelTitle mTop10">
                    <span className="mRight12 Gray_9e">{_l('选择表头:')}</span>
                    <span>{_l('第')}</span>
                    <input
                      value={titleLine}
                      className="TxeCenter InlineBlock pointer"
                      onClick={() => this.setState({ showDownload: true })}
                    />
                    <span> {_l('行')}</span>
                    <span className="columnNumber mLeft8 mRight10">
                      {_l('共%0列有效', _.isEmpty(selectRow) ? 0 : selectRow.cells.length)}
                    </span>
                    <span
                      className="label"
                      data-tip={_l(
                        '只有表头下方的数据才会被导入;表头字段不得为空，否则将导致空值字段之后的字段无法被导入。',
                      )}
                    >
                      <Icon icon="Import-failure" className="Font15 Gray_9e" />
                    </span>
                    {this.renderSelectLine()}
                  </div>
                  <div className="flex mTop15">
                    <div className="excelDetailBox">
                      <table
                        cellSpacing="0"
                        cellPadding="0"
                        style={{
                          width: selectSheet.rows[0].cells.length * 150 + 60,
                        }}
                      >
                        <tbody>
                          {selectSheet.rows
                            .filter(item => item.rowNumber < 10)
                            .map((rowItem, rowIndex) => (
                              <tr
                                key={'tr-' + rowIndex}
                                onClick={() => this.selectLine(rowItem, rowIndex)}
                                onMouseEnter={() => this.setState({ hoverIndex: rowIndex + 1 })}
                                onMouseLeave={() => this.setState({ hoverIndex: titleLine })}
                              >
                                <td className="index pointer">
                                  {titleLine === rowIndex + 1 && <span className="excelTitleImg">{_l('表头')}</span>}
                                  {titleLine !== rowIndex + 1 && hoverIndex === rowIndex + 1 && (
                                    <span className="excelTitleHoverImg">{_l('表头')}</span>
                                  )}
                                  {titleLine !== rowIndex + 1 && hoverIndex !== rowIndex + 1 && (
                                    <span>{rowIndex + 1}</span>
                                  )}
                                </td>
                                {rowItem.cells.map((item, columnIndex) => (
                                  <td key={'td-' + columnIndex} title={item.value}>
                                    <span className="InlineBlock ellipsis">{item.value}</span>
                                  </td>
                                ))}
                              </tr>
                            ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="importInfo hasNoneSheetImport mLeft24 mRight24 flex">{_l('没有可以导入的表')}</div>
              )}
            </div>
            <div className="buttons">
              <Button
                className="mRight16"
                size="medium"
                type="secondary"
                onClick={() => this.setState({ showCancelDialog: true })}
              >
                {_l('取消')}
              </Button>
              <Button
                size="medium"
                disabled={!(hasSheetImport && importSheetIndex >= 0)}
                onClick={() => {
                  if (selectSheet.rows[titleLine - 1].cells[0].value) {
                    this.props.nextStep(selectRow, selectSheet);
                  } else {
                    alert(_l('表头第一列不得为空'), 3);
                  }
                }}
              >
                {_l('下一步')}
              </Button>
            </div>
          </div>
        </Dialog>

        {showCancelDialog && (
          <Dialog
            className="workSheetCancelDialog"
            visible={true}
            anim={false}
            title={_l('您确定要取消导入数据吗？')}
            width={480}
            onOk={hideImportConfig}
            onCancel={() => this.setState({ showCancelDialog: false })}
          />
        )}
      </Fragment>
    );
  }
}
