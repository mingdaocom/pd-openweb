import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import _ from 'lodash';
import { Icon, RichText } from 'ming-ui';
import { DeleteReconfirm as DeleteConfirm, Dropdown, Popover } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import SheetDesc from 'worksheet/common/SheetDesc';
import selectIconDialog from 'worksheet/components/selectIconDialog';
import * as actions from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';

export const MoreMenu = props => {
  const { base, data, appPkg, isCharge, isLand } = props;
  const { desc, remark, onChangeDesc } = props;
  const [editIntroVisible, setEditIntroVisible] = useState(false);
  const [descIsEditing, setDescIsEditing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const { groupId } = base;
  const { id: appId, projectId, isLock } = appPkg;

  const handleDelete = () => {
    setPopupVisible(false);
    DeleteConfirm({
      style: { width: 560 },
      title: _l('删除对话机器人 “%0”', data.name),
      description: (
        <div>
          <span style={{ color: 'var(--color-text-title)', fontWeight: 'bold' }}>
            {_l('注意：对话机器人下所有配置和数据将被删除。')}
          </span>
          {_l('请务必确认所有应用成员都不再需要此对话机器人后，再执行此操作。')}
        </div>
      ),
      data: [{ text: _l('我确认删除对话机器人和所有数据'), value: 1 }],
      onOk: () => {
        const { currentPcNaviStyle } = appPkg;
        const param = {
          type: 1,
          appId,
          projectId,
          groupId,
          worksheetId: data.chatbotId,
          parentGroupId: data.parentGroupId,
        };

        if ([1, 3].includes(currentPcNaviStyle)) {
          const singleRef = getAppSectionRef(groupId);
          singleRef.dispatch(actions.deleteSheet(param));
        } else {
          props.deleteSheet(param);
        }
      },
    });
  };

  const handleSaveDesc = value => {
    appManagementApi
      .updateChatBotDesc({
        appId,
        id: data.chatbotId,
        ...value,
      })
      .then(data => {
        if (data) {
          alert(_l('保存成功'));
          onChangeDesc(value);
        }
      });
  };

  const menuItems = [
    isCharge && {
      key: 'edit',
      icon: <Icon icon="edit" className="Font18 textTertiary" />,
      label: _l('修改名称和图标'),
      onClick: () => {
        setPopupVisible(false);
        selectIconDialog({
          isActive: true,
          style: { top: 50 },
          projectId: projectId,
          appId: appId,
          groupId: groupId,
          workSheetId: data.chatbotId,
          appItem: data,
          name: data.name,
          icon: data.icon,
          updateSheetListAppItem: props.updateSheetListAppItem,
        });
      },
    },
    {
      key: 'info',
      icon: <Icon icon="info" className="Font18 textTertiary" />,
      label: _l('对话机器人说明'),
      onClick: () => {
        setEditIntroVisible(true);
        setPopupVisible(false);
      },
    },
    isCharge &&
      !isLock && {
        key: 'divider',
        type: 'divider',
      },
    isCharge &&
      !isLock && {
        key: 'delete',
        danger: true,
        icon: <Icon icon="delete2" className="Font18" />,
        label: _l('删除'),
        onClick: handleDelete,
      },
  ].filter(Boolean);

  return (
    <Fragment>
      {desc && (
        <Popover
          arrow={{ pointAtCenter: true }}
          title={null}
          placement="bottomLeft"
          classNames={{ root: 'sheetDescPopoverOverlay' }}
          content={
            <div className="popoverContent" style={{ maxHeight: document.body.clientHeight / 2 }}>
              <RichText data={desc || ''} disabled={true} />
            </div>
          }
        >
          <Icon
            icon="info"
            className="Font20 textTertiary pointer mRight6"
            onClick={() => {
              if (isLand) return;
              setDescIsEditing(false);
              setEditIntroVisible(true);
            }}
          />
        </Popover>
      )}
      {!isLand && isCharge && (
        <Dropdown
          trigger={['click']}
          open={popupVisible}
          onOpenChange={setPopupVisible}
          menu={{ items: menuItems, style: { minWidth: 200 } }}
        >
          {props.children}
        </Dropdown>
      )}
      <SheetDesc
        title={_l('对话机器人说明')}
        permissionType={appPkg.permissionType}
        cacheKey="chatbotIntroDescription"
        visible={editIntroVisible}
        desc={desc}
        remark={remark}
        isEditing={descIsEditing}
        setDescIsEditing={setDescIsEditing}
        onClose={() => {
          setEditIntroVisible(false);
        }}
        onSave={({ desc, remark }) => {
          handleSaveDesc({ desc, remark });
          setEditIntroVisible(false);
        }}
      />
    </Fragment>
  );
};

export default connect(
  state => ({
    base: state.sheet.base,
  }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['deleteSheet', 'updateSheetListAppItem']) }, dispatch),
)(MoreMenu);
