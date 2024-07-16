import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import favoriteApi from 'src/api/favorite';
import Chart from 'src/pages/Statistics/Card';
import { SortableContainer, SortableElement, arrayMove } from '@mdfe/react-sortable-hoc';
import { CardItem } from '.';
import './style.less';
import chartEmptyImg from 'staticfiles/images/chart.png';

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
      top: 16px;
      color: #9e9e9e;
      cursor: pointer;
      &:hover {
        color: #2196f3;
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

const SortableItem = SortableElement(data => {
  const { chart, projectId, reportAutoRefreshTimer, onCancelFavorite } = data;

  return (
    <div className="chartItem">
      <span data-tip={_l('拖拽')} className="dragWrap">
        <Icon icon="drag" className="Font14" />
      </span>
      <Chart
        report={{ id: chart.reportId }}
        pageId={chart.pageId}
        projectId={projectId}
        appId={chart.appId}
        viewId={chart.viewId}
        sourceType={3}
        customPageConfig={{ refresh: reportAutoRefreshTimer }}
        onCancelFavorite={() => onCancelFavorite(chart.favoriteId)}
      />
    </div>
  );
});

const SortableList = SortableContainer(props => {
  const { chartList, projectId, reportAutoRefreshTimer, onCancelFavorite } = props;

  return (
    <ChartListWrapper>
      {chartList.map((chart, index) => {
        return (
          <SortableItem
            key={`item_${chart.reportId}`}
            index={index}
            chart={chart}
            projectId={projectId}
            reportAutoRefreshTimer={reportAutoRefreshTimer}
            onCancelFavorite={onCancelFavorite}
          />
        );
      })}
    </ChartListWrapper>
  );
});

export default function CollectionCharts(props) {
  const { projectId, reportAutoRefreshTimer, flag, currentTheme } = props;
  const [chartList, setChartList] = useState([]);
  const [sortIds, setSortIds] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    favoriteApi.getAllFavorites({ projectId, type: 2, isRefresh: 1 }).then(res => {
      if (res) {
        setChartList(res);
        setSortIds(res.map(item => item.favoriteId));
        setLoading(false);
      }
    });
  }, [projectId, flag]);

  const onSort = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const newSortIds = arrayMove(sortIds, oldIndex, newIndex);
    setSortIds(newSortIds);
    favoriteApi.updateReportSort({ projectId, reportIds: newSortIds });
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
        <SortableList
          distance={3}
          helperClass="chartSortItemHelper"
          shouldCancelStart={({ target }) => {
            return !target.classList.contains('icon-drag');
          }}
          projectId={projectId}
          reportAutoRefreshTimer={reportAutoRefreshTimer}
          chartList={sortIds
            .map(id => _.find(chartList, chart => chart.favoriteId === id))
            .filter(item => !_.isUndefined(item))}
          axis={'xy'}
          onSortEnd={onSort}
          onCancelFavorite={id => {
            const newChartList = chartList.filter(item => item.favoriteId !== id);
            setChartList(newChartList);
            setSortIds(newChartList.map(item => item.favoriteId));
          }}
        />
      ) : (
        <div className="emptyWrapper">
          <img src={chartEmptyImg} />
          <span>{_l('没有图表')}</span>
        </div>
      )}
    </CardItem>
  );
}
