import React, { useRef, useEffect, useMemo, useState } from 'react';
import { string } from 'prop-types';
import { connect } from 'react-redux';
import styled from 'styled-components';
import { genUrl, parseLink } from '../../util';
import { browserIsMobile } from 'src/util';
import { Icon, Tooltip } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';

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

const PreviewContentWrapper = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  .iconWrap {
    text-align: right;
    padding: 8px;
    background-color: #fff;
    .icon-task-later {
      transform: rotate(0deg);
      transform-origin: center;
      &.turn {
        transition: transform 1s;
        transform: rotate(360deg);
      }
    }
    .actionIcon:hover {
      color: #2196f3 !important;
    }
  }
  .displayNone {
    display: none;
  }
`;

export const hrefReg = /^https?:\/\/.+$/;

const videoReg = /^https?:\/\/.*?\.(swf|avi|flv|mpg|rm|mov|wav|asf|3gp|mkv|rmvb|mp4)$/i;

const imgReg = /^https?:\/\/.*?\.(gif|png|jpg|jpeg|webp|svg|psd|bmp|tif|tiff)$/i;

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

  return <PreviewWrap>{useMemo(renderContent, [parseLink(value)])}</PreviewWrap>;
}

export function PreviewWraper(props) {
  const { value, reload, newTab, param = [] } = props;

  const [now, setNow] = useState(0);

  const data = { key: 'now', value: { type: 'static', data: now } };
  const source = { key: 'source', value: { type: 'static', data: 'embedUrl' } };

  const handleReLoad = () => {
    setNow(Date.now());
    setTimeout(() => {
      setNow(0);
    }, 1000);
  };

  const handleOpen = () => {
    window.open(parseLink(value, param));
  };

  return (
    <PreviewContentWrapper>
      <div className={cx('iconWrap', { displayNone: !reload && !newTab })}>
        {reload ? (
          browserIsMobile() ? (
            <Icon
              icon="task-later"
              className={cx('Gray_bd InlineBlock Font20 Hand actionIcon', { turn: now })}
              onClick={handleReLoad}
            />
          ) : (
            <Tooltip text={<span>{_l('刷新')}</span>} popupPlacement="bottom">
              <Icon
                icon="task-later"
                className={cx('Gray_bd InlineBlock Font20 Hand actionIcon', { turn: now })}
                onClick={handleReLoad}
              />
            </Tooltip>
          )
        ) : (
          ''
        )}
        {newTab ? (
          browserIsMobile() ? (
            <Icon icon="launch" className="Gray_bd mLeft10 Font20 Hand actionIcon" onClick={handleOpen} />
          ) : (
            <Tooltip text={<span>{_l('打开')}</span>} popupPlacement="bottom">
              <Icon icon="launch" className="Gray_bd mLeft10 Font20 Hand actionIcon" onClick={handleOpen} />
            </Tooltip>
          )
        ) : (
          ''
        )}
      </div>
      <div className="flex overflowHidden">
        <PreviewContent {..._.pick(props, ['value', 'info'])} param={param.concat(data).concat(source)} />
      </div>
    </PreviewContentWrapper>
  );
}

export default connect(({ sheet, appPkg, customPage }) => ({
  info: {
    ...sheet.base,
    projectId: appPkg.projectId,
    itemId: customPage.pageId,
  },
}))(PreviewWraper);
