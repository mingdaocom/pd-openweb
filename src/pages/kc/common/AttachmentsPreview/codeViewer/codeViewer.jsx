import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { func, string, any } from 'prop-types';
import { renderCode, renderMarkdown, renderTxt } from './core';
import { PREVIEW_TYPE } from '../constant/enum';
import TextPreview from './TextPreview';
import './codeViewer.less';

const renderFn = {
  [String(PREVIEW_TYPE.CODE)]: renderCode,
  [String(PREVIEW_TYPE.MARKDOWN)]: renderMarkdown,
  [String(PREVIEW_TYPE.TXT)]: renderTxt,
};

const Con = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  overflow: auto;
  ${({ type }) => type === PREVIEW_TYPE.CODE && 'background-color: #151515 !important'}
  ${({ type }) => (type === PREVIEW_TYPE.MARKDOWN || type === PREVIEW_TYPE.TXT) && 'background-color: #fff !important'}
`;

const Content = styled.div`
  width: 80%;
  max-width: 1200px;
  height: 100%;
  .txt-viewer {
    width: 100%;
    height: 100%;
    background: #fff;
    border: none;
    white-space: break-spaces;
  }
`;

export default function TextViewer(props) {
  const { src, type, onError } = props;
  const [loading, setLoading] = useState(true);
  const [content, setContent] = useState(false);
  useEffect(() => {
    setLoading(true);
    if (renderFn[String(type)]) {
      renderFn[String(type)](src, (err, value) => {
        if (err) {
          onError(err);
          return;
        }
        setLoading(false);
        setContent(value);
      });
    } else {
      onError();
    }
  }, [src]);
  return (
    <Con className="codeViewer" onWheel={e => e.stopPropagation()} type={type}>
      {loading ? (
        <LoadDiv size="big" />
      ) : String(type) === String(PREVIEW_TYPE.TXT) ? (
        <Content>
          <TextPreview text={content} />
        </Content>
      ) : (
        <Content dangerouslySetInnerHTML={{ __html: content }} />
      )}
    </Con>
  );
}

TextViewer.propTypes = {
  src: string,
  type: any,
  onError: func,
};
