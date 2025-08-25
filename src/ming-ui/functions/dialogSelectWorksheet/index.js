import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Checkbox, Dialog, FunctionWrap, Icon, LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';

const ContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .appSearchInput {
    display: flex;
    position: relative;
    height: 36px;
    margin-top: 8px;

    input {
      flex: 1;
      border: none;
      border-radius: 26px;
      background-color: #f5f5f5;
      padding: 0 18px 0 40px;
      &:hover {
        background-color: #f0f0f0;
      }
      &:focus {
        background-color: #fff;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
      }
    }
    .searchIcon {
      position: absolute;
      top: 10px;
      left: 18px;
    }
    .searchClear {
      display: flex;
      justify-content: center;
      align-items: center;
      position: absolute;
      right: 3px;
      top: 3px;
      width: 30px;
      height: 30px;
      border-radius: 50%;
      cursor: pointer;
      &:hover {
        background: #f8f8f8;
      }
    }
  }
  .emptyText {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: #757575;
    font-size: 15px;
  }
  .appList {
    flex: 1;
    margin-top: 16px;
    overflow: auto;
  }
`;

const Item = styled.div`
  display: flex;
  align-items: center;
  padding: 8px;
  border-radius: 3px;
  cursor: pointer;
  .expandIcon {
    font-size: 10px;
    margin-right: 8px;
    color: #9d9d9d;
    cursor: pointer;
    &:hover {
      color: #1677ff;
    }
  }
  .ming.Checkbox {
    min-width: 18px;
    .Checkbox-box {
      margin: 0 !important;
    }
  }

  .appIcon {
    width: 24px;
    height: 24px;
    line-height: 16px;
    min-width: 24px;
    border-radius: 50%;
    margin: 0 10px;
    display: flex;
    justify-content: center;
    align-items: center;
    position: relative;
  }
  &.isItem {
    padding-left: 48px;
    line-height: 16px;
  }
  &:hover {
    background: #f8f8f8;
  }
`;

function SelectWorksheet(props) {
  const { projectId, title, onClose, onOk = () => {} } = props;
  const searchRef = useRef();
  const [
    {
      keywords,
      expandIds,
      items,
      selectApps,
      selectWorksheets,
      appPageIndex,
      loadingApp,
      isMoreApp,
      appList,
      itemLoading,
    },
    setData,
  ] = useSetState({
    keywords: undefined,
    expandIds: [],
    items: {},
    selectApps: [],
    selectWorksheets: [],
    appPageIndex: 1,
    loadingApp: true,
    isMoreApp: false,
    appList: [],
    itemLoading: {},
  });
  let appPromise = null;

  const getAppList = (params = {}) => {
    // 加载更多
    if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
      return;
    }
    setData({ loadingApp: true });
    if (appPromise) {
      appPromise.abort();
    }
    const pageIndex = params.appPageIndex || appPageIndex;
    appPromise = appManagementAjax.getAppsByProject({
      projectId,
      status: '',
      order: 3,
      pageIndex,
      pageSize: 50,
      keyword: params.keyword,
    });

    appPromise
      .then(({ apps }) => {
        setData({
          appList: pageIndex === 1 ? [].concat(apps) : appList.concat(apps),
          isMoreApp: apps.length >= 50,
          loadingApp: false,
          appPageIndex: pageIndex,
        });
      })
      .catch(() => {
        setData({ loadingApp: false });
      });
  };

  const onScrollEnd = () => {
    if (isMoreApp && !loadingApp) {
      getAppList({ appPageIndex: appPageIndex + 1 });
    }
  };

  const onSearch = useCallback(
    _.debounce(value => {
      getAppList({ appPageIndex: 1, keyword: value });
    }, 500),
    [],
  );

  const fetchItemList = (appId, { allSelect, app } = {}) => {
    setData({ itemLoading: { [appId]: true } });
    appManagementAjax.getAppItems({ appIds: [appId], isFilterCustomPage: true, projectId }).then(res => {
      if (res) {
        const sheets = res[appId] || [];
        setData({
          items: { ...items, [appId]: sheets },
          selectWorksheets: allSelect ? selectWorksheets.concat(sheets.map(v => ({ ...v, app }))) : selectWorksheets,
          itemLoading: { [appId]: false },
        });
      }
    });
  };

  const expandApp = (e, app) => {
    e.stopPropagation();
    const isExpand = _.includes(expandIds, app.appId);
    const newIds = isExpand ? expandIds.filter(item => item !== app.appId) : expandIds.concat(app.appId);
    setData({ expandIds: newIds });
    !items[app.appId] && fetchItemList(app.appId);
  };

  const handleSelectApps = app => {
    const isAppChecked = !!_.find(selectApps, item => item.appId === app.appId);
    const newSelected = isAppChecked ? selectApps.filter(i => i.appId !== app.appId) : selectApps.concat(app);
    if (items[app.appId]) {
      const currentAppWorksheets = items[app.appId].map(item => ({ ...item, app }));
      const newSelectWorksheets = !isAppChecked
        ? selectWorksheets.concat(currentAppWorksheets)
        : selectWorksheets.filter(
            v =>
              !_.includes(
                currentAppWorksheets.map(i => i.workSheetId),
                v.workSheetId,
              ),
          );
      setData({ selectApps: newSelected, selectWorksheets: newSelectWorksheets });
    } else {
      setData({ selectApps: newSelected });
      fetchItemList(app.appId, { allSelect: true, app });
    }
  };

  const handleSelectWorksheets = (item, app) => {
    const isItemChecked = !!_.find(selectWorksheets, v => v.workSheetId === item.workSheetId);
    const newSelected = isItemChecked
      ? selectWorksheets.filter(v => v.workSheetId !== item.workSheetId)
      : selectWorksheets.concat({ ...item, app });
    setData({ selectWorksheets: newSelected });
  };

  useEffect(() => {
    getAppList();
  }, []);

  const renderAppList = () => {
    if (loadingApp && appPageIndex === 1 && !appList.length) {
      return <LoadDiv className="mTop20" />;
    }

    if (!appList.length) {
      return keywords ? (
        <div className="emptyText">{_l('无搜索结果')}</div>
      ) : (
        <div className="emptyText">{_l('没有可选择的应用')}</div>
      );
    }

    return (
      <ScrollView className="appList" onScrollEnd={onScrollEnd}>
        {appList.map((app, index) => {
          const isExpand = _.includes(expandIds, app.appId);
          const isAppChecked = !!_.find(selectApps, item => item.appId === app.appId);
          return (
            <React.Fragment>
              <Item key={index} onClick={() => handleSelectApps(app)}>
                <Icon
                  icon={isExpand ? 'arrow-down' : 'arrow-right-tip'}
                  className="expandIcon"
                  onClick={e => expandApp(e, app)}
                />
                <Checkbox checked={isAppChecked} />
                <div className="appIcon" style={{ backgroundColor: app.iconColor }}>
                  <SvgIcon url={app.iconUrl} fill="#fff" size={20} />
                </div>
                <div className="overflow_ellipsis">{app.appName}</div>
              </Item>
              {isExpand ? (
                itemLoading[app.appId] ? (
                  <LoadDiv size="small" />
                ) : items[app.appId] && items[app.appId].length ? (
                  items[app.appId].map(item => {
                    const isItemChecked = !!_.find(selectWorksheets, v => v.workSheetId === item.workSheetId);

                    return (
                      <Item className="isItem" onClick={() => handleSelectWorksheets(item, app)}>
                        <Checkbox className="mRight10" checked={isItemChecked} />
                        <SvgIcon url={item.iconUrl} fill={app.iconColor} size={16} />
                        <div className="overflow_ellipsis mLeft6">{item.workSheetName}</div>
                      </Item>
                    );
                  })
                ) : (
                  <div className="Gray_75 mLeft26">{_l('没有可用工作表')}</div>
                )
              ) : (
                ''
              )}
            </React.Fragment>
          );
        })}
      </ScrollView>
    );
  };

  return (
    <Dialog
      visible={true}
      type="fixed"
      width={480}
      title={title}
      okText={_l('确认')}
      onOk={() => {
        onOk(selectWorksheets);
        onClose();
      }}
      onCancel={onClose}
    >
      <ContentWrapper>
        <div className="appSearchInput">
          <Icon icon="search" className="searchIcon Font16 Gray_75" />
          <input
            type="text"
            autoFocus
            value={keywords}
            onChange={e => {
              setData({ keywords: e.target.value.trim(), appPageIndex: 1 });
              onSearch(e.target.value.trim());
            }}
            ref={searchRef}
            placeholder={_l('搜索应用名称')}
          />
          {keywords && (
            <div
              className="searchClear"
              onClick={() => {
                searchRef.current.value = '';
                setData({ keywords: '' });
                onSearch('');
              }}
            >
              <Icon type="cancel" className="Gray_9e Font16" />
            </div>
          )}
        </div>

        {renderAppList()}
      </ContentWrapper>
    </Dialog>
  );
}

export default props => FunctionWrap(SelectWorksheet, { ...props });
