import React, { useCallback, useEffect, useRef } from 'react';
import ExecNumber from 'src/pages/integration/dataIntegration/task/components/ExecNumber/index.jsx';
import { Dropdown, LoadDiv } from 'ming-ui';
import StatsAjax from 'src/pages/integration/api/stats.js';
import { useSetState } from 'react-use';
import moment from 'moment';
import _ from 'lodash';
import cx from 'classnames';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import { Wrap } from './style';
import Sort from './Sort';
import { Pagination } from 'antd';
import { formatDate } from 'src/pages/integration/config.js';
import { formatNumberThousand } from 'src/util';
import loadingSvg from 'src/pages/Admin/app/useAnalytics/components/loading.svg';

let lineChart = null;
let ajaxFetch = null;
export default function (props) {
  const chantRef = useRef();
  const g2plotComponent = useRef({});
  const cache = useRef({});
  const { currentProjectId: projectId } = props;
  const [
    {
      keyWords,
      dimension,
      pageSize,
      pageNum,
      list,
      listLoading,
      readCount,
      writeCount,
      totalPages,
      totalElements,
      history,
      sort,
      totalWriteCount,
      totalReadCount,
      startTime,
      endTime,
      historyLoading,
    },
    setState,
  ] = useSetState({
    keyWords: '',
    dimension: 1,
    pageNum: 1,
    pageSize: 50, //每页50行记录
    sort: {},
    list: [],
    listLoading: false,
    readCount: 0,
    writeCount: 0,
    totalPages: 0,
    history: [],
    totalWriteCount: 0,
    totalReadCount: 0,
    totalElements: 0,
    startTime: '',
    endTime: '',
    historyLoading: true,
  });
  const dateArr = [
    { text: _l('最近1小时'), value: 1 },
    { text: _l('最近1天'), value: 2 },
    { text: _l('最近1个月'), value: 3 },
    { text: _l('最近6个月'), value: 4 },
  ];

  useEffect(() => {
    getG2plotComponent();
    () => {
      g2plotComponent.current.value = null;
      lineChart && lineChart.destroy();
    };
  }, []);

  useEffect(() => {
    chantRef.current && g2plotComponent.current.value && renderChart(history);
  }, [chantRef.current, g2plotComponent.current.value, history]);

  useEffect(() => {
    cache.current = { dimension, sort, keyWords, startTime, endTime, pageNum };
    getList();
  }, [dimension, sort, keyWords, startTime, endTime, pageNum]);

  const getData = () => {
    getInfo();
    getDetailInfo();
  };

  const getDetailInfo = dimension => {
    getHistory(dimension);
  };

  const getG2plotComponent = () => {
    import('@antv/g2plot').then(data => {
      g2plotComponent.current.value = data;
      getData();
    });
  };

  const getInfo = () => {
    StatsAjax.realtime({ projectId })
      .then(res => {
        const { readCount, writeCount } = res;
        setState({ readCount, writeCount });
      })
      .catch(() => {
        setState({ readCount: 0, writeCount: 0 });
      });
  };

  const getHistory = (dimension = 1) => {
    setState({ historyLoading: true });
    StatsAjax.history({ projectId, dimension }).then(res => {
      const { totalWriteCount, totalReadCount, historicalData = {} } = res;
      let initChartData = [];
      _.mapKeys(historicalData.readHistoricalData, (value, key) => {
        let date = moment(Number(key)).format('YYYY-MM-DD HH:mm');
        initChartData.push(
          { category: _l('读取'), date, value, time: key },
          {
            category: _l('写入'),
            date,
            time: key,
            value: historicalData.writeHistoricalData[key],
          },
        );
      });
      setState({
        historyLoading: false,
        history: initChartData,
        totalWriteCount,
        totalReadCount,
      });
    });
  };

  const getList = data => {
    if (listLoading && ajaxFetch) {
      ajaxFetch.abort();
    }
    setState({ listLoading: true });
    ajaxFetch = StatsAjax.details({
      projectId,
      dimension: cache.current.dimension || 1,
      pageNum: cache.current.pageNum || 1,
      pageSize,
      taskNameOrCreator: cache.current.keyWords || '',
      sortQuery: cache.current.sort || {},
      startTime: cache.current.startTime || '',
      endTime: cache.current.endTime || '',
    });
    ajaxFetch.then(res => {
      setState({
        ...data,
        list: res.content,
        totalElements: res.totalElements,
        totalPages: res.totalPages,
        listLoading: false,
      });
    });
  };

  const renderChart = (initChartData = []) => {
    const { Line } = g2plotComponent.current.value;
    lineChart && lineChart.destroy();
    lineChart = new Line(chantRef.current, {
      data: initChartData,
      xField: 'date',
      yField: 'value',
      seriesField: 'category',
      smooth: true,
      color: ['#61DDAA', '#2196F3'],
      xAxis: {
        label: {
          style: { fill: '#2C3542', opacity: 0.45 },
          formatter: date => moment(date).format(3 === dimension ? 'MM-DD' : 4 === dimension ? 'YYYY-MM' : 'HH:mm'),
        },
        line: { style: { stroke: '#416180', opacity: 0.45, lineWidth: 0.5 } },
        tickLine: { style: { fill: '#BDBDBD', opacity: 1 } },
      },
      yAxis: {
        label: {
          type: 'inner',
          offsetY: -3,
          // 数值格式化为千分位
          formatter: v => `${v}`.replace(/\d{1,3}(?=(\d{3})+$)/g, s => `${s},`),
          style: { fill: '#2C3542', opacity: 0.45 },
          grid: { line: { style: { stroke: 'rgba(65, 97, 128, 0.15)', lineWidth: 0.5 } } },
        },
      },
      legend: {
        position: 'bottom',
        offsetY: 10,
      },
      tooltip: {
        fields: ['category', 'value'],
        formatter: datum => {
          return { name: datum.category, value: formatNumberThousand(datum.value) };
        },
        showTitle: true,
        title: v => `${moment(v).format([3, 4].includes(dimension) ? 'MMMDo' : 'MMMDo HH:mm')}`,
        showContent: true,
        domStyles: {
          'g2-tooltip-list-item': { textAlign: 'left', color: '#151515' },
          'g2-tooltip-title': { color: '#757575' },
        },
      },
      slider: {
        height: 16,
        start: 0, // 1/ 24,
        end: 1,
        formatter: date =>
          moment(date).format(3 === dimension ? 'MM-DD' : 4 === dimension ? 'YYYY-MM' : 'YYYY-MM-DD HH:mm'),
        foregroundStyle: {
          fill: '#2196F3',
          opacity: 0.11,
        },
        TrendCfg: {
          backgroundStyle: {
            fill: '#F5F7F9',
            opacity: 1,
          },
          lineStyle: {
            fill: '#DBDBDB',
            opacity: 1,
          },
        },
      },
    });
    lineChart.on('slider:mouseup', (e = {}) => {
      const { filteredData = [] } = e.view;
      setState({
        startTime: (filteredData[0] || {}).time || '',
        endTime: (filteredData[filteredData.length - 1] || {}).time || '',
        pageNum: 1,
      });
    });
    lineChart.render();
  };

  const onSearch = useCallback(
    _.debounce(value => {
      setState({ keyWords: value, pageNum: 1 });
    }, 500),
    [],
  );

  const getNumStr = num => {
    return Number.isInteger(num / 10000) ? num / 10000 : (num / 10000).toFixed(4);
  };

  const renderLoading = () => {
    return (
      <div className="loadingChart h100 GrayBGFA w100 TxtCenter">
        <img src={loadingSvg} className="mTop80" />
      </div>
    );
  };

  return (
    <Wrap className="flexColumn h100">
      <div className="flexRow">
        <div className="flex">
          <h3 className="Bold Font24 mBottom0">{_l('统计')}</h3>
        </div>
        <ExecNumber projectId={props.currentProjectId} />
      </div>
      <div className="title Bold Font16 mTop30">{_l('实时')}</div>
      <ul className="timeNum flexRow mTop24">
        <li>
          <div className="des">{_l('本月读取记录行数')}</div>
          <div className="txt">
            {getNumStr(readCount)}
            <span className="mLeft5 Font14">{_l('万行')}</span>
          </div>
        </li>
        <li>
          <div className="des">{_l('本月写入记录行数')}</div>
          <div className="txt">
            {getNumStr(writeCount)}
            <span className="mLeft5 Font14">{_l('万行')}</span>
          </div>
        </li>
      </ul>
      <span className="title Bold Font16 mTop30">{_l('历史')}</span>
      <div className="flexRow mTop10 alignItemsCenter">
        <Dropdown
          className="timeDrop"
          menuStyle={{ width: '100%' }}
          data={dateArr}
          defaultValue={1}
          placeholder={_l('自定义')}
          value={startTime || endTime ? undefined : dimension}
          border
          onChange={value => {
            setState({ dimension: value, pageNum: 1, startTime: '', endTime: '' });
            getDetailInfo(value);
          }}
        />
        <span className="Gray_9e mLeft20">
          {_l('累计读取')}
          <span className="Bold Gray mLeft5">{formatNumberThousand(totalReadCount)}</span>
        </span>
        <span className="Gray_9e mLeft20">
          {_l('累计写入')}
          <span className="Bold Gray mLeft5">{formatNumberThousand(totalWriteCount)}</span>
        </span>
      </div>
      <div className="tableCon mTop24 Relative">
        <div className="chartBox" ref={chantRef} />
        {historyLoading && renderLoading()}
      </div>

      <div className="title Bold Font16 mTop30 flexRow">
        <span className="flex">{_l('详情')}</span>
        <SearchInput className="searchCon" placeholder={_l('任务名称/创建人')} onChange={onSearch} />
      </div>
      <div className="listTable">
        <div className="header trCon flexRow alignItemsCenter mTop16">
          <div className="item flex">{_l('任务')}</div>
          <div className="item flex">{_l('同步状态')}</div>
          <Sort
            sort={sort}
            listLoading={listLoading}
            onSort={sort => {
              setState({ sort, pageNum: 1 });
            }}
            txt={_l('读取')}
            keyStr={'readCount'}
          />
          <Sort
            sort={sort}
            listLoading={listLoading}
            onSort={sort => {
              setState({ sort, pageNum: 1 });
            }}
            txt={_l('写入')}
            keyStr={'writeCount'}
          />
          <div className="item flex">{_l('创建人')}</div>
        </div>

        {listLoading && pageNum <= 1 ? (
          <LoadDiv className="mTop40" />
        ) : (
          <React.Fragment>
            {list.length <= 0 && (
              <div className="TxtCenter pTop80 pBottom140 Font17 Gray_9e">
                {keyWords ? _l('暂无搜索结果') : _l('暂无相关数据')}
              </div>
            )}
            {list.map(o => {
              return (
                <div className={cx('trCon flexRow alignItemsCenter')}>
                  <div
                    className={cx('item flex Bold', { 'ThemeHoverColor3 Hand': !o.isDelete })}
                    onClick={() => {
                      if (o.isDelete) return;
                      window.open(`/integration/taskCon/${o.taskId}`);
                    }}
                  >
                    {o.taskName}
                  </div>
                  <div className="item flex Bold">{o.status === 'RUNNING' ? _l('开启') : _l('关闭')}</div>
                  <div className="item flex Bold">{formatNumberThousand(o.readCount)}</div>
                  <div className="item flex Bold">{formatNumberThousand(o.writeCount)}</div>
                  <div className="item flex">
                    {o.creator}
                    {o.createTime && (
                      <React.Fragment>
                        <span className="mLeft10 Gray_9e">{_l('创建于')}</span>
                        <span className="mLeft3 Gray_9e">{formatDate(o.createTime)}</span>
                      </React.Fragment>
                    )}
                  </div>
                </div>
              );
            })}
          </React.Fragment>
        )}
        {listLoading && pageNum > 1 && <LoadDiv />}
        {(!listLoading || totalPages > 1) && list.length > 0 && (
          <div className="pageCon TxtCenter mTop24">
            <Pagination
              total={totalElements}
              pageSize={pageSize}
              current={pageNum}
              hideOnSinglePage={false}
              showSizeChanger={false}
              onChange={pageNum => {
                setState({ pageNum });
              }}
            />
          </div>
        )}
      </div>
    </Wrap>
  );
}
