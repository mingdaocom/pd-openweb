import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Modal } from 'ming-ui/antd-components';
import { DeptSelectPopover } from 'ming-ui/functions/quickSelectDept';
import { RoleSelectPopover } from 'ming-ui/functions/quickSelectRole';
import { UserSelectPopover } from 'ming-ui/functions/quickSelectUser';
import sheetAjax from 'src/api/worksheet';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';
import { getAdvanceSetting } from 'src/utils/domain/control/advancedSetting';
import { getTabTypeBySelectUser } from 'src/utils/domain/control/controlSelection';
import { renderText as renderCellText } from 'src/utils/domain/control/display';
import DropCon from './components/DropCon';
import SortList from './components/SortList';

const Wrap = styled.div`
  .reset,
  .clearBtn {
    padding: 6px 12px;
    border-radius: 3px;
    display: inline-block;
    color: var(--color-text-secondary);
    &:hover {
      background: var(--color-background-secondary);
      // background: var(--color-background-secondary);
      color: var(--color-primary);
      &.clearBtn {
        color: var(--color-error);
      }
    }
  }
  .add {
    padding: 6px 16px;
    background: var(--color-background-secondary);
    border-radius: 3px;
    min-width: 100px;
    &:hover {
      background: var(--color-background-hover);
    }
    &.disable {
      cursor: not-allowed;
      &:hover {
        background: var(--color-background-hover);
      }
    }
  }
`;

export default function (props) {
  const {
    view,
    controlInfo,
    title,
    onChange,
    onClose,
    advancedSettingKey = 'customitems',
    description,
    projectId,
    appId,
    maxCount,
  } = props;

  const formatSetting = () => {
    const data = getAdvanceSetting(view, advancedSettingKey) || [];

    if ([29].includes(controlInfo.type)) {
      return data.map(o => {
        let da = safeParse(o);
        return { ...da, rowid: da.id };
      });
    }

    if (isSameType([26, 27, 48], controlInfo)) {
      const keyId = isSameType([26], controlInfo)
        ? 'accountId'
        : isSameType([27], controlInfo)
          ? 'departmentId'
          : 'organizeId';
      const keyName = isSameType([26], controlInfo)
        ? 'fullname'
        : isSameType([27], controlInfo)
          ? 'departmentName'
          : 'organizeName';
      return data.map(o => {
        let da = safeParse(o) || {};
        return { ...da, [keyId]: da.id, [keyName]: da.name };
      });
    }

    return data;
  };

  const [{ setting, keyWords, controls, loading }, setState] = useSetState({
    setting: formatSetting(),
    list: [],
    pageIndex: 1,
    keyWords: '',
    controls: [], //字段信息
    count: 0,
    loading: false,
  });

  const valueRef = useRef();
  useEffect(() => {
    valueRef.current = setting;
  }, [setting]);
  const formatSettingData = list => {
    let settingList = maxCount ? list.slice(0, maxCount) : list;
    settingList = isSameType([29], controlInfo)
      ? settingList.map(data => {
          const control = ((controlInfo || {}).relationControls || []).find(it => it.attribute === 1);
          return {
            rowid: data.rowid,
            name: renderCellText({ ...control, value: data[control.controlId] }) || _l('未命名'),
          };
        })
      : settingList;
    setState({
      setting: settingList,
      loading: false,
    });
  };

  const getColumns = () => {
    if (isSameType([9, 10, 11], controlInfo)) {
      const list = controlInfo.options.filter(o => !o.isDeleted);
      formatSettingData(list.map(o => o.key));
    }

    if (isSameType([28], controlInfo)) {
      const list = [...new Array(parseInt(_.get(controlInfo, ['advancedSetting', 'max']) || '1', 10))].map(
        (o, i) => i + 1 + '',
      );
      formatSettingData(list);
    }

    if (isSameType([29], controlInfo)) {
      const worksheetId = controlInfo.dataSource;
      const args = {
        worksheetId,
        viewId: controlInfo.viewId,
        searchType: 1,
        pageSize: 50,
        pageIndex: 1,
        status: 1,
        keyWords,
        isGetWorksheet: true,
        getType: 7,
        filterControls: [],
      };
      sheetAjax.getFilterRows(args).then(res => {
        formatSettingData(res.data);
      });
    }
  };

  const onChangeSettingUser = (isMultiple, users, isCancel = false) => {
    const list = isCancel
      ? valueRef.current.filter(user => user.accountId !== users[0]?.accountId)
      : isMultiple
        ? _.uniqBy([...valueRef.current, ...users], 'accountId')
        : users;
    setState({
      setting: maxCount ? list.slice(0, maxCount) : list,
    });
  };

  const onSaveAddDep = (data, isCancel = false) => {
    const lastIds = _.sortedUniq(setting.map(l => l.departmentId));
    const newIds = _.sortedUniq(data.map(l => l.departmentId));
    if ((data.length === 0 || _.isEqual(lastIds, newIds)) && !isCancel) return;
    const newData = isCancel
      ? valueRef.current.filter(l => l.departmentId !== data[0].departmentId)
      : _.uniqBy(valueRef.current.concat(data), 'departmentId');
    setState({
      setting: maxCount ? newData.slice(0, maxCount) : newData,
    });
  };

  //添加角色
  const onSaveAddRole = (data, isCancel = false) => {
    if (!data.length) return;
    const newData = isCancel
      ? valueRef.current.filter(l => l.organizeId !== data[0].organizeId)
      : _.uniqBy(valueRef.current.concat(data), 'organizeId');
    setState({
      setting: maxCount ? newData.slice(0, maxCount) : newData,
    });
  };

  const onAddSettingItem = (data, index) => {
    const newSetting = [...setting];
    const insertIndex = typeof index === 'number' ? index + 1 : newSetting.length;

    if (_.isArray(data)) {
      const key = isSameType([26], controlInfo)
        ? 'accountId'
        : isSameType([27], controlInfo)
          ? 'departmentId'
          : 'organizeId';
      const ids = setting.map(item => item[key]);
      newSetting.splice(insertIndex, 0, ...data.filter(item => !ids.includes(item[key])));
    } else if (isSameType([29], controlInfo)) {
      const control = ((controlInfo || {}).relationControls || []).find(item => item.attribute === 1);
      newSetting.splice(insertIndex, 0, {
        rowid: data.rowid,
        name: renderCellText({ ...control, value: data[control.controlId] }) || _l('未命名'),
      });
    } else if (isSameType([9, 10, 11], controlInfo)) {
      newSetting.splice(insertIndex, 0, data.key);
    } else {
      newSetting.splice(insertIndex, 0, data);
    }

    setState({ setting: maxCount ? newSetting.slice(0, maxCount) : newSetting });
  };

  const onDeleteSettingItem = data => {
    const key = isSameType([27], controlInfo)
      ? 'departmentId'
      : isSameType([26], controlInfo)
        ? 'accountId'
        : isSameType([48], controlInfo)
          ? 'organizeId'
          : 'rowid';

    setState({
      setting: setting.filter(item =>
        isSameType([9, 10, 11, 28], controlInfo) ? item !== data : item[key] !== data[key],
      ),
    });
  };

  const isAddDisabled = setting.length >= maxCount;
  const addButton = (
    <span
      className={cx(
        'add InlineBlock mTop6 Bold TxtCenter',
        isAddDisabled ? 'disable textTertiary' : 'Hand colorPrimary',
      )}
    >
      <i className="icon icon-add Font16 mRight5"></i>
      {props.addTxt || _l('选择字段')}
    </span>
  );

  return (
    <Modal
      open
      mask={{ closable: true }}
      keyboard
      title={
        <React.Fragment>
          <div className="Bold">{title || _l('自定义排序')}</div>
          {description && <div className="Font13 Normal textSecondary mTop8">{description}</div>}
        </React.Fragment>
      }
      width={480}
      onCancel={onClose}
      rootClassName="subListSortDialog"
      onOk={() => {
        onChange(setting);
        onClose();
      }}
    >
      <Wrap className="flexColumn h100">
        <div className="head flexRow alignItemsCenter">
          <div className="num flex">
            {!maxCount
              ? setting.length > 0
                ? setting.length
                : ''
              : `${setting.length > maxCount ? maxCount : setting.length}/${maxCount}`}
          </div>
          {/* 操作 重置 清空 */}
          <div className="act">
            {!isSameType([26, 27, 48], controlInfo) && maxCount && (
              <span
                className="reset Hand"
                onClick={() => {
                  if (loading) {
                    return;
                  }

                  setState({ loading: true });
                  getColumns();
                }}
              >
                {setting.length <= 0 ? _l('添加全部') : _l('重置')}
              </span>
            )}
            {setting.length > 0 && (
              <span
                className="clearBtn Hand mLeft10"
                onClick={() => {
                  setState({
                    setting: [],
                  });
                }}
              >
                {_l('清空')}
              </span>
            )}
          </div>
        </div>
        <div className="flex con">
          {loading ? (
            <LoadDiv />
          ) : (
            <SortList
              // view={props.view} //整个配置
              projectId={props.projectId}
              appId={props.appId}
              setting={setting}
              maxCount={maxCount}
              controls={controls} //字段名称 用作显示
              onChange={setting => setState({ setting })}
              onAdd={onAddSettingItem}
              onDelete={onDeleteSettingItem}
              controlInfo={controlInfo} //分组字段信息
            />
          )}
        </div>
        <div className="">
          {isSameType([26], controlInfo) && !isAddDisabled ? (
            <UserSelectPopover
              showMoreInvite={false}
              tabType={getTabTypeBySelectUser(controlInfo)}
              appId={appId}
              includeUndefinedAndMySelf={false}
              includeSystemField={false}
              offset={{ top: 4, left: -1 }}
              isDynamic
              filterAccountIds={['user-self']}
              selectedAccountIds={setting.map(l => l.accountId)}
              SelectUserSettings={{
                projectId,
                unique: false,
                filterResigned: false,
                callback: users => onChangeSettingUser(true, users),
              }}
              onSelect={(users, isCancel) => onChangeSettingUser(true, users, isCancel)}
            >
              {addButton}
            </UserSelectPopover>
          ) : isSameType([27], controlInfo) && !isAddDisabled ? (
            <DeptSelectPopover
              projectId={projectId}
              isIncludeRoot={false}
              unique={false}
              showCreateBtn={false}
              selectedDepartment={setting}
              selectFn={onSaveAddDep}
            >
              {addButton}
            </DeptSelectPopover>
          ) : isSameType([48], controlInfo) && !isAddDisabled ? (
            <RoleSelectPopover
              projectId={projectId}
              unique={false}
              value={setting}
              onSave={onSaveAddRole}
              placement="bottomLeft"
            >
              {addButton}
            </RoleSelectPopover>
          ) : (
            <DropCon
              controlInfo={controlInfo}
              currentList={setting}
              disabled={isAddDisabled}
              onChange={item => onAddSettingItem(item)}
              onDelete={onDeleteSettingItem}
            >
              {addButton}
            </DropCon>
          )}
        </div>
      </Wrap>
    </Modal>
  );
}
