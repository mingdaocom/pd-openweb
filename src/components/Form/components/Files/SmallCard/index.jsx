import React, { Fragment, useState, useEffect, useRef } from 'react';
import cx from 'classnames';
import { Tooltip } from 'antd';
import { Icon, Progress, Menu, MenuItem } from 'ming-ui';
import { handleShare, handleSaveKcCloud, handleDownload, loadImage } from '../utils';
import ResetNamePopup from '../ResetNamePopup';
import Trigger from 'rc-trigger';
import './index.less';

const SmallCard = props => {
  const { data, isMobile, isDeleteFile, wpsEditUrl, allowEditName, recordId, controlId, masterData, isSubListFile } =
    props;
  const { allowShare, allowDownload, onDeleteMDFile, onOpenControlAttachmentInNewTab, onMDPreview, onAttachmentName } =
    props;
  const { isKc, browse, fileClassName, fileSize, isMore, isDownload } = props;
  const previewUrl = data.previewUrl.replace(/imageView2\/\d\/w\/\d+\/h\/\d+(\/q\/\d+)?/, `imageView2/1/w/200/h/140`);
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

  useEffect(() => {
    const current = _.get(ref, 'current');
    if (isPicture) {
      loadImage(previewUrl)
        .then()
        .catch(error => {
          setIsPicture(false);
        });
    }
  }, []);

  useEffect(() => {
    const current = _.get(ref, 'current');
    current && setFileSizeVisible(_.get(current, 'clientHeight') < 20);
  }, [data.originalFilename]);

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
          icon={<Icon icon="new_mail" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            window.open(wpsEditUrl);
            setDropdownVisible(false);
          }}
        >
          {_l('在线编辑')}
        </MenuItem>
      )}
      {allowDownload && (
        <MenuItem
          key="download"
          icon={<Icon icon="download" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            handleDownload(data, isDownload, {
              controlId: isSubListFile ? _.get(masterData, 'controlId') : controlId,
              rowId: recordId,
              parentWorksheetId: _.get(masterData, 'worksheetId'),
              parentRowId: _.get(masterData, 'recordId'),
            });
          }}
        >
          {_l('下载')}
        </MenuItem>
      )}
      {isDeleteFile && (
        <MenuItem
          key="delete"
          icon={<Icon icon="task-new-delete" className="Font17 pRight5" />}
          onClick={e => {
            e.stopPropagation();
            setDeleteConfirmVisible(true);
          }}
        >
          {_l('删除')}
        </MenuItem>
      )}
      {(allowReset || allowShare) && <div className="hr-line" />}
      {allowReset && (
        <MenuItem
          key="rename_input"
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

  const handlePreview = e => {
    e.stopPropagation();
    browse ? onMDPreview(data) : alert(_l('您权限不足，无法预览，请联系管理员或文件上传者'), 3);
  };

  return (
    <div
      className={cx('attachmentSmallCard flexRow alignItemsCenter', {
        mobile: isMobile,
        hover: dropdownVisible || isEdit,
        mRight10: isDeleteFile && isMobile,
      })}
      ref={wrapRef}
      onMouseEnter={() => {
        const current = _.get(wrapRef, 'current.parentNode.parentNode');
        if (current) {
          const diffWidth = current.clientWidth - 300;
          if (diffWidth < 0) {
            setDiffWidth(diffWidth + -10);
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
        <div className={cx('fileSize Gray_75', { hide: !fileSizeVisible })}>{fileSize}</div>
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
                        <Icon className="Gray_9e Font17" icon="download" />
                      </div>
                    </Tooltip>
                  )}
                  {isDeleteFile && (
                    <Tooltip title={_l('删除')} placement="bottom">
                      <div className="btnWrap pointer delete" onClick={() => setDeleteConfirmVisible(true)}>
                        <Icon className="Gray_9e Font17" icon="task-new-delete" />
                      </div>
                    </Tooltip>
                  )}
                </Fragment>
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
                      <Icon className="Gray_9e Font17" icon="task-point-more" />
                    </div>
                  </Tooltip>
                </Trigger>
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
        isDeleteFile && (
          <Icon
            onClick={() => onDeleteMDFile(data)}
            className="deleteIcon Gray_9e Font19"
            icon="closeelement-bg-circle"
          />
        )
      )}
    </div>
  );
};

const NotSaveSmallCard = props => {
  const { data, isMobile } = props;
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
    <div className={cx('attachmentSmallCard flexRow alignItemsCenter', { mobile: isMobile, hover: isEdit })}>
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
        <div className="fileSize Gray_75">{fileSize}</div>
      </div>
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
                  <Icon className="Gray_9e Font17" icon="rename_input" />
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
              <Icon className="Gray_9e Font17" icon="task-new-delete" />
            </div>
          </Tooltip>
        </div>
      )}
      {isMobile && (
        <Icon
          onClick={() => {
            isKc ? onDeleteKCFile(data) : onDeleteFile(data);
          }}
          className="deleteIcon Gray_9e Font19"
          icon="closeelement-bg-circle"
        />
      )}
    </div>
  );
};

export default props => {
  const { data, removeUploadingFile, ...otherProps } = props;
  const { isMdFile } = props;

  if ('progress' in data) {
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
            foregroundColor="#BDBDBD"
            backgroundColor="#fff"
            format={percent => ''}
            percent={parseInt(progress)}
          />
        </div>
        <div className="fileContent flex flexColumn justifyContentCenter pointer">
          <div className="fileName textEllipsis">
            {base.fileName}
            {base.fileExt}
          </div>
        </div>
        <Icon
          onClick={() => removeUploadingFile(data)}
          className="deleteIcon Gray_9e Font19"
          icon="closeelement-bg-circle"
        />
      </div>
    );
  }

  return isMdFile ? <SmallCard data={data} {...otherProps} /> : <NotSaveSmallCard data={data} {...otherProps} />;
};
