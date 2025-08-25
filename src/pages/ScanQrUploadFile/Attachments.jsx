import React, { Fragment, useEffect, useRef, useState } from 'react';
import { get, omit, pick } from 'lodash';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import { Button, LoadDiv, QiniuUpload } from 'ming-ui';
import attachmentAjax from 'src/api/attachment';
import { checkFileAvailable } from 'src/components/UploadFiles/utils';
import { getClassNameByExt } from 'src/utils/common';
import RegExpValidator from 'src/utils/expression';

const AttachmentsWrap = styled.div`
  width: 100%;
  height: 100%;
  display: flex;
  flex-direction: column;
  padding-bottom: 32px;
  .empty {
    font-size: 14px;
    color: #757575;
  }
`;

const Content = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 0 15px;
  margin: 12px 0;
`;

const AttachmentsList = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(78px, 1fr));
  gap: 9px;
  .attachment-item {
    position: relative;
    width: 100%;

    /* 使用paddingBottom: 100%来创建正方形 */
    padding-bottom: 100%;

    /* 为内容添加定位 */
    .item-content {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      border-radius: 4px;
      border: 1px solid rgba(0, 0, 0, 0.12);
      align-items: center;
      justify-content: center;
      overflow: hidden;
      .fileIcon {
        width: 34px;
        height: 38px;
      }
      img {
        max-width: 100%;
        max-height: 100%;
        object-fit: cover;
      }
    }
  }
  .attachment-name {
    text-align: center;
    font-size: 13px;
    color: #151515;
    margin-top: 3px;
  }
`;

const Footer = styled.div`
  display: flex;
  padding: 0 15px;
  .selectFile {
    height: 44px;
    border-radius: 44px;
    width: 100% !important;
    display: flex;
    align-items: center;
    justify-content: center;
  }
`;

const AttachmentItem = function AttachmentItem({ attachment = {} }) {
  const ext = (attachment.ext || '').toLowerCase();
  const isPicture = RegExpValidator.fileIsPicture('.' + ext);
  return (
    <div className="attachment">
      <div className="attachment-item">
        <div className="item-content">
          {(() => {
            if (attachment.loading) {
              return <LoadDiv style={{ height: 20 }} size="small" />;
            }
            if (isPicture) {
              return <img src={attachment.url} alt={attachment.name} />;
            }
            return <span className={'fileIcon ' + getClassNameByExt(ext)}>{attachment.name}</span>;
          })()}
        </div>
      </div>
      <div className="attachment-name ellipsis">{attachment.name}</div>
    </div>
  );
};

const Attachments = ({ disabled, scanId, scanInfo, defaultAttachments }) => {
  const cache = useRef({});
  const [attachments, setAttachments] = useState(defaultAttachments);
  const control = get(scanInfo, ['control']);
  const UploadWrapper = disabled ? Fragment : QiniuUpload;
  useEffect(() => {
    cache.current.attachmentsCount = attachments.length;
  }, [attachments.length]);
  return (
    <AttachmentsWrap>
      {!attachments.length && (
        <div className="empty" style={{ margin: '12px 15px' }}>
          <span>{_l('请点击下方按钮上传附件，上传后会自动显示在PC端上')}</span>
        </div>
      )}
      <Content>
        {!!attachments.length && (
          <AttachmentsList>
            {attachments.map((attachment, index) => (
              <AttachmentItem attachment={attachment} key={index} />
            ))}
          </AttachmentsList>
        )}
      </Content>
      <Footer>
        <UploadWrapper
          {...(disabled
            ? {}
            : {
                className: 'w100',
                options: {
                  getToken: (files, a, b, options = {}) => {
                    return attachmentAjax.getScanUploadToken(
                      {
                        files,
                        scanId,
                        ...omit(scanInfo, ['control']),
                      },
                      options,
                    );
                  },
                  error_callback: err => {
                    if (err === 1) {
                      alert(_l('不支持选择的文件类型'), 2);
                    }
                  },
                },
                onAdd: (up, files) => {
                  if (control) {
                    const isAvailable = checkFileAvailable(
                      control.advancedSetting,
                      files,
                      cache.current.attachmentsCount,
                    );
                    if (!isAvailable) {
                      files.forEach(file => {
                        up.removeFile({ id: file.id });
                      });
                      return;
                    }
                  }
                  setAttachments(old => [
                    ...old,
                    ...files.map(file => ({
                      id: file.id,
                      name: file.name,
                      ext: file.name.split('.').pop(),
                      loading: true,
                    })),
                  ]);
                },
                onUploaded: (up, file) => {
                  setAttachments(old =>
                    old.map(item => (item.id === file.id ? { ...item, loading: false, url: file.url } : item)),
                  );
                  attachmentAjax
                    .addScanAttachments({
                      attachmentScanSimpleDetail: [
                        {
                          fileUrl: file.url,
                          fileName: file.name,
                          fileSize: file.size,
                        },
                      ],
                      scanId,
                      ...pick(scanInfo, [
                        'accountId',
                        'sourceType',
                        'accountId',
                        'controlId',
                        'worksheetId',
                        'fileType',
                        'rowId',
                      ]),
                    })
                    .then(res => {
                      if (res.excuteResult) {
                        alert(_l('上传成功'));
                      }
                    });
                },
              })}
        >
          <Button type="primary" onClick={() => {}} className="selectFile" disabled={disabled}>
            <i className="icon icon-ic_attachment_black mRight10 Font18"></i>
            {_l('添加附件')}
          </Button>
        </UploadWrapper>
      </Footer>
    </AttachmentsWrap>
  );
};

export default Attachments;

Attachments.propTypes = {
  disabled: PropTypes.bool,
  scanId: PropTypes.string.isRequired,
  scanInfo: PropTypes.shape({}),
  defaultAttachments: PropTypes.arrayOf(PropTypes.shape({})),
};
