import React, { Fragment, memo } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Progress from 'ming-ui/components/Progress';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import { getClassNameByExt } from 'src/utils/common';

const Con = styled.div`
  position: relative;
  display: flex;
  flex-direction: column;
  width: 140px;
  height: 106px;
  border-radius: 8px;
  border: 1px solid #ddd;
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
    background-color: #eaebef;
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
      background-color: #fef0ef;
      color: #ff0000;
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
    color: #151515;
    padding: 0 10px;
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
    color: #757575;
    display: flex;
    align-items: center;
    justify-content: center;
    background-color: #fff;
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
`;

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
        e.stopPropagation();
        e.preventDefault();
      }}
    >
      {isPicture && status === 'uploaded' ? (
        <img src={url} alt={name} />
      ) : (
        <Fragment>
          <div className={cx('file-content', status)}>
            {status === 'uploading' && (
              <Progress.Circle
                key="text"
                isAnimation={false}
                isRound={false}
                strokeWidth={3}
                diameter={46}
                foregroundColor="#BDBDBD"
                backgroundColor="#fff"
                percent={parseInt(progress)}
              />
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
