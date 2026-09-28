import React, { Fragment, useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import { Icon, Progress } from 'ming-ui';
import { Dropdown, Tooltip } from 'ming-ui/antd-components';
import ResetNamePopup from '../ResetNamePopup';
import { handleDownload, handleShare, loadImage } from '../utils';
import './index.less';

const SmallCard = props => {
  const { data, isMobile, isDeleteFile, wpsEditUrl, allowEditName, recordId, controlId, masterData, isSubListFile } =
    props;
  const { allowShare, allowDownload, onDeleteMDFile, onOpenControlAttachmentInNewTab, onMDPreview, onAttachmentName } =
    props;
  const { isKc, browse, fileClassName, fileSize, isMore, isDownload, isUrlPreview, isDeleted } = props;
  const previewUrl = isUrlPreview
    ? data.previewUrl
    : data.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/1/w/200/h/140`);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [deleteConfirmVisible, setDeleteConfirmVisible] = useState(false);
  const [showDownloadOfDeleteBtn, setShowDownloadOfDeleteBtn] = useState(true);
  const [diffWidth, setDiffWidth] = useState(0);
  const [isEdit, setIsEdit] = useState(false);
  const [isPicture, setIsPicture] = useState(props.isPicture);
  const [fileSizeVisible, setFileSizeVisible] = useState(true);
  const wrapRef = useRef(null);
  const ref = useRef(null);
  const allowReset = allowEditName && !isKc;
  const allowNewPage = recordId && onOpenControlAttachmentInNewTab && _.isEmpty(window.shareState);
  const canDeleteMDFile = isDeleteFile && _.isFunction(onDeleteMDFile);

  useEffect(() => {
    if (isPicture) {
      loadImage(previewUrl)
        .then()
        .catch(() => {
          setIsPicture(false);
        });
    }
  }, [isPicture, previewUrl]);

  useEffect(() => {
    const current = _.get(ref, 'current');
    current && setFileSizeVisible(_.get(current, 'clientHeight') < 20);
  }, [data.originalFilename]);

  const dropdownItems = [
    allowNewPage && {
      key: 'newPage',
      icon: <Icon icon="launch" className="Font17" />,
      label: _l('新页面打开'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onOpenControlAttachmentInNewTab(data.fileID);
        setDropdownVisible(false);
      },
    },
    allowNewPage && {
      key: 'newWindow',
      icon: <Icon icon="rectangle_2" className="Font17" />,
      label: _l('浮窗打开'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        onOpenControlAttachmentInNewTab(data.fileID, { openAsPopup: true });
        setDropdownVisible(false);
      },
    },
    wpsEditUrl && allowNewPage && { type: 'divider' },
    wpsEditUrl && {
      key: 'onLineEdit',
      icon: <Icon icon="edit" className="Font17" />,
      label: _l('在线编辑'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        window.open(wpsEditUrl);
        setDropdownVisible(false);
      },
    },
    allowDownload &&
      !showDownloadOfDeleteBtn && {
        key: 'download',
        icon: <Icon icon="download" className="Font17" />,
        label: _l('下载'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          handleDownload(data, isDownload, {
            controlId: isSubListFile ? _.get(masterData, 'controlId') : controlId,
            rowId: recordId,
            parentWorksheetId: _.get(masterData, 'worksheetId'),
            parentRowId: _.get(masterData, 'recordId'),
          });
        },
      },
    canDeleteMDFile &&
      !showDownloadOfDeleteBtn && {
        key: 'delete',
        icon: <Icon icon="trash" className="Font17" />,
        label: _l('删除'),
        onClick: ({ domEvent }) => {
          domEvent.stopPropagation();
          setDeleteConfirmVisible(true);
        },
      },
    (allowReset || allowShare) && { type: 'divider' },
    allowReset && {
      key: 'rename_input',
      icon: <Icon icon="rename_input" className="Font17" />,
      label: _l('重命名'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setIsEdit(true);
        setDropdownVisible(false);
      },
    },
    allowShare && {
      key: 'share',
      icon: <Icon icon="share" className="Font17" />,
      label: _l('分享'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        handleShare(data, isDownload);
        setDropdownVisible(false);
      },
    },
  ].filter(Boolean);

  const handlePreview = e => {
    e.stopPropagation();
    if (isDeleted) return;

    browse ? onMDPreview(data) : alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
  };

  return (
    <div
      className={cx('attachmentSmallCard flexRow alignItemsCenter', {
        mobile: isMobile,
        hover: dropdownVisible || isEdit,
        mRight10: canDeleteMDFile && isMobile,
      })}
      ref={wrapRef}
      onMouseEnter={() => {
        const current = _.get(wrapRef, 'current.parentNode.parentNode');

        if (current) {
          const diffWidth = current.clientWidth - 300;

          if (diffWidth < 0) {
            setDiffWidth(diffWidth - 10);
            setShowDownloadOfDeleteBtn(false);
          } else {
            setDiffWidth(0);
            setShowDownloadOfDeleteBtn(true);
          }
        }
      }}
    >
      <div
        className="fileImageWrap fileImageWrap pointer flexRow alignItemsCenter justifyContentCenter"
        onClick={handlePreview}
      >
        {isPicture ? (
          <div className="fileImage" style={{ backgroundImage: `url(${previewUrl})` }} />
        ) : (
          <div className={cx(fileClassName, 'fileIcon')} />
        )}
        {isKc && (
          <div className="kcIcon flexRow alignItemsCenter justifyContentCenter">
            <Icon className="Font16" icon="knowledge1" />
          </div>
        )}
      </div>
      <div className="fileContent flex flexColumn justifyContentCenter pointer" onClick={handlePreview}>
        <div className="fileName textEllipsis" ref={ref}>
          {data.originalFilename}
          {data.ext}
        </div>
        <div className={cx('fileSize textSecondary', { hide: !fileSizeVisible })}>{fileSize}</div>
      </div>
      {!isMobile ? (
        <div className="operateBtns flexRow alignItemsCenter" style={{ marginRight: Math.abs(diffWidth) }}>
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
              {showDownloadOfDeleteBtn && (
                <Fragment>
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
                        <Icon className="textTertiary Font17" icon="download" />
                      </div>
                    </Tooltip>
                  )}
                  {canDeleteMDFile && (
                    <Tooltip title={_l('删除')} placement="bottom">
                      <div className="btnWrap pointer delete" onClick={() => setDeleteConfirmVisible(true)}>
                        <Icon className="textTertiary Font17" icon="trash" />
                      </div>
                    </Tooltip>
                  )}
                </Fragment>
              )}
              {isMore && (
                <Dropdown
                  trigger={['click']}
                  placement="bottomRight"
                  open={dropdownVisible}
                  onOpenChange={dropdownVisible => {
                    dropdownVisible && !wpsEditUrl && props.onTriggerMore(data);
                    setDropdownVisible(dropdownVisible);
                  }}
                  menu={{ items: dropdownItems, style: { width: 150 } }}
                >
                  <div>
                    <Tooltip title={_l('更多')} placement="bottom">
                      <div className="btnWrap pointer">
                        <Icon className="textTertiary Font17" icon="more_horiz" />
                      </div>
                    </Tooltip>
                  </div>
                </Dropdown>
              )}
              <ResetNamePopup
                originalFileName={data.originalFilename}
                isEdit={isEdit}
                setIsEdit={setIsEdit}
                onSave={name => {
                  onAttachmentName(data.fileID, name);
                }}
              >
                <div />
              </ResetNamePopup>
            </Fragment>
          )}
        </div>
      ) : (
        canDeleteMDFile && (
          <Icon onClick={() => onDeleteMDFile(data)} className="deleteIcon textTertiary Font19" icon="cancel" />
        )
      )}
    </div>
  );
};

const NotSaveSmallCard = props => {
  const { data, isMobile } = props;
  const { onDeleteKCFile, onDeleteFile, onResetNameFile, onKCPreview, onPreview } = props;
  const { isKc, fileClassName, isPicture, fileSize, url, isUrlPreview } = props;
  const previewImageUrl = isKc
    ? data.viewUrl
    : isUrlPreview
      ? url
      : url.indexOf('imageView2') > -1
        ? url.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, 'imageView2/1/w/200/h/140')
        : url + `${url.includes('?') ? '&' : '?'}imageView2/1/w/200/h/140`;
  const [isEdit, setIsEdit] = useState(false);
  const [dropdownVisible, setDropdownVisible] = useState(false);
  const [diffWidth, setDiffWidth] = useState(0);
  const [showResetOfDeleteBtn, setShowResetOfDeleteBtn] = useState(true);
  const wrapRef = useRef(null);

  const handleDelete = () => {
    isKc ? onDeleteKCFile(data) : onDeleteFile(data);
  };

  const handlePreview = () => {
    if (isEdit) return;
    isKc ? onKCPreview(data) : onPreview(data);
  };

  const dropdownItems = [
    !isKc && {
      key: 'rename_input',
      icon: <Icon icon="rename_input" className="Font17" />,
      label: _l('重命名'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        setIsEdit(true);
        setDropdownVisible(false);
      },
    },
    {
      key: 'delete',
      icon: <Icon icon="trash" className="Font17" />,
      label: _l('删除'),
      onClick: ({ domEvent }) => {
        domEvent.stopPropagation();
        handleDelete();
        setDropdownVisible(false);
      },
    },
  ].filter(Boolean);

  return (
    <div
      className={cx('attachmentSmallCard flexRow alignItemsCenter', {
        mobile: isMobile,
        hover: isEdit || dropdownVisible,
      })}
      ref={wrapRef}
      onMouseEnter={() => {
        const current = _.get(wrapRef, 'current.parentNode.parentNode');

        const diffWidth = current.clientWidth - 300;

        if (diffWidth < 0) {
          setDiffWidth(diffWidth - 10);
          setShowResetOfDeleteBtn(false);
        } else {
          setDiffWidth(0);
          setShowResetOfDeleteBtn(true);
        }
      }}
    >
      <div
        className="fileImageWrap fileImageWrap pointer flexRow alignItemsCenter justifyContentCenter"
        onClick={handlePreview}
      >
        {isPicture ? (
          <div className="fileImage" style={{ backgroundImage: `url(${previewImageUrl})` }} />
        ) : (
          <div className={cx(fileClassName, 'fileIcon')} />
        )}
        {isKc && (
          <div className="kcIcon flexRow alignItemsCenter justifyContentCenter">
            <Icon className="Font16" icon="knowledge1" />
          </div>
        )}
      </div>
      <div className="fileContent flex flexColumn justifyContentCenter pointer" onClick={handlePreview}>
        <div className="fileName textEllipsis">
          {data.originalFileName}
          {data.fileExt}
        </div>
        <div className="fileSize textSecondary">{fileSize}</div>
      </div>
      {!isMobile && (
        <div className="operateBtns flexRow alignItemsCenter" style={{ marginRight: Math.abs(diffWidth) }}>
          {!showResetOfDeleteBtn ? (
            <Fragment>
              <Dropdown
                trigger={['click']}
                placement="bottomRight"
                open={dropdownVisible}
                onOpenChange={setDropdownVisible}
                menu={{ items: dropdownItems, style: { width: 150 } }}
              >
                <Tooltip title={_l('更多')} placement="bottom">
                  <div className="btnWrap pointer">
                    <Icon className="textTertiary Font17" icon="more_horiz" />
                  </div>
                </Tooltip>
              </Dropdown>
              {!isKc && (
                <ResetNamePopup
                  originalFileName={data.originalFileName}
                  isEdit={isEdit}
                  setIsEdit={setIsEdit}
                  onSave={name => {
                    onResetNameFile(data.fileID, name);
                  }}
                >
                  <div />
                </ResetNamePopup>
              )}
            </Fragment>
          ) : (
            <Fragment>
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
                      <Icon className="textTertiary Font17" icon="rename_input" />
                    </div>
                  </Tooltip>
                </ResetNamePopup>
              )}
              <Tooltip title={_l('删除')} placement="bottom">
                <div className="btnWrap pointer delete" onClick={handleDelete}>
                  <Icon className="textTertiary Font17" icon="trash" />
                </div>
              </Tooltip>
            </Fragment>
          )}
        </div>
      )}
      {isMobile && (
        <Icon
          onClick={() => {
            isKc ? onDeleteKCFile(data) : onDeleteFile(data);
          }}
          className="deleteIcon textTertiary Font19"
          icon="cancel"
        />
      )}
    </div>
  );
};

export default props => {
  const { data, removeUploadingFile, ...otherProps } = props;
  const { isMdFile } = props;

  if (data && typeof data === 'object' && 'progress' in data) {
    const { progress, base } = data;
    return (
      <div className="attachmentSmallCard flexRow alignItemsCenter mobile">
        <div className="fileImageWrap fileImageWrap pointer flexRow alignItemsCenter justifyContentCenter">
          <Progress.Circle
            key="text"
            isAnimation={false}
            isRound={false}
            strokeWidth={3}
            diameter={47}
            foregroundColor="var(--color-text-disabled)"
            backgroundColor="var(--color-background-primary)"
            format={() => ''}
            percent={parseInt(progress)}
          />
        </div>
        <div className="fileContent flex flexColumn justifyContentCenter pointer">
          <div className="fileName textEllipsis">
            {base.fileName}
            {base.fileExt}
          </div>
        </div>
        {_.isFunction(removeUploadingFile) && (
          <Icon onClick={() => removeUploadingFile(data)} className="deleteIcon textTertiary Font19" icon="cancel" />
        )}
      </div>
    );
  }

  return isMdFile ? <SmallCard data={data} {...otherProps} /> : <NotSaveSmallCard data={data} {...otherProps} />;
};
