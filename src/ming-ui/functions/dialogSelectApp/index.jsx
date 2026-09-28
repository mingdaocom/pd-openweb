import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv, ScrollView, SvgIcon, UserHead } from 'ming-ui';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import useFunctionWrapComponent from 'ming-ui/hooks/useFunctionWrapComponent';
import appManagementApi from 'src/api/appManagement';

const AppDialogContent = styled.div`
  height: calc(100vh - 190px);
  min-height: 0;
  .addAppWrapper {
    display: flex;
    flex-direction: column;
    height: 100%;
    .headTr {
      display: flex;
      height: 48px;
      line-height: 48px;
      margin-top: 5px;
      font-size: 14px;
      font-weight: 600;
      color: var(--color-text-secondary);
      border-bottom: 1px solid var(--color-border-secondary);
    }
    .checkColumn {
      width: 35px;
    }
    .name {
      flex: 1;
      margin-right: 25px;
      flex-shrink: 0;
      min-width: 0;
    }
    .createTime {
      width: 160px;
    }
    .owner {
      width: 160px;
      align-items: center;
      display: flex;
      img {
        vertical-align: top;
      }
    }
    .noDataContent {
      flex: 1;
      display: flex;
      justify-content: center;
      align-items: center;
      color: var(--color-text-disabled);
      font-size: 14px;
    }
    .appListWrapper {
      flex: 1;
      .dataItem {
        display: flex;
        height: 64px;
        line-height: 64px;
        border-bottom: 1px solid var(--color-border-secondary);
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
`;

const RESULT_IS_DATA = ['getManagerApps', 'getUserApp', 'getMyApp'];
const NO_PAGE = ['getManagerApps', 'getUserApp', 'getMyApp'];
const EMPTY_OBJECT = {};
const identity = value => value;

const onSort = data => data.sort((a, b) => new Date(b.ctime) - new Date(a.ctime));

/** 应用多选弹层内容，选择结果同步给命令式弹层底栏。 */
const SelectApp = props => {
  const {
    projectId,
    unionId = undefined,
    unique = false,
    ajaxFun = 'getAppsForProject',
    ajaxParam,
    externParam = EMPTY_OBJECT,
    filterFun = identity,
    onSelectionChange,
  } = props;
  const [appList, setAppList] = useState([]);
  const [fetchState, setFetchState] = useSetState({
    pageIndex: 1,
    loading: true,
    noMore: false,
    keyWords: '',
  });
  const [selectedApps, setSelectedApps] = useState([]);

  const getProjectAppList = useCallback(() => {
    if (!fetchState.loading) return;
    appManagementApi[ajaxFun](
      ajaxParam || {
        projectId,
        status: '',
        order: 3,
        pageSize: 50,
        unionId,
        pageIndex: fetchState.pageIndex,
        keyword: fetchState.keyWords,
        ...externParam,
      },
    ).then(res => {
      const apps = RESULT_IS_DATA.includes(ajaxFun) ? res : res.apps;
      const list = NO_PAGE.includes(ajaxFun) ? onSort(apps.filter(filterFun)) : apps.filter(filterFun);
      setAppList(currentAppList => (fetchState.pageIndex > 1 ? currentAppList.concat(list) : list));
      setFetchState({ loading: false, noMore: apps.length < 50 || NO_PAGE.includes(ajaxFun) });
    });
  }, [ajaxFun, ajaxParam, externParam, fetchState, filterFun, projectId, setFetchState, unionId]);

  useEffect(() => {
    onSelectionChange(selectedApps);
  }, [onSelectionChange, selectedApps]);

  useEffect(() => {
    if (NO_PAGE.includes(ajaxFun) && !!appList.length) return;

    getProjectAppList();
  }, [ajaxFun, appList.length, fetchState.keyWords, fetchState.loading, fetchState.pageIndex, getProjectAppList]);

  const onSearch = useMemo(
    () =>
      _.debounce(value => {
        setFetchState(
          NO_PAGE.includes(ajaxFun) ? { keyWords: value } : { loading: true, pageIndex: 1, keyWords: value },
        );
      }, 500),
    [ajaxFun, setFetchState],
  );

  useEffect(() => () => onSearch.cancel(), [onSearch]);

  const columns = [
    {
      dataIndex: 'checkColumn',
      title: '',
      renderTitle: () => {
        return (
          <Checkbox
            className="pLeft8"
            disabled={unique}
            checked={selectedApps.length === appList.length && !!appList.length}
            onChange={event => setSelectedApps(!event.target.checked ? [] : appList)}
            size="small"
          />
        );
      },
      render: item => {
        return (
          <Checkbox
            className="pLeft8"
            checked={!!selectedApps.filter(app => app.appId === item.appId).length}
            onChange={event =>
              setSelectedApps(
                !event.target.checked
                  ? selectedApps.filter(app => app.appId !== item.appId)
                  : unique
                    ? [item]
                    : selectedApps.concat([item]),
              )
            }
            size="small"
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
        return (
          <div className="flexRow alignItemsCenter">
            <UserHead
              user={{
                userHead: item.createAccountInfo.avatar,
                accountId: item.createAccountInfo.accountId,
              }}
              size={28}
            />
            <div className="mLeft10 flex ellipsis">
              {item.createAccountInfo.fullName || item.createAccountInfo.fullname}
            </div>
          </div>
        );
      },
    },
  ];

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageIndex: fetchState.pageIndex + 1 });
    }
  };

  return (
    <AppDialogContent>
      <div className="addAppWrapper">
        <Input
          allowClear
          radius
          variant="filled"
          placeholder={_l('搜索应用')}
          prefix={<Icon icon="search" className="textTertiary Font18" />}
          onChange={event => onSearch(event.target.value)}
        />
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
            {appList
              .filter(
                item =>
                  !NO_PAGE.includes(ajaxFun) || item.appName?.toLowerCase().includes(fetchState.keyWords.toLowerCase()),
              )
              .map((appItem, i) => {
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
    </AppDialogContent>
  );
};

function SelectAppDialog({
  visible,
  title,
  overlayClosable,
  okButtonProps,
  extraFooter,
  zIndex,
  onOk,
  onClose,
  ...options
}) {
  const [selectedApps, setSelectedApps] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const handleConfirm = async () => {
    if (submitting) return;

    setSubmitting(true);

    try {
      if (_.isFunction(onOk)) {
        await onOk(selectedApps);
      }

      onClose();
    } catch (error) {
      setSubmitting(false);
      throw error;
    }
  };

  return (
    <Modal
      open={visible}
      title={title ?? _l('选择应用')}
      width={700}
      zIndex={zIndex}
      mask={{ closable: overlayClosable !== false }}
      okText={_l('确定')}
      cancelText={_l('取消')}
      okButtonProps={{ ...okButtonProps, disabled: !selectedApps.length, loading: submitting }}
      footerLeftElement={
        <div className="minWidth0 flexRow alignItemsCenter">
          {!!selectedApps.length && (
            <div className="textTertiary Font14 mRight20">{_l('已选择%0个应用', selectedApps.length)}</div>
          )}
          {extraFooter}
        </div>
      }
      onOk={handleConfirm}
      onCancel={onClose}
    >
      <SelectApp {...options} onSelectionChange={setSelectedApps} />
    </Modal>
  );
}

export function useSelectAppDialog() {
  return useFunctionWrapComponent(SelectAppDialog);
}

export function dialogSelectApp(options = {}) {
  let modal;
  let selectedApps = [];
  const handlePopState = () => modal.destroy();

  const handleCancel = () => {
    if (_.isFunction(options.onClose)) {
      options.onClose();
    }
  };

  const handleConfirm = () => {
    const result = _.isFunction(options.onOk) ? options.onOk(selectedApps) : undefined;

    if (result && _.isFunction(result.then)) {
      return result.then(value => {
        handleCancel();
        return value;
      });
    }

    handleCancel();
    return result;
  };

  const renderFooterLeftElement = () => (
    <div className="minWidth0 flexRow alignItemsCenter">
      {!!selectedApps.length && (
        <div className="textTertiary Font14 mRight20">{_l('已选择%0个应用', selectedApps.length)}</div>
      )}
      {options.extraFooter}
    </div>
  );

  const handleSelectionChange = apps => {
    selectedApps = apps;
    modal.update({ okButtonProps: { ...options.okButtonProps, disabled: !selectedApps.length } });
  };

  modal = Modal.info({
    afterClose: () => window.removeEventListener('popstate', handlePopState),
    centered: true,
    cancelText: _l('取消'),
    content: <SelectApp {...options} onSelectionChange={handleSelectionChange} />,
    footerLeftElement: renderFooterLeftElement,
    mask: { closable: options.overlayClosable !== false },
    okButtonProps: { ...options.okButtonProps, disabled: true },
    okCancel: true,
    okText: _l('确定'),
    onCancel: handleCancel,
    onOk: handleConfirm,
    title: options.title ?? _l('选择应用'),
    width: 700,
    zIndex: options.zIndex,
  });

  window.addEventListener('popstate', handlePopState);

  return modal;
}

export default dialogSelectApp;
