import React, { Fragment, useEffect, useRef, useState } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import _ from 'lodash';
import Trigger from 'rc-trigger';
import { Icon, Menu, MenuItem, Progress } from 'ming-ui';
import { handleDownload, handleShare, loadImage } from '../utils';
import './index.less';

const renderFileImage = (url, coverType, imgClassName = 'w100') => {
  if (coverType === '0') {
    return <div className="fileImage" style={{ backgroundImage: `url(${url})` }} />;
  } else {
    return (
      <div className="flexRow alignItemsCenter justifyContentCenter overflowHidden h100 GrayBGF8">
        <img className={imgClassName} src={url} />
      </div>
    );
  }
};

// 渲染明道云附件
const ImageCard = props => {
  const {
    data,
    isMobile,
    isDeleteFile,
    coverType,
    wpsEditUrl,
    allowEditName,
    allowShare,
    allowDownload,
    recordId,
    controlId,
    isOtherSheet,
    sourceControlId,
    masterData,
    isSubListFile,
  } = props;
  const { onDeleteMDFile, onOpenControlAttachmentInNewTab, onMDPreview, onAttachmentName } = props;
  const { isKc, browse, fileClassName, fileSize, isMore, isDownload } = props;
  const fullShow = coverType === '1';
  const previewUrl = data.previewUrl.replace(
    /imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/,
    `imageView2/${fullShow ? 2 : 1}/w/200/h/140`,
  );
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [imgClassName, setImgClassName] = useState('w100');
  const ref = useRef(null);
  const [isPicture, setIsPicture] = useState(props.isPicture);
  const allowReset = allowEditName && !isKc;
  const allowNewPage = recordId && onOpenControlAttachmentInNewTab && _.isEmpty(window.shareState);

  useEffect(() => {
    if (isPicture) {
      loadImage(previewUrl)
        .then(image => {
          const { width, height } = image;
          setImgClassName(width > height ? 'w100' : 'h100');
        })
        .catch(() => {
          setIsPicture(false);
        });
    }
  }, []);

  const renderDropdownOverlay = (
    <Menu style={{ width: 150 }} className="Relative" onClick={e => e.stopPropagation()}>
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
          key="newWindow"
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
      {(allowReset || allowShare) && <div className="hr-line" />}
      {allowReset && (
        <MenuItem
          key="editName"
          icon={<Icon icon="rename_input" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            setIsEdit(true);
            setDropdownVisible(false);
          }}
        >
          {_l('重命名')}
        </MenuItem>
      )}
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

  const handleFocus = () => {
    setTimeout(() => {
      ref && ref.current && ref.current.select();
    }, 0);
  };

  return (
    <div
      className={cx('attachmentFile', { hover: dropdownVisible || isEdit })}
      onClick={e => {
        e.stopPropagation();
        browse ? onMDPreview(data) : alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
      }}
    >
      {isMobile && isDeleteFile && (
        <Icon
          icon="close"
          className="closeIcon flexRow alignItemsCenter justifyContentCenter"
          onClick={e => {
            e.stopPropagation();
            onDeleteMDFile(data);
          }}
        />
      )}
      {isKc && (
        <div className="kcIcon flexRow alignItemsCenter justifyContentCenter">
          <Icon className="Font17" icon="knowledge1" />
        </div>
      )}
      {isPicture ? (
        renderFileImage(previewUrl, coverType, imgClassName)
      ) : (
        <div className="fileAccessory flexColumn">
          <div className="fileIconWrap flexRow alignItemsCenter justifyContentCenter">
            <div className={cx(fileClassName, 'fileIcon')} />
          </div>
          <div className="fileName Font13 flexRow alignItemsCenter textEllipsis">
            {data.originalFilename}
            {data.ext}
          </div>
        </div>
      )}
      <div className={cx('flexColumn filePanel', isPicture ? 'image' : 'accessory')}>
        {isEdit ? (
          <div className="flex">
            <input
              ref={ref}
              type="text"
              autoFocus
              onFocus={handleFocus}
              className="resetNameInput Font13"
              defaultValue={data.originalFilename}
              onClick={e => {
                e.stopPropagation();
              }}
              onBlur={e => {
                onAttachmentName(data.fileID, e.target.value);
                setIsEdit(false);
              }}
              onKeyDown={e => {
                if (e.which === 13) {
                  onAttachmentName(data.fileID, e.target.value);
                  setIsEdit(false);
                }
              }}
            />
          </div>
        ) : (
          <div className="flex">
            <div
              className={cx(
                'Font13 flexRow alignItemsCenter textEllipsis mBottom5 name',
                isPicture ? 'White' : 'ThemeColor',
              )}
            >
              {data.originalFilename}
              {data.ext}
            </div>
            <div className="flexRow alignItemsCenter Gray_bd">
              {isKc ? (
                <Fragment>
                  <span className="mRight10">{_l('来自知识')}</span>
                  {data.attachmentType !== 4 && <span>{fileSize}</span>}
                </Fragment>
              ) : (
                <span>{fileSize}</span>
              )}
            </div>
          </div>
        )}
        {deleteConfirmVisible ? (
          <div className="operateBtns confirm flexRow">
            <div
              className="deleteBtn mRight10"
              onClick={e => {
                e.stopPropagation();
                onDeleteMDFile(data);
                setDeleteConfirmVisible(false);
              }}
            >
              {_l('删除')}
            </div>
            <div
              className="cancelBtn"
              onClick={e => {
                e.stopPropagation();
                setDeleteConfirmVisible(false);
              }}
            >
              {_l('取消')}
            </div>
          </div>
        ) : (
          <div className="operateBtns flexRow">
            {isDeleteFile && (
              <Tooltip title={_l('删除')} placement="bottom">
                <div
                  onClick={e => {
                    e.stopPropagation();
                    setDeleteConfirmVisible(true);
                  }}
                  className="panelBtn delete"
                >
                  <Icon className="Gray_9e Font17" icon="trash" />
                </div>
              </Tooltip>
            )}
            <div className="flexRow alignItemsCenter">
              {allowDownload && (
                <Tooltip title={_l('下载')} placement="bottom">
                  <div
                    onClick={e => {
                      e.stopPropagation();
                      handleDownload(data, isDownload, {
                        controlId: isOtherSheet
                          ? sourceControlId
                          : isSubListFile
                            ? _.get(masterData, 'controlId')
                            : controlId,
                        rowId: recordId,
                        parentWorksheetId: _.get(masterData, 'worksheetId'),
                        parentRowId: _.get(masterData, 'recordId'),
                      });
                    }}
                    className="panelBtn mRight10"
                  >
                    <Icon className="Gray_9e Font17" icon="download" />
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
                    points: ['tl', 'bl'],
                    offset: [0, 5],
                    overflow: { adjustX: true, adjustY: true },
                  }}
                >
                  <Tooltip title={_l('更多')} placement="bottom">
                    <div
                      onClick={e => {
                        e.stopPropagation();
                        setDropdownVisible(true);
                      }}
                      className="panelBtn"
                    >
                      <Icon className="Gray_9e Font17" icon="more_horiz" />
                    </div>
                  </Tooltip>
                </Trigger>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

// 渲染未保存的附件
const NotSaveImageCard = props => {
  const { data, isMobile, coverType } = props;
  const { onDeleteKCFile, onDeleteFile, onResetNameFile, onKCPreview, onPreview } = props;
  const { isKc, fileClassName, fileSize, url } = props;
  const size = 'w/200/h/140';
  const mode = coverType === '1' ? 2 : 1;
  const previewImageUrl = isKc
    ? data.viewUrl
    : url.indexOf('imageView2') > -1
      ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/${mode}/${size}`)
      : url + `${url.includes('?') ? '&' : '?'}imageView2/${mode}/${size}`;
  const [isEdit, setIsEdit] = useState(false);
  const [isPicture, setIsPicture] = useState(props.isPicture);
  const [imgClassName, setImgClassName] = useState('w100');
  const ref = useRef(null);

  useEffect(() => {
    if (isPicture) {
      loadImage(previewImageUrl)
        .then(image => {
          const { width, height } = image;
          setImgClassName(width > height ? 'w100' : 'h100');
        })
        .catch(() => {
          setIsPicture(false);
        });
    }
  }, []);

  const handleFocus = () => {
    setTimeout(() => {
      ref && ref.current && ref.current.select();
    }, 0);
  };

  return (
    <div
      className={cx('attachmentFile', { hover: isEdit })}
      onClick={e => {
        e.stopPropagation();
        if (isEdit) return;
        isKc ? onKCPreview(data) : onPreview(data);
      }}
    >
      {isMobile && (
        <Icon
          icon="close"
          className="closeIcon flexRow alignItemsCenter justifyContentCenter"
          onClick={e => {
            e.stopPropagation();
            isKc ? onDeleteKCFile(data) : onDeleteFile(data);
          }}
        />
      )}
      {isKc && (
        <div className="kcIcon flexRow alignItemsCenter justifyContentCenter">
          <Icon className="Font17" icon="knowledge1" />
        </div>
      )}
      {isPicture ? (
        renderFileImage(previewImageUrl, coverType, imgClassName)
      ) : (
        <div className="fileAccessory flexColumn">
          <div className="fileIconWrap flexRow alignItemsCenter justifyContentCenter">
            <div className={cx(fileClassName, 'fileIcon')} />
          </div>
          <div className="fileName Font13 flexRow alignItemsCenter textEllipsis">
            {data.originalFileName}
            {data.fileExt}
          </div>
        </div>
      )}
      <div className={cx('flexColumn filePanel', isPicture ? 'image' : 'accessory')}>
        {isEdit ? (
          <div className="flex">
            <input
              ref={ref}
              type="text"
              autoFocus
              onFocus={handleFocus}
              className="resetNameInput Font13"
              defaultValue={data.originalFileName}
              onBlur={e => {
                onResetNameFile(data.fileID, e.target.value);
                setIsEdit(false);
              }}
              onKeyDown={e => {
                if (e.which === 13) {
                  onResetNameFile(data.fileID, e.target.value);
                  setIsEdit(false);
                }
              }}
            />
          </div>
        ) : (
          <div className="flex">
            <div
              className={cx(
                'Font13 flexRow alignItemsCenter textEllipsis mBottom5 name',
                isPicture ? 'White' : 'ThemeColor',
              )}
            >
              {data.originalFileName}
              {data.fileExt}
            </div>
            <div className="flexRow alignItemsCenter Gray_bd">
              {isKc ? (
                <Fragment>
                  <span className="mRight10">{_l('来自知识')}</span>
                  {data.attachmentType !== 4 && <span>{fileSize}</span>}
                </Fragment>
              ) : (
                <span>{fileSize}</span>
              )}
            </div>
          </div>
        )}
        <div className="operateBtns flexRow">
          <Tooltip title={_l('删除')} placement="bottom">
            <div
              onClick={e => {
                e.stopPropagation();
                isKc ? onDeleteKCFile(data) : onDeleteFile(data);
              }}
              className="panelBtn delete"
            >
              <Icon className="Gray_9e Font17" icon="trash" />
            </div>
          </Tooltip>
          {!isKc && (
            <Tooltip title={_l('重命名')} placement="bottom">
              <div
                onClick={e => {
                  e.stopPropagation();
                  setIsEdit(true);
                }}
                className="panelBtn"
              >
                <Icon className="Gray_9e Font17" icon="rename_input" />
              </div>
            </Tooltip>
          )}
        </div>
      </div>
    </div>
  );
};

export default props => {
  const { data, removeUploadingFile, ...otherProps } = props;
  const { isMdFile } = props;

  // 正在上传
  if ('progress' in data) {
    const { progress, base } = data;
    return (
      <div className="attachmentImageCard Relative">
        <Icon
          icon="close"
          className="closeIcon flexRow alignItemsCenter justifyContentCenter"
          onClick={() => {
            removeUploadingFile(data);
          }}
        />
        <div className="attachmentFile h100 flexColumn">
          <div className="flexRow alignItemsCenter justifyContentCenter flex">
            <Progress.Circle
              key="text"
              isAnimation={false}
              isRound={false}
              strokeWidth={3}
              diameter={47}
              foregroundColor="#BDBDBD"
              backgroundColor="#fff"
              percent={parseInt(progress)}
            />
          </div>
          <div className="fileName Font13 flexRow alignItemsCenter textEllipsis">
            {base.fileName}
            {base.fileExt}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="attachmentImageCard">
      {isMdFile ? <ImageCard data={data} {...otherProps} /> : <NotSaveImageCard data={data} {...otherProps} />}
    </div>
  );
};
