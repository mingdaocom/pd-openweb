import PropTypes from 'prop-types';
import React from 'react';
import CustomFields from 'src/components/newCustomFields';
import LoadDiv from 'ming-ui/components/LoadDiv';
import EmptyCon from './noData';
import './worksheetDetailShare.less';
import { SHARE_TYPE } from './config';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import _ from 'lodash';
class WorksheetDetailShare extends React.Component {
  static propTypes = {
    worksheetId: PropTypes.string,
    rowId: PropTypes.string,
    viewId: PropTypes.string,
    step: PropTypes.number,
    appId: PropTypes.string,
    getShareInfo: PropTypes.func,
    setStep: PropTypes.func,
    isSingleRow: PropTypes.bool,
    getRowRelationRowDetailData: PropTypes.func,
  };

  componentDidMount() {
    $('body,html').scrollTop(0);
    const { titleName, viewName, worksheetName, appName } = this.props;
    const str = [titleName, viewName, worksheetName, appName].filter(o => !!o).join('-');
    document.title = str;
  }

  render() {
    const {
      relationRowDetailResultCode,
      step,
      rowDetail = [],
      titleName,
      projectId,
      worksheetId,
      rowId,
      isSingleRow,
      setStep,
      getShareInfo,
      printId,
      getRowRelationRowDetailData,
      viewSet = {},
      sheetSwitchPermit = [],
      viewIdForPermit,
    } = this.props;
    const Controls = rowDetail.filter(
      item =>
        !_.find(viewSet.controls || [], hidedControlId => item.controlId === hidedControlId) &&
        !_.includes(
          [
            'wfname',
            'wfstatus',
            'wfcuaids',
            'wfrtime',
            'wfftime',
            'wfdtime',
            'wfcaid',
            'wfctime',
            'wfcotime',
            'rowid',
            'uaid',
          ],
          item.controlId,
        ), // || item.attribute === 1,
    );
    let noRight = relationRowDetailResultCode === 7 && step === SHARE_TYPE.WORKSHEETDRELATIONDETAIL;
    if (!rowDetail) {
      return (
        <div className="" style={{ minHeight: innerHeight }}>
          <LoadDiv />
        </div>
      );
    }
    return (
      <React.Fragment>
        <div
          className="detailsCon"
          style={{
            minHeight:
              window.innerWidth <= 600 ? window.innerHeight - 30 : !rowDetail || noRight ? innerHeight - 140 : 'auto',
          }}
        >
          {!rowDetail || noRight ? (
            <EmptyCon str={noRight ? _l('暂无权限查看') : ''} />
          ) : (
            <React.Fragment>
              <h1>{titleName || _l('未命名')}</h1>
              <CustomFields
                sheetSwitchPermit={sheetSwitchPermit}
                viewId={viewIdForPermit}
                from={1}
                data={Controls.filter(
                  o => ![43].includes(o.type) && !['uaid', 'daid'].concat(SYS).includes(o.controlId),
                )}
                disabled={true}
                projectId={projectId}
                worksheetId={worksheetId}
                recordId={rowId}
                showError={false}
                onChange={() => {}}
                dataSource={21}
                openRelateRecord={id => {
                  if (step <= 0 || step >= 4) {
                    return;
                  } else {
                    const titleHeader = rowDetail.filter(c => c.controlId === id)[0].controlName;
                    setStep(isSingleRow ? 3 : step + 1, titleHeader);
                    getShareInfo(id, titleHeader);
                  }
                }}
                openRelateSheet={(appId, worksheetId, rowId, viewId) => {
                  if (printId || step <= 0 || step >= 4) {
                    return;
                  } else {
                    setStep(SHARE_TYPE.WORKSHEETDRELATIONDETAIL, '', true);
                    // worksheetId, rowId, viewId
                    getRowRelationRowDetailData(worksheetId, rowId, viewId);
                  }
                }}
              />
            </React.Fragment>
          )}
        </div>

      </React.Fragment>
    );
  }
}

export default WorksheetDetailShare;
