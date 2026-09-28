import React, { Fragment, lazy, memo, Suspense } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { formatFileSize } from 'src/utils/core/file';
import { getClassNameByExt } from 'src/utils/domain/file/classification';
import { downloadFile } from 'src/utils/platform/browser/download';

const CircleProgress = lazy(() => import('ming-ui/components/Progress/CircleProgress'));

const Con = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 140px;
  height: 106px;
  border-radius: 8px;
  overflow: hidden;
  border: 1px solid var(--color-border-primary);
  flex: 0 0 auto;
  img {
    width: 100%;
    height: 100%;
    object-fit: contain;
  }
  .file-content {
    width: 100%;
    flex: 1;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-border-secondary);
    .fileIcon {
      height: 30px;
      width: 26px;
    }
    &.uploading {
      .Progress--circle-content {
        font-size: 12px !important;
      }
    }
    &.error {
      background-color: var(--color-error-bg);
      color: var(--color-error);
      .icon {
        font-size: 16px;
        margin-right: 2px;
      }
    }
  }
  .file-name {
    width: 100%;
    display: flex;
    height: 40px;
    flex-shrink: 0;
    align-items: center;
    justify-content: center;
    font-size: 12px;
    /* 固定行高，避免在消息气泡(line-height:24px)等大行高容器里 2 行 clamp 超出 40px 高度被遮挡 */
    line-height: 16px;
    color: var(--color-text-title);
    padding: 4px 10px 0;
    background: var(--color-background-primary);
    word-break: break-all;
    white-space: break-spaces;
    display: -webkit-box;
    -webkit-line-clamp: 2;
    -webkit-box-orient: vertical;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .close-icon {
    visibility: hidden;
    position: absolute;
    right: 3px;
    top: 3px;
    width: 18px;
    height: 18px;
    color: var(--color-text-secondary);
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: var(--color-background-primary);
    border-radius: 50%;
    .icon {
      font-size: 16px;
    }
  }
  /* 只读态（消息里的附件）hover 面板：与附件字段（Form/components/Files/ImageCard）保持一致的信息与按钮样式 */
  .file-panel {
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    display: flex;
    flex-direction: column;
    padding: 10px;
    opacity: 0;
    transition: opacity 0.2s;
    background-color: var(--color-background-secondary);
    &.image {
      background-color: rgba(0, 0, 0, 0.6);
      .panel-file-name {
        color: var(--color-white);
      }
      .panel-file-size {
        color: var(--color-white);
        opacity: 0.7;
      }
    }
    .panel-file-info {
      flex: 1;
      min-height: 0;
      overflow: hidden;
    }
    .panel-file-name {
      font-size: 13px;
      font-weight: 700;
      line-height: 16px;
      color: var(--color-primary);
      word-break: break-all;
      display: -webkit-box;
      -webkit-line-clamp: 2;
      -webkit-box-orient: vertical;
      overflow: hidden;
    }
    .panel-file-size {
      margin-top: 4px;
      font-size: 12px;
      line-height: 16px;
      color: var(--color-text-disabled);
    }
    .panel-btn {
      height: 24px;
      width: 32px;
      display: flex;
      align-items: center;
      justify-content: center;
      background-color: var(--color-background-primary);
      border-radius: 2px;
      box-shadow: 0 1px 1px #0000001f;
      cursor: pointer;
      .icon {
        font-size: 17px;
        color: var(--color-text-tertiary);
      }
      &:hover .icon {
        color: var(--color-primary);
      }
    }
  }
  &.isPicture {
    justify-content: center;
    align-items: center;
  }
  &:hover {
    .close-icon {
      visibility: visible;
    }
    .file-panel {
      opacity: 1;
    }
  }
  body.mobileMingoPage & {
    .close-icon {
      visibility: visible;
    }
    .file-panel {
      display: none;
    }
  }
`;

function decodeName(name = '') {
  try {
    return decodeURIComponent(name);
  } catch {
    return name;
  }
}

// 有 downloadUrl 直接下载；明道云正式附件走 downDocument，七牛临时文件走 downChatFile 代理（与附件预览弹层的下载口径一致）
function downloadFileCard({ source, name, url }) {
  if (source && source.downloadUrl) {
    window.open(downloadFile(source.downloadUrl));
    return;
  }

  if (source && source.filepath && source.filename) {
    window.open(downloadFile(`${md.global.Config.AjaxApiUrl}file/downDocument?fileID=${source.fileID}`));
    return;
  }

  if (!url) return;

  const link = document.createElement('a');
  link.href = url;
  window.open(
    downloadFile(
      `${md.global.Config.AjaxApiUrl}file/downChatFile?domain=${link.origin}&key=${link.pathname + link.search}&attname=${encodeURIComponent(decodeName(name))}`,
    ),
  );
}

function previewFile(openPreviewAttachments, { source, id, name, url }, { hideShare } = {}) {
  openPreviewAttachments({
    // 会话内的临时附件不属于知识中心文件，预览层不提供分享入口
    ...(hideShare ? { hideFunctions: ['share'] } : {}),
    attachments: [
      source
        ? {
            ...source,
            originalFilename: decodeURIComponent(source.originalFilename),
            previewAttachmentType: 'COMMON',
          }
        : {
            fileid: id,
            name: decodeURIComponent(name),
            path: url,
            previewAttachmentType: 'QINIU',
          },
    ],
  });
}

function FileCard({
  className,
  allowRemove = false,
  readonly = false,
  disableActions = false,
  hideShare = false,
  id,
  source,
  name = '',
  size,
  type = '',
  url,
  status = 'uploaded',
  errorText,
  progress,
  onRemove,
  openPreviewAttachments,
}) {
  const isPicture = type.startsWith('image');
  const ext = name.split('.').pop() || '';
  const classNameByExt = getClassNameByExt('.' + ext);
  // 只读态（已发送消息里的附件）才展示 hover 面板，输入区待发送附件仍保持删除入口；
  // 预览与下载都依赖登录态接口，分享页（匿名访问）调用只会报服务异常，整块面板一起隐藏
  const showPanel = readonly && !disableActions && status === 'uploaded' && (url || source);
  return (
    <Con
      className={cx(className, { isPicture })}
      onClick={
        disableActions
          ? undefined
          : e => {
              e.stopPropagation();
              e.preventDefault();
              previewFile(openPreviewAttachments, { source, id, name, url }, { hideShare });
            }
      }
    >
      {isPicture && status === 'uploaded' ? (
        <img src={url} alt={name} />
      ) : (
        <Fragment>
          <div className={cx('file-content', status)}>
            {status === 'uploading' && (
              <Suspense fallback={null}>
                <CircleProgress
                  key="text"
                  isAnimation={false}
                  isRound={false}
                  strokeWidth={3}
                  diameter={46}
                  foregroundColor="var(--color-text-disabled)"
                  backgroundColor="var(--color-background-primary)"
                  percent={parseInt(progress)}
                />
              </Suspense>
            )}
            {status === 'error' && (
              <div className="file-error t-flex t-items-center t-justify-center">
                <i className="icon icon-info_outline" />
                <span>{errorText || _l('上传失败')}</span>
              </div>
            )}
            {status === 'ocr' && (
              <div className="file-ocr t-flex t-items-center t-justify-center">
                <i className="icon icon-loading" />
                <span>{_l('解析中...')}</span>
              </div>
            )}
            {status === 'uploaded' && <span className={cx('fileIcon', classNameByExt)} />}
          </div>
          <div className="file-name">{decodeName(name)}</div>
        </Fragment>
      )}
      {showPanel && (
        <div className={cx('file-panel', { image: isPicture })}>
          <div className="panel-file-info">
            <div className="panel-file-name">{decodeName(name)}</div>
            {!!size && <div className="panel-file-size">{formatFileSize(size)}</div>}
          </div>
          <div className="t-flex t-justify-end">
            <Tooltip title={_l('下载')} placement="bottom">
              <div
                className="panel-btn"
                onClick={e => {
                  e.stopPropagation();
                  downloadFileCard({ source, name, url });
                }}
              >
                <Icon icon="download" />
              </div>
            </Tooltip>
          </div>
        </div>
      )}
      {allowRemove && (
        <div className="close-icon">
          <i
            className="icon icon-close Hand"
            onClick={e => {
              onRemove(id);
              e.stopPropagation();
            }}
          />
        </div>
      )}
    </Con>
  );
}

FileCard.propTypes = {
  className: PropTypes.string,
  readonly: PropTypes.bool,
  // 分享页等匿名场景：禁用预览与下载，卡片只做展示
  disableActions: PropTypes.bool,
  hideShare: PropTypes.bool,
  id: PropTypes.string,
  name: PropTypes.string,
  size: PropTypes.number,
  type: PropTypes.string,
  url: PropTypes.string,
  status: PropTypes.string,
  progress: PropTypes.number,
  onRemove: PropTypes.func,
  openPreviewAttachments: PropTypes.func,
};

export default memo(FileCard);
