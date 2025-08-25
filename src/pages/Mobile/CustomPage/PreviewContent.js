import React, { useEffect, useState } from 'react';
import { Button, SpinLoading } from 'antd-mobile';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import share from 'src/api/share';
import { PreviewWraper } from 'src/pages/customPage/components/previewContent';
// import { genUrl } from 'src/pages/customPage/util';
import { getIconNameByExt } from 'src/utils/common';

const PreviewContentWrapper = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  .iconWrap {
    background: #ffffffe6;
    padding: 8px;
    font-size: 24px;
    flex-direction: row-reverse;
    .icon-task-later {
      transform: rotate(0deg);
      transform-origin: center;
      &.turn {
        transition: transform 1s;
        transform: rotate(360deg);
      }
    }
    &.displayNone {
      display: none;
    }
  }
  .fileWrapper {
    justify-content: center;
    .name {
      margin: 17px 0 20px 0;
    }
  }
  .fileIcon {
    width: 70px;
    height: 80px;
  }
`;

function ErrorInfo(props) {
  return (
    <div className="flexColumn valignWrapper fileWrapper h100">
      <Icon className="Font56 Gray_df mBottom20" icon={props.icon} />
      <span className="Font14 Gray_9d">{props.text}</span>
    </div>
  );
}

function KcShareFolderPreviewContent(props) {
  const { value } = props;
  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState(null);
  const shareId = value ? _.get(value.match(/\/apps\/kcshareFolder\/(\w+)/), [1]) : '';

  useEffect(() => {
    if (shareId) {
      setLoading(true);
      share
        .getShareFolder({ shareId })
        .then(({ node }) => {
          setNode(node);
        })
        .finally(() => setLoading(false));
    }
  }, [shareId]);

  return (
    <PreviewContentWrapper>
      {loading ? (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
      ) : node ? (
        <div className="flexColumn valignWrapper fileWrapper h100">
          <span className="fileIcon fileIcon-folder"></span>
          <span className="name">{node.name}</span>
          <Button
            color="primary"
            size="small"
            onClick={() => {
              window.open(value);
            }}
          >
            {_l('打开链接')}
          </Button>
        </div>
      ) : (
        <ErrorInfo icon="tokc" text={_l('知识中心文件不存在或您没有查看权限')} />
      )}
    </PreviewContentWrapper>
  );
}

function KcShareNodePreviewContent(props) {
  const { value } = props;
  const [loading, setLoading] = useState(false);
  const [node, setNode] = useState(null);
  const isUrl = node && node.ext === 'url';
  const shareId = value ? _.get(value.match(/\/apps\/kcshare\/(\w+)/), [1]) : '';

  useEffect(() => {
    if (shareId) {
      setLoading(true);
      share
        .getShareNode({ shareId })
        .then(({ node }) => {
          setNode(node);
        })
        .finally(() => setLoading(false));
    }
  }, [shareId]);

  return (
    <PreviewContentWrapper>
      {loading ? (
        <div className="flexRow justifyContentCenter alignItemsCenter h100">
          <SpinLoading color="primary" />
        </div>
      ) : node ? (
        <div className="flexColumn valignWrapper fileWrapper h100">
          <span className={cx('fileIcon', `fileIcon-${getIconNameByExt(node.ext)}`)}></span>
          <span className="name">{`${node.name}.${node.ext}`}</span>
          <Button
            color="primary"
            size="small"
            onClick={() => {
              window.open(isUrl ? node.originLinkUrl : value);
            }}
          >
            {isUrl ? _l('打开链接') : _l('打开文件')}
          </Button>
        </div>
      ) : (
        <ErrorInfo icon="tokc" text={_l('知识中心文件不存在或您没有查看权限')} />
      )}
    </PreviewContentWrapper>
  );
}

// function parseLink(link, param) {
//   const url = genUrl(link, param);
//   if (!/^https?:\/\//.test(url)) return `https://${url}`;
//   return url;
// }

function PreviewContentWrap(props) {
  let { value, param, config = {}, info = {} } = props;
  const { reload = false, newTab = false } = config;

  if (value.includes('kcshareFolder/')) {
    // 文件夹
    return <KcShareFolderPreviewContent value={value} />;
  } else if (value.includes('kcshare/')) {
    // 文件
    return <KcShareNodePreviewContent value={value} />;
  } else {
    return <PreviewWraper reload={reload} newTab={newTab} info={info} value={value} param={param} />;
  }
}

export default PreviewContentWrap;
