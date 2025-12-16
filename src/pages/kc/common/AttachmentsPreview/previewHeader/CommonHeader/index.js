import React, { Fragment, useRef, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import Trigger from 'rc-trigger';
import { Dialog, Icon, Menu, MenuItem, Popup } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import UploadNewVersion from 'src/pages/kc/components/UploadNewVersion.jsx';
import { browserIsMobile } from 'src/utils/common';
import EditableBlock from '../../editableBlock';
import VersionList from '../../versionList';
import './index.less';

// 文件预览&编辑
function AttachmentAction(props) {
  const {
    cauUseWpsPreview,
    userWps,
    showEdit,
    editLoading = false,
    changePreview = () => {},
    clickEdit = () => {},
  } = props;
  const [showSavePreviewService, setShowSavePreviewService] = useState(false);
  const isMobile = browserIsMobile();
  const showWpsPreview = !md.global.Config.IsLocal && cauUseWpsPreview && !md.global.Config.EnableWpsDocPreview;

  return (
    <div className={cx('flexRow flex justifyContentCenter', { mobileAttachmentAction: isMobile })}>
      {showWpsPreview ? (
        <Fragment>
          {!userWps ? (
            <div
              className={cx('setWPSPreview', { centerStyle: !showEdit && !isMobile })}
              onClick={() => changePreview('wps')}
            >
              <span className="bold">{_l('预览失败？使用WPS预览')}</span>
            </div>
          ) : (
            <Trigger
              popupVisible={showSavePreviewService}
              onPopupVisibleChange={visible => setShowSavePreviewService(visible)}
              action={['click']}
              popupAlign={{
                points: ['tl', 'bl'],
                offset: [76, 0],
                overflow: { adjustX: true, adjustY: true },
              }}
              popup={
                <Menu style={{ width: 237 }}>
                  <MenuItem
                    onClick={() => {
                      setShowSavePreviewService(false);
                      changePreview('original');
                    }}
                  >
                    {_l('使用默认方式预览')}
                  </MenuItem>
                </Menu>
              }
            >
              <div className="setWPSPreview usingWPS" onClick={() => setShowSavePreviewService(true)}>
                <span className="bold">{_l('正在使用WPS服务预览')}</span>
                <i className="icon icon-arrow-down White mLeft5"></i>
              </div>
            </Trigger>
          )}
        </Fragment>
      ) : (
        ''
      )}
      {isMobile && showEdit && showWpsPreview && <div className="flex"></div>}
      {/* 编辑 草稿箱内不支持附件在线编辑 */}
      {showEdit && (
        <div
          className={cx('setWPSPreview editFileBtn mLeft10 bold', { centerStyle: !isMobile && !showWpsPreview })}
          onClick={clickEdit}
        >
          <i className="icon icon-hr_edit mRight5 Font18" />
          {editLoading ? _l('请稍等...') : _l('在线编辑')}
        </div>
      )}
    </div>
  );
}

export default function CommonHeader(props) {
  const {
    className,
    editNameInfo = {},
    showKcVersionPanel,
    attachment = {},
    historyPanelInfo = {},
    attachmentActionInfo = {},
    uploadNewVersion = () => {},
    clickShare = () => {},
    addKc,
    canSaveToKnowlege,
    saveToKnowlwdge = () => {},
    showOpenNewPage,
    clickOpenNewPage = () => {},

    showShare,
    showDownload,
    showRefresh,
    clickRefresh = () => {},
    onClose,
    clickDownLoad = () => {},
  } = props;
  const { name, ext, canEditFileName, changeEditName = () => {}, validateFileName = () => {} } = editNameInfo;
  const {
    performRemoveItems,
    downloadAttachment = () => {},
    callback = () => {},
    replaceAttachment = () => {},
  } = historyPanelInfo;
  const { showEdit } = attachmentActionInfo;

  const [showKcVersionList, setShowKcVersionList] = useState(false);
  const [showSaveTo, setShowSaveTo] = useState(false);
  const eleKcVersionList = useRef(null);
  const isMobile = browserIsMobile();

  const handleLogin = () => {
    Dialog.confirm({
      title: _l('保存到'),
      children: <div>{_l('请先登录')}</div>,
      okText: _l('登录'),
      onOk: () => {
        window.location = '/login?ReturnUrl=' + encodeURIComponent(window.location.href);
      },
    });
  };

  return (
    <div
      className={cx('filePreviewHeader previewHeader flexRow Relative', className, {
        isMobile,
        Relative: !showEdit && !isMobile,
        disabledWpsPreview:
          isMobile && ((!attachmentActionInfo.cauUseWpsPreview && !showEdit) || md.global.Config.IsLocal),
      })}
    >
      <div className="flexRow">
        <EditableBlock
          onChange={changeEditName}
          validateFileName={validateFileName}
          ext={'.' + ext}
          className="editName"
          value={name}
          canEdit={canEditFileName}
        />

        {showKcVersionPanel && (
          <div className="historyPanel historyVersion relative">
            <Tooltip title={_l('查看历史版本')}>
              <span className="normal">
                <Icon
                  icon="restore2"
                  className="Hand Font16"
                  ref={eleKcVersionList}
                  onClick={() => setShowKcVersionList(!showKcVersionList)}
                />
              </span>
            </Tooltip>
            {showKcVersionList && (
              <Popup
                withMask
                style={{ left: -36, top: 54 }}
                onClickAwayExceptions={[eleKcVersionList.current]}
                onClickAway={() => setShowKcVersionList(false)}
              >
                <div className="versionListCon">
                  <VersionList
                    attachment={attachment.sourceNode}
                    download={downloadAttachment}
                    callback={item => {
                      callback(item);
                      setShowKcVersionList(false);
                    }}
                    onClose={onClose}
                    performRemoveItems={performRemoveItems}
                    replaceAttachment={replaceAttachment}
                  />
                </div>
              </Popup>
            )}
          </div>
        )}
      </div>
      {!isMobile ? <AttachmentAction {...attachmentActionInfo} /> : <div className="flex"></div>}
      <div className="flexRow btns">
        {showKcVersionPanel && attachment.sourceNode.canEdit && (
          <div className="historyPanel">
            <Tooltip title={_l('上传新版本')}>
              <span className="normal">
                <UploadNewVersion item={attachment.sourceNode} callback={item => uploadNewVersion(item)} />
                <i className="icon-upload_file Hand" onClick={clickShare} />
              </span>
            </Tooltip>
          </div>
        )}
        {addKc && (
          <Trigger
            popupVisible={showSaveTo}
            onPopupVisibleChange={visible => setShowSaveTo(visible)}
            action={['click']}
            popupPlacement="bottom"
            builtinPlacements={{ bottom: { points: ['tc', 'bc'] } }}
            popup={
              <Menu className="selectOptions" width={{ width: 120 }}>
                <MenuItem
                  icon={<Icon icon="attachment" />}
                  onClick={() => {
                    setShowSaveTo(false);
                    if (!md.global.Account || !md.global.Account.accountId) {
                      handleLogin();
                      return;
                    }
                    if (canSaveToKnowlege) {
                      saveToKnowlwdge(1);
                    } else {
                      alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
                    }
                  }}
                >
                  {_l('我的文件')}
                </MenuItem>
                <MenuItem
                  icon={<Icon icon="task-folder-solid" />}
                  onClick={() => {
                    setShowSaveTo(false);
                    if (!md.global.Account || !md.global.Account.accountId) {
                      handleLogin();
                      return;
                    }
                    if (canSaveToKnowlege) {
                      saveToKnowlwdge(2);
                    } else {
                      alert(_l('您权限不足，无法下载或保存。请联系文件夹管理员或文件上传者'), 3);
                    }
                  }}
                >
                  {_l('选择文件夹')}
                </MenuItem>
              </Menu>
            }
            popupAlign={{ offset: [-80, -5] }}
          >
            <div className="saveTo">
              <Tooltip title={_l('添加到知识文件')}>
                <span className="normal">
                  <Icon icon="add-files" className="Hand" onClick={() => setShowSaveTo(!showSaveTo)} />
                </span>
              </Tooltip>
            </div>
          </Trigger>
        )}
        {showOpenNewPage && (
          <div className="openNewPage">
            <Tooltip title={_l('新页面打开')}>
              <span className="normal">
                <i className="icon-launch Font20 Hand" onClick={clickOpenNewPage} />
              </span>
            </Tooltip>
          </div>
        )}
        {showShare && (
          <div className="shareNode">
            <Tooltip title={_l('分享')}>
              <span className="normal">
                <i className="icon-share Hand" onClick={clickShare} />
              </span>
            </Tooltip>
          </div>
        )}
        {showDownload && (
          <Tooltip title={_l('下载')}>
            <div className="download relative Hand" onClick={clickDownLoad}>
              <Icon icon="download" className="valignWrapper mTop1" />
            </div>
          </Tooltip>
        )}
        {showRefresh && (
          <div className="refreshNode" onClick={clickRefresh}>
            <Tooltip title={_l('刷新')}>
              <span className="normal">
                <Icon icon="rotate" className="" />
              </span>
            </Tooltip>
          </div>
        )}
        {onClose && (
          <div
            className="close Hand"
            onClick={evt => {
              evt.nativeEvent.stopImmediatePropagation();
              onClose();
            }}
          >
            <Tooltip title={_l('关闭')}>
              <span className="normal">
                <i className="icon-delete" />
              </span>
            </Tooltip>
          </div>
        )}
      </div>
      {isMobile && !md.global.Config.IsLocal && (attachmentActionInfo.cauUseWpsPreview || showEdit) && (
        <AttachmentAction {...attachmentActionInfo} />
      )}
    </div>
  );
}

CommonHeader.propTypes = {
  className: PropTypes.string,
  editNameInfo: PropTypes.shape({
    name: PropTypes.string,
    ext: PropTypes.string,
    canEditFileName: PropTypes.bool,
    changeEditName: PropTypes.func,
    validateFileName: PropTypes.func,
  }),
  showKcVersionPanel: PropTypes.bool,
  attachment: PropTypes.object,
  historyPanelInfo: PropTypes.shape({
    performRemoveItems: PropTypes.array,
    downloadAttachment: PropTypes.func,
    callback: PropTypes.func,
    replaceAttachment: PropTypes.func,
  }),
  attachmentActionInfo: PropTypes.shape({
    cauUseWpsPreview: PropTypes.bool, //  是否能使用wps预览
    userWps: PropTypes.bool, //使用wps预览
    showEdit: PropTypes.bool, // 是否能在线编辑
    changePreview: PropTypes.func, // 切换预览方式
    clickEdit: PropTypes.func, // 点击在线预览
  }),
  uploadNewVersion: PropTypes.func,
  clickShare: PropTypes.func,
  addKc: PropTypes.bool,
  canSaveToKnowlege: PropTypes.bool,
  saveToKnowlwdge: PropTypes.func,
  showOpenNewPage: PropTypes.bool,
  clickOpenNewPage: PropTypes.func,
  showShare: PropTypes.bool,
  showDownload: PropTypes.bool,
  clickDownLoad: PropTypes.func,
  showRefresh: PropTypes.bool,
  clickRefresh: PropTypes.func,
  onClose: PropTypes.func,
};
