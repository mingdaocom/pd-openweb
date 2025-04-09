import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import { Dialog, Checkbox, Radio, Icon, RadioGroup, LoadDiv } from 'ming-ui';
import appManagement from 'src/api/appManagement';
import './ExportSheet.less';
import { isRelateRecordTableControl } from 'worksheet/util';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import _ from 'lodash';
import worksheetAjax from 'src/api/worksheet';
import { getFilledRequestParams } from '../../util';
import { Tooltip } from 'antd';

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
    onHide: PropTypes.func,
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
    const exportExtIds = {};
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, props.sheetSwitchPermit);

    // 字段列表添加记录ID
    props.columns.unshift({ type: 2, controlId: 'rowid', controlName: _l('记录ID') });
    if (!isShowWorkflowSys) {
      _.remove(props.columns, o =>
        _.includes(['wfname', 'wfstatus', 'wfcuaids', 'wfrtime', 'wfftime', 'wfcaid', 'wfctime'], o.controlId),
      );
    }

    // 成员、部门、关联表支持映射
    props.columns
      .filter(column => _.includes([26, 27, 29], column.type))
      .map(column => {
        const { controlId } = column;
        const userId = false;
        const jobId = false;
        const depId = false;
        const relaRowId = false;
        exportExtIds[controlId] = {
          userId,
          jobId,
          depId,
          relaRowId,
        };
      });

    // 是否允许切换为导出表格显示所有字段
    const exportShowColumns = props.exportView.viewType === 0;
    const showTabs =
      exportShowColumns &&
      (props.exportView.advancedSetting.customdisplay === '1' || (props.exportView.showControls || []).length);

    this.state = {
      loading: true,
      edited: true,
      initEdited: false,
      type: 0,
      showTabs,

      // 是否导出表格所有字段
      exportShowColumns,
      columnsSelected: this.getDefaultColumnsSelected(exportShowColumns, showTabs),

      // 列统计结果
      isStatistics: false,
      // 在其他sheet导出关联表
      exportRelationalSheet: false,

      // 成员字段和关联表字段
      exportExtIds,

      columnSearchWord: '', // 字段实时搜索
      speed: false, // 加速导出
      isNumber: false, // 导出数值类型
    };
  }

  componentDidMount() {
    const {
      columns,
      worksheetId,
      exportView: { viewId },
      isCharge,
    } = this.props;
    let { columnsSelected } = this.state;
    const { showTabs, exportExtIds } = this.state;

    worksheetAjax.getExportConfig({ worksheetId, viewId }).then(res => {
      if (res.status === 0) {
        this.setState({ loading: false, edited: res.edited });
        return;
      }

      // 导出所有字段的时候默认值处理
      if (showTabs && res.exportFieldType === 0) {
        columnsSelected = this.getDefaultColumnsSelected();
      }

      let exportRelationalSheet = false;

      Object.keys(columnsSelected).forEach(key => {
        columnsSelected[key] = _.includes(res.controlIds, key);
      });

      res.exportExtIds.forEach(item => {
        if (exportExtIds[item.controlId]) {
          item.extIds.forEach(key => {
            exportExtIds[item.controlId][key] = true;
          });
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
        exportShowColumns: showTabs ? res.exportFieldType : 0,
        columnsSelected,
        exportExtIds,
        exportRelationalSheet,
        isNumber: res.isNumber || false,
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

  getDefaultColumnsSelected(exportShowColumns, showTabs) {
    const selected = {};
    const { sheetHiddenColumns, exportView, columns, isCharge } = this.props;
    const { showControls } = exportView;

    // 选择导出表格显示列字段
    if (exportShowColumns && showTabs) {
      showControls
        .filter(id => {
          const currentObj = columns.find(obj => obj.controlId === id);

          return (
            this.checkControlVisible(currentObj) && !(isRelateRecordTableControl(currentObj) || currentObj.type === 34)
          );
        })
        .forEach(controlId => {
          selected[controlId] = !_.includes(sheetHiddenColumns, controlId);
        });
    }

    // 导出所有字段
    else {
      this.sortControls(
        columns
          .filter(item => isCharge || this.checkControlVisible(item))
          .filter(item => !(isRelateRecordTableControl(item) || [34, 43, 49, 50].includes(item.type))),
      ).forEach(column => {
        if (isCharge && !this.checkControlVisible(column)) {
          selected[column.controlId] = false;
        } else {
          selected[column.controlId] = true;
        }
      });

      // 增加记录id
      selected.rowid = true;
    }
    return selected;
  }

  /**
   * 切换导出所有字段 / 导出表格显示字段
   */
  switchColumnType = value => {
    const { exportExtIds, showTabs } = this.state;

    // 清空人员字段、关联字段的子字段选择
    for (const key in exportExtIds) {
      exportExtIds[key].userId = false;
      exportExtIds[key].jobId = false;
      exportExtIds[key].depId = false;
      exportExtIds[key].relaRowId = false;
    }

    this.setState({
      exportShowColumns: value,

      // 清空搜索框的值
      columnSearchWord: '',
      exportExtIds,

      // 导出当前表格所显示字段
      columnsSelected: this.getDefaultColumnsSelected(value, showTabs),
    });
  };

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
    const { exportExtIds, columnsSelected } = this.state;

    // 判断当前状态是否全选
    const columns = Object.keys(columnsSelected);
    const selectAllColumnIds = !columns
      .filter(id => !_.find(oldColumns, o => o.controlId === id))
      .some(item => !columnsSelected[item]);

    // 全选 / 取消全选
    columns
      .filter(id => !_.find(oldColumns, o => o.controlId === id))
      .map(item => (columnsSelected[item] = !selectAllColumnIds));

    // 如果是取消全选，则清空人员字段、关联字段
    for (const key in exportExtIds) {
      exportExtIds[key].userId = false;
      exportExtIds[key].jobId = false;
      exportExtIds[key].depId = false;
      exportExtIds[key].relaRowId = false;
    }

    this.setState({
      columnsSelected,
      exportExtIds,
    });
  }

  /**
   * 确认导出
   */
  exportExcel() {
    (async () => {
      const {
        columns,
        allCount,
        allWorksheetIsSelected,
        worksheetId,
        exportView: { viewId },
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
      const { columnsSelected, isStatistics, exportShowColumns, exportExtIds, type, speed, isNumber } = this.state;

      // 获取Token 功能模块 token枚举，3 = 导出excel，4 = 导入excel生成表，5= word打印
      const token = await appManagement.getToken({ worksheetId, viewId, tokenType: 3 });
      const exportControlsId = [];
      _.forEach(columnsSelected, (value, key) => {
        columnsSelected[key] && exportControlsId.push(key);
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
        isSort: exportShowColumns,
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
        // 成员字段、部门字段、关联表字段
        exportExtIds: columns
          .filter(column => {
            return _.includes([26, 27, 29], column.type) && columnsSelected[column.controlId];
          })
          .map(column => {
            const { controlId } = column;
            const { userId, jobId, depId, relaRowId } = exportExtIds[controlId];
            const extIds = [];

            // 成员ID
            if (userId) extIds.push('userId');

            // 工号
            if (jobId) extIds.push('jobId');

            // 部门系统ID
            if (depId) extIds.push('depId');

            // 关联表记录ID
            if (relaRowId) extIds.push('relaRowId');
            return { extIds, controlId };
          })
          .filter(item => item.extIds.length),
        isNumber,
        sortRelationCids: speed ? [] : exportControlsId,
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

      this.props.onHide();
    })().catch(() => {});
  }

  /**
   * 排序
   */
  sortControls(columns) {
    return columns.sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }
      return a.row - b.row;
    });
  }

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
          <div className="Gray_75">
            {_l('将当前导出配置保存为默认导出方式供所有用户使用，会保存已选字段（导出所有字段）、其他、以及导出格式')}
          </div>
          <Checkbox
            className="mTop20 Gray"
            text={_l('不允许用户修改默认配置')}
            defaultChecked={this.state.initEdited}
            onClick={checked => this.setState({ initEdited: checked })}
          />
        </div>
      ),
      onOk: () => {
        const {
          columns,
          worksheetId,
          exportView: { viewId },
        } = this.props;
        const { columnsSelected, exportShowColumns, exportExtIds, type, showTabs, isStatistics, initEdited, isNumber } =
          this.state;
        const controlIds = [];
        _.forEach(columnsSelected, (value, key) => {
          columnsSelected[key] && controlIds.push(key);
        });
        const args = {
          type,
          // 成员字段、部门字段、关联表字段
          exportExtIds: columns
            .filter(column => {
              return _.includes([26, 27, 29], column.type) && columnsSelected[column.controlId];
            })
            .map(column => {
              const { controlId } = column;
              const { userId, jobId, depId, relaRowId } = exportExtIds[controlId];
              const extIds = [];

              // 成员ID
              if (userId) extIds.push('userId');

              // 工号
              if (jobId) extIds.push('jobId');

              // 部门系统ID
              if (depId) extIds.push('depId');

              // 关联表记录ID
              if (relaRowId) extIds.push('relaRowId');
              return { extIds, controlId };
            })
            .filter(item => item.extIds.length),
          controlIds,
          getColumnRpt: isStatistics,
          exportFieldType: showTabs && exportShowColumns ? 1 : 0,
          edited: initEdited,
          worksheetId,
          viewId,
          isNumber,
        };

        worksheetAjax.saveExportConfig(args).then(res => {
          alert(_l('保存成功'));
        });
      },
    });
  };

  render() {
    const { allCount, onHide, allWorksheetIsSelected, selectRowIds, exportView, hideStatistics, isCharge } = this.props;
    let columns = [].concat(this.props.columns);
    const { advancedSetting, showControls } = exportView;
    const {
      type,
      isStatistics,
      exportShowColumns,
      showTabs,
      columnsSelected,
      exportRelationalSheet,
      exportExtIds,
      columnSearchWord,
      loading,
      edited,
      speed,
      isNumber,
    } = this.state;

    if (
      exportView.viewType === 0 &&
      (advancedSetting.customdisplay === '1' || (showControls || []).length) &&
      exportShowColumns
    ) {
      columns = exportView.showControls.map(id => columns.find(item => item.controlId === id)).filter(item => !!item);
    } else {
      columns = this.sortControls(columns);
    }

    // 过滤掉不支持导出的字段、无权限字段
    const notSupportableTtpe = [22, 34, 42, 43, 45, 47, 49, 50, 51, 52, 10010];
    const exportColumns = columns.filter(
      item =>
        !isRelateRecordTableControl(item) &&
        !notSupportableTtpe.includes(item.type) &&
        (isCharge || this.checkControlVisible(item)) &&
        item.controlName.indexOf(columnSearchWord) >= 0,
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
        width={560}
        okText={_l('导出')}
        footerLeftElement={() =>
          isCharge ? (
            <span className="ThemeColor3 ThemeHoverColor2 pointer" onClick={this.saveConfig}>
              {_l('保存导出配置')}
            </span>
          ) : null
        }
        onCancel={onHide}
        onOk={() => this.exportExcel()}
      >
        {loading ? (
          <LoadDiv />
        ) : (
          <Fragment>
            {allCount > 1000 && !selectRowIds.length && (
              <div className="exportSheetMessage flexRow alignItemsCenter">
                <Icon icon="info" className="Font16 mRight6 ThemeColor3" />
                {_l('记录超过1000条，将按照创建时间排序（新的在前）')}
              </div>
            )}

            {/** 是否选择导出所有字段 */}
            {!!showTabs && (
              <div className="exportSheetTabs">
                <Radio
                  size="small"
                  text={_l('导出当前表格显示列的字段')}
                  disabled={edited}
                  checked={exportShowColumns}
                  onClick={() => this.switchColumnType(true)}
                />
                <Radio
                  size="small"
                  text={_l('导出所有字段')}
                  disabled={edited}
                  checked={!exportShowColumns}
                  onClick={() => this.switchColumnType(false)}
                />
              </div>
            )}

            {/** 表格的字段列表 */}
            <div className="title" />
            {(!exportShowColumns || !showTabs) && (
              <Fragment>
                {/** 字段搜索框 */}
                <div className="search_container">
                  {/** 是否全选 */}
                  <Checkbox
                    text={_l('全选')}
                    size="small"
                    disabled={edited}
                    checked={selectAllColumnIds}
                    onClick={() => this.selectAllColumnId()}
                  >
                    {/** 字段数量统计 */}
                    <span style={{ marginLeft: '6px', color: '#9E9E9E' }}>
                      ({columnsSelectedNum.length}/{columnsShow.length})
                    </span>
                  </Checkbox>

                  {/** 字段搜索框 */}
                  <div className="search_input">
                    <i className="icon icon-search Gray_9e" />
                    <input
                      placeholder={_l('搜索字段名称')}
                      onInput={e => this.setState({ columnSearchWord: e.target.value || '' })}
                    />
                  </div>
                </div>

                {/** 未搜索到数据 */}
                {!exportColumns.length && <div className="no_data">{_l('未搜索到相关字段')}</div>}

                {/** 字段列表 */}
                {exportColumns.map(column => (
                  <Fragment>
                    {/** 字段选择 */}
                    <Checkbox
                      style={{ left: '20px' }}
                      key={column.controlId}
                      size="small"
                      text={
                        <Fragment>
                          {column.controlName || ''}
                          {isCharge && !this.checkControlVisible(column) && (
                            <Icon type="workflow_hide" className="Font14 Gray_9e mLeft5" />
                          )}
                        </Fragment>
                      }
                      disabled={edited}
                      checked={!!columnsSelected[column.controlId]}
                      onClick={() => this.chooseColumnId(column)}
                    />

                    {/** 关联字段列表 */}
                    {column.type == 29 && !!columnsSelected[column.controlId] && (
                      <Fragment>
                        {/** 标题 */}
                        <Checkbox
                          disabled={true}
                          style={{ left: '40px' }}
                          size="small"
                          checked={true}
                          onClick={() => {}}
                        >
                          <span>{_l('标题')}</span>
                        </Checkbox>

                        {/** 记录ID */}
                        <Checkbox
                          style={{ left: '40px' }}
                          size="small"
                          disabled={edited}
                          checked={exportExtIds[column.controlId].relaRowId}
                          text={_l('记录ID')}
                          onClick={() => {
                            exportExtIds[column.controlId].relaRowId = !exportExtIds[column.controlId].relaRowId;
                            this.setState({ exportExtIds });
                          }}
                        />
                      </Fragment>
                    )}

                    {/** 成员字段 */}
                    {column.type == 26 &&
                      (!column.advancedSetting || column.advancedSetting.usertype != '2') &&
                      !!columnsSelected[column.controlId] &&
                      !['wfcuaids', 'wfcaid'].includes(column.controlId) && (
                        <Fragment>
                          {/** 姓名 */}
                          <Checkbox
                            disabled={true}
                            style={{ left: '40px' }}
                            size="small"
                            checked={true}
                            onClick={() => {}}
                          >
                            <span>{_l('姓名')}</span>
                          </Checkbox>

                          {/** 工号 */}
                          <Checkbox
                            style={{ left: '40px' }}
                            size="small"
                            disabled={edited}
                            checked={exportExtIds[column.controlId].jobId}
                            text={_l('工号')}
                            onClick={() => {
                              exportExtIds[column.controlId].jobId = !exportExtIds[column.controlId].jobId;
                              this.setState({ exportExtIds });
                            }}
                          />

                          {/** 人员ID */}
                          <Checkbox
                            style={{ left: '40px' }}
                            size="small"
                            disabled={edited}
                            checked={exportExtIds[column.controlId].userId}
                            text={_l('人员ID')}
                            onClick={() => {
                              exportExtIds[column.controlId].userId = !exportExtIds[column.controlId].userId;
                              this.setState({ exportExtIds });
                            }}
                          />
                        </Fragment>
                      )}

                    {/** 部门字段 */}
                    {column.type == 27 && !!columnsSelected[column.controlId] && (
                      <Fragment>
                        {/** 名称 */}
                        <Checkbox
                          disabled={true}
                          style={{ left: '40px' }}
                          size="small"
                          checked={true}
                          onClick={() => {}}
                        >
                          <span>{_l('名称')}</span>
                        </Checkbox>

                        {/** 部门系统ID */}
                        <Checkbox
                          style={{ left: '40px' }}
                          size="small"
                          disabled={edited}
                          checked={exportExtIds[column.controlId].depId}
                          text={_l('部门系统ID')}
                          onClick={() => {
                            exportExtIds[column.controlId].depId = !exportExtIds[column.controlId].depId;
                            this.setState({ exportExtIds });
                          }}
                        />
                      </Fragment>
                    )}
                  </Fragment>
                ))}
              </Fragment>
            )}

            <div className="title">{_l('其他')}</div>

            {/** 列统计结果 */}
            {!hideStatistics && (
              <Checkbox
                text={_l('列统计结果')}
                disabled={edited}
                checked={isStatistics}
                size="small"
                onClick={() => this.setState({ isStatistics: !isStatistics })}
              />
            )}

            <Checkbox
              text={_l('在其他sheet导出关联数据')}
              checked={exportRelationalSheet && type !== 1}
              disabled={type === 1 || edited}
              size="small"
              onClick={() => {
                // 默认全选导出所有关联表
                const { columnsSelected, exportRelationalSheet } = this.state;
                exportMoreRecord.forEach(column => (columnsSelected[column.controlId] = !exportRelationalSheet));
                this.setState({ exportRelationalSheet: !exportRelationalSheet, columnsSelected });
              }}
            />

            {exportRelationalSheet &&
              exportMoreRecord.map(column => (
                <div className="flexRow">
                  <div className="flex mLeft25">
                    <Checkbox
                      key={column.controlId}
                      size="small"
                      disabled={type === 1 || edited}
                      text={column.controlName || ''}
                      checked={!!columnsSelected[column.controlId] && type !== 1}
                      onClick={() => this.chooseColumnId(column)}
                    />
                  </div>
                </div>
              ))}

            <Checkbox
              text={
                <span>
                  {_l('加速导出')}
                  <Tooltip
                    overlayStyle={{ maxWidth: 350 }}
                    title={
                      <Fragment>
                        <div>{_l('导出以下字段时，将使用冗余值，可能会导出旧数据：')}</div>
                        <div>{_l('关联表：显示方式为卡片或下拉框')}</div>
                        <div>{_l('级联选择：高级设置中勾选“选择结果显示层级路径”')}</div>
                        <div>{_l('他表字段：类型为存储数据')}</div>
                        <div>{_l('关联记录：忽略排序设置，使用添加时的顺序')}</div>
                      </Fragment>
                    }
                  >
                    <i className="icon-info mLeft5 Font16 Gray_9e"></i>
                  </Tooltip>
                </span>
              }
              checked={speed}
              size="small"
              onClick={() => this.setState({ speed: !speed })}
            />

            <div className="title">{_l('导出格式')}</div>
            <RadioGroup
              data={[
                { text: _l('Excel 文件（.xlsx）'), value: 0 },
                { text: _l('CSV 文件（.csv）'), value: 1 },
              ]}
              size="small"
              checkedValue={type}
              disabled={edited}
              onChange={type => this.setState({ type })}
            />

            {type === 0 && (
              <div className="mTop10">
                <Checkbox
                  size="small"
                  text={
                    <span>
                      {_l('导出为Excel数值类型')}
                      <Tooltip
                        overlayStyle={{ maxWidth: 350 }}
                        title={
                          <div>
                            <div>{_l('以下类型有效')}</div>
                            <div>{_l('数值、金额、公式（输出类型为数值）、汇总（输出类型为数值）、等级')}</div>
                          </div>
                        }
                      >
                        <i className="icon-info mLeft5 Font16 Gray_9e"></i>
                      </Tooltip>
                    </span>
                  }
                  checked={isNumber}
                  disabled={edited}
                  onClick={() => this.setState({ isNumber: !isNumber })}
                />
              </div>
            )}
          </Fragment>
        )}
      </Dialog>
    );
  }
}
