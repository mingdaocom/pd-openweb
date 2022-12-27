import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';
import cx from 'classnames';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { previewQiniuUrl } from 'src/components/previewAttachments';
import './RecordCard.less';
import _ from 'lodash';

const FROMS = {
  RECORDDETAIL: 1,
  SELECT_RECORD_DIALOG: 2,
  MOBILE: 3,
};

function getKeyOfFrom(from) {
  return Object.keys(FROMS)[from - 1] || '';
}

function getCoverControlData(data) {
  return _.find(data, file => File.isPicture(file.ext));
}

export default class RecordCard extends Component {
  static propTypes = {
    from: PropTypes.number,
    disabled: PropTypes.bool,
    selected: PropTypes.bool,
    coverCid: PropTypes.string,
    showControls: PropTypes.arrayOf(PropTypes.string),
    controls: PropTypes.arrayOf(PropTypes.shape({})),
    data: PropTypes.shape({}),
    onClick: PropTypes.func,
    onDelete: PropTypes.func,
  };
  static defaultProps = {
    from: 1,
  };
  state = {
    forceShowFullValue: null,
  };
  @autobind
  handleCoverClick(e) {
    const { from = 1, disableDownload } = this.props;
    const { cover } = this;
    const isMobile = from === FROMS.MOBILE;
    if (isMobile) {
      return;
    }
    previewQiniuUrl(cover.previewUrl.replace(/\?(.*)/, ''), { disableDownload });
    e.stopPropagation();
  }
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
      { controlId: 'caid', controlName: _l('创建者'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    return showControls.map(scid => _.find(allControls, c => c.controlId === scid)).filter(c => c && c.attribute !== 1);
  }
  render() {
    const {
      from = 1,
      disabled,
      selected,
      controls,
      data,
      onDelete,
      onClick,
      coverCid,
      sourceEntityName,
      viewId,
      isCharge,
    } = this.props;
    const { cover, cardControls } = this;
    const { forceShowFullValue } = this.state;
    const titleControl = _.find(controls || [], control => control.attribute === 1) || {};
    const showFullValue = _.isNull(forceShowFullValue)
      ? _.get(titleControl, 'advancedSetting.datamask') !== '1'
      : forceShowFullValue;

    const titleText = data.rowid
      ? getTitleTextFromControls(controls, data, undefined, {
          noMask: showFullValue,
        })
      : _l('关联当前%0', sourceEntityName);

    const isMask =
      (isCharge || _.get(titleControl, 'advancedSetting.isdecrypt') === '1') &&
      (data[titleControl.controlId] || data.titleValue) &&
      !showFullValue;
    return (
      <div
        className={cx('worksheetRecordCard', getKeyOfFrom(from).toLowerCase(), {
          selected,
          noControls: !cardControls.length,
          withoutCover: !coverCid,
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
                    isCharge={isCharge}
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
