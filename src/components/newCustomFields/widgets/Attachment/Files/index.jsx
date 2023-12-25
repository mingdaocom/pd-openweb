import React, { Fragment, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import cx from 'classnames';
import { ConfigProvider } from 'antd';
import { SortableContainer, SortableElement, arrayMove } from 'react-sortable-hoc';
import { openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { formatFileSize, getClassNameByExt } from 'src/util';
import { browserIsMobile, addBehaviorLog } from 'src/util';
import ImageCard from './ImageCard';
import SmallCard from './SmallCard';
import ListCard, { ListCardHeader } from './ListCard';
import LargeImageCard from './LargeImageCard';
import './index.less';

const showTypes = {
  '1': 'imageFilesWrap',
  '2': 'smallFilesWrap',
  '3': 'listFilesWrap',
  '4': 'largeImageFilesWrap'
};

const CardComponent = {
  '1': ImageCard,
  '2': SmallCard,
  '3': ListCard,
  '4': LargeImageCard,
}

const heights = {
  '1': 130 + 6, // height + marginBottom
  '2': 56 + 6,
  '3': 52
}

const isMobile = browserIsMobile();

const sortFiles = files => {
  return files.sort((a, b) => a.index - b.index);
}

const filterImageAttachments = data => {
  const isMdFile = data.accountId || data.sourceID;
  return isMdFile ? File.isPicture(data.refId ? data.fileExt : data.ext) : File.isPicture(data.fileExt);
}

const SortableItem = SortableElement(props => {
  const { showType, allowDownload, data } = props;
  const { accountId, sourceID } = data;
  const isMdFile = accountId || sourceID;
  const isKc = !!data.refId;

  const FileComponent = CardComponent[showType];
  const fileProps = { isMdFile, isKc };

  if (isMdFile) {
    const isPicture = isKc ? !!data.shareUrl : File.isPicture(data.ext);
    Object.assign(fileProps, {
      isPicture,
      browse: isKc ? !!data.shareUrl : true,
      fileClassName: getClassNameByExt(data.attachmentType === 5 ? false : data.ext),
      fileSize: formatFileSize(data.filesize),
      isMore:
        allowDownload &&
        md.global.Account.accountId &&
        !md.global.Account.isPortal &&
        !window.share &&
        !location.href.includes('public/query') &&
        !_.get(window, 'shareState.isPublicForm'),
      isDownload: isKc ? data.allowDown === 'ok' : data.accountId === md.global.Account.accountId || isPicture || data.allowDown === 'ok',
    });
  } else {
    Object.assign(fileProps, {
      fileClassName: getClassNameByExt(data.fileExt),
      isPicture: File.isPicture(data.fileExt),
      fileSize: formatFileSize(data.fileSize),
      url: data.previewUrl || data.url || ''
    })
  }

  return (
    <FileComponent {...props} {...fileProps} isMobile={isMobile} />
  );
});

const SortableList = SortableContainer(props => {
  const { list, className, smallSize, style, ref, ...otherProps } = props;
  const { showType } = props;
  return (
    <div style={style} ref={ref} className={cx('overflowHidden', { mTop8: !['3'].includes(showType), hide: !list.length })}>
      <div className={cx(className, 'attachmentFilesWrap', showTypes[showType], { mobile: isMobile, smallSize })}>
        {list.map((data, index) => (
          <SortableItem key={data.fileID} index={index} sortIndex={index} data={data || {}} {...otherProps} />
        ))}
        {['1', '2'].includes(showType) && (
          Array.from({ length: 10 }).map((_, index) => <i key={index} className={cx('fileEmpty', showType === '1' ? 'attachmentImageCard' : 'attachmentSmallCard', { mobile: isMobile })} />)
        )}
      </div>
    </div>
  );
});

const Files = props => {
  const { className, controlId, onChangedAllFiles, onSortAttachment, onAttachmentName, flag, ...otherProps } = props;
  const { attachmentData, onChangeAttachmentData } = props;
  const { knowledgeAtts, onChangeKnowledgeAtts } = props;
  const { attachments, onChangeAttachments, from } = props;
  const allAttachments = attachments.concat(knowledgeAtts).concat(attachmentData);
  const [sortAllAttachments, setSortAllAttachments] = useState(allAttachments);
  const [viewMoreVisible, setViewMoreVisible] = useState(false);
  const [viewMore, setViewMore] = useState(props.viewMore);
  const [smallSize, setSmallSize] = useState(false);
  const { recordBaseInfo = {} } = useContext(RecordInfoContext) || props;
  const ref = useRef(null);

  const { showType, allowSort } = props;
  const isListCard = ['3'].includes(showType);
  const isLargeImageCard = ['4'].includes(showType);
  const showLineCount = isListCard ? 10 : 5;

  useEffect(() => {
    const allAttachments = attachments.concat(knowledgeAtts).concat(attachmentData);
    setSortAllAttachments(sortFiles(allAttachments));
    if (isLargeImageCard) {
      const imageAttachments = sortAllAttachments.filter(filterImageAttachments);
      if (props.viewMore && imageAttachments.length > showLineCount) {
        setViewMoreVisible(true);
      }
    } else {
      const current = _.get(ref, 'current') || {};
      if (_.isFunction(current.getContainer) && current.getContainer()) {
        const el = current.getContainer();
        const { clientHeight, clientWidth } = el.querySelector('.attachmentFilesWrap');
        if (props.viewMore) {
          setViewMore(true);
          setViewMoreVisible(clientHeight > el.clientHeight);
        }
        if (!isMobile && clientWidth && ['1'].includes(showType)) {
          setSmallSize(clientWidth <= 160);
        }
        if (!isMobile && clientWidth && ['2', '3'].includes(showType)) {
          setSmallSize(clientWidth <= 300);
        }
      } else {
        props.viewMore && setViewMore(false);
      }
    }
  }, [attachments, knowledgeAtts, flag]);

  // 删除明道云附件
  const handleDeleteMDFile = data => {
    const files = attachmentData.filter(item => item.fileID !== data.fileID);
    onChangeAttachmentData(files);
  }
  // 删除未保存的知识附件
  const handleDeleteKCFile = data => {
    const files = knowledgeAtts.filter(item => item.refId !== data.refId);
    onChangeKnowledgeAtts(files);
  }
  // 删除未保存的七牛云附件
  const handleDeleteFile = data => {
    const files = attachments.filter(item => item.fileID !== data.fileID);
    onChangeAttachments(files);
  }
  // 重命名未保存的七牛云附件
  const handleResetNameFile = (id, newName) => {
    newName = newName.trim();
    if (_.isEmpty(newName)) {
      alert(_l('名称不能为空'), 2);
      return;
    }
    const files = attachments.map(item => {
      if (item.fileID === id) {
        item.originalFileName = newName;
      }
      return item;
    });
    onChangeAttachments(files);
  }

  // 明道云附件预览
  const handleMDPreview = data => {
    const { allowDownload = false } = props;
    const hideFunctions = ['editFileName'].concat(allowDownload ? [] : ['download', 'share', 'saveToKnowlege']);
    addBehaviorLog('previewFile', recordBaseInfo.worksheetId, { fileId: data.fileID, rowId: recordBaseInfo.recordId });
    previewAttachments(
      {
        attachments: attachmentData,
        index: _.findIndex(attachmentData, { fileID: data.fileID }),
        callFrom: 'player',
        sourceID: data.sourceID,
        commentID: data.commentID,
        fromType: data.fromType,
        docversionid: data.docVersionID,
        showThumbnail: true,
        showAttInfo: false,
        hideFunctions: hideFunctions,
        worksheetId: recordBaseInfo.worksheetId,
        fileId: data.fileID,
        recordId: recordBaseInfo.recordId,
      },
      {
        mdReplaceAttachment: newAttachment => {
          const newAttachmentData = attachmentData.slice();
          if (newAttachment && newAttachment.docVersionID) {
            const attachmentIndex = _.findIndex(attachmentData, d => d.docVersionID === newAttachment.docVersionID);
            if (attachmentIndex > -1) {
              newAttachmentData[attachmentIndex] = newAttachment;
              onChangeAttachmentData(newAttachmentData);
            }
          }
        },
        openControlAttachmentInNewTab: !isMobile && controlId && handleOpenControlAttachmentInNewTab,
      },
    );
  }
  // 未保存的知识附件预览
  const handleKCPreview = data => {
    const res = knowledgeAtts.filter(item => item.node).map(item => item.node);
    previewAttachments(
      {
        attachments: res,
        index: _.findIndex(res, { id: data.fileID }),
        callFrom: 'kc',
        hideFunctions: ['editFileName', 'share', 'saveToKnowlege'],
      }
    );
  }
  // 未保存的七牛云附件预览
  const handlePreview = data => {
    const res = attachments.map(item => {
      return {
        name: `${item.originalFileName || _l('未命名')}${item.fileExt}`,
        path: item.previewUrl
          ? `${item.previewUrl}`
          : item.url
          ? `${item.url}&imageView2/1/w/200/h/140`
          : `${item.serverName}${item.key}`,
        previewAttachmentType: 'QINIU',
        size: item.fileSize,
        fileid: item.fileID,
      }
    });
    previewAttachments({
      attachments: res,
      index: _.findIndex(attachments, { fileID: data.fileID }),
      callFrom: 'chat',
      hideFunctions: ['editFileName', 'share', 'saveToKnowlege'],
    });
  }

  const handleSortEnd = ({ oldIndex, newIndex }) => {
    if (oldIndex === newIndex) return;
    const files = arrayMove(sortAllAttachments, oldIndex, newIndex);
    const attachments = [];
    const knowledgeAtts = [];
    const attachmentData = [];
    files.forEach((data, index) => {
      const { accountId, sourceID, refId } = data;
      const isMdFile = accountId || sourceID;
      const isKc = !!refId;
      data.index = index;
      if (isMdFile) {
        attachmentData.push(data);
      } else {
        if (isKc) {
          knowledgeAtts.push(data);
        } else {
          attachments.push(data);
        }
      }
    });
    setSortAllAttachments(files);
    if (attachments.length || knowledgeAtts.length) {
      onChangedAllFiles({
        attachments,
        knowledgeAtts,
        attachmentData
      });
    } else {
      onSortAttachment(attachmentData);
    }
  }

  const handleOpenControlAttachmentInNewTab = (fileId) => {
    if (!recordBaseInfo) {
      return;
    }
    addBehaviorLog('previewFile', recordBaseInfo.worksheetId, { fileId, rowId: recordBaseInfo.recordId });
    openControlAttachmentInNewTab(
      _.assign(_.pick(recordBaseInfo, ['appId', 'recordId', 'viewId', 'worksheetId']), {
        controlId,
        fileId,
        getType: from === 21 ? from : undefined,
      }),
    );
  }

  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      {isListCard && !!sortAllAttachments.length && (
        <ListCardHeader />
      )}
      <SortableList
        ref={ref}
        axis={isListCard ? 'y' : 'xy'}
        shouldCancelStart={isListCard ? ({ target }) => !target.classList.contains('fileDrag') : undefined}
        helperClass="sortableSortFile"
        style={viewMore && !isLargeImageCard ? { maxHeight: heights[showType] * showLineCount } : undefined}
        distance={5}
        disabled={!allowSort}
        className={className}
        smallSize={smallSize}
        list={isLargeImageCard && viewMoreVisible && viewMore ? sortAllAttachments.filter(filterImageAttachments).filter((_, index) => index < showLineCount) : sortAllAttachments}
        worksheetId={recordBaseInfo.worksheetId}
        recordId={recordBaseInfo.recordId}
        onDeleteMDFile={handleDeleteMDFile}
        onDeleteKCFile={handleDeleteKCFile}
        onDeleteFile={handleDeleteFile}
        onResetNameFile={handleResetNameFile}
        onAttachmentName={(id, name) => {
          name = name.trim();
          if (_.isEmpty(name)) {
            alert(_l('名称不能为空'), 2);
            return;
          }
          onAttachmentName(id, name, {
            instanceId: recordBaseInfo.instanceId,
            workId: recordBaseInfo.workId,
          });
        }}
        onMDPreview={handleMDPreview}
        onKCPreview={handleKCPreview}
        onPreview={handlePreview}
        onOpenControlAttachmentInNewTab={controlId && handleOpenControlAttachmentInNewTab}
        onSortEnd={handleSortEnd}
        {...otherProps}
      />
      {viewMoreVisible && (
        <Fragment>
          <div
            className={cx('attachmentFilesViewMoreWrap pBottom10 flexRow alignItemsCenter', showType === '3' ? 'pTop10' : 'pTop5')}
            onClick={() => setViewMore(!viewMore)}
          >
            <span className="ThemeColor pointer">{viewMore ? _l('查看更多') : _l('收起')}</span>
          </div>
        </Fragment>
      )}
    </ConfigProvider>
  );
}

export default Files;

Files.propTypes = {
  from: PropTypes.number,
  className: PropTypes.string,
}
