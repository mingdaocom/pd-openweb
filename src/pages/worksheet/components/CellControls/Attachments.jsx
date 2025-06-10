import React, { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import { bool, func, number, shape, string } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';
import { deleteAttachmentOfControl } from 'worksheet/api';
import { downloadAttachmentById, openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import { checkValueByFilterRegex, controlState } from 'src/components/newCustomFields/tools/formUtils.js';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import { permitList } from 'src/pages/FormSet/config.js';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { browserIsMobile, formatFileSize, getClassNameByExt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';
import { addBehaviorLog, compatibleMDJS } from 'src/utils/project';
import { FROM } from './enum';

const Con = styled.div`
  &:hover {
    .CutCon {
      margin-right: 34px;
    }
    ${({ tableType }) =>
      tableType !== 'classic'
        ? `.OperateIcon {
      display: inline-block;
    }`
        : ''}
  }
  &.canedit.focusShowEditIcon.focus:not(.isediting) {
    .OperateIcon {
      display: inline-block;
    }
  }
`;

const CutCon = styled.div`
  overflow: hidden;
  white-space: nowrap;
`;

const EditingCon = styled.div`
  padding: 5px 6px 0px;
  box-shadow: inset 0 0 0 2px #2d7ff9 !important;
  background-color: #fff;
`;

const AttachmentCon = styled.div`
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-right: 4px;
  vertical-align: middle;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  margin-bottom: 5px;
  &:hover {
    .hoverMask {
      display: inline-block;
    }
    background-color: rgba(0, 0, 0, 0.05);
  }
`;

const AttachmentImageCon = styled.div`
  position: relative;
  img {
    border-radius: 2px;
    vertical-align: middle;
    min-width: 21px;
    object-fit: cover;
  }
  &.circle {
    border-radius: 50%;
    overflow: hidden;
    .shadowInset {
      border-radius: 50%;
    }
  }
`;

const AttachmentDoc = styled.span`
  vertical-align: middle;
  flex-shrink: 0;
`;

const AttachmentDocFileName = styled.span`
  padding: 0 6px;
  .ellipsis {
    display: inline-block;
  }
  .name {
    max-width: 200px;
  }
  .ext {
    max-width: 100px;
  }
`;

const ShadowInset = styled.span`
  position: absolute;
  border-radius: 2px;
  width: 100%;
  height: 100%;
  box-shadow: inset 0px 0px 0px 1px rgba(0, 0, 0, 0.05);
`;

const ImageHoverMask = styled.span`
  position: absolute;
  border-radius: 2px;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.05);
  display: none;
`;

const OperateIcon = styled.div`
  display: none;
  position: absolute;
  right: 4px;
  top: 4px;
  width: 24px;
  height: 24px;
  border-radius: 3px;
  background: #fff;
  text-align: center;
  color: #9e9e9e;
  font-size: 16px;
  cursor: pointer;
`;

const HoverPreviewPanelCon = styled.div`
  text-align: center;
  width: 240px;
  box-shadow: 0px 1px 6px rgba(0, 0, 0, 0.24);
  border-radius: 6px;
  background-color: #fff;
  overflow: hidden;
  .fileDetail {
    text-align: left;
    font-size: 13px;
    padding: 8px 16px;
    word-break: break-all;
  }
  .fileName {
    color: #151515;
  }
  .panelFooter {
    margin-top: 2px;
  }
  .fileSize {
    color: #9e9e9e;
  }
  .downloadBtn {
    margin-right: 16px;
  }
  .downloadBtn,
  .deleteBtn {
    cursor: pointer;
    float: right;
    color: #9e9e9e;
    font-size: 18px;
    &:not(.disabled):hover {
      color: #f44336;
    }
    &.disabled {
      cursor: not-allowed;
    }
  }
`;

const ImageCoverCon = styled.div`
  background-color: #f5f5f5;
  height: 160px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

const ImageCover = styled.img`
  max-width: 100%;
  max-height: 160px;
  object-fit: contain;
  &.loading {
    width: 240px;
    height: 160px;
    filter: blur(2px);
  }
`;

const Add = styled.div`
  cursor: pointer;
  display: inline-flex;
  justify-content: center;
  align-items: center;
  position: relative;
  margin-right: 4px;
  margin-bottom: 5px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #ddd;
  .icon {
    font-size: 16px;
    color: #ccc;
    line-height: inherit;
  }
`;

function addAttachmentIndex(submitData, enumDefault) {
  // 补充 index
  if ([2, 3].includes(enumDefault)) {
    // 旧的在前
    submitData.attachmentData.forEach((data, index) => {
      data.index = index;
    });
    submitData.attachments.forEach((data, index) => {
      data.index = submitData.attachmentData.length + index;
    });
    submitData.knowledgeAtts.forEach((data, index) => {
      data.index = submitData.attachmentData.length + submitData.attachments.length + index;
    });
  } else {
    // 新的在前
    submitData.attachments.forEach((data, index) => {
      data.index = index;
    });
    submitData.knowledgeAtts.forEach((data, index) => {
      data.index = submitData.attachments.length + index;
    });
    submitData.attachmentData.forEach((data, index) => {
      data.index = submitData.attachments.length + submitData.knowledgeAtts.length + index;
    });
  }
  return submitData;
}

function parseValue(valueStr, errCb) {
  let value = [];
  try {
    value = JSON.parse(valueStr);
    if (value.attachmentData && value.attachments && value.knowledgeAtts) {
      value = [...value.attachments, ...value.knowledgeAtts, ...value.attachmentData];
    }
    value = value.map(attachment => {
      const newAttachment =
        attachment.createTime || !_.isUndefined(attachment.fileSize)
          ? {
              ext: attachment.ext || attachment.fileExt,
              fileID: attachment.fileID || attachment.fileId,
              originalFilename: attachment.originalFileName || attachment.originalFilename,
              previewUrl:
                attachment.previewUrl ||
                attachment.viewUrl ||
                attachment.url ||
                `${attachment.serverName}${attachment.key}`,
              refId: attachment.refID || attachment.refId,
              shareUrl: attachment.shareUrl,
              filesize: attachment.fileSize || attachment.filesize,
            }
          : attachment;
      if (newAttachment.ext === '.') {
        newAttachment.ext = '';
      }
      newAttachment.origin = attachment;
      return newAttachment;
    });
  } catch (err) {
    return [];
  }
  return value;
}

function previewAttachment({
  attachments,
  index,
  sheetSwitchPermit = [],
  viewId = '',
  disableDownload,
  handleOpenControlAttachmentInNewTab,
  worksheetId,
  recordId,
  fileId,
  controlId,
  from,
  advancedSetting,
  allowEdit,
  onlyEditSelf,
  projectId,
  masterWorksheetId,
  masterRecordId,
  masterControlId,
  sourceControlId,
}) {
  const recordAttachmentSwitch = isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
  let hideFunctions = ['editFileName', 'saveToKnowlege'];
  const allowDownload = advancedSetting.allowdownload || '1';
  if (!recordAttachmentSwitch || disableDownload || allowDownload === '0') {
    /* 是否不可下载 且 不可保存到知识和分享 */
    hideFunctions.push('download', 'share');
  }
  addBehaviorLog('previewFile', worksheetId, { fileId, rowId: recordId });
  const attachmentsData = attachments.map(attachment => {
    if (attachment.fileID && attachment.fileID.slice(0, 2) === 'o_') {
      return Object.assign({}, attachment, {
        previewAttachmentType: 'QINIU',
        path: attachment.origin.url || attachment.previewUrl,
        ext: attachment.ext.slice(1),
        name: attachment.originalFilename || _l('图片'),
      });
    }
    return Object.assign({}, attachment, {
      previewAttachmentType: 'COMMON_ID',
    });
  });
  compatibleMDJS(
    'previewImage',
    {
      index: index || 0,
      files: attachmentsData,
      worksheetId,
      rowId: recordId,
      controlId,
    },
    () => {
      previewAttachments(
        {
          index: index || 0,
          fromType: 4,
          attachments: attachmentsData,
          showThumbnail: true,
          hideFunctions: hideFunctions,
          disableNoPeimission: true,
          worksheetId,
          fileId: attachments[index].fileID,
          recordId,
          controlId,
          from,
          allowEdit,
          onlyEditSelf,
          projectId,
          masterWorksheetId,
          masterRecordId,
          masterControlId,
          sourceControlId,
        },
        {
          openControlAttachmentInNewTab: handleOpenControlAttachmentInNewTab,
        },
      );
    },
  );
}

function HoverPreviewPanel(props, cb = () => {}) {
  const {
    isPicture,
    isSubList,
    editable,
    cell = {},
    attachment = {},
    cellInfo = {},
    smallThumbnailUrl,
    onUpdate,
    deleteLocalAttachment,
    sheetSwitchPermit,
    masterData,
  } = props;
  const { originalFilename, ext = '', filesize } = attachment;
  const { controlId, advancedSetting, sourceControlId } = cell;
  const { appId, viewId, worksheetId, recordId, disableDownload } = cellInfo;
  const [loading, setLoading] = useState(true);
  const allowDelete = advancedSetting.allowdelete || '1';
  const allowDownload = advancedSetting.allowdownload || '1';
  const recordAttachmentSwitch =
    !!_.get(window, 'shareState.shareId') || isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
  const downloadable =
    recordAttachmentSwitch &&
    !disableDownload &&
    attachment.fileID &&
    attachment.fileID.length === 36 &&
    allowDownload === '1';
  const imageUrl = attachment.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/h/160');
  useEffect(() => {
    const image = new Image();
    image.onload = () => {
      setLoading(false);
    };
    image.src = imageUrl;
  }, []);
  function handleDelete() {
    if (isSubList) {
      deleteLocalAttachment(attachment.fileID);
    } else {
      deleteAttachmentOfControl(
        {
          appId,
          viewId,
          worksheetId,
          recordId,
          controlId,
          attachment,
        },
        (err, data) => {
          if (err) {
            alert(_l('删除失败，请稍后重试'), 2);
          } else {
            onUpdate(data[controlId]);
          }
        },
      );
    }
  }
  return (
    <HoverPreviewPanelCon onClick={e => e.stopPropagation()}>
      {isPicture && (
        <ImageCoverCon>
          <ImageCover
            src={loading ? smallThumbnailUrl : imageUrl}
            className={loading ? 'loading' : ''}
            // src={attachment.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/h/160')}
          />
        </ImageCoverCon>
      )}
      <div className="fileDetail">
        <div className="fileName">{originalFilename + ext}</div>
        <div className="panelFooter">
          <span className="fileSize">{formatFileSize(filesize)}</span>
          {allowDelete === '1' && (
            <Tooltip text={<span>{_l('删除')}</span>} popupPlacement="top">
              <i
                className={cx('icon icon-trash deleteBtn', { disabled: !editable })}
                onClick={editable ? handleDelete : () => {}}
              ></i>
            </Tooltip>
          )}
          {downloadable && (
            <Tooltip text={<span>{_l('下载')}</span>} popupPlacement="top">
              <i
                className="icon icon-download downloadBtn ThemeHoverColor3"
                onClick={() =>
                  downloadAttachmentById({
                    fileId: attachment.fileID,
                    refId: attachment.refId,
                    worksheetId,
                    rowId: recordId,
                    controlId: _.get(masterData, 'controlId') || controlId,
                    parentWorksheetId: _.get(masterData, 'worksheetId'),
                    parentRowId: _.get(masterData, 'recordId'),
                    sourceControlId: sourceControlId,
                  })
                }
              ></i>
            </Tooltip>
          )}
        </div>
      </div>
    </HoverPreviewPanelCon>
  );
}

function AttachmentImage(props) {
  const { showShape, style = {} } = props;
  let { width, height, objectFit } = style;
  if (showShape === 'circle' || showShape === 'rect') {
    width = height;
  }
  const imgRef = useRef();
  useEffect(() => {
    return () => {
      if (imgRef.current) imgRef.current.src = '';
    };
  }, []);
  return (
    <AttachmentImageCon className={showShape}>
      <ImageHoverMask className="hoverMask" />
      <ShadowInset className="shadowInset" />
      <img {...props} style={{ width, height, objectFit }} ref={imgRef} />
    </AttachmentImageCon>
  );
}

function Attachment(props) {
  const {
    showShape,
    objectFit,
    showFileName,
    isTrash,
    isSubList,
    editable,
    index,
    viewId,
    cell,
    cellInfo,
    cellWidth,
    fileWidth,
    fileHeight,
    attachments,
    sheetSwitchPermit,
    onUpdate,
    deleteLocalAttachment,
    projectId,
  } = props;
  const { appId, recordId, worksheetId, from, masterData = () => {} } = cellInfo;
  const { attachment } = props;
  const [isPicture, setIsPicture] = useState(RegExpValidator.fileIsPicture(attachment.ext));
  const smallThumbnailUrl = (attachment.previewUrl || '').replace(
    /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
    'imageView2/2/h/' + fileHeight,
  );

  useEffect(() => {
    setIsPicture(RegExpValidator.fileIsPicture(attachment.ext));
  }, [attachment.ext]);
  return (
    <Trigger
      action={browserIsMobile() ? [] : ['hover']}
      popup={
        <HoverPreviewPanel
          isPicture={isPicture}
          isSubList={isSubList}
          editable={editable && !(cell.required && attachments.length === 1 && !isSubList)}
          sheetSwitchPermit={sheetSwitchPermit}
          attachment={attachment}
          smallThumbnailUrl={smallThumbnailUrl}
          cell={cell}
          cellInfo={cellInfo}
          masterData={masterData()}
          onUpdate={onUpdate}
          deleteLocalAttachment={deleteLocalAttachment}
        />
      }
      getPopupContainer={() => document.body}
      destroyPopupOnHide
      mouseEnterDelay={0.4}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 4],
        overflow: {
          adjustY: true,
          adjustX: true,
        },
      }}
    >
      <AttachmentCon
        className="AttachmentCon"
        style={{ maxWidth: cellWidth }}
        onClick={e => {
          e.stopPropagation();

          if (attachment && !!attachment.refId && !attachment.shareUrl) {
            alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
            return;
          }
          previewAttachment({
            attachments,
            index,
            sheetSwitchPermit,
            viewId,
            disableDownload: cellInfo.disableDownload,
            handleOpenControlAttachmentInNewTab:
              isTrash || browserIsMobile()
                ? undefined
                : (fileId, options = {}) => {
                    openControlAttachmentInNewTab({
                      appId,
                      recordId,
                      viewId: !isSubList ? viewId : undefined,
                      worksheetId,
                      controlId: cell.controlId,
                      fileId,
                      getType: from === 21 ? from : undefined,
                      ...options,
                    });
                  },
            worksheetId,
            recordId,
            fileId: attachment.fileID,
            controlId: cell.controlId,
            from,
            advancedSetting: cell.advancedSetting,
            allowEdit: controlState(cell, from).editable && _.get(cell, 'advancedSetting.allowedit') === '1',
            onlyEditSelf: _.get(cell, 'advancedSetting.onlyeditself') === '1',
            projectId,
            masterWorksheetId: (masterData() || {}).worksheetId,
            masterRecordId: (masterData() || {}).recordId,
            masterControlId: (masterData() || {}).controlId,
            sourceControlId: cell.sourceControlId,
          });
        }}
      >
        {isPicture ? (
          <AttachmentImage
            showShape={showShape}
            crossOrigin="anonymous"
            role="presentation"
            src={smallThumbnailUrl}
            onError={() => setIsPicture(false)}
            style={{ width: 'auto', height: fileHeight, objectFit }}
          />
        ) : (
          <AttachmentDoc
            className={`fileIcon ${getClassNameByExt(attachment.ext)}`}
            title={attachment.originalFilename + (attachment.ext || '')}
            style={{ width: fileWidth, height: fileHeight }}
          />
        )}
        {showFileName && (
          <AttachmentDocFileName className="ellipsis" title={attachment.originalFilename + (attachment.ext || '')}>
            <span className="name ellipsis">{attachment.originalFilename}</span>
            <span className="ext ellipsis">{attachment.ext || ''}</span>
          </AttachmentDocFileName>
        )}
      </AttachmentCon>
    </Trigger>
  );
}

function cellAttachments(props, sourceRef) {
  const {
    isTrash,
    isSubList,
    from = 1,
    tableType,
    className,
    style,
    projectId,
    appId,
    worksheetId,
    viewId,
    sheetSwitchPermit,
    isediting,
    error,
    columnStyle,
    cell = {},
    rowHeight = 34,
    popupContainer,
    onClick,
    updateEditingStatus,
    updateCell,
    ...rest
  } = props;
  let { editable } = props;
  const { value, strDefault = '', advancedSetting = {}, enumDefault } = cell;
  const showShape =
    {
      4: 'rect',
      5: 'circle',
    }[String(columnStyle.showtype)] || '';
  const objectFit =
    {
      0: 'cover',
      1: 'contain',
    }[String(columnStyle.coverFillType)] || 'cover';
  const [, onlyAllowMobileInput] = strDefault.split('');
  const allowupload = advancedSetting.allowupload || '1';
  if (cell.type === 14 && onlyAllowMobileInput === '1') {
    editable = false;
  }
  const [uploadFileVisible, setUploadFileVisible] = useState(isediting);
  const [attachments, setAttachments] = useState(parseValue(value));
  const [temporaryAttachments, setTemporaryAttachments] = useState([]);
  const [temporaryKnowledgeAtts, setTemporaryKnowledgeAtts] = useState([]);
  const showFileValue = _.isUndefined(advancedSetting.showfilename)
    ? _.includes(['2', '3'], advancedSetting.showtype)
      ? '1'
      : '0'
    : advancedSetting.showfilename;
  const showFileName =
    (from === FROM.COMMON && showFileValue === '1') ||
    (from === FROM.CARD && attachments.length === 1 && !RegExpValidator.fileIsPicture(attachments[0].ext));
  const fileHeight = showFileValue === '1' ? 24 : rowHeight - 10;
  const fileWidth = (fileHeight * 21) / 24;
  useImperativeHandle(sourceRef, () => ({
    handleTableKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          updateEditingStatus(false);
          break;
        default:
      }
    },
  }));
  const ref = useRef(null);
  useClickAway(ref, e => {
    if (
      !e.target.closest(
        [
          '#folderSelectDialog_container',
          '.addLinkFileDialog',
          '.attachmentsPreview',
          '.UploadFilesTriggerPanel',
          '.triggerTraget',
          '.folderSelectDialog',
          '.fileDetail',
        ].join(','),
      )
    ) {
      updateEditingStatus(false);
    }
  });
  useEffect(() => {
    if (isediting) {
      setUploadFileVisible(true);
    }
  }, [isediting]);
  useEffect(() => {
    setAttachments(parseValue(value));
  }, [value]);
  function handleChange(_attachments) {
    const attachmentList = _attachments || attachments;
    const submitData = {};
    const tempSavedAttachments = attachmentList.filter(c => /^o_/.test(c.fileID) && !c.refId).map(c => c.origin);
    const tempSavedKcAttachments = attachmentList.filter(c => /^o_/.test(c.fileID) && c.refId).map(c => c.origin);
    submitData.attachmentData = attachmentList.filter(c => !/^o_/.test(c.fileID)).map(c => c.origin);
    submitData.attachments = (temporaryAttachments || [])
      .concat(tempSavedAttachments)
      .map(a => ({ ...a, isEdit: false }));
    submitData.knowledgeAtts =
      (temporaryKnowledgeAtts || []).concat(tempSavedKcAttachments).map(a => ({ ...a, isEdit: false })) || [];
    updateCell(
      {
        editType: 1,
        value: JSON.stringify(addAttachmentIndex(submitData, enumDefault)),
      },
      {
        callback: data => {
          let parsedValue = [];
          try {
            parsedValue = JSON.parse(data[cell.controlId]);
          } catch (err) {}
          setAttachments(
            parsedValue.map(file => ({
              ext: file.ext,
              fileID: file.fileID,
              originalFilename: file.originalFilename,
              previewUrl: file.previewUrl,
              refId: file.refId,
            })),
          );
        },
      },
    );
    updateEditingStatus(false);
    setTemporaryAttachments([]);
    setTemporaryKnowledgeAtts([]);
  }
  const attachmentsComp = attachments.map((attachment, index) => (
    <Attachment
      showShape={showShape}
      objectFit={objectFit}
      showFileName={showFileName}
      isTrash={isTrash}
      isSubList={isSubList}
      editable={editable}
      cell={cell}
      popupContainer={popupContainer}
      attachment={attachment}
      cellWidth={style.width - 12}
      fileHeight={fileHeight}
      fileWidth={fileWidth}
      cellInfo={props}
      index={index}
      attachments={attachments}
      sheetSwitchPermit={sheetSwitchPermit}
      viewId={viewId}
      projectId={projectId}
      onUpdate={valueStr => {
        setAttachments(parseValue(valueStr));
      }}
      deleteLocalAttachment={id => {
        handleChange(attachments.filter(a => a.fileID !== id));
      }}
    />
  ));
  if (isediting && allowupload === '1') {
    const popContent = (
      <UploadFilesTrigger
        allowUploadFileFromMobile
        appId={appId}
        worksheetId={worksheetId}
        controlId={cell.controlId}
        recordId={rest.recordId}
        originCount={attachments.length}
        advancedSetting={advancedSetting}
        id={cell.controlId + rest.recordId}
        projectId={projectId}
        noWrap
        destroyPopupOnHide={!window.isSafari} // 不是 Safari
        popupVisible={editable && (uploadFileVisible || !attachments.length)}
        from={from}
        canAddLink={false}
        minWidth={130}
        showAttInfo={false}
        attachmentData={[]}
        temporaryData={temporaryAttachments}
        onTemporaryDataUpdate={res => {
          setTemporaryAttachments(res);
        }}
        kcAttachmentData={temporaryKnowledgeAtts}
        onKcAttachmentDataUpdate={res => {
          setTemporaryKnowledgeAtts(res);
        }}
        getPopupContainer={() => document.body}
        onCancel={() => {
          setUploadFileVisible(false);
        }}
        onClose={() => {
          setUploadFileVisible(false);
        }}
        onOk={() => {
          handleChange();
        }}
        checkValueByFilterRegex={name => {
          const formData = props.rowFormData();
          return checkValueByFilterRegex(
            { advancedSetting },
            RegExpValidator.getNameOfFileName(name),
            formData,
            rest.recordId,
          );
        }}
      >
        <EditingCon ref={ref} style={{ width: style.width, minHeight: style.height }}>
          {attachmentsComp}
          {allowupload === '1' && (
            <Add
              style={{ width: fileWidth, height: fileHeight, lineHeight: fileHeight - 2 + 'px' }}
              onClick={() => setUploadFileVisible(true)}
            >
              <i className="icon icon-plus"></i>
            </Add>
          )}
        </EditingCon>
      </UploadFilesTrigger>
    );
    return (
      <Trigger
        zIndex={99}
        popup={popContent}
        getPopupContainer={popupContainer}
        popupClassName="filterTrigger"
        popupVisible={isediting}
        destroyPopupOnHide
        popupAlign={{
          points: ['tl', 'tl'],
          overflow: { adjustY: true },
        }}
      >
        <div className={className} style={style} onClick={onClick} />
      </Trigger>
    );
  }
  return (
    <Con
      className={cx(className, { canedit: editable })}
      tableType={tableType}
      style={style}
      onClick={allowupload === '1' ? onClick : undefined}
    >
      {rowHeight === 34 ? <CutCon className="CutCon">{attachmentsComp}</CutCon> : attachmentsComp}
      {editable && allowupload === '1' && (
        <OperateIcon className="OperateIcon">
          <i
            className="ThemeHoverColor3 icon icon-attachment"
            onClick={e => {
              e.stopPropagation();
              updateEditingStatus(true);
            }}
          />
        </OperateIcon>
      )}
    </Con>
  );
}

cellAttachments.propTypes = {
  className: string,
  style: string,
  isediting: bool,
  error: bool,
  cell: shape({}),
  rowHeight: number,
  popupContainer: func,
  onClick: func,
  updateEditingStatus: func,
};

export default forwardRef(cellAttachments);
