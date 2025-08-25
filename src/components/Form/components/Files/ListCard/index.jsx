import React, { Fragment, useEffect, useState } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import moment from 'moment';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem, Progress } from 'ming-ui';
import ResetNamePopup from '../ResetNamePopup';
import { handleDownload, handleShare, loadImage } from '../utils';
import './index.less';

const ListCard = props => {
  const {
    data,
    isMobile,
    isDeleteFile,
    wpsEditUrl,
    allowShare,
    allowDownload,
    isMore,
    allowSort,
    allowEditName,
    recordId,
    controlId,
    DragHandle,
    masterData,
    isSubListFile,
  } = props;
  const { onDeleteMDFile, onOpenControlAttachmentInNewTab, onMDPreview, onAttachmentName } = props;
  const { isKc, browse, fileClassName, fileSize, isDownload } = props;
  const previewUrl = data.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/2/w/200/h/140`);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [isPicture, setIsPicture] = useState(props.isPicture);
  const allowNewPage = recordId && onOpenControlAttachmentInNewTab && _.isEmpty(window.shareState);

  useEffect(() => {
    if (isPicture) {
      loadImage(previewUrl)
        .then()
        .catch(() => {
          setIsPicture(false);
        });
    }
  }, []);

  const renderDropdownOverlay = (
    <Menu style={{ width: 150 }} className="Relative">
      {allowNewPage && (
        <MenuItem
          key="newPage"
          icon={<Icon icon="launch" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            onOpenControlAttachmentInNewTab(data.fileID);
            setDropdownVisible(false);
          }}
        >
          {_l('新页面打开')}
        </MenuItem>
      )}
      {allowNewPage && (
        <MenuItem
          key="newPage"
          icon={<Icon icon="floating-layer" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            onOpenControlAttachmentInNewTab(data.fileID, { openAsPopup: true });
            setDropdownVisible(false);
          }}
        >
          {_l('浮窗打开')}
        </MenuItem>
      )}
      {wpsEditUrl && allowNewPage && <div className="hr-line" />}
      {wpsEditUrl && (
        <MenuItem
          key="onLineEdit"
          icon={<Icon icon="edit" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            window.open(wpsEditUrl);
            setDropdownVisible(false);
          }}
        >
          {_l('在线编辑')}
        </MenuItem>
      )}
      {allowShare && <div className="hr-line" />}
      {allowShare && (
        <MenuItem
          key="share"
          icon={<Icon icon="share" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            handleShare(data, isDownload);
            setDropdownVisible(false);
          }}
        >
          {_l('分享')}
        </MenuItem>
      )}
    </Menu>
  );

  const handlePreview = e => {
    e.stopPropagation();
    browse ? onMDPreview(data) : alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
  };

  return (
    <div
      className={cx('attachmentListCard flexRow alignItemsCenter', {
        mobile: isMobile,
        hover: dropdownVisible || isEdit,
      })}
    >
      {allowSort && (
        <DragHandle>
          <Icon className="fileDrag Gray_9e" icon="drag" />
        </DragHandle>
      )}
      <div
        className={cx('fileImageWrap pointer h100 flexRow alignItemsCenter justifyContentCenter', {
          mLeft0: !allowSort,
        })}
        onClick={handlePreview}
      >
        {isPicture ? (
          <div className="fileImage" style={{ backgroundImage: `url(${previewUrl})` }} />
        ) : (
          <div className={cx(fileClassName, 'fileIcon')} />
        )}
      </div>
      <div className="fileName flex flexRow alignItemsCenter pointer" onClick={handlePreview}>
        <span className="textEllipsis">
          {data.originalFilename}
          {data.ext}
        </span>
        {isKc && <Icon className="Font17 Gray_9e mLeft8" icon="knowledge1" />}
      </div>
      <div className="fileSize">{fileSize}</div>
      <div className="fileCreateTime">{createTimeSpan(moment(data.createTime).format('YYYY-MM-DD HH:mm:ss'))}</div>
      <div className="fileCreateUserName ellipsis">{data.createUserName}</div>
      {!isMobile && (
        <div className={cx('operateBtns', { deleteConfirmWrap: deleteConfirmVisible })}>
          <div className="flexRow alignItemsCenter">
            {deleteConfirmVisible ? (
              <Fragment>
                <div className="cancelBtn mRight6" onClick={() => setDeleteConfirmVisible(false)}>
                  {_l('取消')}
                </div>
                <div className="deleteBtn mRight10" onClick={() => onDeleteMDFile(data)}>
                  {_l('删除')}
                </div>
              </Fragment>
            ) : (
              <Fragment>
                {allowEditName && !isKc && (
                  <ResetNamePopup
                    originalFileName={data.originalFilename}
                    isEdit={isEdit}
                    setIsEdit={setIsEdit}
                    onSave={name => {
                      onAttachmentName(data.fileID, name);
                    }}
                  >
                    <Tooltip title={_l('重命名')} placement="bottom">
                      <div className="btnWrap pointer" onClick={() => setIsEdit(true)}>
                        <Icon className="Gray_9e Font20" icon="rename_input" />
                      </div>
                    </Tooltip>
                  </ResetNamePopup>
                )}
                {allowDownload && (
                  <Tooltip title={_l('下载')} placement="bottom">
                    <div
                      className="btnWrap pointer"
                      onClick={() => {
                        handleDownload(data, isDownload, {
                          controlId: isSubListFile ? _.get(masterData, 'controlId') : controlId,
                          rowId: recordId,
                          parentWorksheetId: _.get(masterData, 'worksheetId'),
                          parentRowId: _.get(masterData, 'recordId'),
                        });
                      }}
                    >
                      <Icon className="Gray_9e Font17" icon="download" />
                    </div>
                  </Tooltip>
                )}
                {isDeleteFile && (
                  <Tooltip title={_l('删除')} placement="bottom">
                    <div className="btnWrap pointer delete" onClick={() => setDeleteConfirmVisible(true)}>
                      <Icon className="Gray_9e Font17" icon="trash" />
                    </div>
                  </Tooltip>
                )}
                {isMore && (
                  <Trigger
                    action={['click']}
                    popup={renderDropdownOverlay}
                    popupVisible={dropdownVisible}
                    onPopupVisibleChange={dropdownVisible => {
                      dropdownVisible && !wpsEditUrl && props.onTriggerMore(data);
                      setDropdownVisible(dropdownVisible);
                    }}
                    popupAlign={{
                      points: ['tr', 'br'],
                      offset: [5, 5],
                      overflow: { adjustX: true, adjustY: true },
                    }}
                  >
                    <Tooltip title={_l('更多')} placement="bottom">
                      <div className="btnWrap pointer">
                        <Icon className="Gray_9e Font17" icon="more_horiz" />
                      </div>
                    </Tooltip>
                  </Trigger>
                )}
              </Fragment>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

const NotSaveListCard = props => {
  const { data, isMobile, allowSort } = props;
  const { onDeleteKCFile, onDeleteFile, onResetNameFile, onKCPreview, onPreview } = props;
  const { isKc, fileClassName, isPicture, fileSize, url } = props;
  const previewImageUrl = isKc
    ? data.viewUrl
    : url.indexOf('imageView2') > -1
      ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
      : url + `${url.includes('?') ? '&' : '?'}imageView2/1/w/200/h/140`;
  const [isEdit, setIsEdit] = useState(false);

  const handlePreview = () => {
    if (isEdit) return;
    isKc ? onKCPreview(data) : onPreview(data);
  };

  return (
    <div className={cx('attachmentListCard flexRow alignItemsCenter', { mobile: isMobile, hover: isEdit })}>
      {allowSort && <Icon className="fileDrag Gray_9e" icon="drag" />}
      <div
        className={cx('fileImageWrap pointer h100 flexRow alignItemsCenter justifyContentCenter', {
          mLeft0: !allowSort,
        })}
        onClick={handlePreview}
      >
        {isPicture ? <img className="h100" src={previewImageUrl} /> : <div className={cx(fileClassName, 'fileIcon')} />}
      </div>
      <div className="fileName flex flexRow alignItemsCenter pointer" onClick={handlePreview}>
        <span className="textEllipsis">
          {data.originalFileName}
          {data.fileExt}
        </span>
        {isKc && <Icon className="Font17 Gray_9e mLeft8" icon="knowledge1" />}
      </div>
      <div className="fileSize">{fileSize}</div>
      <div className="fileCreateTime">{_l('刚刚')}</div>
      <div className="fileCreateUserName ellipsis">{md.global.Account.fullname}</div>
      {!isMobile && (
        <div className="operateBtns flexRow alignItemsCenter">
          {!isKc && (
            <ResetNamePopup
              originalFileName={data.originalFileName}
              isEdit={isEdit}
              setIsEdit={setIsEdit}
              onSave={name => {
                onResetNameFile(data.fileID, name);
              }}
            >
              <Tooltip title={_l('重命名')} placement="bottom">
                <div className="btnWrap pointer" onClick={() => setIsEdit(true)}>
                  <Icon className="Gray_9e Font20" icon="rename_input" />
                </div>
              </Tooltip>
            </ResetNamePopup>
          )}
          <Tooltip title={_l('删除')} placement="bottom">
            <div
              className="btnWrap pointer delete"
              onClick={() => {
                isKc ? onDeleteKCFile(data) : onDeleteFile(data);
              }}
            >
              <Icon className="Gray_9e Font17" icon="trash" />
            </div>
          </Tooltip>
        </div>
      )}
    </div>
  );
};

export const ListCardHeader = () => {
  return (
    <div className={cx('attachmentListCard header flexRow alignItemsCenter')}>
      <Icon className="Visibility mRight2" icon="drag" />
      <div className="fileImageWrap h100 flexRow alignItemsCenter">{_l('文件')}</div>
      <div className="fileName flex flexRow alignItemsCenter"></div>
      <div className="fileSize">{_l('大小')}</div>
      <div className="fileCreateTime">{_l('上传时间')}</div>
      <div className="fileCreateUserName ellipsis">{_l('上传者')}</div>
    </div>
  );
};

export default props => {
  const { data, ...otherProps } = props;
  const { isMdFile } = props;

  if ('progress' in data) {
    const { progress, base } = data;
    return (
      <div className="attachmentListCard flexRow alignItemsCenter">
        <div className="fileImageWrap pointer h100 flexRow alignItemsCenter justifyContentCenter">
          <Progress.Circle
            key="text"
            isAnimation={false}
            isRound={false}
            strokeWidth={3}
            diameter={47}
            foregroundColor="#BDBDBD"
            backgroundColor="#fff"
            format={() => ''}
            percent={parseInt(progress)}
          />
        </div>
        <div className="fileName flex flexRow alignItemsCenter">
          <span className="textEllipsis">
            {base.fileName}
            {base.fileExt || data.ext}
          </span>
        </div>
      </div>
    );
  }

  return isMdFile ? <ListCard data={data} {...otherProps} /> : <NotSaveListCard data={data} {...otherProps} />;
};
