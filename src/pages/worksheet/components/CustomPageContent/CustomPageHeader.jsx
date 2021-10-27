import React, { useState, useRef, Fragment } from 'react';
import { string } from 'prop-types';
import { Tooltip, Icon } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import cx from 'classnames';
import Trigger from 'rc-trigger';
import 'rc-trigger/assets/index.css';
import update from 'immutability-helper';
import { updatePage } from 'src/pages/worksheet/common/Statistics/api/custom';
import { SelectIcon } from '../../common';
import OperateMenu from './OperateMenu';
import PageDesc from './PageDesc';
import { pick } from 'lodash';
import filterXSS from 'xss';

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
    projectId,
    desc,
    ...rest
  } = props;
  const isSafari = () => {
    var ua = window.navigator.userAgent;
    return ua.indexOf('Safari') != -1 && ua.indexOf('Version') != -1;
  };
  const { appId, groupId } = ids;
  const { workSheetId: pageId, workSheetName: name, icon, iconColor } = currentSheet;
  const [visible, updateVisible] = useState({ popupVisible: false, editNameVisible: false, editIntroVisible: false });
  const { popupVisible, editNameVisible, editIntroVisible } = visible;

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
              <span style={{ color: '#f44336' }}>{_l('注意：自定义页面下所有配置和数据将被永久删除，不可恢复。')}</span>
              {_l('请务必确认所有应用成员都不再需要此自定义页面后，再执行此操作。')}
            </div>
          ),
          data: [{ text: _l('我确认永久删除页面和所有数据'), value: 1 }],
          onOk: () => {
            deleteSheet({
              type: 1,
              appId,
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

  return (
    <Fragment>
      <header>
        <div className="nameWrap">
          <Tooltip popupPlacement="bottom" text={<span>{sheetListVisible ? _l('隐藏侧边栏') : _l('展开侧边栏')}</span>}>
            <div className="iconWrap hideSide" onClick={() => updateSheetListIsUnfold(!sheetListVisible)}>
              <i className={cx(sheetListVisible ? 'icon-back-02' : 'icon-next-02')}></i>
            </div>
          </Tooltip>
          <span className="pageName Font17">{name}</span>
          {desc && (
            <Tooltip
              disable={editIntroVisible}
              onClick={() => handleVisibleChange(true, 'editIntroVisible')}
              tooltipClass="sheetDescTooltip"
              popupPlacement="bottom"
              text={<span dangerouslySetInnerHTML={{ __html: filterXSS(desc, { stripIgnoreTag: true }).replace(/\n/g, '<br />') }} />}
            >
              <Icon icon="knowledge-message Font18 Gray_9" className="Hand customPageDesc" />
            </Tooltip>
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
        {!isSafari() && (
          <div className="iconWrap fullScreenIcon" data-tip={_l('全屏展示')} onClick={() => toggle(true)}>
            <i className="icon-full_screen Font20 pointer"></i>
          </div>
        )}
      </header>
      {editIntroVisible && (
        <PageDesc
          desc={desc}
          onOk={value => {
            handleUpdatePage({ desc: value });
            handleVisibleChange(false, 'editIntroVisible');
          }}
          onCancel={() => handleVisibleChange(false, 'editIntroVisible')}
        />
      )}
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
    </Fragment>
  );
}
