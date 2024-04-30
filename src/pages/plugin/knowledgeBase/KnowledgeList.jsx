import React, { useState } from 'react';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { ScrollView, Icon, LoadDiv, Dialog } from 'ming-ui';
import cx from 'classnames';
import UploadFilesDialog from './UploadFilesDialog';
import { formatFileSize } from 'src/util';

const ListItemWrapper = styled.div`
  display: flex;
  align-items: center;
  margin: 0;
  padding: 12px 8px;
  border-bottom: 1px solid #e0e0e0;

  &:hover {
    background: rgba(247, 247, 247, 1);
    .titleText {
      color: #2196f3 !important;
    }
    .uploadBtn {
      background: rgba(247, 247, 247, 1);
    }
    .operateIcon {
      background: rgba(247, 247, 247, 1);
    }
  }
  .titleText {
    font-size: 14px;
    color: #333;
    font-weight: 600;
    cursor: pointer;
    min-width: 0;
  }
  .uploadBtn {
    padding: 4px 12px;
    background: #fff;
    font-size: 12px;
    font-weight: bold;
    color: #2196f3;
    margin-right: 8px;
    border-radius: 20px;
    height: fit-content;
    cursor: pointer;
    min-width: 48px;
    &:hover {
      background: #fff !important;
    }
  }
  .operateIcon {
    display: inline-flex;
    justify-content: center;
    align-items: center;
    width: 32px;
    min-width: 32px;
    height: 32px;
    border-radius: 50%;
    color: #9e9e9e;
    background: #fff;
    cursor: pointer;

    &:hover {
      color: #2196f3;
      background: #fff !important;
    }
  }

  &.isHeader {
    padding: 14px 8px;
    .sortIcon {
      color: #bfbfbf;
      height: 8px;
      &.selected {
        color: #2196f3;
      }
    }
    &:hover {
      background: #fff;
    }
  }

  .name,
  .source {
    margin-right: 6px;
    word-break: break-all;
  }
  .name {
    flex: 6;
  }
  .source {
    flex: 4;
  }
  .fileSize,
  .fileCount,
  .creator,
  .createTime,
  .operateColumn {
    flex: 2;
  }
`;

const OperateMenu = styled.div`
  position: relative !important;
  width: 220px !important;
  padding: 6px 0 !important;
  box-shadow: 0px 1px 4px rgba(0, 0, 0, 0.16);
  border-radius: 3px;
  background: #fff;
  .menuItem {
    padding: 0 20px;
    line-height: 36px;
    cursor: pointer;
    &:hover {
      background-color: #f5f5f5;
    }
    &.isDel {
      color: #f44336;
    }
  }
`;

export default function KnowledgeList(props) {
  const { list = [], loading, projectId, sortInfo, onSort, onScrollEnd, onEdit, onDelete } = props;
  const [popupVisibleId, setPopupVisibleId] = useState(null);
  const [uploadVisibleItem, setUploadVisibleItem] = useState(null);

  const renderSortableTitle = ({ key, text, sortKey }) => {
    return (
      <div
        className={`flexRow pointer ${key}`}
        onClick={() => {
          const sort = sortInfo.sort !== sortKey || (sortInfo.sort === sortKey && sortInfo.isAsc) ? sortKey : 0;
          const isAsc = sortInfo.sort !== sortKey ? true : !sortInfo.isAsc;
          onSort({ sort, isAsc });
        }}
      >
        <span>{text}</span>
        <div className="flexColumn mLeft6">
          <Icon
            icon="arrow-up"
            className={cx('sortIcon', {
              selected: sortInfo.sort === sortKey && sortInfo.isAsc,
            })}
          />
          <Icon
            icon="arrow-down"
            className={cx('sortIcon', {
              selected: sortInfo.sort === sortKey && !sortInfo.isAsc,
            })}
          />
        </div>
      </div>
    );
  };

  return (
    <div className="flex flexColumn mTop12">
      <ListItemWrapper className="isHeader">
        <div className="name">{_l('名称')}</div>
        <div className="source">{_l('来源')}</div>
        {renderSortableTitle({ text: _l('大小'), key: 'fileSize', sortKey: 1 })}
        {renderSortableTitle({ text: _l('文件数量'), key: 'fileCount', sortKey: 2 })}
        <div className="creator">{_l('操作者')}</div>
        <div className="createTime">{_l('创建时间')}</div>
        <div className="operateColumn"></div>
      </ListItemWrapper>

      <ScrollView className="flex" onScrollEnd={onScrollEnd}>
        {list.map((item, index) => {
          return (
            <ListItemWrapper key={index}>
              <div className="name titleText" onClick={() => onEdit(item)}>
                {item.name}
              </div>
              <div className="source">{[item.appName, item.worksheetName, item.controlName].join(' / ')}</div>
              <div className="fileSize">{formatFileSize(item.fileSize)}</div>
              <div className="fileCount">{item.fileCount}</div>
              <div className="creator">{item.creatorInfo.fullname}</div>
              <div className="createTime">{createTimeSpan(item.createTime)}</div>
              <div className="operateColumn flexRow alignItemsCenter justifyContentRight">
                <div className="uploadBtn" onClick={() => setUploadVisibleItem(item)}>
                  {_l('上传')}
                </div>
                <Trigger
                  action={['click']}
                  getPopupContainer={() => document.body}
                  popupVisible={popupVisibleId === item.id}
                  onPopupVisibleChange={visible => setPopupVisibleId(visible ? item.id : null)}
                  popupAlign={{
                    points: ['tr', 'bl'],
                    offset: [25, 5],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                  popup={
                    <OperateMenu>
                      <div
                        className="menuItem"
                        onClick={() => {
                          setPopupVisibleId(null);
                          onEdit(item);
                        }}
                      >
                        {_l('编辑')}
                      </div>
                      <div
                        className="menuItem isDel"
                        onClick={() => {
                          setPopupVisibleId(null);
                          Dialog.confirm({
                            title: <div style={{ color: '#f44336' }}>{_l(`删除知识“${item.name}”`)}</div>,
                            buttonType: 'danger',
                            description: _l('删除后，所有助手中的引用将失效。'),
                            okText: _l('删除'),
                            onOk: () => onDelete(item.id),
                          });
                        }}
                      >
                        {_l('删除')}
                      </div>
                    </OperateMenu>
                  }
                >
                  <div className="operateIcon" onClick={e => e.stopPropagation()}>
                    <Icon icon="moreop" className="Font18" />
                  </div>
                </Trigger>
              </div>
            </ListItemWrapper>
          );
        })}

        {loading && <LoadDiv className="mTop10" />}
      </ScrollView>

      {uploadVisibleItem && (
        <UploadFilesDialog
          projectId={projectId}
          knowledgeBaseId={uploadVisibleItem.id}
          knowledgeSource={[
            uploadVisibleItem.appName,
            uploadVisibleItem.worksheetName,
            uploadVisibleItem.controlName,
          ].join(' / ')}
          onClose={() => setUploadVisibleItem(null)}
        />
      )}
    </div>
  );
}
