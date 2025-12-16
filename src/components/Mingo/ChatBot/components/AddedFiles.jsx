import React, { useEffect, useRef } from 'react';
import styled from 'styled-components';
import FileCard from './FileCard';

const Con = styled.div`
  display: flex;
  white-space: nowrap;
  gap: 10px;
  padding: 10px;
  overflow: hidden;
  overflow-x: auto;
`;

export default function AddedFiles({ files, onRemove }) {
  const conRef = useRef(null);
  useEffect(() => {
    if (conRef.current) {
      conRef.current.scrollLeft = conRef.current.scrollWidth;
    }
  }, [files]);
  return (
    <Con ref={conRef}>
      {files.map(item => (
        <FileCard
          allowRemove
          key={item.id}
          className="file"
          id={item.id}
          commonAttachment={item.commonAttachment}
          name={item.name}
          type={item.type}
          url={item.url}
          status={item.status}
          errorText={item.errorText}
          progress={item.progress}
          onRemove={onRemove}
        />
      ))}
    </Con>
  );
}
