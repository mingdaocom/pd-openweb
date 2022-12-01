import React, { Component, Fragment } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { autobind } from 'core-decorators';
import styled from 'styled-components';
import sheetAjax from 'src/api/worksheet';
import autoSize from 'ming-ui/decorators/autoSize';
import RecordCardListDialog from 'src/components/recordCardListDialog';
import MobileRecordCardListDialog from 'src/components/recordCardListDialog/mobile';
import RelateScanQRCode from 'src/components/newCustomFields/components/RelateScanQRCode';
import RecordInfoWrapper from 'src/pages/worksheet/common/recordInfo/RecordInfoWrapper';
import { RecordInfoModal as MobileRecordInfoModal } from 'mobile/Record';
import NewRecord from 'src/pages/worksheet/common/newRecord/NewRecord';
import MobileNewRecord from 'src/pages/worksheet/common/newRecord/MobileNewRecord';
import { getTitleTextFromRelateControl } from 'src/components/newCustomFields/tools/utils';
import { getFilter } from 'src/pages/worksheet/common/WorkSheetFilter/util';
import RecordCoverCard from './RecordCoverCard';
import RecordTag from './RecordTag';
import { getIsScanQR } from 'src/components/newCustomFields/components/ScanQRCode';
import { FROM } from 'src/components/newCustomFields/tools/config';
import { Icon } from 'ming-ui';
import { completeControls } from 'worksheet/util';
import { browserIsMobile } from 'src/util';

const MAX_COUNT = 50;

const Button = styled.div`
  display: inline-block;
  border-radius: 3px;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  padding: 0 16px;
  color: #2196f3;
  background-color: #f8f8f8;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const Con = styled.div(({ isMobile, autoHeight, isCard }) =>
  isMobile
    ? `
      ${autoHeight ? 'height: auto !important;' : ''}
      ${isCard ? '' : 'align-items: center;'}
      padding: 0px !important;
    `
    : `
    ${autoHeight ? 'height: auto !important;' : ''}
    padding: 0px !important;
  `,
);

const RelateScanQRCodeWrap = styled(RelateScanQRCode)`
  &.lineWrap {
    color: #2196f3;
    width: 100%;
    .scanIcon {
      color: #2196f3 !important;
      margin-right: 5px;
    }
    .scanButton {
      width: 100%;
      margin-left: 0;
    }
  }
  .scanButton {
    width: 36px;
    height: 36px;
    display: flex;
    align-items: center;
    justify-content: center;
    border: 1px solid #e0e0e0;
    margin-left: 10px;
    border-radius: 3px;
  }
`;

@autoSize
export default class RelateRecordCards extends Component {
  static propTypes = {
    editable: PropTypes.bool,
    multiple: PropTypes.bool,
    control: PropTypes.shape({
      disabled: PropTypes.bool,
      appId: PropTypes.string, // 他表字段被关联表所在应用 id
      viewId: PropTypes.string, // 他表字段被关联表所在应用所在视图 id
      worksheetId: PropTypes.string, // 他表字段所在表 id
      projectId: PropTypes.string, // 网络 id
      from: PropTypes.number, // 来源
      recordId: PropTypes.string, // 他表字段所在记录 id
      controlId: PropTypes.string, // 他表字段 id
      coverCid: PropTypes.string, // 他表字段封面 id
      enumDefault2: PropTypes.number,
      strDefault: PropTypes.string,
      value: PropTypes.string,
      dataSource: PropTypes.string,
      showControls: PropTypes.arrayOf(PropTypes.string),
      enumDefault: PropTypes.number,
      onChange: PropTypes.func,
      openRelateSheet: PropTypes.func,
      formData: PropTypes.arrayOf(PropTypes.shape({})),
    }),
    records: PropTypes.arrayOf(PropTypes.shape({})),
    onChange: PropTypes.func,
  };

  static defaultProps = {
    control: {},
  };

  constructor(props) {
    super(props);
    const {
      control: { relationControls = [], showControls = [] },
    } = this.props;
    const hasRelateControl = this.hasRelateControl(relationControls, showControls);
    this.state = {
      sheetTemplateLoading: hasRelateControl,
      controls: hasRelateControl ? [] : completeControls(relationControls),
      previewRecord: null,
      showAddRecord: false,
      showNewRecord: false,
      mobileRecordkeyWords: '',
    };
  }

  componentDidMount() {
    if (this.state.sheetTemplateLoading) {
      this.loadControls();
    }
  }

  componentWillReceiveProps(nextProps) {
    if (this.props.control.dataSource !== nextProps.control.dataSource) {
      const {
        control: { relationControls = [], showControls = [] },
      } = nextProps;
      const hasRelateControl = this.hasRelateControl(relationControls, showControls);
      if (hasRelateControl) {
        this.setState({ sheetTemplateLoading: true });
        this.loadControls();
      }
    }
  }

  get controls() {
    const {
      control: { showControls },
    } = this.props;
    const { controls } = this.state;
    return showControls.map(scid => _.find(controls, c => c.controlId === scid)).filter(c => c && c.attribute !== 1);
  }

  getCoverUrl(coverId, record) {
    const { controls } = this.state;
    const coverControl = _.find(controls, c => c.controlId && c.controlId === coverId);
    if (!coverControl) {
      return;
    }
    try {
      const coverFile = _.find(JSON.parse(record[coverId]), file => File.isPicture(file.ext));
      const { previewUrl = '' } = coverFile;
      return previewUrl.indexOf('imageView2') > -1
        ? previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
        : `${previewUrl}&imageView2/1/w/200/h/140`;
    } catch (err) {}
    return;
  }

  hasRelateControl(relationControls, showControls) {
    return !!_.find(
      relationControls.filter(rc => _.find(showControls, scid => scid === rc.controlId)),
      c => _.includes([29, 30], c.type),
    );
  }

  loadControls() {
    sheetAjax.getWorksheetInfo({ worksheetId: this.props.control.dataSource, getTemplate: true }).then(data => {
      this.setState({
        controls: data.template.controls,
        sheetTemplateLoading: false,
      });
    });
  }

  @autobind
  handleDelete(rowId) {
    const { onChange, records } = this.props;
    const newRecords = records.filter(record => record.rowid !== rowId);
    onChange(newRecords);
  }

  @autobind
  handleAdd(newAdded) {
    const { multiple, records, onChange } = this.props;
    const newRecords = multiple ? _.uniqBy(records.concat(newAdded), r => r.rowid) : newAdded;
    onChange(newRecords);
  }

  getDefaultRelateSheetValue() {
    try {
      const { formData, controlId, recordId, worksheetId } = this.props.control;
      const titleControl = _.find(formData, control => control.attribute === 1);
      const defaultRelatedSheetValue = {
        name: titleControl.value,
        sid: recordId,
        type: 8,
        sourcevalue: JSON.stringify({
          ..._.assign(...formData.map(c => ({ [c.controlId]: c.value }))),
          [titleControl.controlId]: titleControl.value,
          rowid: recordId,
        }),
      };
      if (titleControl.type === 29) {
        try {
          const cellData = JSON.parse(titleControl.value);
          defaultRelatedSheetValue.name = cellData[0].name;
        } catch (err) {
          defaultRelatedSheetValue.name = '';
        }
      }
      return {
        worksheetId,
        relateSheetControlId: controlId,
        value: defaultRelatedSheetValue,
      };
    } catch (err) {
      return;
    }
  }

  handleClick = evt => {
    const { records, control } = this.props;
    const { enumDefault2 } = control;

    if (!$(evt.target).closest('.relateRecordBtn').length) return;

    if (records.length >= MAX_COUNT) {
      alert(_l('最多关联%0条', MAX_COUNT), 3);
      return;
    }
    if (enumDefault2 !== 10 && enumDefault2 !== 11) {
      this.setState({ showAddRecord: true });
    } else {
      this.setState({ showNewRecord: true });
    }
  };

  renderRecordsCon() {
    const { width, control, records, allowOpenRecord } = this.props;
    const {
      appId,
      viewId,
      from,
      recordId,
      dataSource,
      disabled,
      enumDefault,
      coverCid,
      openRelateSheet,
      sourceEntityName,
      advancedSetting,
    } = control;
    const { showAll, controls } = this.state;
    const allowlink = (advancedSetting || {}).allowlink;
    const isMobile = browserIsMobile();
    const isCard =
      parseInt(advancedSetting.showtype, 10) === 1 ||
      (from === FROM.H5_ADD && parseInt(advancedSetting.showtype, 10) === 2);
    let cardWidth;
    let colNum = 1;

    if (width) {
      const containerWidth = width - 2;
      if (isMobile) {
        cardWidth = '100%';
      } else if (enumDefault === 1) {
        cardWidth = containerWidth - 12;
      } else if (containerWidth >= 1200) {
        cardWidth = Math.floor(containerWidth / 3) - 10;
        colNum = 3;
      } else if (containerWidth >= 800) {
        cardWidth = Math.floor(containerWidth / 2) - 10;
        colNum = 2;
      } else {
        cardWidth = containerWidth - 10;
        colNum = 1;
      }
    } else {
      cardWidth = '100%';
    }

    if (isCard) {
      return (
        <div className="recordsCon mBottom6">
          {!!records.length &&
            (showAll || from === FROM.H5_ADD || records.length <= colNum * 3
              ? records
              : records.slice(0, colNum * 3)
            ).map((record, i) => (
              <RecordCoverCard
                viewId={viewId}
                disabled={disabled}
                width={cardWidth}
                key={i}
                controls={this.controls}
                data={record}
                cover={this.getCoverUrl(coverCid, record)}
                allowlink={allowlink}
                title={
                  record.rowid ? getTitleTextFromRelateControl(control, record) : _l('关联当前%0', sourceEntityName)
                }
                onClick={
                  (disabled && !recordId) ||
                  (control.isSubList && _.get(window, 'shareState.shareId')) ||
                  allowlink === '0'
                    ? () => {}
                    : () => {
                        if (from === FROM.SHARE || from === FROM.WORKFLOW) {
                          openRelateSheet('', record.wsid, record.rowid, viewId);
                        } else {
                          this.setState({ previewRecord: { recordId: record.rowid } });
                        }
                      }
                }
                onDelete={() => this.handleDelete(record.rowid)}
              />
            ))}
          {records.length > colNum * 3 && !showAll && from !== FROM.H5_ADD && (
            <div className="ThemeColor3 Hand mBottom10" onClick={() => this.setState({ showAll: true })}>
              {_l('展开更多')}
            </div>
          )}
        </div>
      );
    }

    return (
      <div className="recordsCon">
        {records.map((record, i) => (
          <RecordTag
            key={i}
            disabled={disabled}
            title={record.rowid ? getTitleTextFromRelateControl(control, record) : _l('关联当前%0', sourceEntityName)}
            onClick={
              !allowOpenRecord || (disabled && !recordId)
                ? () => {}
                : () => {
                    if (from === FROM.SHARE || from === FROM.WORKFLOW) {
                      openRelateSheet('', record.wsid, record.rowid, viewId);
                    } else if (isMobile) {
                      disabled && this.setState({ previewRecord: { recordId: record.rowid } });
                    } else {
                      this.setState({ previewRecord: { recordId: record.rowid } });
                    }
                  }
            }
            onDelete={() => this.handleDelete(record.rowid)}
          />
        ))}
      </div>
    );
  }

  render() {
    const { control, records, editable } = this.props;
    const {
      appId,
      viewId,
      worksheetId,
      projectId,
      from,
      recordId,
      controlId,
      dataSource,
      disabled,
      enumDefault,
      enumDefault2,
      strDefault,
      showControls = [],
      coverCid,
      formData,
      sourceEntityName,
      sheetSwitchPermit,
      advancedSetting,
    } = control;
    const { showAddRecord, previewRecord, showNewRecord, sheetTemplateLoading } = this.state;
    const [, , onlyRelateByScanCode] = strDefault.split('').map(b => !!+b);
    const allowNewRecord = editable && enumDefault2 !== 1 && enumDefault2 !== 11 && !window.isPublicWorksheet;
    const isMobile = browserIsMobile();
    const isScanQR = getIsScanQR();
    const isCard =
      parseInt(advancedSetting.showtype, 10) === 1 ||
      (from === FROM.H5_ADD && parseInt(advancedSetting.showtype, 10) === 2);
    if (sheetTemplateLoading) {
      return null;
    }
    const disabledManualWrite = onlyRelateByScanCode && advancedSetting.dismanual === '1';
    const btnVisible =
      (!records.length || enumDefault === 2) &&
      from !== FROM.SHARE &&
      enumDefault2 !== 11 &&
      (isCard ? !disabledManualWrite : true) &&
      !disabled;
    const filterControls = getFilter({ control, formData });
    const NewRecordComponent = isMobile ? MobileNewRecord : NewRecord;
    const RecordCardListDialogComponent = isMobile ? MobileRecordCardListDialog : RecordCardListDialog;

    return (
      <Fragment>
        <div className="flexRow valignWrapper mBottom10">
          <Con
            className={cx(
              'customFormControlBox flexRow relateRecordBtn',
              { formBoxNoBorder: isCard },
              { controlDisabled: disabled || (btnVisible && !isCard && !records.length && disabledManualWrite) },
            )}
            isMobile={isMobile}
            autoHeight={!!records.length}
            isCard={isCard}
            onClick={e => !disabled && !isCard && !disabledManualWrite && this.handleClick(e)}
          >
            <div className="flex" style={{ minWidth: 0 }}>
              {btnVisible && (
                <Fragment>
                  {isCard ? (
                    <Button className="relateRecordBtn" onClick={this.handleClick}>
                      <i className="icon icon-plus mRight5 Font16"></i>
                      {sourceEntityName || ''}
                    </Button>
                  ) : !records.length ? (
                    <span className="Gray_bd">
                      {disabledManualWrite ? _l('扫码添加%0', sourceEntityName) : _l('选择%0', sourceEntityName)}
                    </span>
                  ) : null}
                </Fragment>
              )}
              {disabledManualWrite && !isScanQR && (
                <div className="Gray_9e mBottom5 mTop5 pTop3 pBottom3">{_l('请在移动端扫码添加关联')}</div>
              )}
              {!isCard && this.renderRecordsCon()}
              {from !== FROM.PUBLIC &&
                !!previewRecord &&
                (isMobile ? (
                  <MobileRecordInfoModal
                    className="full"
                    visible
                    appId={appId}
                    worksheetId={dataSource}
                    viewId={viewId}
                    rowId={previewRecord && previewRecord.recordId}
                    onClose={() => {
                      this.setState({ previewRecord: undefined });
                      if (_.isFunction(control.refreshRecord)) {
                        control.refreshRecord();
                      }
                    }}
                  />
                ) : (
                  <RecordInfoWrapper
                    visible
                    allowAdd={allowNewRecord}
                    appId={appId}
                    viewId={viewId}
                    from={1}
                    hideRecordInfo={() => {
                      this.setState({ previewRecord: undefined });
                      if (_.isFunction(control.refreshRecord)) {
                        control.refreshRecord();
                      }
                    }}
                    recordId={previewRecord && previewRecord.recordId}
                    worksheetId={dataSource}
                  />
                ))}
              {showAddRecord && (
                <RecordCardListDialogComponent
                  maxCount={MAX_COUNT}
                  selectedCount={records.length}
                  from={from}
                  keyWords={this.state.mobileRecordkeyWords}
                  control={control}
                  allowNewRecord={allowNewRecord}
                  disabledManualWrite={disabledManualWrite}
                  multiple={enumDefault === 2}
                  coverCid={coverCid}
                  filterRowIds={records.map(r => r.rowid).concat(control.dataSource === worksheetId ? recordId : [])}
                  showControls={showControls}
                  appId={appId}
                  viewId={viewId}
                  masterRecordRowId={recordId}
                  relateSheetId={dataSource}
                  parentWorksheetId={worksheetId}
                  filterRelatesheetControlIds={[controlId]}
                  defaultRelatedSheet={this.getDefaultRelateSheetValue()}
                  controlId={controlId}
                  visible={showAddRecord}
                  onClose={() => this.setState({ showAddRecord: false, mobileRecordkeyWords: '' })}
                  onOk={this.handleAdd}
                  formData={formData}
                />
              )}
              {showNewRecord && (
                <NewRecordComponent
                  showFillNext
                  directAdd
                  className="worksheetRelateNewRecord"
                  appId={appId}
                  worksheetId={dataSource}
                  addType={2}
                  entityName={sourceEntityName}
                  filterRelateSheetIds={[dataSource]}
                  filterRelatesheetControlIds={[controlId]}
                  visible={showNewRecord}
                  masterRecordRowId={recordId}
                  hideNewRecord={() => {
                    this.setState({ showNewRecord: false });
                  }}
                  defaultRelatedSheet={this.getDefaultRelateSheetValue()}
                  onAdd={record => {
                    this.handleAdd([record]);
                  }}
                />
              )}
            </div>
            {!disabled && !isCard && !onlyRelateByScanCode && (
              <Icon icon="arrow-right-border" className="Font16 Gray_bd" style={{ marginRight: -5 }} />
            )}
          </Con>
          {(!records.length || enumDefault === 2) &&
            from !== FROM.SHARE &&
            enumDefault2 !== 11 &&
            onlyRelateByScanCode &&
            isScanQR &&
            !disabled && (
              <RelateScanQRCodeWrap
                className={cx({ lineWrap: !btnVisible })}
                projectId={projectId}
                worksheetId={dataSource}
                filterControls={filterControls}
                parentWorksheetId={worksheetId}
                onChange={data => {
                  this.handleAdd([data]);
                }}
                onOpenRecordCardListDialog={keyWords => {
                  this.setState({ showAddRecord: true, mobileRecordkeyWords: keyWords });
                }}
              >
                <div className="scanButton">
                  <i className="scanIcon icon icon-qr_code_19 Font20 Gray_75"></i>
                  {!btnVisible && _l('扫码关联%0', sourceEntityName || '')}
                  {/*!records.length && <i className="rightArrow icon icon-arrow-right-border Font16 Gray_bd"></i>*/}
                </div>
              </RelateScanQRCodeWrap>
            )}
        </div>
        {isCard && this.renderRecordsCon()}
      </Fragment>
    );
  }
}
