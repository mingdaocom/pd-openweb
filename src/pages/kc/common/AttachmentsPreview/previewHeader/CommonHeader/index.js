import React, { Fragment, useState } from 'react';
import cx from 'classnames';
import PropTypes from 'prop-types';
import { Icon } from 'ming-ui';
import { Dropdown, Modal, Tooltip } from 'ming-ui/antd-components';
import { browserIsMobile } from 'src/utils/platform/browser/device';
import { pathCompletion } from 'src/utils/platform/navigation/path';
import EditableBlock from '../../editableBlock';
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
  const showWpsPreview =
    !window.platformENV.isOverseas &&
    !window.platformENV.isLocal &&
    cauUseWpsPreview &&
    !md.global.Config.EnableWpsDocPreview;

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
            <Dropdown
              open={showSavePreviewService}
              onOpenChange={setShowSavePreviewService}
              trigger={['click']}
              placement="bottom"
              menu={{
                style: { width: 237 },
                items: [
                  {
                    key: 'original',
                    label: _l('使用默认方式预览'),
                    onClick: () => {
                      setShowSavePreviewService(false);
                      changePreview('original');
                    },
                  },
                ],
              }}
            >
              <div className="setWPSPreview usingWPS" onClick={() => setShowSavePreviewService(true)}>
                <span className="bold">{_l('正在使用WPS服务预览')}</span>
                <i className="icon icon-arrow-down textWhite mLeft5"></i>
              </div>
            </Dropdown>
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
    kcVersionPanel,
    attachmentActionInfo = {},
    clickShare = () => {},
    addKc,
    canSaveToKnowlege,
    saveToKnowlwdge = () => {},
    showOpenNewPage,
    clickOpenNewPage = () => {},
    showSwitchHtmlPreview,
    clickSwitchHtmlPreview = () => {},

    showShare,
    showDownload,
    showRefresh,
    clickRefresh = () => {},
    onClose,
    clickDownLoad = () => {},
  } = props;
  const { name, ext, canEditFileName, changeEditName = () => {}, validateFileName = () => {} } = editNameInfo;
  const { showEdit, cauUseWpsPreview } = attachmentActionInfo;

  const [showSaveTo, setShowSaveTo] = useState(false);
  const isMobile = browserIsMobile();
  const showWpsPreview =
    !window.platformENV.isOverseas &&
    !window.platformENV.isLocal &&
    cauUseWpsPreview &&
    !md.global.Config.EnableWpsDocPreview;

  const handleLogin = () => {
    Modal.confirm({
      title: _l('保存到'),
      content: <div>{_l('请先登录')}</div>,
      okText: _l('登录'),
      onOk: () => {
        window.location.href = pathCompletion('/login?ReturnUrl=' + encodeURIComponent(window.location.href));
      },
    });
  };

  return (
    <div
      className={cx('filePreviewHeader previewHeader flexRow Relative', className, {
        isMobile,
        Relative: !showEdit && !isMobile,
        disabledWpsPreview: isMobile && !showWpsPreview && !showEdit,
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
        {kcVersionPanel}
      </div>
      {!isMobile ? <AttachmentAction {...attachmentActionInfo} /> : <div className="flex"></div>}
      <div className="flexRow btns">
        {addKc && (
          <Dropdown
            open={showSaveTo}
            onOpenChange={setShowSaveTo}
            trigger={['click']}
            placement="bottomRight"
            menu={{
              style: { width: 120 },
              items: [
                {
                  key: 'myFiles',
                  icon: <Icon icon="attachment" />,
                  label: _l('我的文件'),
                  onClick: () => {
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
                  },
                },
                {
                  key: 'selectFolder',
                  icon: <Icon icon="task-folder-solid" />,
                  label: _l('选择文件夹'),
                  onClick: () => {
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
                  },
                },
              ],
            }}
          >
            <div className="saveTo">
              <Tooltip title={isMobile ? null : _l('添加到知识文件')}>
                <span className="normal">
                  <Icon icon="add-files" className="Hand" onClick={() => setShowSaveTo(!showSaveTo)} />
                </span>
              </Tooltip>
            </div>
          </Dropdown>
        )}
        {showSwitchHtmlPreview && (
          <div className="switchHtmlPreview">
            <Tooltip title={isMobile ? null : _l('切换显示')}>
              <span className="normal">
                <Icon icon="exchange" className="Hand" onClick={clickSwitchHtmlPreview} />
              </span>
            </Tooltip>
          </div>
        )}
        {showOpenNewPage && (
          <div className="openNewPage">
            <Tooltip title={isMobile ? null : _l('新页面打开')}>
              <span className="normal">
                <i className="icon-launch Font20 Hand" onClick={clickOpenNewPage} />
              </span>
            </Tooltip>
          </div>
        )}
        {showShare && (
          <div className="shareNode">
            <Tooltip title={isMobile ? null : _l('分享')}>
              <span className="normal">
                <i className="icon-share Hand" onClick={clickShare} />
              </span>
            </Tooltip>
          </div>
        )}
        {showDownload && (
          <Tooltip title={isMobile ? null : _l('下载')}>
            <div className="download relative Hand" onClick={clickDownLoad}>
              <Icon icon="download" className="valignWrapper mTop1" />
            </div>
          </Tooltip>
        )}
        {showRefresh && (
          <div className="refreshNode" onClick={clickRefresh}>
            <Tooltip title={isMobile ? null : _l('刷新')}>
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
            <Tooltip title={isMobile ? null : _l('关闭')}>
              <span className="normal">
                <i className="icon-delete" />
              </span>
            </Tooltip>
          </div>
        )}
      </div>
      {isMobile && (showWpsPreview || showEdit) && <AttachmentAction {...attachmentActionInfo} />}
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
  kcVersionPanel: PropTypes.node,
  attachmentActionInfo: PropTypes.shape({
    cauUseWpsPreview: PropTypes.bool, //  是否能使用wps预览
    userWps: PropTypes.bool, //使用wps预览
    showEdit: PropTypes.bool, // 是否能在线编辑
    changePreview: PropTypes.func, // 切换预览方式
    clickEdit: PropTypes.func, // 点击在线预览
  }),
  clickShare: PropTypes.func,
  addKc: PropTypes.bool,
  canSaveToKnowlege: PropTypes.bool,
  saveToKnowlwdge: PropTypes.func,
  showOpenNewPage: PropTypes.bool,
  clickOpenNewPage: PropTypes.func,
  showSwitchHtmlPreview: PropTypes.bool,
  clickSwitchHtmlPreview: PropTypes.func,
  showShare: PropTypes.bool,
  showDownload: PropTypes.bool,
  clickDownLoad: PropTypes.func,
  showRefresh: PropTypes.bool,
  clickRefresh: PropTypes.func,
  onClose: PropTypes.func,
};
