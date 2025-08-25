import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import collectRecordEmptyPng from 'staticfiles/images/collect_list.png';
import styled from 'styled-components';
import { Icon, ScrollView, SortableList, SvgIcon } from 'ming-ui';
import favoriteApi from 'src/api/favorite.js';
import { openRecordInfo } from 'worksheet/common/recordInfo';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { addBehaviorLog } from 'src/utils/project';
import Item from './Item';
import './index.less';

const BaseBtnCon = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  z-index: 2;
  &:hover {
    background: #f5f5f5;
  }
`;
const Con = styled.div`
  flex: 1;
  display: flex;
  min-width: 0;
  box-sizing: border-box;
  ${({ forCard }) => !forCard && 'padding: 24px 0;'}
  width: 100%;
  height: 100%;
  background: #ffffff;
  .openNavIcon {
    position: absolute;
    left: 24px;
    top: 24px;
    width: 32px;
    height: 32px;
    transition: width 0.3s;
    &.hide {
      width: 0;
    }
  }
  .content {
    overflow: auto;
    min-width: 0;
    .con {
      .scrollList {
        overflow: auto;
      }
      .scrollViewContainer,
      .hed {
        min-width: 300px;
        margin: 0 auto;
        width: 100%;
        max-width: 1600px;
      }
      .hed {
        ${({ forCard }) => !forCard && 'padding: 0 76px;'}
      }
      .scrollViewContainer {
        ${({ forCard }) => !forCard && 'padding: 0 80px;'}
      }
    }
    .nullCon {
      font-weight: 400;
      color: #757575;
      line-height: 20px;
      &.empty {
        text-align: center;
        padding-top: 100px;
        img {
          width: 100px;
          height: 100px;
        }
      }
    }
  }
  .rowDivider {
    height: 1px;
    background: #ddd;
    margin: 16px 0;
  }
`;
const NavCon = styled.div`
  width: 214px;
  transition: width 0.2s;
  margin-left: 24px;
  &.closeCon {
    width: 0;
    margin-left: 0;
  }
  max-height: 100%;
  overflow: hidden;
  .headC {
    width: 190px;
  }
  .navSkeleton {
    width: 162px;
    margin: 0 auto;
  }
  .navListLi {
    width: 190px;
    height: 36px;
    padding: 0 14px;
    &.isCur,
    &:hover {
      background: #eaf4fe;
      border-radius: 5px 5px 5px 5px;
    }
    .itemIcon {
      width: 24px;
      height: 24px;
      border-radius: 5px 5px 5px 5px;
      svg {
        display: block;
      }
    }
  }
  .navList {
    min-width: 0;
  }
`;
const Cell = styled.div`
  ${({ width }) => (width ? `width: ${width}px;` : 'width: 100%;')}
  height:   ${({ height }) => (height ? `${height}px;` : '17px')};
  border-radius: ${({ height }) => (!height ? `17px;` : '3px')};
  background-color: #f5f5f5;
  margin: ${({ forCard }) => (forCard ? `16px 0` : '25px 0 0 0')};
`;

let request;
let currentProjectId;

function RecordFav(props) {
  const { projectId } = props;
  const [{ loading, navloading, openNav, keywords, recordListAll, recordList, topList, favApps, appId }, setState] =
    useSetState({
      loading: props.loading || true,
      navloading: true,
      openNav: localStorage.getItem('recordFavIsFolded') === '1',
      keywords: '',
      recordListAll: [],
      recordList: [],
      topList: [],
      favApps: [],
      appId: 'all',
      record: {},
    });

  useEffect(() => {
    getAllList();
  }, []);

  useEffect(() => {
    if ((props.loading !== loading && props.loading) || currentProjectId !== props.projectId) {
      onRefresh();
    }
  }, [props.loading, props.projectId]);

  useEffect(() => {
    const list = getList();
    setState({ recordList: list.filter(item => !item.isTop), topList: list.filter(item => item.isTop) });
  }, [keywords, appId]);

  const getList = data => {
    return (data || recordListAll)
      .filter(
        o =>
          (o.title || '').toLowerCase().indexOf((keywords || '').toLowerCase()) >= 0 &&
          (appId === 'all' ? true : o.appId === appId),
      )
      .map(o => {
        return { ...o, rowid: o.rowId };
      });
  };
  const getAllList = () => {
    if (request) {
      request.abort();
    }
    currentProjectId = props.projectId;
    request = favoriteApi.getAllFavorites({
      projectId,
      isRefresh: 1,
    });
    request.then(res => {
      const groupedData = res.reduce((acc, item) => {
        const { appId } = item;
        if (!acc[appId]) {
          acc[appId] = [];
        }
        acc[appId].push(item);
        return acc;
      }, {});
      const list = getList(res.map(o => ({ ...o, rowid: o.rowId })));
      setState({
        recordListAll: res,
        recordList: list.filter(item => !item.isTop),
        topList: list.filter(item => item.isTop),
        favApps: Object.values(groupedData),
        navloading: false,
        loading: false,
      });
    });
  };
  const onSearch = value => {
    setState({ keywords: value });
  };
  const renderSkeleton = height => {
    return (
      <div className={cx({ 'pLeft16 pRight16': props.forCard })}>
        {Array.from({ length: 3 }).map((_, index) => (
          <Cell key={index} height={height} forCard={props.forCard} />
        ))}
      </div>
    );
  };
  const renderNav = () => {
    const renderNavItem = o => {
      return (
        <div
          className={cx('flexRow navListLi alignItemsCenter Hand', { isCur: o.appId === appId })}
          onClick={() => {
            setState({ appId: o.appId });
          }}
        >
          <div
            className={cx('itemIcon flexRow alignItemsCenter justifyContentCenter', {
              isA: o.appId === appId,
            })}
            style={{ backgroundColor: o.appId === 'all' ? '#151515' : o.appColor }}
          >
            <SvgIcon
              url={o.appId === 'all' ? 'https://fp1.mingdaoyun.cn/customIcon/sys_10_5_star.svg' : o.appIconUrl}
              fill={'#fff'}
              size={15}
            />
          </div>
          <div className="appName overflow_ellipsis mLeft10 flex">{o.appId === 'all' ? _l('全部') : o.appName}</div>
        </div>
      );
    };
    return (
      <React.Fragment>
        <div className={cx('openNavIcon', { hide: openNav })}>
          <BaseBtnCon
            onClick={() => {
              safeLocalStorageSetItem('recordFavIsFolded', '1');
              setState({ openNav: true });
            }}
          >
            <Icon className="Font20 Gray_75 Hand " icon="menu" />
          </BaseBtnCon>
        </div>
        <NavCon className={cx('navCon', { closeCon: !openNav })}>
          {openNav && (
            <React.Fragment>
              {navloading ? (
                <div className="navSkeleton">{renderSkeleton()}</div>
              ) : (
                <div className="flexColumn h100">
                  <div className="headC flexRow">
                    <span className="flex Font20 Bold mLeft15">{_l('收藏')}</span>
                    <BaseBtnCon
                      onClick={() => {
                        safeLocalStorageSetItem('recordFavIsFolded', '');
                        setState({ openNav: false });
                      }}
                    >
                      <Icon className="Font20 Gray_75 Hand" icon="menu_left" />
                    </BaseBtnCon>
                  </div>
                  <div className="mTop20">{renderNavItem({ appId: 'all' })}</div>
                  {favApps.length > 0 && (
                    <React.Fragment>
                      <div className="Font15 Bold mLeft15 mTop30">{_l('按应用')}</div>
                      <ScrollView className="navList flex mTop15 pRight24">
                        {[...favApps.map(o => o[0])].map(o => {
                          return <div className="mBottom10">{renderNavItem(o)}</div>;
                        })}
                      </ScrollView>
                    </React.Fragment>
                  )}
                </div>
              )}
            </React.Fragment>
          )}
        </NavCon>
      </React.Fragment>
    );
  };
  const nullCon = () => {
    if (keywords) {
      return <div className="nullCon mTop40">{_l('无搜索结果')}</div>;
    }
    return (
      <div className={!props.forCard ? 'nullCon empty' : 'emptyWrapper'}>
        <img src={collectRecordEmptyPng} />
        <span className={!props.forCard ? 'mTop30 Gary Font15 Block' : ''}>{_l('没有收藏')}</span>
      </div>
    );
  };
  const onRefresh = isClear => {
    isClear &&
      setState({
        recordListAll: [],
        recordList: [],
        topList: [],
        favApps: [],
        keywords: '',
      });
    setState({
      navloading: true,
      loading: true,
    });
    getAllList();
  };
  const onDel = info => {
    const { worksheetId, rowId, viewId } = info;
    favoriteApi
      .removeFavorite({
        projectId,
        rowId,
        worksheetId,
        viewId,
      })
      .then(res => {
        if (res) {
          onRefresh();
        } else {
          alert(_l('操作失败，稍后再试'), 3);
        }
      });
  };
  const getRowInfo = info => {
    const { rowId, viewId, worksheetId, appId } = info;
    addBehaviorLog('worksheetRecord', worksheetId, { rowId });
    openRecordInfo({
      appId,
      worksheetId,
      recordId: rowId,
      viewId,
      // onClose: () => onRefresh(),
      currentSheetRows: topList.concat(recordList),
      showPrevNext: true,
      currentIndex: rowId,
      projectId,
    });
  };

  const onUpdateFavoriteTop = (favoriteId, isTop) => {
    favoriteApi.updateFavoriteTop({ projectId, favoriteId, isTop }).then(res => {
      if (res) {
        alert(isTop ? _l('置顶成功') : _l('取消置顶成功'));
        onRefresh();
      } else {
        alert(isTop ? _l('置顶失败') : _l('取消置顶失败'), 2);
      }
    });
  };

  const onUpdateTopSort = newItems => {
    const favoriteIds = newItems.map(item => item.favoriteId);
    favoriteApi.updateFavoriteTopSort({ projectId, favoriteIds }).then(res => {
      if (res) {
        setState({ recordListAll: newItems.concat(recordList), topList: newItems });
      }
    });
  };

  const renderCon = () => {
    const list = (
      <React.Fragment>
        {recordListAll.length <= 0 ? (
          nullCon()
        ) : (
          <React.Fragment>
            <SortableList
              useDragHandle
              items={topList}
              canDrag={appId === 'all'}
              renderItem={({ item, DragHandle }) => (
                <Item
                  {...item}
                  forCard={props.forCard}
                  remove={() => onDel(item)}
                  onShowRecord={() => {
                    getRowInfo(item);
                  }}
                  DragHandle={DragHandle}
                  canDrag={appId === 'all'}
                  isTop={true}
                  onUpdateFavoriteTop={() => onUpdateFavoriteTop(item.favoriteId, false)}
                />
              )}
              itemKey="favoriteId"
              helperClass={cx('recordSortItemHelper', { forCard: props.forCard })}
              onSortEnd={onUpdateTopSort}
            />
            {!props.forCard && appId === 'all' && !!topList.length && <div className="rowDivider" />}
            {recordList.map(item => (
              <Item
                {...item}
                forCard={props.forCard}
                remove={() => onDel(item)}
                onShowRecord={() => {
                  getRowInfo(item);
                }}
                onUpdateFavoriteTop={() => onUpdateFavoriteTop(item.favoriteId, true)}
              />
            ))}
          </React.Fragment>
        )}
      </React.Fragment>
    );

    return (
      <div className={cx('content flex', { overflowHidden: !props.forCard })}>
        <div className="con flexColumn h100">
          {!props.forCard && (
            <React.Fragment>
              <div className="flexRow alignItemsCenter hed">
                <SearchInput
                  className="searchCon mRight10"
                  placeholder={_l('搜索')}
                  value={keywords}
                  onChange={onSearch}
                />
                <BaseBtnCon
                  onClick={() => {
                    onRefresh();
                  }}
                >
                  <Icon className="Font20 Gray_9e Hand" icon="refresh1" />
                </BaseBtnCon>
              </div>
              <ScrollView className="flex">{loading ? renderSkeleton(50) : list}</ScrollView>
            </React.Fragment>
          )}

          {props.forCard && (loading ? renderSkeleton(24) : list)}
        </div>
      </div>
    );
  };
  return (
    <Con className={cx('flexRow Relative', props.className)} forCard={props.forCard}>
      {!props.forCard && renderNav()}
      {renderCon()}
    </Con>
  );
}

export default RecordFav;
