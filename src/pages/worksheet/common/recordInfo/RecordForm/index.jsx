import React, { Fragment, useContext, useEffect, useRef, useState } from 'react';
import DocumentTitle from 'react-document-title';
import { useMeasure } from 'react-use';
import cx from 'classnames';
import _, { get } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { ScrollView, Skeleton } from 'ming-ui';
import DragMask from 'worksheet/common/DragMask';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import { emitter } from 'worksheet/util';
import ViewContext from 'worksheet/views/ViewContext';
import CustomFields from 'src/components/newCustomFields';
import { updateRulesData } from 'src/components/newCustomFields/tools/formUtils';
import { controlState, getControlsByTab } from 'src/components/newCustomFields/tools/utils';
import { handlePrePayOrder } from 'src/pages/Admin/pay/PrePayorder';
import { browserIsMobile, formatNumberThousand } from 'src/util';
import SectionTableNav from '../../../../../components/newCustomFields/components/SectionTableNav';
import Abnormal from './Abnormal';
import FormCover from './FormCover';
import FormHeader from './FormHeader';
import FormSection, { getDefaultIsUnfold } from './FormSection';

export const RecordFormContext = React.createContext();

const ShadowCon = styled.div`
  width: 100%;
  position: absolute;
  left: 0;
  top: -6px;
  overflow: hidden;
`;

const HIDDEN_CONTROL_IDS = ['rowid'];
const NOT_LOGIN_HIDDEN_TYPES = [26, 27, 21, 48];

const Shadow = styled.div`
  margin-top: 6px;
  height: 6px;
  box-shadow: 0px 0px 6px 0px rgba(0, 0, 0, 0.16);
`;

const FixedCon = styled.div`
  z-index: -1;
  padding: 0px 24px;
  position: absolute;
  bottom: 0px;
  width: 100%;
  background: #fff;
`;

const Bottom = styled.div`
  height: 48px;
`;

const StickyBar = styled.div`
  cursor: pointer;
  position: sticky;
  margin-top: -32px;
  transition: 0.2s ease;
  left: 0px;
  top: 0px;
  right: 10px;
  padding: 0 14px 0 24px;
  opacity: 0;
  transform: translateY(-32px);
  z-index: 3;
  font-size: 12px;
  color: #515151;
  line-height: 32px;
  display: flex;
  background-color: #fff;
  cursor: pinter;
  .title {
    color: #757575;
  }
  .splitter {
    color: #757575;
    margin: 0 6px;
  }
  .content {
    flex: 1;
    font-weight: bold;
  }
  &#stickyBarActive {
    opacity: 1;
    transform: translateY(0px);
  }
`;
const PayWrap = styled.div`
  padding: 12px 25px;
  background: #f2fcf2;
  z-index: 4;
  position: sticky;
  top: 0;
`;
const PayButton = styled.div`
  padding: 0 40px;
  line-height: 32px;
  border-radius: 3px;
  color: #fff;
  background: rgba(76, 175, 80, 0.9);
  &:hover {
    background: rgba(76, 175, 80, 1);
  }
`;

function getTopHeight() {
  let height = Number(localStorage.getItem('recordinfoSplitHeight'));
  if (height > window.innerHeight - 140) {
    height = window.innerHeight - 140;
  }
  return height;
}

function mergeTabData(tabData = [], eventData = [], dealFrom) {
  const filterFn = (data = []) => {
    // 标签页下无可见字段，隐藏标签页
    return data
      .filter(tab => {
        if (tab.type === 52 && tab.controlId !== 'detail') {
          const childWidgets = eventData.filter(i => i.sectionId === tab.controlId);
          return !_.every(childWidgets, c => !(controlState(c, dealFrom).visible && !c.hidden));
        }
        return true;
      })
      .filter(t => controlState(t, dealFrom).visible && !t.hidden);
  };

  const tabControls = tabData.map(t => {
    const cur = _.find(eventData, e => e.controlId === t.controlId);
    return { ...t, fieldPermission: _.get(cur, 'fieldPermission') };
  });
  return filterFn(tabControls);
}

function RecordForm(props) {
  const {
    formWidth,
    iseditting,
    ignoreLock,
    hideFormHeader,
    type = 'edit',
    loading,
    from,
    isDraft,
    formFlag,
    abnormal,
    isLock,
    recordbase,
    maskinfo,
    controlProps = {},
    recordinfo = {},
    relateRecordData,
    view = {},
    showError,
    sheetSwitchPermit,
    mountRef,
    updateRecordDialogOwner,
    updateRows,
    updateRelateRecordTableCount = () => {},
    onRelateRecordsChange = () => {},
    updateWorksheetControls,
    registerCell = () => {},
    onChange,
    onCancel,
    onSave,
    saveDraft = () => {},
    onError,
    masterRecordRowId,
    loadRowsWhenChildTableStoreCreated,
    formDidMountFlag,
    onWidgetChange = () => {},
    onManualWidgetChange = () => {},
    widgetStyle = {},
    renderAbnormal,
    payConfig = {},
    onRefresh = () => {},
    onUpdateFormSectionWidth = () => {},
  } = props;
  let { formdata = [] } = props;
  formdata.forEach(item => {
    item.defaultState = {
      required: item.required,
      controlPermissions: item.controlPermissions,
      fieldPermission: item.fieldPermission,
      showControls: item.showControls,
    };
    (item.relationControls || []).forEach(c => {
      c.defaultState = {
        required: c.required,
        controlPermissions: c.controlPermissions,
        fieldPermission: c.fieldPermission,
      };
    });
  });
  const { isSmall, isSubList, worksheetId, recordId, recordTitle, allowEdit, viewId = '' } = recordbase;
  const viewContext = useContext(ViewContext);
  if (loading) {
    return (
      <div className="contentBox flex flexColumn">
        <div style={{ padding: 10 }}>
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['30%', '40%', '90%', '60%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
          <Skeleton
            style={{ flex: 1 }}
            direction="column"
            widths={['40%', '55%', '100%', '80%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
          <Skeleton
            style={{ flex: 2 }}
            direction="column"
            widths={['45%', '100%', '100%', '100%']}
            active
            itemStyle={{ marginBottom: '10px' }}
          />
        </div>
      </div>
    );
  }
  const dealFrom = recordId && from !== 21 ? 3 : 2;
  const getRulesData = updateRulesData({
    from: dealFrom,
    rules: recordinfo.rules,
    data: formdata,
    recordId,
  })
    .filter(control => controlState(control, dealFrom).visible)
    .map(c =>
      Object.assign(!ignoreLock && isLock ? { ...c, disabled: true } : c, {
        isDraft: from === RECORD_INFO_FROM.DRAFT,
      }),
    )
    .filter(c => !c.hidden);
  const { commonData = [], tabData = [] } = getControlsByTab(getRulesData, widgetStyle, dealFrom);

  // 事件导致的显隐，分栏折叠处要控制
  const [eventData, setEventData] = useState();
  const tabControls = mergeTabData(tabData, eventData || getRulesData, dealFrom);
  const defaultTabId = _.get(_.head(tabControls), 'controlId');
  const isFixedLeft = _.get(widgetStyle, 'tabposition') === '3';
  const isFixedRight = _.get(widgetStyle, 'tabposition') === '4';
  const isFixed = _.includes(['2', '3', '4'], _.get(recordinfo, 'advancedSetting.tabposition'));

  const scrollRef = useRef();
  const customwidget = useRef();
  const recordForm = useRef();
  const nav = useRef();
  const sectionTab = useRef();
  const [sizeRef, { width }] = useMeasure();
  const [isSplit, setIsSplit] = useState(
    Boolean(localStorage.getItem('recordinfoSplitHeight')) && recordId && tabControls.length && !isFixed, // 分栏只对标签页底部时生效
  );
  const [formHeight, setFormHeight] = useState(0);
  const [topHeight, setTopHeight] = useState(getTopHeight());
  const [dragVisible, setDragVisible] = useState();
  // 左右布局，非默认标签页，显示单独header
  const getActiveTabControl = tempId => {
    const sectionTabId = tempId || _.get(sectionTab, 'current.activeControlId') || defaultTabId;
    return (isFixedLeft || isFixedRight) && sectionTabId !== 'detail'
      ? _.find(tabControls, t => t.controlId === sectionTabId)
      : '';
  };
  const handleSectionClick = controlId => {
    const tempId = controlId || defaultTabId;
    if (isFixedLeft || isFixedRight) {
      if (tempId === _.get(customwidget, 'current.state.activeTabControlId')) return;
      customwidget && customwidget.current && customwidget.current.setActiveTabControlId(tempId);
      sectionTab && sectionTab.current && sectionTab.current.setActiveId(tempId);
      setTabHeaderControl(getActiveTabControl(tempId));

      const stickyBar = recordForm.current && recordForm.current.querySelector('.topCon .stickyBar');
      if (stickyBar) {
        stickyBar.id = tempId === 'detail' ? '' : 'stickyBarActive';
      }
      // 切换标签页，滚动条置顶，重新校验staticBar显示情况
      scrollToTable();
    }
  };
  const [tabHeaderControl, setTabHeaderControl] = useState(getActiveTabControl());
  const systemControlData = [
    {
      controlId: 'caid',
      type: 26,
      value: JSON.stringify([
        _.pick(recordId ? recordinfo.createAccount : md.global.Account, ['accountId', 'avatar', 'fullname']),
      ]),
    },
    {
      controlId: 'ownerid',
      type: 26,
      value: JSON.stringify([
        _.pick(recordId ? recordinfo.ownerAccount : md.global.Account, ['accountId', 'avatar', 'fullname']),
      ]),
    },
  ];
  useEffect(() => {
    mountRef(customwidget);
    setFormHeight(recordForm.current.clientHeight);
    setNavVisible();
    setSectionFixed(false);
  });
  useEffect(() => {
    setTimeout(() => {
      if (!loading && _.get(scrollRef, 'current.triggerNanoScroller')) {
        scrollRef.current.triggerNanoScroller();
      }
    }, 200);
  }, [loading]);

  function setSplit(value) {
    if (value) {
      safeLocalStorageSetItem('recordinfoSplitHeight', topHeight || formHeight * 0.5);
    } else {
      localStorage.removeItem('recordinfoSplitHeight');
    }
    setIsSplit(value);
    if (recordForm.current && !topHeight) {
      setTopHeight(formHeight * 0.5);
    }
  }
  function setNavVisible() {
    if (!tabControls.length || type !== 'edit' || !recordForm.current || !nav.current) {
      return;
    }
    if (_.get(scrollRef, 'current.triggerNanoScroller')) {
      scrollRef.current.triggerNanoScroller();
    }
    const scrollConElement = recordForm.current.querySelector('.recordInfoFormScroll');
    const formElement = recordForm.current.querySelector('.recordInfoFormContent .customFieldsContainer');
    const scrollContentElement = recordForm.current.querySelector('.recordInfoFormScroll > .nano-content');

    if (!scrollConElement || !formElement || !scrollContentElement) {
      return;
    }

    const visible =
      scrollContentElement.scrollTop + scrollConElement.clientHeight <
      formElement.clientHeight + formElement.offsetTop + 58 + 26 + 1;
    nav.current.style.zIndex = visible ? 3 : -1;
  }
  function setStickyBarVisible({ isSplit } = {}) {
    const scrollContentElement = recordForm.current.querySelector(
      isSplit ? '.topCon' : '.recordInfoFormScroll > .nano-content',
    );
    const stickyBar = recordForm.current.querySelector('.topCon .stickyBar');
    const recordTitle = recordForm.current.querySelector('.topCon .recordTitle');
    const visible = scrollContentElement.scrollTop > (recordTitle || {}).offsetTop + (recordTitle || {}).offsetHeight;
    stickyBar.id = visible || tabHeaderControl ? 'stickyBarActive' : '';
  }
  const Con = type === 'edit' && !isSplit ? ScrollView : React.Fragment;
  function scrollToTable() {
    const $recordInfoFormScroll = $(recordForm.current).find('.recordInfoFormScroll');
    const $relateRecordBlockCon = $(recordForm.current).find('.relateRecordBlockCon');
    if (isFixed) {
      $recordInfoFormScroll.nanoScroller({
        scrollTop: 0,
      });
      return;
    }
    $recordInfoFormScroll.nanoScroller({
      scrollTop: $relateRecordBlockCon[0].offsetTop - $recordInfoFormScroll.height() + 112 + 34 * 11,
    });
  }
  function setSectionFixed(isScroll = true) {
    if (isSplit || isFixedLeft || isFixedRight) return;
    const scrollContentElement = recordForm.current.querySelector('.recordInfoFormScroll > .nano-content');
    const sectionTabBarElement = recordForm.current.querySelector('.relateRecordBlock #widgetSectionTabBar');
    const headerElement = recordForm.current.querySelector('.recordInfoFormHeader');
    if (scrollContentElement && sectionTabBarElement) {
      const isHideHeader = _.get(view, 'advancedSetting.showtitle') === '0';
      let stickyH = isHideHeader ? 22 : 30;
      if (payConfig.isShowPay) {
        stickyH = 56;
      }
      if (!headerElement.clientHeight) {
        stickyH = 0;
      }
      const isFixed = scrollContentElement.scrollTop + stickyH >= sectionTabBarElement.offsetTop;
      // 记录详情切换因为支付导致的固定问题
      const preFixed = !isScroll && sectionTabBarElement && sectionTabBarElement.style.position === 'sticky';
      if (isFixed || preFixed) {
        $(sectionTabBarElement).css({
          position: 'sticky',
          top: stickyH,
          background: '#fff',
          zIndex: 3,
        });
      }
    }
  }
  const isMobile = browserIsMobile();

  const renderFormSection = () => {
    if (abnormal || formdata.length === 0) return null;
    return (
      <FormSection
        from={from === 21 ? 21 : dealFrom}
        tabControls={tabControls}
        widgetStyle={widgetStyle}
        ref={sectionTab}
        onClick={controlId => handleSectionClick(controlId)}
        onUpdateFormSectionWidth={onUpdateFormSectionWidth}
      />
    );
  };

  return (
    <RecordFormContext.Provider value={{ width, recordbase, iseditting }}>
      {isFixedLeft && renderFormSection()}
      <div className="recordInfoForm flex flexColumn" ref={recordForm}>
        {(from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND || from === RECORD_INFO_FROM.WORKFLOW) && recordTitle && (
          <DocumentTitle title={_l('记录-%0', recordTitle)} />
        )}
        {!abnormal && !!formdata.length && (
          <div className={cx(isSplit ? 'flexColumn' : 'flex', { isSplit })} ref={sizeRef}>
            {dragVisible && (
              <DragMask
                value={topHeight}
                direction="vertical"
                min={formHeight * 0.2}
                max={formHeight * 0.8}
                onChange={value => {
                  safeLocalStorageSetItem('recordinfoSplitHeight', value);
                  setTopHeight(value);
                  setDragVisible(false);
                }}
              />
            )}
            <Con
              {...(type === 'edit'
                ? {
                    className: 'recordInfoFormScroll Relative flex',
                    ref: scrollRef,
                    scrollEvent: () => {
                      setNavVisible();
                      setStickyBarVisible();
                      setSectionFixed();
                    },
                  }
                : {})}
            >
              <div
                className="topCon"
                style={isSplit ? { height: topHeight || 300 } : {}}
                onScroll={
                  isSplit
                    ? () => {
                        setStickyBarVisible({ isSplit: true });
                      }
                    : () => {}
                }
              >
                {type === 'edit' && !isSubList && !tabHeaderControl && (
                  <FormCover
                    flag={formFlag}
                    formData={formdata}
                    widgetStyle={widgetStyle}
                    worksheetId={worksheetId}
                    recordId={recordId}
                  />
                )}
                {payConfig.isShowPay && !tabHeaderControl && (
                  <PayWrap className="flexRow alignItemsCenter">
                    <div className="flex Bold Font14 ellipsis">{_l('支付内容：%0', payConfig.payDescription)}</div>
                    <span className="Gray mLeft25 Font17 Bold">
                      ¥ {_l('%0 元', formatNumberThousand(payConfig.payAmount))}
                    </span>
                    <PayButton
                      className="mLeft25 Bold Hand"
                      onClick={() => {
                        handlePrePayOrder({
                          worksheetId,
                          rowId: recordId,
                          paymentModule: md.global.Account.isPortal ? 3 : 2,
                          orderId: payConfig.orderId,
                          projectId: recordinfo.projectId || props.projectId,
                          appId: recordinfo.appId,
                          onUpdateSuccess: updateObj => {
                            onRefresh();
                          },
                        });
                      }}
                    >
                      {_l('付款')}
                    </PayButton>
                  </PayWrap>
                )}
                {type === 'edit' && (
                  <StickyBar
                    className="stickyBar"
                    onClick={() => {
                      recordForm.current.querySelector('.recordInfoFormScroll > .nano-content').scrollTop = 0;
                      // 左右布局时，回到顶部同时，跳转第一个标签页
                      if (tabHeaderControl) {
                        handleSectionClick();
                      }
                    }}
                  >
                    <div className="title">{recordinfo.worksheetName}</div>
                    <div className="splitter">/</div>
                    <div className="content ellipsis" title={recordTitle}>
                      {recordTitle}
                    </div>
                  </StickyBar>
                )}
                {type === 'edit' && !isSubList && !tabHeaderControl && (
                  <FormHeader
                    hideFormHeader={hideFormHeader}
                    view={view}
                    isLock={isLock}
                    recordbase={recordbase}
                    maskinfo={maskinfo}
                    recordinfo={recordinfo}
                    updateRecordDialogOwner={updateRecordDialogOwner}
                    sheetSwitchPermit={sheetSwitchPermit}
                    viewId={viewId}
                    from={from}
                  />
                )}
                {type === 'edit' && tabHeaderControl && (
                  <div className={cx(_.get(view, 'advancedSetting.showtitle') === '0' ? 'mTop30' : 'mTop46')}>
                    <div className="recordInfoFormHeader Gray_9 ">
                      <div className="recordTitleForSection flex">{_.get(tabHeaderControl, 'controlName')}</div>
                    </div>
                  </div>
                )}
                <div className={cx('recordInfoFormContent', { noAuth: !allowEdit })}>
                  <CustomFields
                    ignoreLock={ignoreLock}
                    forceFull={formWidth < 500 ? 1 : undefined}
                    ref={customwidget}
                    from={from === 21 ? from : recordId ? 3 : isMobile ? 5 : 2}
                    isDraft={from === RECORD_INFO_FROM.DRAFT || isDraft}
                    flag={formFlag}
                    formDidMountFlag={formDidMountFlag}
                    widgetStyle={widgetStyle}
                    controlProps={{ ...controlProps, updateWorksheetControls, updateRelateRecordTableCount }}
                    data={formdata.filter(
                      c =>
                        !_.includes(HIDDEN_CONTROL_IDS, c.controlId) &&
                        !(_.get(window, 'shareState.isPublicForm') && _.includes(NOT_LOGIN_HIDDEN_TYPES, c.type)),
                    )}
                    systemControlData={systemControlData}
                    rules={recordinfo.rules}
                    isWorksheetQuery={recordinfo.isWorksheetQuery}
                    disabled={!allowEdit}
                    projectId={recordinfo.projectId || props.projectId}
                    groupId={recordinfo.groupId}
                    masterRecordRowId={masterRecordRowId}
                    worksheetId={worksheetId}
                    recordId={recordId}
                    registerCell={registerCell}
                    showError={showError}
                    onChange={onChange}
                    onSave={onSave}
                    saveDraft={saveDraft}
                    onError={onError}
                    loadRowsWhenChildTableStoreCreated={loadRowsWhenChildTableStoreCreated}
                    sheetSwitchPermit={sheetSwitchPermit}
                    viewId={viewId}
                    showSplitIcon={type === 'edit' && commonData.length > 0}
                    appId={recordinfo.appId}
                    isCharge={get(viewContext, 'isCharge') || recordbase.isCharge}
                    onFormDataReady={dataFormat => {
                      setNavVisible();
                      if (!recordId) {
                        onChange(dataFormat.getDataSource(), [], { noSaveTemp: true });
                      }
                    }}
                    onWidgetChange={onWidgetChange}
                    onManualWidgetChange={onManualWidgetChange}
                    handleEventPermission={() => {
                      setEventData(_.get(customwidget, 'current.state.renderData'));
                    }}
                    // 关联列表拆进去补充参数
                    tabControlProp={{
                      formdata,
                      isSplit,
                      setSplit,
                      formWidth,
                      scrollToTable,
                      beginDrag: () => setDragVisible(true),
                      updateRelateRecordTableCount,
                      recordbase: { ...recordbase, allowEdit: isLock ? false : recordbase.allowEdit },
                      // 新建记录更新
                      relateRecordData,
                      setNavVisible,
                      splitTabDom: recordForm.current && recordForm.current.querySelector('#newCustomTabSectionWrap'),
                      onRelateRecordsChange,
                      updateWorksheetControls,
                      handleSectionClick,
                    }}
                  />
                </div>
              </div>
              {type === 'edit' && !isSplit && <Bottom />}
            </Con>
            <div id="newCustomTabSectionWrap" className={cx('relateRecordBlockCon', { flex: isSplit })}></div>
            {!isSplit && type === 'edit' && !!tabControls.length && (
              <FixedCon ref={nav}>
                <ShadowCon>
                  <Shadow />
                </ShadowCon>
                <SectionTableNav
                  sideVisible={controlProps.sideVisible}
                  showSplitIcon={!!recordId && commonData.length > 0}
                  widgetStyle={widgetStyle}
                  setSplit={setSplit}
                  isSplit={isSplit}
                  controls={tabControls}
                  onClick={controlId => {
                    customwidget.current.setActiveTabControlId(controlId);
                    scrollToTable();
                  }}
                />
              </FixedCon>
            )}
          </div>
        )}
        {(abnormal || formdata.length === 0) && (
          <Abnormal
            resultCode={recordinfo.resultCode}
            entityName={recordinfo.entityName}
            empty={!!formdata.length}
            renderAbnormal={renderAbnormal && recordinfo.resultCode === 7 && (() => renderAbnormal(recordinfo))}
          />
        )}
      </div>
      {isFixedRight && renderFormSection()}
    </RecordFormContext.Provider>
  );
}

RecordForm.propTypes = {
  type: PropTypes.string,
  loading: PropTypes.bool,
  showError: PropTypes.bool,
  formFlag: PropTypes.any,
  abnormal: PropTypes.bool,
  controlProps: PropTypes.shape({}),
  view: PropTypes.shape({}),
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  from: PropTypes.number,
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  relateRecordData: PropTypes.shape({}),
  mountRef: PropTypes.func,
  updateRecordDialogOwner: PropTypes.func,
  updateRows: PropTypes.func,
  onChange: PropTypes.func,
  onRelateRecordsChange: PropTypes.func,
  onSave: PropTypes.func,
  saveDraft: PropTypes.func,
  onCancel: PropTypes.func,
  addRefreshEvents: PropTypes.func,
  reloadRecord: PropTypes.func,
  registerCell: PropTypes.func,
  updateWorksheetControls: PropTypes.func,
};

export default function RecordFormCon(props) {
  const { loading, formWidth, widgetStyle = {} } = props;
  const isFixedLeft = _.get(widgetStyle, 'tabposition') === '3';
  const isUnfold = getDefaultIsUnfold(undefined, widgetStyle);
  if (loading) {
    const skeleton = (
      <Fragment>
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['30%', '40%', '90%', '60%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 1 }}
          direction="column"
          widths={['40%', '55%', '100%', '80%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
        <Skeleton
          style={{ flex: 2 }}
          direction="column"
          widths={['45%', '100%', '100%', '100%']}
          active
          itemStyle={{ marginBottom: '10px' }}
        />
      </Fragment>
    );
    return (
      <Fragment>
        {isFixedLeft && (
          <div style={{ padding: 10, width: isUnfold ? 220 : 55, borderRight: '1px solid #d9d9d9', flexShrink: 0 }}>
            {skeleton}
          </div>
        )}
        <div className="recordInfoForm flex flexColumn">
          <div style={{ padding: 10 }}>{skeleton}</div>
        </div>
      </Fragment>
    );
  }
  return <RecordForm {...props} />;
}

RecordFormCon.propTypes = {
  loading: PropTypes.bool,
  formWidth: PropTypes.number,
  widgetStyle: PropTypes.shape({}),
};
