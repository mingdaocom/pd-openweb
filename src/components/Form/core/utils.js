import _, { get, isEmpty } from 'lodash';
import { filterEmptyChildTableRows } from 'src/utils/core/childTable';
import { supportDisplayRow } from 'src/utils/domain/control/capabilities';
import { isOldSheetList, isTabSheetList } from 'src/utils/domain/control/editorLayout';
import { controlState } from 'src/utils/domain/control/state';
import { checkCellIsEmpty, WIDGET_VALUE_ID } from 'src/utils/domain/control/value';
import { ALL_SYS } from 'src/utils/domain/control/widget';
import { RELATE_RECORD_SHOW_TYPE, RELATION_SEARCH_SHOW_TYPE } from 'src/utils/domain/worksheet/constants';
import { getRelateRecordCountFromValue } from 'src/utils/domain/worksheet/record';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { isPublicLink } from 'src/utils/platform/runtime/shareState';
import { FORM_ERROR_TYPE, FORM_ERROR_TYPE_TEXT, FROM } from './config';

export function validate(id = '') {
  return !/^(temp|default|public-temp|deleterowids)/.test(id.toLowerCase());
}

export const convertControl = type => {
  switch (type) {
    case 2:
      return 'TEXTAREA'; // 多行文本框

    case 3:
      return 'MOBILE_PHONE'; // 手机

    case 4:
      return 'TEL_PHONE'; // 座机

    case 5:
      return 'EMAIL'; // 邮箱

    case 6:
    case 8:
      return 'NUMBER'; // 数值、金额

    case 7:
      return 'ID'; // 证件

    case 9:
      return 'RADIO'; // 单选

    case 10:
      return 'CHECKBOX'; // 多选

    case 11:
    case 44:
      return 'DROP_DOWN'; // 下拉框

    case 14:
      return 'ATTACHMENT'; // 附件

    case 15:
    case 16:
      return 'DATE'; // 日期、日期时间

    case 17:
    case 18:
      return 'DATE_RANGE'; // 日期段、日期时间段

    case 19:
    case 23:
    case 24:
      return 'AREA'; // 地区

    case 21:
      return 'RELATION'; // 关联

    case 22:
      return 'SplitLine'; // 分割线

    case 25:
    case 31:
    case 32:
    case 33:
      return 'READONLY'; // 只读

    case 26:
      return 'USER_SELECT'; // 人员选择

    case 27:
      return 'DEPARTMENT_SELECT'; // 部门选择

    case 28:
      return 'RANGE'; // 等级

    case 29:
      return 'RELATE_RECORD'; // 关联他表

    case 30:
      return 'SHEET_FIELD'; // 他表字段

    case 34:
      return 'SUBLIST'; // 子表

    case 35:
      return 'Cascader'; // 多级下拉

    case 36:
      return 'CHECK'; // 检查框

    case 37:
      return 'SUBTOTAL'; // 汇总

    case 38:
      return 'DATECALC'; // 日期计算

    case 40:
      return 'LOCATION'; // 定位

    case 41:
    case 10010:
      return 'RICH_TEXT'; // 富文本

    case 42:
      return 'SIGNATURE'; // 签名

    case 43:
      return 'OCR'; // 文字识别

    case 45:
      return 'Embed'; // 嵌入

    case 46:
      return 'Time'; // 时间

    case 47:
      return 'BarCode'; // 嵌入

    case 48:
      return 'OrgRole'; // 组织角色

    case 49:
      return 'Search'; // api查询--按钮

    case 50:
      return 'Search'; // api查询--下拉框

    case 51:
      return 'RelationSearch'; // 查询记录

    case 52:
      return 'Section'; // 分段

    case 53:
      return 'FormulaFunc'; // 函数公式

    default:
      return 'CustomWidgets'; // 自定义组件
  }
};

function formatRowToServer(row, controls = [], { isDraft, isSubList } = {}) {
  controls = controls.filter(c => c.type !== 34);
  return Object.keys(row)
    .map(key => {
      const c = _.find(controls, c => c.controlId === key);

      if (key === 'rowid') {
        return {
          controlId: 'tempRowId',
          value: row.rowid,
        };
      } else if (!c || c.type === 47) {
        return undefined;
      } else {
        return _.pick(
          formatControlToServer(
            { ...c, value: row[key] },
            {
              isSubList,
              isSubListCopy: row.isCopy,
              isDraft,
              isNewRecord: row.rowid && (row.rowid.startsWith('temp') || row.rowid.startsWith('default')),
            },
          ),
          ['controlId', 'value', 'editType'],
        );
      }
    })
    .filter(c => c && c.controlId && !_.isUndefined(c.value));
}

/**
 * 格式化子表中的已有行（非 temp-/default- 行）
 * 正常编辑都会带 updatedControlIds，只提交改动列；没有 updatedControlIds 的已有行属于异常状态
 * （如保存后行被重新加载、表单又收到一次行更新），此时若按整行提交，会把接口不返回值的隐藏关联（含关联主记录的父关联）、
 * 拥有者、附件等字段写空，导致子记录被移除，因此不提交。
 */
function formatExistingSubListRow(row, controls = []) {
  if (!row.updatedControlIds) {
    return undefined;
  }

  return {
    rowid: row.rowid,
    editType: 0,
    newOldControl: formatRowToServer({ ..._.pick(row, row.updatedControlIds), rowid: row.rowid }, controls, {
      isSubList: true,
    }),
  };
}

/**
 * 将控件数据格式化成后端需要的数据
 * @param  {} control 控件
 */
export function formatControlToServer(
  control,
  {
    isSubListCopy,
    isDraft,
    isSubList,
    isFromMingoData,
    isNewRecord,
    needSourceValue,
    needFullUpdate,
    hasDefaultRelateRecordTableControls = [],
  } = {},
) {
  let result = {
    controlId: control.controlId,
    type: control.type,
    value: control.value,
    controlName: control.controlName,
    dot: control.dot,
  };

  if (_.isUndefined(control.value) && !control.store) {
    return result;
  }

  let parsedValue, childTableControls, isFromDefault, state, rows, subListOrderChanged;
  const isRelateRecordDropdown =
    control.type === 29 &&
    String(_.get(control, 'advancedSetting.showtype')) === String(RELATE_RECORD_SHOW_TYPE.DROPDOWN);
  const isSingleRelateRecord = control.type === 29 && control.enumDefault === 1;

  switch (control.type) {
    case 10:
    case 11:
      let options = safeParse(result.value, 'array');
      if (!Array.isArray(options)) options = [];

      options.forEach((item, i) => {
        if ((item || '').indexOf('add_') > -1) {
          options[i] = JSON.stringify({
            color: '#1677ff',
            value: item.split('add_')[1],
          });
        }
      });

      result.value = JSON.stringify(options);
      break;
    case 14: // 附件
      let parsed = safeParse(control.value);
      let oldAttachments = [];
      let oldKnowledgeAtts = [];

      if ((isSubListCopy || isDraft) && _.isArray(parsed) && !_.isEmpty(parsed)) {
        result.value = JSON.stringify(parsed.map(a => a.fileID || a.fileId));
        break;
      }

      (parsed.attachmentData || []).forEach(item => {
        item = Object.assign({}, item, { fileExt: item.ext }, { isEdit: true });
        if (item.fileId && !item.fileID) {
          item.fileID = item.fileId;
        }

        if (item.refType || item.refId) {
          oldKnowledgeAtts.push(item);
        } else {
          oldAttachments.push(item);
        }
      });

      result.value = JSON.stringify({
        attachmentData: [],
        attachments: (parsed.attachments || [])
          .map(item => Object.assign({}, item, { isEdit: false }))
          .concat(oldAttachments),
        knowledgeAtts: (parsed.knowledgeAtts || [])
          .map(item => Object.assign({}, item, { isEdit: false }))
          .concat(oldKnowledgeAtts),
      });
      break;
    case 19:
    case 23:
    case 24:
      try {
        parsedValue = JSON.parse(control.value);
        result.value = parsedValue.code;
      } catch (err) {
        console.log(err);
      }

      break;
    case 29:
      if (control.editType) {
        result.editType = control.editType;
      }

      if (
        _.includes(
          [
            String(RELATE_RECORD_SHOW_TYPE.LIST),
            String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
            String(RELATE_RECORD_SHOW_TYPE.TABLE),
          ],

          control.advancedSetting.showtype,
        ) &&
        control.store
      ) {
        state = control.store.getState();
        // 默认关联的主记录可能还没有 rowid（批量触发按钮时 recordId 为 false、新建态主记录为 undefined），
        // 不能提交成 {sid:false} / {}，否则后端会存下无效关联
        const savedRecords = state.records.filter(record => _.isString(record.rowid) && !!record.rowid);

        if (isDraft && control.advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)) {
          result.value = JSON.stringify(
            savedRecords
              .map(record => ({ sid: record.rowid }))
              .concat(state.changes.addedRecordIds.map(id => ({ sid: id }))),
          );
        } else if (isNewRecord || _.includes(hasDefaultRelateRecordTableControls, control.controlId)) {
          result.value = JSON.stringify(savedRecords.map(record => ({ sid: record.rowid })));
        } else if (
          get(state, 'changes.isDeleteAll') &&
          control.advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)
        ) {
          result.editType = 0;
          result.value = JSON.stringify(state.changes.addedRecordIds.map(id => ({ sid: id })));
        } else if (
          !isEmpty(state.changes) &&
          control.advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)
        ) {
          result.editType = 9;
          result.value = JSON.stringify(
            state.changes.addedRecordIds
              .map(id => ({ editType: 1, rowid: id }))
              .concat(state.changes.deletedRecordIds.map(id => ({ editType: 2, rowid: id }))),
          );
        } else {
          result.value = undefined;
        }
      } else {
        parsedValue = safeParse(control.value);
        isFromDefault = !!_.find(parsedValue, { isFromDefault: true });
        if (_.isArray(parsedValue)) {
          if (
            isDraft ||
            isNewRecord ||
            needFullUpdate ||
            (browserIsMobile() && _.includes(hasDefaultRelateRecordTableControls, control.controlId)) ||
            isRelateRecordDropdown ||
            isSingleRelateRecord ||
            isFromDefault ||
            isFromMingoData ||
            control.editType === 31 ||
            _.get(parsedValue, '0.needFullUpdate')
          ) {
            result.value = _.isArray(parsedValue)
              ? JSON.stringify(
                  parsedValue
                    .map(item => ({
                      name: item.name,
                      sid: item.sid,
                      sourcevalue: needSourceValue && item.sourcevalue,
                    }))
                    .filter(
                      item =>
                        !_.isEmpty(item.sid) &&
                        (isSubList ? validate(_.replace(item.sid, /^(temp|default)-/, '')) : validate(item.sid)),
                    ),
                )
              : '';
          } else {
            result.editType = 9;
            const addedIds = parsedValue.filter(r => r.isNew).map(r => r.sid);
            const deletedIds = (_.get(parsedValue, '0.deletedIds') || []).filter(
              id => !_.find(parsedValue, r => r.sid === id),
            );
            result.value = JSON.stringify(
              addedIds
                .map(id => ({ editType: 1, rowid: id }))
                .concat(deletedIds.map(id => ({ editType: 2, rowid: id }))),
            );
          }
        } else if (
          typeof control.value === 'string' &&
          control.value.startsWith('deleteRowIds') &&
          control.value !== 'deleteRowIds: all'
        ) {
          let deletedIds = [];

          try {
            deletedIds = control.value.replace('deleteRowIds: ', '').split(',').filter(_.identity);
          } catch (err) {
            console.log(err);
            result.value = undefined;
          }

          result.editType = 9;
          result.value = JSON.stringify(deletedIds.map(id => ({ editType: 2, rowid: id })));
        } else {
          result.value = undefined;
        }
      }

      break;
    case 34: // 子表
      // 拖拽排序：与关联记录(type29)一致，走 editType 31 + sid 顺序数组的轻量排序，
      // 后端按 rowid 重排、不重建行；不进入下面读 store 的整表提交逻辑。
      if (control.editType === 31) {
        result.editType = 31;
        result.value = _.isString(control.value) ? control.value : JSON.stringify(control.value || []);
        break;
      }

      if (isFromMingoData) {
        result.value = JSON.stringify(
          safeParse(control.value, 'array').map(row =>
            formatRowToServer(row, control.relationControls || [], { isSubList: true }),
          ),
        );
        break;
      }

      state = control.store && control.store.getState();
      // 插入行/拖拽排序改变过顺序：保存时需与 value 平级附带完整记录排序 controlItems。
      // 下面的差量分支会 dispatch RESET_CHANGES 清掉该标记，故此处先捕获。
      subListOrderChanged = !!get(state, 'changes.orderChanged');
      childTableControls = get(state, 'base.controls') || [];
      if (_.isEmpty(childTableControls)) {
        console.log('childTableControls is empty');
      }

      childTableControls = childTableControls
        .filter(c => !_.includes(_.get(window, 'shareState.isPublicForm') ? [48] : [], c.type))
        .filter(v => (isDraft ? v.controlId !== 'ownerid' : true));

      if (
        (!result.value || (_.isNumber(Number(result.value)) && !_.isNaN(Number(result.value)))) &&
        (!_.isEmpty(filterEmptyChildTableRows(get(state, 'rows', []))) || get(state, 'changes.isDeleteAll'))
      ) {
        result.editType = 9;
        if (isNewRecord) {
          result.value = JSON.stringify(
            filterEmptyChildTableRows(get(state, 'rows', [])).map(row =>
              formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
            ),
          );
        } else {
          rows = filterEmptyChildTableRows(get(state, 'rows', [])).map(row => ({
            editType: 0,
            newOldControl: formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
          }));
          if (!_.isEmpty(rows)) {
            result.value = JSON.stringify([
              {
                rowid: 'all',
                editType: 2,
              },
              ...rows,
            ]);
          } else if (get(state, 'changes.isDeleteAll')) {
            result.value = JSON.stringify([
              {
                rowid: 'all',
                editType: 2,
              },
            ]);
          } else {
            result.value = '';
          }
        }
      } else if (_.isUndefined(control.value)) {
        return result;
      } else if (result.value.isAdd) {
        result.value = JSON.stringify(
          filterEmptyChildTableRows(get(state, 'rows', [])).map(row =>
            formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
          ),
        );
        if (result.value === '[]') {
          result.value = '';
        }
      } else {
        result.editType = 9;
        let resultvalue = [];

        if (!_.isEmpty(result.value.deleted)) {
          resultvalue = resultvalue.concat(
            result.value.deleted.map(rowid => ({
              rowid,
              editType: 2,
            })),
          );
        }

        // 兜底：store 里的 temp-/default- 新增行必须进入提交名单，即使变更集（value.updated）
        // 因异步查询回填的竞态漏登记，避免快速连续录入（如扫码）时保存静默丢行
        const storeNewRowIds =
          _.isObject(result.value) && control.store
            ? filterEmptyChildTableRows(get(state, 'rows', []))
                .map(row => row.rowid)
                .filter(id => /^(temp|default)/.test(String(id)))
            : [];
        const updatedRowIds = _.uniq((result.value.updated || []).concat(storeNewRowIds));

        if (!_.isEmpty(updatedRowIds)) {
          resultvalue = resultvalue.concat(
            updatedRowIds
              .map(rowid => {
                const isNew = /^(temp|default)/.test(rowid);
                let row = _.find(get(state, 'rows', []), r => r.rowid === rowid);

                if (!row) {
                  return undefined;
                }

                if (isNew) {
                  return {
                    editType: 0,
                    newOldControl: formatRowToServer({ ...row, rowid }, childTableControls, { isSubList: true }),
                  };
                } else {
                  return formatExistingSubListRow(row, childTableControls);
                }
              })
              .filter(_.identity),
          );
        }

        if (get(state, 'changes.isDeleteAll')) {
          resultvalue = resultvalue.concat({
            rowid: 'all',
            editType: 2,
          });
        }

        result.value = JSON.stringify(filterEmptyChildTableRows(resultvalue));
        if (control.store && control.store.dispatch) {
          control.store.dispatch({
            type: 'RESET_CHANGES',
          });
        }

        if (_.isEmpty(resultvalue) && control && typeof control.value === 'string') {
          try {
            const rows = JSON.parse(control.value);
            result.value = JSON.stringify(
              filterEmptyChildTableRows(rows).map(row =>
                formatRowToServer(row, childTableControls || [], { isDraft, isSubList: true }),
              ),
            );
          } catch (err) {
            console.log(err);
          }
        }
      }

      // 子表做过插入行/拖拽排序时，与 value 平级附带完整记录排序，供后端按序落库
      if (subListOrderChanged && control.store) {
        result.controlItems = filterEmptyChildTableRows(control.store.getState().rows).map(row => ({
          key: row.rowid,
        }));
      }

      break;
  }

  return result;
}

// 是否需要校验短信验证码
export const checkMobileVerify = (data, smsVerificationFiled) => {
  if (!smsVerificationFiled) return false;
  const selectControl = _.find(data, i => i.controlId === smsVerificationFiled);
  if (!selectControl) return false;
  // 手机号是否是电话 | 手机号只读 ｜ 手机号隐藏
  if (selectControl.type !== 3) return false;
  if (!controlState(selectControl, FROM.PUBLIC_ADD).visible) return false;
  if (!selectControl.value) return false;
  return true;
};

// 渲染计数
export const renderCount = item => {
  const { type, enumDefault, value, advancedSetting } = item;
  let count;

  // 人员多选、部门多选、多条卡片
  if (
    (_.includes([26, 27], type) && enumDefault === 1) ||
    (type === 29 && enumDefault === 2 && _.includes(['1', '2'], advancedSetting.showtype))
  ) {
    const recordsCount = getRelateRecordCountFromValue(value, item.count);
    count = _.isUndefined(recordsCount) ? item.count : recordsCount;
  }

  if (type === 29 && advancedSetting.showtype === String(RELATE_RECORD_SHOW_TYPE.TABLE)) {
    const state = item.store.getState();
    count =
      state.loading && /^\d+$/.test(item.value)
        ? item.value
        : typeof state.tableState.countForShow !== 'undefined'
          ? state.tableState.countForShow
          : state.tableState.count;
  }

  // 附件
  if (type === 14) {
    const files = JSON.parse(value || '[]');

    if (_.isArray(files)) {
      count = files.length;
    } else {
      count = files.attachments.length + files.knowledgeAtts.length + files.attachmentData.length;
    }
  }

  // 子表
  if (type === 34) {
    try {
      if (typeof value === 'object') {
        count = value.num || filterEmptyChildTableRows(value.rows || []).length;
      } else if (!_.isNaN(parseInt(item.value, 10))) {
        count = parseInt(item.value, 10);
      } else if (item.store) {
        try {
          count = filterEmptyChildTableRows(item.store.getState().rows).length;
        } catch (err) {
          console.log(err);
        }
      }

      if (count > 1000) {
        count = 1000;
      }
    } catch (err) {
      console.log(err);
    }
  }

  return count && count !== '0' ? `(${count})` : null;
};

//控件切换成size情况，兼容老数据
export const halfSwitchSize = (item, from) => {
  const half =
    item.half ||
    (item.type === 28 && item.enumDefault === 1) ||
    (item.type === 29 &&
      item.enumDefault === 1 &&
      parseInt(item.advancedSetting.showtype, 10) === 3 &&
      from !== FROM.H5_ADD &&
      from !== FROM.PUBLIC_ADD);

  return half ? 6 : 12;
};

export const getControlsByTab = (controls = [], widgetStyle = {}, from, ignoreSection = false, otherTabs = []) => {
  // 基础控件
  let commonData = [];
  // 特殊控件
  let tabData = [];
  // 老的关联列表
  let oldRelateList = [];
  const tabPosition = widgetStyle.tabposition || '1';
  const isMobile = browserIsMobile();

  function sortList(list = []) {
    return list.sort((a, b) => {
      if (a.row === b.row) {
        return a.col - b.col;
      }

      return a.row - b.row;
    });
  }

  if (ignoreSection) {
    return { commonData: sortList(controls), tabData: [] };
  }

  const sectionControlsMap = {};

  controls.forEach(item => {
    if (item.sectionId) {
      sectionControlsMap[item.sectionId] = sectionControlsMap[item.sectionId] || [];
      sectionControlsMap[item.sectionId].push(item);
    }
  });

  controls.forEach(item => {
    if (_.includes(ALL_SYS, item.controlId)) {
      return;
    }

    if (item.type === 52) {
      tabData.push({
        ...item,
        child: sortList(sectionControlsMap[item.controlId] || []),
      });
    } else if (isTabSheetList(item)) {
      tabData.push(item);
    } else if (isOldSheetList(item)) {
      oldRelateList.push(item);
    } else if (!item.sectionId) {
      commonData.push(item);
    }
  });

  commonData = sortList(commonData);
  tabData = sortList(tabData).concat(sortList(oldRelateList));

  // h5或者配置在顶部的
  if (isMobile || (_.includes(['2', '3', '4'], tabPosition) && !ignoreSection)) {
    const defaultTab = [
      {
        controlId: 'detail',
        controlName: widgetStyle.deftabname || _l('详情'),
        type: 52,
        sectionId: '',
        child: commonData,
        advancedSetting: { icon: widgetStyle.tabicon },
      },
    ];

    const allCommonHide = _.every(commonData, c => !(controlState(c, from).visible && !c.hidden));
    tabData = allCommonHide
      ? isMobile && !_.isEmpty(otherTabs)
        ? defaultTab.concat(tabData)
        : tabData
      : defaultTab.concat(tabData);
    commonData = [];
  }

  tabData = tabData.filter(v => (v.type == 52 ? v.child.length : true));

  if (isMobile) {
    // 将关联列表表格、标签页表格转换为卡片形式
    const updateMobileControls = (control = {}) => {
      if (_.includes([29, 51], control.type)) {
        const showType = _.get(control, 'advancedSetting.showtype');
        return {
          ...control,
          advancedSetting: {
            ...control.advancedSetting,
            showtype: control.type === 51 && showType === '5' ? '1' : _.includes(['5', '6'], showType) ? '2' : showType,
            icon: control.type === 29 && _.includes(['2', '6'], showType) ? 'link_record' : 'Worksheet_query',
          },
          sourceControlType: _.includes(['5', '6'], showType) ? 2 : control.sourceControlType,
        };
      }

      return control;
    };

    tabData = tabData.map(item => {
      return {
        ...updateMobileControls(item),
        child: (item.child || []).map(v => updateMobileControls(v)),
      };
    });
    commonData = commonData.map(v => updateMobileControls(v));
    if (_.isEmpty(commonData) && _.isEmpty(otherTabs) && tabData.length === 1) {
      commonData = tabData[0].child;
      tabData = [];
    }
  }

  return { commonData, tabData };
};

// 标题是否横向布局、隐藏按横向排列
export const getWidgetDisplayRow = ({ item = {}, data = [], widgetStyle = {} }) => {
  const { titlelayout_pc = '1', titlelayout_app = '1' } = widgetStyle;

  if ((browserIsMobile() ? titlelayout_app : titlelayout_pc) === '2' && supportDisplayRow(item)) {
    return { displayRow: true };
  }

  const rowWidgets = data.filter(i => i.row === item.row);

  if (rowWidgets.every(row => _.get(row, 'advancedSetting.hidetitle') === '1' && supportDisplayRow(row))) {
    return { displayRow: true, titlewidth_pc: '0' };
  }

  return {};
};

export const getWidgetLayoutInfo = ({ data = [], widgetStyle = {} }) => {
  const { titlelayout_pc = '1', titlelayout_app = '1' } = widgetStyle;
  const rowControlCountMap = {};
  const rowWidgetsMap = {};
  let richTextControlCount = 0;

  data.forEach(item => {
    rowControlCountMap[item.row] = (rowControlCountMap[item.row] || 0) + 1;
    rowWidgetsMap[item.row] = rowWidgetsMap[item.row] || [];
    rowWidgetsMap[item.row].push(item);
    if (item.type === 41) richTextControlCount += 1;
  });

  if ((browserIsMobile() ? titlelayout_app : titlelayout_pc) === '2') {
    const displayRowMap = data.reduce((map, item) => {
      if (supportDisplayRow(item)) {
        map[item.controlId] = { displayRow: true };
      }

      return map;
    }, {});

    return { displayRowMap, richTextControlCount, rowControlCountMap };
  }

  const displayRowMap = data.reduce((map, item) => {
    const rowWidgets = rowWidgetsMap[item.row] || [];

    if (rowWidgets.every(row => _.get(row, 'advancedSetting.hidetitle') === '1' && supportDisplayRow(row))) {
      map[item.controlId] = { displayRow: true, titlewidth_pc: '0' };
    }

    return map;
  }, {});

  return { displayRowMap, richTextControlCount, rowControlCountMap };
};

export const getWidgetDisplayRowMap = options => getWidgetLayoutInfo(options).displayRowMap;

const WIDGET_LAYOUT_CACHE_LIMIT = 20;

export const getCachedWidgetLayoutInfo = (cache, { data = [], widgetStyle = {} }) => {
  const cacheKey = data.map(item => item.controlId).join('|');
  const titleLayout = browserIsMobile() ? widgetStyle.titlelayout_app || '1' : widgetStyle.titlelayout_pc || '1';
  const signature = `${titleLayout}:${data
    .map(item =>
      [
        item.controlId,
        item.row,
        item.type,
        _.get(item, 'advancedSetting.hidetitle') || '',
        _.get(item, 'advancedSetting.showtype') || '',
      ].join(':'),
    )
    .join('|')}`;
  const cachedLayout = cache[cacheKey];

  if (cachedLayout && cachedLayout.signature === signature) {
    return cachedLayout.layoutInfo;
  }

  const layoutInfo = getWidgetLayoutInfo({ data, widgetStyle });

  if (!cachedLayout && Object.keys(cache).length >= WIDGET_LAYOUT_CACHE_LIMIT) {
    delete cache[Object.keys(cache)[0]];
  }

  cache[cacheKey] = { layoutInfo, signature };

  return layoutInfo;
};

export const getErrorItemsMap = (errorItems = [], uniqueErrorItems = []) => {
  return [].concat(errorItems || [], uniqueErrorItems || []).reduce((map, item) => {
    if (item && item.controlId && !map[item.controlId]) {
      map[item.controlId] = item;
    }

    return map;
  }, {});
};

export const getArrBySpliceType = (filters = []) => {
  let num = 0;
  return Object.values(
    filters.reduce((res, item) => {
      res[num] ? res[num].push(item) : (res[num] = [item]);
      if (item.spliceType === 2) {
        num++;
      }

      return res;
    }, {}),
  );
};

// 后端接口报错
export const getServiceError = (badData = [], data, from) => {
  const serviceError = [];
  const hideControlErrors = [];
  badData.forEach(controlId => {
    const control = _.find(data, d => d.controlId === controlId);
    const error = {
      controlId,
      errorText: FORM_ERROR_TYPE_TEXT.REQUIRED(control),
      errorType: FORM_ERROR_TYPE.REQUIRED,
      showError: true,
    };

    if (!controlState(control, from).visible) {
      hideControlErrors.push(error.errorText);
    }

    serviceError.push(error);
  });
  return { serviceError, hideControlErrors };
};

// 计算汇总去重、单个去重计数
export function calcSubTotalCount(values = [], control = {}, currentItem = {}) {
  const unique = currentItem.enumDefault === 21;
  const filterValues = values.filter(c => {
    if (control.type === 36) {
      return c === '1';
    } else if (_.includes([29, 34], control.type) && _.isNumber(c)) {
      return !!c;
    } else {
      return !checkCellIsEmpty(c);
    }
  });

  let formatValues = filterValues.map(f => {
    if (_.includes([9, 10, 11, 26, 27, 29, 35, 48], control.type)) {
      const safeValue = safeParse(f || '[]');
      if (_.isEmpty(safeValue)) return [];

      if (_.includes([9, 10, 11], control.type)) {
        return safeValue.map(i => (i.indexOf('other') > -1 ? 'other' : i));
      }

      const value = safeValue.map(i => i[WIDGET_VALUE_ID[control.type]]);
      return unique ? value.sort() : value;
    }

    return f;
  });

  const containsEmptyValues =
    _.get(currentItem, 'advancedSetting.reportempty') === '1' && values.length !== filterValues.length ? 1 : 0;

  if (unique) return _.uniqWith(formatValues, _.isEqual).length + containsEmptyValues;

  const totalValues = _.reduce(
    formatValues,
    (total, v) => {
      const itemValues = _.isArray(v) ? v : [v];
      return total.concat(itemValues);
    },
    [],
  );

  return _.uniq(totalValues).length + containsEmptyValues;
}

export const showRefreshBtn = ({ disabledFunctions = [], from, recordId, item, isEditing }) => {
  // 仅公式类字段在编辑态隐藏刷新按钮，其他可刷新字段不受编辑态影响
  const isFormulaControl = _.includes([31, 38, 53], item.type);
  const hideFormulaRefreshInEdit = isFormulaControl && isEditing;

  return (
    !disabledFunctions.includes('controlRefresh') &&
    from !== FROM.DRAFT &&
    !isPublicLink() &&
    !hideFormulaRefreshInEdit &&
    recordId &&
    !recordId.includes('default') &&
    !recordId.includes('temp') &&
    md.global.Account.accountId &&
    ((item.type === 30 && (item.strDefault || '').split('')[0] !== '1') || _.includes([31, 32, 37, 38, 53], item.type))
  );
};

export const getControlDisabled = (item = {}, from, disabledChildTableCheck) => {
  const isEditable = controlState(item, from).editable;
  return item.type === 36 ? disabledChildTableCheck || item.disabled || !isEditable : item.disabled || !isEditable;
};

export const supportTabKeyDown = (data, from, disabledChildTableCheck, supportMarkdownLeave) => {
  if (!data) return false;
  const { advancedSetting = {} } = data;
  const disabled = getControlDisabled(data, from, disabledChildTableCheck);
  const showtype = String(advancedSetting.showtype || '');
  return (
    !disabled &&
    advancedSetting.customtype !== '1' &&
    (_.includes([3, 4, 5, 7, 8, 14, 15, 16, 21, 24, 26, 27, 28, 35, 36, 40, 41, 42, 46, 48], data.type) ||
      (data.type === 2 && (supportMarkdownLeave || data.enumDefault !== 3)) ||
      (data.type === 6 && !(advancedSetting.showtype === '2' && advancedSetting.showinput !== '1')) ||
      (_.includes([9, 10, 11], data.type) && advancedSetting.showtype !== '2') ||
      // 关联记录：卡片 / 老列表 / 下拉 / 表格 / 标签页表格
      (data.type === 29 &&
        _.includes(
          [
            String(RELATE_RECORD_SHOW_TYPE.CARD),
            String(RELATE_RECORD_SHOW_TYPE.LIST),
            String(RELATE_RECORD_SHOW_TYPE.DROPDOWN),
            String(RELATE_RECORD_SHOW_TYPE.TABLE),
            String(RELATE_RECORD_SHOW_TYPE.TAB_TABLE),
          ],

          showtype,
        )) ||
      // 子表
      data.type === 34 ||
      // 查询字段
      (data.type === 51 &&
        _.includes(
          [
            String(RELATION_SEARCH_SHOW_TYPE.CARD),
            String(RELATION_SEARCH_SHOW_TYPE.LIST),
            String(RELATION_SEARCH_SHOW_TYPE.TEXT),
            String(RELATION_SEARCH_SHOW_TYPE.EMBED_LIST),
            String(RELATION_SEARCH_SHOW_TYPE.TAB_LIST),
          ],

          showtype,
        )))
  );
};
