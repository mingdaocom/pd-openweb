import React, { Fragment, useCallback, useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, FullScreenCurtain, Icon, LoadDiv, ScrollView } from 'ming-ui';
import syncTaskApi from 'src/pages/integration/api/syncTask.js';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { navigateTo } from 'src/router/navigateTo';
import { getRequest } from 'src/utils/common';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';
import AppSettingHeader from '../AppSettingHeader';
import Info from './components/Info';
import Item from './components/Item';

const Wrap = styled.div`
  .emptyIcon {
    width: 130px;
    height: 130px;
    background: var(--color-background-secondary);
    border-radius: 50%;
    opacity: 1;
    margin: 200px auto 0;
    i {
      margin: 0 auto;
    }
  }
  .cardItemCon {
    display: flex;
    flex-wrap: wrap;
    // justify-content: space-between;
    margin: 0 -10px;
  }
  .aggregationList {
    margin: 0 -40px;
  }
  .manageListHeader {
    height: 40px;
    border-bottom: 1px solid var(--color-border-primary);
    margin: 0 40px;
    .Dropdown {
      .Dropdown--input {
        padding: 0;
        i {
          line-height: 32px;
          display: inline-block;
          vertical-align: middle;
          height: 32px;
        }
      }
    }
  }
  .minWidth100 {
    min-width: 100px;
  }
  .w100px {
    width: 100px;
  }
  .w150px {
    width: 150px;
  }
  .w180px {
    width: 180px;
  }
  .w200px {
    width: 200px;
  }
  .w50px {
    width: 50px;
    flex-shrink: 0;
  }
  .w20px {
    width: 20px;
  }
`;
const ArrowUp = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: transparent transparent var(--color-text-tertiary) transparent;
  cursor: pointer;
  &:hover,
  &.active {
    border-color: transparent transparent #1677ff transparent;
  }
`;

const ArrowDown = styled.span`
  border-width: 5px;
  border-style: solid;
  border-color: var(--color-text-tertiary) transparent transparent transparent;
  cursor: pointer;
  margin-top: 2px;
  &:hover,
  &.active {
    border-color: var(--color-primary) transparent transparent transparent;
  }
`;
let ajaxPromise = null;
const pageSize = 40;
export default function AggregationTables(props) {
  const cache = useRef({});
  const { aggTableId } = getRequest();
  const { projectId, appId } = props;
  const [{ showInfo, list, id, loading, pageNo, keyWords, noMore, sort, displayType }, setState] = useSetState({
    id: aggTableId,
    showInfo: !!aggTableId,
    list: [],
    loading: !aggTableId,
    keyWords: '',
    pageNo: 0,
    noMore: false,
    sort: { fieldName: '', sortDirection: null },
    displayType: 'createDate',
  });

  const featureType = getFeatureStatus(projectId, VersionProductType.aggregation);

  useEffect(() => {
    if (!loading) return;
    if (ajaxPromise) ajaxPromise.abort();

    //同步任务列表请求参数
    const fetchListParams = {
      projectId,
      pageNo: pageNo,
      pageSize,
      searchBody: keyWords,
      sort: sort,
      taskType: 1, //聚合表
      appId,
    };
    //获取同步任务列表;
    ajaxPromise = syncTaskApi.list(fetchListParams, { isAggTable: true });
    ajaxPromise.then(result => {
      if (result) {
        cache.current.list = pageNo > 0 ? list.concat(result.content || []) : result.content;
        setState({
          list: cache.current.list,
          loading: false,
          noMore: (_.get(result, 'content.length') || 0) < pageSize,
        });
      }
    });
  }, [keyWords, pageNo, loading, sort]);

  const checkCanAdd = () => {
    syncTaskApi
      .createAggTableSyncTaskPreCheck(
        {
          projectId,
        },
        { isAggTable: true },
      )
      .then(res => {
        if (res.currentTaskNum >= res.maxTaskNum) {
          buriedUpgradeVersionDialog(
            projectId,
            VersionProductType.aggregation,
            {
              explainText: _l('已达到使用上限，请考虑购买增补包或升级版本'),
            },
            () => {
              navigateTo(`/admin/expansionserviceAggregationtable/${projectId}/aggregationtable`);
            },
          );
        } else {
          setState({ showInfo: true, id: '' });
        }
      });
  };
  const onScrollEnd = () => {
    if (!noMore && !loading) {
      setState({ pageNo: pageNo + 1, loading: true });
    }
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setState({ keyWords: value, loading: true, pageNo: 0 });
    }, 500),
    [],
  );

  const renderNull = txt => {
    return (
      <React.Fragment>
        <div className="emptyIcon flexRow alignItemsCenter TxtCenter">
          <Icon icon="aggregate_table" className="textDisabled Font50" />
        </div>
        <div className="emptyHint TxtCenter textTertiary Font17 mTop20">{txt || _l('暂无聚合表')}</div>
      </React.Fragment>
    );
  };

  /**
   * 渲染内容
   */
  const renderContent = () => {
    return (
      <Fragment>
        <div className="flexRow manageListHeader bold alignItemsCenter">
          <div className="flex mLeft10 mRight20 flexRow alignItemsCenter" style={{ minWidth: 120 }}>
            <div className="flex textSecondary">{_l('名称')}</div>
            <div className="flexColumn">
              <ArrowUp
                className={cx({ active: sort.fieldName === 'name' && sort.sortDirection === 'ASC' })}
                onClick={() =>
                  setState({
                    loading: true,
                    pageNo: 0,
                    sort: { fieldName: 'name', sortDirection: 'ASC' },
                  })
                }
              />
              <ArrowDown
                className={cx({ active: sort.fieldName === 'name' && sort.sortDirection === 'DESC' })}
                onClick={() =>
                  setState({
                    loading: true,
                    pageNo: 0,
                    sort: { fieldName: 'name', sortDirection: 'DESC' },
                  })
                }
              />
            </div>
          </div>
          <div className="flex mRight20 flexRow alignItemsCenter textSecondary minWidth100">{_l('数据源')}</div>
          <div className="w150px mRight20 minWidth100 textSecondary">{_l('状态')}</div>
          <div className="w180px pRight20 mRight20 flexRow alignItemsCenter">
            <div className="flex">
              <Dropdown
                className="Normal"
                data={[
                  { text: _l('创建时间'), value: 'createDate' },
                  { text: _l('更新时间'), value: 'lastModifiedDate' },
                ]}
                value={displayType}
                renderTitle={() => (
                  <span className="textSecondary bold TxtTop">
                    {displayType === 'createDate' ? _l('创建时间') : _l('更新时间')}
                  </span>
                )}
                onChange={displayType =>
                  setState({
                    loading: true,
                    pageNo: 0,
                    displayType,
                    sort: { fieldName: displayType, sortDirection: 'ASC' },
                  })
                }
              />
            </div>
            <div className="flexColumn">
              <ArrowUp
                className={cx({
                  active:
                    _.includes(['createDate', 'lastModifiedDate'], sort.fieldName) && sort.sortDirection === 'ASC',
                })}
                onClick={() =>
                  setState({
                    loading: true,
                    pageNo: 0,
                    displayType,
                    sort: { fieldName: displayType, sortDirection: 'ASC' },
                  })
                }
              />
              <ArrowDown
                className={cx({
                  active:
                    _.includes(['createDate', 'lastModifiedDate'], sort.fieldName) && sort.sortDirection === 'DESC',
                })}
                onClick={() =>
                  setState({
                    loading: true,
                    pageNo: 0,
                    displayType,
                    sort: { fieldName: displayType, sortDirection: 'DESC' },
                  })
                }
              />
            </div>
          </div>
          <div className="w100px mRight20 minWidth100 textSecondary">{_l('创建人')}</div>
          <div className="w50px mRight20 textSecondary">{_l('操作')}</div>
          <div className="w20px mRight20" />
        </div>
        {loading && pageNo <= 0 ? (
          <LoadDiv className="mTop20" />
        ) : (
          <ScrollView className="flex" onScrollEnd={onScrollEnd}>
            {(list || []).length <= 0 && renderNull(!keyWords ? null : _l('没有相关聚合表'))}
            {list.map((item, index) => (
              <Item
                {...props}
                item={item}
                onChange={(list, item) => {
                  cache.current.list = list ? list : cache.current.list.map(o => (o.id === item.id ? item : o));
                  setState({
                    list: cache.current.list,
                  });
                }}
                onRefresh={() => {
                  setState({
                    keyWords: '',
                    pageNo: 0,
                    loading: true,
                    noMore: false,
                    sort: { fieldName: '', sortDirection: null },
                  });
                }}
                items={list}
                key={'item_' + index}
                index={index}
                num={index}
                displayType={displayType}
                canEdit={featureType !== '2'}
                onEdit={() => {
                  if (featureType === '2') {
                    buriedUpgradeVersionDialog(projectId, VersionProductType.aggregation);
                    return;
                  }
                  setState({ showInfo: true, id: item.aggTableId });
                  navigateTo(`/app/${appId}/settings/aggregation/${item.aggTableId}${location.search}`);
                }}
              />
            ))}
          </ScrollView>
        )}
        {loading && pageNo > 0 && <LoadDiv />}
      </Fragment>
    );
  };

  return (
    <Wrap className="flexColumn h100">
      {!aggTableId && (
        <React.Fragment>
          <AppSettingHeader
            title={_l('聚合表')}
            addBtnName={_l('新建聚合表')}
            description={_l('可将多个工作表连接，对数据进行归组聚合，在统计中直接使用')}
            link="https://help.mingdao.com/application/aggregation" //帮助链接
            handleSearch={onSearch}
            handleAdd={() => {
              featureType === '2'
                ? buriedUpgradeVersionDialog(projectId, VersionProductType.aggregation)
                : checkCanAdd();
            }}
          />
          <div className="flex flexColumn aggregationList overflowHidden">{renderContent()}</div>
        </React.Fragment>
      )}
      {showInfo && (
        <FullScreenCurtain>
          <Info
            id={id}
            projectId={projectId}
            appId={appId}
            onClose={() => {
              setState({
                showInfo: false,
                pageNo: 0,
                loading: true,
                keyWords: '',
                noMore: false,
                sort: { fieldName: '', sortDirection: null },
              });
              navigateTo(`/app/${appId}/settings/aggregations${location.search}`);
            }}
            appName={_.get(props, 'data.name')}
          />
        </FullScreenCurtain>
      )}
    </Wrap>
  );
}
