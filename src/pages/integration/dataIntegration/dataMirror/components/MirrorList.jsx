import React, { useState, useEffect, useCallback, Fragment } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, LoadDiv, ScrollView, Tooltip, SvgIcon } from 'ming-ui';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import OptionColumn from './OptionColumn';
import { SORT_TYPE } from 'src/pages/integration/dataIntegration/constant.js';
import { formatDate } from 'src/pages/integration/config.js';
import dataMirrorApi from 'src/pages/integration/api/dw.js';

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
      // color: #2196f3;
      background: #f5f5f5;
    }
    &.isActive {
      // color: #2196f3;
      background: rgba(33, 150, 243, 0.07);
    }
  }
`;

const ListBox = styled.div`
  .flexShrink {
    flex-shrink: 0;
    min-width: 0;
  }
  &.headTr {
    border-bottom: 1px solid #e0e0e0;
    align-items: center;
    margin: 0;
    padding: 8px 0;
    .sortIcon {
      color: #bfbfbf;
      height: 8px;
      &.selected {
        color: #2196f3;
      }
    }
  }
  .dataItem {
    flex-shrink: 0;
    min-width: 0;
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
      svg {
        left: 6px;
        top: 6px;
        position: absolute;
      }
      .conForIcon {
        left: 0;
        top: 0;
        bottom: 0;
        right: 0;
        border-radius: 50%;
        opacity: 0.1;
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
  .createTime {
    min-width: 200px;
  }
  .option {
    max-width: 50px;
    min-width: 50px;
  }
  .destTable {
    flex: 2 !important;
    min-width: 270px;
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
let sortFlag = 0;

export default function MirrorList(props) {
  const { flag } = props;
  const [fetchState, setFetchState] = useSetState({
    pageNo: 0,
    loading: false,
    noMore: false,
    keyWords: '',
    sort: { fieldName: '', sortDirection: null },
  });
  const [mirrorList, setMirrorList] = useState([]);
  const sortTypes = [null, SORT_TYPE.ASC, SORT_TYPE.DESC];

  useEffect(() => {
    onFetch(fetchState);
  }, [flag]);

  //获取数据源列表
  const onFetch = param => {
    if (param.loading) return;
    setFetchState({
      loading: true,
      keyWords: param.keyWords,
      pageNo: param.pageNo,
      sort: param.sort,
    });
    if (ajaxPromise) {
      ajaxPromise.abort();
    }
    ajaxPromise = dataMirrorApi.getWorkTableMirrorDataList({
      projectId: props.projectId,
      pageNo: param.pageNo,
      pageSize: 20,
      appNameAndWsName: param.keyWords,
      sort: param.sort,
    });
    ajaxPromise.then(result => {
      if (result && result.content && _.isArray(result.content)) {
        const list = result.content;
        setFetchState({
          loading: false,
          noMore: result.content.length < 20,
        });
        setMirrorList(param.pageNo > 0 ? mirrorList.concat(list) : list);
      }
    });
  };

  const onSearch = useCallback(
    _.debounce(value => {
      onFetch({ ...fetchState, pageNo: 0, keyWords: value });
    }, 500),
    [],
  );

  const onScrollEnd = () => {
    if (!fetchState.noMore && !fetchState.loading) {
      onFetch({ ...fetchState, pageNo: fetchState.pageNo + 1 });
    }
  };

  const columns = [
    {
      dataIndex: 'sourceTable',
      title: _l('工作表'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter Hand">
            <span title={item.wsName} className="titleText overflow_ellipsis">
              {item.wsName || _l('未命名')}
            </span>
            {!item.workSheetIsExist && (
              <Tooltip
                tooltipStyle={{
                  maxWidth: 350,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
                text={<span className="InlineBlock WordBreak">{_l('表被删除')}</span>}
              >
                <Icon type={'error'} className="Red Font16 TxtMiddle InlineBlock mLeft5" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: 'app',
      renderTitle: () => {
        return (
          <div
            className="flexRow pointer pLeft5"
            onClick={() => {
              if (fetchState.sort.fieldName !== 'appName') {
                sortFlag = 1;
              } else {
                sortFlag = sortFlag === 2 ? 0 : sortFlag + 1;
              }
              onFetch({
                ...fetchState,
                pageNo: 0,
                sort: { fieldName: sortFlag === 0 ? '' : 'appName', sortDirection: sortTypes[sortFlag] },
              });
            }}
          >
            <span>{_l('所属应用')}</span>
            <div className="flexColumn mLeft6">
              <Icon
                icon="arrow-up"
                className={cx('sortIcon', {
                  selected: fetchState.sort.fieldName === 'appName' && fetchState.sort.sortDirection === SORT_TYPE.ASC,
                })}
              />
              <Icon
                icon="arrow-down"
                className={cx('sortIcon', {
                  selected: fetchState.sort.fieldName === 'appName' && fetchState.sort.sortDirection === SORT_TYPE.DESC,
                })}
              />
            </div>
          </div>
        );
      },
      render: item => {
        return (
          <div className="flexRow alignItemsCenter pointer">
            <div className="titleIcon SvgIcon Relative flexRow alignItemsCenter">
              <div className="conForIcon Absolute" style={{ backgroundColor: _.get(item, 'appIconColor') }}></div>
              <SvgIcon url={_.get(item, 'appIcon')} fill={_.get(item, 'appIconColor')} size={20} />
            </div>
            <span title={item.appName} className="titleText overflow_ellipsis">
              {item.appName}
            </span>
          </div>
        );
      },
    },
    {
      dataIndex: 'action',
      title: _l('已同步(增/改/删)'),
      render: item => {
        return (
          <div className="Gray_75 overflow_ellipsis">
            {item.incCount}/{item.updCount}/{item.delCount}
          </div>
        );
      },
    },
    {
      dataIndex: 'destTable',
      title: _l('数据库表'),
      render: item => {
        return (
          <div className="flexRow alignItemsCenter Hand">
            <Tooltip text={_.get(item, 'dataSourceInfo')}>
              <div
                className="titleIcon Relative"
                style={{ background: _.get(item, 'dataSourceIcon.iconBgColor') }}
                onClick={() => {
                  window.open('/integration/sourceDetail/' + item.dataSourceId);
                }}
              >
                <svg className="icon svg-icon" aria-hidden="true">
                  <use xlinkHref={`#icon${_.get(item, 'dataSourceIcon.className')}`} />
                </svg>
              </div>
            </Tooltip>
            <span title={item.tableName} className="titleText overflow_ellipsis">
              {item.tableName}
            </span>
            {item.errorInfo && (
              <Tooltip
                tooltipStyle={{
                  maxWidth: 350,
                  maxHeight: 300,
                  overflow: 'auto',
                }}
                text={<span className="InlineBlock WordBreak">{item.errorInfo}</span>}
              >
                <Icon type={'error'} className="Red Font16 TxtMiddle InlineBlock mLeft5" />
              </Tooltip>
            )}
          </div>
        );
      },
    },
    {
      dataIndex: 'createTime',
      title: _l('创建人'),
      render: item => {
        return (
          <div className="pRight8">
            <span>{item.creator}</span>
            <span className="Gray_9e">{` 创建于 ${formatDate(item.createDate)}`}</span>
          </div>
        );
      },
    },
    {
      dataIndex: 'option',
      title: '',
      renderTitle: () => {
        return <div style={{ width: 50 }}></div>;
      },
      render: item => (
        <OptionColumn
          id={item.id}
          onDel={cb => {
            dataMirrorApi
              .delete({
                id: item.id,
              })
              .then(res => {
                if (res.errorMsgList) {
                  alert(res.errorMsgList[0], 2);
                } else if (res.data) {
                  setMirrorList(mirrorList.filter(o => o.id !== item.id));
                  alert(_l('删除成功'));
                } else {
                  alert(_l('删除失败'), 3);
                }
                cb && cb();
              });
          }}
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
            placeholder={_l('应用、工作表名称')}
            value={fetchState.keyWords}
            onChange={onSearch}
          />
        </div>
      </FilterContent>

      <ListBox className="headTr flexRow mTop25 w100">
        {columns.map((item, index) => {
          return (
            <div key={index} className={`${item.dataIndex} flex flexShrink pLeft5`}>
              {item.renderTitle ? item.renderTitle() : item.title}
            </div>
          );
        })}
      </ListBox>

      <ScrollView className="flex flexShrink" onScrollEnd={onScrollEnd}>
        {fetchState.pageNo === 0 && fetchState.loading ? (
          <LoadDiv className="mTop10" />
        ) : (
          <ListBox className="">
            {mirrorList && mirrorList.length > 0 ? (
              mirrorList.map((sourceItem, i) => {
                return (
                  <div key={i} className="dataItem flexRow w100">
                    {columns.map((item, j) => {
                      return (
                        <div key={`${i}-${j}`} className={`${item.dataIndex} flex flexShrink pLeft5`}>
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
                  <i className="icon-synchronization Font64 TxtMiddle" />
                </span>
                <p className="Gray_9e mTop20 mBottom0">{_l('暂无数据')}</p>
              </NoDataWrapper>
            )}
          </ListBox>
        )}
      </ScrollView>

      {fetchState.pageNo > 0 && fetchState.loading && <LoadDiv className="mTop10" />}
    </Fragment>
  );
}
