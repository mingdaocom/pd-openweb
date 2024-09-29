import React, { Fragment, useContext, useState, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { SortableList } from 'ming-ui';
import cx from 'classnames';
import { ConfigProvider } from 'antd';
import { openControlAttachmentInNewTab } from 'worksheet/controllers/record';
import previewAttachments from 'src/components/previewAttachments/previewAttachments';
import RecordInfoContext from 'worksheet/common/recordInfo/RecordInfoContext';
import { WIDGETS_TO_API_TYPE_ENUM } from 'src/pages/widgetConfig/config/widget';
import { formatFileSize, getClassNameByExt } from 'src/util';
import { browserIsMobile, addBehaviorLog } from 'src/util';
import ImageCard from './ImageCard';
import SmallCard from './SmallCard';
import ListCard, { ListCardHeader } from './ListCard';
import LargeImageCard from './LargeImageCard';
import './index.less';
import RegExpValidator from 'src/util/expression';

const showTypes = {
  1: 'imageFilesWrap',
  2: 'smallFilesWrap',
  3: 'listFilesWrap',
  4: 'largeImageFilesWrap',
};

const showCardTypes = {
  1: 'attachmentImageCard',
  2: 'attachmentSmallCard',
  3: 'attachmentListCard',
  4: 'attachmentLargeImageCard',
};

const CardComponent = {
  1: ImageCard,
  2: SmallCard,
  3: ListCard,
  4: LargeImageCard,
};

const heights = {
  1: 130 + 6, // height + marginBottom
  2: 56 + 6,
  3: 52,
};

const isMobile = browserIsMobile();

const sortFiles = files => {
  return files.sort((a, b) => a.index - b.index);
};

const filterImageAttachments = data => {
  const isMdFile = data.accountId || data.sourceID;
  return isMdFile
    ? RegExpValidator.fileIsPicture(data.refId ? data.fileExt : data.ext)
    : RegExpValidator.fileIsPicture(data.fileExt);
};

const renderSortableItem = props => {
  const { recordId, showType, allowShare, allowDownload, allowEditName, onOpenControlAttachmentInNewTab, item } = props;
  const data = item;
  const { accountId, sourceID } = data;
  const isMdFile = accountId || sourceID;
  const isKc = !!data.refId;

  const FileComponent = CardComponent[showType];
  const fileProps = { isMdFile, isKc };

  if (isMdFile) {
    const isPicture = isKc ? !!data.shareUrl : RegExpValidator.fileIsPicture(data.ext);
    Object.assign(fileProps, {
      isPicture,
      browse: isKc ? !!data.shareUrl : true,
      fileClassName: getClassNameByExt(data.attachmentType === 5 ? false : data.ext),
      fileSize: formatFileSize(data.filesize),
      isMore:
        (allowShare || allowDownload || (allowEditName && !isKc) || (recordId && onOpenControlAttachmentInNewTab && _.isEmpty(window.shareState))) &&
        md.global.Account.accountId &&
        !_.get(window, 'shareState.shareId'),
      isDownload: isKc
        ? data.allowDown === 'ok'
        : data.accountId === md.global.Account.accountId || isPicture || data.allowDown === 'ok',
    });
  } else {
    Object.assign(fileProps, {
      fileClassName: getClassNameByExt(data.fileExt),
      isPicture: RegExpValidator.fileIsPicture(data.fileExt),
      fileSize: formatFileSize(data.fileSize),
      url: data.previewUrl || data.url || '',
    });
  }

  return <FileComponent {...props} data={data} {...fileProps} isMobile={isMobile} />;
};

const SortableListWrap = props => {
  const { list, className, smallSize, style, ref, isListCard, canDrag, ...otherProps } = props;
  const { showType } = props;
  return (
    <div
      style={style}
      ref={ref}
      className={cx('overflowHidden', { mTop8: !['3'].includes(showType), hide: !list.length })}
    >
      <div className={cx(className, 'attachmentFilesWrap', showTypes[showType], { mobile: isMobile, smallSize })}>
        <SortableList
          dragPreviewImage
          canDrag={canDrag}
          useDragHandle={isListCard}
          itemKey="fileID"
          itemClassName={showCardTypes[showType]}
          items={list}
          renderItem={options => renderSortableItem({ ...options, ...otherProps })}
          onSortEnd={otherProps.onSortEnd}
        />
        {['1', '2'].includes(showType) &&
          Array.from({ length: 10 }).map((_, index) => (
            <i
              key={index}
              className={cx('fileEmpty', showCardTypes[showType], {
                mobile: isMobile,
              })}
            />
          ))}
      </div>
    </div>
  );
};

const Files = props => {
  const { className, controlId, controlType, onChangedAllFiles, onSortAttachment, onAttachmentName, flag, ...otherProps } = props;
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
  const isOtherSheet = controlType === WIDGETS_TO_API_TYPE_ENUM.SHEET_FIELD;

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
  };
  // 删除未保存的知识附件
  const handleDeleteKCFile = data => {
    const files = knowledgeAtts.filter(item => item.refId !== data.refId);
    onChangeKnowledgeAtts(files);
  };
  // 删除未保存的七牛云附件
  const handleDeleteFile = data => {
    const files = attachments.filter(item => item.fileID !== data.fileID);
    onChangeAttachments(files);
    props.onRemoveFile(_.find(attachments, { fileID: data.fileID }));
  };
  // 重命名未保存的七牛云附件
  const handleResetNameFile = (id, newName) => {
    newName = newName.trim();
    const error = props.checkValueByFilterRegex(newName);
    if (error) {
      alert(error, 2);
      return;
    }
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
  };

  // 明道云附件预览
  const handleMDPreview = data => {
    const { allowShare, allowDownload = false, advancedSetting } = props;
    const hideFunctions = ['editFileName', 'saveToKnowlege'].concat(allowDownload ? [] : ['download']).concat(allowShare ? [] : ['share']);
    addBehaviorLog('previewFile', recordBaseInfo.worksheetId, { fileId: data.fileID, rowId: recordBaseInfo.recordId });
    if (window.isMingDaoApp) {
      window.MDJS.previewImage({
        nameEditing: props.allowEditName, // 默认true, 是否允许修改文件名
        deletion: props.allowEditName, // 默认true, 是否允许删除文件
        sharing: props.allowEditName, // 默认true, 是否允许对外分享, 第三方应用打开
        download: props.allowDownload, // 默认true, 是否允许下载, file.allowdown 对单个文件仍有效
        index: _.findIndex(attachmentData, { fileID: data.fileID }), // 当前文件序列, 默认为0, 显示files中第一个
        files: attachmentData, // 全部文件列表, H5端直接传给App即可, App做各类型数据兼容
        filterRegex: _.get(advancedSetting, 'filterRegex'), // 给到生效中的文件名正则, 修改文件名时需要符合正则要求
        checkValueByFilterRegex: props.checkValueByFilterRegex,
      });
      return;
    }
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
        openControlAttachmentInNewTab: !isMobile && controlId && !isOtherSheet && handleOpenControlAttachmentInNewTab,
      },
    );
  };
  // 未保存的知识附件预览
  const handleKCPreview = data => {
    const res = knowledgeAtts.filter(item => item.node).map(item => item.node);
    if (window.isMingDaoApp) {
      window.MDJS.previewImage({
        index: _.findIndex(res, { id: data.fileID }),
        files: res,
        filterRegex: _.get(advancedSetting, 'filterRegex'),
        checkValueByFilterRegex: props.checkValueByFilterRegex,
      });
      return;
    }
    previewAttachments({
      attachments: res,
      index: _.findIndex(res, { id: data.fileID }),
      callFrom: 'kc',
      hideFunctions: ['editFileName', 'share', 'saveToKnowlege'],
    });
  };
  // 未保存的七牛云附件预览
  const handlePreview = data => {
    const res = attachments.map(item => {
      return {
        name: `${item.originalFileName || _l('未命名')}${item.fileExt}`,
        path: item.previewUrl
          ? `${item.previewUrl}`
          : item.url
          ? `${item.url}${item.url.includes('?') ? '&' : '?'}imageView2/1/w/200/h/140`
          : `${item.serverName}${item.key}`,
        previewAttachmentType: 'QINIU',
        size: item.fileSize,
        fileid: item.fileID,
      };
    });
    previewAttachments({
      attachments: res,
      index: _.findIndex(attachments, { fileID: data.fileID }),
      callFrom: 'chat',
      hideFunctions: ['editFileName', 'share', 'saveToKnowlege'],
    });
  };

  const handleSortEnd = files => {
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
        attachmentData,
      });
    } else {
      onSortAttachment(attachmentData);
    }
  };

  const handleOpenControlAttachmentInNewTab = (fileId, options = {}) => {
    if (!recordBaseInfo) {
      return;
    }
    addBehaviorLog('previewFile', recordBaseInfo.worksheetId, { fileId, rowId: recordBaseInfo.recordId });
    openControlAttachmentInNewTab(
      _.assign(
        _.pick(recordBaseInfo, ['appId', 'recordId', 'viewId', 'worksheetId']),
        {
          controlId,
          fileId,
          getType: from === 21 ? from : undefined,
        },
        options,
      ),
    );
  };

  return (
    <ConfigProvider autoInsertSpaceInButton={false}>
      {isListCard && !!sortAllAttachments.length && <ListCardHeader />}
      <SortableListWrap
        ref={ref}
        isListCard={isListCard}
        style={viewMore && !isLargeImageCard ? { maxHeight: heights[showType] * showLineCount } : undefined}
        canDrag={allowSort}
        className={className}
        smallSize={smallSize}
        list={
          isLargeImageCard && viewMoreVisible && viewMore
            ? sortAllAttachments.filter(filterImageAttachments).filter((_, index) => index < showLineCount)
            : sortAllAttachments
        }
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
        onOpenControlAttachmentInNewTab={controlId && !isOtherSheet && handleOpenControlAttachmentInNewTab}
        onSortEnd={handleSortEnd}
        {...otherProps}
      />
      {viewMoreVisible && (
        <Fragment>
          <div
            className={cx(
              'attachmentFilesViewMoreWrap pBottom10 flexRow alignItemsCenter',
              showType === '3' ? 'pTop10' : 'pTop5',
            )}
            onClick={() => setViewMore(!viewMore)}
          >
            <span className="ThemeColor pointer">{viewMore ? _l('查看更多') : _l('收起')}</span>
          </div>
        </Fragment>
      )}
    </ConfigProvider>
  );
};

export default Files;

Files.propTypes = {
  from: PropTypes.number,
  className: PropTypes.string,
};
