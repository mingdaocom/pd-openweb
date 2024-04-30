import React, { useEffect, useRef, useState } from 'react';
import { useSetState } from 'react-use';
import { Dialog, LoadDiv } from 'ming-ui';
import { getAdvanceSetting } from 'src/pages/widgetConfig/util/index.js';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import renderCellText from 'src/pages/worksheet/components/CellControls/renderText';
import SortList from './components/SortList';
import { quickSelectUser } from 'ming-ui/functions';
import cx from 'classnames';
import { getTabTypeBySelectUser } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import { isSameType } from 'src/pages/worksheet/common/ViewConfig/util.js';

const Wrap = styled.div`
  .recordItem {
    height: 36px;
    line-height: 36px;
    padding: 0 12px;
  }
  .reset,
  .clearBtn {
    padding: 6px 12px;
    border-radius: 3px;
    display: inline-block;
    color: #757575;
    &:hover {
      background: #f8f8f8;
      // background: #f5f5f5;
      color: #2196f3;
      &.clearBtn {
        color: red;
      }
    }
  }
  .add {
    padding: 6px 16px;
    background: #f8f8f8;
    border-radius: 3px;
    width: 100px;
    &:hover {
      background: #f5f5f5;
    }
    &.disable {
      cursor: not-allowed;
      &:hover {
        background: #f8f8f8;
      }
    }
  }
`;
export default function (props) {
  const $ref = useRef(null);
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
  const isJSON = str => {
    try {
      JSON.parse(str);
      return true;
    } catch (e) {
      return false;
    }
  };
  const formatSetting = () => {
    const data = getAdvanceSetting(view, advancedSettingKey) || [];
    if ([29].includes(controlInfo.type)) {
      return data.map(o => {
        let da = safeParse(o);
        return { ...da, rowid: da.id };
      });
    }
    if (isSameType([26], controlInfo)) {
      return data.map(o => {
        let da = safeParse(o);
        return { ...da, accountId: da.id, fullname: da.name };
      });
    }
    return data;
  };
  const [{ setting, list, pageIndex, keyWords, controls, count, loading }, setState] = useSetState({
    setting: formatSetting(),
    list: [],
    pageIndex: 1,
    keyWords: '',
    controls: [], //字段信息
    count: 0,
    loading: false,
  });

  const formatSettingData = list => {
    let settingList = maxCount ? list.slice(0, maxCount) : list;
    settingList = [29].includes(controlInfo.type)
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
      const list = new Array(parseInt(_.get(control, ['advancedSetting', 'max']) || '1', 10));
      formatSettingData(list);
    }
    if (controlInfo.type === 29) {
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
        formatSettingData(res.data, res.template ? res.template.controls : []);
      });
    }
  };

  const addUser = (isMultiple = true, tabType) => {
    quickSelectUser($ref.current, {
      showMoreInvite: false,
      isTask: false,
      tabType,
      appId,
      includeUndefinedAndMySelf: false,
      includeSystemField: false,
      offset: {
        top: 4,
        left: -1,
      },
      zIndex: 10001,
      filterAccountIds: [md.global.Account.accountId, 'user-self'],
      SelectUserSettings: {
        projectId,
        unique: !isMultiple,
        filterResigned: false,
        callback(users) {
          const list = isMultiple ? _.uniqBy([...setting, ...users], 'accountId') : users;
          setState({
            setting: maxCount ? list.slice(0, maxCount) : list,
          });
        },
      },
      selectCb(users) {
        const list = isMultiple ? _.uniqBy([...setting, ...users], 'accountId') : users;
        setState({
          setting: maxCount ? list.slice(0, maxCount) : list,
        });
      },
    });
  };

  return (
    <Dialog
      visible
      title={<span className="Bold">{title || _l('自定义排序')}</span>}
      description={description ? <span>{description}</span> : undefined}
      width={480}
      onCancel={onClose}
      className="subListSortDialog"
      onOk={() => {
        onChange(setting);
        onClose();
      }}
    >
      <Wrap className="flexColumn h100">
        <div className="head flexRow alignItemsCenter">
          <div className="num flex">
            {!maxCount
              ? setting.filter(o => o !== 'add').length > 0
                ? setting.filter(o => o !== 'add').length
                : ''
              : `${
                  setting.filter(o => o !== 'add').length > maxCount
                    ? maxCount
                    : setting.filter(o => o !== 'add').length
                }/${maxCount}`}
          </div>
          {/* 操作 重置 清空 */}
          <div className="act">
            {![26].includes(controlInfo.type) && maxCount && (
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
                {setting.filter(o => o !== 'add').length <= 0 ? _l('添加全部') : _l('重置')}
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
              onChange={setting => {
                setState({
                  setting,
                });
              }}
              controlInfo={controlInfo} //分组字段信息
            />
          )}
        </div>
        <div className="">
          <span
            className={cx(
              'add InlineBlock mTop6 Bold TxtCenter',
              setting.filter(o => o !== 'add').length >= maxCount ? 'disable Gray_9e' : 'Hand ThemeColor3',
            )}
            onClick={() => {
              if (setting.filter(o => o !== 'add').length >= maxCount) {
                return;
              }
              if ([26].includes(controlInfo.type)) {
                addUser(true, getTabTypeBySelectUser(controlInfo));
              } else {
                setState({
                  setting: setting.concat(['add']),
                });
              }
            }}
            ref={$ref}
          >
            <i className="icon icon-add Font16 mRight5"></i>
            {props.addTxt || _l('选择字段')}
          </span>
        </div>
      </Wrap>
    </Dialog>
  );
}
