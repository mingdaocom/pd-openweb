import React, { Component } from 'react';
import { Checkbox } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, Tooltip } from 'ming-ui';
import worksheetAjax from 'src/api/worksheet';
import BarCode from 'src/components/Form/MobileForm/widgets/BarCode/index.jsx';
import { controlState, getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { isDocument } from 'src/components/UploadFiles/utils';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { isIframeControl } from 'src/pages/widgetConfig/widgetSetting/components/DynamicDefaultValue/util';
import emptyCover from 'src/pages/worksheet/assets/emptyCover.png';
import { WORKFLOW_SYSTEM_FIELDS_SORT } from 'src/pages/worksheet/common/ViewConfig/enum';
import { getCoverStyle } from 'src/pages/worksheet/common/ViewConfig/utils';
import CellControl from 'src/pages/worksheet/components/CellControls';
import { checkCellIsEmpty, getControlStyles } from 'src/utils/control';
import RegExpValidator from 'src/utils/expression';
import { compatibleMDJS } from 'src/utils/project';
import { getRecordColor, getRecordColorConfig } from 'src/utils/record';
import './index.less';

const Con = styled.div`
  width: 100%;
  ${({ controlStyles }) => controlStyles || ''}
`;

function getCoverControlData(data) {
  return _.find(
    data,
    file =>
      RegExpValidator.fileIsPicture(file.ext) ||
      RegExpValidator.isVideo(file.ext) ||
      (isDocument(file.ext) && file.previewUrl),
  );
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
      appshowtype: _.includes([1, 3, 6], view.viewType) ? '1' : _.get(view, 'advancedSetting.appshowtype') || '0',
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
      console.log(err);
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
    const { coverType, coverFillType = 0 } = getCoverStyle(this.props.view);
    const { cover } = this;
    const imageView2 = coverType === 0 && coverFillType === 1 ? `imageView2/2/w/750` : `imageView2/1/w/750/h/750`;
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
    const attachmentsData = attachments.map(attachment => {
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
    });
    compatibleMDJS(
      'previewImage',
      {
        index: index || 0,
        files: attachmentsData.map(item => ({ ...item, fileID: item.fileId || item.fileID })),
        filterRegex: [], // 给到生效中的文件名正则, 修改文件名时需要符合正则要求
        checkValueByFilterRegex: () => false,
        worksheetId: view.worksheetId,
        rowId: data.rowid,
        controlId: view.coverCid,
      },
      () => {
        previewAttachments({
          index: index || 0,
          attachments: attachmentsData,
          showThumbnail: true,
          hideFunctions,
          disableNoPeimission: true,
          recordId: data.rowid,
          controlId: view.coverCid,
          worksheetId: view.worksheetId,
          projectId,
        });
      },
    );
  }
  handleCoverClick = e => {
    const { view, data } = this.props;
    const { cover } = this;
    let coverControlData;
    try {
      coverControlData = JSON.parse(data[view.coverCid]);
    } catch (err) {
      console.log(err);
      return;
    }
    this.previewAttachment(
      coverControlData,
      _.findIndex(coverControlData, attachment => attachment.fileID === cover.fileID) || 0,
    );
    e.stopPropagation();
  };
  handleChangeCheckbox = () => {
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
      .then(() => {
        this.setState({
          checked: newChecked,
        });
      });
  };

  getIframe = coverCid => {
    const { data } = this.props;
    // 嵌入字段（链接，配置侧仅画廊视图支持）
    const isLegalLink = /^https?:\/\/.+$/.test(data[coverCid]);
    return (
      <div className="coverWrap">
        {isLegalLink ? (
          <iframe className="overflowHidden Border0" width="100%" height="100%" src={data[coverCid]} />
        ) : (
          <div className={cx('coverWrap', 'emptyCoverWrap mobileOverWrap')}>
            <img src={emptyCover} />
          </div>
        )}
      </div>
    );
  };

  renderCover() {
    const { view, controls, data, appId } = this.props;
    const { coverType, coverFillType, coverPosition } = getCoverStyle(this.props.view);
    const { coverError, appshowtype } = this.state;
    const { url } = this;
    const { coverCid, worksheetId, viewId } = view;
    const coverCidControl = _.find(controls, { controlId: coverCid }) || {};
    const { type } = coverCidControl;
    const isIframeCover = isIframeControl(coverCidControl);

    return (
      <div
        className={cx('recordCardCover', coverTypes[coverType], `appshowtype${appshowtype || '0'}`, {
          mLeft10: coverPosition === '1' && _.includes([2, 2], coverType),
          mRight10: coverPosition === '0' && _.includes([2, 3], coverType),
        })}
      >
        {isIframeCover ? (
          this.getIframe(coverCid)
        ) : type === 47 ? (
          <BarCode
            {...coverCidControl}
            formData={data}
            appId={appId}
            className="coverWrapQr"
            worksheetId={worksheetId}
            recordId={data.rowid}
            viewIdForPermit={viewId}
            isView={true}
          />
        ) : url && !coverError ? (
          coverType ? (
            <img
              onClick={this.handleCoverClick}
              className={cx('img', { w100: coverType === 0 && coverFillType === 1 })}
              src={url}
              role="presentation"
            />
          ) : (
            <div
              onClick={this.handleCoverClick}
              className="img cover"
              style={{ backgroundImage: `url(${url})`, backgroundSize: coverFillType === 1 ? 'contain' : 'cover' }}
            ></div>
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
    const maxLine = _.get(view, 'advancedSetting.maxlinenum');

    return (
      <div className="controlWrapper" key={id}>
        {(nameVisible || visibleControl.desc) && (
          <div className="controlName ellipsis">
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
                autoCloseDelay={0}
                action={['click']}
                popupPlacement={'topLeft'}
                offset={[-12, 0]}
              >
                <i
                  className="icon-info_outline descBoxInfo pointer Font16 Gray_9e mRight5"
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
          {!checkCellIsEmpty(data[visibleControl.controlId]) || visibleControl.type === 47 ? (
            <CellControl
              className={`control-val-${visibleControl.controlId} maxLine${maxLine} w100`}
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
    const { data, view, controls, sheetSwitchPermit } = this.props;
    const { advancedSetting, showControlName, viewId } = view;
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
    const fieldShowCount = appshowtype === '0' ? 3 : _.get(view, 'advancedSetting.showcount');
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
    const { coverPosition } = getCoverStyle(view);

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
            className={cx('colorTag', { colorTagRight: coverPosition === '1' })}
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
          <div className="titleText Gray bold ellipsis">{titleText}</div>
        </div>
        {advancedSetting.abstract && (
          <div className="Gray_9e mBottom8 abstract">{this.renderControl(advancedSetting.abstract)}</div>
        )}
        <div className={cx(`cardContent${appshowtype}`)}>
          {(fieldShowCount ? displayControls.slice(0, fieldShowCount) : displayControls).map(id =>
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
    const { coverCid } = view;
    let batchOptChecked = batchOptVisible && batchOptCheckedData.includes(data.rowid);
    const showControlStyle = _.get(view, 'advancedSetting.controlstyleapp') === '1';
    const { coverPosition } = getCoverStyle(view);

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
          coverRight: ['0'].includes(coverPosition),
          converTop: ['2'].includes(coverPosition),
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
