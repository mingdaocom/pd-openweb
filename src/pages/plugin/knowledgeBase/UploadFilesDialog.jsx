import React, { useCallback, useEffect, useState } from 'react';
import styled from 'styled-components';
import { Dialog, Icon, LoadDiv, Checkbox } from 'ming-ui';
import _ from 'lodash';
import SearchInput from 'src/pages/AppHomepage/AppCenter/components/SearchInput';
import assistantApi from 'src/api/assistant';
import { getIconNameByExt } from 'src/util';
import cx from 'classnames';
import { formatFileSize } from 'src/util';
import { Tooltip } from 'antd';

const UploadDialog = styled(Dialog)`
  .mui-dialog-header {
    padding: 20px 24px 24px !important;
    .mui-dialog-desc {
      padding-top: 8px !important;
    }
  }
`;

const UploadHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  .foldableTitle {
    width: fit-content;
    margin-left: -15px;
    i {
      color: #9e9e9e;
      font-weight: bold;
      margin-right: 2px;
    }
    &:hover {
      i {
        color: #2196f3;
      }
    }
  }
  .searchInput {
    width: 200px;
    min-width: 200px;
    input {
      min-width: 0;
    }
  }
`;

const FileListItem = styled.div`
  display: flex;
  align-items: center;
  padding: 12px 0;
  &:hover {
    background: #f5f5f5;
    .deleteIcon {
      display: block;
    }
  }
  &.isHeader {
    padding: 0;
    margin-top: 24px;
    font-size: 12px;
    font-weight: 600;
    color: #757575;
    &:hover {
      background: #fff;
    }
  }
  &.disabled {
    color: #9e9e9e !important;
    .fileName {
      .source {
        color: #9e9e9e !important;
      }
    }
  }
  .fileName {
    flex: 6;
    display: flex;
    align-items: center;
    min-width: 0;
    padding-right: 8px;
    .fileIcon {
      width: 21px;
      min-width: 21px;
      height: 24px;
      margin-right: 8px;
    }
    .source {
      color: #757575;
      margin-top: 4px;
    }
  }
  .uploadTime {
    flex: 3;
  }
  .fileSize,
  .creator {
    flex: 2;
  }
  .deleteIcon {
    display: none;
    width: 36px;
    height: 36px;
    border-radius: 50%;
    text-align: center;
    cursor: pointer;
    color: #9e9e9e;
    i {
      line-height: 36px;
    }
    &:hover {
      color: #f44336;
      background: #fff;
    }
  }
`;

export default function UploadFilesDialog(props) {
  const { onClose, projectId, knowledgeBaseId, knowledgeSource } = props;
  const [keywords, setKeywords] = useState('');
  const [waitingUploadList, setWaitingUploadList] = useState([]);
  const [uploadedList, setUploadedList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [foldIds, setFoldIds] = useState([]);
  const [selectedFiles, setSelectedFiles] = useState([]);

  useEffect(() => {
    assistantApi.getListKnowledgeFile({ projectId, knowledgeBaseId }).then(res => res && setUploadedList(res));
    assistantApi.getListAllowUploadFile({ projectId, knowledgeBaseId }).then(res => {
      if (res) {
        setLoading(false);
        setWaitingUploadList(res);
      }
    });
  }, []);

  useEffect(() => {
    !!waitingUploadList.length &&
      setSelectedFiles(
        _.take(
          waitingUploadList.filter(
            file => file.fileSize / (1024 * 1024) < 20 && !_.find(uploadedList, item => item.fileId === file.fileId),
          ),
          20 - uploadedList.length,
        ),
      );
  }, [waitingUploadList, uploadedList]);

  const onDeleteFile = id => {
    Dialog.confirm({
      title: <div style={{ color: '#f44336' }}>{_l('确认删除该文件？')}</div>,
      buttonType: 'danger',
      okText: _l('删除'),
      onOk: () => {
        assistantApi.deleteKnowledgeFile({ projectId, knowledgeFileId: id }).then(res => {
          if (res) {
            alert(_l('删除成功'));
            setUploadedList(uploadedList.filter(file => file.id !== id));
          }
        });
      },
    });
  };

  const onUpload = () => {
    assistantApi
      .uploadFile({ projectId, knowledgeBaseId, fileIds: selectedFiles.map(item => item.fileId) })
      .then(res => {
        res.uploadResult ? onClose() : alert(res.errMsg, 2);
      });
  };

  const renderFileList = type => {
    const isWaitingUpload = type === 'waitingUpload';
    const isFold = !!_.includes(foldIds, type);
    const fileList = isWaitingUpload
      ? waitingUploadList.filter(
          file =>
            !_.find(uploadedList, item => item.fileId === file.fileId) &&
            file.fileName.toLowerCase().indexOf(keywords.toLowerCase()) > -1,
        )
      : uploadedList;

    if (!isWaitingUpload && !uploadedList.length) return;

    return (
      <div className="mBottom24">
        <UploadHeader>
          <div>
            <div
              className="flexRow alignItemsCenter pointer foldableTitle"
              onClick={() => setFoldIds(isFold ? foldIds.filter(item => item !== type) : foldIds.concat(type))}
            >
              <Icon icon={isFold ? 'arrow-right-border' : 'arrow-down-border'} />
              <div className="Font15 bold">
                {isWaitingUpload ? _l('待上传') : _l('已上传')}
                {!isWaitingUpload && <span className="mLeft4">{fileList.length}</span>}
              </div>
            </div>
            {isWaitingUpload && <div className="Gray_75 breakAll mRight8">{_l('来源: ') + knowledgeSource}</div>}
          </div>
          {isWaitingUpload && (
            <SearchInput
              className="searchInput"
              placeholder={_l('文件名称')}
              value={keywords}
              onChange={useCallback(
                _.debounce(value => setKeywords(value), 500),
                [],
              )}
            />
          )}
        </UploadHeader>

        {loading && isWaitingUpload && <LoadDiv className="mTop10" />}

        {!isFold && !(loading && isWaitingUpload) && (
          <React.Fragment>
            <FileListItem className="isHeader">
              {isWaitingUpload && (
                <Checkbox
                  size="small"
                  className="mRight16"
                  clearselected={!!selectedFiles.length && selectedFiles.length !== fileList.length}
                  checked={selectedFiles.length === fileList.length && !!fileList.length}
                  onClick={() => {
                    setSelectedFiles(
                      !!selectedFiles.length
                        ? []
                        : _.take(
                            fileList.filter(item => item.fileSize / (1024 * 1024) < 20),
                            20 - uploadedList.length,
                          ),
                    );
                  }}
                />
              )}
              <div className="fileName">{_l('文件')}</div>
              <div className="fileSize flexRow alignItemsCenter">
                <span>{_l('大小')} </span>
                {isWaitingUpload && (
                  <Tooltip title={_l('单个文件大小不得超过20MB')}>
                    <Icon icon="help_center" className="Gray_9e mLeft4 Font14" />
                  </Tooltip>
                )}
              </div>
              <div className="uploadTime">{_l('上传时间')}</div>
              <div className="creator">{_l('上传者')}</div>
              {!isWaitingUpload && <div className="flex" />}
            </FileListItem>
            {!fileList.length ? (
              <div className="TxtCenter mTop80">{keywords ? _l('无搜索结果') : _l('暂无文件')}</div>
            ) : (
              fileList.map((item, index) => {
                const isChecked = !!selectedFiles.filter(file => file.fileId === item.fileId).length;
                const itemDisabled =
                  isWaitingUpload &&
                  (selectedFiles.length + uploadedList.length === 20 || item.fileSize / (1024 * 1024) >= 20) &&
                  !isChecked;
                const onFileClick = () => {
                  setSelectedFiles(
                    isChecked
                      ? selectedFiles.filter(file => file.fileId !== item.fileId)
                      : selectedFiles.concat([item]),
                  );
                };
                return (
                  <FileListItem
                    key={index}
                    className={cx({
                      pointer: isWaitingUpload && !itemDisabled,
                      disabled: itemDisabled,
                    })}
                    onClick={() => {
                      isWaitingUpload && !itemDisabled && onFileClick();
                    }}
                  >
                    {isWaitingUpload && (
                      <Checkbox
                        size="small"
                        className="mRight16"
                        disabled={itemDisabled}
                        checked={isChecked}
                        onClick={onFileClick}
                      />
                    )}
                    <div className="fileName">
                      <span className={`fileIcon fileIcon-${getIconNameByExt(item.ext.slice(1))}`} />
                      <div className="overflowHidden">
                        <div className="Font14 overflow_ellipsis" title={item.fileName}>
                          {item.fileName}
                        </div>
                        <div className="source overflow_ellipsis" title={item.source}>
                          {_l('来自 ') + item.source}
                        </div>
                      </div>
                    </div>
                    <div className="fileSize">{formatFileSize(item.fileSize)}</div>
                    <div className="uploadTime">{createTimeSpan(item.createTime)}</div>
                    <div className="creator">{item.creatorInfo.fullname}</div>
                    {!isWaitingUpload && (
                      <div className="flex">
                        <div className="deleteIcon" onClick={() => onDeleteFile(item.id)}>
                          <Icon icon="delete1" className="Font16" />
                        </div>
                      </div>
                    )}
                  </FileListItem>
                );
              })
            )}
          </React.Fragment>
        )}
      </div>
    );
  };

  return (
    <UploadDialog
      visible
      width={800}
      type="fixed"
      title={_l('上传文件') + (!!selectedFiles.length ? `（${selectedFiles.length}/20）` : '')}
      description={_l('支持pdf、docx、txt、md 等格式，不支持的会被过滤')}
      showCancel={false}
      okText={_l('上传') + (!!selectedFiles.length ? `（${selectedFiles.length}）` : '')}
      okDisabled={!selectedFiles.length}
      onOk={onUpload}
      onCancel={onClose}
    >
      {renderFileList('uploaded')}
      {renderFileList('waitingUpload')}
    </UploadDialog>
  );
}
