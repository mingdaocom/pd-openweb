import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import { Button, Icon, Tooltip, LoadDiv } from 'ming-ui';
import sheetAjax from 'src/api/worksheet';
import Pagination from 'worksheet/components/Pagination';
import ControlsDataTable from 'src/pages/worksheet/components/ControlsDataTable';
import emptyImg from './img/empty.png';
import { getNodeInfo, isHasChange, getAllSourceList, getSourceIndex } from '../util';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { DEFAULT_COLORS } from '../config';
import _ from 'lodash';
import AggTableAjax from 'src/pages/integration/api/aggTable.js';
import cx from 'classnames';
import moment from 'moment';
import Table from './Table';
import { WrapPreview, TextAbsoluteCenter } from 'src/pages/AppSettings/components/Aggregation/components/style.jsx';

let ajaxPromise = null;
let ajaxPromisePublish = null;
let ajaxPromiseStatus = null;
function Preview(props) {
  const cache = useRef({});
  const { projectId, appId, onChangePreview } = props;
  const [
    {
      flowData,
      data,
      loading,
      previewRunning,
      filters,
      pageIndex,
      pageSize,
      keyWords,
      count,
      controlList,
      time,
      worksheetId,
      syncTaskStatus,
      hasChange,
      errorMsgList,
      disablePreview,
      version,
      isPublishing,
      sortControls,
      previewAgain,
    },
    setState,
  ] = useSetState({
    flowData: props.flowData,
    data: [],
    controls: [],
    loading: false,
    previewRunning: false,
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
    hasChange: props.hasChange,
    errorMsgList: [],
    disablePreview: true,
    version: Math.random(),
    isPublishing: false,
    sortControls: [],
    previewAgain: false,
  });

  useEffect(() => {
    if (props.flowData.worksheetId) {
      const { isAllChange } = isHasChange(props.flowData);
      //所有的映射都不匹配，不重新获取数据
      if (!isAllChange) {
        getData({ worksheetId: props.flowData.worksheetId });
      }
    }
  }, []);

  useEffect(() => {
    updateData(props);
  }, [props.flowData]);

  useEffect(() => {
    if (props.updating) {
      cache.current.syncTaskStatus = 'STOP';
      stopPreview();
    }
  }, [props.updating]);

  useEffect(() => {
    const { isAllChange, isDisPreview } = isHasChange(flowData);
    let param = {};
    if (isAllChange || isDisPreview) {
      param = {
        data: [],
        count: 0,
        previewAgain: true,
      };
    }
    setState({
      ...param,
      disablePreview: isDisPreview,
    });
  }, [flowData]);

  const updateData = nextProps => {
    const fieldIdAndAssignCidMap = (flowData || {}).fieldIdAndAssignCidMap;
    const datas = {
      ...nextProps.flowData,
      fieldIdAndAssignCidMap: fieldIdAndAssignCidMap || _.get(nextProps, 'flowData.fieldIdAndAssignCidMap'),
    };
    !_.isEqual(_.pick(flowData, ['aggTableNodes']), _.pick(nextProps.flowData, ['aggTableNodes'])) &&
      setState({
        syncTaskStatus: nextProps.isChange ? '' : syncTaskStatus,
        hasChange: hasChange || nextProps.isChange,
        flowData: datas,
      });
    cache.current.syncTaskStatus = nextProps.isChange ? '' : syncTaskStatus;
    setControls(datas);
  };

  // 左侧配置修改
  useEffect(() => {
    props.isChange &&
      !hasChange &&
      setState({
        hasChange: props.isChange,
      });
  }, [props.isChange]);

  //点击导航发布或保存
  useEffect(() => {
    !props.hasChange &&
      (hasChange || ['CREATING', 'RUNNING', 'PREPARE'].includes(syncTaskStatus)) &&
      setState({
        syncTaskStatus: '',
        hasChange: props.hasChange,
      });
  }, [props.hasChange]);

  const setControls = flowData => {
    let controlList = [];
    const groupDt = getNodeInfo(flowData, 'GROUP');
    const aggregateDt = getNodeInfo(flowData, 'AGGREGATE');
    const groupFields = _.get(groupDt, 'nodeConfig.config.groupFields') || [];
    const aggregateFields = _.get(aggregateDt, 'nodeConfig.config.aggregateFields') || [];
    const sourceDt = getNodeInfo(flowData, 'DATASOURCE');

    controlList = groupFields
      .map((o = {}) => {
        return {
          ...o.resultField,
          ...(_.get(o, 'resultField.controlSetting') || {}),
          controlName: _.get(o, 'resultField.alias'),
          type: [29, 31, 38, 32, 35].includes(_.get(o, 'resultField.mdType')) ? 2 : _.get(o, 'resultField.mdType'),
          controlId: flowData.fieldIdAndAssignCidMap ? flowData.fieldIdAndAssignCidMap[o.resultField.id] : o.id,
          isGroupFields: true,
          isRelative:
            (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length <= 1
              ? _.get(o, 'resultField.parentFieldInfo.controlSetting.controlId')
              : false,
        };
      })
      .concat(
        aggregateFields.map(o => {
          return {
            ...o,
            ...o.controlSetting,
            advancedSetting: o.isCalculateField
              ? _.get(o, 'controlSetting.advancedSetting') || {}
              : { ...(_.get(o, 'controlSetting.advancedSetting') || {}), showtype: '0' },
            controlName: o.alias,
            type: o.isCalculateField ? 31 : 6,
            controlId: flowData.fieldIdAndAssignCidMap ? flowData.fieldIdAndAssignCidMap[o.id] : o.id,
            isRelative: o.isCalculateField ? false : _.get(o, 'parentFieldInfo.controlSetting.controlId'),
          };
        }),
      )
      .filter(o => !!o);
    controlList = (controlList || []).map((o = {}) => {
      const sourceList = getAllSourceList(flowData) || [];
      const index = getSourceIndex(flowData, o);
      return {
        ...o,
        //聚合的字段只有计算和数值两种icon
        icon: getIconByType(o.isCalculateField ? 31 : !o.isGroupFields ? 6 : o.mdType),
        color:
          (o.isGroupFields && (_.get(sourceDt, 'nodeConfig.config.sourceTables') || []).length > 1) ||
          o.isCalculateField ||
          index < 0 ||
          sourceList.length <= 1
            ? null
            : DEFAULT_COLORS[index],
      };
    });
    setState({
      version: Math.random(),
      controlList,
    });
  };
  //更新当前页面状态     // UN_PUBLIC RUNNING STOP ERROR CREATING FINISHED PREPARE
  const onChangeStatus = (syncTaskStatus = '') => {
    setState({
      syncTaskStatus,
      hasChange: false,
    });
    cache.current.syncTaskStatus = syncTaskStatus;
  };

  const stopPreview = () => {
    onChangePreview(false);
    setState({
      previewRunning: false,
      loading: false,
      isPublishing: false,
    });
    if (ajaxPromisePublish) ajaxPromisePublish.abort();
    if (ajaxPromise) ajaxPromise.abort();
    if (ajaxPromiseStatus) ajaxPromiseStatus.abort();
  };

  useEffect(() => {
    if (syncTaskStatus === 'STOP') {
      stopPreview();
    } else {
      const isRunning = ['PREPARE', 'RUNNING'].includes(syncTaskStatus) || previewRunning;
      onChangePreview(isRunning);
    }
  }, [previewRunning, syncTaskStatus]);

  const getNumFetch = async worksheetId => {
    return sheetAjax.getFilterRowsTotalNum({
      worksheetId,
      status: 1,
      sortControls: [],
      searchType: 1,
    });
  };
  //轮询获取计数，计数>0则获取数据
  const getRunFetch = async worksheetId => {
    if (!worksheetId || cache.current.syncTaskStatus === 'STOP') return;
    if (ajaxPromise) ajaxPromise.abort();
    // console.log('轮询', moment().format('YYYY/MM/DD HH:mm:ss'));
    const allNum = await getNumFetch(worksheetId);
    setTimeout(() => {
      cache.current.syncTaskStatus !== 'STOP' && refresh();
    }, 2000);
    setState({
      count: allNum,
    });
    if (allNum <= 0 || allNum === count) {
      setState({
        loading: false,
      });
      return;
    }
    ajaxPromise = sheetAjax.getFilterRows({
      worksheetId,
      pageSize: pageSize,
      pageIndex: pageIndex,
      status: 1,
      sortControls: [],
      searchType: 1,
      keyWords: keyWords,
      filterControls: filters,
    });
    ajaxPromise.then(res => {
      setState({
        data: _.get(res, 'data') || [],
        pageSize: pageSize,
        pageIndex: pageIndex,
        loading: false,
        count: res.count,
      });
    });
  };

  //根据状态轮询
  const refresh = id => {
    if (cache.current.syncTaskStatus === 'STOP') return;
    let worksheetId = id || cache.current.worksheetId || worksheetId;
    if (ajaxPromiseStatus) {
      ajaxPromiseStatus.abort();
    }
    ajaxPromiseStatus = AggTableAjax.getPreviewTaskStatus(
      {
        projectId,
        appId,
        aggTableId: flowData.id,
      },
      { isAggTable: true },
    );
    ajaxPromiseStatus.then(async res => {
      const { taskStatus } = res;
      if (res.worksheetId && res.worksheetId !== worksheetId) {
        worksheetId = res.worksheetId;
        changeInfoWithWorksheetId(res);
      }
      //完成 UN_PUBLIC RUNNING STOP ERROR CREATING FINISHED
      onChangeStatus(taskStatus);
      if (!['CREATING', 'RUNNING'].includes(taskStatus)) {
        if ('FINISHED' === taskStatus) {
          //结束后获取计数，无计数=>则延迟2s重新获取计数和数据
          // console.log('结束后获取计数', moment().format('YYYY/MM/DD HH:mm:ss'));
          const allNum = await getNumFetch(worksheetId);
          if (allNum > 0) {
            getData({ worksheetId, withCount: false });
          } else {
            setState({
              previewRunning: true,
            });
            setTimeout(async () => {
              if (cache.current.syncTaskStatus !== 'STOP') {
                const count = await getNumFetch(worksheetId);
                if (count > 0) {
                  getData({
                    withCount: false,
                  });
                } else {
                  setState({
                    data: [],
                    count: 0,
                    loading: false,
                    previewRunning: false,
                  });
                }
              }
            }, 2000);
          }
        } else {
          getData({ worksheetId });
        }
      } else {
        getRunFetch(worksheetId);
      }
    });
  };

  const changeInfoWithWorksheetId = (data = {}) => {
    if (data.worksheetId) {
      const worksheetId = data.worksheetId || flowData.worksheetId;
      let newData = { ...flowData, worksheetId };
      setState({ worksheetId, flowData: newData, pageIndex: 1 });
      cache.current.worksheetId = worksheetId;
    }
  };

  //预览发布
  const onPreview = async flowData => {
    if (isPublishing || ['CREATING', 'RUNNING'].includes(syncTaskStatus)) return;
    setState({
      data: [],
      count: 0,
      loading: true,
      isPublishing: true,
      previewRunning: true,
      sortControls: [],
      previewAgain: false,
    });
    let isSucceeded = true;
    let errorMsgList = [];
    //未发布过，或更改过配置 需要预览发布后拉取数据
    onChangeStatus('PREPARE'); //先默认准备中
    setState({
      time: moment().format('HH:mm:ss'),
      errorMsgList,
      count: 0,
      data: [],
      pageIndex: 1,
    });
    try {
      ajaxPromisePublish = AggTableAjax.publishTask(
        {
          projectId,
          appId,
          aggTableId: flowData.id,
          preview: true, //是否预览
        },
        { isAggTable: true },
      );
      const data = await ajaxPromisePublish;
      ajaxPromisePublish = null;
      isSucceeded = data.isSucceeded;
      errorMsgList = data.errorMsgList;
      setState({
        errorMsgList,
        isPublishing: false,
      });
      if (!isSucceeded) {
        setState({
          previewRunning: false,
          loading: false,
        });
        onChangeStatus('ERROR');
        return;
      }
      let newData = { ...flowData, fieldIdAndAssignCidMap: data.fieldIdAndAssignCidMap };
      setState({ flowData: newData, pageIndex: 1 });
      setControls(newData);
      changeInfoWithWorksheetId(data);
      refresh(data.worksheetId); //发布成功开始轮询
    } catch (error) {
      if (cache.current.syncTaskStatus !== 'STOP') {
        onChangeStatus('ERROR');
        setState({
          errorMsgList,
          loading: false,
          isPublishing: false,
          previewRunning: false,
        });
      }
    }
  };
  //获取计数
  const getCount = (worksheetId = flowData.worksheetId) => {
    if (!worksheetId) return;
    const fetchListParams = {
      worksheetId,
      status: 1,
      sortControls: sortControls,
      searchType: 1,
    };
    sheetAjax.getFilterRowsTotalNum(fetchListParams).then(res => {
      setState({
        count: Number(res) || 0,
      });
    });
  };
  //获取rowDt
  const getData = ({
    worksheetId = cache.current.worksheetId || flowData.worksheetId,
    pI = pageIndex,
    pS = pageSize,
    sort = sortControls,
    withCount = true,
    withLoading,
  }) => {
    if (!worksheetId) return;
    if (ajaxPromise) ajaxPromise.abort();
    withLoading &&
      setState({
        loading: true,
      });
    withCount && getCount(worksheetId);
    const fetchListParams = {
      worksheetId,
      pageSize: pS,
      pageIndex: pI,
      status: 1,
      sortControls: sort,
      searchType: 1,
      keyWords: keyWords,
      filterControls: filters,
    };
    ajaxPromise = sheetAjax.getFilterRows(fetchListParams);
    ajaxPromise.then(res => {
      setState({
        worksheetId,
        data: _.get(res, 'data'),
        count: res.count,
        pageSize: pS,
        pageIndex: pI,
        loading: false,
        previewRunning: false,
      });
    });
  };
  const changePageIndex = index => {
    if (loading) {
      return;
    }
    getData({ worksheetId, pI: index, withLoading: true });
  };
  const noPublishAndHasPreview = flowData.aggTableTaskStatus === 0 && worksheetId && !syncTaskStatus && !hasChange; //未发布过但之前预览过
  const hsPublish = flowData.aggTableTaskStatus === 1;
  const hsFinished = (noPublishAndHasPreview || syncTaskStatus === 'FINISHED') && !previewRunning;
  const isRunning =
    ['PREPARE', 'RUNNING'].includes(syncTaskStatus) ||
    ((noPublishAndHasPreview || syncTaskStatus === 'FINISHED') && previewRunning);
  const showChange = hasChange && worksheetId;
  const renderTips = () => {
    return (
      <div
        className={cx('warnCon flexRow alignItemsCenter', {
          isRunning: isRunning,
          hasRun: hsFinished,
          isStop: syncTaskStatus === 'STOP',
          hasChange: showChange,
          isERR: ['ERROR', 'UN_PUBLIC'].includes(syncTaskStatus),
        })}
      >
        {showChange ? (
          <Icon icon="error" className="Font20 mRight10" />
        ) : ['ERROR', 'UN_PUBLIC'].includes(syncTaskStatus) ? (
          <Icon icon="cancel1" className="Font20 mRight10 Red" />
        ) : hsFinished ? (
          <React.Fragment>
            <Icon icon="check_circle" className="Font20 mRight10 finished" />
            <div className="Bold mRight10">
              {noPublishAndHasPreview
                ? _l('数据预览已完成（若需调整配置或预览最新数据请点击右侧重新预览）')
                : _l('已完成')}
            </div>
          </React.Fragment>
        ) : syncTaskStatus === 'STOP' ? (
          <React.Fragment>
            <Icon icon="pause" className="Font20 mRight10 stop" />
            <div className="Bold mRight10">{_l('已停止')}</div>
          </React.Fragment>
        ) : (
          isRunning && (
            <React.Fragment>
              <LoadDiv size="small" className="mRight10" />
              <div className="Bold mRight10">{'PREPARE' === syncTaskStatus ? _l('准备中...') : _l('聚合中...')}</div>
            </React.Fragment>
          )
        )}
        <div className={cx('flex', { Bold: hasChange })}>
          {showChange ? (
            _l('聚合表配置已更改，需要重新聚合后查看结果')
          ) : (
            <React.Fragment>
              {syncTaskStatus === 'RUNNING' && _l('正在生成预览数据，数据量大时需要较长时间')}
              {syncTaskStatus === 'PREPARE' && _l('正在从数据源同步数据')}
              {['ERROR', 'UN_PUBLIC'].includes(syncTaskStatus) && (
                <React.Fragment>
                  <span className="Bold">{_l('预览失败')}</span>
                  {(errorMsgList || []).length > 0 && (
                    <Tooltip
                      placement="bottom"
                      tooltipStyle={{
                        maxWidth: 350,
                        maxHeight: 300,
                        overflow: 'auto',
                      }}
                      text={<span className="InlineBlock WordBreak">{errorMsgList}</span>}
                    >
                      <Icon type={'error'} className="Gray_9e Font16 mLeft5 TxtMiddle InlineBlock" />
                    </Tooltip>
                  )}
                </React.Fragment>
              )}
            </React.Fragment>
          )}
        </div>
        <div
          className={cx('btn Hand mLeft10 Bold', {
            finishedBtn: hsFinished,
            refreshBtn: !['RUNNING', 'FINISHED', 'PREPARE'].includes(syncTaskStatus) || showChange,
            errBtn: ['ERROR', 'UN_PUBLIC'].includes(syncTaskStatus),
          })}
          onClick={() => {
            !['PREPARE', 'RUNNING'].includes(syncTaskStatus) && onPreview(flowData);
            onChangeStatus(['PREPARE', 'RUNNING'].includes(syncTaskStatus) ? 'STOP' : 'PREPARE');
          }}
        >
          {isRunning ? _l('停止') : _l('重新预览')}
        </div>
      </div>
    );
  };
  const renderTb = () => {
    const controlsForPreview = controlList.map(o => {
      o.advancedSetting && (o.advancedSetting.isdecrypt = '1');

      if (o.type === 6 && !o.dot) {
        o.dot = 0;
      }

      return o;
    });
    return (
      <React.Fragment>
        {!disablePreview && (
          <div className="Font16 Gray flexRow alignItemsCenter Height36 previewHeader">
            <span className="flex Bold">{hsPublish ? _l('查看数据') : _l('预览')}</span>
            {'PREPARE' !== syncTaskStatus && (
              <React.Fragment>
                {/* 聚合及聚合完成 或者当前页面已预览过 都显示刷新 */}
                {worksheetId && !isHasChange(flowData).isAllChange && (
                  <Tooltip popupPlacement="bottom" text={<span>{_l('刷新')}</span>}>
                    <Icon
                      icon="task-later"
                      className="Gray_9e Font18 pointer mLeft10 mRight2 ThemeHoverColor3"
                      onClick={() => {
                        getData({ worksheetId, pI: 1, withCount: false, withLoading: true });
                      }}
                    />
                  </Tooltip>
                )}
                {count > 0 && (
                  <Pagination
                    className="pagination Font13"
                    pageIndex={pageIndex}
                    pageSize={pageSize}
                    allCount={count}
                    changePageSize={(pageSize, pageIndex = 1) => {
                      getData({ worksheetId, pI: pageIndex, pS: pageSize, withCount: false, withLoading: true });
                    }}
                    changePageIndex={changePageIndex}
                    onPrev={() => {
                      getData({ worksheetId, pI: pageIndex - 1, withCount: false, withLoading: true });
                    }}
                    onNext={() => {
                      getData({ worksheetId, pI: pageIndex + 1, withCount: false, withLoading: true });
                    }}
                  />
                )}
              </React.Fragment>
            )}
          </div>
        )}
        {!disablePreview && !hsPublish && (
          <div className="Gray_75 Normal Font13 pLeft24 pRight25 mTop5">
            {_l(
              '预览时将从每个工作表获取最新的1000行数据进行聚合，点击右上角发布后会在后台异步聚合工作表内所有数据（注：数据量越多聚合速度越慢，请耐心等待）',
            )}
          </div>
        )}
        <div className="tabConB overflowHidden pLeft24 pRight24 Relative w100 flex flexColumn">
          <div className="tableCon mTop12 flex h100 overflowHidden">
            {!worksheetId || //未发布或预览过
            disablePreview || //配置错误
            (['ERROR', 'UN_PUBLIC', 'STOP'].includes(syncTaskStatus) && data.length <= 0) ? ( //预览失败，且获取的数据空
              <div className="flexRow alignItemsCenter h100 Relative">
                {!disablePreview ? (
                  <React.Fragment>
                    <Table
                      loading={false}
                      controls={controlList}
                      showIcon
                      data={[]}
                      renderCon={() => {
                        if (['ERROR', 'UN_PUBLIC', 'STOP'].includes(syncTaskStatus) && data.length <= 0) {
                          return (
                            <TextAbsoluteCenter style={{ color: '#9e9e9e' }}>
                              <div className="iconBox">
                                <i className="icon Icon icon-ic-line Gray_bd"></i>
                              </div>
                              <div className="mTop16 Font17">{_l('查看失败')}</div>
                            </TextAbsoluteCenter>
                          );
                        }
                        const disable = isPublishing || ['CREATING', 'RUNNING', 'PREPARE'].includes(syncTaskStatus);
                        return (
                          <div className="previewBtnCon flexRow alignItemsCenter">
                            <Button
                              type="ghost"
                              className={cx('previewBtn', {
                                disable,
                              })}
                              onClick={e => {
                                if (disable) return;
                                onPreview(flowData);
                              }}
                            >
                              {_l('预览数据')}
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
              <ControlsDataTable
                loading={
                  loading ||
                  (['PREPARE', 'RUNNING'].includes(syncTaskStatus) && data.length <= 0) ||
                  (['FINISHED'].includes(syncTaskStatus) && data.length <= 0 && previewRunning)
                }
                controls={controlsForPreview}
                canSort={!(loading || previewRunning)}
                sortControls={sortControls[0]}
                sortByControl={sortControls => {
                  getData({
                    worksheetId,
                    pI: 1,
                    pS: pageSize,
                    sort: sortControls,
                    withCount: false,
                    withLoading: true,
                  });
                }}
                key={version.toString()}
                showIcon
                data={data}
                emptyText={previewAgain ? _l('配置已更改，请重新预览') : _l('暂无数据')}
                chatButton={false}
                lineNumberBegin={(pageIndex - 1) * pageSize}
                enableRules={false}
                showEmptyForResize={false}
              />
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };
  return (
    <WrapPreview className="h100 flexColumn">
      {(showChange || syncTaskStatus || noPublishAndHasPreview) && !disablePreview && renderTips()}
      {renderTb()}
    </WrapPreview>
  );
}
export default Preview;
