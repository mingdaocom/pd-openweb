import React, { Fragment } from 'react';
import DocumentTitle from 'react-document-title';
import cx from 'classnames';
import _ from 'lodash';
import { Tooltip } from 'ming-ui';
import { controlState } from 'src/components/newCustomFields/tools/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { WORKFLOW_SYSTEM_CONTROL } from 'src/pages/widgetConfig/config/widget';
import { SYS } from 'src/pages/widgetConfig/config/widget.js';
import { browserIsMobile } from 'src/utils/common';
import './worksheetListShare.less';

const hiddenIds = WORKFLOW_SYSTEM_CONTROL.map(c => c.controlId);
const FILTER_CONTROLS_TYPE = [43, 51, 52, 49, 22, 47];

class WorksheetListShare extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rowId: undefined,
      RecordCard: null,
      Components: null,
    };
  }

  componentDidMount() {
    import('src/components/recordCard').then(res => {
      this.setState({ RecordCard: res });
    });

    if (browserIsMobile()) {
      import('mobile/Record').then(res => {
        this.setState({ Components: { default: res.RecordInfoModal } });
      });
    } else {
      import('worksheet/common/recordInfo/RecordInfoWrapper').then(res => {
        this.setState({ Components: res });
      });
    }
  }

  getCardControlsForTitle = list => {
    let controls = list;
    let titleControl = _.find(controls, c => c.attribute === 1) || {};
    let athterControl = _.filter(controls, c => c.attribute !== 1);
    let allControls = [titleControl].concat(athterControl);
    return allControls;
  };

  //根据showControls排序
  getSortAndVisible = (showControls, controls) => {
    let list = [];
    if (showControls.length > 0) {
      list = showControls.map(scid => _.find(controls, c => c.controlId === scid));
    } else {
      let sys = controls.filter(it => SYS.includes(it.controlId));
      let noSys = controls.filter(it => !SYS.includes(it.controlId));
      list = noSys.sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1)).concat(sys);
    }
    list = list.filter(c => c && controlState(c).visible);
    if (!list.find(o => o.attribute === 1)) {
      list = list.concat({ ...controls.find(o => o.attribute === 1), noShowForShare: true });
    }
    return list;
  };

  closeDetail = () => {
    this.setState({ rowId: undefined });
  };

  render() {
    const {
      cardControls,
      rowsList = [],
      shareId,
      viewSet = {},
      dataTitle = '',
      sheetSwitchPermit = [],
      viewIdForPermit,
      appId,
      worksheetId,
      viewName,
      worksheetName,
    } = this.props;
    const { rowId, RecordCard, Components } = this.state;

    let Controls = this.getSortAndVisible(viewSet.showControls || [], cardControls);
    Controls = Controls.filter(
      item => !['uaid', 'daid'].concat(hiddenIds).includes(item.controlId) && !FILTER_CONTROLS_TYPE.includes(item.type),
    );
    let coverCidData = Controls.filter(item => item.type === 14);
    let showControls = Controls.filter(item => controlState(item).visible); // 排除附件的数据
    let showControlsNoTitle = showControls.filter(it => it.attribute !== 1); // 排除标题的数据
    let showControlsData = showControls
      .filter(o => !o.noShowForShare)
      .slice(0, 7)
      .map(item => item.controlId);
    let showControlsMin = coverCidData.length
      ? showControlsNoTitle.slice(0, 2).map(item => item.controlId)
      : showControlsData;
    // 下载附件权限
    const recordAttachmentSwitch = viewIdForPermit
      ? isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewIdForPermit)
      : true;

    return (
      <Fragment>
        <DocumentTitle title={[viewName, worksheetName].filter(o => !!o).join('-')} />

        <div
          className="recordCardListBox isPublicquery"
          style={{ minHeight: document.documentElement.clientHeight - 100 }}
        >
          <div className="recordCardListHeader">
            <div style={{ width: '100%', padding: '20px 0 0' }}>
              {rowsList.length ? _l('查询到%0个结果', rowsList.length) : _l('没有查询结果')}
            </div>

            {rowsList.length > 0 && (
              <div className={cx('flexRow', { minW: coverCidData.length })}>
                {this.getCardControlsForTitle(Controls)
                  .filter(item => ![43, 51, 52].includes(item.type) && controlState(item).visible)
                  .slice(0, 7)
                  .map((control, i) => {
                    return (
                      <div className={cx('controlName flex Hand', { title: control.attribute })} key={i}>
                        {control.attribute === 1 ? (
                          <Tooltip popupPlacement="bottom" text={<span>{dataTitle}</span>} autoCloseDelay={0}>
                            <i className="icon icon-ic_title"></i>
                          </Tooltip>
                        ) : (
                          <span className="ellipsis Bold Font12 Gray_75 controlNameValue">{control.controlName}</span>
                        )}
                      </div>
                    );
                  })}
              </div>
            )}
          </div>
          <div className="recordCardList">
            {RecordCard &&
              rowsList.map((record, i) => {
                return (
                  <RecordCard.default
                    disableDownload={!recordAttachmentSwitch}
                    key={i}
                    from={window.innerWidth > 600 ? 2 : 3}
                    disabled={true}
                    coverCid={coverCidData.length ? coverCidData[0].controlId : null}
                    showControls={window.innerWidth > 600 ? showControlsData : showControlsMin}
                    controls={Controls.filter(o => !['uaid', 'daid'].includes(o.controlId))}
                    data={record}
                    shareId={shareId}
                    selected={false}
                    onClick={() => this.setState({ rowId: record.rowid })}
                  />
                );
              })}
          </div>
        </div>

        {rowId &&
          Components &&
          (browserIsMobile() ? (
            <Components.default
              className="full"
              visible
              appId={appId}
              worksheetId={worksheetId}
              viewId={viewIdForPermit}
              rowId={rowId}
              onClose={this.closeDetail}
              editable={false}
            />
          ) : (
            <Components.default
              sheetSwitchPermit={sheetSwitchPermit}
              viewId={viewIdForPermit}
              allowAdd={false}
              from={2}
              visible
              recordId={rowId}
              worksheetId={worksheetId}
              hideRecordInfo={this.closeDetail}
              appId={appId}
              allowEdit={false}
            />
          ))}
      </Fragment>
    );
  }
}

export default WorksheetListShare;
