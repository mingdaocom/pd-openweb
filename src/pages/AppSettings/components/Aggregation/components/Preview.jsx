import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { useSetState } from 'react-use';
import { Button, Icon, Tooltip, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import Pagination from 'worksheet/components/Pagination';
import ControlsDataTable from 'src/pages/worksheet/components/ControlsDataTable';
import emptyImg from './img/empty.png';
import { getNodeInfo } from '../util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { DEFAULT_COLORS } from '../config';
import _ from 'lodash';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';
import cx from 'classnames';
import moment from 'moment';
import Table from './Table';

const Wrap = styled.div`
  .coverTab {
    position: absolute;
    right: 20px;
    top: 12px;
    bottom: 0;
    left: 20px;
    z-index: 1;
    background: #f5f5f5;
    opacity: 0.5;
  }
  .warnCon {
    border-radius: 5px;
    padding: 8px 14px;
    margin: 20px 20px 0;
    &.isERR {
      background: #ffe2e2;
    }
    &.isRunning {
      background: #edf6ff;
    }
    &.hasRun {
      background: rgba(76, 175, 80, 0.09);
    }
    &.isStop {
      background: #fef9ed;
    }
    &.hasChange {
      .icon {
        color: #ff6c00;
      }
      background: #fff9ed;
    }
    .btn {
      padding: 9px 16px;
      background: #ffffff;
      border-radius: 3px;
      border: 1px solid #bfbfbf;
      &:hover {
        color: #2196f3;
        border: 1px solid #2196f3;
      }
    }
  }
  .searchInputComp.default .icon-search {
    font-size: 20px;
    &:hover {
      color: #2196f3 !important;
    }
  }
  .previewHeader {
    padding: 16px 24px 0;
  }
  .previewEmpty {
    & > div {
      margin-top: -100px;
    }
  }
  .previewBtn {
    padding: 9px 24px;
    line-height: 1 !important;
    min-width: 0;
    position: absolute;
    min-height: 0;
    left: 50%;
    top: 50%;
    transform: translate(-50%, -50%);
    &.disable {
      color: #bdbdbd;
      border: 1px solid #bdbdbd;
      &:hover {
        background: #fff;
      }
    }
  }
  .tableCon {
    width: 100%;
    height: 100%;
  }
  .icon-task-later {
    margin-top: -2px;
  }
  .previewBtnCon {
  }
`;
let ajaxPromise = null;
function useInterval(callback, delay) {
  const savedCallback = useRef(callback);
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  useEffect(() => {
    if (!delay && delay !== 0) {
      return;
    }
    const id = setInterval(() => savedCallback.current(), delay);
    return () => clearInterval(id);
  }, [delay]);
}
export default function Preview(props) {
  const { projectId, appId, renderErrerDialog, onChangePreview } = props;
  const [
    {
      flowData,
      data,
      loading,
      filters,
      pageIndex,
      pageSize,
      keyWords,
      count,
      controlList,
      time,
      worksheetId,
      syncTaskStatus,
      hasEdit,
    },
    setState,
  ] = useSetState({
    flowData: props.flowData,
    data: [],
    controls: [],
    loading: false,
    filters: [],
    keyWords: '',
    filterVisible: false,
    pageIndex: 1,
    pageSize: 100,
    count: 0,
    controlList: [],
    scan: false,
    time: null,
    worksheetId: props.flowData.worksheetId,
    syncTaskStatus: '',
    hasEdit: props.hasChange,
  });

  useEffect(() => {
    setState({
      hasEdit: props.hasChange,
      flowData: props.flowData,
      syncTaskStatus: props.hasChange ? '' : syncTaskStatus,
    });
    setControls(props.flowData);
  }, [props.flowData]);

  useEffect(() => {
    getCount();
  }, [keyWords, filters]);
  useEffect(() => {
    getData();
  }, [keyWords, pageIndex, pageSize, filters]);

  useInterval(
    () => {
      refresh();
    },
    ['CREATING', 'RUNNING'].includes(syncTaskStatus) ? 30000 : null,
  );

  const setControls = flowData => {
    let controlList = [];
    const groupDt = getNodeInfo(flowData, 'GROUP');
    const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
    const groupFields = _.get(groupDt, 'nodeConfig.config.groupFields') || [];
    const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
    controlList = groupFields
      .map(o => {
        return {
          ...o.resultField,
          ...o.resultField.controlSetting,
          controlName: o.resultField.alias,
          type: o.resultField.mdType,
          controlId: flowData.fieldIdAndAssignCidMap ? flowData.fieldIdAndAssignCidMap[o.resultField.id] : o.id,
          isGroupFields: true,
        };
      })
      .concat(
        aggregateFields.map(o => {
          return {
            ...o,
            ...o.controlSetting,
            controlName: o.alias,
            type: o.isCalculateField ? 31 : 6,
            controlId: flowData.fieldIdAndAssignCidMap ? flowData.fieldIdAndAssignCidMap[o.id] : o.id,
          };
        }),
      )
      .filter(o => !!o);
    setState({
      controlList: (controlList || []).map((o = {}) => {
        let index = -1;
        (props.sourceInfos || []).map((it, i) => {
          if (o.oid && o.oid.indexOf(it.worksheetId) >= 0) {
            index = i;
          }
        });
        return {
          ...o,
          //聚合的字段只有计算和数值两种icon
          icon: getIconByType(o.isCalculateField ? 31 : !o.isGroupFields ? 6 : o.mdType),
          color: o.isGroupFields || o.isCalculateField || index < 0 ? null : DEFAULT_COLORS[index],
        };
      }),
    });
  };

  const onRun = (syncTaskStatus = '') => {
    // UN_PUBLIC RUNNING STOP ERROR CREATING FINISHED
    setState({
      syncTaskStatus,
      hasEdit: false,
    });
    onChangePreview(syncTaskStatus === 'RUNNING');
  };

  const refresh = () => {
    if (!worksheetId || !['CREATING', 'RUNNING'].includes(syncTaskStatus)) {
      onRun();
      return;
    }
    getData(worksheetId);
    getCount(worksheetId);
    AggTableAjax.getPreviewTaskStatus({
      projectId,
      appId,
      aggTableId: flowData.id,
    }).then(res => {
      // const { syncTaskStatus } = res;
      //完成 UN_PUBLIC RUNNING STOP ERROR CREATING FINISHED
      onRun(res);
    });
  };

  const onPreview = async flowData => {
    let isSucceeded = true;
    let errorMsgList = [];
    //未发布过，或更改过配置 需要预览发布后拉取数据
    onRun('RUNNING');
    setState({
      time: moment().format('HH:mm:SS'),
    });
    const data = await AggTableAjax.publishTask({
      projectId,
      appId,
      aggTableId: flowData.id,
      preview: true, //是否预览
    });
    isSucceeded = data.isSucceeded;
    errorMsgList = data.errorMsgList;
    if (!isSucceeded) {
      onRun(worksheetId ? 'ERROR' : '');
      alert(errorMsgList.length <= 0 ? _l('聚合表预览失败') : errorMsgList.join(''), 3);
      return;
    }
    let newData = { ...flowData, fieldIdAndAssignCidMap: data.fieldIdAndAssignCidMap };
    setState({
      worksheetId: data.worksheetId,
      flowData: newData,
    });
    setControls(newData);
    getData(data.worksheetId);
    getCount(data.worksheetId);
  };
  const getCount = (worksheetId = flowData.worksheetId) => {
    if (!worksheetId) return;
    const fetchListParams = {
      worksheetId,
      pageSize,
      pageIndex,
      status: 1,
      // appId,
      sortControls: [],
      notGetTotal: true,
      searchType: 1,
      keyWords: keyWords,
      filterControls: filters,
    };
    sheetAjax.getFilterRowsTotalNum(fetchListParams).then(res => {
      setState({
        count: Number(res) || 0,
      });
    });
  };
  const getData = (worksheetId = flowData.worksheetId) => {
    if (loading || !worksheetId) return;
    if (ajaxPromise) ajaxPromise.abort();
    setState({
      loading: true,
    });
    const fetchListParams = {
      worksheetId,
      pageSize,
      pageIndex,
      status: 1,
      // appId,
      sortControls: [],
      notGetTotal: true,
      searchType: 1,
      keyWords: keyWords,
      filterControls: filters,
    };
    ajaxPromise = sheetAjax.getFilterRows(fetchListParams);
    ajaxPromise.then(res => {
      setState({
        data: _.get(res, 'data'),
        pageIndex,
        loading: false,
      });
    });
  };

  const changePageIndex = index => {
    if (loading) {
      return;
    }
    setState({
      pageIndex: index,
    });
  };

  return (
    <Wrap className="h100 flexColumn">
      {((hasEdit && flowData.worksheetId) || syncTaskStatus) && (
        <div
          className={cx('warnCon flexRow alignItemsCenter', {
            isRunning: syncTaskStatus === 'RUNNING',
            hasRun: syncTaskStatus === 'FINISHED',
            isStop: syncTaskStatus === 'STOP',
            hasChange: hasEdit,
            isERR: syncTaskStatus === 'ERROR',
          })}
        >
          {syncTaskStatus === 'RUNNING' && <LoadDiv size="small" className="mRight10" />}
          {hasEdit && <Icon icon="error" className="Font20 mRight10" />}
          {syncTaskStatus === 'FINISHED' && <div className="Bold mRight10">{_l('已完成')}</div>}
          {syncTaskStatus === 'STOP' && <div className="Bold mRight10">{_l('已停止')}</div>}
          <div className="flex">
            {syncTaskStatus === 'RUNNING' && _l('正在生成预览数据（截止%0），数据量大时需要较长时间', time)}
            {syncTaskStatus === 'FINISHED' && _l('生成截止%0的数据，共聚合%1行', time, count)}
            {/* {syncTaskStatus === 'STOP' && _l('处理%0行，剩余9,800行（截止%1）', count, time)} */}
            {syncTaskStatus === 'STOP' && _l('处理%0行（截止%1）', count, time)}
            {syncTaskStatus === 'ERROR' && _l('预览失败')}
            {hasEdit && _l('聚合表配置已更改，需要重新聚合后查看结果')}
          </div>
          <div
            className="btn Hand mLeft10 Bold"
            onClick={() => {
              syncTaskStatus !== 'RUNNING' && onPreview(flowData);
              onRun(syncTaskStatus === 'RUNNING' ? 'STOP' : 'RUNNING');
            }}
          >
            {syncTaskStatus === 'RUNNING' ? _l('停止') : syncTaskStatus === 'FINISHED' ? _l('更新') : _l('重新预览')}
          </div>
        </div>
      )}
      <React.Fragment>
        <div className="Font16 Gray flexRow alignItemsCenter Height36 previewHeader">
          <span className="flex Bold">{_l('预览')}</span>
          <React.Fragment>
            {(syncTaskStatus === 'RUNNING' || (!syncTaskStatus && worksheetId)) && ( //正在发布预览，可手动刷新数据
              <React.Fragment>
                {syncTaskStatus === 'RUNNING' && <div className="Bold Gray_9e Font13">{_l('每30秒自动刷新')}</div>}
                <Tooltip popupPlacement="bottom" text={<span>{_l('刷新')}</span>}>
                  <Icon
                    icon="task-later"
                    className="Gray_9e Font18 pointer mLeft10 mRight2 ThemeHoverColor3"
                    onClick={() => {
                      changePageIndex(1);
                      getData(worksheetId);
                      getCount(worksheetId);
                    }}
                  />
                </Tooltip>
              </React.Fragment>
            )}
            {worksheetId && (
              <Pagination
                className="pagination"
                pageIndex={pageIndex}
                pageSize={pageSize}
                allCount={count}
                // maxCount={maxCount}
                changePageSize={(pageSize, pageIndex) => {
                  setState({
                    pageSize,
                    pageIndex,
                  });
                }}
                changePageIndex={changePageIndex}
                onPrev={() => {
                  changePageIndex(pageIndex - 1);
                }}
                onNext={() => {
                  changePageIndex(pageIndex + 1);
                }}
              />
            )}
          </React.Fragment>
        </div>
        <div className="tabConB pLeft20 pRight20 Relative w100 h100 flex flexColumn">
          <div
            className={cx('tableCon mTop12 flex', {
              //Alpha7: hasEdit
            })}
          >
            {!worksheetId ? (
              <div className="flexRow alignItemsCenter h100 Relative">
                {controlList.length > 0 ? (
                  <React.Fragment>
                    <Table
                      loading={false}
                      controls={controlList}
                      showIcon
                      data={[]}
                      renderCon={() => {
                        return (
                          <div className="previewBtnCon flexRow alignItemsCenter">
                            <Button
                              type="ghost"
                              className="previewBtn"
                              onClick={e => {
                                onPreview(flowData);
                              }}
                            >
                              {_l('预览结果')}
                            </Button>
                          </div>
                        );
                      }}
                    />
                  </React.Fragment>
                ) : (
                  <div className="previewEmpty flex TxtCenter alignItemsCenter justifyContentCenter">
                    <div className="">
                      <img src={emptyImg} height={130} />
                      <div className="Gray_9e Font14 mTop20">{_l('从左侧面板中选择数据源和字段')}</div>
                    </div>
                  </div>
                )}
              </div>
            ) : (
              <ControlsDataTable loading={loading} controls={controlList} showIcon data={data} />
            )}
          </div>
        </div>
      </React.Fragment>
    </Wrap>
  );
}
