import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import { usePreviewAttachments } from 'src/components/previewAttachments/previewAttachments';
import FileCard from './FileCard';

const Con = styled.div`
  display: flex;
  max-width: 100%;
  min-width: 0;
  white-space: nowrap;
  gap: 10px;
  padding: 10px;
  /* 消息列表里（readonly）去掉最右侧边距，让附件与消息内容右边缘对齐 */
  padding-right: ${({ $noRightPadding }) => ($noRightPadding ? '0' : '10px')};
  overflow: hidden;
  overflow-x: auto;
  overscroll-behavior-x: contain;
  -webkit-overflow-scrolling: touch;
`;

export default function AddedFiles({ files, onRemove, readonly = false, disableActions = false, hideShare = false }) {
  const { open: openPreviewAttachments, holder: previewAttachmentsHolder } = usePreviewAttachments();
  const conRef = useRef(null);
  useEffect(() => {
    if (conRef.current) {
      conRef.current.scrollLeft = conRef.current.scrollWidth;
    }
  }, [files]);
  return (
    <Con ref={conRef} $noRightPadding={readonly}>
      {previewAttachmentsHolder}
      {files.map(item => (
        <FileCard
          allowRemove={!readonly}
          readonly={readonly}
          disableActions={disableActions}
          hideShare={hideShare}
          key={item.id}
          className="file"
          id={item.id}
          commonAttachment={item.commonAttachment}
          source={item.source}
          name={item.name}
          size={item.size}
          type={item.type}
          url={item.url}
          status={item.status}
          errorText={item.errorText}
          progress={item.progress}
          onRemove={onRemove}
          openPreviewAttachments={openPreviewAttachments}
        />
      ))}
    </Con>
  );
}
