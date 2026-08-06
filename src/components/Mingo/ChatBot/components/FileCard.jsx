import React, { Fragment, lazy, memo, Suspense } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';

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
  &.isPicture {
    justify-content: center;
    align-items: center;
  }
  &:hover {
    .close-icon {
      visibility: visible;
    }
  }
  body.mobileMingoPage & {
    .close-icon {
      visibility: visible;
    }
  }
`;

function getExt(name = '') {
  return String(name || '')
    .split('.')
    .pop()
    .toLowerCase();
}

function getIconNameByExt(ext = '') {
  if (['xls', 'xlsx'].includes(ext)) return 'excel';
  if (['doc', 'docx', 'dot'].includes(ext)) return 'word';
  if (['ppt', 'pptx', 'pps'].includes(ext)) return 'ppt';
  if (['url'].includes(ext)) return 'link';
  if (['js', 'ts', 'java', 'py', 'html', 'css', 'json', 'xml', 'ini', 'yml', 'yaml', 'less', 'scss'].includes(ext)) {
    return 'code';
  }

  if (
    [
      'mmap',
      'xmind',
      'zip',
      'rar',
      '7z',
      'pdf',
      'txt',
      'md',
      'ai',
      'psd',
      'vsd',
      'mp3',
      'mp4',
      'aep',
      'apk',
      'ascx',
      'db',
      'dmg',
      'dwg',
      'eps',
      'exe',
      'html',
      'indd',
      'iso',
      'key',
      'ma',
      'max',
      'numbers',
      'obj',
      'pages',
      'prt',
      'rp',
      'skp',
      'xd',
      'mdy',
    ].includes(ext)
  ) {
    return ext;
  }

  return 'doc';
}

function getClassNameByExt(ext) {
  return `fileIcon-${getIconNameByExt(getExt(ext))}`;
}

async function previewFile({ source, id, name, url }) {
  const previewAttachments = (await import('src/components/previewAttachments/previewAttachments')).default;

  previewAttachments({
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
  id,
  source,
  name = '',
  type = '',
  url,
  status = 'uploaded',
  errorText,
  progress,
  onRemove,
}) {
  const isPicture = type.startsWith('image');
  const ext = name.split('.').pop() || '';
  const classNameByExt = getClassNameByExt('.' + ext);
  return (
    <Con
      className={cx(className, { isPicture })}
      onClick={e => {
        e.stopPropagation();
        e.preventDefault();
        previewFile({ source, id, name, url });
      }}
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
          <div className="file-name">{decodeURIComponent(name)}</div>
        </Fragment>
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
  id: PropTypes.string,
  name: PropTypes.string,
  type: PropTypes.string,
  url: PropTypes.string,
  status: PropTypes.string,
  progress: PropTypes.number,
  onRemove: PropTypes.func,
};

export default memo(FileCard);
