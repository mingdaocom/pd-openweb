import _, { find, get, includes } from 'lodash';
import moment from 'moment';
import { v4 as uuidv4 } from 'uuid';
import MapHandler from 'ming-ui/components/amap/MapHandler';
import MapLoader from 'ming-ui/components/amap/MapLoader';
import departmentAjax from 'src/api/department';
import organizeAjax from 'src/api/organize';
import { createRequestPool } from 'worksheet/api/standard';
import { getFilter } from 'worksheet/common/WorkSheetFilter/util';
import { setRowsFromStaticRows } from 'worksheet/components/ChildTable/redux/actions';
import generateSubListStore from 'worksheet/components/ChildTable/redux/store';
import generateRelateRecordTableStore from 'worksheet/components/RelateRecordTable/redux/store.js';
import { RELATE_RECORD_SHOW_TYPE, SYSTEM_CONTROLS } from 'worksheet/constants/enum';
import { SYSTEM_CONTROL_WITH_UAID } from 'src/pages/widgetConfig/config/widget';
import { formatColumnToText } from 'src/pages/widgetConfig/util/data.js';
import { getDatePickerConfigs } from 'src/pages/widgetConfig/util/setting.js';
import { browserIsMobile } from 'src/utils/common';
import {
  checkCellIsEmpty,
  formatNumberToWords,
  getDefaultCount,
  isEmptyValue,
  isRelateRecordTableControl,
  toFixed,
} from 'src/utils/control';
import { compatibleMDJS, getCurrentProject } from 'src/utils/project';
import { filterEmptyChildTableRows } from 'src/utils/record';
import { FORM_ERROR_TYPE, FROM, SYSTEM_ENUM, TIME_UNIT } from './config';
import { checkRuleLocked, controlState } from './formUtils';
import {
  asyncUpdateMdFunction,
  calcDefaultValueFunction,
  checkValueByFilterRegex,
  formatSearchResultValue,
  formatTimeValue,
  getCurrentValue,
  getDynamicValue,
  getItemFilters,
  getOtherWorksheetFieldValue,
  handleDotAndRound,
  onValidator,
  parseDateFormula,
  parseNewFormula,
  parseValueIframe,
} from './formUtils';
import { calcSubTotalCount, getArrBySpliceType, halfSwitchSize, isUnTextWidget } from './utils';

/**
 * 自定义字段数据格式化
 * @param {string} projectId 网络id
 * @param {[]} data 数据源
 * @param {[]} rules 业务规则
 * @param {boolean} isCreate 是否创建
 * @param {boolean} disabled 是否全部禁用
 * @param {boolean} ignoreLock 去除锁定
 * @param {boolean} isRecordLock 记录锁定
 * @param {boolean} ignoreRequired 去除其他选项的必填
 * @param {boolean} verifyAllControls 验证所有可见控件
 * @param {string} recordCreateTime 记录创建时间，编辑的时候会用到
 * @param {string} masterRecordRowId 主记录的id 编辑时用的
 * @param {[]} masterData 主记录的数据源
 * @param {number} from 来源参考config.js中的FROM
 * @param {[]} searchConfig 查询的配置
 * @param {object} embedData 嵌入参数
 * @param {function} onAsyncChange 异步更新
 * @param {function} updateLoadingItems 异步更新的控件更新父级 子表用
 * @param {function} activeTrigger 主动触发保存 汇总字段这类引起的
 * @param {[]} currentRuleControlIds 当前页面正更新字段用于业务规则设置字段值
 */
export default class DataFormat {
  constructor({
    projectId = '',
    isCharge,
    appId,
    worksheetId,
    recordId,
    instanceId,
    workId,
    setSubListStore,
    requestPool,
    abortController,
    data = [],
    rules = [],
    forceSync = false,
    isCreate = false,
    disabled = false,
    ignoreLock = false,
    ignoreRequired = false,
    verifyAllControls = false,
    noAutoSubmit = false,
    recordCreateTime = '',
    masterRecordRowId = '',
    masterData,
    from = FROM.DEFAULT,
    isDraft = false,
    storeCenter,
    loadRowsWhenChildTableStoreCreated = false,
    searchConfig = [],
    embedData = {},
    ignoreHiddenRequired = false,
    onAsyncChange = () => {},
    updateLoadingItems = () => {},
    activeTrigger = () => {},
  }) {
    this.abortController = abortController;
    this.disabled = disabled;
    this.isCharge = isCharge;
    this.noAutoSubmit = noAutoSubmit;
    this.appId = appId;
    this.projectId = projectId;
    this.worksheetId = worksheetId;
    this.recordId = recordId;
    this._debug_flag = [recordId, Math.random()].join('-');
    this.instanceId = instanceId;
    this.workId = workId;
    this.masterRecordRowId = masterRecordRowId;
    this.data = _.cloneDeep(data).map(c => ({ ...c, store: undefined }));
    this.masterData = masterData;
    this.embedData = embedData;
    this.loadingInfo = {};
    this.controlIds = [];
    this.ruleControlIds = [];
    this.currentRuleControlIds = [];
    this.errorItems = [];
    this.recordCreateTime = recordCreateTime;
    this.from = from;
    this.isDraft = isDraft;
    this.searchConfig = searchConfig;
    this.onAsyncChange = (...args) => {
      onAsyncChange(...args, this);
    };
    this.updateLoadingItems = updateLoadingItems;
    this.activeTrigger = activeTrigger;
    this.loopList = [];
    this.isMobile = browserIsMobile();
    this.loadRowsWhenChildTableStoreCreated = loadRowsWhenChildTableStoreCreated;

    this.requestPool = requestPool || createRequestPool({ abortController });
    this.debounceMap = new Map();
    this.debounceByKey = (fn, wait) => {
      const { debounceMap } = this;
      return function (key, ...args) {
        if (!debounceMap.has(key)) {
          debounceMap.set(
            key,
            _.debounce((resolve, ...args) => resolve(fn(...args)), wait),
          );
        }
        const debouncedFn = debounceMap.get(key);

        return new Promise(resolve => {
          debouncedFn(resolve, ...args);
        });
      };
    };
    this.debounceGetFilterRowsData = this.debounceByKey(this.getFilterRowsData, 100);
    const departmentIds = [];
    const locationIds = [];
    const organizeIds = [];
    const isInit = true;
    this.storeCenter = storeCenter || {};

    const initStore = () => {
      this.data.forEach(item => {
        if (item.hidden) return;

        if (item.type === 53 && item.dataSource) {
          item.advancedSetting = { ...item.advancedSetting, defaultfunc: item.dataSource, defaulttype: '1' };
        }

        if (item.storeFromDefault) {
          item.store = item.storeFromDefault;
          delete item.storeFromDefault;
        } else if (item.type === 34 && setSubListStore && !item.store) {
          item.store = this.getControlStore(item);
        } else if (
          !this.isMobile &&
          item.type === 29 &&
          includes(['2', '5', '6'], get(item, 'advancedSetting.showtype')) &&
          !item.store
        ) {
          item.store = this.getControlStore(item);
        }
        try {
          if (item.store) {
            item.store.setLoadingInfo = (key, status) => {
              this.loadingInfo[key] = status;
              this.updateLoadingItems(this.loadingInfo, true);
            };
          }
        } catch (err) {
          console.error('init store fail!', err);
        }
      });
    };

    if (forceSync) {
      initStore();
    }

    // 新建初始化
    if (isCreate) {
      function isRelateRecordWithStaticValue(control) {
        return (
          control.type === 29 && (_.get(control, 'advancedSetting.defsource') || '').startsWith('[{"staticValue":')
        );
      }
      const dataForInit = this.data
        .filter(isRelateRecordWithStaticValue)
        .concat(this.data.filter(c => !isRelateRecordWithStaticValue(c)));
      dataForInit.forEach(item => {
        if (item.type === 53 && item.dataSource) {
          item.advancedSetting = { ...item.advancedSetting, defaultfunc: item.dataSource, defaulttype: '1' };
        }
        if (item.value) {
          this.updateDataSource({ controlId: item.controlId, value: item.value, notInsertControlIds: true, isInit });
        } else if (item.advancedSetting && item.advancedSetting.defaultfunc && item.type !== 30) {
          if (_.get(safeParse(item.advancedSetting.defaultfunc), 'type') === 'javascript') {
            asyncUpdateMdFunction({
              formData: this.data,
              fnControl: item,
              update: v => {
                this.updateDataSource({
                  controlId: item.controlId,
                  value: v,
                  isInit,
                });
                this.onAsyncChange({
                  controlId: item.controlId,
                  value: v,
                });
              },
            });
          } else {
            const value = calcDefaultValueFunction({
              formData: this.data,
              fnControl: item,
            });
            if (value) {
              this.updateDataSource({ controlId: item.controlId, value, isInit });
            }
          }
        } else if (item.advancedSetting && item.advancedSetting.defsource && item.type !== 30) {
          const value = getDynamicValue(this.data, item, this.masterData);
          if (this.isMobile && item.type === 29 && _.isString(value) && _.isEmpty(JSON.parse(value))) {
            this.updateDataSource({ controlId: item.controlId, value: null, isInit });
          } else if (value) {
            if (((item.type === 29 && isRelateRecordTableControl(item)) || item.type === 34) && !forceSync) {
              setTimeout(() => {
                this.updateDataSource({ controlId: item.controlId, value, isInit });
              }, 0);
            } else {
              this.updateDataSource({ controlId: item.controlId, value, isInit });
            }
          }
        } else if (
          item.type === 38 &&
          item.enumDefault === 3 &&
          item.sourceControlId &&
          item.sourceControlId[0] !== '$'
        ) {
          const unit = TIME_UNIT[item.unit] || 'd';
          const today = moment().startOf(unit);
          const time = moment(item.sourceControlId);
          if (item.advancedSetting.dateformulatype === '1' || _.isUndefined(item.advancedSetting.dateformulatype)) {
            item.value = String(Math.floor(moment(time).diff(today, unit)));
          } else {
            item.value = String(Math.floor(moment(today).diff(time, unit)));
          }
        }

        // 部门控件默认值当前用户
        if (item.type === 27 && item.advancedSetting.defsource) {
          safeParse(item.advancedSetting.defsource)
            .filter(obj => obj.isAsync && obj.staticValue)
            .forEach(obj => {
              // 当前用户所在的部门
              if (_.includes(['current', 'user-departments'], safeParse(obj.staticValue).departmentId)) {
                departmentIds.push(item.controlId);
              }
            });
        }

        // 组织角色控件默认值当前用户所在组织角色
        if (item.type === 48 && item.advancedSetting.defsource) {
          safeParse(item.advancedSetting.defsource)
            .filter(obj => obj.isAsync && obj.staticValue)
            .forEach(obj => {
              // 当前用户所在的部门
              if (_.includes(['current', 'user-role'], safeParse(obj.staticValue).organizeId)) {
                organizeIds.push(item.controlId);
              }
            });
        }

        // 定位控件默认选中当前位置
        if (item.type === 40 && item.advancedSetting.defsource && controlState(item, this.from).visible) {
          if (_.get(safeParse(item.advancedSetting.defsource), '0.cid') === 'current-location') {
            locationIds.push(item.controlId);
          }
        }

        // 公式设置视为0配置
        if (item.type === 31 && item.advancedSetting && item.advancedSetting.nullzero === '1') {
          this.updateDataSource({ controlId: item.controlId, value: item.value, isInit });
        }
      });
    }

    // store 挂载
    if (!forceSync) {
      initStore();
    }

    if (!(isCreate || ignoreLock) && checkRuleLocked(rules, this.data, _.get(this.embedData, 'recordId'))) {
      disabled = true;
    }

    this.data.forEach(item => {
      item.advancedSetting = item.advancedSetting || {};
      item.dataSource = item.dataSource || '';
      item.disabled = (item.ignoreDisabled ? false : !!disabled) || item.disabled;
      item.controlPermissions =
        item.type === 52 ? _.replace(item.controlPermissions || '111', /^(.)(.)/, '$1' + '1') : item.controlPermissions;
      item.fieldPermission = _.includes(SYSTEM_ENUM, item.controlId)
        ? '0' + (item.fieldPermission || '111').slice(-2)
        : item.type === 52 && ((instanceId && workId) || _.get(window, 'shareState.isPublicWorkflowRecord'))
          ? _.replace(item.fieldPermission || '111', /^(.)(.)/, '$1' + '1')
          : item.fieldPermission;
      item.defaultState = {
        required: item.required,
        controlPermissions: item.controlPermissions,
        fieldPermission: item.fieldPermission,
        showControls: item.showControls,
      };
      (item.relationControls || []).forEach(c => {
        c.defaultState = {
          required: c.required,
          controlPermissions: c.controlPermissions,
          fieldPermission: c.fieldPermission,
        };
      });

      // 处理老数据关联列表去除必填
      if (item.type === 29 && item.advancedSetting.showtype === '2') {
        item.required = false;
      }

      // 备注控件处理数据
      if (item.type === 10010) {
        item.disabled = true;
        item.value = item.dataSource;
      }

      // 嵌入iframe
      if (item.type === 45) {
        if (item.enumDefault === 1 && item.dataSource) {
          item.value = parseValueIframe(this.data, item, this.masterData, this.embedData);
        }
      }

      // h5禁用自由链接
      if (item.type === 21 && this.isMobile) {
        item.disabled = true;
      }

      // 兼容老数据没有size的情况
      if (!item.size) {
        item.size = halfSwitchSize(item, from);
      }

      const { errorType, errorText } = onValidator({ item, data, masterData, ignoreRequired, verifyAllControls });
      const ignoreError =
        ignoreHiddenRequired && errorType === FORM_ERROR_TYPE.REQUIRED && !controlState(item, from).visible;
      if (errorType && !ignoreError) {
        _.remove(this.errorItems, obj => obj.controlId === item.controlId);
        this.errorItems.push({
          controlId: item.controlId,
          errorType,
          errorText,
          showError: false,
        });
      }
    });

    // 获取当前用户所在的部门
    this.getCurrentDepartment(departmentIds);
    // 获取当前位置
    this.getCurrentLocation(locationIds);
    // 获取当前用户所在组织角色
    this.getCurrentOrgRole(organizeIds);

    //新建记录初始时,固定值全走
    if (this.searchConfig.length > 0 && isCreate) {
      this.updateDataBySearchConfigs({ searchType: 'init' });
    }
  }

  getControlStore(control) {
    const { appId, recordId, instanceId, workId, worksheetId, from, loadRowsWhenChildTableStoreCreated } = this;
    let store = this.storeCenter[control.controlId];
    if (store) {
      return store;
    }
    if (control.type === 34) {
      store = generateSubListStore(control, {
        from,
        isCharge: this.isCharge,
        appId,
        relationWorksheetId: worksheetId,
        recordId,
        instanceId,
        workId,
        masterData: {
          worksheetId,
          recordId,
          formData: this.data
            .map(c =>
              _.pick(c, [
                'controlId',
                'type',
                'value',
                'options',
                'attribute',
                'enumDefault',
                'sourceControl',
                'sourceControlType',
              ]),
            )
            .filter(c => !!c.value),
        },
        DataFormat,
      });
      if (loadRowsWhenChildTableStoreCreated) {
        store.initAndLoadRows({
          worksheetId: this.worksheetId,
          recordId,
          controlId: control.controlId,
        });
      }
    } else if (control.type === 29) {
      store = generateRelateRecordTableStore(control, {
        appId,
        from,
        isCharge: this.isCharge,
        recordId,
        allowEdit: !this.disabled,
        worksheetId,
        formData: this.data,
        instanceId,
        workId,
      });
    }
    // generateRelateRecordTableStore
    if (!store) {
      console.error('create store fail!');
      return;
    }
    this.storeCenter[control.controlId] = store;
    return store;
  }

  /**
   * 直接更新字段值，不触发任何其他逻辑
   */
  setControlItemValue(controlId, value) {
    const targetControl = find(this.data, { controlId });
    if (targetControl) {
      targetControl.value = value;
    }
  }

  /**
   * 更新数据
   */
  updateDataSource({
    controlId,
    value,
    notInsertControlIds = false,
    removeUniqueItem = () => {},
    data,
    isInit = false,
    searchByChange = false,
    userTriggerChange = false,
    ignoreSearch = false, // 禁止触发查询工作表
  }) {
    this.asyncControls = {};

    try {
      const updateSource = (controlId, value, currentSearchByChange, currentIgnoreSearch) => {
        this.data.forEach(item => {
          if (item.controlId === controlId) {
            // 子表被动赋值
            if (item.type === 34 && !item.isSubList && item.store) {
              let loading = true;
              try {
                loading = item.store.getState().baseLoading;
              } catch (err) {
                console.log(err);
              }
              const params = {
                recordId: this.recordId,
                masterData: {
                  worksheetId: this.worksheetId,
                  formData: this.data,
                },
                abortController: this.abortController,
              };
              if (_.get(value, 'action') === 'append') {
                params.staticRows = value.rows.filter(i => !i.rowid);
                params.type = 'append';
              } else if (_.get(value, 'action') === 'clearAndSet') {
                params.staticRows = value.rows;
                params.isSetValueFromEvent = value.isSetValueFromEvent;
                params.isSetValueFromRule = value.isSetValueFromRule;
                if (_.isEmpty(value.rows)) {
                  item.store.dispatch({
                    type: 'DELETE_ALL',
                  });
                }
                item.value = '';
              } else if (typeof value === 'string' && !_.isEmpty(safeParse(value))) {
                const parsedRows = safeParse(value);
                params.staticRows = parsedRows;
              }
              if (params.staticRows) {
                if (loading || (get(value, 'fireWhenLoaded') && this.recordId && !item.store.getState().base.loaded)) {
                  (get(value, 'fireWhenLoaded') && this.recordId && !item.store.getState().base.loaded
                    ? item.store.waitListForLoadRows
                    : item.store.waitList
                  ).push(() => {
                    setRowsFromStaticRows({
                      ...params,
                      triggerSubListControlValueChange: controlValue => {
                        this.updateDataSource({
                          controlId: item.controlId,
                          value: controlValue,
                        });
                        this.onAsyncChange({
                          controlId: item.controlId,
                          value: controlValue,
                        });
                      },
                    })(item.store.getState, item.store.dispatch, DataFormat);
                  });
                  if (!item.store.initialized) {
                    item.store.init({ noMountInit: true });
                  }
                } else {
                  setRowsFromStaticRows(params)(item.store.getState, item.store.dispatch, DataFormat);
                }
                this.controlIds.push(controlId);
                return;
              }
            }
            // 表单内关联表格组件被动赋值
            if (
              !this.isMobile &&
              (!this.recordId || String(RELATE_RECORD_SHOW_TYPE.TABLE) === item.advancedSetting.showtype) &&
              item.type === 29 &&
              !item.isSubList &&
              includes(
                [
                  String(RELATE_RECORD_SHOW_TYPE.TABLE),
                  String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
                  String(RELATE_RECORD_SHOW_TYPE.LIST),
                ],
                item.advancedSetting.showtype,
              )
            ) {
              if (String(value || '').startsWith('[')) {
                try {
                  const records = safeParse(value, 'array').filter(r => r.sid || r.sourcevalue);
                  item.store.dispatch({
                    type: 'DELETE_ALL',
                  });
                  item.store.dispatch({
                    type: 'APPEND_RECORDS',
                    recordId: this.recordId,
                    records: records.map(r => r.row || safeParse(r.sourcevalue)),
                  });
                  value = records.length || '';
                  item.store.dispatch({
                    type: 'UPDATE_TABLE_STATE',
                    value: { count: records.length },
                  });
                } catch (err) {
                  console.log(err);
                  value = '';
                }
              } else if (value === 'deleteRowIds: all') {
                item.store.dispatch({
                  type: 'DELETE_ALL',
                });
                item.store.dispatch({
                  type: 'UPDATE_RECORDS',
                  records: [],
                });
                value = '';
              }
            }

            item.value = value;

            // 数值进度区间控制
            if (item.type === 6 && _.get(item, 'advancedSetting.showtype') === '2' && !isEmptyValue(value)) {
              const maxCount = parseFloat(_.get(item, 'advancedSetting.max') || 100);
              const minCount = parseFloat(_.get(item, 'advancedSetting.min') || 0);
              if (parseFloat(value || 0) < minCount) item.value = minCount;
              if (parseFloat(value || 0) > maxCount) item.value = maxCount;
            }

            // 成员控件
            if (item.type === 26 && value && item.advancedSetting.checkusertype === '1') {
              const filterValues = safeParse(value || '[]').filter((v = {}) => {
                const result = (v.accountId || '').startsWith('a#');
                return item.advancedSetting.usertype === '2' ? result : !result;
              });
              item.value = _.isEmpty(filterValues) ? '' : JSON.stringify(filterValues);
            }

            // 等级控件
            if (item.type === 28) {
              const maxCount = (item.advancedSetting || {}).max || (item.enumDefault === 1 ? 5 : 10);
              item.value = Math.min(parseInt(Number(value || 0)), maxCount);
            }

            // 定位各端统一保留6位小数
            if (item.type === 40 && value) {
              const locationValue = safeParse(value);
              item.value = JSON.stringify({
                ...locationValue,
                x: parseFloat(toFixed(locationValue.x, 6)),
                y: parseFloat(toFixed(locationValue.y, 6)),
              });
            }

            // 关联记录、级联被引用为默认值
            if (item.type === 29 || item.type === 35) {
              this.getCurrentRelateData(item);
            }

            // 日期
            if (_.includes([15, 16], item.type) && value) {
              const { formatMode } = getDatePickerConfigs(item);
              item.value = moment(value, formatMode).format(item.type === 15 ? 'YYYY-MM-DD' : 'YYYY-MM-DD HH:mm:ss');
            }

            // 工作表查询
            const needSearch = this.getFilterConfigs(item, 'onBlur');
            if (!currentIgnoreSearch && (currentSearchByChange ? isUnTextWidget(item) : needSearch.length > 0)) {
              this.updateDataBySearchConfigs({ control: item, searchType: 'onBlur' });
            }

            // 字段被引用，限制输入格式重新校验
            this.checkFilterRegex(item);

            removeUniqueItem(controlId);
            _.remove(this.errorItems, obj => obj.controlId === item.controlId && !obj.errorMessage);

            const { errorType, errorText } = onValidator({
              item,
              data: this.data,
              masterData: this.masterData,
              verifyAllControls: this.from === 21 && !this.isMobile ? true : undefined,
            });

            if (errorType) {
              this.errorItems.push({
                controlId: item.controlId,
                errorType,
                errorText,
                showError: true,
              });
            }

            //规则变更id集合
            if (!_.includes(this.ruleControlIds, controlId) && !isInit) {
              this.ruleControlIds.push(controlId);
            }

            // 业务规则当前单次操作变更id集合
            if (!_.includes(this.currentRuleControlIds, controlId) && !isInit) {
              this.currentRuleControlIds.push(controlId);
            }

            // 变更控件的id集合
            if (
              !_.includes([25, 30, 31, 32, 33], item.type) &&
              !_.includes(this.controlIds, controlId) &&
              !notInsertControlIds
            ) {
              this.controlIds.push(controlId);
              this.activeTrigger();
            }
          }
        });
      };
      const updateControlData = (controlId, data) => {
        this.data.forEach(item => {
          if (controlId === item.controlId) {
            item.data = data;
          }
        });
      };
      const depthUpdateData = (controlId, depth, value) => {
        const currentItem = _.find(this.data, item => item.controlId === controlId);
        let currentSearchByChange = depth === 0 ? searchByChange : false;
        let currentIgnoreSearch = depth === 0 ? ignoreSearch : false;
        // onChange主动更新，清空循环列表
        if (currentSearchByChange || userTriggerChange) {
          this.loopList = [];
          this.currentRuleControlIds = [];
        }

        // 最多递归5层
        if (depth > 5) {
          updateSource(controlId, '');
          return;
        }

        // 更新当前的控件值
        if (value === undefined) {
          //由默认值等引起的更新
          currentSearchByChange = false;
          currentIgnoreSearch = false;
          // 大写金额控件
          if (currentItem.type === 25) {
            const relateControl = _.find(this.data, item => item.controlId === currentItem.dataSource.slice(1, -1));
            value = formatNumberToWords(currentItem, relateControl);
          }

          // 他表字段
          if (currentItem.type === 30) {
            value = getOtherWorksheetFieldValue({
              data: this.data,
              dataSource: currentItem.dataSource,
              sourceControlId: currentItem.sourceControlId,
            });
          }

          // 公式控件
          if (currentItem.type === 31) {
            const formulaResult = parseNewFormula(this.data, currentItem);
            value = formulaResult.error || formulaResult.columnIsUndefined ? '' : formulaResult.result;
          }

          // 文本组合处理
          if (currentItem.type === 32) {
            value = currentItem.dataSource.replace(/\$.+?\$/g, matched => {
              const controlId = matched.match(/\$(.+?)\$/)[1];
              let singleControl = _.find(this.data, item => item.controlId === controlId);
              if (!singleControl && controlId === 'rowid') return this.recordId || '';

              if (!singleControl) {
                return '';
              }

              // 公式
              if (singleControl.type === 31) {
                let formulaResult = parseNewFormula(this.data, singleControl);
                if (formulaResult.columnIsUndefined) {
                  return '';
                }
                // 文本组合涉及百分比公式，特殊处理
                if (
                  singleControl.advancedSetting &&
                  singleControl.advancedSetting.numshow === '1' &&
                  formulaResult.result
                ) {
                  formulaResult.result = parseFloat(formulaResult.result) * 100;
                }
                return formulaResult.error || _.isNull(formulaResult.result)
                  ? ''
                  : `${formulaResult.result}${singleControl.unit}`;
              }

              return formatColumnToText(singleControl, true, true, { doNotHandleTimeZone: true });
            });
          }

          // 日期公式控件
          if (currentItem.type === 38) {
            value = parseDateFormula(this.data, currentItem, this.recordCreateTime);
          }

          // 动态默认值 函数
          if (currentItem.advancedSetting && currentItem.advancedSetting.defaultfunc && currentItem.type !== 30) {
            delete currentItem.advancedSetting.defsource;
            if (_.get(safeParse(currentItem.advancedSetting.defaultfunc), 'type') === 'javascript') {
              asyncUpdateMdFunction({
                formData: this.data,
                fnControl: currentItem,
                update: v => {
                  this.updateDataSource({
                    controlId: currentItem.controlId,
                    value: v,
                  });
                  this.onAsyncChange({
                    controlId: currentItem.controlId,
                    value: v,
                  });
                },
              });
              return;
            } else {
              value = calcDefaultValueFunction({
                formData: this.data,
                fnControl: currentItem,
              });
            }
          }

          // 动态默认值
          if (currentItem.advancedSetting && currentItem.advancedSetting.defsource && currentItem.type !== 30) {
            if (currentItem.isImportFromExcel && currentItem.value) {
              value = currentItem.value;
            } else {
              value = getDynamicValue(this.data, currentItem, this.masterData);
            }
          }

          // 嵌入控件
          if (currentItem.type === 45) {
            if (currentItem.enumDefault === 1 && currentItem.dataSource) {
              value = parseValueIframe(this.data, currentItem, this.masterData, this.embedData);
            }
          }

          // 触发子表条码更新
          if (currentItem.type === 47 && currentItem.isSubList) {
            value = Math.random();
          }

          // 汇总
          if (currentItem.type === 37) {
            if (
              currentItem.advancedSetting &&
              currentItem.advancedSetting.filters &&
              currentItem.advancedSetting.filters !== '[]'
            ) {
              return;
            }
            const sourceSheetControl = _.find(
              this.data,
              item => item.controlId === currentItem.dataSource.slice(1, -1),
            );
            if (!sourceSheetControl) {
              return;
            }
            let records = [];
            try {
              if (sourceSheetControl.type === 29) {
                try {
                  if (sourceSheetControl.store) {
                    const state = sourceSheetControl.store.getState();
                    records = this.recordId
                      ? state.records.concat(get(state, 'changes.addedRecords') || [])
                      : state.records;
                  } else if (_.isArray(sourceSheetControl.value)) {
                    records = sourceSheetControl.value;
                  } else if (sourceSheetControl.data) {
                    records = sourceSheetControl.data;
                  } else {
                    let parsedValue = safeParse(sourceSheetControl.value);
                    if (_.isArray(parsedValue)) {
                      records = parsedValue;
                    }
                  }
                } catch (err) {
                  console.log(err);
                }
              } else if (sourceSheetControl.type === 34) {
                if (sourceSheetControl.store) {
                  records = sourceSheetControl.store.getState().rows || [];
                } else {
                  records = sourceSheetControl.value.rows || [];
                }
                records = filterEmptyChildTableRows(records);
              }
            } catch (err) {
              console.error(err);
            }
            if (!currentItem.sourceControlId) {
              // 记录数量
              value = records.length;
            } else {
              const sourceControl = _.find(
                sourceSheetControl.relationControls.concat(SYSTEM_CONTROL_WITH_UAID),
                c => c.controlId === currentItem.sourceControlId,
              );
              if (sourceControl) {
                const valuesOfRecords = records.map(
                  record =>
                    (record.row || (record.sourcevalue ? safeParse(record.sourcevalue, 'object') : record))[
                      sourceControl.controlId
                    ],
                );
                const noUndefinedValues = valuesOfRecords.filter(value => !_.isUndefined(value));
                if (valuesOfRecords.length) {
                  const isDate =
                    _.includes([15, 16, 46], currentItem.type) ||
                    (currentItem.type === 37 && _.includes([15, 16, 46], currentItem.enumDefault2));
                  switch (currentItem.enumDefault) {
                    case 13: // 已填
                      value = valuesOfRecords.filter(c => {
                        if (sourceControl.type === 36) {
                          return c === '1';
                        } else if (_.includes([29, 34], sourceControl.type) && _.isNumber(c)) {
                          return !!c;
                        } else {
                          return !checkCellIsEmpty(c);
                        }
                      }).length;
                      break;
                    case 14: // 未填
                      value = valuesOfRecords.filter(c => {
                        if (sourceControl.type === 36) {
                          return c !== '1';
                        } else if (_.includes([29, 34], sourceControl.type) && _.isNumber(c)) {
                          return !c;
                        } else {
                          return checkCellIsEmpty(c);
                        }
                      }).length;
                      break;
                    case 21: // 去重计数
                    case 22: // 单个去重计数
                      // 子表、关联多条存在计算有误的情况，不计算
                      if (sourceControl.type === 34 || (sourceControl.type === 29 && sourceControl.enumDefault === 2))
                        return;
                      value = calcSubTotalCount(valuesOfRecords, sourceControl, currentItem);
                      break;
                    case 5: // 求和
                      value = _.sum(
                        valuesOfRecords
                          .map(v => v || 0)
                          .map(v =>
                            _.isNumber(parseFloat(v, 10)) && !_.isNaN(parseFloat(v, 10)) ? parseFloat(v, 10) : 0,
                          ),
                      );
                      value = handleDotAndRound(currentItem, value, false);
                      break;
                    case 1: // 平均
                      value =
                        _.sum(
                          noUndefinedValues.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        ) / noUndefinedValues.length;
                      break;
                    case 2: // 最大 最晚
                      if (isDate) {
                        if (currentItem.enumDefault2 === 46) {
                          const maxDate = moment.max(
                            noUndefinedValues.filter(_.identity).map(c => moment(c, 'HH:mm:ss')),
                          );
                          value = formatTimeValue(currentItem, false, maxDate);
                        } else {
                          const maxDate = _.max(
                            noUndefinedValues.filter(_.identity).map(c => new Date(c || 0).getTime()),
                          );
                          const { formatMode } = getDatePickerConfigs({
                            type: currentItem.enumDefault2,
                            advancedSetting: { showtype: currentItem.unit },
                          });
                          value = moment(maxDate).format(formatMode);
                        }
                      } else {
                        value = _.max(
                          noUndefinedValues.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        );
                      }
                      break;
                    case 3: // 最小 最早
                      if (isDate) {
                        if (currentItem.enumDefault2 === 46) {
                          const minDate = moment.min(
                            noUndefinedValues.filter(_.identity).map(c => moment(c, 'HH:mm:ss')),
                          );
                          value = formatTimeValue(currentItem, false, minDate);
                        } else {
                          const minDate = _.min(
                            noUndefinedValues.filter(_.identity).map(c => new Date(c || 0).getTime()),
                          );
                          const { formatMode } = getDatePickerConfigs({
                            type: currentItem.enumDefault2,
                            advancedSetting: { showtype: currentItem.unit },
                          });
                          value = moment(minDate).format(formatMode);
                        }
                      } else {
                        value = _.min(
                          noUndefinedValues.map(c =>
                            _.isNumber(parseFloat(c, 10)) && !_.isNaN(parseFloat(c, 10)) ? parseFloat(c, 10) : 0,
                          ),
                        );
                      }
                      break;
                  }
                }
              }
            }
          }
        }

        updateSource(controlId, value, currentSearchByChange, currentIgnoreSearch);

        // 受影响的控件集合
        const effectControls = _.filter(
          this.data,
          item =>
            (item.dataSource || '').indexOf(controlId) > -1 ||
            (item.type === 38 && (item.sourceControlId || '').indexOf(controlId) > -1) ||
            (item.advancedSetting &&
              item.advancedSetting.defsource &&
              safeParse(item.advancedSetting.defsource).filter(
                obj => ((!obj.rcid && obj.cid === controlId) || (obj.rcid === controlId && obj.cid)) && !obj.isAsync,
              ).length) ||
            ((item.advancedSetting && _.get(safeParse(item.advancedSetting.defaultfunc), 'expression')) || '').indexOf(
              controlId,
            ) > -1 ||
            (item.type === 37 && controlId === (item.dataSource || '').slice(1, -1)),
        );

        // 受影响的异步更新控件集合
        if (!this.asyncControls[controlId]) {
          const ids = _.filter(
            this.data,
            item =>
              item.advancedSetting &&
              item.advancedSetting.defsource &&
              safeParse(item.advancedSetting.defsource).filter(
                obj => ((!obj.rcid && obj.cid === controlId) || (obj.rcid === controlId && obj.cid)) && obj.isAsync,
              ).length,
          );

          if (ids.length) {
            this.asyncControls[controlId] = ids;
          }
        }

        // 递归更新受影响的控件
        effectControls.forEach(({ controlId }) => {
          depthUpdateData(controlId, depth + 1);
        });
      };

      if (data) {
        updateControlData(controlId, data);
      }
      depthUpdateData(controlId, 0, value);
    } catch (err) {
      console.error('UpdateSource Error:', err);
      console.log('Error Control data:', controlId, value);
    }

    this.getAsyncData(isInit);
  }

  /**
   * 获取数据
   */
  getDataSource() {
    return this.data;
  }

  /**
   * 获取变更的控件的id集合
   */
  getUpdateControlIds() {
    return this.controlIds;
  }

  /**
   * 获取业务规则变更的控件的id集合
   */
  getUpdateRuleControlIds() {
    return this.ruleControlIds;
  }

  /**
   * 获取当前页面正更新字段用于业务规则设置字段值
   */
  getCurrentRuleControlIds() {
    return this.currentRuleControlIds;
  }

  /**
   * 业务规则更新操作完成，清除变更合集
   */
  resetCurrentRuleControlIds() {
    this.currentRuleControlIds = [];
  }

  /**
   * 更新字段是否被文本输入格式筛选引用
   */
  checkFilterRegex(item) {
    this.data.forEach(i => {
      if (((i.type === 2 && i.advancedSetting && i.advancedSetting.filterregex) || '').indexOf(item.controlId) > -1) {
        const error = checkValueByFilterRegex(i, i.value, this.data);
        if (error) {
          _.remove(this.errorItems, e => e.controlId === i.controlId && e.errorType === FORM_ERROR_TYPE.CUSTOM);
          this.errorItems.push({
            controlId: i.controlId,
            errorType: FORM_ERROR_TYPE.CUSTOM,
            errorText: error,
            showError: true,
          });
        } else {
          this.errorItems = this.errorItems.filter(
            e => !(e.controlId === i.controlId && e.errorType === FORM_ERROR_TYPE.CUSTOM),
          );
        }
      }
    });
  }

  /**
   * 初始化查询接口引起业务规则错误
   */
  isInitSearch(controlId, isInit) {
    const effectBySearch = this.getFilterConfigs({}, 'init');
    return isInit
      ? !!_.find(effectBySearch, ef => ef.controlId === controlId) && !this.loadingInfo[controlId]
      : !isInit;
  }

  /**
   * 设置异常控件
   */
  setErrorControl(controlId, errorType, errorMessage, ruleItem = {}, isInit) {
    const saveIndex = _.findIndex(
      this.errorItems,
      e =>
        e.controlId === controlId &&
        e.errorType === errorType &&
        (ruleItem.ruleId ? e.ruleId === ruleItem.ruleId : true),
    );

    if (saveIndex > -1) {
      // 移除业务规则错误提示|必填错误
      if (!errorMessage) {
        this.errorItems.splice(saveIndex, 1);
      }
    } else {
      if (errorMessage && _.includes([FORM_ERROR_TYPE.RULE_REQUIRED, FORM_ERROR_TYPE.REQUIRED], errorType)) {
        this.errorItems.push({
          controlId,
          errorType,
          errorText: errorMessage,
          showError: false,
        });
      }

      if (this.isInitSearch(controlId, isInit) && errorMessage && errorType === FORM_ERROR_TYPE.RULE_ERROR) {
        this.errorItems.push({
          controlId,
          errorType,
          showError: ruleItem.hintType !== 1,
          errorMessage,
          ruleId: ruleItem.ruleId,
          ignoreErrorMessage: ruleItem.checkType === 3,
        });
      }
    }
  }

  /**
   * 获取异常控件
   */
  getErrorControls() {
    return this.errorItems;
  }

  /**
   * 设置控件loading状态
   */
  setLoadingInfo(controlIds, status, autoSubmit) {
    const newIds = _.isArray(controlIds) ? controlIds : [controlIds];
    newIds.map((controlId, index) => {
      if (_.find(this.data, item => controlId.includes(item.controlId))) {
        this.loadingInfo[controlId] = status;
      } else {
        // 子表内控件更新时，loading状态挂到父级
        const parentControl = _.find(this.data, item =>
          _.find(item.relationControls || [], i => controlId.includes(i.controlId)),
        );
        if (parentControl) {
          this.loadingInfo[parentControl.controlId] = status;
        }
      }

      if (index === newIds.length - 1) {
        this.updateLoadingItems(this.loadingInfo, autoSubmit && !this.noAutoSubmit);
      }
    });
  }

  /**
   * 获取当前用户所在的部门
   */
  getCurrentDepartment(ids) {
    if (
      !ids.length ||
      !md.global.Account.accountId ||
      window.isPublicWorksheet ||
      _.isEmpty(getCurrentProject(this.projectId))
    )
      return;

    this.setLoadingInfo(ids, true);

    departmentAjax
      .getDepartmentsByAccountId({
        projectId: this.projectId,
        accountIds: [md.global.Account.accountId],
        includePath: true,
      })
      .then(result => {
        this.setLoadingInfo(ids, false);

        const getDepartments = controlId => {
          const { enumDefault, advancedSetting: { allpath } = {} } =
            this.data.find(item => item.controlId === controlId) || {};
          let departments = [];
          result.maps.forEach(item => {
            item.departments.forEach(obj => {
              departments.push({
                departmentId: obj.id,
                departmentName: allpath === '1' ? obj.departmentPath : obj.name,
              });
            });
          });
          departments = _.uniqBy(departments, 'departmentId');
          return enumDefault === 0 ? JSON.stringify(departments.slice(0, 1)) : JSON.stringify(departments);
        };

        ids.forEach(controlId => {
          const value = getDepartments(controlId);

          this.updateDataSource({
            controlId,
            value,
            isInit: true,
          });

          this.onAsyncChange({
            controlId,
            value,
          });
        });
      })
      .finally(() => {
        this.setLoadingInfo(ids, false);
      });
  }

  /**
   * 获取当前用户所在的组织角色
   */
  getCurrentOrgRole(ids) {
    if (
      !ids.length ||
      !md.global.Account.accountId ||
      window.isPublicWorksheet ||
      _.isEmpty(getCurrentProject(this.projectId))
    )
      return;

    this.setLoadingInfo(ids, true);

    organizeAjax
      .getOrganizesByAccountId({ projectId: this.projectId, accountIds: [md.global.Account.accountId] })
      .then(result => {
        let organizes = [];
        this.setLoadingInfo(ids, false);

        result.maps.forEach(item => {
          item.organizes.forEach(obj => {
            organizes.push({
              organizeId: obj.id,
              organizeName: obj.name,
            });
          });
        });

        organizes = _.uniqBy(organizes, 'organizeId');

        ids.forEach(controlId => {
          const { enumDefault } = this.data.find(item => item.controlId === controlId) || {};
          const value = enumDefault === 0 ? JSON.stringify(organizes.slice(0, 1)) : JSON.stringify(organizes);

          this.updateDataSource({
            controlId,
            value,
            isInit: true,
          });

          this.onAsyncChange({
            controlId,
            value,
          });
        });
      })
      .finally(() => {
        this.setLoadingInfo(ids, false);
      });
  }

  /**
   * 获取当前位置
   */
  getCurrentLocation(ids) {
    // 处理定位回来慢但是用户已经选择了位置
    ids = ids.filter(controlId => !this.data.find(o => o.controlId === controlId).value);

    if (!ids.length) return;

    compatibleMDJS(
      'getLocation',
      {
        success: res => {
          const { cLongitude, cLatitude, longitude, latitude, address, title } = res;
          ids.forEach(controlId => {
            let value = null;
            const control = _.find(this.data, { controlId });
            if ((typeof control.strDefault === 'string' ? control.strDefault : '00')[0] === '1') {
              value = JSON.stringify({
                x: longitude,
                y: latitude,
                coordinate: 'wgs84',
                address,
                title,
              });
            } else {
              value = JSON.stringify({
                x: cLongitude,
                y: cLatitude,
                coordinate: 'gcj02',
                address,
                title,
              });
            }
            this.updateDataSource({
              controlId,
              value,
              isInit: true,
            });
          });
          this.onAsyncChange({
            controlIds: ids,
            value: JSON.stringify({
              x: longitude,
              y: latitude,
              coordinate: 'wgs84',
              address,
              title,
            }),
          });
        },
        cancel: res => {
          const { errMsg } = res;
          if (!(errMsg.includes('cancel') || errMsg.includes('canceled'))) {
            window.nativeAlert(JSON.stringify(res));
          }
        },
      },
      () => {
        new MapLoader().loadJs().then(() => {
          const mapHandler = new MapHandler();
          mapHandler.getCurrentPos(
            (status, res) => {
              if (status === 'complete') {
                ids.forEach(controlId => {
                  this.updateDataSource({
                    controlId,
                    value: JSON.stringify({
                      x: res.position.lng,
                      y: res.position.lat,
                      address: res.formattedAddress || '',
                      title: (res.addressComponent || {}).building || '',
                    }),
                    isInit: true,
                  });
                });
                this.onAsyncChange({
                  controlIds: ids,
                  value: JSON.stringify({
                    x: res.position.lng,
                    y: res.position.lat,
                    address: res.formattedAddress || '',
                    title: (res.addressComponent || {}).building || '',
                  }),
                });
              }
              mapHandler.destroyMap();
            },
            false,
            { locationFailedAlert: !!ids.length },
          );
        });
      },
    );
  }

  /**
   * 获取当前关联记录数据
   */
  getCurrentRelateData({ controlId, dataSource: worksheetId, value }) {
    const control = _.isArray(value) ? value[0] : safeParse(value || '[]')[0];
    const { isGet, sid, sourcevalue } = control || {};
    const relateValue = safeParse(sourcevalue || '{}');
    const hasRelate = _.find(this.data, ({ advancedSetting: { defsource } = {}, dataSource, type }) => {
      return (
        // 关联记录被设为默认值的字段没找到值才拉取数据
        (safeParse(defsource || '[]').some(i => controlId === i.rcid && i.cid && _.isUndefined(relateValue[i.cid])) ||
          (type === 30 && dataSource.slice(1, -1) === controlId)) &&
        sid !== this.masterRecordRowId
      );
    });

    if (hasRelate && !isGet && sid && !sid.includes('temp')) {
      this.setLoadingInfo(controlId, true);

      let params = {
        getType: 1,
        worksheetId,
        rowId: sid,
      };
      // 公开表单
      if (window.isPublicWorksheet && window.publicWorksheetShareId) {
        params.shareId = window.publicWorksheetShareId;
        params.getType = 3;
      }
      // 填写链接
      if (_.get(window, 'shareState.isPublicWorkflowRecord') && _.get(window, 'shareState.shareId')) {
        params.shareId = _.get(window, 'shareState.shareId');
        params.getType = 13;
      }

      this.requestPool
        .getRowDetail(params, this.abortController)
        .then(result => {
          this.setLoadingInfo(controlId, false);

          if (result.resultCode === 7 || (this.from === 2 && this.isDraft && result.resultCode === 4)) return;

          const formatValue = JSON.stringify(
            safeParse(value || '[]').map((i, index) =>
              index === 0 ? Object.assign(i, { sourcevalue: result.rowData, isGet: true }) : i,
            ),
          );

          this.updateDataSource({
            controlId,
            value: formatValue,
            ignoreSearch: true,
          });

          this.onAsyncChange({
            controlId,
            value: formatValue,
          });
        })
        .finally(() => {
          this.setLoadingInfo(controlId, false);
        });
    }
  }

  /**
   * 获取异步数据
   */
  getAsyncData(isInit) {
    if (_.isEmpty(this.asyncControls)) return;

    Object.keys(this.asyncControls).forEach(id => {
      (this.asyncControls[id] || []).forEach(item => {
        if (item.isImportFromExcel && !checkCellIsEmpty(item.value)) {
          return;
        }
        // 部门 | 组织角色
        if (item.type === 27 || item.type === 48) {
          const accounts = safeParse(
            getDynamicValue(
              this.data,
              Object.assign({}, item, {
                advancedSetting: { defsource: item.advancedSetting.defsource.replace(/isAsync/gi, 'async') },
              }),
              this.masterData,
            ),
          );

          if (!accounts.length) {
            this.updateDataSource({ controlId: item.controlId, value: '[]', isInit });
          } else {
            if (
              !md.global.Account.accountId ||
              window.isPublicWorksheet ||
              _.isEmpty(getCurrentProject(this.projectId))
            )
              return;

            this.setLoadingInfo(item.controlId, true);

            const INFO_OPTIONS = {
              27: {
                id: 'departmentId',
                name: 'departmentName',
                ids: 'departments',
                api: departmentAjax.getDepartmentsByAccountId,
              },
              48: {
                id: 'organizeId',
                name: 'organizeName',
                ids: 'organizes',
                api: organizeAjax.getOrganizesByAccountId,
              },
            };

            const infoObj = INFO_OPTIONS[item.type];
            let ajaxParams = { projectId: this.projectId, accountIds: accounts.map(o => o.accountId) };
            if (item.type === 27) {
              ajaxParams.includePath = true;
            }

            infoObj
              .api(ajaxParams)
              .then(result => {
                let departments = [];
                this.setLoadingInfo(item.controlId, false);

                result.maps.forEach(r => {
                  r[infoObj.ids].forEach(obj => {
                    if (item.type === 27 && _.get(item, 'advancedSetting.allpath') === '1') {
                      departments.push({
                        [infoObj.id]: obj.id,
                        [infoObj.name]: obj.departmentPath,
                      });
                    } else {
                      departments.push({
                        [infoObj.id]: obj.id,
                        [infoObj.name]: obj.name,
                      });
                    }
                  });
                });

                departments = JSON.stringify(
                  item.enumDefault === 0
                    ? _.uniqBy(departments, infoObj.id).slice(0, 1)
                    : _.uniqBy(departments, infoObj.id),
                );

                // 多部门只获取第一个
                this.updateDataSource({
                  controlId: item.controlId,
                  value: departments,
                  isInit,
                });

                this.onAsyncChange({
                  controlId: item.controlId,
                  value: departments,
                });
              })
              .finally(() => {
                this.setLoadingInfo(item.controlId, false);
              });
          }
        }
      });
    });
  }

  /**
   * 能否执行查询（条件字段、字段值存在&&当前变更字段有值）
   * 查询条件支持且或，分组判断
   */
  getSearchStatus = (filters = [], controls = []) => {
    const splitFilters = getArrBySpliceType(filters);
    return _.some(splitFilters, (items = []) => {
      return _.every(getItemFilters(items), item => {
        // 固定值|字段值
        const isDynamicValue = item.dynamicSource && item.dynamicSource.length > 0;
        //筛选值字段
        const fieldResult =
          _.includes(['rowid', 'currenttime'], _.get(item.dynamicSource[0] || {}, 'cid')) ||
          _.find(this.data, da => da.controlId === _.get(item.dynamicSource[0] || {}, 'cid'));
        //条件字段
        const conditionExit = _.find(controls.concat(SYSTEM_CONTROLS), con => con.controlId === item.controlId);
        return isDynamicValue ? fieldResult : conditionExit;
      });
    });
  };

  /**
   * 查询记录
   */
  getFilterRowsData = (searchControl, para, controlId, effectControlId) => {
    const formatFilters = getFilter({ control: searchControl, formData: this.data });

    if (!formatFilters) return Promise.resolve(null);

    // 增加查询条件对比，由于一些异步更新，未完成时已被记录id,导致更新完被循环拦截(纯id拦截不准确)
    const tempFilterValue = getItemFilters(formatFilters).map(i =>
      _.pick(i, ['controlId', 'value', 'values', 'maxValue', 'minValue']),
    );
    const existFilters = this.loopList.filter(i => i.loopId === `${effectControlId}-${controlId}`);
    if (_.some(existFilters, e => _.isEqual(tempFilterValue, e.loopFilter))) {
      return Promise.resolve(null);
    }
    this.loopList.push({ loopId: `${effectControlId}-${controlId}`, loopFilter: tempFilterValue });

    let params = {
      filterControls: formatFilters,
      pageIndex: 1,
      searchType: 1,
      status: 1,
      getType: 7,
      ...para,
    };
    if (window.isPublicWorksheet) {
      params.formId = window.publicWorksheetShareId;
    }
    return this.requestPool.getFilterRowsByQueryDefault(params, this.abortController);
  };

  /**
   * 根据查询配置更新数据
   */
  getFilterConfigs = (control = {}, searchType) => {
    switch (searchType) {
      case 'init':
        return this.searchConfig.filter(({ items, controlId }) => {
          const curValue = _.get(
            _.find(this.data, d => d.controlId === controlId),
            'value',
          );
          const isNull = checkCellIsEmpty(curValue);

          return (
            _.every(
              getItemFilters(items),
              item =>
                _.includes(['rowid', 'currenttime'], _.get(item.dynamicSource[0] || {}, 'cid')) ||
                (item.dynamicSource || []).length === 0,
            ) && isNull
          );
        });
      case 'onBlur':
        return this.searchConfig
          .filter(({ controlId }) => controlId !== control.controlId)
          .filter(({ controlId, items }) => {
            const curValue = _.get(
              _.find(this.data, d => d.controlId === controlId),
              'value',
            );
            if (control.isImportFromExcel && curValue) {
              return;
            }
            return _.some(
              getItemFilters(items),
              item => _.get(item.dynamicSource[0] || {}, 'cid') === control.controlId,
            );
          });
      default:
        return [];
    }
  };

  /**
   * 根据查询配置更新数据
   */
  updateDataBySearchConfigs = ({ control = {}, searchType }) => {
    const filterSearchConfig = this.getFilterConfigs(control, searchType);

    if (_.isEmpty(filterSearchConfig)) return;

    filterSearchConfig.forEach(async currentConfig => {
      this.setLoadingInfo(currentConfig.controlId, true);

      const updateData = value => {
        this.updateDataSource({
          controlId: currentConfig.controlId,
          value,
        });

        this.onAsyncChange({
          controlId: currentConfig.controlId,
          value,
        });

        // 初始时由工作表查询引起的变更遗漏
        if (!_.includes(this.ruleControlIds, currentConfig.controlId) && searchType === 'init') {
          this.ruleControlIds.push(currentConfig.controlId);
        }

        this.setLoadingInfo(currentConfig.controlId, false, true);
      };

      const {
        items = [],
        configs = [],
        templates = [],
        moreType,
        recordsNotFound,
        moreSort,
        sourceId,
        controlType,
        controlId,
        id,
      } = currentConfig;
      const controls = _.get(templates[0] || {}, 'controls') || [];
      //当前配置查询的控件
      const currentControl = _.find(this.data, da => da.controlId === controlId);
      if (!currentControl) {
        this.setLoadingInfo(controlId, false, true);
        return;
      }
      // 表单类型转换，矫正数量配置
      let queryCount = getDefaultCount(currentControl, currentConfig.queryCount);
      // 满足查询时机
      const canSearch = this.getSearchStatus(items, controls);
      // 能配查询多条的是否赋值的控件
      const canSearchMore =
        !_.includes([29, 34], currentControl.type) || (currentControl.type === 29 && currentControl.enumDefault === 1);
      const searchControl = {
        ...currentControl,
        advancedSetting: { filters: JSON.stringify(items) },
        recordId: this.recordId,
        relationControls: controls,
      };

      //表删除、没有控件、不符合查询时机、当前配置控件已删除等不执行
      if (
        templates.length > 0 &&
        controls.length > 0 &&
        canSearch &&
        currentControl &&
        !_.includes(this.loopList, `${control.controlId}-${controlId}`)
      ) {
        //关联记录、或同源级联直接查询赋值
        if (_.includes([29], controlType) || (controlType === 35 && currentControl.dataSource === sourceId)) {
          const res = await this.debounceGetFilterRowsData(
            id,
            searchControl,
            {
              worksheetId: sourceId,
              pageSize: currentControl.enumDefault === 1 ? 1 : queryCount,
              id,
              getAllControls: true,
              sortControls: moreSort,
              ...(get(window, 'shareState.shareId') ? { relationWorksheetId: currentConfig.worksheetId } : {}),
            },
            controlId,
            control.controlId,
          );

          // 查询失败、查询多条不赋值、未查询到不赋值
          if (
            !res ||
            res.resultCode !== 1 ||
            (canSearchMore && res.count > 1 && moreType === 1) ||
            (recordsNotFound === 1 && !res.count)
          ) {
            this.setLoadingInfo(controlId, false, true);
            return;
          }

          // 查询多条赋空值、未查询到赋空值
          const emptyValue = (canSearchMore && res.count > 1 && moreType === 2) || (!res.count && !recordsNotFound);

          const titleControl = _.find(_.get(currentControl, 'relationControls'), i => i.attribute === 1);
          const newValue = (res.data || []).map(item => {
            const nameValue = titleControl ? item[titleControl.controlId] : undefined;
            return {
              isNew: true,
              isWorksheetQueryFill: _.get(currentControl.advancedSetting || {}, 'showtype') === '1',
              sourcevalue: JSON.stringify(item),
              row: item,
              type: 8,
              sid: item.rowid,
              name: getCurrentValue(titleControl, nameValue, { type: 2 }),
            };
          });
          if ((_.isEmpty(newValue) || emptyValue) && _.includes([29], controlType)) {
            this.isMobile ? updateData('') : updateData('deleteRowIds: all');
          } else {
            emptyValue ? updateData('') : updateData(JSON.stringify(newValue));
          }
        } else {
          //子表和普通字段需判断映射字段存在与否
          const canMapConfigs = configs.filter(({ cid, subCid }) => {
            return (_.find(controls, c => c.controlId === subCid) || subCid === 'rowid') && currentControl.type === 34
              ? _.find(currentControl.relationControls || [], re => re.controlId === cid)
              : currentControl.controlId === cid;
          });

          if (!canMapConfigs.length) {
            this.setLoadingInfo(controlId, false, true);
            return;
          }

          const res = await this.debounceGetFilterRowsData(
            id,
            searchControl,
            {
              worksheetId: sourceId,
              pageSize: controlType === 34 ? queryCount : 1,
              id,
              getAllControls: controlType === 34,
              sortControls: moreSort,
              ...(get(window, 'shareState.shareId') ? { relationWorksheetId: currentConfig.worksheetId } : {}),
            },
            controlId,
            control.controlId,
          );

          // 失败、查询多条不赋值
          if (
            !res ||
            res.resultCode !== 1 ||
            (canSearchMore && res.count > 1 && moreType === 1) ||
            (recordsNotFound === 1 && !res.count)
          ) {
            this.setLoadingInfo(controlId, false, true);
            return;
          }

          // 查询多条赋空值、未查询到赋空值
          const emptyValue = (canSearchMore && res.count > 1 && moreType === 2) || (!res.count && !recordsNotFound);

          if (emptyValue) {
            updateData(
              controlType === 34
                ? {
                    action: 'clearAndSet',
                    isDefault: true,
                    rows: [],
                  }
                : '',
            );
            return;
          }

          const filterData = res.data || [];
          //子表
          if (controlType === 34) {
            const newValue = [];
            if (filterData.length) {
              filterData.forEach(item => {
                let row = {};
                canMapConfigs.map(({ cid = '', subCid = '' }) => {
                  const controlVal = _.find(currentControl.relationControls || [], re => re.controlId === cid);
                  if (controlVal) {
                    if (subCid === 'rowid') {
                      row[cid] =
                        controlVal.type === 29
                          ? JSON.stringify([
                              {
                                sourcevalue: JSON.stringify(item),
                                row: item,
                                type: 8,
                                sid: item.rowid,
                              },
                            ])
                          : item.rowid;
                      return;
                    }
                    row[cid] = formatSearchResultValue({
                      targetControl: _.find(controls, s => s.controlId === subCid),
                      currentControl: controlVal,
                      controls,
                      searchResult: item[subCid] || '',
                    });
                  }
                });
                //映射明细所有字段值不为空
                if (_.some(Object.values(row), i => !_.isUndefined(i))) {
                  newValue.push({
                    ...row,
                    rowid: `temprowid-${uuidv4()}`,
                    allowedit: true,
                    addTime: new Date().getTime(),
                  });
                }
              });
            }
            updateData({
              action: 'clearAndSet',
              isDefault: true,
              rows: newValue,
            });
          } else {
            //普通字段取第一条
            const currentId = _.get(canMapConfigs[0] || {}, 'subCid');
            //取该控件值去填充
            const item = _.find(controls, c => c.controlId === currentId);
            const value = formatSearchResultValue({
              targetControl: item,
              currentControl,
              controls,
              searchResult: (filterData[0] || {})[currentId],
            });
            // 防止新建的时候无效变更引起的报错提示
            if (searchType === 'init' && _.isEqual(value, currentControl.value)) {
              this.setLoadingInfo(controlId, false, true);
              return;
            }
            updateData(value);
          }
        }
      } else {
        this.setLoadingInfo(controlId, false, true);
      }
    });
  };

  /**
   * 操作字段的 store
   */
  callStore(fn, ...args) {
    let fnName = _.isObject(fn) ? fn.fnName : fn;
    Object.keys(this.storeCenter).forEach(key => {
      const store = this.storeCenter[key];
      if (_.isObject(fn) && fn.controlId && fn.controlId !== get(store.getState(), 'base.control.controlId')) return;
      if (store && _.isFunction(store[fnName])) {
        store[fnName](...args);
      }
    });
  }
}
