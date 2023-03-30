import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import OptionColumn from './OptionColumn';
import AddOrEditSource from '../AddOrEditSource';
import { ROLE_TYPE, DETAIL_TYPE, ROLE_TYPE_TAB_LIST, FROM_TYPE_TAB_LIST, DATABASE_TYPE } from '../../../constant';
import { formatDate } from '../../../../config';
import dataSourceApi from '../../../../api/datasource';

const FilterContent = styled.div`
  margin-top: 16px;
  .searchInput {
    width: 360px;
    min-width: 360px;
    height: 36px;
  }
  .filterIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    font-size: 24px;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    margin-left: 24px;
    color: #9e9e9e;
    cursor: pointer;

    &:hover {
      color: #2196f3;
      background: #f5f5f5;
    }
    &.isActive {
      color: #2196f3;
      background: rgba(33, 150, 243, 0.07);
    }
  }
`;

const RedDot = styled.div`
  position: absolute;
  top: 2px;
  right: 2px;
  width: 6px;
  height: 6px;
  border-radius: 100%;
  background-color: red;
`;

const FilterItem = styled.div`
  display: flex;
  height: 36px;
  overflow: hidden;

  &.isExpand {
    overflow: visible !important;
    height: auto;
  }

  .itemText {
    min-width: 70px;
    font-size: 13px;
    color: #757575;
    font-weight: 600;
    padding: 8px 0;
  }

  ul {
    position: relative;
    padding-right: 28px;
    li {
      display: inline-block;
      padding: 0 15px;
      margin: 4px 0 4px 8px;
      height: 28px;
      box-sizing: border-box;
      border: 1px solid #e0e0e0;
      border-radius: 20px;
      cursor: pointer;
      line-height: 26px;
      font-size: 12px;
      color: #333;

      &.isActive {
        font-weight: 600;
        color: #2196f3;
      }
      &:hover {
        border-color: #ccc;
      }
      &::before {
        display: block;
        content: attr(title);
        font-weight: 600;
        visibility: hidden;
        overflow: hidden;
        height: 0;
      }
    }
  }

  .expandIcon {
    position: absolute;
    width: 28px;
    height: 28px;
    display: flex;
    justify-content: center;
    align-items: center;
    border-radius: 14px;
    top: 5px;
    right: 0;
    color: #bdbdbd;
    cursor: pointer;

    &:hover {
      color: #2196f3;
      background: #f5f5f5;
    }
  }
`;

const SourceListBox = styled.div`
  .headTr {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 8px 0;
    border-bottom: 1px solid #e0e0e0;

    .sortIcon {
      color: #bfbfbf;
      height: 8px;

      &.selected {
        color: #2196f3;
      }
    }
  }

  .dataItem {
    display: flex;
    align-items: center;
    margin: 0;
    padding: 12px 0;
    border-bottom: 1px solid #e0e0e0;

    .titleText,
    .taskNum {
      font-size: 14px;
      font-weight: 700;
    }

    &:hover {
      background: rgba(247, 247, 247, 1);
      .titleText {
        color: #2196f3;
      }
      .optionIcon {
        background: rgba(247, 247, 247, 1);
      }
    }

    .titleIcon {
      display: inline-flex;
      justify-content: center;
      align-items: center;
      width: 32px;
      height: 32px;
      border-radius: 16px;
      margin-right: 8px;
      font-size: 16px;
      min-width: 32px;
      .svg-icon {
        width: 20px;
        height: 20px;
      }
    }
  }

  .optionIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #9e9e9e;
    background: #fff;

    &:hover {
      color: #2196f3;
      background: #fff !important;
    }
  }

  .name,
  .address {
    padding-right: 8px;
    width: 0;
  }

  .name {
    flex: 6;
  }
  .createTime {
    flex: 4;
  }
  .address,
  .roleType,
  .taskNum {
    flex: 2;
  }
  .option {
    flex: 1;
  }
`;

const NoDataWrapper = styled.div`
  text-align: center !important;
  .iconCon {
    width: 130px;
    height: 130px;
    line-height: 130px;
    background: #fbfbfb;
    border-radius: 50%;
    margin: 64px auto 0;
    color: #9e9e9e;
  }
`;

let ajaxPromise;

export default function SourceList(props) {
  const { flag } = props;
  const [fetchState, setFetchState] = useSetState({
    pageNo: 0,
    loading: true,
    noMore: false,
    roleType: 'ALL',
    fromType: 'ALL',
    dsType: 'ALL',
    keyWords: '',
  });
  const [sourceList, setSourceList] = useState([]);
  const [isFilterExpand, setIsFilterExpand] = useState(false);
  const [showFilter, setShowFilter] = useState(false);
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [sourceRecord, setSourceRecord] = useState({});
  // const [switchSort, setSwitchSort] = useSetState({ syncTaskSort: undefined, createTimeSort: undefined });
  const [dsTabList, setDsTabList] = useState([]);
  const FILTER_TYPES = [
    { title: _l('作为'), data: ROLE_TYPE_TAB_LIST, key: 'roleType', hasExpand: false },
    { title: _l('来源'), data: FROM_TYPE_TAB_LIST, key: 'fromType', hasExpand: false },
    { title: _l('源类型'), data: dsTabList, key: 'dsType', hasExpand: false },
  ];

  useEffect(() => {
    //获取数据源类型列表
    const getTypeParams = {
      projectId: props.currentProjectId,
      onlyRelatedTask: false,
      onlyCreated: false,
    };
    dataSourceApi.getTypes(getTypeParams).then(res => {
      if (res) {
        const list = res
          .filter(item => item.type === DATABASE_TYPE.MYSQL)
          .map(item => {
            return { key: item.type, text: item.name };
          });
        setDsTabList([{ key: 'ALL', text: _l('全部') }, ...list]);
      }
    });
  }, []);

  //获取数据源列表
  const onFetch = () => {
    if (!fetchState.loading) return;
    //数据源列表请求参数
    const params = {
      projectId: props.currentProjectId,
      pageNo: fetchState.pageNo,
      pageSize: 20,
      searchBody: fetchState.keyWords,
      roleType: fetchState.roleType,
      fromType: fetchState.fromType === 'ALL' ? null : fetchState.fromType,
      dsType: fetchState.dsType === 'ALL' ? null : fetchState.dsType,
    };

    ajaxPromise = dataSourceApi.list(params);
    ajaxPromise.then(result => {
      if (result) {
        const list = result.content.map(item => {
          return {
            ...item,
            address: item.hosts[0].split(':')[0],
          };
        });
        setSourceList(fetchState.pageNo > 0 ? sourceList.concat(list) : list);
        setFetchState({ loading: false, noMore: result.content.length < 20 });
      }
    });
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setFetchState({ loading: true, pageNo: 0, keyWords: value });
    }, 500),
    [],
  );

  useEffect(onFetch, [
    fetchState.loading,
    fetchState.pageNo,
    fetchState.roleType,
    fetchState.fromType,
    fetchState.dsType,
    fetchState.keyWords,
  ]);

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      setFetchState({ loading: true, pageNo: fetchState.pageNo + 1 });
    }
  };

  useEffect(() => {
    setFetchState({ loading: true, pageNo: 0 });
  }, [flag]);

  const columns = [
    {
      dataIndex: 'name',
      title: _l('数据源'),
      render: item => {
        return (
          <div
            className="flexRow alignItemsCenter pLeft8 pointer"
            onClick={() => {
              setSourceRecord(item);
              setEditModalVisible(true);
            }}
          >
            <div
              className="titleIcon"
              style={{ background: _.get(item, 'dsTypeInfo.iconBgColor') }}
              data-tip={_.get(item, 'dsTypeInfo.name')}
            >
              <svg className="icon svg-icon" aria-hidden="true">
                <use xlinkHref={`#icon${_.get(item, 'dsTypeInfo.className')}`} />
              </svg>
            </div>
            <span title={item.name} className="titleText overflow_ellipsis">
              {item.name}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'address',
      title: _l('地址'),
      render: item => {
        return (
          <div title={item.address} className="Gray_75 overflow_ellipsis">
            {item.address}
          </div>
        );
      },
    },
    {
      dataIndex: 'roleType',
      title: _l('作为'),
      render: item => {
        return item.roleType === ROLE_TYPE.SOURCE ? (
          <span>{_l('源')}</span>
        ) : item.roleType === ROLE_TYPE.DEST ? (
          <span>{_l('目的地')}</span>
        ) : item.roleType === ROLE_TYPE.ALL ? (
          <span>{_l('源 / 目的地')}</span>
        ) : (
          <span>{_l('-')}</span>
        );
      },
    },
    {
      dataIndex: 'taskNum',
      renderTitle: () => {
        return (
          // <div className="flexRow pointer" onClick={() => setSwitchSort({ syncTaskSort: !switchSort.syncTaskSort })}>
          //   <span>{_l('同步任务')}</span>
          //   <div className="flexColumn mLeft6">
          //     <Icon icon="arrow-up" className={cx('sortIcon', { selected: switchSort.syncTaskSort === true })} />
          //     <Icon icon="arrow-down" className={cx('sortIcon', { selected: switchSort.syncTaskSort === false })} />
          //   </div>
          // </div>
          <span>{_l('同步任务')}</span>
        );
      },
    },
    {
      dataIndex: 'createTime',
      renderTitle: () => {
        return (
          // <div
          //   className="flexRow pointer"
          //   onClick={() => setSwitchSort({ createTimeSort: !switchSort.createTimeSort })}
          // >
          //   <span>{_l('创建时间')}</span>
          //   <div className="flexColumn mLeft6">
          //     <Icon icon="arrow-up" className={cx('sortIcon', { selected: switchSort.createTimeSort === true })} />
          //     <Icon icon="arrow-down" className={cx('sortIcon', { selected: switchSort.createTimeSort === false })} />
          //   </div>
          // </div>
          <span>{_l('创建时间')}</span>
        );
      },
      render: item => {
        return (
          <div className="pRight8">
            <span>{item.creatorName}</span>
            <span className="Gray_9e">{` 创建于 ${formatDate(item.createTime)}`}</span>
          </div>
        );
      },
    },
    {
      dataIndex: 'option',
      title: '',
      renderTitle: () => {
        return (
          <div className="optionIcon" data-tip={_l('刷新')} onClick={() => setFetchState({ loading: true, pageNo: 0 })}>
            <Icon icon="refresh1" className="Font18 pointer" />
          </div>
        );
      },
      render: item => (
        <OptionColumn
          currentProjectId={props.currentProjectId}
          record={item}
          sourceList={sourceList}
          setSourceList={setSourceList}
        />
      ),
    },
  ];

  return (
    <Fragment>
      <FilterContent>
        <div className="flexRow">
          <SearchInput
            className="searchInput"
            placeholder={_l('搜索数据源名称 / 地址 / 创建人')}
            value={fetchState.keyWords}
            onChange={onSearch}
          />
          <div className="relative">
            <Icon
              icon="filter"
              className={cx('filterIcon', { isActive: showFilter })}
              onClick={() => setShowFilter(!showFilter)}
            />
            {!showFilter &&
              [fetchState.roleType, fetchState.fromType, fetchState.dsType].filter(item => item === 'ALL').length !==
                3 && <RedDot />}
          </div>
        </div>

        {showFilter && (
          <div className="mTop16">
            {FILTER_TYPES.map((list, i) => {
              return (
                <FilterItem key={i} className={cx({ isExpand: list.hasExpand && isFilterExpand })}>
                  <div className="itemText">{list.title}</div>
                  <ul>
                    {list.data.map((item, index) => (
                      <li
                        key={index}
                        title={item.text}
                        className={cx({ isActive: item.key === fetchState[list.key] })}
                        onClick={() => setFetchState({ loading: true, pageNo: 0, [list.key]: item.key })}
                      >
                        {item.text}
                      </li>
                    ))}

                    {list.hasExpand && (
                      <Icon
                        icon={isFilterExpand ? 'arrow-up' : 'arrow-down'}
                        className="expandIcon"
                        onClick={() => setIsFilterExpand(!isFilterExpand)}
                      />
                    )}
                  </ul>
                </FilterItem>
              );
            })}
          </div>
        )}
      </FilterContent>

      <SourceListBox>
        <div className="headTr mTop25">
          {columns.map((item, index) => {
            return (
              <div key={index} className={`${item.dataIndex}`}>
                {item.renderTitle ? item.renderTitle() : item.title}
              </div>
            );
          })}
        </div>
      </SourceListBox>

      <ScrollView className="flex" onScrollEnd={onScrollEnd}>
        {fetchState.pageNo === 0 && fetchState.loading ? (
          <LoadDiv className="mTop10" />
        ) : (
          <SourceListBox>
            {sourceList && sourceList.length > 0 ? (
              sourceList.map((sourceItem, i) => {
                return (
                  <div key={i} className="dataItem">
                    {columns.map((item, j) => {
                      return (
                        <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                          {item.render ? item.render(sourceItem) : sourceItem[item.dataIndex]}
                        </div>
                      );
                    })}
                  </div>
                );
              })
            ) : (
              <NoDataWrapper>
                <span className="iconCon InlineBlock TxtCenter ">
                  <i className="icon-storage Font64 TxtMiddle" />
                </span>
                <p className="Gray_9e mTop20 mBottom0">{_l('暂无数据')}</p>
              </NoDataWrapper>
            )}
          </SourceListBox>
        )}
      </ScrollView>

      {fetchState.pageNo > 0 && fetchState.loading && <LoadDiv className="mTop10" />}

      {editModalVisible && (
        <AddOrEditSource
          {...props}
          isEdit={true}
          editType={DETAIL_TYPE.SETTING}
          sourceRecord={sourceRecord}
          onClose={() => setEditModalVisible(false)}
          onRefresh={() => setFetchState({ loading: true, pageNo: 0 })}
        />
      )}
    </Fragment>
  );
}
