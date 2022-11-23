import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Icon, ScrollView, LoadDiv, Avatar, Tooltip } from 'ming-ui';
import { Divider } from 'antd';
import moment from 'moment';
import _ from 'lodash';
import filterXSS from 'xss';
import Trigger from 'rc-trigger';
import { createLinksForMessage } from 'src/components/common/function';
import DatePickSelect from '../DatePickerSelect';
import AddCondition from '../../common/WorkSheetFilter/components/AddCondition';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import {
  WIDGETS_TO_API_TYPE_ENUM,
  DEFAULT_CONFIG,
  WORKFLOW_SYSTEM_CONTROL,
} from 'src/pages/widgetConfig/config/widget';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import sheetAjax from 'src/api/worksheet';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';
import './WorksheetRocordLog.less';
import 'src/components/quickSelectUser/quickSelectUser';
import {
  WorksheetRecordLogSelectTags,
  WorksheetRecordLogDiffText,
  WorksheetRecordLogThumbnail,
  WorksheetRecordLogSubList,
  TriggerSelect,
} from './WorksheetRecordLogValue';
import cx from 'classnames';
import { browserIsMobile } from 'src/util';
import { WFSTATUS_OPTIONS } from './enum.js';

const reg = new RegExp('<[^<>]+>', 'g');
const PAGE_SIZE = 20;

const DISCUSS_LOG_ID = [];

const cicleTags = [26, 36, 27, 10, 48, 11, 9];
const rectTags = [6, 8, 5, 15, 16, 46, 3, 4, 24, 31, 28, 7, 40, 35, 37, 29, 27, 19, 23, 50, 21];
const returnObject = [26, 27, 48];
const filterField = {
  27: ['departmentId', 'departmentName'],
  26: ['accountId', 'fullname'],
  48: ['organizeId', 'organizeName'],
};

const systemUser = {
  'user-workflow': {
    accountId: 'user-workflow',
    avatar: 'https://p1.mingdaoyun.cn/UserAvatar/workflow.png?imageView2/1/w/48/h/48/q/90',
    fullname: '工作流',
  },
  'user-publicform': {
    accountId: 'user-publicform',
    avatar: 'https://p1.mingdaoyun.cn/UserAvatar/publicform.png?imageView2/1/w/100/h/100/q/90',
    fullname: '公开表单',
  },
  'user-api': {
    accountId: 'user-api',
    avatar: 'https://p1.mingdaoyun.cn/UserAvatar/worksheetapi.png?imageView2/1/w/100/h/100/q/90',
    fullname: 'API',
  },
};

function assembleListData(data) {
  let _resArr = [];
  // 前后相邻的两条 时间在同一天 且 操作者相同 的 并为一条
  data.forEach(item => {
    if (
      !_resArr.length ||
      !moment(_resArr[_resArr.length - 1].time).isSame(item.createTime, 'day') ||
      _resArr[_resArr.length - 1].accountId !== item.accountId
    ) {
      _resArr.push({
        time: item.createTime,
        accountName: item.accountName,
        accountId: item.accountId,
        child: [].concat(item),
        avatar: item.avatar,
      });
    } else {
      _resArr[_resArr.length - 1].child.push(item);
    }
  });

  return _resArr;
}

function assembleNewLogListData(data) {
  let _resArr = [];
  // 前后相邻的两条 时间在同一天 且 操作者相同 的 并为一条
  data.forEach((item, index) => {
    if (
      !_resArr.length ||
      !moment(_resArr[_resArr.length - 1].time).isSame(item.operatContent.createTime, 'day') ||
      _resArr[_resArr.length - 1].accountId !== item.opeartorInfo.accountId ||
      _resArr[_resArr.length - 1].type !== item.operatContent.type ||
      _resArr[[_resArr.length - 1]].requestType !== item.operatContent.requestType ||
      item.operatContent.requestType === 7 ||
      item.operatContent.requestType === 2
    ) {
      _resArr.push({
        ...item.opeartorInfo,
        time: item.operatContent.createTime,
        accountName: item.opeartorInfo.fullname,
        type: item.operatContent.type,
        requestType: item.operatContent.requestType,
        child: [].concat(item),
      });
    } else {
      _resArr[_resArr.length - 1].child.push(item);
    }
  });

  return _resArr;
}

function getShowWfstatusValue(option) {
  if (!option) return null;
  let value = JSON.parse(option)[0];
  if (_.startsWith(value, 'other')) {
    return value === 'other' ? _l('其他') : _.replace(value, 'other:', '') || _l('其他');
  }
  return WFSTATUS_OPTIONS.find(l => l.key === value).value;
}

function renderContent(data, recordInfo, extendParam) {
  const { type, oldText, newText, oldValue, newValue, id, editType } = data;
  const { requestType } = extendParam;
  let controls = recordInfo.controls || recordInfo.formdata;
  let control = controls ? controls.concat(WORKFLOW_SYSTEM_CONTROL).find(l => id === l.controlId) : undefined;
  let onlyNew = false;
  if (cicleTags.includes(type) || rectTags.includes(type)) {
    let oldList = [];
    let newList = [];
    if (returnObject.includes(type)) {
      oldList = oldValue ? JSON.parse(oldValue) : [];
      newList = newValue ? JSON.parse(newValue) : [];
    } else if (type === 40) {
      oldList = oldValue ? [JSON.parse(oldValue).address] : [];
      newList = newValue ? [JSON.parse(newValue).address] : [];
    } else if (type === 16) {
      const { advancedSetting = {} } = control || {};
      let formatString =
        advancedSetting.showtype === '2'
          ? 'YYYY-MM-DD HH'
          : advancedSetting.showtype === '1'
          ? 'YYYY-MM-DD HH:mm'
          : 'YYYY-MM-DD HH:mm:ss';
      oldList = oldValue ? [moment(oldValue).format(formatString)] : [];
      newList = newValue ? [moment(newValue).format(formatString)] : [];
    } else if (type === 46 || type === 15) {
      oldList = oldValue ? [renderText({ ...control, value: oldValue })] : [];
      newList = newValue ? [renderText({ ...control, value: newValue })] : [];
    } else if (type === 29) {
      const { advancedSetting = {} } = control || {};
      if (requestType === 8 || advancedSetting.showtype === '2') {
        let _data =  safeParse(safeParse(newValue).rows, 'array');
        oldList = editType === 2 ? _data : [];
        newList = editType === 1 ? _data : [];
        onlyNew = true;
      } else {
        oldList = oldValue && JSON.parse(oldValue).rows && JSON.parse(JSON.parse(oldValue).rows);
        newList = newValue && JSON.parse(newValue).rows && JSON.parse(JSON.parse(newValue).rows);
      }
    } else if (type === 21) {
      oldList = oldValue ? JSON.parse(oldValue).map(l => l.name) : [];
      newList = newValue ? JSON.parse(newValue).map(l => l.name) : [];
    } else {
      oldList = oldText ? oldText.split(',').filter(l => l) : oldValue ? oldValue.split(',').filter(l => l) : [];
      newList = newText ? newText.split(',').filter(l => l) : newValue ? newValue.split(',').filter(l => l) : [];
      if (type === 6 || type === 8) {
        oldList = oldList.map(l => {
          let number = renderText({ ...control, value: l });
          if ((control || {}).dot === 0 && type === 6 && _.endsWith(number, '.0')) {
            return number.replace('.0', '');
          } else {
            return number;
          }
        });
        newList = newList.map((l, index) => {
          let number = renderText({ ...control, value: l });
          if ((control || {}).dot === 0 && type === 6 && _.endsWith(number, '.0')) {
            return number.replace('.0', '');
          } else {
            return number;
          }
        });
      } else if (id === 'wfstatus') {
        oldList = oldValue ? [getShowWfstatusValue(oldValue)].filter(l => l) : [];
        newList = newValue ? [getShowWfstatusValue(newValue)].filter(l => l) : [];
      }
    }
    let _oldValue = [];
    let _newValue = [];
    let _defaultValue = [];
    if (type === 29) {
      _oldValue = _.differenceBy(oldList, newList, 'recordId').map(l => l.name);
      _newValue = _.differenceBy(newList, oldList, 'recordId').map(l => l.name);
      _defaultValue = _.intersectionBy(oldList, newList, 'recordId').map(l => l.name);
    } else if ((type === 6 || type === 8) && editType !== 0) {
      _defaultValue = oldList;
      _newValue = editType === 1 ? newList : [];
      _oldValue = editType === 2 ? newList : [];
    } else if (returnObject.includes(type)) {
      _oldValue = editType === 2 ? newList.filter(l => oldList.find(m => m[filterField[type][0]]===l[filterField[type][0]])).map(l => l[filterField[type][1]]) : _.differenceBy(oldList, newList, filterField[type][0]).map(l => l[filterField[type][1]]);
      _newValue =
        editType === 2
          ? []
          : _.differenceBy(newList, oldList, filterField[type][0]).map(l => l[filterField[type][1]]);
      _defaultValue =
        editType === 2
          ? oldList.filter(l => !newList.find(m => m[filterField[type][0]]===l[filterField[type][0]])).map(l => l[filterField[type][1]])
          : _.intersectionBy(oldList, newList, filterField[type][0]).map(l => l[filterField[type][1]]);
    } else if (editType === 2) {
      _oldValue = newList.filter(l => oldList.find(m => _.isEqual(m, l)));
      _newValue = [];
      _defaultValue = oldList.filter(l => newList.find(m => !_.isEqual(m, l)));
    } else {
      _oldValue = _.difference(oldList, newList);
      _newValue = _.difference(newList, oldList);
      _defaultValue = newList.filter(l => oldList.find(m => _.isEqual(m, l)));
    }
    return (
      <WorksheetRecordLogSelectTags
        oldValue={_oldValue}
        newValue={_newValue}
        defaultValue={_defaultValue || []}
        type={cicleTags.includes(type) ? 'circle' : 'rect'}
        needPreview={type === 29}
        data={data}
        control={control}
        onlyNew={onlyNew}
        isChangeValue={(type === 6 || type === 8) && editType !== 0}
        key={`WorksheetRecordLogSelectTags-${id}`}
      />
    );
  } else if (type === 2 && id === 'del_discussion') {
    let message = newValue.replace(/\n/g, '<br>');
    message = createLinksForMessage({
      message,
    });

    return (message = <div className="singeText paddingLeft27" dangerouslySetInnerHTML={{ __html: message }} />);
  } else if (type === 2) {
    return (
      <WorksheetRecordLogDiffText
        oldValue={oldValue ? oldValue.replace(/^"|"$/g, '') : ''}
        newValue={newValue ? newValue.replace(/^"|"$/g, '') : ''}
        control={control}
        key={`WorksheetRecordLogDiffText-${id}`}
      />
    );
  } else if (type === 41) {
    return (
      <WorksheetRecordLogDiffText
        oldValue={oldValue ? oldValue.replace(/^"|"$/g, '') : ''}
        newValue={newValue ? newValue.replace(/^"|"$/g, '') : ''}
        type="rich_text"
        key={`WorksheetRecordLogDiffText-${id}`}
      />
    );
  } else if (type === 14 || type === 42) {
    let newList = newValue ? JSON.parse(newValue) : [];
    let oldList = oldValue ? JSON.parse(oldValue) : [];
    if (typeof newList[0] !== 'object') {
      newList = [];
    }
    if (typeof oldList[0] !== 'object') {
      oldList = [];
    }
    let _oldValue = _.differenceBy(oldList, newList, type === 14 ? 'fileId' : 'key');
    let _newValue = _.differenceBy(newList, oldList, type === 14 ? 'fileId' : 'key');
    let _defaultValue = newList.filter(l =>
      oldList.find(m => m[type === 14 ? 'fileId' : 'key'] === l[type === 14 ? 'fileId' : 'key']),
    );

    return (
      <WorksheetRecordLogThumbnail
        oldList={_oldValue}
        newList={_newValue}
        defaultList={_defaultValue}
        type={type}
        recordInfo={recordInfo}
        control={control}
        key={`WorksheetRecordLogThumbnail-${id}`}
      />
    );
  } else if (type === 34) {
    return (
      <WorksheetRecordLogSubList
        key={`WorksheetRecordLogSubList-${id}`}
        prop={data}
        control={control}
        recordInfo={recordInfo}
        extendParam={extendParam}
      />
    );
  } else {
    return null;
  }
}

const WorksheetRocordLogItem = (prop, recordInfo, callback, extendParam) => {
  const { selectField, moreList = [], setMoreList, lastMark } = extendParam;
  let logData = prop.operatContent.logData;
  let uniqueId = moreList.find(l => l === prop.operatContent.uniqueId);
  if (selectField && !uniqueId) {
    logData = logData.filter(l => l.id === selectField.controlId);
  }

  return (
    <React.Fragment>
      {logData.map(item => {
        if (item.newValue === '' && item.oldValue === '') {
          return null;
        }
        let widgetInfo = DEFAULT_CONFIG[_.findKey(WIDGETS_TO_API_TYPE_ENUM, l => l === item.type)];
        const control = _.find(recordInfo.controls, it => item.id === it.controlId) || {};
        let _controlPermissions = (control && control.controlPermissions) || '111';
        const visible = _controlPermissions[0] === '1';
        let extendText = '';
        let showDelete = true;
        if (!visible) return;
        if (item.type === 29) {
          const { advancedSetting = {} } = control || {};
          if (prop.operatContent.requestType === 8 || advancedSetting.showtype === '2') {
            let object = item.newValue
              ? JSON.parse(item.newValue)
              : item.oldValue
              ? JSON.parse(item.oldValue)
              : undefined;
            if (object && object.rows) {
              extendText = `${item.editType === 1 ? ' ' + _l('添加了') : ' ' + _l('取消了')}${_l(
                '%0条',
                JSON.parse(object.rows).length || 1,
              )}`;
            } else if (object) {
              showDelete = false;
              extendText = `${item.editType === 1 ? ' ' + _l('添加了') : ' ' + _l('取消了')}${_l(
                '%0条',
                object.length || 1,
              )}关联记录`;
            }
          }
          if (prop.operatContent.requestType === 8) {
            extendText += _l('（被动）');
          }
        }
        if (item.id === 'del_discussion') {
          showDelete = false;
        }
        if (item.isDeleted && showDelete) {
          extendText += _l('(已删除)');
        }

        return (
          <div
            className={`worksheet-rocord-log-item ${item.type === 34 ? 'worksheet-rocord-log-item-Row' : ''}`}
            key={`worksheet-rocord-log-item-${item.id}`}
          >
            <div className="widgetTitle">
              {item.isDeleted || browserIsMobile() || WORKFLOW_SYSTEM_CONTROL.find(l => l.controlId === item.id) ? (
                <span className="selectTriggerChild">
                  <Icon className="Font16 Gray_9e" icon={widgetInfo.icon} />
                  <span>{item.name}</span>
                </span>
              ) : (
                <TriggerSelect
                  text={_l('筛选此字段')}
                  onSelect={() => {
                    if (!control.controlId) return;
                    callback(control);
                  }}
                  childNode={
                    <span className="selectTriggerChild hasHover">
                      <Icon className="Font16 Gray_9e" icon={widgetInfo.icon} />
                      <span>{item.name}</span>
                    </span>
                  }
                />
              )}

              <span className="extendText">{extendText}</span>
            </div>
            {(!item.isDeleted || item.id === 'del_discussion') &&
              renderContent(item, recordInfo, {
                createTime: prop.operatContent.createTime,
                uniqueId: prop.operatContent.uniqueId,
                lastMark: lastMark,
                requestType: prop.operatContent.requestType,
                objectType: prop.operatContent.objectType,
              })}
          </div>
        );
      })}
      {selectField && logData.length !== prop.operatContent.logData.length && !uniqueId && (
        <span
          onClick={() => {
            setMoreList(moreList.concat(prop.operatContent.uniqueId));
          }}
          className="moreLogData Gray_9e"
        >
          {_l('查看其他字段')} {prop.operatContent.logData.length - logData.length}
        </span>
      )}
    </React.Fragment>
  );
};
const renderTitleName = data => {
  const { accountId, accountName, child, fullname } = data;
  if (accountId === 'user-workflow') {
    return (
      <span className="titleAvatarText workflow Gray_9e">
        <span className={cx('accountName', { mobileAccountName: browserIsMobile() })}>{_l('工作流')} </span>{' '}
      </span>
    );
  } else if (child[0].operatContent.requestType === 3) {
    let btn = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'btn:'));
    return (
      <span className="titleAvatarText">
        <span className="accountName">{accountName} </span>
      </span>
    );
  } else if (child[0].operatContent.requestType === 2) {
    let extendParam = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:'));
    let _html = extendParam ? extendParam.replace('workflow', '') : undefined;
    return _html ? (
      <span className="titleAvatarText workflow Gray_9e">
        <span className={cx('accountName', { mobileAccountName: browserIsMobile() })}>{_l('工作流')} </span>
      </span>
    ) : (
      <span className="titleAvatarText accountName">{fullname}</span>
    );
  } else {
    return <span className="titleAvatarText accountName">{fullname}</span>;
  }
};
const renderTitleAvatar = data => {
  const { accountId, accountName, child, fullname } = data;

  if (accountId === 'user-workflow') {
    let _fullname = fullname;
    if (!reg.test(fullname) && child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:'))) {
      _fullname =
        child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:')).replace('workflow:', '') || fullname;
    }
    return (
      <span className="titleAvatarText workflow Gray_9e">
        {browserIsMobile() ? (
          <span className="ThemeColor">{_fullname.replace(reg, '')}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: filterXSS(_fullname) }}></span>
        )}
      </span>
    );
  } else if (child[0].operatContent.requestType === 3) {
    let btn = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'btn:'));
    return (
      <span className="titleAvatarText">
        <span className="Gray_9e">{_l('通过自定义动作')}</span>
        <span className="Gray"> {btn ? btn.replace('btn:', '') : ''}</span>
      </span>
    );
  } else if (child[0].operatContent.requestType === 2) {
    let extendParam = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:'));
    let _html = extendParam ? extendParam.replace('workflow', '') : undefined;
    return _html ? (
      <span className="titleAvatarText workflow Gray_9e">
        {browserIsMobile() ? (
          <span>{_html.replace(reg, '')}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: filterXSS(_html) }}></span>
        )}
      </span>
    ) : null;
  } else {
    return null;
  }
};

const renderTitleText = (data, extendParam) => {
  const { controls } = extendParam;
  let count = data.child[0].operatContent.logData.filter(l => l.oldValue !== '' || l.newValue !== '').length;
  let showTooltips = false;
  data.child[0].operatContent.logData.forEach(logData => {
    let control = _.find(controls, it => logData.id === it.controlId) || {};
    let _controlPermissions = (control && control.controlPermissions) || '111';
    if (_controlPermissions[0] === '0') {
      showTooltips = true;
    }
  });
  const { type } = data;
  let content = null;
  switch (type) {
    case 1:
      content = <span className="createRecord mLeft2">{_l('创建了记录')}</span>;
      break;
    case 2:
      content = <span className="mLeft2">{_l('更新%0个字段', count)}</span>;
      break;
    case 3:
      content = <span className="mLeft2">{_l('删除了记录')}</span>;
      break;
    case 4:
      content = (
        <span className="mLeft2">
          {_l('通过')}
          <span className="Gray">{_l('导入Excel文件')}</span>
          {_l('创建了记录')}
        </span>
      );
      break;
    case 5:
      content = <span className="mLeft2">{_l('导出了记录')}</span>;
      break;
    case 6:
      content = <span className="mLeft2">{_l('恢复了记录')}</span>;
      break;
    default:
      content = <span className="mLeft2">{_l('更新了记录')}</span>;
      break;
  }
  return (
    <React.Fragment>
      {content}
      {showTooltips && (
        <Tooltip popupPlacement="right" text={<span>{_l('部分字段无权限不可见')}</span>}>
          <Icon icon="info_outline" className="Font14 mLeft5" />
        </Tooltip>
      )}
    </React.Fragment>
  );
};

function WorksheetRocordLog(props, ref) {
  const { controls, worksheetId, formdata } = props;
  const selectUserRef = useRef();
  const [loading, setLoading] = useState(false);
  const [selectUser, setSelectUser] = useState(undefined);
  const [selectField, setSelectField] = useState(undefined);
  const [selectDate, setSelectDate] = useState({
    visible: false,
    range: undefined,
  });
  const [showAddCondition, setShowAddCondition] = useState(false);
  const [pageIndexs, setPageIndexs] = useState({
    newLogIndex: 1,
    oldLogIndex: 0,
  });
  const [discussList, setDiscussList] = useState([]); // 旧版日志列表
  const [loadouted, setLoadouted] = useState(false);
  const [discussData, setDiscussData] = useState([]); // 旧版日志数据
  const [newEditionData, setNewEditionData] = useState([]); // 新版日志数据
  const [newEditionList, setNewEditionList] = useState([]); // 新版日志列表
  const [sign, setSign] = useState({
    newDataEnd: false,
    oldLogEnd: false,
    showLodOldButton: false,
  });
  const [showDivider, setShowDivider] = useState(false);
  const [moreList, setMoreList] = useState([]);
  const [lastMark, setLastMark] = useState(undefined);
  const [worksheetInfo, setWorksheetInfo] = useState({});
  let INIT_SIGN = false;
  const isMobile = browserIsMobile();

  useImperativeHandle(ref, () => ({
    reload: initLog,
  }));

  useEffect(() => {
    const { appId, worksheetId } = props;
    if (!appId) {
      sheetAjax
        .getWorksheetInfo({
          worksheetId: worksheetId,
          getViews: true,
          getTemplate: true,
          getRules: true,
        })
        .then(res => {
          setWorksheetInfo(res);
        });
    }
  }, []);

  useEffect(() => {
    initLog();
  }, [props.rowId]);

  useEffect(() => {
    if (
      ((selectUser || selectField || selectDate.range) && pageIndexs.newLogIndex === 1) ||
      loading ||
      (INIT_SIGN && pageIndexs.newLogIndex === 1)
    ) {
      INIT_SIGN = false;
      return;
    }
    loadNewEdition({});
  }, [pageIndexs.newLogIndex]);

  useEffect(() => {
    pageIndexs.oldLogIndex && loadLog();
  }, [pageIndexs.oldLogIndex]);

  function initLog() {
    INIT_SIGN = true;
    setSelectUser(undefined);
    setSelectField(undefined);
    setSelectDate({
      visible: false,
      range: undefined,
    });
    setPageIndexs({
      newLogIndex: 1,
      oldLogIndex: 0,
    });
    setDiscussList([]);
    setSign({
      newDataEnd: false,
      oldLogEnd: false,
      showLodOldButton: false,
    });
    setLastMark(undefined);
    loadNewEdition({ lastMark: undefined });
  }

  function loadNewEdition(prop) {
    const { worksheetId, rowId, pageSize = PAGE_SIZE } = props;
    const { pageIndex, filedId, opeartorId, startDateTime, endDateTime } = prop;
    let _opeartorId = prop.hasOwnProperty('opeartorId') ? opeartorId : selectUser && selectUser[0].accountId;
    let _filterId = prop.hasOwnProperty('filedId') ? filedId : selectField && selectField.controlId;
    let _startDate = prop.hasOwnProperty('startDateTime')
      ? startDateTime
      : selectDate.range && selectDate.range.value[0];
    let _endDate = prop.hasOwnProperty('endDateTime') ? endDateTime : selectDate.range && selectDate.range.value[1];
    let _lastMark = prop.hasOwnProperty('lastMark') ? prop.lastMark : lastMark;
    setLoading(true);
    sheetAjax
      .getWorksheetOpeationLogs({
        worksheetId,
        rowId,
        pageSize,
        objectType: 2,
        opeartorIds: _opeartorId ? [_opeartorId] : [],
        controlIds: _filterId ? [_filterId] : [],
        startDate: _startDate,
        endDate: _endDate,
        lastMark: _lastMark,
      })
      .then(res => {
        setLoading(false);
        setLastMark(res.lastMark);

        let data = res.logs;
        pageIndexs.newLogIndex === 1 ? setNewEditionData([]) : setNewEditionData(newEditionData.concat(data));
        if (data.length) {
          // 去重
          let _data = assembleNewLogListData(data.filter(l => !DISCUSS_LOG_ID.includes(m => m === l.id)));
          DISCUSS_LOG_ID.concat(data.map(l => l.operatContent.uniqueId));
          pageIndexs.newLogIndex === 1 ? setNewEditionList(_data) : setNewEditionList(newEditionList.concat(_data));
          if (data.length < PAGE_SIZE || data[data.length - 1].operatContent.type === 1) {
            setSign({
              ...sign,
              newDataEnd: true,
              showLodOldButton:
                data[data.length - 1].operatContent.type !== 1 && data[data.length - 1].operatContent.type !== 4,
            });
          } else {
            sign.newDataEnd &&
              setSign({
                ...sign,
                newDataEnd: false,
              });
          }
        } else {
          setSign({
            ...sign,
            newDataEnd: true,
          });
          if (pageIndexs.newLogIndex === 1) {
            setShowDivider(true);
            setPageIndexs({
              ...pageIndexs,
              oldLogIndex: 1,
            });
            setSign({
              ...sign,
              newDataEnd: true,
              showLodOldButton: false,
            });
            setNewEditionList([]);
          }
        }
      });
  }

  function loadLog() {
    const { worksheetId, rowId, pageSize = PAGE_SIZE } = props;
    if (loadouted || selectUser || selectField || selectDate.range) return;
    setLoading(true);
    sheetAjax
      .getLogs({
        worksheetId,
        rowId,
        pageSize,
        pageIndex: pageIndexs.oldLogIndex,
      })
      .then(data => {
        setLoading(false);
        setLoadouted(data.length < PAGE_SIZE);
        setDiscussData(discussData.concat(data));
        if (data.length) {
          // 去重
          let _data = assembleListData(data.filter(l => !DISCUSS_LOG_ID.includes(m => m === l.id)));
          DISCUSS_LOG_ID.concat(_data.map(l => l.id));
          setDiscussList(discussList.concat(_data));
          if (data[data.length - 1].templateId === 'addwsrow' || data.length < PAGE_SIZE) {
            setSign({
              ...sign,
              newDataEnd: true,
              oldLogEnd: true,
            });
          }
        }
      });
  }

  const clearSelectField = e => {
    e.stopPropagation();
    setSelectField(undefined);
    setPageIndexs({
      ...pageIndexs,
      newLogIndex: 1,
    });
    setMoreList([]);
    setLastMark(undefined);
    loadNewEdition({ filedId: undefined, lastMark: undefined });
  };

  const clearSelectUser = e => {
    e.stopPropagation();
    setSelectUser(undefined);
    setPageIndexs({
      ...pageIndexs,
      newLogIndex: 1,
    });
    setLastMark(undefined);
    loadNewEdition({ opeartorId: undefined, lastMark: undefined });
  };

  const clearSelectDate = e => {
    e.stopPropagation();
    setSelectDate({
      visible: selectDate.visible,
      range: undefined,
    });
    setPageIndexs({
      ...pageIndexs,
      newLogIndex: 1,
    });
    setLastMark(undefined);
    loadNewEdition({ startDateTime: undefined, endDateTime: undefined, lastMark: undefined });
  };

  function handleScroll() {
    if ((selectUser || selectField || selectDate.range) && sign.newDataEnd) return;
    if (loading) return;
    if (loadouted && sign.newDataEnd) return;
    if (sign.newDataEnd && sign.oldLogEnd) return;
    if (!loading && !sign.newDataEnd) {
      setPageIndexs({
        ...pageIndexs,
        newLogIndex: pageIndexs.newLogIndex + 1,
      });
    } else if (!loading && sign.newDataEnd && !sign.oldLogEnd) {
      setPageIndexs({
        ...pageIndexs,
        oldLogIndex: pageIndexs.oldLogIndex + 1,
      });
    }
  }

  const selectUserCallback = value => {
    setSelectUser(value);
    setPageIndexs({
      ...pageIndexs,
      newLogIndex: 1,
    });
    setLastMark(undefined);
    loadNewEdition({ opeartorId: value[0].accountId, lastMark: undefined });
  };

  function pickUser() {
    const { worksheetId, projectId = '', appId } = props;
    const filterIds = ['user-sub', 'user-undefined'];
    $(selectUserRef.current).quickSelectUser({
      hidePortalCurrentUser: true,
      isRangeData: false,
      filterWorksheetId: worksheetId,
      includeSystemField: true,
      prefixOnlySystemField: true,
      rect: selectUserRef.current.getBoundingClientRect(),
      showQuickInvite: false,
      tabType: 3,
      appId: appId || worksheetInfo.appId,
      showMoreInvite: false,
      isTask: false,
      filterAccountIds: selectUser ? selectUser.map(item => item.accountId).concat(filterIds) : [].concat(filterIds),
      offset: {
        top: 0,
        left: 94,
      },
      zIndex: 10001,
      SelectUserSettings: {
        unique: true,
        projectId: projectId || worksheetId.projectId,
        filterAccountIds: selectUser ? selectUser.map(item => item.accountId).concat(filterIds) : [].concat(filterIds),
        callback: selectUserCallback,
      },
      selectCb: selectUserCallback,
    });
  }

  const selectFieldChange = control => {
    setSelectField(control);
    setPageIndexs({
      ...pageIndexs,
      newLogIndex: 1,
    });
    setMoreList([]);
    setLastMark(undefined);
    loadNewEdition({ filedId: control.controlId, lastMark: undefined });
  };

  return (
    <ScrollView className="logScroll flex worksheetRocordLog" onScrollEnd={handleScroll}>
      <div className={cx('logBox', { mobileLogBox: isMobile })}>
        <div className={cx('selectCon', { hideEle: isMobile })}>
          <div className="left">
            <span className={`${selectUser ? 'selectLight' : ''} selectUser`} onClick={pickUser} ref={selectUserRef}>
              <Icon icon="person" />
              <span className="selectConText">{selectUser ? selectUser[0].fullname : _l('操作者')}</span>
              <Icon icon="arrow-down" style={selectUser ? {} : { display: 'inline-block' }} />
              {selectUser && <Icon onClick={clearSelectUser} icon="cancel1" />}
            </span>
            <AddCondition
              columns={filterOnlyShowField(
                _.filter(
                  controls || formdata,
                  it =>
                    !_.includes([33, 47, 30, 22, 10010, 45, 43, 25], it.type) &&
                    !_.includes(['caid', 'ctime', 'utime'], it.controlId),
                ),
              )}
              defaultVisible={showAddCondition}
              onAdd={control => {
                selectFieldChange(control);
              }}
              comp={() => {
                return (
                  <span className={`${selectField ? 'selectLight' : ''} selectField`}>
                    <Icon icon="title" />
                    <span className="selectConText">{selectField ? selectField.controlName : _l('字段')}</span>
                    <Icon icon="arrow-down" style={selectField ? {} : { display: 'inline-block' }} />
                    {selectField && <Icon icon="cancel1" onClick={clearSelectField} />}
                  </span>
                );
              }}
              offset={[0, 0]}
            />
          </div>
          <Trigger
            popupVisible={selectDate.visible}
            onPopupVisibleChange={visible =>
              setSelectDate({
                ...selectDate,
                visible: visible,
              })
            }
            action={['click']}
            popupAlign={{ points: ['tr', 'br'] }}
            popup={
              <DatePickSelect
                onChange={data => {
                  if (!data.value) {
                    return;
                  }
                  setSelectDate({
                    visible: false,
                    range: {
                      ...data,
                      value: [data.value[0], data.value[1]],
                    },
                  });
                  setPageIndexs({
                    ...pageIndexs,
                    newLogIndex: 1,
                  });
                  setLastMark(undefined);
                  loadNewEdition({
                    startDateTime: moment(data.value[0]).format('YYYY-MM-DD HH:mm:ss'),
                    endDateTime: moment(data.value[1]).format('YYYY-MM-DD HH:mm:ss'),
                    lastMark: undefined,
                  });
                }}
              />
            }
          >
            <span className={`${selectDate.range ? 'selectLight' : ''} selectDate`}>
              <Icon icon="event" />
              {selectDate.range && <span className="selectConText">{selectDate.range.label}</span>}
              {selectDate.range && <Icon icon="arrow-down" />}
              {selectDate.range && <Icon icon="cancel1" onClick={clearSelectDate} />}
            </span>
          </Trigger>
        </div>
        {newEditionList.length === 0 && (selectUser || selectField || selectDate.range) && (
          <div className="Gray_c pBottom10 noneContent" style={{ paddingTop: '120px', textAlign: 'center' }}>
            {_l('暂无数据')}
          </div>
        )}
        {newEditionList.map((item, index) => {
          let _timeSign = undefined;
          if (index === 0) {
            _timeSign = createTimeSpan(moment(item.time).format('YYYY-MM-DD HH:mm:ss'));
          }
          return (
            <div className="worksheetRocordLogCard" key={`worksheetRocordLogCard-${item.time}-${index}`}>
              <div className={`worksheetRocordLogCardTopBox ${item.type === 1 ? 'mBottom0' : ''}`}>
                <div className="worksheetRocordLogCardTitle">
                  {isMobile ? (
                    <span className="selectTriggerChildAvatar">
                      <Avatar size={20} className="worksheetRocordLogCardTitleAvatar" src={item.avatar} />
                      {renderTitleName(item)}
                    </span>
                  ) : (
                    <TriggerSelect
                      text={_l('筛选此用户')}
                      onSelect={e => {
                        let userInfo = {
                          accountId: item.accountId,
                          avatar: item.avatar,
                          fullname: item.fullname,
                        };
                        if (systemUser.hasOwnProperty(item.accountId)) {
                          userInfo = systemUser[item.accountId];
                        }
                        selectUserCallback([userInfo]);
                      }}
                      childNode={
                        <span className="selectTriggerChildAvatar">
                          <Avatar size={20} className="worksheetRocordLogCardTitleAvatar" src={item.avatar} />
                          {renderTitleName(item)}
                        </span>
                      }
                    />
                  )}
                  {renderTitleAvatar(item)}
                  <span>
                    <span className="Gray_9e">{renderTitleText(item, { controls: controls || formdata })}</span>
                  </span>
                </div>
                <div className="worksheetRocordLogCardName nowrap Gray_9e">
                  {createTimeSpan(moment(item.time).format('YYYY-MM-DD HH:mm:ss'))}
                </div>
              </div>
              {item.child.map((childData, index) => {
                let extendParam = {
                  selectField: selectField,
                  moreList: moreList,
                  setMoreList: setMoreList,
                  lastMark: lastMark,
                };
                let showTooltips = false;
                childData.operatContent.logData.forEach(logData => {
                  let control = _.find(controls || formdata, it => logData.id === it.controlId) || {};
                  let _controlPermissions = (control && control.controlPermissions) || '111';
                  if (_controlPermissions[0] === '0') {
                    showTooltips = true;
                  }
                });
                return (
                  <div
                    key={`worksheetRocordLogCardHrCon-${item.accountName}-${index}`}
                    className="worksheetRocordLogCardHrCon"
                  >
                    {childData.operatContent.createTime !== item.time && (
                      <div className="worksheetRocordLogCardHrTime">
                        <span>
                          {_l(
                            '更新了 %0个字段',
                            childData.operatContent.logData.filter(l => l.oldValue !== '' || l.newValue !== '').length,
                          )}
                          {showTooltips && (
                            <Tooltip popupPlacement="right" text={<span>{_l('部分字段无权限不可见')}</span>}>
                              <Icon icon="info_outline" className="Font14 mLeft5" />
                            </Tooltip>
                          )}
                        </span>

                        <span>
                          {createTimeSpan(moment(childData.operatContent.createTime).format('YYYY-MM-DD HH:mm:ss'))}
                        </span>
                      </div>
                    )}
                    {WorksheetRocordLogItem(childData, props, selectFieldChange, extendParam)}
                  </div>
                );
              })}
            </div>
          );
        })}
        {sign.showLodOldButton && discussList.length === 0 && (
          <p className="loadOldLog">
            <span
              onClick={() => {
                setPageIndexs({ ...pageIndexs, oldLogIndex: 1 });
                setShowDivider(true);
                setSign({
                  ...sign,
                  showLodOldButton: false,
                });
              }}
            >
              {_l('继续查看旧版日志')}
            </span>
          </p>
        )}
        {!selectUser && !selectField && !selectDate.range && showDivider && discussList.length > 0 && (
          <Divider className="logDivider">
            {_l('以下是旧版日志')}
            <Tooltip
              text={<span>{_l('旧版日志不支持进行筛选。因为新旧版本的升级，可能会产生一段时间重复记录的日志')}</span>}
            >
              <Icon className="Font12" icon="Import-failure" />
            </Tooltip>
          </Divider>
        )}
        {!selectUser &&
          !selectField &&
          !selectDate.range &&
          discussList.map((item, index) => {
            return (
              <div className="worksheetRocordLogCard" key={`worksheetRocordLogCard-${item.time}`}>
                <div className="worksheetRocordLogCardTopBox">
                  <div className="worksheetRocordLogCardTitle">
                    <Avatar size={20} className="worksheetRocordLogCardTitleAvatar mRight8" src={item.avatar} />
                    <span>
                      {item.accountName} <span className="Gray_9e">{_l('更新了 %0 个字段', item.child.length)}</span>
                    </span>
                  </div>
                  <div className="worksheetRocordLogCardName Gray_9e">{createTimeSpan(item.time)}</div>
                </div>
                {item.child.map(childData => {
                  const message = createLinksForMessage({
                    message: childData.message,
                    accountId: childData.accountId,
                    accountName: childData.accountName,
                  });
                  if (isMobile) {
                    const con = message.replace(reg, '').split(' ');
                    let userOrFlow = con && con.length && con[0];
                    const actTxt = con && con.length && con[1];
                    if (childData.accountId === 'user-workflow') {
                      userOrFlow = userOrFlow.slice(3);
                    }
                    return (
                      <div
                        className="logContent"
                        key={`logContent-${childData.id}`}
                        style={{ marginTop: 10, marginBottom: 10 }}
                      >
                        <span>
                          {childData.accountId === 'user-workflow' ? _l('工作流') : ''}
                          <span className="ThemeColor mRight5">{userOrFlow}</span>
                          {actTxt}
                        </span>
                      </div>
                    );
                  }
                  return (
                    <div
                      className="logContent"
                      key={`logContent-${childData.id}`}
                      style={{ marginTop: 10, marginBottom: 10 }}
                      dangerouslySetInnerHTML={{ __html: filterXSS(message) }}
                    />
                  );
                })}
              </div>
            );
          })}
      </div>
      {loading && <LoadDiv className="mBottom20" />}
    </ScrollView>
  );
}

export default forwardRef(WorksheetRocordLog);
