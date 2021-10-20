import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import cx from 'classnames';
import { Checkbox } from 'antd-mobile';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import worksheetAjax from 'src/api/worksheet';
import { withRouter } from 'react-router-dom';
import './index.less';

function getCoverControlData(data) {
  return _.find(data, file => File.isPicture(file.ext));
}

const coverTypes = {
  0: 'fill',
  1: 'full',
  2: 'circle',
  3: 'rectangle',
};

@withRouter
export default class RecordCard extends Component {
  constructor(props) {
    super(props);
    const { data, view } = props;
    this.state = {
      checked: data[view.advancedSetting.checkradioid] === '1',
    };
  }
  get cover() {
    const { view, data } = this.props;
    const { coverCid } = view;
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
    const { controls, view } = this.props;
    const showControls = [...view.displayControls, view.advancedSetting.abstract];
    const allControls = [
      { controlId: 'ownerid', controlName: _l('拥有者'), type: 26 },
      { controlId: 'caid', controlName: _l('创建人'), type: 26 },
      { controlId: 'ctime', controlName: _l('创建时间'), type: 16 },
      { controlId: 'utime', controlName: _l('最近修改时间'), type: 16 },
    ].concat(controls);
    return showControls.map(scid => _.find(allControls, c => c.controlId === scid));
  }
  previewAttachment(attachments, index) {
    require(['previewAttachments'], previewAttachments => {
      previewAttachments({
        index: index || 0,
        attachments: attachments.map(attachment => {
          if (attachment.fileId.slice(0, 2) === 'o_') {
            return Object.assign({}, attachment, {
              previewAttachmentType: 'QINIU',
              path: attachment.previewUrl,
              name: (attachment.originalFilename || _l('图片')) + attachment.ext,
            });
          }
          return Object.assign({}, attachment, {
            previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
          });
        }),
        showThumbnail: true,
        hideFunctions: ['editFileName'],
        disableNoPeimission: true,
      });
    });
  }
  handleCoverClick = e => {
    const { view, data } = this.props;
    const { cover } = this;
    let coverControlData;
    try {
      coverControlData = JSON.parse(data[view.coverCid]);
    } catch (err) {
      return;
    }
    this.previewAttachment(
      coverControlData,
      _.findIndex(coverControlData, attachment => attachment.fileID === cover.fileID) || 0,
    );
    e.stopPropagation();
  };
  handleChangeCheckbox = e => {
    const { checked } = this.state;
    const { data, view, controls, match } = this.props;
    const { params } = match;
    const control = _.find(controls, { controlId: view.advancedSetting.checkradioid });
    const newChecked = !checked;
    worksheetAjax
      .updateWorksheetRow({
        appId: params.appId,
        rowId: data.rowid,
        viewId: params.viewId,
        worksheetId: params.worksheetId,
        newOldControl: [
          {
            controlId: control.controlId,
            controlName: control.controlName,
            type: control.type,
            value: newChecked ? '1' : '0',
          },
        ],
      })
      .then(result => {
        this.setState({
          checked: newChecked,
        });
      });
  };
  renderCover() {
    const { coverType, advancedSetting } = this.props.view;
    const { cover } = this;
    const size = coverType ? 76 : 120;
    const url =
      cover && cover.previewUrl
        ? `${cover.previewUrl.slice(
            0,
            cover.previewUrl.indexOf('?'),
          )}?imageMogr2/auto-orient|imageView2/1/w/${size}/h/${size}/q/90`
        : null;
    return (
      <div className={cx('recordCardCover', coverTypes[coverType], `appshowtype${advancedSetting.appshowtype || '0'}`)}>
        {url ? (
          coverType ? (
            <img onClick={this.handleCoverClick} className="img" src={url} role="presentation" />
          ) : (
            <div onClick={this.handleCoverClick} className="img cover" style={{ backgroundImage: `url(${url})` }}></div>
          )
        ) : (
          <div className="withoutImg img flexRow valignWrapper">
            <Icon className="Font30" icon="attach_file" />
          </div>
        )}
      </div>
    );
  }
  renderControl(id, nameVisible = false) {
    const { data } = this.props;
    const { cardControls } = this;
    const visibleControl = _.find(cardControls, { controlId: id }) || {};
    return (
      <div className="controlWrapper" key={id}>
        {nameVisible && <div className="controlName ellipsis Gray_9e">{visibleControl.controlName}</div>}
        <div className="controlContent">
          {data[visibleControl.controlId] ? (
            <CellControl
              rowHeight={34}
              cell={Object.assign({}, visibleControl, { value: data[visibleControl.controlId] })}
              from={4}
            />
          ) : (
            <div className="emptyTag"></div>
          )}
        </div>
      </div>
    );
  }
  renderContent() {
    const { view, data, controls, allowAdd } = this.props;
    const { advancedSetting, coverCid, displayControls, showControlName } = view;
    const titleText = getTitleTextFromControls(controls, data);
    const { checked } = this.state;
    const appshowtype = advancedSetting.appshowtype || '0';
    return (
      <div className="recordCardContent flex">
        <div className="flexRow valignWrapper mBottom5">
          {advancedSetting.checkradioid && (
            <Checkbox
              className="mRight5"
              disabled={!allowAdd}
              checked={checked}
              onChange={this.handleChangeCheckbox}
              onClick={e => {
                e.stopPropagation();
              }}
            />
          )}
          <div className="Gray Blod Font16 ellipsis">{titleText}</div>
        </div>
        {advancedSetting.abstract && (
          <div className="Gray_9e Font12 mBottom8">{this.renderControl(advancedSetting.abstract)}</div>
        )}
        <div className={cx(`cardContent${appshowtype}`)}>
          {(appshowtype === '0' ? displayControls.slice(0, 3) : displayControls).map(id =>
            this.renderControl(id, showControlName),
          )}
        </div>
      </div>
    );
  }
  render() {
    const { view, data, onClick } = this.props;
    const { advancedSetting, coverCid } = view;
    return (
      <div
        className={cx('mobileWorksheetRecordCard', {
          coverRight: [undefined, '0'].includes(advancedSetting.coverposition),
        })}
        onClick={onClick}
        key={data.rowid}
      >
        {coverCid && this.renderCover()}
        {this.renderContent()}
      </div>
    );
  }
}
