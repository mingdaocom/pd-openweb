import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Flex, ActivityIndicator, Button } from 'antd-mobile';
import PreviewContent from 'src/pages/customPage/components/previewContent';
import cx from 'classnames';
import share from 'src/api/share';
import { getIconNameByExt } from 'src/util';

const PreviewContentWrapper = styled.div`
  height: 100%;
  position: relative;
  .iconWrap {
    position: absolute;
    top: 5px;
    right: 10px;
    background: #ffffffe6;
    border-radius: 25px;
    padding: 8px;
    font-size: 24px;
    .icon-rotate {
      transform: rotate(360deg);
      transform-origin: center;
      &.turn {
        transition: transform 1s;
        transform: rotate(0deg);
      }
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
  const [ loading, setLoading ] = useState(false);
  const [ node, setNode ] = useState(null);
  let shareId = null;
  try {
    shareId = value.match(/\/apps\/kcshareFolder\/(\w+)/)[1];
  } catch (err) {}
  if (shareId) {
    useEffect(() => {
      setLoading(true);
      share.getShareFolder({ shareId: shareId }).then(({ node }) => {
        setNode(node);
      }).always(() => setLoading(false));
    }, [shareId]);
  }
  return (
    <PreviewContentWrapper>
      {
        loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          node ? (
            <div className="flexColumn valignWrapper fileWrapper h100">
              <span className="fileIcon fileIcon-folder"></span>
              <span className="name">{node.name}</span>
              <Button type="primary" inline size="small" onClick={() => { window.open(value) }}>{_l('打开链接')}</Button>
            </div>
          ) : (
            <ErrorInfo icon="shared_folder" text={_l('知识中心文件不存在或您没有查看权限')}/>
          )
        )
      }
    </PreviewContentWrapper>
  );
}

function KcShareNodePreviewContent(props) {
  const { value } = props;
  const [ loading, setLoading ] = useState(false);
  const [ node, setNode ] = useState(null);
  const isUrl = node && node.ext === 'url';
  let shareId = null;
  try {
    shareId = value.match(/\/apps\/kcshare\/(\w+)/)[1];
  } catch (err) {}
  if (shareId) {
    useEffect(() => {
      setLoading(true);
      share.getShareNode({ shareId: shareId }).then(({ node }) => {
        setNode(node);
      }).always(() => setLoading(false));
    }, [shareId]);
  }
  return (
    <PreviewContentWrapper>
      {
        loading ? (
          <Flex justify="center" align="center" className="h100">
            <ActivityIndicator size="large" />
          </Flex>
        ) : (
          node ? (
            <div className="flexColumn valignWrapper fileWrapper h100">
              <span className={cx('fileIcon', `fileIcon-${getIconNameByExt(node.ext)}`)}></span>
              <span className="name">{`${node.name}.${node.ext}`}</span>
              <Button type="primary" inline size="small" onClick={() => { window.open(isUrl ? node.originLinkUrl : value) }}>{_l('打开%0', isUrl ? _l('链接') : _l('文件'))}</Button>
            </div>
          ) : (
            <ErrorInfo icon="shared_folder" text={_l('知识中心文件不存在或您没有查看权限')}/>
          )
        )
      }
    </PreviewContentWrapper>
  );
}

function PreviewContentWrap(props) {
  const { value } = props;
  const [ now, setNow ] = useState(0);

  if (value.includes('kcshareFolder/')) {
    // 文件夹
    return (
      <KcShareFolderPreviewContent value={value} />
    );
  } else if (value.includes('kcshare/')) {
    // 文件
    return (
      <KcShareNodePreviewContent value={value} />
    );
  } else {
    return (
      <PreviewContentWrapper>
        <div className="iconWrap flexRow valignWrapper">
          <Icon
            icon="rotate"
            className={cx('Gray_bd InlineBlock mRight10', { turn: now })}
            onClick={() => {
              setNow(Date.now());
              setTimeout(() => { setNow(0) }, 1000);
            }}
          />
          <Icon icon="task-new-fullscreen" className="Gray_bd" onClick={() => { window.open(value) }}/>
        </div>
        <PreviewContent value={`${value}?now=${now}`} />
      </PreviewContentWrapper>
    );
  }
}

export default PreviewContentWrap;
