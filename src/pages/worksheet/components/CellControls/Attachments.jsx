import React, { useEffect, useRef, useState, forwardRef, useImperativeHandle } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { useClickAway } from 'react-use';
import { Tooltip } from 'ming-ui';
import cx from 'classnames';
import { isOpenPermit } from 'src/pages/FormSet/util.js';
import { permitList } from 'src/pages/FormSet/config.js';
import UploadFilesTrigger from 'src/components/UploadFilesTrigger';
import { deleteAttachmentOfControl } from 'worksheet/api';
import { openControlAttachmentInNewTab, downloadAttachmentById } from 'worksheet/controllers/record';
import { getClassNameByExt, formatFileSize, addBehaviorLog } from 'src/util';
import { bool, func, number, shape, string } from 'prop-types';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import _ from 'lodash';

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
  max-width: 500px;
  overflow: hidden;
  white-space: nowrap;
`;

const EditingCon = styled.div`
  padding: 5px 6px 0px;
  box-shadow: inset 0 0 0 2px #2d7ff9 !important;
  background-color: #fff;
  font-size: 0px;
  .AttachmentCon {
    margin-bottom: 5px;
  }
`;

const AttachmentCon = styled.div`
  position: relative;
  display: inline-block;
  margin-right: 4px;
  border-radius: 2px;
  overflow: hidden;
  cursor: pointer;
  &:hover {
    .hoverMask {
      display: inline-block;
    }
  }
`;

const AttachmentImage = styled.img`
  vertical-align: middle;
  min-width: 21px;
  object-fit: cover;
`;

const AttachmentDoc = styled.span`
  vertical-align: middle;
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
  background-color: rgba(0, 0, 0, 0.1);
  display: none;
`;

const OperateIcon = styled.div`
  display: none;
  position: absolute;
  right: 0;
  top: 0;
  width: 34px;
  height: 34px;
  text-align: center;
  line-height: 34px;
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
    color: #333;
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
    &:hover {
      color: #f44336;
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
  display: inline-block;
  position: relative;
  margin-right: 4px;
  margin-bottom: 5px;
  border-radius: 2px;
  overflow: hidden;
  border: 1px solid #ddd;
  text-align: center;
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
}) {
  const recordAttachmentSwitch =
    !!_.get(window, 'shareState.shareId') || isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
  let hideFunctions = ['editFileName'];
  if (!recordAttachmentSwitch || disableDownload) {
    /* 是否不可下载 且 不可保存到知识和分享 */
    hideFunctions.push('download', 'share', 'saveToKnowlege');
  }
  addBehaviorLog('previewFile', worksheetId, { fileId, rowId: recordId });
  previewAttachments(
    {
      index: index || 0,
      fromType: 4,
      attachments: attachments.map(attachment => {
        if (attachment.fileID && attachment.fileID.slice(0, 2) === 'o_') {
          return Object.assign({}, attachment, {
            previewAttachmentType: 'QINIU',
            path: attachment.origin.url || attachment.previewUrl,
            ext: attachment.ext.slice(1),
            name: attachment.originalFilename || _l('图片'),
          });
        }
        return Object.assign({}, attachment, {
          previewAttachmentType: attachment.refId ? 'KC_ID' : 'COMMON_ID',
        });
      }),
      showThumbnail: true,
      hideFunctions: hideFunctions,
      disableNoPeimission: true,
      worksheetId,
      fileId: attachments[index].fileID,
      recordId,
      controlId,
      from,
    },
    {
      openControlAttachmentInNewTab: handleOpenControlAttachmentInNewTab,
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
  } = props;
  const { originalFilename, ext = '', filesize } = attachment;
  const { controlId } = cell;
  const { appId, viewId, worksheetId, recordId, disableDownload } = cellInfo;
  const [loading, setLoading] = useState(true);
  const recordAttachmentSwitch =
    !!_.get(window, 'shareState.shareId') || isOpenPermit(permitList.recordAttachmentSwitch, sheetSwitchPermit, viewId);
  const downloadable =
    recordAttachmentSwitch && !disableDownload && attachment.fileID && attachment.fileID.length === 36;
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
          {editable && (
            <Tooltip text={<span>{_l('删除')}</span>} popupPlacement="top">
              <i className="icon icon-trash deleteBtn" onClick={handleDelete}></i>
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
                    controlId,
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

function Attachment(props) {
  const {
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
  } = props;
  const { appId, recordId, worksheetId, from } = cellInfo;
  const { attachment } = props;
  const [isPicture, setIsPicture] = useState(File.isPicture(attachment.ext));
  const smallThumbnailUrl = (attachment.previewUrl || '').replace(
    /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
    'imageView2/2/h/' + fileHeight,
  );
  useEffect(() => {
    setIsPicture(File.isPicture(attachment.ext));
  }, [attachment.ext]);
  return (
    <Trigger
      action={['hover']}
      popup={
        <HoverPreviewPanel
          isPicture={isPicture}
          isSubList={isSubList}
          editable={editable && !(cell.required && attachments.length === 1)}
          sheetSwitchPermit={sheetSwitchPermit}
          attachment={attachment}
          smallThumbnailUrl={smallThumbnailUrl}
          cell={cell}
          cellInfo={cellInfo}
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
          previewAttachment({
            attachments,
            index,
            sheetSwitchPermit,
            viewId,
            disableDownload: cellInfo.disableDownload,
            handleOpenControlAttachmentInNewTab: isTrash
              ? undefined
              : fileId => {
                  openControlAttachmentInNewTab({
                    appId,
                    recordId,
                    viewId,
                    worksheetId,
                    controlId: cell.controlId,
                    fileId,
                    getType: from === 21 ? from : undefined,
                  });
                },
            worksheetId,
            recordId,
            fileId: attachment.fileID,
            controlId: cell.controlId,
            from,
          });
          e.stopPropagation();
        }}
      >
        {isPicture && <ShadowInset />}
        {isPicture && <ImageHoverMask className="hoverMask" />}
        {isPicture ? (
          <AttachmentImage
            crossOrigin="anonymous"
            role="presentation"
            src={smallThumbnailUrl}
            onError={() => setIsPicture(false)}
            style={{ width: 'auto', height: fileHeight }}
          />
        ) : (
          <AttachmentDoc
            className={`fileIcon ${getClassNameByExt(attachment.ext)}`}
            title={attachment.originalFilename + (attachment.ext || '')}
            style={{ width: fileWidth, height: fileHeight }}
          />
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
    cell = {},
    rowHeight = 34,
    popupContainer,
    onClick,
    updateEditingStatus,
    updateCell,
    ...rest
  } = props;
  let { editable } = props;
  const { value, strDefault = '', advancedSetting, enumDefault } = cell;
  const [, onlyAllowMobileInput] = strDefault.split('');
  if (cell.type === 14 && onlyAllowMobileInput === '1') {
    editable = false;
  }
  const [uploadFileVisible, setUploadFileVisible] = useState(isediting);
  const [attachments, setAttachments] = useState(parseValue(value));
  const [temporaryAttachments, setTemporaryAttachments] = useState([]);
  const [temporaryKnowledgeAtts, setTemporaryKnowledgeAtts] = useState([]);
  const fileHeight = rowHeight - 10;
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
          '#addLinkFileDialog_container',
          '.attachmentsPreview',
          '.UploadFilesTriggerPanel',
          '.triggerTraget',
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
      onUpdate={valueStr => {
        setAttachments(parseValue(valueStr));
      }}
      deleteLocalAttachment={id => {
        handleChange(attachments.filter(a => a.fileID !== id));
      }}
    />
  ));
  if (isediting) {
    const popContent = (
      <UploadFilesTrigger
        appId={appId}
        worksheetId={worksheetId}
        originCount={attachments.length}
        advancedSetting={advancedSetting}
        id={cell.controlId + rest.recordId}
        projectId={projectId}
        noWrap
        destroyPopupOnHide={!(navigator.userAgent.match(/[Ss]afari/) && !navigator.userAgent.match(/[Cc]hrome/))} // 不是 Safari
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
      >
        <EditingCon ref={ref} style={{ width: style.width, minHeight: style.height }}>
          {attachmentsComp}
          <Add
            style={{ width: fileWidth, height: fileHeight, lineHeight: fileHeight - 2 + 'px' }}
            onClick={() => setUploadFileVisible(true)}
          >
            <i className="icon icon-plus"></i>
          </Add>
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
    <Con className={cx(className, { canedit: editable })} tableType={tableType} style={style} onClick={onClick}>
      <CutCon className="CutCon">{attachmentsComp}</CutCon>
      {editable && (
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
