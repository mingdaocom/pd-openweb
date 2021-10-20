import React, { useRef, useEffect, useMemo } from 'react';
import { string } from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { genUrl } from '../../util';

const PreviewWrap = styled.div`
  height: 100%;
  width: 100%;

  iframe {
    width: 100%;
    height: 100%;
    border: none;
  }
  .picBg {
    height: 100%;
    background-size: cover;
    background-repeat: no-repeat;
  }
  video {
    width: 100%;
    max-height: 100%;
  }
`;

const hrefReg = /^https?:\/\/.+$/;

const videoReg = /^https?:\/\/.*?(?:swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)$/i;
const imgReg = /^https?:\/\/.*?(?:gif|png|jpg|jpeg|webp|svg|psd|bmp|tif)$/i;

const iframeReg = /<iframe.*>\s*<\/iframe>/;

function PreviewContent(props) {
  const { value, param, info } = props;
  const ref = useRef(null);

  useEffect(() => {
    const $iframe = ref.current;
    if (!$iframe) return;
    if (_.includes(value, 'worksheetshare')) {
      const $doc = $iframe.contentDocument;
      if (!$doc) return;
      const $header = $doc.querySelector('.WorksheetShareHeaderBox');
      const $shareBox = $doc.querySelector('.shareConBox');
      if ($header) {
        $header.parentElement.removeChild($header);
      }
      if ($shareBox) {
        $shareBox.style.marginTop = 0;
      }
    }
  }, [ref.current]);

  if (iframeReg.test(value)) {
    return (
      <div className="iframeWrap">
        <div dangerouslySetInnerHTML={{ __html: value }}></div>
      </div>
    );
  }

  if (!hrefReg.test(value)) return _l('嵌入链接无法解析');

  function parseLink(link) {
    const url = genUrl(link, param, info);
    if (!/^https?:\/\//.test(url)) return `https://${url}`;
    return url;
  }

  const renderContent = () => {
    if (imgReg.test(value)) return <div className="picBg" style={{ backgroundImage: `url(${value})` }}></div>;
    if (videoReg.test(value)) return <video src={value} controls></video>;
    if (hrefReg.test(value)) return <iframe ref={ref} src={parseLink(value)}></iframe>;
  };

  return <PreviewWrap>{useMemo(renderContent, [value])}</PreviewWrap>;
}
export default connect(({ sheet, appPkg, customPage }) => ({
  info: {
    ...sheet.base,
    projectId: appPkg.projectId,
    itemId: customPage.pageId,
  },
}))(PreviewContent);
