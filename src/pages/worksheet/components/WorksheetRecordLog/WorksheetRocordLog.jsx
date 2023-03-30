import React, { useState, useEffect, useImperativeHandle, forwardRef, useRef } from 'react';
import { Icon, ScrollView, LoadDiv, Avatar, Tooltip } from 'ming-ui';
import { Divider } from 'antd';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import moment from 'moment';
import filterXSS from 'xss';
import cx from 'classnames';
import _ from 'lodash';
import renderText from 'src/pages/worksheet/components/CellControls/renderText.js';
import AddCondition from '../../common/WorkSheetFilter/components/AddCondition';
import WorksheetRecordLogSelectTags from './component/WorksheetRecordLogSelectTags';
import WorksheetRecordLogThumbnail from './component/WorksheetRecordLogThumbnail';
import WorksheetRecordLogDiffText from './component/WorksheetRecordLogDiffText';
import WorksheetRecordLogSubList from './component/WorksheetRecordLogSubList';
import { createLinksForMessage } from 'src/components/common/function';
import quickSelectUser from 'ming-ui/functions/quickSelectUser';
import TriggerSelect from './component/TriggerSelect';
import DatePickSelect from '../DatePickerSelect';
import sheetAjax from 'src/api/worksheet';
import './WorksheetRocordLog.less';
import { assembleListData, assembleNewLogListData, getShowWfstatusValue, numberControlHandle } from './util';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { browserIsMobile } from 'src/util';
import {
  SYSTEM_USER,
  FILTER_FIELD_BY_ATTR,
  CIRCLE_TAGS_CONTROL_TYPE,
  RECT_TAGS_CONTROL_TYPE,
  RETURN_OBJECT_CONTROL_TYPE,
} from './enum.js';
import {
  WIDGETS_TO_API_TYPE_ENUM,
  DEFAULT_CONFIG,
  WORKFLOW_SYSTEM_CONTROL,
} from 'src/pages/widgetConfig/config/widget';

const reg = new RegExp('<[^<>]+>', 'g');
const PAGE_SIZE = 20;

const DISCUSS_LOG_ID = [];

function renderContent(data, recordInfo, extendParam) {
  const { type, oldText, newText, oldValue, newValue, id, editType } = data;
  const { requestType } = extendParam;
  let controls = recordInfo.controls || recordInfo.formdata;
  let control = controls ? controls.find(l => id === l.controlId) : undefined;
  let onlyNew = false;
  if (CIRCLE_TAGS_CONTROL_TYPE.includes(type) || RECT_TAGS_CONTROL_TYPE.includes(type)) {
    let oldList = [];
    let newList = [];
    if (RETURN_OBJECT_CONTROL_TYPE.includes(type)) {
      oldList = safeParse(oldValue, 'array');
      newList = safeParse(newValue, 'array');
    } else if (type === 40) {
      oldList = [safeParse(oldValue).address].filter(l => l);
      newList = [safeParse(newValue).address].filter(l => l);
    } else if (id.startsWith('wf') && [16].includes(type)) {
      oldList = oldValue ? [moment(oldValue).format('YYYY-MM-DD HH:mm:ss')] : [];
      newList = newValue ? [moment(newValue).format('YYYY-MM-DD HH:mm:ss')] : [];
    } else if (type === 38) {
      oldList = oldValue ? [oldValue] : [];
      newList = newValue ? [newValue] : [];
    } else if (type === 16) {
      oldList = oldValue ? [renderText({ ...control, value: oldValue })] : [];
      newList = newValue ? [renderText({ ...control, value: newValue })] : [];
    } else if (type === 46 || type === 15) {
      oldList = oldValue ? [renderText({ ...control, value: oldValue })] : [];
      newList = newValue ? [renderText({ ...control, value: newValue })] : [];
    } else if (type === 29) {
      const { advancedSetting = {} } = control || {};
      if (requestType === 8 || advancedSetting.showtype === '2') {
        let _data = safeParse(safeParse(newValue).rows, 'array');
        oldList = editType === 2 ? _data : [];
        newList = editType === 1 ? _data : [];
        onlyNew = true;
      } else {
        oldList = safeParse(safeParse(oldValue).rows, 'array');
        newList = safeParse(safeParse(newValue).rows, 'array');
      }
    } else if (type === 21) {
      oldList = safeParse(oldValue, 'array').map(l => l.name);
      newList = safeParse(newValue, 'array').map(l => l.name);
    } else {
      oldList = oldText ? oldText.split(',').filter(l => l) : oldValue ? oldValue.split(',').filter(l => l) : [];
      newList = newText ? newText.split(',').filter(l => l) : newValue ? newValue.split(',').filter(l => l) : [];
      if (type === 6 || type === 8) {
        oldList = numberControlHandle(oldList, control, type);
        newList = numberControlHandle(newList, control, type);
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
    } else if (RETURN_OBJECT_CONTROL_TYPE.includes(type)) {
      _oldValue =
        editType === 2
          ? newList
              .filter(l => oldList.find(m => m[FILTER_FIELD_BY_ATTR[type][0]] === l[FILTER_FIELD_BY_ATTR[type][0]]))
              .map(l => l[FILTER_FIELD_BY_ATTR[type][1]])
          : _.differenceBy(oldList, newList, FILTER_FIELD_BY_ATTR[type][0]).map(l => l[FILTER_FIELD_BY_ATTR[type][1]]);
      _newValue =
        editType === 2
          ? []
          : _.differenceBy(newList, oldList, FILTER_FIELD_BY_ATTR[type][0]).map(l => l[FILTER_FIELD_BY_ATTR[type][1]]);
      _defaultValue =
        editType === 2
          ? oldList
              .filter(l => !newList.find(m => m[FILTER_FIELD_BY_ATTR[type][0]] === l[FILTER_FIELD_BY_ATTR[type][0]]))
              .map(l => l[FILTER_FIELD_BY_ATTR[type][1]])
          : _.intersectionBy(oldList, newList, FILTER_FIELD_BY_ATTR[type][0]).map(
              l => l[FILTER_FIELD_BY_ATTR[type][1]],
            );
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
        type={CIRCLE_TAGS_CONTROL_TYPE.includes(type) ? 'circle' : 'rect'}
        needPreview={type === 29}
        data={data}
        control={control}
        onlyNew={onlyNew}
        isChangeValue={(type === 6 || type === 8) && editType !== 0}
        key={`WorksheetRecordLogSelectTags-${id}`}
      />
    );
  } else if (type === 2 && ['del_discussion', 'transf_task'].indexOf(id) > -1) {
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
    let newList = safeParse(newValue, 'array');
    let oldList = safeParse(oldValue, 'array');
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
  const { selectField, moreList = [], setMoreList, lastMark, showFilter } = extendParam;
  const isMobile = browserIsMobile();
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
        const control = _.find(recordInfo.controls || recordInfo.formdata, it => item.id === it.controlId) || {};
        let _controlPermissions = (control && control.controlPermissions) || '111';
        const visible = _controlPermissions[0] === '1';
        let extendText = '';
        let showDelete = true;

        if (!visible) return;
        if (item.type === 29) {
          const { advancedSetting = {} } = control || {};
          if (prop.operatContent.requestType === 8 || advancedSetting.showtype === '2') {
            let object = item.newValue
              ? safeParse(item.newValue)
              : item.oldValue
              ? safeParse(item.oldValue)
              : undefined;
            if (object && object.rows) {
              extendText = `${item.editType === 1 ? ' ' + _l('添加了') : ' ' + _l('取消了')}${_l(
                '%0条',
                safeParse(object.rows, 'array').length || 1,
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
        if (['transf_task', 'del_discussion'].indexOf(item.id) > -1) {
          showDelete = false;
        }
        if (item.isDeleted && showDelete) {
          extendText += _l('(已删除)');
        }

        return (
          <div
            className={cx('worksheet-rocord-log-item', { 'worksheet-rocord-log-item-Row': item.type === 34 })}
            key={`worksheet-rocord-log-item-${item.id}`}
          >
            <div className="widgetTitle">
              {item.isDeleted ||
              isMobile ||
              !showFilter ||
              WORKFLOW_SYSTEM_CONTROL.find(l => l.controlId === item.id) ? (
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
            {(!item.isDeleted || ['transf_task', 'del_discussion'].indexOf(item.id) > -1) &&
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
  const isMobile = browserIsMobile();
  if (accountId === 'user-workflow') {
    return (
      <span className="titleAvatarText workflow Gray_9e">
        <span className={cx('accountName', { mobileAccountName: isMobile })}>{_l('工作流')} </span>
      </span>
    );
  } else if (child[0].operatContent.requestType === 3) {
    return (
      <span className="titleAvatarText">
        <span className="accountName">{accountName} </span>
      </span>
    );
  } else {
    return <span className="titleAvatarText accountName">{fullname}</span>;
  }
};
const renderTitleAvatar = data => {
  const { accountId, child, fullname } = data;
  const isMobile = browserIsMobile();

  if (accountId === 'user-workflow') {
    let _fullname = '';
    if (child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:'))) {
      _fullname = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:')).replace('workflow:', '');
    }

    return _fullname ? (
      <span className="titleAvatarText workflow Gray_9e mRight5">
        {isMobile ? (
          <span className="Gray">{_fullname.replace(reg, '')}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: filterXSS(_fullname) }}></span>
        )}
      </span>
    ) : null;
  } else if (child[0].operatContent.requestType === 3) {
    let btn = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'btn:'));
    return (
      <span className="titleAvatarText mRight5">
        <span className="Gray_9e">{_l('通过自定义动作')}</span>
        <span className="Gray"> {btn ? btn.replace('btn:', '') : ''}</span>
      </span>
    );
  } else if (child[0].operatContent.requestType === 2) {
    let extendParam = child[0].operatContent.extendParams.find(l => _.startsWith(l, 'workflow:'));
    let _html = extendParam ? extendParam.replace('workflow:', '') : undefined;
    return _html ? (
      <span className="titleAvatarText workflow Gray_9e mRight5">
        <span className="mRight5">{_l('触发工作流')}</span>
        {isMobile ? (
          <span className="Gray">{_html.replace(reg, '')}</span>
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
  const { type, accountId } = data;
  let content = null;

  if (accountId === 'user-integration' && type === 4) {
    content = <span className="createRecord mLeft2">{_l('创建了记录')}</span>;
  } else {
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
        let triggerWorkflow =
          data.child[0].operatContent.extendParams.find(l => _.startsWith(l, 'triggerWorkflow:')) ||
          'triggerWorkflow:0';
        content = (
          <span className="mLeft2">
            {_l('通过')}
            <span className="Gray mLeft5 mRight5">
              {_l('导入Excel文件')}
              {triggerWorkflow.replace('triggerWorkflow:', '') === '1' ? _l('(触发工作流)') : null}
            </span>
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
  const { controls, worksheetId, formdata, showFilter = true, filterUniqueIds = undefined } = props;
  const selectUserRef = useRef();
  const [{ loading, showAddCondition, loadouted, sign, showDivider, lastMark }, setMark] = useSetState({
    loading: false,
    showAddCondition: false,
    loadouted: false,
    sign: {
      newDataEnd: false,
      oldLogEnd: false,
      showLodOldButton: false,
    },
    showDivider: false,
    lastMark: undefined,
  });
  const [{ selectUser, selectField, selectDate, pageIndexs }, setPara] = useSetState({
    selectUser: undefined,
    selectField: undefined,
    selectDate: {
      visible: false,
      range: undefined,
    },
    pageIndexs: {
      newLogIndex: 1,
      oldLogIndex: 0,
    },
  });
  const [{ discussList, discussData }, setOldData] = useSetState({
    discussList: [],
    discussData: [],
  });
  const [{ newEditionData, newEditionList }, setNewData] = useSetState({
    newEditionData: [],
    newEditionList: [],
  });
  const [moreList, setMoreList] = useState([]);
  const [worksheetInfo, setWorksheetInfo] = useState({});
  let INIT_SIGN = false;
  const isMobile = browserIsMobile();

  useImperativeHandle(ref, () => ({
    reload: initLog,
    handleScroll: handleScroll,
  }));

  useEffect(() => {
    const { appId, worksheetId } = props;
    if (!appId) {
      sheetAjax
        .getWorksheetInfo({
          worksheetId: worksheetId,
          getViews: true,
          getSwitchPermit: true,
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
  }, [props.rowId, props.filterUniqueIds]);

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
    setPara({
      selectUser: undefined,
      selectField: undefined,
      selectDate: {
        visible: false,
        range: undefined,
      },
      pageIndexs: {
        newLogIndex: 1,
        oldLogIndex: 0,
      },
    });
    setOldData({ discussList: [] });
    setMark({
      sign: {
        newDataEnd: false,
        oldLogEnd: false,
        showLodOldButton: false,
      },
      lastMark: undefined,
      loadouted: false,
    });
    loadNewEdition({ lastMark: undefined });
  }

  function loadNewEdition(prop) {
    const { worksheetId, rowId, pageSize = PAGE_SIZE, filterUniqueIds } = props;
    const { pageIndex, filedId, opeartorId, startDateTime, endDateTime } = prop;
    let _opeartorId = prop.hasOwnProperty('opeartorId') ? opeartorId : selectUser && selectUser[0].accountId;
    let _filterId = prop.hasOwnProperty('filedId') ? filedId : selectField && selectField.controlId;
    let _startDate = prop.hasOwnProperty('startDateTime')
      ? startDateTime
      : selectDate.range && selectDate.range.value[0];
    let _endDate = prop.hasOwnProperty('endDateTime') ? endDateTime : selectDate.range && selectDate.range.value[1];
    let _lastMark = prop.hasOwnProperty('lastMark') ? prop.lastMark : lastMark;
    setMark({ loading: true });
    let param = {
      worksheetId,
      pageSize,
      objectType: 2,
      opeartorIds: _opeartorId ? [_opeartorId] : [],
      controlIds: _filterId ? [_filterId] : [],
      startDate: _startDate,
      endDate: _endDate,
      lastMark: _lastMark,
      rowId: rowId,
    };
    let promise = filterUniqueIds
      ? sheetAjax.batchGetWorksheetOpeationLogs({ ...param, filterUniqueIds: filterUniqueIds })
      : sheetAjax.getWorksheetOpeationLogs(param);
    promise.then(res => {
      setMark({ loading: false, lastMark: res.lastMark });
      let data = res.logs;
      setOldData({ newEditionData: pageIndexs.newLogIndex === 1 ? [] : newEditionData.concat(data) });
      if (data.length) {
        // 去重
        let _data = assembleNewLogListData(data.filter(l => !DISCUSS_LOG_ID.includes(m => m === l.id)));
        DISCUSS_LOG_ID.concat(data.map(l => l.operatContent.uniqueId));
        setNewData({ newEditionList: pageIndexs.newLogIndex === 1 ? _data : newEditionList.concat(_data) });
        if (data.length < PAGE_SIZE || data[data.length - 1].operatContent.type === 1) {
          setMark({
            sign: {
              ...sign,
              newDataEnd: true,
              showLodOldButton: !data.find(l => l.operatContent.type===1 || l.operatContent.type===4),
            },
          });
        } else {
          sign.newDataEnd &&
            setMark({
              sign: {
                ...sign,
                newDataEnd: false,
              },
            });
        }
      } else {
        setMark({
          sign: {
            ...sign,
            newDataEnd: true,
          },
        });
        if (pageIndexs.newLogIndex === 1) {
          setPara({
            pageIndexs: {
              ...pageIndexs,
              oldLogIndex: 1,
            },
          });
          setMark({
            sign: {
              ...sign,
              newDataEnd: true,
            },
            showDivider: true,
          });
          setNewData({ newEditionList: [] });
        }
      }
    });
  }

  function loadLog() {
    const { worksheetId, rowId, pageSize = PAGE_SIZE, filterUniqueIds } = props;

    if (filterUniqueIds) return;
    if (loadouted || selectUser || selectField || selectDate.range) return;

    setMark({ loading: true });
    sheetAjax
      .getLogs({
        worksheetId,
        rowId,
        pageSize,
        pageIndex: pageIndexs.oldLogIndex,
      })
      .then(data => {
        setMark({ loading: false, loadouted: data.length < PAGE_SIZE });
        setOldData({ discussData: discussData.concat(data) });
        if (data.length) {
          // 去重
          let _data = assembleListData(data.filter(l => !DISCUSS_LOG_ID.includes(m => m === l.id)));
          DISCUSS_LOG_ID.concat(_data.map(l => l.id));
          setOldData({ discussList: discussList.concat(_data) });
          if (data[data.length - 1].templateId === 'addwsrow' || data.length < PAGE_SIZE) {
            setMark({
              sign: {
                ...sign,
                newDataEnd: true,
                oldLogEnd: true,
              },
            });
          }
        }
      });
  }

  const clearSelectField = e => {
    e.stopPropagation();
    setMark({ lastMark: undefined });
    setPara({
      selectField: undefined,
      pageIndexs: {
        ...pageIndexs,
        newLogIndex: 1,
      },
    });
    setMoreList([]);
    loadNewEdition({ filedId: undefined, lastMark: undefined });
  };

  const clearSelectUser = e => {
    e.stopPropagation();
    setMark({ lastMark: undefined });
    setPara({
      selectUser: undefined,
      pageIndexs: {
        ...pageIndexs,
        newLogIndex: 1,
      },
    });
    loadNewEdition({ opeartorId: undefined, lastMark: undefined });
  };

  const clearSelectDate = e => {
    e.stopPropagation();
    setMark({ lastMark: undefined });
    setPara({
      selectDate: {
        visible: selectDate.visible,
        range: undefined,
      },
      pageIndexs: {
        ...pageIndexs,
        newLogIndex: 1,
      },
    });
    loadNewEdition({ startDateTime: undefined, endDateTime: undefined, lastMark: undefined });
  };

  const handleScroll = _.debounce(() => {
    if ((selectUser || selectField || selectDate.range) && sign.newDataEnd) return;
    if (loading) return;
    if (loadouted && sign.newDataEnd) return;
    if (sign.newDataEnd && sign.oldLogEnd) return;
    if (!loading && !sign.newDataEnd) {
      setPara({
        pageIndexs: {
          ...pageIndexs,
          newLogIndex: pageIndexs.newLogIndex + 1,
        },
      });
    } else if (!loading && sign.newDataEnd && !sign.oldLogEnd) {
      setPara({
        pageIndexs: {
          ...pageIndexs,
          oldLogIndex: pageIndexs.oldLogIndex + 1,
        },
      });
    }
  }, 500);

  const selectUserCallback = value => {
    setMark({ lastMark: undefined });
    setPara({
      selectUser: value,
      pageIndexs: {
        ...pageIndexs,
        newLogIndex: 1,
      },
    });
    loadNewEdition({ opeartorId: value[0].accountId, lastMark: undefined });
  };

  function pickUser() {
    const { worksheetId, projectId = '', appId } = props;
    const filterIds = ['user-sub', 'user-undefined'];
    quickSelectUser(selectUserRef.current, {
      hidePortalCurrentUser: true,
      selectRangeOptions: false,
      includeSystemField: true,
      prefixOnlySystemField: true,
      rect: selectUserRef.current.getBoundingClientRect(),

      tabType: 3,
      appId: appId || worksheetInfo.appId,
      showMoreInvite: false,
      isTask: false,
      filterAccountIds: selectUser ? selectUser.map(item => item.accountId).concat(filterIds) : [].concat(filterIds),
      offset: {
        top: 2,
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
    setMark({ lastMark: undefined });
    setPara({
      selectField: control,
      pageIndexs: {
        ...pageIndexs,
        newLogIndex: 1,
      },
    });
    setMoreList([]);
    loadNewEdition({ filedId: control.controlId, lastMark: undefined });
  };

  return (
    <ScrollView className="logScroll flex worksheetRecordLog" onScrollEnd={handleScroll}>
      <div className={cx('logBox', { mobileLogBox: isMobile })}>
        {showFilter && (
          <div className={cx('selectCon', { hideEle: isMobile })}>
            <div className="left">
              <span className={cx({ selectLight: selectUser }, 'selectUser')} onClick={pickUser} ref={selectUserRef}>
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
                      !_.includes(['caid', 'ctime', 'utime', 'daid', 'rowid', 'uaid'], it.controlId),
                  ),
                )}
                defaultVisible={showAddCondition}
                onAdd={control => {
                  selectFieldChange(control);
                }}
                comp={() => {
                  return (
                    <span className={cx({ selectLight: selectField }, 'selectField')}>
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
                setPara({
                  selectDate: {
                    ...selectDate,
                    visible: visible,
                  },
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
                    setPara({
                      selectDate: {
                        visible: false,
                        range: {
                          ...data,
                          value: [data.value[0], data.value[1]],
                        },
                      },
                      pageIndexs: {
                        ...pageIndexs,
                        newLogIndex: 1,
                      },
                    });
                    setMark({ lastMark: undefined });
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
        )}
        {!loading && filterUniqueIds && filterUniqueIds.length > 0 && newEditionList.length === 0 && (
          <div className="Gray_75 pBottom10 noneContent Font13" style={{ paddingTop: '120px', textAlign: 'center' }}>
            {_l('无数据或无权限查看')}
          </div>
        )}
        {newEditionList.length === 0 && (selectUser || selectField || selectDate.range) && (
          <div className="Gray_c pBottom10 noneContent" style={{ paddingTop: '120px', textAlign: 'center' }}>
            {_l('暂无数据')}
          </div>
        )}
        {newEditionList.map((item, index) => {
          return (
            <div className="worksheetRocordLogCard" key={`worksheetRocordLogCard-${item.time}-${index}`}>
              <div className={cx('worksheetRocordLogCardTopBox', { mBottom0: item.type === 1 })}>
                <div className="worksheetRocordLogCardTitle">
                  {isMobile || !showFilter ? (
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
                        if (SYSTEM_USER.hasOwnProperty(item.accountId)) {
                          userInfo = SYSTEM_USER[item.accountId];
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
                  showFilter: showFilter,
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
        {!filterUniqueIds && sign.showLodOldButton && discussList.length === 0 && (
          <p className="loadOldLog">
            <span
              onClick={() => {
                setPara({ pageIndexs: { ...pageIndexs, oldLogIndex: 1 } });
                setMark({
                  sign: {
                    ...sign,
                    showLodOldButton: false,
                  },
                  showDivider: true,
                });
              }}
            >
              {_l('继续查看旧版日志')}
            </span>
          </p>
        )}
        {!filterUniqueIds &&
          !selectUser &&
          !selectField &&
          !selectDate.range &&
          showDivider &&
          discussList.length > 0 && (
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
              <div className="worksheetRocordLogCard" key={`worksheetRocordLogCard-${item.time}-${index}`}>
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
                          <span className="Gray mRight5">{userOrFlow}</span>
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
