import React, { useState, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import styled from 'styled-components';
import { ScrollView } from 'ming-ui';
import DocumentTitle from 'react-document-title';
import Skeleton from 'src/router/Application/Skeleton';
import { isRelateRecordTableControl } from 'worksheet/util';
import { RECORD_INFO_FROM } from 'worksheet/constants/enum';
import CustomFields from 'src/components/newCustomFields';
import DragMask from 'worksheet/common/DragMask';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { updateRulesData } from 'src/components/newCustomFields/tools/filterFn';
import FormHeader from './FormHeader';
import Abnormal from './Abnormal';
import RelateRecordTableNav from './RelateRecordTableNav';
import RelateRecordBlock from './RelateRecordBlock';
import { browserIsMobile } from 'src/util';

const ShadowCon = styled.div`
  width: 100%;
  position: absolute;
  left: 0;
  top: -6px;
  overflow: hidden;
`;

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
  transition: 0.4s ease;
  left: 0px;
  top: 0px;
  right: 10px;
  padding: 0 14px 0 24px;
  opacity: 0;
  transform: translateY(-32px);
  z-index: 2;
  font-size: 12px;
  color: #515151;
  line-height: 32px;
  display: flex;
  background-color: rgba(255, 255, 255, 0.9);
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
export default function RecortForm(props) {
  const {
    formWidth,
    ignoreHeader,
    type = 'edit',
    loading,
    from,
    formFlag,
    abnormal,
    recordbase,
    controlProps = {},
    recordinfo = {},
    relateRecordData,
    view = {},
    showError,
    iseditting,
    sheetSwitchPermit,
    mountRef,
    registeRefreshEvents,
    updateRecordDailogOwner,
    updateRows,
    updateRelateRecordNum = () => {},
    onRelateRecordsChange = () => {},
    registerCell = () => {},
    onChange,
    onCancel,
    onSave,
    reloadControls,
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
  if (loading) {
    return (
      <div className="contentBox flexColumn" style={{ width: formWidth }}>
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
  const relateRecordTableControls = _.sortBy(
    updateRulesData({
      from: recordId ? 3 : 2,
      rules: recordinfo.rules,
      data: formdata,
    }).filter(control => isRelateRecordTableControl(control) && controlState(control, recordId ? 3 : 2).visible),
    'row',
  );
  const customwidget = useRef();
  const recordForm = useRef();
  const nav = useRef();
  const [isSplit, setIsSplit] = useState(
    Boolean(localStorage.getItem('recordinfoSplitHeight')) && recordId && relateRecordTableControls.length,
  );
  const [formHeight, setFormHeight] = useState(0);
  const [topHeight, setTopHeight] = useState(Number(localStorage.getItem('recordinfoSplitHeight')));
  const [dragVisible, setDragVisible] = useState();
  const [navScrollLeft, setNavScrollLeft] = useState(0);
  const [relateNumOfControl, setRelateNumOfControl] = useState({});
  const [activeRelateRecordControlId, setActiveRelateRecordControlId] = useState();
  const systemControlData = [
    {
      controlId: 'caid',
      value: JSON.stringify([
        _.pick(recordId ? recordinfo.createAccount : md.global.Account, ['accountId', 'avatar', 'fullname']),
      ]),
    },
    {
      controlId: 'ownerid',
      value: JSON.stringify([
        _.pick(recordId ? recordinfo.ownerAccount : md.global.Account, ['accountId', 'avatar', 'fullname']),
      ]),
    },
  ];
  useEffect(() => {
    mountRef(customwidget);
    setFormHeight(recordForm.current.clientHeight);
    setNavVisible();
  });
  useEffect(() => {
    if (!recordId) {
      try {
        onChange(customwidget.current.dataFormat.getDataSource(), { noSaveTemp: true });
      } catch (err) {
        console.log(err);
      }
    }
  }, [loading]);
  function setSplit(value) {
    if (value) {
      localStorage.setItem('recordinfoSplitHeight', topHeight || formHeight * 0.5);
    } else {
      localStorage.removeItem('recordinfoSplitHeight');
    }
    setIsSplit(value);
    if (recordForm.current && !topHeight) {
      setTopHeight(formHeight * 0.5);
    }
  }
  function setNavVisible() {
    if (!relateRecordTableControls.length || type !== 'edit' || !recordForm.current || !nav.current) {
      return;
    }
    const scrollConElement = recordForm.current.querySelector('.recordInfoFormScroll');
    const formElement = recordForm.current.querySelector('.recordInfoFormContent .customFieldsContainer');
    const scrollContentElement = recordForm.current.querySelector('.recordInfoFormScroll > .nano-content');
    const visible =
      scrollContentElement.scrollTop + scrollConElement.clientHeight <
      formElement.clientHeight + formElement.offsetTop + 58 + 26 + 1;
    nav.current.style.zIndex = visible ? 1 : -1;
  }
  function setStickyBarVisible() {
    const scrollContentElement = recordForm.current.querySelector('.recordInfoFormScroll > .nano-content');
    const stickyBar = recordForm.current.querySelector('.recordInfoFormScroll .stickyBar');
    const recordTitle = recordForm.current.querySelector('.recordInfoFormScroll .recordTitle');
    const visible = scrollContentElement.scrollTop > recordTitle.offsetTop + recordTitle.offsetHeight;
    stickyBar.id = visible ? 'stickyBarActive' : '';
  }
  const Con = type === 'edit' && !isSplit ? ScrollView : React.Fragment;
  function scrollToTable() {
    const $recordInfoFormScroll = $(recordForm.current).find('.recordInfoFormScroll');
    const $relateRecordBlockCon = $(recordForm.current).find('.relateRecordBlockCon');
    $recordInfoFormScroll.nanoScroller({
      scrollTop: $relateRecordBlockCon[0].offsetTop - $recordInfoFormScroll.height() + 112 + 34 * 11,
    });
  }
  return (
    <div className="recordInfoForm flexColumn" ref={recordForm} style={{ width: !abnormal ? formWidth : '100%' }}>
      {(from === RECORD_INFO_FROM.WORKSHEET_ROW_LAND || from === RECORD_INFO_FROM.WORKFLOW) && recordTitle && (
        <DocumentTitle title={_l('记录-%0', recordTitle)} />
      )}
      {!abnormal && !!formdata.length && (
        <div className={cx(isSplit ? 'flexColumn' : 'flex', { isSplit })}>
          {dragVisible && (
            <DragMask
              value={topHeight}
              direction="vertical"
              min={formHeight * 0.2}
              max={formHeight * 0.8}
              onChange={value => {
                localStorage.setItem('recordinfoSplitHeight', value);
                setTopHeight(value);
                setDragVisible(false);
              }}
            />
          )}
          <Con
            {...(type === 'edit'
              ? {
                  className: 'recordInfoFormScroll Relative flex',
                  scrollEvent: () => {
                    setNavVisible();
                    setStickyBarVisible();
                  },
                }
              : {})}
          >
            <div className="topCon" style={isSplit ? { height: topHeight || 300 } : {}}>
              {type === 'edit' && (
                <StickyBar
                  className="stickyBar"
                  onClick={() => {
                    recordForm.current.querySelector('.recordInfoFormScroll > .nano-content').scrollTop = 0;
                  }}
                >
                  <div className="title">{recordinfo.worksheetName}</div>
                  <div className="splitter">/</div>
                  <div className="content ellipsis" title={recordTitle}>
                    {recordTitle}
                  </div>
                </StickyBar>
              )}
              {type === 'edit' && !isSubList && (
                <FormHeader
                  view={view}
                  recordbase={recordbase}
                  recordinfo={recordinfo}
                  updateRecordDailogOwner={updateRecordDailogOwner}
                />
              )}
              <div className={cx('recordInfoFormContent', { noAuth: !allowEdit })}>
                <CustomFields
                  forceFull={formWidth < 500 ? 1 : undefined}
                  ref={customwidget}
                  from={recordId ? 3 : 2}
                  flag={formFlag}
                  controlProps={controlProps}
                  data={formdata.filter(control => !(view.controls || []).includes(control.controlId))}
                  systemControlData={systemControlData}
                  rules={recordinfo.rules}
                  isWorksheetQuery={recordinfo.isWorksheetQuery}
                  disabled={!allowEdit}
                  projectId={recordinfo.projectId}
                  worksheetId={worksheetId}
                  recordId={recordId}
                  registerCell={registerCell}
                  showError={showError}
                  onChange={onChange}
                  sheetSwitchPermit={sheetSwitchPermit}
                  viewId={viewId}
                />
              </div>
            </div>
            <div className={cx('relateRecordBlockCon', { flex: isSplit })}>
              {!browserIsMobile() && !!relateRecordTableControls.length && (
                <RelateRecordBlock
                  formWidth={formWidth}
                  sideVisible={controlProps.sideVisible}
                  isSplit={isSplit}
                  setSplit={setSplit}
                  formdata={formdata.concat(systemControlData)}
                  beginDrag={() => setDragVisible(true)}
                  relateNumOfControl={relateNumOfControl}
                  navScrollLeft={navScrollLeft}
                  activeId={activeRelateRecordControlId || relateRecordTableControls[0].controlId}
                  recordbase={recordbase}
                  recordinfo={recordinfo}
                  controls={relateRecordTableControls}
                  relateRecordData={relateRecordData}
                  sheetSwitchPermit={sheetSwitchPermit}
                  registeRefreshEvents={registeRefreshEvents}
                  setRelateNumOfControl={(value, controlId) => {
                    reloadControls(formdata.filter(c => c.dataSource.slice(1, -1) === controlId).map(c => c.controlId));
                    setRelateNumOfControl({ ...relateNumOfControl, ...value });
                    updateRows(
                      [recordId],
                      {
                        ...[{}, ...recordinfo.receiveControls, value].reduce((a, b) =>
                          Object.assign({}, a, { [b.controlId]: b.value }),
                        ),
                        ...value,
                        rowid: recordId,
                      },
                      value,
                    );
                    updateRelateRecordNum(controlId, value[controlId]);
                  }}
                  onRelateRecordsChange={onRelateRecordsChange}
                  onActiveIdChange={controlId => {
                    setActiveRelateRecordControlId(controlId);
                  }}
                  onScrollLeftChange={value => {
                    setNavScrollLeft(value);
                  }}
                  scrollToBottom={scrollToTable}
                />
              )}
            </div>
            {type === 'edit' && !isSplit && <Bottom />}
          </Con>
          {!isSplit && type === 'edit' && !!relateRecordTableControls.length && (
            <FixedCon ref={nav}>
              <ShadowCon>
                <Shadow />
              </ShadowCon>
              <RelateRecordTableNav
                sideVisible={controlProps.sideVisible}
                showSplitIcon={!!recordId}
                setSplit={setSplit}
                isSplit={isSplit}
                scrollLeft={navScrollLeft}
                controls={
                  recordId
                    ? relateRecordTableControls.map(c =>
                        !_.isUndefined(relateNumOfControl[c.controlId])
                          ? { ...c, value: relateNumOfControl[c.controlId] }
                          : c,
                      )
                    : relateRecordTableControls
                }
                onScrollLeftChange={setNavScrollLeft}
                onClick={controlId => {
                  setActiveRelateRecordControlId(controlId);
                  scrollToTable();
                }}
              />
            </FixedCon>
          )}
        </div>
      )}
      {(abnormal || formdata.length === 0) && (
        <Abnormal resultCode={recordinfo.resultCode} entityName={recordinfo.entityName} empty={!!formdata.length} />
      )}
    </div>
  );
}

RecortForm.propTypes = {
  type: PropTypes.string,
  loading: PropTypes.bool,
  showError: PropTypes.bool,
  formFlag: PropTypes.string,
  abnormal: PropTypes.bool,
  controlProps: PropTypes.shape({}),
  view: PropTypes.shape({}),
  recordbase: PropTypes.shape({}),
  recordinfo: PropTypes.shape({}),
  from: PropTypes.number,
  iseditting: PropTypes.bool,
  formdata: PropTypes.arrayOf(PropTypes.shape({})),
  relateRecordData: PropTypes.shape({}),
  mountRef: PropTypes.func,
  updateRecordDailogOwner: PropTypes.func,
  updateRows: PropTypes.func,
  onChange: PropTypes.func,
  onRelateRecordsChange: PropTypes.func,
  onSave: PropTypes.func,
  onCancel: PropTypes.func,
  registeRefreshEvents: PropTypes.func,
  reloadRecord: PropTypes.func,
  registerCell: PropTypes.func,
};
