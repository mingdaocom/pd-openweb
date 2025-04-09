import React, { useState, useEffect, useImperativeHandle, forwardRef, Fragment } from 'react';
import { Icon, ScrollView, LoadDiv, Tooltip, UserHead, PreferenceTime, PullToRefreshWrapper } from 'ming-ui';
import { Divider } from 'antd';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
import moment from 'moment';
import filterXSS from 'xss';
import cx from 'classnames';
import _ from 'lodash';
import AddCondition from '../../common/WorkSheetFilter/components/AddCondition';
import TriggerSelect from './component/TriggerSelect';
import DatePickSelect from '../DatePickerSelect';
import sheetAjax from 'src/api/worksheet';
import './WorksheetRocordLog.less';
import {
  assembleListData,
  assembleNewLogListData,
  renderTitleName,
  renderTitleAvatar,
  renderTitleText,
  getExtendParams,
  hasHiddenControl,
  isUser,
  isPublicFileDownload,
} from './util';
import { filterOnlyShowField } from 'src/pages/widgetConfig/util';
import { browserIsMobile, getFeatureStatus } from 'src/util';
import createLinksForMessage from 'src/util/createLinksForMessage';
import { GET_SYSTEM_USER, EDIT_TYPE_TEXT, SUBLIST_FILE_EDIT_TYPE } from './enum.js';
import copy from 'copy-to-clipboard';
import UserPicker from './component/UserPicker';
import OperatePicker from './component/OperatePicker';
import ArchivedList from 'src/components/ArchivedList';
import WorksheetRecordLogItem from './component/WorksheetRecordLogItem';
import ExportTrigger from './component/ExportTrigger';
import { VersionProductType } from 'src/util/enum';

const reg = new RegExp('<[^<>]+>', 'g');
const PAGE_SIZE = 20;
const DISCUSS_LOG_ID = [];

function WorksheetRecordLog(props, ref) {
  const {
    controls,
    worksheetId,
    formdata,
    showFilter = true,
    filterUniqueIds = undefined,
    appId,
    projectId,
    rowId,
    roleType,
  } = props;
  const [{ loading, loadouted, sign, showDivider, lastMark, loadingAll }, setMark] = useSetState({
    loading: false,
    loadouted: false,
    sign: {
      newDataEnd: false,
      oldLogEnd: false,
      showLodOldButton: false,
    },
    showDivider: false,
    lastMark: undefined,
    loadingAll: false,
  });
  const controlsArray = controls && controls.length ? controls : formdata;
  const [{ selectUsers, selectField, selectDate, pageIndexs, requestType, archivedItem }, setPara] = useSetState({
    selectUsers: undefined,
    selectField: undefined,
    requestType: 0,
    selectDate: {
      visible: false,
      range: undefined,
    },
    pageIndexs: {
      newLogIndex: 1,
      oldLogIndex: 0,
    },
    archivedItem: {},
  });
  const [{ discussList, discussData }, setOldData] = useSetState({
    discussList: [],
    discussData: [],
  });
  const [{ newEditionData, newEditionList }, setNewData] = useSetState({
    newEditionData: [],
    newEditionList: [],
  });
  const [moreList, setMoreList] = useState([]);
  const [worksheetInfo, setWorksheetInfo] = useState({});
  let INIT_SIGN = false;
  const isMobile = browserIsMobile();

  useImperativeHandle(ref, () => ({
    reload: initLog,
    handleScroll: handleScroll,
  }));

  useEffect(() => {
    const { appId, worksheetId } = props;

    if (!appId) {
      sheetAjax
        .getWorksheetInfo({
          worksheetId: worksheetId,
          getViews: true,
          getSwitchPermit: true,
          getTemplate: true,
          getRules: true,
        })
        .then(res => {
          setWorksheetInfo(res);
        });
    }
  }, []);

  useEffect(() => {
    initLog();
  }, [props.rowId, props.filterUniqueIds]);

  useEffect(() => {
    if (
      ((selectUsers || selectField || selectDate.range) && pageIndexs.newLogIndex === 1) ||
      loading ||
      (INIT_SIGN && pageIndexs.newLogIndex === 1)
    ) {
      INIT_SIGN = false;
      return;
    }

    loadNewEdition({});
  }, [pageIndexs.newLogIndex]);

  useEffect(() => {
    pageIndexs.oldLogIndex && loadLog();
  }, [pageIndexs.oldLogIndex]);

  function initLog(isPullRefresh = false) {
    INIT_SIGN = true;
    setPara({
      selectUsers: undefined,
      selectField: undefined,
      selectDate: {
        visible: false,
        range: undefined,
      },
      requestType: 0,
      pageIndexs: {
        newLogIndex: 1,
        oldLogIndex: 0,
      },
    });
    setOldData({ discussList: [] });
    setMark({
      sign: {
        newDataEnd: false,
        oldLogEnd: false,
        showLodOldButton: false,
      },
      lastMark: undefined,
      loadouted: false,
    });
    loadNewEdition({
      lastMark: undefined,
      opeartorIds: undefined,
      filedId: undefined,
      startDateTime: undefined,
      endDateTime: undefined,
      requestType: 0,
    }, isPullRefresh);
  }

  const getParams = (param = {}) => {
    const { filedId, opeartorIds, startDateTime, endDateTime, archiveId } = param;

    return {
      opeartorIds:
        (param.hasOwnProperty('opeartorIds') ? opeartorIds : selectUsers && selectUsers.map(item => item.accountId)) ||
        [],
      controlIds: [param.hasOwnProperty('filedId') ? filedId : selectField && selectField.controlId].filter(l => l),
      startDate: param.hasOwnProperty('startDateTime') ? startDateTime : selectDate.range && selectDate.range.value[0],
      endDate: param.hasOwnProperty('endDateTime') ? endDateTime : selectDate.range && selectDate.range.value[1],
      lastMark: param.hasOwnProperty('lastMark') ? param.lastMark : lastMark,
      archiveId: param.hasOwnProperty('archiveId') ? archiveId : archivedItem.id,
      requestType: param.requestType !== undefined ? param.requestType : requestType || 0,
    };
  };

  function loadNewEdition(prop = {}, isPullRefresh) {
    const { worksheetId, rowId, pageSize = PAGE_SIZE, filterUniqueIds } = props;
    const params = getParams(prop);
    if (!isPullRefresh) setMark({ loading: true, loadingAll: !params.lastMark });
    const param = {
      worksheetId,
      pageSize,
      objectType: 2,
      rowId: rowId,
      ...params,
    };

    let promise = filterUniqueIds
      ? sheetAjax.batchGetWorksheetOperationLogs({ ...param, filterUniqueIds: filterUniqueIds })
      : sheetAjax.getWorksheetOperationLogs(param);
    promise.then(res => {
      setMark({ loading: false, loadingAll: false, lastMark: res.lastMark });
      let data = res.logs;
      setOldData({ newEditionData: pageIndexs.newLogIndex === 1 ? [] : newEditionData.concat(data) });

      if (data.length) {
        // 去重
        let _data = assembleNewLogListData(data.filter(l => !DISCUSS_LOG_ID.includes(m => m === l.id)));
        const loadNewLogEnd = data.length < PAGE_SIZE || data[data.length - 1].operatContent.type === 1;
        DISCUSS_LOG_ID.concat(data.map(l => l.operatContent.uniqueId));

        setNewData({ newEditionList: pageIndexs.newLogIndex === 1 ? _data : newEditionList.concat(_data) });
        setMark({
          sign: {
            ...sign,
            newDataEnd: loadNewLogEnd,
            showLodOldButton: loadNewLogEnd
              ? !data.find(l => l.operatContent.type === 1 || l.operatContent.type === 4)
              : sign.showLodOldButton,
          },
        });
      } else {
        setMark({
          sign: {
            ...sign,
            newDataEnd: true,
          },
          showDivider: pageIndexs.newLogIndex === 1 ? true : showDivider,
        });

        if (pageIndexs.newLogIndex === 1) {
          setPara({
            pageIndexs: {
              ...pageIndexs,
              oldLogIndex: 1,
            },
          });
          setNewData({ newEditionList: [] });
        }
      }
    });
  }

  function loadLog() {
    const { worksheetId, rowId, pageSize = PAGE_SIZE, filterUniqueIds } = props;

    if (filterUniqueIds) return;
    if (loadouted || selectUsers || selectField || selectDate.range) return;

    setMark({ loading: true });
    sheetAjax
      .getLogs({
        worksheetId,
        rowId,
        pageSize,
        pageIndex: pageIndexs.oldLogIndex,
      })
      .then(data => {
        setMark({ loading: false, loadingAll: false, loadouted: data.length < PAGE_SIZE });
        setOldData({ discussData: discussData.concat(data) });

        if (data.length) {
          // 去重
          let _data = assembleListData(data.filter(l => !DISCUSS_LOG_ID.includes(m => m === l.id)));
          DISCUSS_LOG_ID.concat(_data.map(l => l.id));
          setOldData({ discussList: discussList.concat(_data) });

          if (data[data.length - 1].templateId === 'addwsrow' || data.length < PAGE_SIZE) {
            setMark({
              sign: {
                ...sign,
                newDataEnd: true,
                oldLogEnd: true,
              },
            });
          }
        }
      });
  }

  const changeSelect = (e, para = {}, loadParam) => {
    e && e.stopPropagation();
    !loadParam && (loadParam = para);
    setMark({ lastMark: undefined });
    setPara({
      pageIndexs: {
        ...pageIndexs,
        newLogIndex: 1,
      },
      ...para,
    });
    para.hasOwnProperty('selectField') && setMoreList([]);
    loadNewEdition({ lastMark: undefined, ...loadParam });
  };

  const handleScroll = _.debounce(() => {
    if (
      ((selectUsers || selectField || selectDate.range) && sign.newDataEnd) ||
      loading ||
      (loadouted && sign.newDataEnd) ||
      (sign.newDataEnd && sign.oldLogEnd)
    )
      return;

    const param = {};

    if (!sign.newDataEnd) {
      param.newLogIndex = pageIndexs.newLogIndex + 1;
    } else if (sign.newDataEnd && !sign.oldLogEnd) {
      param.oldLogIndex = pageIndexs.oldLogIndex + 1;
    }

    setPara({
      pageIndexs: {
        ...pageIndexs,
        ...param,
      },
    });
  }, 500);

  const handleSelectThisUser = item => {
    let userInfo = {
      accountId: item.accountId,
      avatar: item.avatar,
      fullname: item.fullname,
    };

    if (GET_SYSTEM_USER().hasOwnProperty(item.accountId)) {
      userInfo = GET_SYSTEM_USER()[item.accountId];
    }

    let param = { selectUsers: [userInfo] };

    if (!isUser(userInfo)) {
      param.requestType = 0;
    }

    changeSelect(undefined, param, { opeartorIds: [userInfo.accountId] });
  };

  const selectArchivedItem = item => {
    changeSelect(
      undefined,
      { archivedItem: item || {} },
      item.id
        ? {
            archiveId: item.id,
            opeartorIds: undefined,
            filedId: undefined,
            startDateTime: undefined,
            endDateTime: undefined,
            requestType: 0,
          }
        : {},
    );
  };

  const onChangeData = data => {
    if (!data.value) {
      return;
    }

    changeSelect(
      undefined,
      {
        selectDate: {
          visible: false,
          range: {
            ...data,
            value: [data.value[0], data.value[1]],
          },
        },
      },
      {
        startDateTime: moment(data.value[0]).format('YYYY-MM-DD HH:mm:ss'),
        endDateTime: moment(data.value[1]).format('YYYY-MM-DD HH:mm:ss'),
      },
    );
  };

  const renderOldLog = () => {
    if (loadingAll || !!selectUsers || !!selectField || !!selectDate.range) return null;

    return discussList.map((item, index) => {
      return (
        <div className="worksheetRocordLogCard" key={`worksheetRocordLogCard-${item.time}-${index}`}>
          <div className="worksheetRocordLogCardTopBox">
            <div className="worksheetRocordLogCardTitle">
              <UserHead
                className="worksheetRocordLogCardTitleAvatar"
                size={20}
                user={{
                  accountId: item.accountId,
                  userHead: item.avatar,
                }}
                appId={appId}
                projectId={projectId}
                headClick={() => {}}
              />
              <span>
                {item.accountName} <span className="Gray_9e">{_l('更新了 %0 个字段', item.child.length)}</span>
              </span>
            </div>
            <PreferenceTime value={item.time} className="worksheetRocordLogCardName Gray_9e timeDataTip" />
          </div>
          {item.child.map(childData => {
            const message = createLinksForMessage({
              message: childData.message,
              accountId: childData.accountId,
              accountName: childData.accountName,
            });

            if (isMobile) {
              const con = message.replace(reg, '').split(' ');
              let userOrFlow = con && con.length && con[0];
              const actTxt = con && con.length && con[1];

              if (childData.accountId === 'user-workflow') {
                userOrFlow = userOrFlow.slice(3);
              }

              return (
                <div
                  className="logContent"
                  key={`logContent-${childData.id}`}
                  style={{ marginTop: 10, marginBottom: 10 }}
                >
                  <span>
                    {childData.accountId === 'user-workflow' ? _l('工作流') : ''}
                    <span className="Gray mRight5">{userOrFlow}</span>
                    {actTxt}
                  </span>
                </div>
              );
            }

            return (
              <div
                className="logContent"
                key={`logContent-${childData.id}`}
                style={{ marginTop: 10, marginBottom: 10 }}
                dangerouslySetInnerHTML={{ __html: filterXSS(message) }}
              />
            );
          })}
        </div>
      );
    });
  };

  const renderSelectCon = () => {
    if (!showFilter) return null;

    const featureStatus = getFeatureStatus(projectId, VersionProductType.batchDownloadFiles);
    const canExport = ['2', '5', '6'].includes(String(roleType)) && featureStatus;
    const columns = filterOnlyShowField(
      _.filter(
        controlsArray,
        it =>
          !_.includes([33, 47, 30, 22, 10010, 45, 43, 25, 51, 52], it.type) &&
          !_.includes(['caid', 'ctime', 'utime', 'daid', 'rowid', 'uaid'], it.controlId),
      ),
    );

    return (
      <div className={cx('selectCon', { hideEle: isMobile })}>
        {_.isEmpty(archivedItem) && (
          <div className="leftCon">
            <UserPicker
              projectId={projectId || worksheetInfo.projectId}
              appId={appId || worksheetInfo.appId}
              selectUsers={selectUsers}
              changeSelect={changeSelect}
            />
            {selectUsers && selectUsers.length === 1 && isUser(selectUsers[0]) && (
              <OperatePicker value={requestType} onChange={value => changeSelect(undefined, { requestType: value })} />
            )}
            <AddCondition
              columns={columns}
              defaultVisible={false}
              onAdd={control => changeSelect(undefined, { selectField: control }, { filedId: control.controlId })}
              comp={() => {
                return (
                  <span className={cx({ selectLight: selectField }, 'selectField')}>
                    <Icon icon="title" />
                    <span className="selectConText breakAll">{selectField ? selectField.controlName : _l('字段')}</span>
                    <Icon icon="arrow-down" style={selectField ? {} : { display: 'inline-block' }} />
                    {selectField && (
                      <Icon
                        icon="cancel1"
                        onClick={e => changeSelect(e, { selectField: undefined }, { filedId: undefined })}
                      />
                    )}
                  </span>
                );
              }}
              offset={[0, 5]}
            />
            <Trigger
              popupVisible={selectDate.visible}
              onPopupVisibleChange={visible =>
                setPara({
                  selectDate: {
                    ...selectDate,
                    visible: visible,
                  },
                })
              }
              action={['click']}
              popupAlign={{ points: ['tr', 'br'], offset: [0, 5] }}
              popup={<DatePickSelect onChange={onChangeData} />}
            >
              <span className={`${selectDate.range ? 'selectLight' : ''} selectDate`}>
                <Icon icon="event" />
                {selectDate.range && (
                  <React.Fragment>
                    <span className="selectConText">{selectDate.range.label}</span>
                    <Icon icon="arrow-down" />
                    <Icon
                      icon="cancel1"
                      onClick={e =>
                        changeSelect(
                          e,
                          {
                            selectDate: {
                              visible: selectDate.visible,
                              range: undefined,
                            },
                          },
                          { startDateTime: undefined, endDateTime: undefined },
                        )
                      }
                    />
                  </React.Fragment>
                )}
              </span>
            </Trigger>
          </div>
        )}
        <div className={cx('rightCon', { w100: !_.isEmpty(archivedItem) })}>
          <ArchivedList type={2} archivedItem={archivedItem} onChange={selectArchivedItem} />
          {_.isEmpty(archivedItem) && canExport && (
            <ExportTrigger
              worksheetId={worksheetId}
              rowId={rowId}
              projectId={projectId}
              filters={{
                opeartorIds: (selectUsers || []).map(item => item.accountId),
                controlIds: _.get(selectField, 'controlId') ? [_.get(selectField, 'controlId')] : undefined,
                startDate: _.get(selectDate, 'range.value[0]'),
                endDate: _.get(selectDate, 'range.value[1]'),
                requestType,
              }}
            />
          )}
        </div>
      </div>
    );
  };

  const renderEmpty = () => {
    if (newEditionList.length > 0 || (loading && loadingAll)) return null;

    const filterUniqueSign = !loading && filterUniqueIds && filterUniqueIds.length > 0;

    if (filterUniqueSign || (!loadingAll && (selectUsers || selectField || selectDate.range))) {
      return (
        <div
          className={cx('pBottom10 noneContent', filterUniqueSign ? 'Gray_75 Font13' : 'Gray_c')}
          style={{ paddingTop: '120px', textAlign: 'center' }}
        >
          {filterUniqueSign ? _l('无数据或无权限查看') : _l('暂无数据')}
        </div>
      );
    }

    return null;
  };

  const renderLogCardTitle = item => {
    const content = (
      <span className="selectTriggerChildAvatar WordBreak">
        {isPublicFileDownload(item) ? (
          <span className="worksheetRocordLogCardTitleAvatar">
            <Icon icon="worksheet" className="Gray_9e Font14 TxtMiddle" />
          </span>
        ) : (
          <UserHead
            className="worksheetRocordLogCardTitleAvatar"
            size={20}
            user={{
              accountId: item.accountId,
              userHead: item.avatar,
            }}
            appId={appId}
            projectId={projectId}
            headClick={() => {}}
          />
        )}

        {renderTitleName(item, isMobile)}
      </span>
    );

    return (
      <div className="worksheetRocordLogCardTitle flex w100">
        {isMobile || !showFilter ? (
          content
        ) : (
          <TriggerSelect text={_l('筛选此用户')} onSelect={() => handleSelectThisUser(item)}>
            {content}
          </TriggerSelect>
        )}
        {renderTitleAvatar(item, isMobile)}
        <span>
          <span className="Gray_9e">{renderTitleText(item, { controls: controlsArray })}</span>
        </span>
      </div>
    );
  };

  const isFilter = () => {
    return filterUniqueIds || selectUsers || selectField || selectDate.range;
  };

  const handlePullToRefresh = () => {
    const { refreshDiscussCount } = props;

    initLog(true);
    if (refreshDiscussCount) refreshDiscussCount();
  }

  return (
    <ScrollView className="logScroll flex worksheetRecordLog" onScrollEnd={handleScroll}>
      <PullToRefreshWrapper onRefresh={handlePullToRefresh}>
        <div className={cx('logBox', { mobileLogBox: isMobile })}>
          {renderSelectCon()}
          {renderEmpty()}
          {!loadingAll &&
          newEditionList.map((item, index) => {
            const { child } = item;
            const ua = getExtendParams(child[0].operatContent.extendParams, 'user_agent');

            return (
              <div className="worksheetRocordLogCard" key={`worksheetRocordLogCard-${item.time}-${index}`}>
                <div className={cx('worksheetRocordLogCardTopBox', { mBottom0: item.type === 1 })}>
                  {renderLogCardTitle(item)}
                  {!!ua && (
                    <Tooltip text={<span>{_l('复制创建时的UA信息')}</span>} popupPlacement="top">
                      <span
                        className="icon icon-copy Gray_9e Font18 Hand ThemeHoverColor3"
                        onClick={() => {
                          copy(ua);
                          alert(_l('复制成功'));
                        }}
                      />
                    </Tooltip>
                  )}
                  <PreferenceTime
                    value={item.time}
                    className="worksheetRocordLogCardName nowrap Gray_9e mLeft12 timeDataTip"
                  />
                </div>

                {item.child.map((childData, index) => {
                  const showTooltips = hasHiddenControl(childData.operatContent.logData, controlsArray);
                  const updateControlCount = childData.operatContent.logData.filter(
                    l => (l.oldValue || l.oldText) !== '' || (l.newValue || l.newText) !== '',
                  ).length;
                  const editType = _.get(childData, 'operatContent.logData[0].editType');
                  const editTypeText = editType ? EDIT_TYPE_TEXT[editType] : undefined;
                  const control = SUBLIST_FILE_EDIT_TYPE.includes(editType) ? controls.find(l => l.controlId === _.get(childData, 'operatContent.logData[0].id')) : undefined;

                  return (
                    <div
                      key={`worksheetRocordLogCardHrCon-${item.accountName}-${index}`}
                      className="worksheetRocordLogCardHrCon"
                    >
                      {childData.operatContent.createTime !== item.time && (
                        <div className="worksheetRocordLogCardHrTime">
                          <span>
                            {!!updateControlCount && (
                              <Fragment>
                                {!!editTypeText && updateControlCount === 1
                                  ? editTypeText
                                  : _l('更新了 %0个字段', updateControlCount)}
                                {control && <span className='Gray mLeft8'>{control.controlName}</span>}
                                {showTooltips && (
                                  <Tooltip popupPlacement="right" text={<span>{_l('部分字段无权限不可见')}</span>}>
                                    <Icon icon="info_outline" className="Font14 mLeft5" />
                                  </Tooltip>
                                )}
                              </Fragment>
                            )}
                          </span>
                          <PreferenceTime value={childData.operatContent.createTime} className="timeDataTip" />
                        </div>
                      )}
                      <WorksheetRecordLogItem
                        childData={childData}
                        recordInfo={props}
                        extendParam={{
                          selectField: selectField,
                          moreList: moreList,
                          setMoreList: setMoreList,
                          lastMark: lastMark,
                          showFilter: showFilter,
                        }}
                        selectFieldChange={control =>
                          changeSelect(undefined, { selectField: control }, { filedId: control.controlId })
                        }
                      />
                    </div>
                  );
                })}
              </div>
            );
          })}
          {!loadingAll && !isFilter() && sign.showLodOldButton && discussList.length === 0 && (
            <p className="loadOldLog">
              <span
                onClick={() => {
                  setPara({ pageIndexs: { ...pageIndexs, oldLogIndex: 1 } });
                  setMark({
                    sign: {
                      ...sign,
                      showLodOldButton: false,
                    },
                    showDivider: true,
                  });
                }}
              >
                {_l('继续查看旧版日志')}
              </span>
            </p>
          )}
          {!loadingAll && !isFilter() && showDivider && discussList.length > 0 && (
            <Divider className="logDivider">
              {_l('以下是旧版日志')}
              <Tooltip
                text={<span>{_l('旧版日志不支持进行筛选。因为新旧版本的升级，可能会产生一段时间重复记录的日志')}</span>}
              >
                <Icon className="Font12" icon="Import-failure" />
              </Tooltip>
            </Divider>
          )}
          {renderOldLog()}
        </div>
        {loading && <LoadDiv className="mBottom20" />}
      </PullToRefreshWrapper>
    </ScrollView>
  );
}

export default forwardRef(WorksheetRecordLog);
