import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import { Dialog, Input, ScrollView, LoadDiv, Checkbox, Icon, Button, SvgIcon, UserHead } from 'ming-ui';
import appManagementAjax from 'src/api/appManagement';
import styled from 'styled-components';
import moment from 'moment';
import _ from 'lodash';

const DialogWrap = styled(Dialog)`
  .searchWrap {
    height: 36px;
    display: flex;
    align-items: center;
    position: relative;
    margin-bottom: 20px;
    .icon {
      position: absolute;
      left: 18px;
      top: 11px;
      font-size: 16px;
      color: #757575;
    }
    input {
      flex: 1;
      border: 1px solid #f5f5f5;
      padding: 0 18px 0 42px;
      box-sizing: border-box;
      background: #f5f5f5;
      border-radius: 20px;
      margin-top: 2px;
      &:hover {
        border-color: #f0f0f0;
        background: #f0f0f0;
      }
      &:focus {
        background: #ffffff;
        border-color: #fff;
        box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.2);
      }
    }
  }
  .row {
    height: 64px;
    border-bottom: 1px solid #e0e0e0;
    &.header {
      height: unset !important;
    }
  }
  .appIcon {
    width: 38px;
    height: 38px;
    border-radius: 4px;
    margin-right: 8px;
    text-align: center;
  }
  .createTime,
  .owner {
    width: 150px;
  }
`;

const PAGE_SIZE = 50;

export default function AddAppListDialog(props) {
  const { projectId, visible, onCancel = () => {}, onOk = () => {} } = props;
  const [data, setData] = useSetState({
    appList: [],
    pageIndex: 1,
    loading: true,
    isMore,
    keyword: '',
    checkedAll: false,
    checkedList: [],
  });
  const { appList, pageIndex, loading, isMore, keyword, checkedAll, checkedList } = data;

  const getAppList = (params = {}) => {
    if (pageIndex > 1 && ((loading && isMore) || !isMore)) {
      return;
    }

    setData({ loading: true });
    appManagementAjax
      .getAppsForProject({
        projectId,
        status: '',
        order: 3,
        pageSize: PAGE_SIZE,
        pageIndex,
        keyword,
        ...params,
      })
      .then(({ apps }) => {
        const list = pageIndex > 1 ? appList.concat(apps) : apps;
        setData({
          appList: list,
          loading: false,
          pageIndex: _.get(params, 'pageIndex') ? params.pageIndex : pageIndex + 1,
          isMore: apps.length === PAGE_SIZE,
          checkedAll: checkedList.length && list.length === checkedList.length,
        });
      });
  };

  const handleSearch = _.debounce(val => {
    getAppList({ keyword: val, pageIndex: 1 });
  }, 500);

  const handleCheckedAll = checked => {
    setData({
      checkedAll: !checked,
      checkedList: checked ? [] : appList,
    });
  };

  const handleCheckedItem = (checked, item) => {
    let list = _.clone(checkedList);

    if (checked) {
      list = list.filter(v => v.appId !== item.appId);
    } else {
      list = list.concat(item);
    }

    setData({ checkedList: list, checkedAll: list.length === appList.length });
  };

  useEffect(getAppList, []);

  const windowHeight = window.innerHeight || document.body.clientHeight || document.documentElement.clientHeight;

  return (
    <DialogWrap
      width={700}
      visible={visible}
      title={_l('添加应用')}
      onCancel={onCancel}
      footer={
        <div className="flexRow alignItemsCenter">
          <div className="flex TxtLeft Font4 Gray_9e">
            {!loading && checkedList.length ? _l('已选择%0个应用', checkedList.length) : ''}
          </div>
          <Button type="link" onClick={onCancel}>
            {_l('取消')}
          </Button>
          <Button
            type="primary"
            onClick={() =>
              onOk(
                checkedList.map(({ appName, appId, iconColor, iconUrl, size = 1 }) => ({
                  name: appName,
                  color: iconColor,
                  iconUrl,
                  entityId: appId,
                  entityType: 0,
                  size,
                })),
              )
            }
          >
            {_l('确认')}
          </Button>
        </div>
      }
    >
      <div className="flexColumn" style={{ height: `${windowHeight - 236}px` }}>
        <div className="searchWrap">
          <Icon icon="search" />
          <Input
            className="flex1"
            placeholder={_l('搜索应用')}
            value={keyword}
            onChange={val => {
              setData({ keyword: val, pageIndex: 1 });
              handleSearch(val);
            }}
          />
        </div>
        {pageIndex === 1 && loading ? (
          <LoadDiv className="mTop10" />
        ) : !appList.length ? (
          <div className="mTop10 pLeft30 Gray_9e">{keyword ? _l('暂无搜索结果') : _l('暂无应用')}</div>
        ) : (
          <Fragment>
            <div className="row header flexRow alignItemsCenter pLeft10 pBottom12 Gray_75 Font14 bold">
              <Checkbox checked={checkedAll} onClick={handleCheckedAll} />
              <div className="appName mLeft10 flex">{_l('应用名称')}</div>
              <div className="createTime">{_l('创建时间')}</div>
              <div className="owner">{_l('拥有者')}</div>
            </div>
            <div className="flex">
              <ScrollView onScrollEnd={_.throttle(() => getAppList(), 500)}>
                {appList.map(item => {
                  const { appName, appId, iconColor, iconUrl, ctime, caid, createAccountInfo = {} } = item;
                  return (
                    <div key={appId} className="row flexRow alignItemsCenter pLeft10">
                      <Checkbox
                        checked={_.includes(
                          checkedList.map(v => v.appId),
                          appId,
                        )}
                        onClick={checked => handleCheckedItem(checked, item)}
                      />
                      <div className="appName mLeft10 flex flexRow alignItemsCenter">
                        <div className="appIcon" style={{ background: iconColor }}>
                          <SvgIcon url={iconUrl} fill="#fff" size={26} className="mTop6" />
                        </div>
                        <span className="flex ellipsis mRight10" title={appName}>
                          {appName}
                        </span>
                      </div>
                      <div className="createTime">{moment(ctime).format('YYYY-MM-DD')}</div>
                      <div className="owner flexRow alignItemsCenter">
                        <UserHead
                          size={28}
                          projectId={projectId}
                          user={{ userHead: createAccountInfo.avatar, accountId: caid }}
                        />
                        <div className="mLeft12 ellipsis flex mRight20">{createAccountInfo.fullName}</div>
                      </div>
                    </div>
                  );
                })}
              </ScrollView>
              {pageIndex > 1 && loading && <LoadDiv className="mTop10" />}
            </div>
          </Fragment>
        )}
      </div>
    </DialogWrap>
  );
}
