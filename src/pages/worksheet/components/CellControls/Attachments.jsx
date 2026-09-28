import React, { forwardRef, useContext, useEffect, useImperativeHandle, useMemo, useRef, useState } from 'react';
import { useClickAway } from 'react-use';
import cx from 'classnames';
import _, { get, isFunction } from 'lodash';
import { bool, func, number, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Popover, Tooltip } from 'ming-ui/antd-components';
import { deleteAttachmentOfControl } from 'worksheet/api';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { downloadAttachmentById, openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import { checkValueByFilterRegex } from 'src/components/Form/core/formUtils';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import { formatFileSize } from 'src/utils/core/file';
import { permitList } from 'src/utils/domain/control/formEnum';
import { controlState } from 'src/utils/domain/control/state';
import { getClassNameByExt } from 'src/utils/domain/file/classification';
import { isOpenPermit } from 'src/utils/domain/permission/worksheet';
import RegExpValidator from 'src/utils/domain/validation/expression';
import { FROM } from 'src/utils/domain/worksheet/relation';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { addBehaviorLog, compatibleMDJS } from 'src/utils/services/project';

const getDefaultPopupContainer = () => document.body;

/** 显示文件名时的附件行高，与 fileHeight 保持一致 */
const ATTACHMENT_NAME_LINE_HEIGHT = 24;
const ATTACHMENT_COLUMN_GAP = 4;
const ATTACHMENT_ROW_GAP = 3;
/** 单元格上下内边距，见 CellControls.less 的 .control-14 */
const ATTACHMENT_CELL_PADDING_HEIGHT = 10;

/** 单元格可容纳的完整附件行数；只有显示文件名时附件高度才恒定，才谈得上多行 */
function getAttachmentMaxLines({ showFileValue, rowHeight }) {
  if (showFileValue !== '1') return 1;

  const contentHeight = rowHeight - ATTACHMENT_CELL_PADDING_HEIGHT;
  const lines = Math.floor((contentHeight + ATTACHMENT_ROW_GAP) / (ATTACHMENT_NAME_LINE_HEIGHT + ATTACHMENT_ROW_GAP));

  return Math.max(1, lines);
}

const Con = styled.div`
  &:hover {
    .CutCon {
      margin-right: 34px;
    }
    ${({ $tableType }) =>
      $tableType !== 'classic'
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
  /* 显示文件名时附件高度恒为 24px，行高调大后多出来的空间用于换行展示更多附件 */
  ${({ $maxLines, $lineHeight }) =>
    $maxLines > 1 &&
    `
    display: flex;
    flex-wrap: wrap;
    align-content: flex-start;
    white-space: normal;
    column-gap: ${ATTACHMENT_COLUMN_GAP}px;
    row-gap: ${ATTACHMENT_ROW_GAP}px;
    /* 按整行数封顶，避免最后一行被裁成半截 */
    max-height: ${$maxLines * $lineHeight + ($maxLines - 1) * ATTACHMENT_ROW_GAP}px;
    .AttachmentCon {
      margin-right: 0;
      margin-bottom: 0;
    }
  `}
`;

const EditingCon = styled.div`
  padding: 5px 6px 0px;
  box-shadow: inset 0 0 0 2px var(--color-primary-focus) !important;
  background-color: var(--color-background-primary);
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
  &:not(.isSingleFile) {
    .name {
      max-width: 200px;
    }
  }
  .ellipsis {
    display: inline-block;
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
  background: var(--color-background-primary);
  text-align: center;
  color: var(--color-text-tertiary);
  font-size: 16px;
  cursor: pointer;
`;

const HoverPreviewPanelCon = styled.div`
  width: 240px;
  .fileDetail {
    text-align: left;
    font-size: 13px;
    padding: 8px 16px;
    word-break: break-all;
  }
  .fileName {
    color: var(--color-text-title);
  }
  .panelFooter {
    margin-top: 2px;
  }
  .fileSize {
    color: var(--color-text-tertiary);
  }
  .downloadBtn,
  .openInNewTabBtn {
    margin-right: 16px;
  }
  .downloadBtn,
  .deleteBtn,
  .openInNewTabBtn {
    cursor: pointer;
    float: right;
    color: var(--color-text-tertiary);
    font-size: 18px;
    &:not(.disabled):hover {
      color: var(--color-error);
    }
    &.disabled {
      cursor: not-allowed;
    }
  }
`;

const ImageCoverCon = styled.div`
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
  border: 1px solid var(--color-border-primary);
  background-color: var(--color-background-tertiary);
  .icon {
    font-size: 16px;
    color: var(--color-text-placeholder);
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

function parseValue(valueStr = '[]') {
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
    console.log(err);
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
  openPreviewAttachments = previewAttachments,
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
      download: allowDownload === '1' && (!!_.get(window, 'shareState.shareId') || recordAttachmentSwitch),
    },
    () => {
      openPreviewAttachments(
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

function HoverPreviewPanel(props) {
  const {
    isPicture,
    shouldUseOriginalPreviewUrl,
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
    from,
    projectId,
  } = props;
  const { originalFilename, ext = '', filesize } = attachment;
  const { controlId, advancedSetting, sourceControlId } = cell;
  const { appId, viewId, worksheetId, recordId, disableDownload } = cellInfo;
  const [loadedImageUrl, setLoadedImageUrl] = useState('');
  const allowDelete =
    !(get(window, 'shareState.shareId') && !recordId.startsWith('temp-') && !recordId.startsWith('default-')) &&
    (advancedSetting.allowdelete || '1');
  const allowDownload = !get(window, 'shareState.isPublicQuery') && (advancedSetting.allowdownload || '1');
  const recordAttachmentSwitch =
    !!_.get(window, 'shareState.shareId') || isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
  const downloadable =
    recordAttachmentSwitch &&
    !disableDownload &&
    attachment.fileID &&
    attachment.fileID.length === 36 &&
    allowDownload === '1';
  const previewUrl = attachment.previewUrl || '';
  const imageUrl = shouldUseOriginalPreviewUrl
    ? previewUrl
    : previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/h/160');
  const loading = isPicture && loadedImageUrl !== imageUrl;
  const allowNewPage = recordId && !recordId.startsWith('temp-') && _.isEmpty(window.shareState);

  const handleOpenControlAttachmentInNewTab = (fileId, options = {}) => {
    addBehaviorLog('previewFile', worksheetId, { fileId, rowId: recordId });
    const openOptions = _.omitBy(options, _.isUndefined);

    openControlAttachmentInNewTab(
      _.assign(
        _.pick(cellInfo, ['appId', 'recordId', 'worksheetId']),
        {
          viewId: !isSubList ? cell.viewId : undefined,
          controlId,
          fileId,
          projectId,
          getType: from === 21 ? from : undefined,
        },
        openOptions,
      ),
    );
  };

  useEffect(() => {
    if (!imageUrl) return;
    let canceled = false;
    const image = new Image();

    image.onload = () => {
      if (!canceled) {
        setLoadedImageUrl(imageUrl);
      }
    };

    image.src = imageUrl;
    return () => {
      canceled = true;
    };
  }, [imageUrl]);
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
    <HoverPreviewPanelCon
      onClick={e => {
        e.stopPropagation();
        if (e.shiftKey) {
          handleOpenControlAttachmentInNewTab(attachment.fileID);
        }
      }}
    >
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
            <Tooltip title={_l('删除')}>
              <i
                className={cx('icon icon-trash deleteBtn', { disabled: !editable })}
                onClick={editable ? handleDelete : () => {}}
              ></i>
            </Tooltip>
          )}
          {downloadable && (
            <Tooltip title={_l('下载')}>
              <i
                className="icon icon-download downloadBtn hoverColorPrimary"
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
          {allowNewPage && (
            <Tooltip title={_l('浮窗打开')}>
              <i
                className="icon icon-rectangle_2 openInNewTabBtn hoverColorPrimary"
                onClick={() => handleOpenControlAttachmentInNewTab(attachment.fileID, { openAsPopup: true })}
              ></i>
            </Tooltip>
          )}
          {allowNewPage && (
            <Tooltip title={_l('新页面打开')} shortcut={window.isMacOs ? _l('⇧单击') : _l('Shift+单击')}>
              <i
                className="icon icon-launch openInNewTabBtn hoverColorPrimary"
                onClick={() => handleOpenControlAttachmentInNewTab(attachment.fileID)}
              ></i>
            </Tooltip>
          )}
        </div>
      </div>
    </HoverPreviewPanelCon>
  );
}

const getMasterData = masterData => (isFunction(masterData) ? masterData() : masterData);

function AttachmentImage(props) {
  const { showShape, style = {} } = props;
  let { width, height, objectFit } = style;

  if (showShape === 'circle' || showShape === 'rect') {
    width = height;
  }

  const imgRef = useRef();
  useEffect(() => {
    const image = imgRef.current;

    return () => {
      if (image) image.src = '';
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
    openPreviewAttachments,
  } = props;
  const { appId, recordId, worksheetId, from, masterData = () => {} } = cellInfo;
  const { attachment } = props;
  const attachmentPreviewKey = `${attachment.fileID || ''}-${attachment.previewUrl || ''}-${attachment.ext || ''}`;
  const [imageLoadErrorKey, setImageLoadErrorKey] = useState('');
  const isPicture = RegExpValidator.fileIsPicture(attachment.ext) && imageLoadErrorKey !== attachmentPreviewKey;
  const shouldUseOriginalPreviewUrl =
    _.get(window, 'platformENV.isLocal') && ['.HEIC', '.HEIF'].includes((attachment.ext || '').toLocaleUpperCase());
  const previewUrl = attachment.previewUrl || '';
  const smallThumbnailUrl = shouldUseOriginalPreviewUrl
    ? previewUrl
    : previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/2/h/' + fileHeight);

  const isSingleFile = attachments.length === 1;
  const clickTimeoutRef = useRef(null);

  const handleClick = e => {
    e.stopPropagation();

    // 缩略图加载失败，单元格已经切到托底图标，此时这个附件取不到图，再点开也只会是个空预览层
    if (imageLoadErrorKey === attachmentPreviewKey) {
      return;
    }

    if (attachment && !!attachment.refId && !attachment.shareUrl) {
      alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
      return;
    }

    // Shift+单击：在新页面打开
    if (e.shiftKey && !isTrash && !browserIsMobile()) {
      openControlAttachmentInNewTab({
        appId,
        recordId,
        viewId: !isSubList ? viewId : undefined,
        worksheetId,
        controlId: cell.controlId,
        fileId: attachment.fileID,
        projectId,
        getType: from === 21 ? from : undefined,
      });
      return;
    }

    if (clickTimeoutRef.current) {
      clearTimeout(clickTimeoutRef.current);
      clickTimeoutRef.current = null;
      // 双击事件，直接返回
      return;
    }

    clickTimeoutRef.current = setTimeout(() => {
      clickTimeoutRef.current = null;
      const currentMasterData = getMasterData(masterData);

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
                  projectId,
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
        masterWorksheetId: _.get(currentMasterData, 'worksheetId'),
        masterRecordId: _.get(currentMasterData, 'recordId'),
        masterControlId: _.get(currentMasterData, 'controlId'),
        sourceControlId: cell.sourceControlId,
        openPreviewAttachments,
      });
    }, 300);
  };

  const handleDoubleClick = e => {
    e.stopPropagation();
    if (isTrash || browserIsMobile()) return;
    if (attachment && !!attachment.refId && !attachment.shareUrl) {
      alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
      return;
    }

    openControlAttachmentInNewTab({
      appId,
      recordId,
      viewId: !isSubList ? viewId : undefined,
      worksheetId,
      controlId: cell.controlId,
      fileId: attachment.fileID,
      projectId,
      getType: from === 21 ? from : undefined,
      openAsPopup: true,
    });
  };

  useEffect(() => {
    // 清理定时器
    return () => {
      if (clickTimeoutRef.current) {
        clearTimeout(clickTimeoutRef.current);
      }
    };
  }, []);

  return (
    <Popover
      trigger={browserIsMobile() ? [] : 'hover'}
      content={
        <HoverPreviewPanel
          isPicture={isPicture}
          shouldUseOriginalPreviewUrl={shouldUseOriginalPreviewUrl}
          isSubList={isSubList}
          editable={editable && !(cell.required && isSingleFile && !isSubList)}
          sheetSwitchPermit={sheetSwitchPermit}
          attachment={attachment}
          smallThumbnailUrl={smallThumbnailUrl}
          cell={cell}
          cellInfo={cellInfo}
          masterData={getMasterData(masterData)}
          onUpdate={onUpdate}
          deleteLocalAttachment={deleteLocalAttachment}
          from={from}
          projectId={projectId}
        />
      }
      getPopupContainer={getDefaultPopupContainer}
      mouseEnterDelay={0.4}
      placement="bottomLeft"
      noPadding
    >
      <AttachmentCon
        className="AttachmentCon"
        style={{ maxWidth: cellWidth }}
        onClick={handleClick}
        onDoubleClick={handleDoubleClick}
      >
        {isPicture ? (
          <AttachmentImage
            showShape={showShape}
            crossOrigin="anonymous"
            role="presentation"
            src={smallThumbnailUrl}
            onError={() => setImageLoadErrorKey(attachmentPreviewKey)}
            style={{ width: 'auto', height: fileHeight, objectFit }}
          />
        ) : (
          <AttachmentDoc
            className={`fileIcon ${getClassNameByExt(attachment.ext)}`}
            style={{ width: fileWidth, height: fileHeight }}
          />
        )}
        {showFileName && (
          <AttachmentDocFileName className={cx('ellipsis', { isSingleFile })}>
            <span className="name ellipsis">{attachment.originalFilename}</span>
            <span className="ext ellipsis">{attachment.ext || ''}</span>
          </AttachmentDocFileName>
        )}
      </AttachmentCon>
    </Popover>
  );
}

function CellAttachments(props, sourceRef) {
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
    columnStyle,
    cell = {},
    rowHeight = 34,
    onClick,
    updateEditingStatus,
    updateCell,
    onValidate,
    ...rest
  } = props;
  let { editable } = props;
  const { value, strDefault = '', advancedSetting = {}, enumDefault } = cell;
  const { openPreviewAttachments = previewAttachments } = useContext(RecordInfoContext) || props;
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

  const [uploadFileVisible, setUploadFileVisible] = useState(true);
  const parsedAttachments = useMemo(() => parseValue(value), [value]);
  const [attachmentsState, setAttachmentsState] = useState(() => ({
    value,
    attachments: parsedAttachments,
  }));
  const attachments = attachmentsState.value === value ? attachmentsState.attachments : parsedAttachments;

  const setAttachments = nextAttachments => {
    setAttachmentsState({
      value,
      attachments: nextAttachments,
    });
  };

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
  const fileHeight = showFileValue === '1' ? ATTACHMENT_NAME_LINE_HEIGHT : rowHeight - ATTACHMENT_CELL_PADDING_HEIGHT;
  const fileWidth = (fileHeight * 21) / 24;
  const maxLines = getAttachmentMaxLines({ showFileValue, rowHeight });
  useImperativeHandle(sourceRef, () => ({
    handleTableKeyDown(e) {
      switch (e.key) {
        case 'Escape':
          updateEditingStatus(false);
          setUploadFileVisible(true);
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
          '.pcUploadModal',
        ].join(','),
      )
    ) {
      updateEditingStatus(false);
      setUploadFileVisible(true);
    }
  });
  function handleChange(_attachments) {
    const attachmentList = _attachments || attachments;
    const submitData = {};
    const tempSavedAttachments = attachmentList.filter(c => /^o_/.test(c.fileID) && !c.refId).map(c => c.origin);
    const tempSavedKcAttachments = attachmentList.filter(c => /^o_/.test(c.fileID) && c.refId).map(c => c.origin);
    submitData.attachmentData = attachmentList.filter(c => !/^o_/.test(c.fileID)).map(c => c.origin);
    submitData.attachments = (temporaryAttachments || [])
      .filter(c => /^o_/.test(c.fileID))
      .concat(tempSavedAttachments)
      .map(a => ({ ...a, isEdit: false }));
    submitData.knowledgeAtts =
      (temporaryKnowledgeAtts || []).concat(tempSavedKcAttachments).map(a => ({ ...a, isEdit: false })) || [];
    const newValue = JSON.stringify(addAttachmentIndex(submitData, enumDefault));
    updateCell(
      {
        editType: 1,
        value: newValue,
      },
      {
        callback: data => {
          setAttachments(parseValue(data[cell.controlId]));
        },
      },
    );
    // 附件通过上传/选择即时提交，不走输入/失焦校验流程；必填报错后重新上传需主动重新校验，
    // 以清掉持久化在 cellErrors 中的旧错误，否则错误状态不会重置。
    if (isFunction(onValidate)) {
      onValidate(newValue);
    }

    updateEditingStatus(false);
    setUploadFileVisible(true);
    setTemporaryAttachments([]);
    setTemporaryKnowledgeAtts([]);
  }

  function handleOpenRecord(e) {
    if (e.target.closest('.attachmentUploadAdd')) return;

    updateEditingStatus(false);
    setUploadFileVisible(true);
    onClick(e);
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
      openPreviewAttachments={openPreviewAttachments}
      onUpdate={valueStr => {
        setAttachments(parseValue(valueStr));
      }}
      deleteLocalAttachment={id => {
        handleChange(attachments.filter(a => a.fileID !== id));
      }}
    />
  ));

  if (isediting && allowupload === '1') {
    return (
      <UploadFilesTrigger
        getPopupContainer={() => document.body}
        specialFilter={target => ref.current.contains(target)}
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
        canPcUpload={true}
        attachmentData={[]}
        temporaryData={temporaryAttachments}
        onTemporaryDataUpdate={res => {
          setTemporaryAttachments(res);
        }}
        kcAttachmentData={temporaryKnowledgeAtts}
        onKcAttachmentDataUpdate={res => {
          setTemporaryKnowledgeAtts(res);
        }}
        onCancel={() => {
          setUploadFileVisible(false);
        }}
        onClose={() => {
          setUploadFileVisible(false);
          if (temporaryAttachments?.length && temporaryAttachments.some(t => !t.key)) {
            setTemporaryAttachments([]);
          }

          if (temporaryKnowledgeAtts?.length && temporaryKnowledgeAtts.some(t => !t.key)) {
            setTemporaryAttachments([]);
          }
        }}
        onOk={() => {
          handleChange();
        }}
        checkValueByFilterRegex={name => {
          const formData = isFunction(props.rowFormData) ? props.rowFormData() : props.rowFormData;
          return checkValueByFilterRegex(
            { advancedSetting },
            RegExpValidator.getNameOfFileName(name),
            formData,
            rest.recordId,
          );
        }}
      >
        <EditingCon ref={ref} className={className} style={style} onClick={handleOpenRecord}>
          {attachmentsComp}
          {allowupload === '1' && (
            <Add
              className="attachmentUploadAdd"
              style={{ width: fileWidth, height: fileHeight, lineHeight: fileHeight - 2 + 'px' }}
              onClick={() => setUploadFileVisible(true)}
            >
              <i className="icon icon-plus"></i>
            </Add>
          )}
        </EditingCon>
      </UploadFilesTrigger>
    );
  }

  return (
    <Con
      className={cx(className, { canedit: editable })}
      $tableType={tableType}
      style={style}
      onClick={allowupload === '1' ? onClick : undefined}
    >
      {/* 不显示文件名时缩略图撑满行高，恒定单行、超出列宽部分由右侧遮盖裁剪；
          显示文件名时附件高度恒定，行高够则按整行数换行 */}
      <CutCon className="CutCon" $maxLines={maxLines} $lineHeight={fileHeight}>
        {attachmentsComp}
      </CutCon>
      {editable && allowupload === '1' && (
        <OperateIcon className="OperateIcon">
          <i
            className="hoverColorPrimary icon icon-attachment"
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

CellAttachments.propTypes = {
  className: string,
  style: string,
  isediting: bool,
  error: bool,
  cell: shape({}),
  rowHeight: number,
  popupContainer: func,
  onClick: func,
  updateEditingStatus: func,
  openPreviewAttachments: func,
};

export default forwardRef(CellAttachments);
