import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import moment from 'moment';
import { Button, Empty, Table } from 'ming-ui/antd-components';
import calendarAjax from 'src/api/calendar';
import createCalendar from 'src/components/createCalendar/load';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import { getCategoryIds, getEventCategoryColorClass } from './eventData';

export default function CalendarList({ filters, refreshToken, onOpenDetail, onOpenTask, onLoadingChange }) {
  const [calendars, setCalendars] = useState([]);
  const [queryEnd, setQueryEnd] = useState('');
  const [restCount, setRestCount] = useState(0);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [loadedRequestKey, setLoadedRequestKey] = useState(null);
  const initialRequestRef = useRef(0);
  const requestKey = useMemo(
    () =>
      JSON.stringify({
        categoryIds: filters.categoryIds,
        filterTaskType: filters.filterTaskType,
        isTaskCalendar: filters.isTaskCalendar,
        isWorkCalendar: filters.isWorkCalendar,
        memberIds: filters.memberIds,
        refreshToken,
      }),
    [filters, refreshToken],
  );

  const getRequestParams = useCallback(
    (startDate, endDate) => ({
      memberIDs: filters.memberIds.join(','),
      isTaskCalendar: filters.isTaskCalendar,
      filterTaskType: filters.filterTaskType,
      isWorkCalendar: filters.isWorkCalendar,
      categoryIDs: getCategoryIds(filters.categoryIds),
      startDate,
      endDate,
    }),
    [filters],
  );

  const loadInitialData = useCallback(() => {
    const requestId = initialRequestRef.current + 1;
    initialRequestRef.current = requestId;
    const startDate = moment().format('YYYY-MM-DD HH:mm:ss');
    const endDate = moment().add(2, 'months').startOf('month').format('YYYY-MM-DD');
    onLoadingChange(true);

    return calendarAjax
      .getCalendarList2(getRequestParams(startDate, endDate))
      .then(source => {
        if (initialRequestRef.current !== requestId) return;
        if (source.code !== undefined && Number(source.code) !== 1) throw new Error(source.msg);
        const data = source.data || {};
        setCalendars(data.calendars || []);
        setRestCount(Number(data.restCalCount) || 0);
        setQueryEnd(moment(endDate).add(1, 'month').format('YYYY-MM-DD'));
      })
      .catch(error => {
        console.error(error);
        alertIfNotUnauthorized(error, _l('日程列表加载失败'), 3);
      })
      .finally(() => {
        if (initialRequestRef.current === requestId) setLoadedRequestKey(requestKey);
        onLoadingChange(false);
      });
  }, [getRequestParams, onLoadingChange, requestKey]);

  useEffect(() => {
    loadInitialData();
    return () => {
      initialRequestRef.current += 1;
    };
  }, [loadInitialData, refreshToken]);

  const loadMore = () => {
    if (isLoadingMore || !restCount) return;
    setIsLoadingMore(true);
    const initialRequestId = initialRequestRef.current;
    const startDate = moment(queryEnd).subtract(1, 'month').format('YYYY-MM-DD');

    calendarAjax
      .getCalendarList2(getRequestParams(startDate, queryEnd))
      .then(source => {
        if (initialRequestRef.current !== initialRequestId) return;
        if (source.code !== undefined && Number(source.code) !== 1) throw new Error(source.msg);
        const data = source.data || {};
        setCalendars(current => [...current, ...(data.calendars || [])]);
        setRestCount(Number(data.restCalCount) || 0);
        setQueryEnd(moment(queryEnd).add(1, 'month').format('YYYY-MM-DD'));
      })
      .catch(error => {
        console.error(error);
        alertIfNotUnauthorized(error, _l('日程列表加载失败'), 3);
      })
      .finally(() => setIsLoadingMore(false));
  };

  const columns = useMemo(
    () => [
      {
        title: _l('分类'),
        dataIndex: 'backgroundColor',
        width: 70,
        align: 'center',
        onCell: () => ({ className: 'calendarListColorCell' }),
        render: color => (
          <span className={`calendarListColorDot ${getEventCategoryColorClass({ backgroundColor: color })}`} />
        ),
      },
      {
        title: _l('日期'),
        dataIndex: 'start',
        width: 120,
        render: value => moment(value).format('MMMDo'),
      },
      {
        title: _l('时间'),
        width: 150,
        render: (_, item) =>
          item.allDay
            ? _l('全天')
            : `${moment(item.startTime || item.start).format('HH:mm')} - ${moment(item.endTime || item.end).format('HH:mm')}`,
      },
      { title: _l('发起人'), dataIndex: 'createUserName', width: 160, ellipsis: true },
      { title: _l('事件'), dataIndex: 'title', ellipsis: true },
    ],
    [],
  );

  if (loadedRequestKey !== requestKey) return null;

  if (!calendars.length) {
    return (
      <div className="reactCalendarEmpty">
        <Empty description={_l('未找到今后的日程列表')} />
        <Button
          type="primary"
          onClick={() =>
            createCalendar({
              callback: () => {
                setLoadedRequestKey(null);
                loadInitialData();
              },
            })
          }
        >
          {_l('创建新日程')}
        </Button>
      </div>
    );
  }

  return (
    <div className="reactCalendarList">
      <Table
        className="reactCalendarListTable"
        columns={columns}
        dataSource={calendars}
        pagination={false}
        scroll={{ y: '100%' }}
        summary={() =>
          restCount ? (
            <Table.Summary.Row>
              <Table.Summary.Cell className="reactCalendarListMoreCell" index={0} colSpan={columns.length}>
                <div className="reactCalendarListMore">
                  <Button type="link" loading={isLoadingMore} onClick={loadMore}>
                    {_l('更多日程...')}
                  </Button>
                  {_l('至')} {queryEnd}
                </div>
              </Table.Summary.Cell>
            </Table.Summary.Row>
          ) : null
        }
        rowKey={item => `${item.eventID || item.id}-${item.recurTime || item.start}`}
        onRow={item => ({
          onClick: () => {
            if (item.isTask) {
              onOpenTask(item.eventID || item.id);
            } else {
              onOpenDetail({
                calendarId: item.eventID || item.id,
                recurTime: item.recurTime ? moment(item.recurTime).toISOString() : '',
              });
            }
          },
        })}
      />
    </div>
  );
}
