import React, { Component, Fragment } from 'react';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import { Checkbox } from 'antd-mobile';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { getTitleTextFromControls, controlState } from 'src/components/newCustomFields/tools/utils';
import worksheetAjax from 'src/api/worksheet';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/util';
import './index.less';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { getRecordColorConfig, getRecordColor, getControlStyles } from 'src/pages/worksheet/util';
import { isDocument } from 'src/components/UploadFiles/utils';
import _ from 'lodash';
import styled from 'styled-components';
import RegExpValidator from 'src/util/expression';
const Con = styled.div`
  ${({ controlStyles }) => controlStyles || ''}
`;

function getCoverControlData(data) {
  return _.find(data, file => RegExpValidator.fileIsPicture(file.ext) || (isDocument(file.ext) && file.previewUrl));
}

const coverTypes = {
  0: 'fill',
  1: 'full',
  2: 'circle',
  3: 'rectangle',
};

export default class RecordCard extends Component {
  constructor(props) {
    super(props);
    const { data, view } = props;
    this.state = {
      checked: data[view.advancedSetting.checkradioid] === '1',
      coverError: false,
      appshowtype: view.viewType === 6 ? '1' : _.get(view, 'advancedSetting.appshowtype') || '0',
    };
  }
  componentDidMount() {
    if (this.cardWrap) {
      const { view } = this.props;

      if (_.get(view, 'advancedSetting.appnavtype') !== '3') return;
      const appnavwidth = _.get(view, 'advancedSetting.appnavwidth') || 60;

      const width = document.documentElement.clientWidth - 16 - appnavwidth;

      if (width < 320) {
        this.setState({ appshowtype: '1' });
      }
    }
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
    ].concat(controls.filter(l => controlState(l).visible));
    return showControls.map(scid => _.find(allControls, c => c.controlId === scid));
  }
  get url() {
    const { coverError } = this.state;
    const { coverType } = this.props.view;
    const { cover } = this;
    const imageView2 = coverType === 1 ? `imageView2/2/w/120` : `imageView2/1/w/120/h/120`;
    const url =
      cover && cover.previewUrl
        ? cover.previewUrl.indexOf('imageView2') > -1
          ? cover.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, imageView2)
          : `${cover.previewUrl}&${imageView2}`
        : null;
    if (url && !coverError) {
      const image = new Image();
      image.onload = () => {};
      image.onerror = () => {
        this.setState({ coverError: true });
      };
      image.src = url;
    }
    return url;
  }
  previewAttachment(attachments, index) {
    const { data, view, controls, projectId } = this.props;
    const coverCidControl = _.find(controls, { controlId: view.coverCid }) || {};
    const hideFunctions = ['editFileName'];
    const { allowdownload = '1' } = coverCidControl.advancedSetting;
    if (allowdownload === '0') {
      hideFunctions.push('download');
    }
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
      hideFunctions,
      disableNoPeimission: true,
      recordId: data.rowid,
      controlId: view.coverCid,
      worksheetId: view.worksheetId,
      projectId,
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
    const { appId, data, view, controls } = this.props;
    const control = _.find(controls, { controlId: view.advancedSetting.checkradioid });
    const newChecked = !checked;
    worksheetAjax
      .updateWorksheetRow({
        appId,
        rowId: data.rowid,
        viewId: view.viewId,
        worksheetId: view.worksheetId,
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
    const { coverType } = this.props.view;
    const { coverError, appshowtype } = this.state;
    const { url } = this;
    return (
      <div className={cx('recordCardCover', coverTypes[coverType], `appshowtype${appshowtype || '0'}`)}>
        {url && !coverError ? (
          coverType ? (
            <img
              onClick={this.handleCoverClick}
              className={cx('img', { w100: coverType === 1 })}
              src={url}
              role="presentation"
            />
          ) : (
            <div onClick={this.handleCoverClick} className="img cover" style={{ backgroundImage: `url(${url})` }}></div>
          )
        ) : (
          <div className="withoutImg img flexRow valignWrapper">
            <img src={emptyCover}></img>
          </div>
        )}
      </div>
    );
  }
  renderControl(id, nameVisible = false) {
    const { data, view, projectId, controls } = this.props;
    const { cardControls } = this;
    const visibleControl = _.find(cardControls, { controlId: id }) || {};
    const cell = Object.assign({}, visibleControl, { value: data[visibleControl.controlId] });

    return (
      <div className="controlWrapper" key={id}>
        {(nameVisible || visibleControl.desc) && (
          <div className="controlName ellipsis Gray_9e">
            {visibleControl.desc ? (
              <Tooltip
                text={
                  <span
                    className="Block"
                    style={{
                      maxWidth: 230,
                      maxHeight: 200,
                      overflowY: 'auto',
                      color: '#fff',
                      whiteSpace: 'pre-wrap',
                    }}
                  >
                    {visibleControl.desc}
                  </span>
                }
                action={['click']}
                popupPlacement={'topLeft'}
                offset={[-12, 0]}
              >
                <i
                  className="icon-workflow_error descBoxInfo pointer Font16 Gray_9e mRight5"
                  onClick={e => e.stopPropagation()}
                />
              </Tooltip>
            ) : (
              ''
            )}
            {nameVisible ? visibleControl.controlName : ''}
          </div>
        )}
        <div className="controlContent">
          {data[visibleControl.controlId] || visibleControl.type === 47 ? (
            <CellControl
              className={`control-val-${visibleControl.controlId} w100`}
              worksheetId={view.worksheetId}
              projectId={projectId}
              rowFormData={() => controls.map(c => Object.assign({}, c, { value: data[c.controlId] }))}
              row={data}
              rowHeight={34}
              cell={cell}
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
    const { data, view, allowAdd, controls, sheetSwitchPermit } = this.props;
    const { viewType, advancedSetting, coverCid, showControlName, viewId } = view;
    const isShowWorkflowSys = isOpenPermit(permitList.sysControlSwitch, sheetSwitchPermit);
    let titleControl = _.find(controls, control => control.attribute === 1) || {};
    const titleText = getTitleTextFromControls(controls, data);
    const { checked, appshowtype } = this.state;
    const displayControls = view.displayControls.filter(id => {
      const itControl = controls.find(l => l.controlId === id);

      return (
        id !== titleControl.controlId &&
        !!itControl &&
        controlState(itControl).visible &&
        (isShowWorkflowSys || !_.includes(WORKFLOW_SYSTEM_FIELDS_SORT, id))
      );
    });
    const recordColorConfig = getRecordColorConfig(view);
    const recordColor =
      recordColorConfig &&
      getRecordColor({
        controlId: recordColorConfig.controlId,
        colorItems: recordColorConfig.colorItems,
        controls,
        row: data,
      });

    const showCheckItem = _.find(controls || [], v => v.controlId === advancedSetting.checkradioid) || {};
    const canEdit =
      !_.get(window, 'shareState.isPublicView') &&
      !_.get(window, 'shareState.isPublicPage') &&
      isOpenPermit(permitList.quickSwitch, sheetSwitchPermit, viewId) &&
      data.allowedit &&
      controlState(showCheckItem).editable; // 当前快速编辑检查项字段是否可编辑

    return (
      <div
        className="recordCardContent flex"
        style={{
          backgroundColor: recordColor && recordColorConfig.showBg ? recordColor.lightColor : undefined,
          border: recordColor && recordColorConfig.showBg ? `1px solid ${recordColor.lightColor}` : undefined,
        }}
      >
        {recordColor && recordColorConfig.showLine && (
          <div
            className={cx('colorTag', { colorTagRight: advancedSetting.coverposition === '1' })}
            style={{ backgroundColor: recordColor.color }}
          ></div>
        )}
        <div className={cx('flexRow valignWrapper mBottom5', `control-val-${titleControl.controlId}`)}>
          {advancedSetting.checkradioid && !_.includes(view.controls || [], advancedSetting.checkradioid) && (
            <Checkbox
              className="mRight10"
              disabled={!canEdit}
              checked={checked}
              style={{ '--icon-size': '18px' }}
              onChange={this.handleChangeCheckbox}
              onClick={e => {
                e.stopPropagation();
              }}
            />
          )}
          <div className="titleText Gray bold Font14 ellipsis">{titleText}</div>
        </div>
        {advancedSetting.abstract && (
          <div className="Gray_9e Font12 mBottom8 abstract">{this.renderControl(advancedSetting.abstract)}</div>
        )}
        <div className={cx(`cardContent${appshowtype}`)}>
          {(appshowtype === '0' ? displayControls.slice(0, 3) : displayControls).map(id =>
            this.renderControl(id, ['0', '2'].includes(appshowtype) ? true : showControlName),
          )}
        </div>
      </div>
    );
  }
  checkedCurrentRow = (e, data) => {
    e.stopPropagation();
    const { changeBatchOptData, batchOptCheckedData } = this.props;
    let copyBatchOptCheckedData = batchOptCheckedData ? [...batchOptCheckedData] : [];
    if (batchOptCheckedData.includes(data.rowid)) {
      changeBatchOptData(copyBatchOptCheckedData.filter(item => item !== data.rowid));
    } else {
      copyBatchOptCheckedData.push(data.rowid);
      changeBatchOptData(copyBatchOptCheckedData);
    }
  };
  render() {
    const { className, view, data, onClick, batchOptVisible, batchOptCheckedData, controls } = this.props;
    const { advancedSetting, coverCid } = view;
    let batchOptChecked = batchOptVisible && batchOptCheckedData.includes(data.rowid);
    const showControlStyle = _.get(view, 'advancedSetting.controlstyleapp') === '1';

    const controlStyles =
      showControlStyle &&
      getControlStyles(
        view.displayControls
          .map(id => _.find(controls, { controlId: id }))
          .concat(_.find(controls, { attribute: 1 }))
          .filter(_.identity),
      );
    return (
      <Con
        ref={node => (this.cardWrap = node)}
        controlStyles={controlStyles}
        className={cx('mobileWorksheetRecordCard', className, {
          coverRight: [undefined, '0'].includes(advancedSetting.coverposition),
          converTop: ['2'].includes(advancedSetting.coverposition),
          batchOptStyle: batchOptChecked,
        })}
        onClick={batchOptVisible ? e => this.checkedCurrentRow(e, data) : onClick}
        key={data.rowid}
      >
        {coverCid && this.renderCover()}
        {this.renderContent()}
        {batchOptVisible && (
          <div
            className={cx('batchOptCheck', { batchOptChecked: batchOptChecked })}
            onClick={e => this.checkedCurrentRow(e, data)}
          >
            <Icon icon="done" />
          </div>
        )}
      </Con>
    );
  }
}
