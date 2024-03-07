import sheetAjax from 'src/api/worksheet';
import {
  getViewTimesList,
  formatRecordTime,
  formatRecordPoint,
  calculateTop,
  // calculateTotalHeight,
} from 'src/pages/worksheet/views/ResourceView/util.js';
import { sortGrouping, fillRecordTimeBlockColor } from 'src/pages/worksheet/views/GunterView/util.js';
import { formatQuickFilter, getFilledRequestParams } from 'worksheet/util';
import { getRequest } from 'src/util';
import _ from 'lodash';
import moment from 'moment';
import dayjs from 'dayjs';
import { types, timeWidth, timeWidthHalf } from 'src/pages/worksheet/views/ResourceView/config.js';
import { getHoverColor } from 'src/pages/worksheet/views/CalendarView/util.js';
import { isLightColor } from 'src/util';
import { sortDataByCustomItems } from 'src/pages/worksheet/redux/actions/util.js';

export const initData = () => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_RESOURCE_LOADINNG', data: true });
    dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_DATA', data: [] });
    dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_DATA_BY_KEY', data: [] });
    dispatch({ type: 'CHANGE_RESOURCE_KEYWORDS', data: '' });
    dispatch({ type: 'CHANGE_RESOURCE_CURRENT_TIME', data: null });
  };
};

export const fetchRows = (refresh = true) => {
  return (dispatch, getState) => {
    const { base, controls, views, filters, quickFilter = [], resourceview } = getState().sheet;
    const { access_token } = getRequest();
    const headersConfig = {
      Authorization: `access_token ${access_token}`,
    };
    const view = (base.viewId ? _.find(views, { viewId: base.viewId }) : views[0]) || {};
    const selectControl = _.find(controls, item => item.controlId === (view || {}).viewControl);
    const { gridTimes = [], currentTime, keywords } = resourceview;
    const type =
      localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
    const times = (_.get(view, 'advancedSetting.showtime') || '')
      .split('-')
      .map(item => dayjs(item, 'HH:mm').format('HH:mm'));
    let beginTime;
    let endTime;
    if (type === 'Month') {
      beginTime = moment((gridTimes[0] || {}).date).format('YYYY-MM-DD HH:mm');
      endTime = moment((gridTimes[gridTimes.length - 1] || {}).date).format('YYYY-MM-DD 23:59:59');
    } else {
      beginTime = `${moment((gridTimes[0] || {}).date).format('YYYY-MM-DD')} ${
        !!times[0] && times.length > 1 ? times[0] : '00:00'
      }`;
      endTime =
        type === 'Week'
          ? `${moment(moment((gridTimes[gridTimes.length - 1] || {}).date)).format('YYYY-MM-DD HH:59')}`
          : `${moment(moment((gridTimes[gridTimes.length - 1] || {}).date)).format('YYYY-MM-DD HH:59')}`;
    }

    refresh && dispatch({ type: 'CHANGE_RESOURCE_LOADINNG', data: true });
    sheetAjax
      .getFilterRows(
        getFilledRequestParams({
          beginTime,
          endTime,
          appId: base.appId,
          viewId: base.viewId,
          worksheetId: base.worksheetId,
          relationWorksheetId: selectControl && selectControl.type === 29 ? selectControl.dataSource : null,
          ...filters,
          fastFilters: formatQuickFilter(quickFilter),
          kanbanIndex: 1,
          kanbanSize: 50,
        }),
        access_token ? { headersConfig } : {},
      )
      .then(({ data, count, resultCode }) => {
        const resourceData = formatByGroup(
          sortDataByCustomItems(data, view, controls),
          view,
          controls,
          gridTimes,
          currentTime,
        );
        dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_DATA', data: resourceData });
        const list = resourceData.filter(o => o.name.toLowerCase().indexOf(keywords.toLowerCase()) >= 0);
        dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_DATA_BY_KEY', data: list });
        dispatch({ type: 'CHANGE_RESOURCE_LOADINNG', data: false });
      });
  };
};
//加载分组下的更多
export const fetchRowsByGroupId = (kanbanKey, kanbanIndex) => {
  return (dispatch, getState) => {
    const { base, controls, views, filters, quickFilter = [], resourceview } = getState().sheet;
    const { resourceData = [] } = resourceview;
    const { access_token } = getRequest();
    const headersConfig = {
      Authorization: `access_token ${access_token}`,
    };
    const view = base.viewId ? _.find(views, { viewId: base.viewId }) : views[0];
    const selectControl = _.find(controls, item => item.controlId === (view || {}).viewControl);
    const { gridTimes = [], currentTime, keywords } = resourceview;
    const type =
      localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
    const times = (_.get(view, 'advancedSetting.showtime') || '')
      .split('-')
      .map(item => dayjs(item, 'HH:mm').format('HH:mm'));
    let beginTime;
    let endTime;
    if (type === 'Month') {
      beginTime = moment((gridTimes[0] || {}).date).format('YYYY-MM-DD HH:mm');
      endTime = moment((gridTimes[gridTimes.length - 1] || {}).date).format('YYYY-MM-DD 23:59:59');
    } else {
      beginTime = `${moment((gridTimes[0] || {}).date).format('YYYY-MM-DD')} ${
        !!times[0] && times.length > 1 ? times[0] : '00:00'
      }`;
      endTime =
        type === 'Week'
          ? `${moment(moment((gridTimes[gridTimes.length - 1] || {}).date)).format('YYYY-MM-DD HH:59')}`
          : `${moment(moment((gridTimes[gridTimes.length - 1] || {}).date)).format('YYYY-MM-DD HH:59')}`;
    }

    // refresh && dispatch({ type: 'CHANGE_RESOURCE_LOADINNG', data: true });
    sheetAjax
      .getFilterRows(
        getFilledRequestParams({
          beginTime,
          endTime,
          appId: base.appId,
          viewId: base.viewId,
          worksheetId: base.worksheetId,
          relationWorksheetId: selectControl && selectControl.type === 29 ? selectControl.dataSource : null,
          ...filters,
          fastFilters: formatQuickFilter(quickFilter),
          kanbanIndex: 1,
          kanbanSize: 50,
          pageSize: 20,
          kanbanKey,
          pageIndex: kanbanIndex,
        }),
        access_token ? { headersConfig } : {},
      )
      .then(({ data, count, resultCode }) => {
        console.log(data);
        let rowsData = [];
        resourceData.map(o => {
          if (o.key === kanbanKey) {
            rowsData = o.rows.map(it => {
              return _.omit(it, [
                'color',
                'width',
                'startTime',
                'endTime',
                ' hoverColor',
                'fontColor',
                'left',
                'top',
                'height',
              ]);
            });
          }
        });
        dispatch(updateByKey(kanbanKey, rowsData.concat((_.get(data, '[0].rows') || []).map(o => JSON.parse(o)))));
      });
  };
};

export const getRelationControls = sourceId => {
  return (dispatch, getState) => {
    if (sourceId) {
      sheetAjax
        .getWorksheetControls({
          worksheetId: sourceId,
          getTemplate: true,
        })
        .then(({ code, data }) => {
          if (code === 1) {
            const { controls } = data;
            dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_RELATION_CONTROLS', data: controls });
          }
        });
    }
  };
};

const formatByGroup = (info, view, controls, gridTimes, currentTime) => {
  const type =
    localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
  const oneWidth = type !== 'Day' ? timeWidth : timeWidthHalf;
  return sortGrouping(
    info
      .filter(o => o.key !== '-1')
      .map(item => {
        const rows = formatRows(item, view, controls, gridTimes, true, currentTime);

        const { data, totalHeight } = calculateTop(rows, view, gridTimes * oneWidth);
        return {
          ...item,
          rows: data,
          height: totalHeight,
        };
      }),
  );
};

const formatRows = (item, view, controls, gridTimes, mustParse = true, currentTime) => {
  const rows = (item.rows || []).map(row => {
    let data = {
      ...formatRecordTime(mustParse ? JSON.parse(row) : row, view, controls), // startTime, endTime
      groupId: item.key,
    };
    let colorData = controls.find(it => it.controlId === _.get(view, 'advancedSetting.colorid')) || {};
    data = fillRecordTimeBlockColor(data, colorData);
    const hoverColor = getHoverColor(data.color);
    const fontColor = !isLightColor(hoverColor) ? '#fff' : '#333';
    data = {
      ...data, // color
      ...formatRecordPoint(data, view, gridTimes, controls, currentTime),
    };
    return {
      ...data, // left width
      hoverColor,
      fontColor,
    };
  });
  return rows;
};

export const refresh = () => {
  return (dispatch, getState) => {
    dispatch(fetchRows());
  };
};

export const getTimeList = cb => {
  return (dispatch, getState) => {
    const { views, base, resourceview } = getState().sheet;
    const view = base.viewId ? _.find(views, { viewId: base.viewId }) : views[0];
    const list = getViewTimesList(
      views.find(o => o.viewId === base.viewId),
      resourceview.currentTime,
    );
    const type =
      localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
    let listN = [];
    if (type === 'Month') {
      listN = list.list;
    } else if (type === 'Week') {
      list.list.map(o => listN.push(...o.times));
    } else {
      list.list.map(o => {
        o.times.map(it => {
          listN.push(it, { ...it, date: moment(it.date).add(30, 'm').format('YYYY-MM-DD HH:mm') });
        });
      });
    }
    dispatch({ type: 'CHANGE_RESOURCE_TIME_LIST', data: list });
    dispatch({ type: 'CHANGE_RESOURCE_TIME_LIST_A', data: listN });
    cb && cb();
  };
};

export const updateKeyWords = keywords => {
  return (dispatch, getState) => {
    const { resourceview } = getState().sheet;
    const { resourceData = [] } = resourceview;
    dispatch({ type: 'CHANGE_RESOURCE_KEYWORDS', data: keywords });
    const list = resourceData.filter(o => o.name.toLowerCase().indexOf(keywords.toLowerCase()) >= 0);
    dispatch(updateResourceDataByKeys(list));
  };
};

export const updateResourceDataByKeys = list => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_DATA_BY_KEY', data: list });
  };
};

export const updateCurrnetTime = time => {
  return (dispatch, getState) => {
    dispatch({ type: 'CHANGE_RESOURCE_CURRENT_TIME', data: time });
  };
};

export const updateRecordTime = (row, start, end, key, newKey) => {
  return (dispatch, getState) => {
    const { base, controls, resourceview, views } = getState().sheet;
    const view = base.viewId ? _.find(views, { viewId: base.viewId }) : views[0];
    const { keywords = '', resourceData, gridTimes, currentTime } = resourceview;
    const startControl = controls.find(o => o.controlId === _.get(view, 'advancedSetting.begindate')) || {};
    const endControl = controls.find(o => o.controlId === _.get(view, 'advancedSetting.enddate')) || {};
    const newOldControl = [];

    if (!_.isNull(start)) {
      newOldControl.push({
        controlId: _.get(view, 'advancedSetting.begindate'),
        controlName: startControl.controlName,
        dot: startControl.dot,
        type: startControl.type,
        value: startControl.type === 15 ? moment(start).format('YYYY-MM-DD') : start,
      });
    }

    if (!_.isNull(end)) {
      newOldControl.push({
        controlId: _.get(view, 'advancedSetting.enddate'),
        controlName: endControl.controlName,
        dot: endControl.dot,
        type: endControl.type,
        value: endControl.type === 15 ? moment(end).format('YYYY-MM-DD') : end,
      });
    }
    if (!!newKey) {
      const viewControlData = controls.find(o => o.controlId === view.viewControl) || {};
      const newData = resourceData.find(o => o.key === newKey);
      newOldControl.push({
        controlId: view.viewControl,
        controlName: viewControlData.controlName,
        dot: viewControlData.dot,
        type: viewControlData.type,
        value:
          viewControlData.type === 29
            ? JSON.stringify([{ name: newData.name, sid: newData.key }])
            : viewControlData.type === 26
            ? `[${newData.name}]`
            : newData.data,
      });
    }

    sheetAjax
      .updateWorksheetRow({
        appId: base.appId,
        rowId: row.rowid,
        viewId: base.viewId,
        worksheetId: base.worksheetId,
        newOldControl: newOldControl,
      })
      .then(res => {
        let rowsData = [];
        let rowsOldData = [];
        if (!newKey) {
          resourceData.map(o => {
            if (o.key === key) {
              rowsData = o.rows.map(it => {
                if (it.rowid === res.data.rowid) {
                  return _.omit({ ...it, ...res.data }, [
                    'color',
                    'width',
                    'startTime',
                    'endTime',
                    ' hoverColor',
                    'fontColor',
                    'left',
                    'top',
                    'height',
                  ]);
                } else {
                  return _.omit(it, [
                    'color',
                    'width',
                    'startTime',
                    'endTime',
                    ' hoverColor',
                    'fontColor',
                    'left',
                    'top',
                    'height',
                  ]);
                }
              });
            }
          });
        } else {
          resourceData.map(o => {
            if (o.key === newKey) {
              rowsData = o.rows.concat(res.data).map(it => {
                return _.omit(it, [
                  'color',
                  'width',
                  'startTime',
                  'endTime',
                  ' hoverColor',
                  'fontColor',
                  'left',
                  'top',
                  'height',
                ]);
              });
            } else {
              if (key === o.key) {
                rowsOldData = o.rows
                  .filter(it => it.rowid !== row.rowid)
                  .map(it => {
                    return _.omit(it, [
                      'color',
                      'width',
                      'startTime',
                      'endTime',
                      ' hoverColor',
                      'fontColor',
                      'left',
                      'top',
                      'height',
                    ]);
                  });
              }
            }
          });
        }
        !!newKey ? dispatch(updateByKey(newKey, rowsData, key, rowsOldData)) : dispatch(updateByKey(key, rowsData));
      });
  };
};

export const updateByKey = (key, rowsData, key1, rowsData1) => {
  return (dispatch, getState) => {
    console.log(key, rowsData, key1, rowsData1);
    const { base, controls, resourceview, views } = getState().sheet;
    const view = base.viewId ? _.find(views, { viewId: base.viewId }) : views[0];
    const { keywords = '', resourceData, gridTimes, currentTime } = resourceview;
    const getNewData = (o, rowsData) => {
      let item = {
        ...o,
        rows: rowsData,
      };
      const rows = formatRows(item, view, controls, gridTimes, false, currentTime);
      const type =
        localStorage.getItem(`${view.viewId}_resource_type`) || types[_.get(view, 'advancedSetting.calendarType') || 0];
      const oneWidth = type !== 'Day' ? timeWidth : timeWidthHalf;
      const { data, totalHeight } = calculateTop(rows, view, gridTimes * oneWidth);
      return {
        ...item,
        rows: data,
        height: totalHeight,
      };
    };
    const dataResource = resourceData.map(o => {
      if (o.key === key) {
        return getNewData(o, rowsData);
      } else if (o.key === key1) {
        return getNewData(o, rowsData1);
      } else {
        return o;
      }
    });
    dispatch({ type: 'CHANGE_RESOURCE_RESOURCE_DATA', data: dataResource });
    const list = dataResource.filter(o => o.name.toLowerCase().indexOf(keywords.toLowerCase()) >= 0);
    dispatch(updateResourceDataByKeys(list));
  };
};
