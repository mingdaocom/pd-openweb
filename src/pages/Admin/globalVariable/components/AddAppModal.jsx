import React, { useState, useEffect, useCallback } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import styled from 'styled-components';
import _ from 'lodash';
import { Dialog, ScrollView, LoadDiv, Checkbox } from 'ming-ui';
import SvgIcon from 'src/components/SvgIcon';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import appManagementApi from 'src/api/appManagement';

const AddAppDialog = styled(Dialog)`
  position: relative;
  .mui-dialog-body {
    padding: 0 !important;
  }
  .mui-dialog-footer {
    .Button--disabled {
      background: rgba(33, 150, 243, 0.5);
    }
  }
  .addAppWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    padding: 0 20px;
    .searchCon {
      width: 100%;
      height: 36px;
    }
    .headTr {
      display: flex;
      height: 48px;
      line-height: 48px;
      margin-top: 5px;
      font-size: 14px;
      font-weight: 600;
      color: #757575;
      border-bottom: 1px solid #eaeaea;
    }
    .checkColumn {
      flex: 1;
    }
    .name {
      flex: 4;
      min-width: 0;
    }
    .createTime,
    .owner {
      flex: 3;
      min-width: 0;
    }
    .noDataContent {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      color: #bdbdbd;
      font-size: 14px;
    }
    .appListWrapper {
      flex: 1;
      .dataItem {
        display: flex;
        height: 64px;
        line-height: 64px;
        border-bottom: 1px solid #eaeaea;
        .appIcon {
          display: flex;
          justify-content: center;
          align-items: center;
          width: 38px;
          min-width: 38px;
          height: 38px;
          line-height: 24px;
          border-radius: 4px;
          margin-right: 8px;
        }
      }
    }
  }
  .selectedInfo {
    position: absolute;
    color: #9e9e9e;
    font-size: 14px;
    left: 24px;
    bottom: 26px;
  }
`;

export default function AddAppModal(props) {
  const { projectId, onClose, onOk } = props;
  const [appList, setAppList] = useState([]);
  const [fetchState, setFetchState] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
    keyWords: '',
  });
  const [selectedApps, setSelectedApps] = useState([]);

  const columns = [
    {
      dataIndex: 'checkColumn',
      title: '',
      renderTitle: () => {
        return (
          <Checkbox
            size="small"
            className="pLeft8"
            checked={selectedApps.length === appList.length && !!appList.length}
            onClick={checked => setSelectedApps(checked ? [] : appList)}
          />
        );
      },
      render: item => {
        return (
          <Checkbox
            size="small"
            className="pLeft8"
            checked={!!selectedApps.filter(app => app.appId === item.appId).length}
            onClick={checked =>
              setSelectedApps(
                checked ? selectedApps.filter(app => app.appId !== item.appId) : selectedApps.concat([item]),
              )
            }
          />
        );
      },
    },
    {
      dataIndex: 'name',
      title: _l('应用名称'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter">
            <div className="appIcon" style={{ background: item.iconColor }}>
              <SvgIcon url={item.iconUrl} fill="#fff" size={24} />
            </div>
            <span className="overflow_ellipsis mRight10" title={item.appName}>
              {item.appName}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'createTime',
      title: _l('创建时间'),
      render: item => {
        return <div>{item.ctime}</div>;
      },
    },
    {
      dataIndex: 'owner',
      title: _l('拥有者'),
      render: item => {
        return <div>{item.createAccountInfo.fullName}</div>;
      },
    },
  ];

  const getAppList = () => {
    if (!fetchState.loading) return;
    appManagementApi
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageSize: 50,
        pageIndex: fetchState.pageIndex,
        keyword: fetchState.keyWords,
      })
      .then(({ apps }) => {
        setAppList(fetchState.pageIndex > 1 ? appList.concat(apps) : apps);
        setFetchState({ loading: false, noMore: apps.length < 50 });
      });
  };

  useEffect(getAppList, [fetchState.loading, fetchState.pageIndex, fetchState.keyWords]);

  const onSearch = useCallback(
    _.debounce(value => {
      setFetchState({ loading: true, pageIndex: 1, keyWords: value });
    }, 500),
    [],
  );

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  return (
    <AddAppDialog
      visible
      type="fixed"
      width={700}
      title={_l('添加应用')}
      onOk={() => onOk(selectedApps)}
      onCancel={onClose}
      okDisabled={!selectedApps.length}
    >
      <div className="addAppWrapper">
        <SearchInput className="searchCon" placeholder={_l('搜索应用/拥有者')} onChange={onSearch} />
        <div className="headTr">
          {columns.map((item, index) => {
            return (
              <div key={index} className={`${item.dataIndex}`}>
                {item.renderTitle ? item.renderTitle() : item.title}
              </div>
            );
          })}
        </div>
        {fetchState.pageIndex === 1 && fetchState.loading ? (
          <LoadDiv className="mTop10" />
        ) : !appList.length ? (
          <div className="noDataContent">{fetchState.keyWords ? _l('暂无搜索结果') : _l('暂无应用')}</div>
        ) : (
          <ScrollView className="appListWrapper" onScrollEnd={onScrollEnd}>
            {appList.map((appItem, i) => {
              return (
                <div key={i} className="dataItem">
                  {columns.map((item, j) => {
                    return (
                      <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                        {item.render ? item.render(appItem) : appItem[item.dataIndex]}
                      </div>
                    );
                  })}
                </div>
              );
            })}
          </ScrollView>
        )}
      </div>
      {!!selectedApps.length && (
        <div className="selectedInfo">
          <span>{_l('已选择')}</span>
          <span className="mLeft5 mRight5">{selectedApps.length}</span>
          <span>{_l('应用')}</span>
        </div>
      )}
    </AddAppDialog>
  );
}
