import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { LoadDiv, Dialog, Checkbox } from 'ming-ui';
import { useSetState } from 'react-use';
import cx from 'classnames';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import APITable from './APITable';
import SvgIcon from 'src/components/SvgIcon';
import { WrapFooter } from '../apiIntegration/style';
import appManagementAjax from 'src/api/appManagement';
import _ from 'lodash';
const WrapHeader = styled.div`
  .searchCon > div {
    width: 100%;
  }
`;

const Wrap = styled.div`
  p,
  h5 {
    margin: 0;
  }
  .logo {
    width: 36px;
    height: 36px;
    border-radius: 7px;
    & > div {
      margin: 0 auto;
    }
  }
  .circle {
    border-radius: 50%;
  }
  .headTr,
  .conTr {
    & > div {
      flex: 2 !important;
    }
    .name {
      flex: 3 !important;
    }
  }
`;

let Ajax = null;
export default function AddAppDialog(props) {
  const cache = useRef({ pgIndex: 1, isAll: false });
  const [{ selectedList, list, allList, pgIndex, isCheckAll, keywords, loading }, setState] = useSetState({
    show: false,
    keywords: '',
    list: [],
    allList: [],
    selectedList: [],
    loading: false,
    pgIndex: 1,
    isCheckAll: false,
  });
  useEffect(() => {
    if (!!keywords && !props.isSuperAdmin) {
      setState({
        list: allList.filter(
          o =>
            (o.appName || _.get(o, 'createAccountInfo.fullName'))
              .toLocaleLowerCase()
              .indexOf(keywords.toLocaleLowerCase()) >= 0,
        ),
      });
    } else {
      getAppList();
    }
  }, [pgIndex, keywords]);

  // 翻页滚动
  const onScroll = () => {
    if (
      loading ||
      cache.current.isAll ||
      !props.isSuperAdmin //getManagerApps全量加载的 没有翻页
    ) {
      return;
    }
    setState({
      pgIndex: cache.current.pgIndex + 1,
    });
  };
  /**
   * 获得应用列表
   */
  const getAppList = () => {
    if (Ajax) {
      Ajax.abort();
    }
    setState({ loading: true });
    Ajax = props.isSuperAdmin
      ? appManagementAjax.getAppsForProject({
          projectId: localStorage.getItem('currentProjectId'),
          status: '',
          order: 3,
          pageIndex: pgIndex,
          pageSize: 30,
          keyword: keywords,
        })
      : appManagementAjax.getManagerApps({
          projectId: localStorage.getItem('currentProjectId'),
        });
    Ajax.then(res => {
      Ajax = null;
      if (props.isSuperAdmin) {
        const { apps = [], count } = res;
        setState({
          list: pgIndex === 1 ? apps : list.concat(...apps),
          loading: false,
        });
        cache.current.pgIndex = pgIndex;
        cache.current.isAll = apps.length < 30;
      } else {
        //getManagerApps全量加载的
        setState({
          list: res || [],
          loading: false,
          allList: res || [],
        });
        cache.current.pgIndex = 1;
        cache.current.isAll = true;
      }
    });
  };

  const keys = [
    {
      key: 'checkCon',
      render: (item, selectedList, handleSelect, isCheckAll) => {
        return (
          <Checkbox
            className="mLeft5"
            size="small"
            checked={selectedList.includes(item.id) || isCheckAll}
            // onClick={() => handleSelect(item.id)}
          />
        );
      },
    },
    {
      key: 'name',
      name: _l('应用名称'),
      render: (item, selectedList, handleSelect) => {
        return (
          <div className="flexRow">
            <div
              className="logo flexRow alignItemsCenter iconWrap TxtCenter"
              style={{ backgroundColor: item.iconColor }}
            >
              <SvgIcon url={item.iconUrl} fill={'#fff'} size={28} />
            </div>
            <span className="flex mLeft10 LineHeight36 overflow_ellipsis breakAll">{item.appName}</span>
          </div>
        );
      },
    },
    {
      key: 'ctime',
      name: _l('创建时间'),
    },
    {
      key: 'owner',
      name: _l('拥有者'),
      render: (item, selectedList, handleSelect) => {
        return (
          <div className="flexRow pLeft5 alignItemsCenter">
            <img src={_.get(item, 'createAccountInfo.avatar')} className="circle" width={28} srcset="" />
            <span className="owner flex mLeft8 overflow_ellipsis breakAll">
              {_.get(item, 'createAccountInfo.fullName')}
            </span>
          </div>
        );
      },
    },
  ];
  let h = ($(window).height() > 1000 ? 1000 : $(window).height()) - 250;
  return (
    <Dialog
      className=""
      width="700"
      visible={true}
      title={<span className="Font17 Bold">{_l('选择授权应用')}</span>}
      footer={null}
      onCancel={props.onCancel}
    >
      <Wrap className="flexColumn">
        <WrapHeader>
          <div className="flex searchCon">
            <SearchInput
              placeholder={_l('搜索应用/拥有者')}
              value={keywords}
              className="search"
              onChange={v => {
                setState({
                  pgIndex: 1,
                  keywords: v,
                });
                cache.current = {
                  isAll: false,
                  pgIndex: 1,
                };
              }}
            />
          </div>
        </WrapHeader>
        <div className="table mTop10 flex">
          {loading && pgIndex === 1 ? (
            <div
              className=""
              style={{
                height: h - 150 + 47, //header 47
              }}
            >
              <LoadDiv />
            </div>
          ) : (
            <APITable
              keys={keys}
              list={list.map(o => {
                return { ...o, id: o.appId };
              })}
              count={list.length}
              selectedList={selectedList}
              onChange={selectedList => {
                setState({
                  selectedList,
                  isCheckAll: selectedList.length >= list.length,
                });
              }}
              isCheckAll={isCheckAll}
              onCheck={checked => {
                setState({
                  selectedList: checked ? list.map(o => o.appId) : [],
                  isCheckAll: checked,
                });
              }}
              loading={loading}
              onScrollEnd={onScroll}
              keywords={keywords}
              maxHeight={h - 150}
              minHeight={h - 150}
              noDataIcon={'admin-apps'}
              noDataTxt={!keywords ? null : _l('无匹配的结果，换一个关键词试试吧')}
            />
          )}
        </div>
        <WrapFooter className="flexRow alignItemsCenter Gray_75 TxtLeft mTop24">
          <span className="flex">{_l('已选择 %0 应用', isCheckAll ? list.length : selectedList.length)}</span>
          <span className="cancel Hand Font14" onClick={props.onCancel}>
            {_l('取消')}
          </span>
          <div
            className={cx('btn Bold Font14', { disable: selectedList.length <= 0 && !isCheckAll })}
            onClick={e => {
              if (selectedList.length <= 0 && !isCheckAll) {
                return;
              }
              e.stopPropagation();
              props.onOk(isCheckAll ? list.map(o => o.appId) : selectedList);
            }}
          >
            {_l('确定')}
          </div>
        </WrapFooter>
      </Wrap>
    </Dialog>
  );
}
