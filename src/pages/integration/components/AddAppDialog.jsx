import React, { useEffect, useRef } from 'react';
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
import { getCurrentProject } from 'src/util';

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
  const { projectId } = props;
  const { isProjectAppManager, isSuperAdmin } = getCurrentProject(projectId);
  const isAdmin = isProjectAppManager || isSuperAdmin;
  const h = ($(window).height() > 1000 ? 1000 : $(window).height()) - 250;
  const [{ loading, list, pageIndex, keywords, isMore, selectedList, isCheckAll }, setState] = useSetState({
    loading: true,
    list: [],
    pageIndex: 1,
    keywords: '',
    isMore: false,
    selectedList: [],
    isCheckAll: false,
  });

  // 翻页滚动
  const onScroll = () => {
    if (loading || !isMore || !isAdmin) {
      return;
    }

    setState({
      loading: true,
      pageIndex: pageIndex + 1,
    });
  };

  // 获得应用列表
  const getAppList = () => {
    if (Ajax) {
      Ajax.abort();
    }

    setState({ loading: true });

    Ajax = isAdmin
      ? appManagementAjax.getAppsForProject({
          projectId,
          status: '',
          order: 3,
          pageIndex: pageIndex,
          pageSize: 30,
          keyword: keywords,
        })
      : appManagementAjax.getManagerApps({
          projectId,
        });

    Ajax.then(res => {
      Ajax = null;

      if (isAdmin) {
        const { apps = [] } = res;
        setState({
          list: pageIndex === 1 ? apps : list.concat(...apps),
          pageIndex,
          loading: false,
          isMore: apps.length >= 30,
        });
      } else {
        setState({
          list: res || [],
          loading: false,
          isMore: false,
        });
      }
    });
  };

  // 获取source列表
  const getSourceList = list => {
    if (!!keywords && !isAdmin) {
      return list.filter(
        o =>
          o.appName.toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0 ||
          _.get(o, 'createAccountInfo.fullName').toLocaleLowerCase().indexOf(keywords.toLocaleLowerCase()) >= 0,
      );
    }

    return list;
  };

  useEffect(() => {
    !isAdmin && getAppList();
  }, []);

  useEffect(() => {
    isAdmin && getAppList();
  }, [pageIndex, keywords]);

  const keys = [
    {
      key: 'checkCon',
      render: (item, selectedList, handleSelect, isCheckAll) => {
        return <Checkbox className="mLeft5" size="small" checked={selectedList.includes(item.id) || isCheckAll} />;
      },
    },
    {
      key: 'name',
      name: _l('应用名称'),
      render: item => {
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
      render: item => {
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

  const sourceList = getSourceList(list);

  return (
    <Dialog
      width="700"
      visible
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
                setState({ pageIndex: 1, keywords: v });
              }}
            />
          </div>
        </WrapHeader>
        <div className="table mTop10 flex">
          {loading && pageIndex === 1 ? (
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
              list={sourceList.map(o => {
                return { ...o, id: o.appId };
              })}
              count={sourceList.length}
              selectedList={selectedList}
              onChange={selectedList => {
                setState({
                  selectedList,
                  isCheckAll: selectedList.length >= sourceList.length,
                });
              }}
              isCheckAll={isCheckAll}
              onCheck={checked => {
                setState({
                  selectedList: checked ? sourceList.map(o => o.appId) : [],
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
          <span className="flex">{_l('已选择 %0 应用', isCheckAll ? sourceList.length : selectedList.length)}</span>
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
              props.onOk(isCheckAll ? sourceList.map(o => o.appId) : selectedList);
            }}
          >
            {_l('确定')}
          </div>
        </WrapFooter>
      </Wrap>
    </Dialog>
  );
}
