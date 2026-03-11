import React, { Component, Fragment } from 'react';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { Button, Checkbox, Dialog, Dropdown, Icon, LoadDiv, RadioGroup, ScrollView } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import appManagement from 'src/api/appManagement';
import worksheetAjax from 'src/api/worksheet';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { getIconByType } from 'src/pages/widgetConfig/util/index.js';
import { getFilledRequestParams } from 'src/utils/common';
import { isRelateRecordTableControl } from 'src/utils/control';
import './ExportSheet.less';

export default class ExportSheet extends Component {
  static propTypes = {
    allCount: PropTypes.number,
    sheetHiddenColumns: PropTypes.array,
    allWorksheetIsSelected: PropTypes.boolean,
    worksheetId: PropTypes.string,
    exportView: PropTypes.object,
    projectId: PropTypes.string,
    downLoadUrl: PropTypes.string, // 导出路径
    columns: PropTypes.arrayOf(PropTypes.shape({})),
    onClose: PropTypes.func,
    searchArgs: PropTypes.object, // 筛选条件
    columnRpts: PropTypes.array, // 统计条件
    selectRowIds: PropTypes.array, // 多选导出的话选中的行id
    worksheetSummaryTypes: PropTypes.shape({}),
    quickFilter: PropTypes.object,
    navGroupFilters: PropTypes.object,
    isCharge: PropTypes.bool,
    hideStatistics: PropTypes.bool,
    sortControls: PropTypes.array,
  };

  constructor(props) {
    super(props);
    // 字段列表添加记录ID
    props.columns.unshift({ type: 2, controlId: 'rowid', controlName: _l('记录ID') });

    if (!isOpenPermit(permitList.sysControlSwitch, props.sheetSwitchPermit)) {
      _.remove(props.columns, o =>
        _.includes(
          ['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfcaid', 'wfctime', 'wfcotime', 'wfdtime'],
          o.controlId,
        ),
      );
    }

    this.state = {
      loading: true,
      edited: true,
      initEdited: false,
      type: 0,
      columnsSelected: this.getDefaultColumnsSelected(),
      isStatistics: false, // 列统计结果
      exportRelationalSheet: false, // 在其他sheet导出关联表
      columnSearchWord: '', // 字段实时搜索
      speed: false, // 加速导出
      isNumber: true, // 导出数值类型
      previewed: true,
      exportId: false,
      exportJob: false,
      orderType: 0,
    };
  }

  componentDidMount() {
    const { columns, worksheetId, exportView, isCharge } = this.props;
    let { columnsSelected } = this.state;
    let exportId = false;
    let exportJob = false;

    worksheetAjax.getExportConfig({ worksheetId, viewId: exportView.viewId }).then(res => {
      if (res.status === 0) {
        this.setState({ loading: false, edited: res.edited });
        return;
      }

      // 导出所有字段的时候默认值处理
      if (res.exportFieldType === 0) {
        columnsSelected = this.getDefaultColumnsSelected();
      }

      let exportRelationalSheet = false;

      Object.keys(columnsSelected).forEach(key => {
        columnsSelected[key] = _.includes(res.controlIds, key);
      });

      (res.exportExtIds || []).forEach(item => {
        if (item.extIds.includes('userId') || item.extIds.includes('depId') || item.extIds.includes('relaRowId')) {
          exportId = true;
        }
        if (item.extIds.includes('jobId')) {
          exportJob = true;
        }
      });

      columns
        .filter(item => (isRelateRecordTableControl(item) && item.type !== 51) || item.type === 34)
        .forEach(({ controlId }) => {
          if (_.includes(res.controlIds, controlId)) {
            columnsSelected[controlId] = true;
            exportRelationalSheet = true;
          }
        });

      this.setState({
        loading: false,
        edited: res.edited && !isCharge,
        initEdited: res.edited,
        isStatistics: res.getColumnRpt,
        type: res.type,
        columnsSelected,
        exportRelationalSheet,
        isNumber: res.isNumber || false,
        previewed: res.previewed || false,
        exportId: res.exportId || exportId,
        exportJob: res.exportJob || exportJob,
      });
    });
  }

  getColumnRpts(exportControlsId = []) {
    const { columns, worksheetSummaryTypes } = this.props;
    return columns
      .filter(control => _.includes(exportControlsId, control.controlId))
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

  getDefaultColumnsSelected() {
    const selected = {};
    const { sheetHiddenColumns, exportView, columns, isCharge } = this.props;
    const { viewType, showControls, advancedSetting } = exportView;

    columns
      .filter(item => isCharge || this.checkControlVisible(item))
      .filter(item => !(isRelateRecordTableControl(item) || [34, 43, 49, 50].includes(item.type)))
      .filter(item => !_.includes(sheetHiddenColumns, item.controlId))
      .forEach(column => {
        if (isCharge && !this.checkControlVisible(column)) {
          selected[column.controlId] = false;
        } else {
          selected[column.controlId] =
            viewType === 0 && advancedSetting.customdisplay === '1' ? _.includes(showControls, column.controlId) : true;
        }
      });

    // 增加记录id
    selected.rowid = true;

    return selected;
  }

  /**
   * 选择 / 取消选择字段
   */
  chooseColumnId(column) {
    const { columnsSelected } = this.state;
    const newSelected = Object.assign({}, columnsSelected);
    newSelected[column.controlId] = !columnsSelected[column.controlId];

    this.setState({ columnsSelected: newSelected });
  }

  /**
   * 全选 / 取消全选
   */
  selectAllColumnId() {
    let oldColumns = this.props.columns.filter(
      item => (isRelateRecordTableControl(item) && item.type !== 51) || item.type === 34,
    );
    const { columnsSelected } = this.state;

    // 判断当前状态是否全选
    const columns = Object.keys(columnsSelected);
    const selectAllColumnIds = !columns
      .filter(id => !_.find(oldColumns, o => o.controlId === id))
      .some(item => !columnsSelected[item]);

    // 全选 / 取消全选
    columns
      .filter(id => !_.find(oldColumns, o => o.controlId === id))
      .map(item => (columnsSelected[item] = !selectAllColumnIds));

    this.setState({ columnsSelected });
  }

  /**
   * 确认导出
   */
  exportExcel = async () => {
    const {
      columns,
      allWorksheetIsSelected,
      worksheetId,
      exportView: { viewId, viewType, advancedSetting },
      projectId,
      chartId,
      selectRowIds,
      appId,
      searchArgs: { filterControls, keyWords, searchType },
      quickFilter = [],
      navGroupFilters,
      filtersGroup = [],
      sortControls,
    } = this.props;
    const { columnsSelected, isStatistics, type, speed, isNumber, previewed, exportId, exportJob, orderType } =
      this.state;

    // 获取Token 功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
    const token = await appManagement.getToken({ worksheetId, viewId, tokenType: 3 });
    const exportControlsId = [];

    this.sortControls(columns).forEach(column => {
      columnsSelected[column.controlId] && exportControlsId.push(column.controlId);
    });

    const args = getFilledRequestParams({
      token,
      accountId: md.global.Account.accountId,
      worksheetId,
      appId,
      viewId,
      projectId,
      reportId: chartId,
      type,
      exportControlsId,
      filterControls,
      keyWords,
      searchType,
      rowIds: selectRowIds,
      isSort: viewType === 0 && advancedSetting.customdisplay === '1',
      sortControls,
      fastFilters: (quickFilter || [])
        .concat(filtersGroup)
        .map(f =>
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
      speed,
      isNumber,
      sortRelationCids: speed ? [] : exportControlsId,
      previewed,
      exportId,
      exportJob,
      orderType,
    });

    if (allWorksheetIsSelected) {
      delete args['rowIds'];
      args.excludeRowIds = selectRowIds;
    }

    // 未选择字段
    if (!exportControlsId.length) {
      alert(_l('至少选择一个字段'), 3);
      return;
    }

    // 是否需要导出列统计结果
    args.columnRpts = isStatistics ? this.getColumnRpts(exportControlsId) : null;

    // 访问导出excel接口
    window.mdyAPI('', '', args, {
      customParseResponse: true,
      ajaxOptions: { url: `${this.props.downLoadUrl}/ExportExcel/Export` },
    });

    this.props.onClose();
  };

  /**
   * 排序
   */
  sortControls = columns => {
    const { exportView } = this.props;

    columns.sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });

    return exportView.viewType === 0 &&
      exportView.advancedSetting.customdisplay === '1' &&
      !!exportView.showControls?.length
      ? this.showControlsSort(
          columns,
          exportView.showControls.includes('rowid')
            ? exportView.showControls
            : ['rowid'].concat(exportView.showControls),
        )
      : columns;
  };

  /**
   * 根据显示列排序
   */
  showControlsSort = (a, b) => {
    const grouped = _.groupBy(a, obj => (b.includes(obj.controlId) ? 'matched' : 'unmatched'));
    const orderMap = _.fromPairs(b.map((id, index) => [id, index]));
    const matchedSorted = _.sortBy(grouped.matched || [], obj => orderMap[obj.controlId]);
    const unmatched = grouped.unmatched || [];

    return _.concat(matchedSorted, unmatched);
  };

  /**
   * 保存配置
   */
  saveConfig = () => {
    const { columnsSelected } = this.state;
    const exportControlsId = [];

    _.forEach(columnsSelected, (value, key) => {
      columnsSelected[key] && exportControlsId.push(key);
    });

    // 未选择字段
    if (!exportControlsId.length) {
      alert(_l('至少选择一个字段'), 3);
      return;
    }

    Dialog.confirm({
      title: _l('保存导出配置'),
      description: (
        <div className="Font14">
          <div className="textSecondary">
            {_l('将当前导出配置保存为默认导出方式供所有用户使用，会保存已选字段（导出所有字段）、其他、以及导出格式')}
          </div>
          <Checkbox
            className="mTop20 textPrimary"
            text={_l('不允许用户修改默认配置')}
            defaultChecked={this.state.initEdited}
            onClick={checked => this.setState({ initEdited: checked })}
          />
        </div>
      ),
      onOk: () => {
        const { worksheetId, exportView } = this.props;
        const { type, isStatistics, initEdited, isNumber, previewed, exportId, exportJob } = this.state;
        const args = {
          type,
          controlIds: exportControlsId,
          getColumnRpt: isStatistics,
          exportFieldType: 0,
          edited: initEdited,
          worksheetId,
          viewId: exportView.viewId,
          isNumber,
          previewed,
          exportId,
          exportJob,
        };

        worksheetAjax.saveExportConfig(args).then(() => {
          alert(_l('保存成功'));
        });
      },
    });
  };

  render() {
    const { allCount, onClose, allWorksheetIsSelected, selectRowIds, hideStatistics, isCharge, columns } = this.props;
    const {
      type,
      isStatistics,
      columnsSelected,
      exportRelationalSheet,
      columnSearchWord,
      loading,
      edited,
      speed,
      isNumber,
      previewed,
      exportId,
      exportJob,
      orderType,
    } = this.state;

    // 过滤掉不支持导出的字段、无权限字段
    const notSupportableTtpe = [22, 34, 42, 43, 45, 47, 49, 50, 51, 52, 10010];
    const exportColumns = columns.filter(
      item =>
        !isRelateRecordTableControl(item) &&
        !notSupportableTtpe.includes(item.type) &&
        (isCharge || this.checkControlVisible(item)),
    );

    // 关联、字表字段列表
    const exportMoreRecord = columns.filter(
      item => (isRelateRecordTableControl(item) && item.type !== 51) || item.type === 34,
    );

    // 判断当前状态是否全选
    const columnsShow = Object.keys(columnsSelected).filter(id => exportColumns.find(column => column.controlId == id));
    const selectAllColumnIds = !columnsShow.some(item => !columnsSelected[item]);

    // 计算已选字段数量
    const columnsSelectedNum = columnsShow.filter(item => columnsSelected[item]);

    const list = exportColumns.filter(
      item => item.controlName.toLocaleLowerCase().indexOf(columnSearchWord.toLocaleLowerCase()) >= 0,
    );

    return (
      <Dialog className="exportSheet" visible anim={false} width={960} footer={null} onCancel={onClose}>
        <div className="flexRow flex">
          <div className="flex flexColumn">
            <div className="Font17 bold mLeft24 mTop20">
              {allWorksheetIsSelected || !selectRowIds.length
                ? _l('导出视图下的全部数据')
                : _l('导出选中的%0条数据', selectRowIds.length)}
            </div>
            <div className="search_container">
              {/** 是否全选 */}
              <Checkbox
                text={_l('导出字段')}
                className="bold Font14"
                disabled={edited}
                checked={selectAllColumnIds}
                onClick={() => this.selectAllColumnId()}
              >
                {/** 字段数量统计 */}
                <span className="Font14 mLeft5 textTertiary">
                  ({columnsSelectedNum.length}/{columnsShow.length})
                </span>
              </Checkbox>

              {/** 字段搜索框 */}
              <div className="search_input">
                <i className="icon-search textTertiary Font16" />
                <input
                  placeholder={_l('搜索')}
                  onChange={e => this.setState({ columnSearchWord: e.target.value || '' })}
                />
              </div>
            </div>

            {loading ? (
              <LoadDiv className="mTo10" />
            ) : !list.length ? (
              <div className="no_data flex">{_l('未搜索到相关字段')}</div>
            ) : (
              <ScrollView className="flex" style={{ paddingLeft: 52 }}>
                {this.sortControls(list).map(column => (
                  <Checkbox
                    key={column.controlId}
                    text={
                      <Fragment>
                        <i className={`Font16 textTertiary mRight5 icon-${getIconByType(column.type)}`}></i>
                        {column.controlName || ''}
                        {isCharge && !this.checkControlVisible(column) && (
                          <Icon type="workflow_hide" className="Font14 textTertiary mLeft5" />
                        )}
                      </Fragment>
                    }
                    disabled={edited}
                    checked={!!columnsSelected[column.controlId]}
                    onClick={() => this.chooseColumnId(column)}
                  />
                ))}
              </ScrollView>
            )}
          </div>
          <div className="flex bgTertiary flexColumn">
            <ScrollView className="flex">
              {allCount > 1000 && !selectRowIds.length && (
                <div className="pRight24 mBottom20">
                  <div className="Font14 bold">{_l('排序')}</div>
                  <Dropdown
                    className="mTop10 w100 bgPrimary"
                    menuClass="w100"
                    border
                    value={orderType}
                    data={[
                      { text: _l('创建时间-旧的在前'), value: 0 },
                      { text: _l('创建时间-新的在前'), value: 1 },
                    ]}
                    onChange={orderType => this.setState({ orderType })}
                  />
                  <div className="exportSheetMessage mTop5">{_l('记录超过1000条，仅支持按创建时间排序')}</div>
                </div>
              )}

              <div className="Font14 bold mBottom10">{_l('导出格式')}</div>
              <RadioGroup
                className="Font14"
                data={[
                  { text: _l('excel'), value: 0 },
                  { text: _l('csv'), value: 1 },
                ]}
                checkedValue={type}
                disabled={edited}
                onChange={type => this.setState({ type })}
              />

              <div className="Font14 bold mTop20 mBottom10">{_l('导出设置')}</div>

              {type === 0 && (
                <Fragment>
                  <Checkbox
                    text={
                      <span>
                        {_l('附件字段生成预览链接')}
                        <Tooltip
                          title={_l(
                            '导出的Excel中对每个附件字段都会新增一列「预览链接」，点击后可以直接在浏览器中预览附件（按照查看者的账号权限）',
                          )}
                        >
                          <i className="icon-info mLeft5 Font16 textTertiary"></i>
                        </Tooltip>
                      </span>
                    }
                    checked={previewed}
                    disabled={edited}
                    onClick={() => this.setState({ previewed: !previewed })}
                  />

                  <Checkbox
                    text={
                      <span>
                        {_l('导出 Excel 数值格式')}
                        <Tooltip
                          title={_l(
                            '对以下字段类型：数值、金额、等级、公式（数值类型）、汇总（数值类型），在导出时只保留纯数值（不含前后缀），便于在excel中分析或重新导入；取消勾选后，则按包含前后缀的文本导出。',
                          )}
                        >
                          <i className="icon-info mLeft5 Font16 textTertiary"></i>
                        </Tooltip>
                      </span>
                    }
                    checked={isNumber}
                    disabled={edited}
                    onClick={() => this.setState({ isNumber: !isNumber })}
                  />

                  {!hideStatistics && (
                    <Checkbox
                      text={_l('列统计结果')}
                      disabled={edited}
                      checked={isStatistics}
                      onClick={() => this.setState({ isStatistics: !isStatistics })}
                    />
                  )}
                </Fragment>
              )}

              <Checkbox
                text={_l('同时导出数据ID')}
                checked={exportId}
                disabled={edited}
                onClick={() => this.setState({ exportId: !exportId })}
              />
              <div className="textTertiary exportSheetDesc">
                {_l('为关联记录、级联选择、成员、部门等字段额外导出一列ID，便于后续按 ID 精确匹配导入数据')}
              </div>

              <Checkbox
                size="small"
                text={_l('导出成员工号')}
                checked={exportJob}
                disabled={edited}
                onClick={() => this.setState({ exportJob: !exportJob })}
              />
              <div className="textTertiary exportSheetDesc">{_l('为成员字段额外导出一列工号')}</div>

              <Checkbox
                text={
                  <span>
                    {_l('加速导出（可能已不是最新数据）')}
                    <Tooltip
                      title={
                        <Fragment>
                          <div>{_l('使用冗余值导出的字段：')}</div>
                          <div>{_l('- 关联记录（表格、标签页表格）：忽略排序设置，使用添加时的顺序；')}</div>
                          <div>{_l('- 关联记录（卡片、下拉框），使用冗余存储的记录标题；')}</div>
                          <div>
                            {_l('- 级联选择：高级设置中勾选“选择结果显示层级路径”时，使用冗余存储的层级路径；')}
                          </div>
                          <div>{_l('- 他表字段（存储数据）：使用存储值；')}</div>
                        </Fragment>
                      }
                    >
                      <i className="icon-info mLeft5 Font16 textTertiary"></i>
                    </Tooltip>
                  </span>
                }
                checked={speed}
                onClick={() => this.setState({ speed: !speed })}
              />
              <div className="textTertiary exportSheetDesc">
                {_l('优化大数据量导出速度，部分字段会直接使用冗余保存的值')}
              </div>

              {type === 0 && !!exportMoreRecord.length && (
                <Fragment>
                  <Checkbox
                    text={
                      <span>
                        {_l('在新的 Sheet 导出关联记录')}
                        <Tooltip
                          title={
                            <Fragment>
                              <div>{_l('勾选后，与本次记录关联的数据会被展开到新的工作表中：')}</div>
                              <div>{_l('- 每个关联记录字段会生成一个独立 Sheet；')}</div>
                              <div>{_l('- Sheet 中包含关联记录设置的所有显示字段；')}</div>
                              <div>{_l('- 仅导出与本次选中记录有关的数据，不导出关联表全部记录；')}</div>
                              <div>{_l('- 适合做深入分析，但会增加导出时间和文件大小。')}</div>
                            </Fragment>
                          }
                        >
                          <i className="icon-info mLeft5 Font16 textTertiary"></i>
                        </Tooltip>
                      </span>
                    }
                    checked={exportRelationalSheet}
                    disabled={edited}
                    onClick={() => {
                      // 默认全选导出所有关联表
                      const { columnsSelected, exportRelationalSheet } = this.state;

                      exportMoreRecord.forEach(column => (columnsSelected[column.controlId] = !exportRelationalSheet));
                      this.setState({ exportRelationalSheet: !exportRelationalSheet, columnsSelected });
                    }}
                  />
                  <div className="textTertiary exportSheetDesc">
                    {_l('在新的sheet中导出关联记录（表格、标签页表格），适合对关联数据做进一步分析')}
                  </div>

                  {exportRelationalSheet &&
                    exportMoreRecord.map(column => (
                      <div className="flexRow">
                        <div className="flex mLeft25">
                          <Checkbox
                            key={column.controlId}
                            disabled={edited}
                            text={column.controlName || ''}
                            checked={!!columnsSelected[column.controlId]}
                            onClick={() => this.chooseColumnId(column)}
                          />
                        </div>
                      </div>
                    ))}
                </Fragment>
              )}
            </ScrollView>

            <div className="flexRow alignItemsCenter mRight24">
              {isCharge && (
                <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={this.saveConfig}>
                  {_l('保存导出字段和配置')}
                </span>
              )}
              <div className="flex" />
              <Button disabled={loading} onClick={this.exportExcel}>
                {_l('导出')}
              </Button>
            </div>
          </div>
        </div>
      </Dialog>
    );
  }
}
