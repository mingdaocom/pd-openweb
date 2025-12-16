import React from 'react';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import filterXSS from 'xss';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { renderText } from 'src/utils/control';
import {
  EDIT_TYPE_TEXT,
  FILTER_FIELD_BY_ATTR,
  RETURN_OBJECT_CONTROL_TYPE,
  SOURCE_INFO,
  SUBLIST_FILE_EDIT_TYPE,
  WF_STATUS,
  WFSTATUS_OPTIONS,
} from './enum.js';

const reg = new RegExp('<[^<>]+>', 'g');

export function assembleListData(data) {
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

export function assembleNewLogListData(data) {
  let _resArr = [];
  // 前后相邻的两条 时间在同一天 且 操作者相同 的 并为一条
  data.forEach(item => {
    if (
      !_resArr.length ||
      !moment(_resArr[_resArr.length - 1].time).isSame(item.operatContent.createTime, 'day') ||
      _resArr[_resArr.length - 1].accountId !== item.opeartorInfo.accountId ||
      _resArr[_resArr.length - 1].type !== item.operatContent.type ||
      _resArr[[_resArr.length - 1]].requestType !== item.operatContent.requestType ||
      _.includes([2, 7], item.operatContent.requestType) ||
      _.includes([10, 11, 12], item.operatContent.type)
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

export function getShowWfstatusValue(option) {
  if (!option) return null;
  let value = _.startsWith(option, '[') ? safeParse(option, 'array')[0] : option;
  if (!value && option) {
    value = option;
  }
  if (_.startsWith(value, 'other')) {
    return value === 'other' ? _l('其他') : _.replace(value, 'other:', '') || _l('其他');
  }
  if (_.startsWith(value, '其他')) {
    return value === '其他' ? _l('其他') : _.replace(value, '其他:', '') || _l('其他');
  }
  if (_.has(WF_STATUS, value)) {
    return WF_STATUS[value];
  }
  return WFSTATUS_OPTIONS.find(l => l.key === value) ? WFSTATUS_OPTIONS.find(l => l.key === value).value : value;
}

export const numberControlHandle = (list, control, type) => {
  return list.map(l => {
    let number = renderText({ ...control, value: l }, { noMask: true });
    if ((control || {}).dot === 0 && type === 6 && _.endsWith(number, '.0')) {
      return number.replace('.0', '');
    } else {
      return number;
    }
  });
};

export function getDepartmentName(control = {}, value) {
  const { advancedSetting = {} } = control;

  const pathValue =
    advancedSetting.allpath === '1'
      ? (value.departmentPath || []).sort((a, b) => b.depth - a.depth).map(i => i.departmentName)
      : [];
  return pathValue.concat([value.departmentName]).join('/');
}

export function handleSelectTagsValue(param) {
  const { id, type, oldValue, newValue, control, requestType, oldText, newText, editType } = param;
  let onlyNew = false;

  if (id.startsWith('wf') && [16].includes(type)) {
    return {
      oldList: oldValue ? [moment(oldValue).format('YYYY-MM-DD HH:mm:ss')] : [],
      newList: newValue ? [moment(newValue).format('YYYY-MM-DD HH:mm:ss')] : [],
    };
  }

  let oldList = [];
  let newList = [];

  switch (type) {
    case 26:
    case 27:
    case 48:
      oldList = safeParse(oldValue, 'array');
      newList = safeParse(newValue, 'array');
      break;
    case 38:
      oldList = oldValue ? [oldValue] : [];
      newList = newValue ? [newValue] : [];
      break;
    case 36:
      oldList = [String(oldValue) === '1' ? '☑' : '☐'];
      newList = [String(newValue) === '1' ? '☑' : '☐'];
      break;
    case 40:
      let oldObj = safeParse(oldValue);
      let newObj = safeParse(newValue);

      oldList = [oldObj.address].filter(l => l);
      newList = [newObj.address].filter(l => l);

      if (oldList.length === 0 && oldObj.x && oldObj.y) {
        oldList = [`${_l('经度')}：${_.round(oldObj.x, 6)} ${_l('纬度')}：${_.round(oldObj.y, 6)}`];
      }

      if (newList.length === 0 && newObj.x && newObj.y) {
        newList = [`${_l('经度')}：${_.round(newObj.x, 6)} ${_l('纬度')}：${_.round(newObj.y, 6)}`];
      }
      break;
    case 16:
    case 19:
    case 23:
    case 24:
    case 46:
    case 15:
    case 53:
      oldList = oldValue ? [renderText({ ...control, value: oldValue })] : [];
      newList = newValue ? [renderText({ ...control, value: newValue })] : [];
      break;
    case 29:
      const { advancedSetting = {} } = control || {};

      if (
        ([8, 2].includes(requestType) || ['1', '2', '5', '6'].includes(advancedSetting.showtype)) &&
        !oldValue &&
        [1, 2].includes(editType)
      ) {
        let _data = safeParse(safeParse(newValue).rows, 'array');
        oldList = editType === 2 ? _data : [];
        newList = editType === 1 ? _data : [];
        onlyNew = true;
      } else {
        oldList = safeParse(safeParse(oldValue).rows, 'array');
        newList = safeParse(safeParse(newValue).rows, 'array');
      }

      break;
    case 21:
      oldList = safeParse(oldValue, 'array').map(l => l.name);
      newList = safeParse(newValue, 'array').map(l => l.name);
      break;

    default:
      oldList = oldText ? oldText.split(',').filter(l => l) : oldValue ? oldValue.split(',').filter(l => l) : [];
      newList = newText ? newText.split(',').filter(l => l) : newValue ? newValue.split(',').filter(l => l) : [];

      if ([6, 8, 31].includes(type)) {
        oldList = numberControlHandle(oldList, control, type);
        newList = numberControlHandle(newList, control, type);
      } else if (id === 'wfstatus') {
        oldList = oldValue ? [getShowWfstatusValue(oldValue)].filter(l => l) : [];
        newList = newValue ? [getShowWfstatusValue(newValue)].filter(l => l) : [];
      }
      break;
  }

  return { oldList, newList, onlyNew };
}

export function diffSelectTagsValue(param) {
  const { oldList, newList, type, editType, control } = param;

  let _oldValue = [];
  let _newValue = [];
  let _defaultValue = [];

  if (type === 29) {
    _oldValue = _.differenceBy(oldList, newList, 'recordId').map(l => l.name || _l('未命名'));
    _newValue = _.differenceBy(newList, oldList, 'recordId').map(l => l.name || _l('未命名'));
    _defaultValue = _.intersectionBy(oldList, newList, 'recordId').map(l => l.name || _l('未命名'));
  } else if ((type === 6 || type === 8) && editType !== 0) {
    _defaultValue = oldList;
    _newValue = editType === 1 ? newList : [];
    _oldValue = editType === 2 ? newList : [];
  } else if (RETURN_OBJECT_CONTROL_TYPE.includes(type)) {
    _oldValue =
      editType === 2
        ? newList
            .filter(l => oldList.find(m => m[FILTER_FIELD_BY_ATTR[type][0]] === l[FILTER_FIELD_BY_ATTR[type][0]]))
            .map(l => (type === 27 ? getDepartmentName(control, l) : l[FILTER_FIELD_BY_ATTR[type][1]]))
        : _.differenceBy(oldList, newList, FILTER_FIELD_BY_ATTR[type][0]).map(l =>
            type === 27 ? getDepartmentName(control, l) : l[FILTER_FIELD_BY_ATTR[type][1]],
          );
    _newValue =
      editType === 2
        ? []
        : _.differenceBy(newList, oldList, FILTER_FIELD_BY_ATTR[type][0]).map(l =>
            type === 27 ? getDepartmentName(control, l) : l[FILTER_FIELD_BY_ATTR[type][1]],
          );
    _defaultValue =
      editType === 2
        ? oldList
            .filter(l => !newList.find(m => m[FILTER_FIELD_BY_ATTR[type][0]] === l[FILTER_FIELD_BY_ATTR[type][0]]))
            .map(l => (type === 27 ? getDepartmentName(control, l) : l[FILTER_FIELD_BY_ATTR[type][1]]))
        : _.intersectionBy(oldList, newList, FILTER_FIELD_BY_ATTR[type][0]).map(l =>
            type === 27 ? getDepartmentName(control, l) : l[FILTER_FIELD_BY_ATTR[type][1]],
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

  return { _oldValue, _newValue, _defaultValue };
}

export function getExtendParams(extendParams = [], name) {
  let info = extendParams.find(l => _.startsWith(l, `${name}:`));

  return info ? info.replace(`${name}:`, '') : '';
}

export function hasHiddenControl(data, controls) {
  return _.some(data, logData => {
    const control = _.find(controls, it => logData.id === it.controlId) || {};
    const _controlPermissions = (control && control.controlPermissions) || '000';

    return (
      _controlPermissions[0] === '0' && logData.id.length === 24 && !SUBLIST_FILE_EDIT_TYPE.includes(logData.editType)
    );
  });
}

export const isPublicFileDownload = item =>
  item.accountId === 'user-publicform' && _.get(item, 'child[0].operatContent.logData[0].editType') === 13;

export const renderTitleName = (data, isMobile) => {
  const { accountId, accountName, child, fullname } = data;

  if (accountId === 'user-workflow') {
    return (
      <span className="titleAvatarText workflow Gray_9e">
        <span className={cx('accountName', { mobileAccountName: isMobile })}>{_l('工作流')} </span>
      </span>
    );
  }

  if (child[0].operatContent.requestType === 3) {
    return (
      <span className="titleAvatarText">
        <span className="accountName">{accountName} </span>
      </span>
    );
  }

  return <span className="titleAvatarText accountName">{isPublicFileDownload(data) ? _l('公开访问') : fullname}</span>;
};

export const renderTitleAvatar = (data, isMobile) => {
  const { accountId, child, type } = data;

  if (type === 7) {
    return null;
  }

  if (accountId === 'user-workflow' || child[0].operatContent.requestType === 2) {
    const _fullName = getExtendParams(child[0].operatContent.extendParams, 'workflow');

    return _fullName ? (
      <span className="titleAvatarText workflow Gray_9e mRight5">
        {accountId !== 'user-workflow' && <span className="mRight5">{_l('触发工作流')}</span>}
        {isMobile ? (
          <span className="Gray">{_fullName.replace(reg, '')}</span>
        ) : (
          <span dangerouslySetInnerHTML={{ __html: filterXSS(_fullName) }}></span>
        )}
      </span>
    ) : null;
  } else if (child[0].operatContent.requestType === 3) {
    const btn = getExtendParams(child[0].operatContent.extendParams, 'btn');

    return (
      <span className="titleAvatarText mRight5">
        <span className="Gray_9e">{_l('操作按钮')}</span>
        <span className="Gray"> {btn}</span>
      </span>
    );
  } else {
    return null;
  }
};

const OPTION_TYPE_TEXT = {
  3: _l('删除了记录'),
  5: _l('导出了记录'),
  6: _l('恢复了记录'),
  10: _l('触发业务规则锁定了记录'),
  11: _l('锁定了记录'),
  12: _l('解锁了记录'),
  default: _l('更新了记录'),
};

export const renderTitleText = (data, extendParam) => {
  const { controls } = extendParam;
  const count = data.child[0].operatContent.logData.filter(l => l.oldValue !== '' || l.newValue !== '').length;
  const showTooltips = hasHiddenControl(data.child[0].operatContent.logData, controls);

  const { requestType } = _.get(data, 'child[0].operatContent') || {};
  const { type, accountId } = data;
  let content = null;

  if (accountId === 'user-integration' && type === 4) {
    content = (
      <span className="createRecord mLeft2">
        {_l('创建了记录')}
        {requestType ? _l('(通过%0)', SOURCE_INFO[requestType]) : ''}
      </span>
    );
  } else {
    switch (type) {
      case 1:
        content = (
          <span className="createRecord mLeft2">
            {_l('创建了记录')} {requestType ? _l('(通过%0)', SOURCE_INFO[requestType]) : ''}
          </span>
        );
        break;
      case 8:
      case 2:
        const editType = _.get(data, 'child[0].operatContent.logData[0].editType');
        const editTypeText = editType ? EDIT_TYPE_TEXT[editType] : undefined;
        let control = null;

        if (SUBLIST_FILE_EDIT_TYPE.includes(editType)) {
          const controlId = _.get(data, 'child[0].operatContent.logData[0].id');
          control = controls.find(l => l.controlId === controlId);
        }

        content = (
          <span className="mLeft2">
            {editTypeText ? editTypeText : _l('更新%0个字段', count)}
            {control && <span className="Gray mLeft8">{control.controlName}</span>}
          </span>
        );
        break;
      case 3:
      case 5:
      case 6:
      case 10:
      case 11:
      case 12:
        content = <span className="mLeft2">{OPTION_TYPE_TEXT[type]}</span>;
        break;
      case 4:
        const triggerWorkflow = getExtendParams(data.child[0].operatContent.extendParams, 'triggerWorkflow') || '0';

        content = (
          <span className="mLeft2">
            {_l('创建了记录（导入）')}
            {triggerWorkflow === '1' ? _l('(触发工作流)') : null}
          </span>
        );
        break;
      case 7:
        const btn = getExtendParams(data.child[0].operatContent.extendParams, 'btn');

        content = <span className="mLeft2">{_l('操作按钮 %0', btn)}</span>;
        break;
      default:
        content = <span className="mLeft2">{OPTION_TYPE_TEXT.default}</span>;
        break;
    }
  }

  return (
    <React.Fragment>
      {content}
      {showTooltips && (
        <Tooltip placement="right" title={_l('部分字段无权限不可见')}>
          <Icon icon="info_outline" className="Font14 mLeft5" />
        </Tooltip>
      )}
    </React.Fragment>
  );
};

export const isUser = item => {
  return item.accountId && (item.accountId.length > 35 || ['all-users', 'user-self'].includes(item.accountId));
};
