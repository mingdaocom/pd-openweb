import React, { useEffect, useState } from 'react';
import chartEmptyImg from 'staticfiles/images/chart.png';
import styled from 'styled-components';
import { Icon, LoadDiv, SortableList } from 'ming-ui';
import favoriteApi from 'src/api/favorite';
import Chart from 'src/pages/Statistics/Card';
import { CardItem } from './utils';
import './style.less';

const ChartListWrapper = styled.div`
  min-height: 300px;
  padding: 0 20px 8px;
  display: flex;
  flex-wrap: wrap;
  gap: 20px;

  .chartItem {
    z-index: 10;
    position: relative;
    width: calc(50% - 10px);
    height: 300px;
    border: 1px solid #eaeaea;
    border-radius: 8px;
    padding: 10px 20px 20px 20px;
    background: #fff;
    .dragWrap {
      display: none;
      position: absolute;
      left: 8px;
      top: 22px;
      color: #9e9e9e;
      cursor: pointer;
      &:hover {
        color: #1677ff;
      }
    }
    &:hover {
      .dragWrap {
        display: block;
      }
    }
    .reportName {
      margin-left: 5px;
    }
  }
`;

export default function CollectionCharts(props) {
  const { projectId, reportAutoRefreshTimer, flag, currentTheme } = props;
  const [chartList, setChartList] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    favoriteApi.getAllFavorites({ projectId, type: 2, isRefresh: 1 }).then(res => {
      if (res) {
        setChartList(res);
        setLoading(false);
      }
    });
  }, [projectId, flag]);

  const onSort = newItems => {
    setChartList(newItems);
    const newSortIds = newItems.map(item => item.favoriteId);
    favoriteApi.updateReportSort({ projectId, reportIds: newSortIds });
  };

  const renderItem = ({ item, DragHandle }) => {
    return (
      <React.Fragment>
        <DragHandle>
          <span data-tip={_l('拖拽')} className="dragWrap">
            <Icon icon="drag" className="Font14" />
          </span>
        </DragHandle>
        <Chart
          report={{ id: item.reportId }}
          pageId={item.pageId}
          projectId={projectId}
          appId={item.appId}
          viewId={item.viewId}
          sourceType={3}
          customPageConfig={{ refresh: reportAutoRefreshTimer }}
          onCancelFavorite={() => {
            const newChartList = chartList.filter(chart => chart.favoriteId !== item.favoriteId);
            setChartList(newChartList);
          }}
        />
      </React.Fragment>
    );
  };

  return (
    <CardItem className="sortItem overflowHidden">
      <div className="cardTitle">
        <div className="titleText">
          {currentTheme.chartCollectIcon && <img src={currentTheme.chartCollectIcon} />}
          {_l('图表收藏')}
        </div>
      </div>
      {loading ? (
        <LoadDiv className="mTop10" />
      ) : chartList.length ? (
        <ChartListWrapper>
          <SortableList
            useDragHandle
            items={chartList}
            itemClassName="chartItem"
            renderItem={renderItem}
            itemKey="favoriteId"
            helperClass="chartSortItemHelper"
            onSortEnd={onSort}
          />
        </ChartListWrapper>
      ) : (
        <div className="emptyWrapper">
          <img src={chartEmptyImg} />
          <span>{_l('没有图表')}</span>
        </div>
      )}
    </CardItem>
  );
}
