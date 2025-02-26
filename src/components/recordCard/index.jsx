import React, { Component } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import './RecordCard.less';
import _ from 'lodash';
import RegExpValidator from 'src/util/expression';
const FROMS = {
  RECORDDETAIL: 1,
  SELECT_RECORD_DIALOG: 2,
  MOBILE: 3,
};

function getKeyOfFrom(from) {
  return Object.keys(FROMS)[from - 1] || '';
}

function getCoverControlData(data) {
  return _.find(data, file => RegExpValidator.fileIsPicture(file.ext));
}

export default class RecordCard extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    selected: PropTypes.bool,
    coverCid: PropTypes.string,
    projectId: PropTypes.string,
    showControls: PropTypes.arrayOf(PropTypes.string),
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    data: PropTypes.shape({}),
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
  };
  static defaultProps = {
    from: 1,
    showControls: [],
  };
  state = {
    forceShowFullValue: null,
  };

  handleCoverClick = e => {
    const { from = 1, disableDownload } = this.props;
    const { cover } = this;
    const isMobile = from === FROMS.MOBILE;
    if (isMobile) {
      return;
    }
    previewQiniuUrl(cover.previewUrl.replace(/\|imageView2\/1\/w\/\d+\/h\/\d+/, ''), {
      disableDownload,
      ext: (cover.previewUrl.match(/\.(jpg|jpeg|png|gif|bmp)(\?|$)/i) || '')[1] || 'png',
    });
    e.stopPropagation();
  };
  get cover() {
    const { coverCid, data } = this.props;
    if (!coverCid) {
      return null;
    }
    let coverControlData;
    try {
      coverControlData = getCoverControlData(JSON.parse(data[coverCid]) || []);
    } catch (err) {
      return null;
    }
    return coverControlData;
  }
  get cardControls() {
    const { controls, showControls } = this.props;
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建人'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    return showControls.map(scid => _.find(allControls, c => c.controlId === scid)).filter(c => c && c.attribute !== 1);
  }
  render() {
    const {
      from = 1,
      disabled,
      control,
      focused,
      selected,
      controls,
      data,
      onDelete,
      onClick,
      coverCid,
      projectId,
      sourceEntityName,
      viewId,
      isCharge,
      disabledLink,
      worksheetId,
      appId,
    } = this.props;
    const { cover, cardControls } = this;
    const { forceShowFullValue } = this.state;
    const showTitleId = _.get(control, 'advancedSetting.showtitleid');
    const titleControl =
      _.find(controls || [], c => (showTitleId ? c.controlId === showTitleId : c.attribute === 1)) || {};
    const showFullValue = _.isNull(forceShowFullValue)
      ? _.get(titleControl, 'advancedSetting.datamask') !== '1'
      : forceShowFullValue;

    const titleText = data.rowid
      ? getTitleTextFromControls(
          controls.map(c => (showTitleId ? { ...c, attribute: showTitleId === c.controlId ? 1 : 0 } : c)),
          data,
          undefined,
          { noMask: showFullValue },
        )
      : _l('关联当前%0', sourceEntityName);

    const isMask =
      (isCharge || _.get(titleControl, 'advancedSetting.isdecrypt') === '1') &&
      (data[titleControl.controlId] || data.titleValue) &&
      !showFullValue;
    return (
      <div
        className={cx('worksheetRecordCard', getKeyOfFrom(from).toLowerCase(), {
          selected,
          focused,
          noControls: !cardControls.length,
          withoutCover: !coverCid,
          disabledLink,
        })}
        onClick={onClick}
      >
        {!disabled && (
          <span
            className="deleteRecord"
            onClick={e => {
              e.stopPropagation();
              onDelete();
            }}
          >
            <i className="icon icon-minus-square"></i>
          </span>
        )}
        <span className={cx('selectedIcon', { hide: !selected })}>
          <i className="icon icon-ok"></i>
        </span>
        <p className="titleText ellipsis">
          <span className={cx({ maskHoverTheme: isMask })}>
            {titleText}
            {isMask && (
              <i
                className="icon icon-eye_off Hand Font14 Gray_bd mLeft4"
                style={{ verticalAlign: 'text-top' }}
                onClick={e => {
                  if (!isMask) return;
                  e.stopPropagation();
                  this.setState({ forceShowFullValue: true });
                }}
              ></i>
            )}
          </span>
        </p>
        <div className="visibleControls flexRow">
          {cardControls.slice(0, from === FROMS.SELECT_RECORD_DIALOG ? 6 : 3).map((visibleControl, i) => (
            <div className="visibleControl flex" key={i}>
              <div className="controlName ellipsis">{visibleControl.controlName}</div>
              <div className="controlContent">
                {data[visibleControl.controlId] ? (
                  <CellControl
                    cell={Object.assign({}, visibleControl, { value: data[visibleControl.controlId] })}
                    from={4}
                    viewId={viewId}
                    projectId={projectId}
                    isCharge={isCharge}
                    row={data}
                    rowFormData={() => controls.map(c => Object.assign({}, c, { value: data[c.controlId] }))}
                    worksheetId={worksheetId}
                    appId={appId}
                  />
                ) : (
                  <div className="emptyTag"></div>
                )}
              </div>
            </div>
          ))}
        </div>
        {cover && cover.previewUrl && (
          <img
            className="cover thumbnail"
            role="presentation"
            onClick={this.handleCoverClick}
            src={
              cover.previewUrl.indexOf('imageView2') > -1
                ? cover.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/1/w/76/h/76/q/90`)
                : `${cover.previewUrl}&imageView2/1/w/76/h/76/q/90`
            }
          />
        )}
      </div>
    );
  }
}
