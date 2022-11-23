import React, { useState, useRef, Fragment } from 'react';
import { string } from 'prop-types';
import { Tooltip, Icon, LoadDiv, RichText } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import update from 'immutability-helper';
import { updatePage } from 'statistics/api/custom';
import { Popover } from 'antd';
import { SelectIcon } from '../../common';
import OperateMenu from './OperateMenu';
import SheetDesc from 'worksheet/common/SheetDesc';
import Share from 'src/pages/worksheet/components/Share';
import { pick } from 'lodash';
import { createFontLink, exportImage } from 'src/pages/customPage/util';
import { saveAs } from 'file-saver';
import SvgIcon from 'src/components/SvgIcon';

export default function CustomPageHeader(props) {
  const {
    isCharge,
    currentSheet,
    updateEditPageVisible,
    updatePageInfo,
    ids,
    updateSheetListIsUnfold,
    deleteSheet,
    copyCustomPage,
    toggle,
    sheetListVisible,
    pageName,
    apk,
    desc,
    ...rest
  } = props;
  const isSafari = () => {
    var ua = window.navigator.userAgent;
    return ua.indexOf('Safari') != -1 && ua.indexOf('Version') != -1;
  };
  const { appId, groupId } = ids;
  const { projectId, appName } = apk;
  const { workSheetId: pageId, icon, iconColor, workSheetName } = currentSheet;
  const [visible, updateVisible] = useState({ popupVisible: false, editNameVisible: false, editIntroVisible: false });
  const { popupVisible, editNameVisible, editIntroVisible } = visible;
  const name = pageName !== workSheetName ? workSheetName || pageName : pageName || workSheetName;

  const [shareDialogVisible, setShareDialogVisible] = useState(false);
  const [exportLoading, setExportLoading] = useState(false);
  const [descIsEditing, setDescIsEditing] = useState(false);
  const saveImage = () => {
    const imageName = `${appName ? `${appName}_` : ''}${name}_${moment().format('_YYYYMMDDHHmmSS')}.png`;
    setExportLoading(true);
    createFontLink()
      .then(exportImage)
      .then(blob => {
        setExportLoading(false);
        saveAs(blob, imageName);
      });
  };

  const handleUpdatePage = obj => {
    updatePage({ appId: pageId, ...obj }).then(isSuccess => {
      if (isSuccess) {
        updatePageInfo(obj);
      } else {
        alert(_l('修改失败'));
      }
    });
  };

  const handleClick = (type, data) => {
    switch (type) {
      case 'editPage':
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        updatePageInfo({ components: [], pageId, pageName: name });
        updateEditPageVisible(true);
        break;
      case 'editName':
      case 'editIntro':
        setDescIsEditing(true);
        updateVisible(update(visible, { [`${type}Visible`]: { $set: true }, popupVisible: { $set: false } }));
        break;
      case 'adjustScreen':
        handleUpdatePage(data);
        break;
      case 'copy':
        copyCustomPage({
          appId,
          appSectionId: groupId,
          id: pageId,
          name: _l('%0-复制', name),
          iconColor: currentSheet.iconColor,
          iconUrl: currentSheet.iconUrl,
        });
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
      case 'move':
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
      case 'delete':
        DeleteConfirm({
          style: { width: '560px' },
          title: <span className="Bold">{_l('删除自定义页面 “%0”', name)}</span>,
          description: (
            <div>
              <span style={{ color: '#f44336' }}>{_l('注意：自定义页面下所有配置和数据将被删除。')}</span>
              {_l('请务必确认所有应用成员都不再需要此自定义页面后，再执行此操作。')}
            </div>
          ),
          data: [{ text: _l('我确认删除页面和所有数据'), value: 1 }],
          onOk: () => {
            deleteSheet({
              type: 1,
              appId,
              projectId,
              groupId,
              worksheetId: pageId,
            });
          },
        });
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
      default:
        updateVisible(update(visible, { popupVisible: { $set: false } }));
        break;
    }
  };
  const handleVisibleChange = (value, type) => {
    updateVisible(update(visible, { [type]: { $set: value } }));
  };
  const isPublicShare = location.href.includes('public/page');
  const isEmbedPage = location.href.includes('embed/page');
  const isEmbed = location.href.includes('#embed');

  return (
    <Fragment>
      <header className={cx({ embedPageHeader: isEmbed || isEmbedPage })}>
        <div className="nameWrap flex">
          {!isPublicShare && !isEmbedPage && (
            <Tooltip
              popupPlacement="bottom"
              text={<span>{sheetListVisible ? _l('隐藏侧边栏') : _l('展开侧边栏')}</span>}
            >
              <div className="iconWrap hideSide" onClick={() => updateSheetListIsUnfold(!sheetListVisible)}>
                <i className={cx(sheetListVisible ? 'icon-back-02' : 'icon-next-02')}></i>
              </div>
            </Tooltip>
          )}
          {isPublicShare ? (
            <div className="valignWrapper mLeft10 w100">
              <div className="svgWrap valignWrapper" style={{ backgroundColor: apk.iconColor }}>
                <SvgIcon url={apk.iconUrl} fill="#fff" size={22} />
              </div>
              <span className="pageName Font17 ellipsis">
                {appName}-{name}
              </span>
            </div>
          ) : (
            <span className="pageName Font17">{name}</span>
          )}
          {desc && !isPublicShare && (
            <Popover
              arrowPointAtCenter={true}
              title={null}
              placement="bottomLeft"
              overlayClassName="sheetDescPopoverOverlay"
              content={
                <div className="popoverContent">
                  <RichText data={desc || ''} disabled={true} />
                </div>
              }
            >
              <Icon
                icon="knowledge-message Font18 Gray_9"
                className="Hand customPageDesc"
                onClick={() => {
                  setDescIsEditing(false);
                  handleVisibleChange(true, 'editIntroVisible');
                }}
              />
            </Popover>
          )}
          {isCharge && (
            <Trigger
              onPopupVisibleChange={value => handleVisibleChange(value, 'popupVisible')}
              popupVisible={popupVisible}
              action={['click']}
              popupAlign={{ points: ['tl', 'bl'] }}
              popup={<OperateMenu {...pick(props, ['adjustScreen', 'ids', 'currentSheet'])} onClick={handleClick} />}
            >
              <i className="icon-more_horiz Font18 moreOperateIcon"></i>
            </Trigger>
          )}
        </div>
        {!isPublicShare && !isEmbedPage && apk.appId && !md.global.Account.isPortal && (
          <Tooltip text={<span>{_l('分享')}</span>} popupPlacement="bottom">
            <div
              className="iconWrap valignWrapper mLeft20"
              onClick={() => {
                setShareDialogVisible(true);
              }}
            >
              <i className="icon-share Font20 pointer"></i>
            </div>
          </Tooltip>
        )}
        {exportLoading ? (
          <div className="iconWrap valignWrapper mLeft20">
            <LoadDiv size="small" />
          </div>
        ) : (
          <Tooltip text={<span>{_l('保存图片')}</span>} popupPlacement="bottom">
            <div className="iconWrap valignWrapper mLeft20" onClick={saveImage}>
              <i className="icon-file_download Font20 pointer"></i>
            </div>
          </Tooltip>
        )}
        {!isSafari() && !isPublicShare && (
          <Tooltip text={<span>{_l('全屏展示')}</span>} popupPlacement="bottom">
            <div className="iconWrap valignWrapper mLeft20" onClick={() => toggle(true)}>
              <i className="icon-full_screen Font20 pointer"></i>
            </div>
          </Tooltip>
        )}
      </header>
      <SheetDesc
        title={_l('自定义页面说明')}
        isCharge={isCharge}
        visible={editIntroVisible}
        desc={desc || ''}
        isEditing={descIsEditing}
        onClose={() => {
          handleVisibleChange(false, 'editIntroVisible');
        }}
        onSave={value => {
          handleUpdatePage({ desc: value });
          handleVisibleChange(false, 'editIntroVisible');
        }}
      />
      {editNameVisible && (
        <SelectIcon
          {...rest}
          {...ids}
          isActive
          projectId={projectId}
          name={name}
          icon={icon}
          iconColor={iconColor}
          workSheetId={pageId}
          onCancel={() => {
            handleVisibleChange(false, 'editNameVisible');
          }}
        />
      )}
      {shareDialogVisible && (
        <Share
          title={_l('分享页面: %0', name)}
          from="customPage"
          isCharge={isCharge}
          params={{
            appId,
            sourceId: pageId,
            worksheetId: pageId,
            title: name,
          }}
          getCopyContent={(type, url) =>
            type === 'private' ? url : `${url} ${apk.appName}-${currentSheet.workSheetName}`
          }
          onClose={() => setShareDialogVisible(false)}
        />
      )}
    </Fragment>
  );
}
