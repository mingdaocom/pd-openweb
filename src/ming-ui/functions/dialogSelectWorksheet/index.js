import React, { useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, SvgIcon } from 'ming-ui';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import appManagementAjax from 'src/api/appManagement';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { canSelectAppWorksheets, getAppSelectionState, toggleAppWorksheets, toggleWorksheet } from './selection';

const ContentWrapper = styled.div`
  height: calc(100vh - 190px);
  min-height: 0;
  display: flex;
  flex-direction: column;
  .emptyText {
    flex: 1;
    display: flex;
    justify-content: center;
    align-items: center;
    color: var(--color-text-secondary);
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
    color: var(--color-text-tertiary);
    cursor: pointer;
    &:hover {
      color: var(--color-primary);
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
    background: var(--color-background-hover);
  }
  &.disabled {
    cursor: not-allowed;
    color: var(--color-text-disabled);
    &:hover {
      background: transparent;
    }
    .appIcon {
      opacity: 0.5;
    }
  }
`;

function SelectWorksheet(props) {
  const { projectId, onSelectionChange } = props;
  const onSearch = useRef();
  const [
    { keywords, expandIds, items, selectWorksheets, appPageIndex, loadingApp, isMoreApp, appList, itemLoading },
    setData,
  ] = useSetState({
    keywords: undefined,
    expandIds: [],
    items: {},
    selectWorksheets: [],
    appPageIndex: 1,
    loadingApp: true,
    isMoreApp: false,
    appList: [],
    itemLoading: {},
  });
  const appPromise = useRef(null);
  const appRequestId = useRef(0);
  const appState = useRef({ appPageIndex, appList, isMoreApp, loadingApp, keywords });

  useEffect(() => {
    onSelectionChange(selectWorksheets);
  }, [onSelectionChange, selectWorksheets]);

  useEffect(() => {
    appState.current = { appPageIndex, appList, isMoreApp, loadingApp, keywords };
  }, [appList, appPageIndex, isMoreApp, keywords, loadingApp]);

  const getAppList = useCallback(
    (params = {}) => {
      const { appPageIndex, appList, isMoreApp, loadingApp, keywords } = appState.current;
      const keyword = typeof params.keyword === 'string' ? params.keyword : keywords;

      if (appPageIndex > 1 && ((loadingApp && isMoreApp) || !isMoreApp)) {
        return;
      }

      appState.current = { ...appState.current, loadingApp: true };
      setData({ loadingApp: true });
      if (appPromise.current) {
        appPromise.current.abort();
      }

      const requestId = ++appRequestId.current;
      const pageIndex = params.appPageIndex || appPageIndex;
      appPromise.current = appManagementAjax.getAppsByProject({
        projectId,
        status: '',
        order: 3,
        pageIndex,
        pageSize: 50,
        keyword,
      });

      appPromise.current
        .then(({ apps = [] }) => {
          if (requestId !== appRequestId.current) return;
          const nextAppList = pageIndex === 1 ? apps : appList.concat(apps);
          appState.current = {
            ...appState.current,
            appList: nextAppList,
            isMoreApp: apps.length >= 50,
            loadingApp: false,
            appPageIndex: pageIndex,
            keywords: keyword,
          };
          setData({
            appList: nextAppList,
            isMoreApp: apps.length >= 50,
            loadingApp: false,
            appPageIndex: pageIndex,
          });
        })
        .catch(() => {
          if (requestId !== appRequestId.current) return;
          appState.current = { ...appState.current, loadingApp: false };
          setData({ loadingApp: false });
        });
    },
    [projectId, setData],
  );

  const onScrollEnd = () => {
    if (isMoreApp && !loadingApp) {
      getAppList({ appPageIndex: appPageIndex + 1, keyword: keywords });
    }
  };

  useEffect(() => {
    onSearch.current = _.debounce(value => {
      getAppList({ appPageIndex: 1, keyword: value });
    }, 500);

    return () => onSearch.current && onSearch.current.cancel();
  }, [getAppList]);

  const fetchItemList = (appId, { allSelect, app } = {}) => {
    setData(previous => ({ itemLoading: { ...previous.itemLoading, [appId]: true } }));
    appManagementAjax
      .getAppItems({ appIds: [appId], isFilterCustomPage: true, projectId })
      .then(res => {
        const sheets = (res && res[appId]) || [];
        setData(previous => ({
          items: { ...previous.items, [appId]: sheets },
          selectWorksheets: allSelect
            ? toggleAppWorksheets({ worksheets: sheets, selectedWorksheets: previous.selectWorksheets, app })
            : previous.selectWorksheets,
          itemLoading: { ...previous.itemLoading, [appId]: false },
        }));
      })
      .catch(() => {
        setData(previous => ({ itemLoading: { ...previous.itemLoading, [appId]: false } }));
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
    if (items[app.appId]) {
      setData(previous => ({
        selectWorksheets: toggleAppWorksheets({
          worksheets: previous.items[app.appId] || [],
          selectedWorksheets: previous.selectWorksheets,
          app,
        }),
      }));
    } else {
      fetchItemList(app.appId, { allSelect: true, app });
    }
  };

  const handleSelectWorksheets = (item, app) => {
    setData(previous => ({ selectWorksheets: toggleWorksheet(previous.selectWorksheets, item, app) }));
  };

  useEffect(() => {
    getAppList();
  }, [getAppList]);

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
          const worksheets = items[app.appId];
          const appSelectionState = getAppSelectionState(worksheets, selectWorksheets);
          const appSelectable = canSelectAppWorksheets(worksheets);
          return (
            <React.Fragment>
              <Item
                key={index}
                className={appSelectable ? '' : 'disabled'}
                onClick={() => appSelectable && handleSelectApps(app)}
              >
                <Icon
                  icon={isExpand ? 'arrow-down' : 'arrow-right-tip'}
                  className="expandIcon"
                  onClick={e => expandApp(e, app)}
                />
                <Checkbox
                  checked={appSelectionState.checked}
                  disabled={!appSelectable}
                  indeterminate={appSelectionState.indeterminate}
                />
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
                  <div className="textSecondary mLeft26">{_l('没有可用工作表')}</div>
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
    <ContentWrapper>
      <Input
        allowClear
        autoFocus
        radius
        variant="filled"
        value={keywords || ''}
        placeholder={_l('搜索应用名称')}
        prefix={<Icon icon="search" className="textTertiary Font18" />}
        onChange={event => {
          const value = event.target.value.trim();
          setData({ keywords: value, appPageIndex: 1 });
          if (onSearch.current) onSearch.current(value);
        }}
      />

      {renderAppList()}
    </ContentWrapper>
  );
}

export function dialogSelectWorksheet(options = {}) {
  let modal;
  let selectedWorksheets = [];
  const handlePopState = () => !browserIsMobile() && modal.destroy();

  const handleCancel = () => {
    if (_.isFunction(options.onClose)) {
      options.onClose();
    }
  };

  const handleConfirm = () => {
    const result = _.isFunction(options.onOk) ? options.onOk(selectedWorksheets) : undefined;

    if (result && _.isFunction(result.then)) {
      return result.then(value => {
        handleCancel();
        return value;
      });
    }

    handleCancel();
    return result;
  };

  const renderFooterLeftElement = () =>
    options.extraFooter ||
    (!!selectedWorksheets.length && (
      <div className="textTertiary">{_l('已选择%0个工作表', selectedWorksheets.length)}</div>
    ));

  const handleSelectionChange = worksheets => {
    selectedWorksheets = worksheets;
    modal.update({ okButtonProps: { ...options.okButtonProps, disabled: !selectedWorksheets.length } });
  };

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    cancelText: _l('取消'),
    content: <SelectWorksheet {...options} onSelectionChange={handleSelectionChange} />,
    footerLeftElement: renderFooterLeftElement,
    mask: { closable: options.overlayClosable !== false },
    okButtonProps: { ...options.okButtonProps, disabled: true },
    okCancel: true,
    okText: _l('确认'),
    onCancel: handleCancel,
    onOk: handleConfirm,
    title: options.title ?? _l('选择工作表'),
    width: 520,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectWorksheet;
