import React, { Fragment, useEffect, useRef } from 'react';
import { Dropdown as MDDropdown, LoadDiv, Icon, SvgIcon } from 'ming-ui';
import { ConfigProvider, Button } from 'antd';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import homeAppAjax from 'src/api/homeApp';
import appManagementAjax from 'src/api/appManagement';
import syncTaskApi from 'src/pages/integration/api/syncTask';
import { useSetState } from 'react-use';
import update from 'immutability-helper';
import cx from 'classnames';
import _ from 'lodash';
import { getFeatureStatus } from 'src/util';
import { VersionProductType } from 'src/util/enum';
import { DropdownPlaceholder } from '../../../styled';

const SelectItem = styled.div`
  .title {
    margin: 24px 0 6px 0;
  }
`;

const SelectSheetWrap = styled.div`
  background: #fff;
  border-radius: 4px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2), 0 2px 6px rgba(0, 0, 0, 0.15);
  .tabNav {
    display: flex;
    padding-left: 20px;
    border-bottom: 1px solid #f0f0f0;
  }
  .navItem {
    margin-bottom: 0 !important;
    padding: 12px 0;
    color: rgba(0, 0, 0, 0.85);
    border-bottom: 2px solid transparent;
    cursor: pointer;
    font-size: 14px;
    font-weight: bold;
    &:hover {
      color: #2196f3;
    }
    &.active {
      color: #2196f3;
      border-bottom-color: #2196f3;
    }
    &:last-child {
      margin-left: 32px;
    }
  }
  .searchWrap {
    padding: 8px 10px 8px 20px;
    border-bottom: 1px solid #eaeaea;
    input {
      border: none;
      &::placeholder {
        color: #bdbdbd;
      }
    }
  }
  .workSheetListWrap {
    padding: 6px 0;
    height: 300px;
    overflow-y: auto;
    .sheetItem {
      padding: 10px;
      &:hover {
        background-color: #f5f5f5;
      }
    }
    .svgIconWrap div {
      display: flex;
      align-items: center;
    }
    .icon-aggregate_table {
      color: rgb(76, 175, 80) !important;
    }
  }
  .iconWrap {
    width: 110px;
    height: 110px;
    border-radius: 50%;
    justify-content: center;
    background: #f5f5f5;
  }
`;

const initConfig = [
  { text: _l('工作表'), value: '0' },
  { text: _l('聚合表'), value: '1' },
];

export default function SelectSheetFromApp(props) {
  const { onChange, globalSheetInfo = {}, fromCustomEvent } = props;
  const { appId: currentAppId, projectId, worksheetId: sourceId } = globalSheetInfo;
  const [data, setData] = useSetState({
    appId: currentAppId,
    sheetId: '',
    ..._.pick(props, ['appId', 'sheetId']),
    app: [],
    sheet: [],
    aggregationSheets: [],
    queryType: props.queryType || '0',
    visible: false,
    searchValue: '',
    loading: false,
  });
  const {
    appId,
    sheetId,
    app = [],
    sheet = [],
    queryType,
    visible,
    searchValue,
    loading,
    aggregationSheets = [],
  } = data;
  const appDelete = appId && app.length && !_.find(app, a => a.value === appId);
  const selectSheet = _.find(sheet.concat(aggregationSheets), s => s.value === sheetId);
  const sheetDelete = sheetId && !loading && app.length && !selectSheet;
  const $ref = useRef(null);

  const renderWorkSheetItem = item => {
    return (
      <div
        className="sheetItem pointer flexRow alignItemsCenter pLeft20"
        key={item.value}
        onClick={() => {
          setData({ sheetId: item.value, visible: false, searchValue: '' });
          onChange({ sheetId: item.value, queryType });
        }}
      >
        {queryType === '0' ? (
          <SvgIcon className="svgIconWrap" url={item.iconUrl} fill="#9e9e9e" size={18} />
        ) : (
          <Icon className="Font20" icon="aggregate_table" />
        )}
        <span className="bold mLeft8 ellipsis">{item.text}</span>
      </div>
    );
  };

  const getCurrentSheets = key => {
    return key === '0' ? sheet : aggregationSheets;
  };

  const selectSheetMenu = () => {
    const curSheets = getCurrentSheets(queryType);
    return (
      <SelectSheetWrap>
        <div className="tabNav">
          {initConfig.map(({ value, text }) => {
            return (
              <div
                className={cx('navItem', { active: queryType === value })}
                onClick={() => {
                  const currentSheets = getCurrentSheets(value);
                  if (!currentSheets.length) getList(value);
                  setData({ queryType: value, searchValue: '' });
                }}
              >
                {text}
              </div>
            );
          })}
        </div>
        <div className="searchWrap flexRow alignItemsCenter">
          <Icon className="Font18 Gray_9e mRight3" icon="search" />
          <input
            className="w100"
            placeholder={_l('搜索')}
            autoFocus
            value={searchValue}
            onChange={e => {
              console.log(e);
              setData({ searchValue: e.target.value });
            }}
          />
        </div>
        <div className="workSheetListWrap">
          {loading ? (
            <LoadDiv className="mTop10 mBottom10" />
          ) : curSheets.length ? (
            curSheets.filter(item => item.text.includes(searchValue)).map(item => renderWorkSheetItem(item))
          ) : queryType === '0' ? (
            <div className="flexColumn alignItemsCenter justifyContentCenter h100">{_l('无内容')}</div>
          ) : (
            <div className="flexColumn alignItemsCenter justifyContentCenter h100">
              <Icon className="Font50 Gray_9e" icon="aggregate_table" />
              <span className="Font14 Gray_9e mTop12 ">{_l('将工作表数据预处理为聚合结果')}</span>
              <span className="Font14 Gray_9e mBottom24">{_l('在表单、流程、统计中作为数据源使用')}</span>
              {getFeatureStatus(projectId, VersionProductType.aggregation) == '1' && (
                <ConfigProvider autoInsertSpaceInButton={false}>
                  <Button
                    type="primary"
                    onClick={() => {
                      window.open(`/app/${appId}/settings/aggregations`);
                    }}
                    style={{ borderRadius: 20 }}
                  >
                    {_l('创建')}
                  </Button>
                </ConfigProvider>
              )}
            </div>
          )}
        </div>
      </SelectSheetWrap>
    );
  };

  useEffect(() => {
    appManagementAjax.getAppForManager({ projectId, type: 0 }).then(res => {
      let selectAppId = '';
      const getFormatApps = () => {
        const currentIndex = _.findIndex(res, item => item.appId === currentAppId);
        const currentApp = currentIndex > -1 ? res[currentIndex] : [];
        const appList = [currentApp].concat(update(res, { $splice: [[currentIndex, 1]] }));
        if (appList.length < 1) return [];
        if (sheetId) {
          appList.forEach(i => {
            if (_.find(i.workSheetInfo || [], w => w.workSheetId === sheetId)) {
              selectAppId = i.appId;
            }
          });
        }
        return appList.map(({ appName, appId }) =>
          appId === currentAppId
            ? { text: _l('%0  (本应用)', appName), value: appId }
            : { text: appName, value: appId },
        );
      };
      setData({ app: getFormatApps(), appId: selectAppId || appId });
    });
  }, []);

  const getList = key => {
    if (!appId || loading) return;
    const currentType = key || queryType;
    setData({ loading: true });
    // 配置成聚合表
    if (currentType === '1') {
      syncTaskApi
        .list(
          {
            projectId,
            appId,
            pageNo: 0,
            pageSize: 9999,
            taskType: 1,
          },
          {
            isAggTable: true,
          },
        )
        .then(data => {
          const { content } = data;
          setData({
            aggregationSheets: content
              .filter(n => n.aggTableTaskStatus !== 0 && n.taskStatus !== 'ERROR')
              .map(({ name, worksheetId }) => ({ text: name, value: worksheetId })),
            loading: false,
          });
        });
      return;
    }
    homeAppAjax.getWorksheetsByAppId({ appId, type: 0 }).then(res => {
      setData({
        sheet: res.map(({ workSheetId: value, workSheetName: text, iconUrl }) =>
          value === sourceId ? { text: _l('%0  (本表)', text), value, iconUrl } : { text, value, iconUrl },
        ),
        loading: false,
      });
    });
  };

  useEffect(() => {
    getList();
  }, [appId]);

  return (
    <Fragment>
      <SelectItem>
        <div className={cx('title Bold', { mTop0: fromCustomEvent })}>{_l('应用')}</div>
        <MDDropdown
          className="w100"
          value={appId || undefined}
          border
          openSearch
          isAppendToBody
          placeholder={appDelete ? <span className="Red">{_l('已删除')}</span> : _l('请选择')}
          data={app}
          onChange={value => {
            if (value === appId) return;
            setData({
              appId: value,
              sheetId: '',
              queryType: '0',
              searchValue: '',
              visible: false,
              sheet: [],
              aggregationSheets: [],
            });
            onChange({ appId: value, sheetId: '', queryType: '0' });
          }}
        />
      </SelectItem>
      <SelectItem>
        <div className="title Bold">{_l('查询表')}</div>
        <Trigger
          popupVisible={visible}
          popupStyle={{ width: 554 }}
          onPopupVisibleChange={visible => setData({ visible })}
          action={['click']}
          getPopupContainer={() => $ref.current}
          popup={() => selectSheetMenu()}
          popupAlign={{
            points: ['tr', 'br'],
          }}
        >
          <DropdownPlaceholder ref={$ref}>
            <span className={cx('breakAll', { Red: sheetDelete })}>
              {sheetId && !loading ? (
                sheetDelete ? (
                  _l('已删除')
                ) : (
                  _.get(selectSheet, 'text')
                )
              ) : (
                <span className="Gray_bd">{_l('请选择')}</span>
              )}
            </span>
            <div className="ming Icon icon icon-arrow-down-border mLeft8 Gray_9e" />
          </DropdownPlaceholder>
        </Trigger>
      </SelectItem>
    </Fragment>
  );
}
