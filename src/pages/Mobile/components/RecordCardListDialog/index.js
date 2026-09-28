import React, { Component, Fragment } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import PropTypes from 'prop-types';
import { FunctionWrap, Icon, LoadDiv, ScrollView } from 'ming-ui';
import { PopupWrapper } from 'ming-ui/antd-mobile-components';
import publicWorksheetAjax from 'src/api/publicWorksheet';
import sheetAjax from 'src/api/worksheet';
import { FROM } from 'src/components/Form/core/config';
import { getCurrentValue } from 'src/components/Form/core/formUtils';
import RecordCoverCard from 'src/components/Form/MobileForm/components/RelateRecordCards/RecordCoverCard';
import RelateScanQRCode from 'src/components/Form/MobileForm/components/RelateScanQRCode.jsx';
import { getIsScanQR } from 'src/components/Form/MobileForm/components/ScanQRCode';
import RestrictAccessStatus from 'src/components/restrictAccessStatus';
import MobileNewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { fieldCanSort } from 'src/utils/domain/control/sort';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { getFilter } from 'src/utils/domain/worksheet/filterDynamic';
import { getCoverUrl } from 'src/utils/domain/worksheet/view';
import { getTranslateInfo } from 'src/utils/services/app';
import { compatibleMDJS } from 'src/utils/services/project';
import { replaceControlsTranslateInfo } from 'src/utils/services/translation/app';
import { formatFilterValues } from 'src/utils/services/worksheet/quickFilter';
import Filter from './Filter';
import QuickFilterView from './QuickFilterView';
import './index.less';

export default class RecordCardListDialog extends Component {
  static propTypes = {
    from: PropTypes.number, // 来源
    appId: PropTypes.string, // 他表字段被关联表所在应用id
    viewId: PropTypes.string, // 他表字段被关联表所在应用所在视图id
    relateSheetId: PropTypes.string, // 他表字段被关联表id
    parentWorksheetId: PropTypes.string, // 记录所在表id
    recordId: PropTypes.string, // 记录id
    controlId: PropTypes.string, // 他表字段id
    allowNewRecord: PropTypes.bool, // 允许新建记录
    disabledManualWrite: PropTypes.bool, // 禁止手动输入
    coverCid: PropTypes.string, // 封面字段 id
    showControls: PropTypes.arrayOf(PropTypes.string), // 显示在卡片里的字段 id 数组
    filterRowIds: PropTypes.arrayOf(PropTypes.string), // 过滤的记录
    ignoreRowIds: PropTypes.arrayOf(PropTypes.string), // 忽略的记录
    filterRelatesheetControlIds: PropTypes.arrayOf(PropTypes.string), // 过滤的关联表控件对应控件id
    multiple: PropTypes.bool, // 是否多选
    visible: PropTypes.bool, // 弹窗显示
    control: PropTypes.shape({}), // 关联表控件
    onClose: PropTypes.func, // 关闭回掉
    onOk: PropTypes.func, // 确定回掉
    formData: PropTypes.arrayOf(PropTypes.shape({})),
  };
  static defaultProps = {
    allowNewRecord: true,
    disabledManualWrite: false,
    filterRowIds: [],
    ignoreRowIds: [],
    showControls: [],
    filterRelatesheetControlIds: [],
    onClose: () => {},
    onOk: () => {},
    formData: [],
  };
  constructor(props) {
    super(props);
    const clickSearch = _.get(props.control, 'advancedSetting.clicksearch') === '1';
    this.state = {
      loading: !clickSearch,
      list: [],
      controls: [],
      sortControls: [],
      selectedRecords: props.selectedRecords || [],
      worksheet: {},
      pageIndex: 1,
      loadouted: false,
      showNewRecord: false,
      keyWords: props.keyWords,
      filtersVisible: false,
      quickFilters: [],
      fastFiltersVisible: false,
    };
    this.clickSearch = clickSearch;
    this.isOnComposition = false;
    this.isSelectAllMode = false;
    this.selectAllRecordIds = [];
  }
  componentDidMount() {
    const { control, keyWords, parentWorksheetId, staticRecords = [], isScan } = this.props;

    if (!_.isEmpty(staticRecords)) {
      this.setState({ list: staticRecords, loading: false });
      return;
    }

    if (control) {
      (window.isPublicWorksheet && !_.get(window, 'shareState.isPublicWorkflowRecord')
        ? publicWorksheetAjax
        : sheetAjax
      )
        .getWorksheetInfo({
          worksheetId: control.dataSource,
          getTemplate: true,
          relationWorksheetId: parentWorksheetId,
        })
        .then(data => {
          if (_.get(data, 'template.controls')) {
            data.template.controls = replaceControlsTranslateInfo(
              data.appId,
              control.dataSource,
              data.template.controls,
            );
          }

          data.entityName = getTranslateInfo(data.appId, null, control.dataSource).recordName || data.entityName;

          window.worksheetControlsCache = {};
          (_.get(data, 'template.controls') || []).forEach(c => {
            if (c.type === 29) {
              window.worksheetControlsCache[c.dataSource] = c.relationControls;
            }
          });

          this.setState(
            {
              allowAdd: data.allowAdd,
              worksheetInfo: data,
            },

            () => {
              if (!this.clickSearch || keyWords) {
                this.handleSearch(keyWords, control.advancedSetting.scancontrolid === 'rowid' && isScan ? true : false);
              }
            },
          );
        })
        .catch(err => {
          this.setState({ loading: false, error: err.errorCode === 300016 ? err.errorCode : err.errorMessage });
        });
    } else {
      if (!this.clickSearch || keyWords) {
        this.loadRecorcd();
      }
    }

    if (this.inputRef && keyWords) this.inputRef.value = keyWords;
  }

  componentDidUpdate(prevProps) {
    if (prevProps !== this.props) {
      if (prevProps.keyWords !== this.props.keyWords) {
        this.setState({
          keyWords: this.props.keyWords,
        });
      }
    }
  }

  abortSearch() {
    if (this.searchAjax && _.isFunction(this.searchAjax.abort)) {
      this.searchAjax.abort();
    }
  }
  loadRecorcd() {
    const {
      from,
      appId,
      viewId,
      relateSheetId,
      filterRowIds,
      ignoreRowIds,
      parentWorksheetId,
      recordId,
      controlId,
      multiple,
      maxCount,
      selectedCount = 0,
      control = {},
      formData,
      getDataType,
      relationRowIds = [],
      isScan,
      fastSearchControlArgs,
      isDraft,
      onOk = () => {},
      onClose = () => {},
      handleReplaceHistoryState = () => {},
      getFilterRowsGetType,
      staticRecords = [],
    } = this.props;

    if (!_.isEmpty(staticRecords)) {
      return;
    }

    const { pageIndex, keyWords, list, sortControls, worksheetInfo, isScanSearch, ignoreAllFilters } = this.state;
    let getFilterRowsPromise, args;
    let filterControls;

    if (control && _.get(control, 'advancedSetting.filters')) {
      if (worksheetInfo) {
        control.relationControls = worksheetInfo.template.controls;
      }

      filterControls = getFilter({ control, formData, appId: this.props.appId });
    }

    // 存在不符合条件值的条件
    if (filterControls === false && !ignoreAllFilters) {
      this.setState({ loading: false });
      return;
    }

    const { scanlink, scancontrol, scancontrolid } = _.get(control, 'advancedSetting') || {};

    if (
      isScan &&
      ((scanlink !== '1' && RegExpValidator.isURL(keyWords)) ||
        (scancontrol !== '1' && !RegExpValidator.isURL(keyWords)))
    ) {
      this.setState({ loading: false });
      return;
    }

    const scanControl =
      _.find(_.get(worksheetInfo, 'template.controls') || [], it => it.controlId === scancontrolid) || {};
    const quickFilters = this.state.quickFilters.map(f =>
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
        'advancedSetting',
      ]),
    );
    const fastFilters =
      isScanSearch && scancontrol === '1' && scancontrolid
        ? [
            {
              controlId: scancontrolid,
              dataType: scanControl.type,
              spliceType: 1,
              filterType: 1,
              dateRange: 0,
              minValue: '',
              maxValue: '',
              value: '',
              values: [keyWords],
            },
          ].concat(quickFilters)
        : quickFilters;

    if (from !== FROM.PUBLIC_ADD && !window.isPublicWorksheet) {
      getFilterRowsPromise = sheetAjax.chooseRelationRows;

      args = {
        worksheetId: relateSheetId,
        appId,
        viewId,
        searchType: 1,
        pageSize: 50,
        pageIndex,
        status: 1,
        keyWords: isScanSearch && scancontrol === '1' && scancontrolid ? '' : keyWords,
        isGetWorksheet: true,
        getType: getFilterRowsGetType || (isDraft ? 27 : 7),
        sortControls,
        filterControls: ignoreAllFilters ? [] : filterControls || [],
        fastFilters,
        rowId: !_.get(control, 'isSubList') ? _.get(control, 'recordId') || recordId : undefined,
      };
    } else {
      getFilterRowsPromise = publicWorksheetAjax.getRelationRows;
      args = {
        worksheetId: relateSheetId,
        appId,
        viewId,
        searchType: 1,
        pageSize: 50,
        pageIndex,
        status: 1,
        keyWords,
        isGetWorksheet: true,
        getType: getFilterRowsGetType || (isDraft ? 27 : 7),
        sortControls,
        filterControls: ignoreAllFilters ? [] : filterControls || [],
        fastFilters,
        rowId: !_.get(control, 'isSubList') ? _.get(control, 'recordId') || recordId : undefined,
        shareId: window.publicWorksheetShareId,
      };
    }

    if (fastSearchControlArgs) {
      delete args['keyWords'];
      if (String(keyWords || '').trim()) {
        args.fastFilters = [
          {
            spliceType: 1,
            isGroup: true,
            groupFilters: [
              {
                controlId: fastSearchControlArgs.controlId,
                dataType: 2,
                spliceType: 1,
                filterType: fastSearchControlArgs.filterType,
                dateRange: 0,
                isDynamicsource: false,
                values: [keyWords],
              },
            ],
          },
        ];
      }
    }

    if (!_.isEmpty(ignoreRowIds)) {
      args.requestParams = {
        _system_excluderowids: JSON.stringify(ignoreRowIds),
      };
    }

    if (parentWorksheetId && controlId && _.get(parentWorksheetId, 'length') === 24) {
      args.relationWorksheetId = parentWorksheetId;
      args.controlId = controlId;
    }

    this.setState({ loading: true });
    this.abortSearch();
    this.searchAjax = getFilterRowsPromise(args);
    this.searchAjax
      .then(res => {
        if (res.resultCode === 1) {
          let filteredList = _.uniqBy(
            list.concat(res.data.filter(record => !_.find(filterRowIds, fid => record.rowid === fid))),
            'rowid',
          );
          const nextList = getDataType
            ? list.concat(res.data.filter(rec => !_.includes(relationRowIds, rec.rowid)))
            : filteredList;
          let nextSelectedRecords;

          if (multiple && this.isSelectAllMode) {
            const { selectedRecords } = this.state;
            const selectedRowIds = selectedRecords.map(record => record.rowid);
            const unselectedRecords = nextList.filter(record => !_.includes(selectedRowIds, record.rowid));
            const selectableCount = _.isUndefined(maxCount)
              ? unselectedRecords.length
              : Math.max(maxCount - selectedCount - selectedRecords.length, 0);
            const autoSelectedRecords = unselectedRecords.slice(0, selectableCount);

            nextSelectedRecords = _.uniqBy(selectedRecords.concat(autoSelectedRecords), 'rowid');
            this.selectAllRecordIds = _.uniq(
              this.selectAllRecordIds.concat(autoSelectedRecords.map(record => record.rowid)),
            );

            if (autoSelectedRecords.length < unselectedRecords.length) {
              this.isSelectAllMode = false;
            }
          }

          if (res?.worksheet?.worksheetId) {
            res.worksheet.entityName =
              getTranslateInfo(res.worksheet.appId, null, res.worksheet.worksheetId).recordName ||
              res.worksheet.entityName;
          }

          this.setState(
            {
              list: nextList,
              loading: false,
              loadouted: res.data.length < 20,
              controls: res.template
                ? replaceControlsTranslateInfo(res.worksheet.appId, null, res.template.controls)
                : [],
              worksheet: res.worksheet || {},
              ...(!_.isUndefined(nextSelectedRecords) ? { selectedRecords: nextSelectedRecords } : {}),
            },
            () => {
              if (this.props.keyWords && res.data.length === 1) {
                this.setState({
                  selectedRecords: [res.data[0]],
                });
              }

              if (!this.state.loadouted && filteredList.length < 8) {
                this.loadNext();
              }

              if (window.isMingDaoApp && (isScan || isScanSearch) && multiple) {
                const firstRow = res.data && res.data.length ? res.data[0] : {};

                if (filteredList.length > 1) {
                  // 终止扫码，用户手动选
                  compatibleMDJS('stopScanWithControls', { cid: controlId, cancel: () => {} });
                } else if (filteredList.length === 1) {
                  const titleControl = _.find(_.get(control, 'relationControls'), i => i.attribute === 1) || {};
                  const nameValue = titleControl ? firstRow[titleControl.controlId] : undefined;
                  // 直接关联
                  onOk([firstRow]);
                  this.appScanCallback({
                    controlId,
                    enumDefault: control.enumDefault,
                    controlName: control.controlName,
                    title: getCurrentValue(titleControl, nameValue, { type: 2 }),
                    rowId: firstRow.rowid,
                  });
                  onClose();
                  handleReplaceHistoryState();
                } else {
                  this.appScanCallback({
                    controlId,
                    enumDefault: control.enumDefault,
                    controlName: control.controlName,
                    title: '',
                    rowId: '',
                    type: _.isEmpty(firstRow) ? '1' : '3',
                  });
                  onClose();
                  handleReplaceHistoryState();
                }
              }
            },
          );
        } else {
          this.setState({
            loading: false,
            error: true,
          });
        }
      })
      .catch(err => {
        this.setState({
          loading: false,
          error: err.errorCode === 300016 ? err.errorCode : err.errorMessage,
        });
      });
  }

  // 关联记录关联成功将当前关联数据通过js sdk返回给APP
  appScanCallback = ({ enumDefault, controlId, controlName, title, rowId, type, msg }) => {
    if (enumDefault !== 2) {
      return;
    }

    compatibleMDJS('scanRelationLoaded', {
      cid: controlId,
      cname: controlName,
      relation: _.includes(['2', '3'], type)
        ? {}
        : {
            title: title, //关联记录的标题, 注意转换为纯文本提供
            rowId: rowId, //关联记录的Id
          },
      error: !type
        ? undefined
        : {
            type, //"1": 无数据, "2": 不在关联范围内,
            msg, // 对应描述
          },
    });
  };

  loadNext() {
    this.setState(
      {
        pageIndex: this.state.pageIndex + 1,
        loading: true,
      },
      this.loadRecorcd,
    );
  }

  handleSearch = _.debounce((value, isScanSearch) => {
    const { staticRecords = [] } = this.props;
    const selectedRecords = this.state.selectedRecords.filter(
      record => !_.includes(this.selectAllRecordIds, record.rowid),
    );

    this.isSelectAllMode = false;
    this.selectAllRecordIds = [];
    value = (value || '').trim();

    if (!_.isEmpty(staticRecords)) {
      this.setState({
        keyWords: value,
        list: staticRecords.filter(v => new RegExp(value, 'i').test(v.name)),
        selectedRecords,
      });
      return;
    }

    this.setState(
      {
        keyWords: value,
        pageIndex: 1,
        loading: true,
        list: [],
        isScanSearch,
        selectedRecords,
      },
      () => {
        if (isScanSearch && this.inputRef && value) this.inputRef.value = value;
        if (!value && this.clickSearch) {
          // this.abortSearch();
          this.setState({ loading: false });
          return;
        }

        this.loadRecorcd();
      },
    );
  }, 500);

  handleFilter = filters => {
    this.isSelectAllMode = false;
    this.setState(
      {
        quickFilters: filters,
        pageIndex: 1,
        loading: true,
        list: [],
      },
      this.loadRecorcd,
    );
  };

  handleSelect = (record, selected) => {
    const { multiple, onOk, onClose, maxCount, selectedCount, handleReplaceHistoryState = () => {} } = this.props;
    const { selectedRecords } = this.state;

    if (multiple) {
      if (selected && selectedCount + selectedRecords.length >= maxCount) {
        return alert(_l('最多关联%0条', maxCount), 3);
      }

      this.isSelectAllMode = false;
      this.selectAllRecordIds = this.selectAllRecordIds.filter(rowId => rowId !== record.rowid);
      this.setState({
        selectedRecords: selected
          ? _.uniqBy(selectedRecords.concat(record))
          : selectedRecords.filter(r => r.rowid !== record.rowid),
      });
    } else {
      onOk([record]);
      onClose();
      handleReplaceHistoryState();
    }
  };

  handleConfirm = () => {
    const { onOk, onClose, handleReplaceHistoryState = () => {} } = this.props;
    const { selectedRecords } = this.state;
    onOk(selectedRecords);
    onClose();
    handleReplaceHistoryState();
  };

  handleSelectAll = () => {
    const { maxCount, selectedCount = 0 } = this.props;
    const { list, selectedRecords } = this.state;
    const selectedRowIds = selectedRecords.map(record => record.rowid);
    const isAllSelected = !!list.length && list.every(record => _.includes(selectedRowIds, record.rowid));

    if (isAllSelected) {
      const currentRowIds = list.map(record => record.rowid);

      this.isSelectAllMode = false;
      this.selectAllRecordIds = this.selectAllRecordIds.filter(rowId => !_.includes(currentRowIds, rowId));
      this.setState({
        selectedRecords: selectedRecords.filter(record => !_.includes(currentRowIds, record.rowid)),
      });
      return;
    }

    const unselectedRecords = list.filter(record => !_.includes(selectedRowIds, record.rowid));

    if (!_.isUndefined(maxCount) && selectedCount + selectedRecords.length + unselectedRecords.length > maxCount) {
      return alert(_l('最多关联%0条', maxCount), 3);
    }

    this.isSelectAllMode = true;
    this.selectAllRecordIds = _.uniq(this.selectAllRecordIds.concat(unselectedRecords.map(record => record.rowid)));
    this.setState({ selectedRecords: _.uniqBy(selectedRecords.concat(unselectedRecords), 'rowid') });
  };

  handleSort = (control, isAsc) => {
    let newIsAsc;

    if (_.isUndefined(isAsc)) {
      newIsAsc = true;
    } else if (isAsc === false) {
      newIsAsc = undefined;
    } else {
      newIsAsc = false;
    }

    this.isSelectAllMode = false;
    this.setState(
      {
        sortControls: _.isUndefined(newIsAsc)
          ? []
          : [
              {
                controlId: control.controlId,
                datatype: control.sourceControlType || control.type,
                isAsc: newIsAsc,
              },
            ],
        pageIndex: 1,
        loading: true,
        list: [],
      },
      this.loadRecorcd,
    );
  };
  canSort(control) {
    const itemType = control.sourceControlType || control.type;
    return fieldCanSort(itemType);
  }
  getControlSortStatus(control) {
    const { sortControls } = this.state;
    const sortedControl = _.find(sortControls, sc => sc.controlId === control.controlId);
    return sortedControl && sortedControl.isAsc;
  }
  get cardControls() {
    const { control = {} } = this.props;
    const { chooseshow, chooseshowids } = control.advancedSetting || {};
    const showControls =
      chooseshow === '1' ? safeParse(chooseshowids, 'array') || [] : control.showControls || this.props.showControls;
    const { controls } = this.state;
    // const titleControl = _.find(controls, c => c.attribute === 1);
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建人'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    let cardControls = new Array(showControls.length);
    allControls.forEach(control => {
      const indexOfShowControls = showControls.indexOf(control.controlId);

      if (indexOfShowControls > -1 && control.attribute !== 1) {
        cardControls[indexOfShowControls] = control;
      }
    });
    // if (titleControl) {
    //   cardControls = [titleControl].concat(cardControls);
    // }
    return cardControls.filter(c => !!c);
  }
  get title() {
    const { control = {} } = this.props;
    const { worksheet, worksheetInfo } = this.state;
    const title = worksheet.entityName || _.get(worksheetInfo, 'entityName') || _l('记录');
    const { searchcontrol } = control.advancedSetting || {};

    if (searchcontrol) {
      const searchControl = _.find(control.relationControls, { controlId: searchcontrol }) || {};
      return searchControl.controlName || title;
    } else {
      return title;
    }
  }
  renderSearchWrapper() {
    const isScanQR = getIsScanQR();
    const {
      relateSheetId,
      onOk,
      onClose,
      control,
      formData,
      parentWorksheetId,
      handleReplaceHistoryState = () => {},
    } = this.props;
    const { keyWords, worksheet, worksheetInfo = {}, filtersVisible, quickFilters, fastFiltersVisible } = this.state;
    const filterControls = getFilter({ control, formData, appId: this.props.appId });
    const { searchfilters = '[]' } = _.get(control, 'advancedSetting') || {};
    const searchFilters = safeParse(searchfilters, 'array');
    const controls = _.get(worksheetInfo, 'template.controls');
    const enableFastFilters = _.get(control, 'advancedSetting.openfastfilters') !== '0';
    const fastFiltersViewId =
      enableFastFilters &&
      _.get(control, 'advancedSetting.fastfilterstype') === '2' &&
      _.get(control, 'advancedSetting.fastfiltersview');
    const fastFiltersView = fastFiltersViewId && _.find(worksheetInfo.views, { viewId: fastFiltersViewId });
    let fastFilters = (fastFiltersView && _.get(fastFiltersView, 'fastFilters')) || [];

    if (enableFastFilters && !_.isEmpty(fastFilters) && worksheetInfo) {
      fastFilters = fastFilters.map(item => ({
        ...item,
        values: formatFilterValues(item.dataType, item.values),
      }));
    }

    return (
      <div className="flexRow alignItemsCenter justifyContentCenter mTop10 pLeft10 pRight10">
        <div className="searchWrapper flex">
          <Icon className="textTertiary" icon="h5_search" />
          <form action="#" className="flex" onSubmit={event => event.preventDefault()}>
            <input
              className="w100"
              type="search"
              ref={node => (this.inputRef = node)}
              placeholder={_l('搜索%0', this.title)}
              onChange={e => {
                if (this.isOnComposition) return;
                this.handleSearch(e.target.value);
              }}
              onCompositionStart={() => (this.isOnComposition = true)}
              onCompositionEnd={e => {
                if (e.type === 'compositionend') {
                  this.isOnComposition = false;
                }

                this.handleSearch(e.target.value);
              }}
            />
          </form>
          {keyWords ? (
            <Icon
              className="textTertiary"
              icon="workflow_cancel"
              onClick={() => {
                if (this.inputRef) {
                  this.inputRef.value = '';
                }

                this.handleSearch('');
              }}
            />
          ) : (
            isScanQR && (
              <RelateScanQRCode
                projectId={worksheet.projectId}
                worksheetId={relateSheetId}
                filterControls={filterControls}
                parentWorksheetId={parentWorksheetId}
                control={control}
                onChange={data => {
                  onOk([data]);
                  onClose();
                  handleReplaceHistoryState();
                }}
                onOpenRecordCardListDialog={keyWords => {
                  const { scanlink, scancontrol } = _.get(control, 'advancedSetting') || {};
                  setTimeout(() => {
                    if (
                      (scanlink !== '1' && RegExpValidator.isURL(keyWords)) ||
                      (scancontrol !== '1' && !RegExpValidator.isURL(keyWords))
                    ) {
                      this.setState({ pageIndex: 1, list: [] });
                      return;
                    }

                    this.handleSearch(keyWords, true);
                  }, 200);
                }}
              >
                <Icon className="Font20 textTertiary" icon="qr_code_19" />
              </RelateScanQRCode>
            )
          )}
        </div>
        {searchFilters && !!searchFilters.length && (
          <Fragment>
            <div
              className="filterWrapper flexRow alignItemsCenter justifyContentCenter mLeft10"
              onClick={() => this.setState({ filtersVisible: true })}
            >
              <Icon className={cx('Font20', { colorPrimary: quickFilters.length })} icon="filter" />
            </div>
            <Filter
              filtersVisible={filtersVisible}
              worksheetInfo={worksheetInfo}
              searchFilters={searchFilters}
              controls={controls}
              quickFilters={quickFilters}
              onChangeFiltersVisible={filtersVisible => {
                this.setState({ filtersVisible });
              }}
              onChangeQuickFilter={this.handleFilter}
            />
          </Fragment>
        )}
        {!(window.isPublicWorksheet && !_.get(window, 'shareState.isPublicWorkflowRecord')) &&
          enableFastFilters &&
          !_.isEmpty(fastFilters) && (
            <Fragment>
              <div
                className="filterWrapper flexRow alignItemsCenter justifyContentCenter mLeft10"
                onClick={() => this.setState({ fastFiltersVisible: true })}
              >
                <Icon className={cx('Font20', { colorPrimary: quickFilters.length })} icon="filter" />
              </div>
              <QuickFilterView
                view={fastFiltersView}
                filtersVisible={fastFiltersVisible}
                worksheetInfo={worksheetInfo}
                fastFilters={fastFilters}
                controls={controls}
                quickFilters={quickFilters}
                onChangeFiltersVisible={fastFiltersVisible => {
                  this.setState({ fastFiltersVisible });
                }}
                onChangeQuickFilter={this.handleFilter}
              />
            </Fragment>
          )}
      </div>
    );
  }
  renderContent() {
    const {
      appId,
      viewId,
      relateSheetId,
      filterRelatesheetControlIds,
      recordId,
      parentWorksheetId,
      controlId,
      multiple,
      allowNewRecord,
      disabledManualWrite,
      onOk,
      onClose,
      control,
      isCharge,
      isDraft,
      staticRecords = [],
      handleReplaceHistoryState = () => {},
    } = this.props;
    const {
      loading,
      loadouted,
      error,
      list,
      controls,
      selectedRecords,
      keyWords,
      worksheet,
      worksheetInfo,
      showNewRecord,
      allowAdd,
    } = this.state;
    const { cardControls } = this;
    const formData = this.props.formData.filter(_.identity);
    const titleControl = formData.filter(c => c && c.attribute === 1);
    const defaultRelatedSheetValue = titleControl && {
      name: titleControl.value,
      sid: recordId,
      type: 8,
      sourcevalue: JSON.stringify({
        ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
        [titleControl.controlId]: titleControl.value,
        rowid: recordId,
      }),
    };
    const coverCid = this.props.coverCid || (control && control.coverCid);
    const entityName = worksheet.entityName || _.get(worksheetInfo, 'entityName') || _l('记录');
    const allowShowIgnoreAllFilters = isCharge && recordId === 'FAKE_RECORD_ID_FROM_BATCH_EDIT';

    return (
      <ScrollView
        className="recordCardList mTop10 flex"
        onScrollEnd={() => {
          if (!loading && !loadouted && _.isEmpty(staticRecords)) {
            this.loadNext();
          }
        }}
      >
        {allowNewRecord && allowAdd && !disabledManualWrite ? (
          <div
            className="worksheetRecordCard allowNewRecordBtn valignWrapper flexRow"
            onClick={() => {
              this.setState({ showNewRecord: true });
            }}
          >
            <Icon icon="add" className="Font24" />
            <span className="bold">{_l('新建%0', entityName)}</span>
          </div>
        ) : null}
        {showNewRecord && (
          <MobileNewRecord
            hideFillNext
            appId={appId}
            viewId={viewId}
            worksheetId={relateSheetId}
            projectId={worksheet.projectId}
            worksheetInfo={worksheetInfo}
            addType={2}
            entityName={worksheet.entityName}
            filterRelateSheetIds={[relateSheetId]}
            filterRelatesheetControlIds={filterRelatesheetControlIds}
            defaultRelatedSheet={{
              worksheetId: parentWorksheetId,
              relateSheetControlId: controlId,
              value: defaultRelatedSheetValue,
            }}
            visible={showNewRecord}
            isDraft={isDraft}
            showDraftsEntry={true}
            sheetSwitchPermit={control && control.sheetSwitchPermit}
            hideNewRecord={() => {
              this.setState({ showNewRecord: false });
            }}
            onAdd={row => {
              if (multiple) {
                this.setState(
                  {
                    list: [row, ...list],
                  },
                  () => {
                    this.handleSelect(row, true);
                  },
                );
              } else {
                onOk([row]);
                onClose();
                handleReplaceHistoryState();
              }
            }}
          />
        )}
        {list.length
          ? list.map((record, i) => {
              const selected = !!_.find(selectedRecords, r => r.rowid === record.rowid);
              return (
                <div key={i} className="mLeft10 mRight10 mBottom10">
                  <RecordCoverCard
                    disabled
                    canSelect={true}
                    selected={selected}
                    viewId={viewId}
                    key={record.rowid}
                    cover={getCoverUrl(coverCid, record, controls)}
                    controls={cardControls}
                    data={record}
                    parentControl={{ ...control, controls }}
                    onClick={() => this.handleSelect(record, !selected)}
                  />
                </div>
              );
            })
          : !loading && (
              <div className="empty valignWrapper flexRow">
                <div className="emptyIcon flexColumn valignWrapper">
                  <i className="icon Icon icon-ic-line Font56" />
                  {error ? (
                    <p className="emptyTip textTertiary">
                      {error === 'notCorrectCondition'
                        ? _l('不存在符合条件的%0', worksheet.entityName || control.sourceEntityName || '')
                        : _l('没有权限')}

                      {error === 'notCorrectCondition' && allowShowIgnoreAllFilters && (
                        <div
                          className="mTop10 colorPrimary TxtCenter Hand"
                          onClick={() => this.setState({ ignoreAllFilters: true }, this.loadRecorcd)}
                        >
                          {_l('查看全部记录')}
                        </div>
                      )}
                    </p>
                  ) : (
                    <p className="emptyTip textTertiary">
                      {keyWords
                        ? _l('无匹配的结果')
                        : this.clickSearch
                          ? _l('输入%0后，显示可选择的记录', this.title)
                          : _l('暂无%0', entityName)}
                    </p>
                  )}
                </div>
              </div>
            )}
        {loading && <LoadDiv />}
      </ScrollView>
    );
  }
  render() {
    const {
      visible,
      onClose = () => {},
      multiple,
      disabledManualWrite,
      filterRowIds,
      control = {},
      onClear = () => {},
      className,
      layerId,
      handleReplaceHistoryState = () => {},
    } = this.props;
    const { selectedRecords, error, list } = this.state;
    const selectedRowIds = selectedRecords.map(record => record.rowid);
    const isAllSelected = !!list.length && list.every(record => _.includes(selectedRowIds, record.rowid));
    const confirmText = selectedRecords.length ? _l('确定(%0)', selectedRecords.length) : _l('确定');

    return (
      <PopupWrapper
        className={cx(className, { mobileRecordCardListDialogPopup: multiple })}
        bodyClassName="heightPopupBody40"
        visible={visible}
        title={control?.controlName || _l('关联记录')}
        confirmDisable={multiple ? !list.length : !selectedRecords.length}
        confirmText={multiple ? (isAllSelected ? _l('取消全选') : _l('全选')) : confirmText}
        onClose={onClose}
        onConfirm={multiple ? this.handleSelectAll : null}
        clearDisable={!multiple && !filterRowIds.length}
        layerId={layerId}
        onClear={
          !multiple
            ? () => {
                onClear();
                onClose();
                handleReplaceHistoryState();
              }
            : null
        }
      >
        <div className="flexColumn mobileRecordCardListDialog">
          {error === 300016 ? (
            <RestrictAccessStatus />
          ) : (
            <Fragment>
              {!disabledManualWrite && this.renderSearchWrapper()}
              {this.renderContent()}
            </Fragment>
          )}
          {multiple && (
            <div className="btnsWrapper flexRow alignItemsCenter">
              <button type="button" className="footerButton cancelButton" onClick={onClose}>
                {_l('取消')}
              </button>
              <button
                type="button"
                className="footerButton confirmButton"
                disabled={!selectedRecords.length}
                onClick={this.handleConfirm}
              >
                {confirmText}
              </button>
            </div>
          )}
        </div>
      </PopupWrapper>
    );
  }
}

export const mobileSelectRecord = props => FunctionWrap(RecordCardListDialog, { ...props });
