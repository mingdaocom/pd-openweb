import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Checkbox } from 'ming-ui';
import appManagement from 'src/api/appManagement';
import './ExportSheet.less';
import cx from 'classnames';
import { isRelateRecordTableControl } from 'worksheet/util';

export default class ExportSheet extends Component {
  static propTypes = {
    sheetHiddenColumns: PropTypes.array,
    allWorksheetIsSelected: PropTypes.boolean,
    worksheetId: PropTypes.string,
    exportView: PropTypes.object,
    projectId: PropTypes.string,
    downLoadUrl: PropTypes.string, // 导出路径
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onHide: PropTypes.func,
    searchArgs: PropTypes.object, // 筛选条件
    columnRpts: PropTypes.array, // 统计条件
    selectRowIds: PropTypes.array, // 多选导出的话选中的行id
    worksheetSummaryTypes: PropTypes.shape({}),
    quickFilter: PropTypes.object,
    navGroupFilters: PropTypes.object,
  };

  constructor(props) {
    super(props);
    this.state = {
      showTabs:
        props.exportView.viewType === 0 &&
        (props.exportView.advancedSetting.customdisplay === '1' || (props.exportView.showControls || []).length),
      exportShowColumns: props.exportView.viewType === 0,
      columnsSelected: this.getDefaultColumnsSelected(props.exportView.viewType !== 0),
      isStatistics: false,
    };
  }

  getColumnRpts(exportControlsId = [], systemColumn = []) {
    const { columns, worksheetSummaryTypes } = this.props;
    return columns
      .filter(control => _.includes(exportControlsId, control.controlId))
      .concat(systemColumn)
      .map(control => ({
        controlId: control.controlId,
        rptType:
          typeof worksheetSummaryTypes[control.controlId] === 'undefined'
            ? 1
            : worksheetSummaryTypes[control.controlId],
      }));
  }

  checkControlVisible(item) {
    if (!item) return false;

    const controlPermissions = item.controlPermissions || '111';
    const fieldPermission = item.fieldPermission || '111';
    return fieldPermission[0] === '1' && controlPermissions[0] === '1';
  }

  getDefaultColumnsSelected(isAll) {
    const selected = {};
    const { sheetHiddenColumns, columns, exportView } = this.props;
    const { advancedSetting, showControls } = exportView;

    if (isAll || !(advancedSetting.customdisplay === '1' || showControls.length)) {
      columns
        .filter(item => this.checkControlVisible(item))
        .forEach(column => {
          selected[column.controlId] = true;
        });

      selected.rowid = true;
    } else {
      showControls
        .filter(id => this.checkControlVisible(columns.find(obj => obj.controlId === id)))
        .forEach(controlId => {
          selected[controlId] = !_.includes(sheetHiddenColumns, controlId);
        });
    }

    return selected;
  }

  getToken = () => {
    const { worksheetId, exportView } = this.props;
    appManagement.getToken({ worksheetId, viewId: exportView.viewId }).then(data => {
      this.exportSheet(data);
    });
  };

  exportSheet(token) {
    const {
      columns,
      allCount,
      allWorksheetIsSelected,
      worksheetId,
      exportView,
      projectId,
      selectRowIds,
      appId,
      searchArgs: { filterControls, keyWords, searchType },
      quickFilter = [],
      navGroupFilters,
    } = this.props;
    const { columnsSelected, isStatistics, exportShowColumns } = this.state;
    const systemColumn = [];
    const exportControlsId = [];
    _.forEach(columnsSelected, (value, key) => {
      const column = _.find(columns, item => item.controlId === key);
      if (value && column) {
        if (key === 'ownerid' || key === 'caid') {
          column.type = 26;
          systemColumn.push(column);
        } else if (key === 'ctime' || key === 'utime') {
          column.type = 1;
          systemColumn.push(column);
        } else {
          exportControlsId.push(column.controlId);
        }
      }

      if (value && key === 'rowid') {
        exportControlsId.push('rowid');
      }
    });
    const args = {
      token,
      accountId: md.global.Account.accountId,
      worksheetId,
      appId,
      viewId: exportView.viewId,
      projectId,
      exportControlsId,
      filterControls,
      columnRpts: isStatistics ? this.getColumnRpts(exportControlsId, systemColumn) : null,
      keyWords,
      searchType,
      rowIds: selectRowIds,
      systemColumn,
      isSort: exportShowColumns,
      fastFilters: (quickFilter || []).map(f =>
        _.pick(f, [
          'controlId',
          'dataType',
          'spliceType',
          'filterType',
          'dateRange',
          'value',
          'values',
          'minValue',
          'maxValue',
        ]),
      ),
      navGroupFilters,
    };

    if (allWorksheetIsSelected) {
      delete args['rowIds'];
      args.excludeRowIds = selectRowIds;
    }

    if (allCount > 5000) {
      args.sortControls = [{ controlId: 'ctime', datatype: 16, isAsc: false }];
    }

    if (!(exportControlsId.length + systemColumn.length)) {
      alert(_l('至少显示一个字段'), 3);
      return;
    }

    fetch(`${this.props.downLoadUrl}/ExportExcel/Export`, {
      method: 'POST',
      headers: {
        'content-type': 'application/json',
      },
      body: JSON.stringify(args),
    });

    this.props.onHide();
  }

  renderTitle(title, data) {
    const { columnsSelected } = this.state;
    const filedIsAll = !data.filter(item => !columnsSelected[item.controlId]).length;

    return (
      <div className="title flexRow mTop10">
        <div>{title}</div>
        {!!data.length && (
          <div className="mLeft10">
            <span
              className="pointer exportSheetQuickBtn Gray_75 ThemeHoverColor3 Font12"
              onClick={() => {
                const newSelected = Object.assign({}, columnsSelected);

                data.forEach(item => {
                  newSelected[item.controlId] = !filedIsAll;
                });

                this.setState({ columnsSelected: newSelected });
              }}
            >
              {filedIsAll ? _l('取消全选') : _l('全选')}
            </span>
          </div>
        )}
      </div>
    );
  }

  renderSheetColumns(data) {
    const { columnsSelected } = this.state;

    return data.map((column, index) => (
      <Checkbox
        key={index}
        size="small"
        text={column.controlName}
        checked={!!columnsSelected[column.controlId]}
        onClick={() => {
          const newSelected = Object.assign({}, columnsSelected);
          newSelected[column.controlId] = !columnsSelected[column.controlId];
          this.setState({ columnsSelected: newSelected });
        }}
      />
    ));
  }

  render() {
    const { onHide, allWorksheetIsSelected, selectRowIds, exportView } = this.props;
    let columns = [].concat(this.props.columns);
    const { advancedSetting, showControls } = exportView;
    const { isStatistics, exportShowColumns, showTabs } = this.state;

    if (
      exportView.viewType === 0 &&
      (advancedSetting.customdisplay === '1' || showControls.length) &&
      exportShowColumns
    ) {
      columns = exportView.showControls.map(id => columns.find(item => item.controlId === id)).filter(item => !!item);
    } else {
      columns = columns.sort((a, b) => {
        if (a.row === b.row) {
          return a.col - b.col;
        }
        return a.row - b.row;
      });

      columns.unshift({ type: 2, controlId: 'rowid', controlName: _l('记录ID') });
    }

    const exportColumns = columns.filter(
      item =>
        !isRelateRecordTableControl(item) &&
        item.type !== 22 &&
        item.type !== 34 &&
        item.type !== 10010 &&
        this.checkControlVisible(item),
    );
    const exportMoreRecord = columns.filter(item => isRelateRecordTableControl(item) || item.type === 34);

    return (
      <Dialog
        className="exportSheet"
        visible
        anim={false}
        title={
          allWorksheetIsSelected || !selectRowIds.length
            ? _l('将视图下数据导出为 Excel')
            : _l('将选中的%0条数据导出为 Excel', selectRowIds.length)
        }
        width={470}
        okText={_l('导出')}
        onCancel={onHide}
        onOk={this.getToken}
      >
        {!!showTabs && (
          <div className="flexRow exportSheetSwitch mBottom15">
            {[
              { text: _l('导出表格显示列字段'), value: true },
              { text: _l('导出所有字段'), value: false },
            ].map((item, index) => {
              return (
                <div
                  key={index}
                  className={cx({ 'ThemeColor3 ThemeBorderColor3 active': item.value === exportShowColumns })}
                  onClick={() => {
                    this.setState({
                      exportShowColumns: item.value,
                      columnsSelected: this.getDefaultColumnsSelected(!item.value),
                    });
                  }}
                >
                  {item.text}
                </div>
              );
            })}
          </div>
        )}

        {this.renderTitle(_l('字段'), exportColumns)}
        {this.renderSheetColumns(exportColumns)}

        {!!exportMoreRecord.length && (
          <Fragment>
            {this.renderTitle(_l('关联表'), exportMoreRecord)}
            {this.renderSheetColumns(exportMoreRecord)}
          </Fragment>
        )}

        <div className="title">{_l('其他')}</div>
        <Checkbox
          text={_l('列统计结果')}
          checked={isStatistics}
          size="small"
          onClick={() => this.setState({ isStatistics: !isStatistics })}
        />
      </Dialog>
    );
  }
}
