import React, { Fragment, useState } from 'react';
import { connect } from 'react-redux';
import { bindActionCreators } from 'redux';
import { Dropdown, Menu, Popover } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, RichText } from 'ming-ui';
import DeleteConfirm from 'ming-ui/components/DeleteReconfirm';
import appManagementApi from 'src/api/appManagement';
import SelectIcon from 'worksheet/common/SelectIcon';
import SheetDesc from 'worksheet/common/SheetDesc';
import * as actions from 'worksheet/redux/actions/sheetList';
import { getAppSectionRef } from 'src/pages/PageHeader/AppPkgHeader/LeftAppGroup';

const MenuWrap = styled(Menu)`
  .ant-dropdown-menu-item,
  .ant-dropdown-menu-submenu-title {
    padding: 7px 12px;
  }
  .danger {
    color: #f44336;
  }
`;

const MoreMenu = props => {
  const { base, data, appPkg, isLand } = props;
  const { desc, onChangeDesc } = props;
  const [editNameVisible, setEditNameVisible] = useState(false);
  const [editIntroVisible, setEditIntroVisible] = useState(false);
  const [descIsEditing, setDescIsEditing] = useState(false);
  const [popupVisible, setPopupVisible] = useState(false);
  const { groupId } = base;
  const { id: appId, projectId, isLock } = appPkg;

  const handleDelete = () => {
    setPopupVisible(false);
    DeleteConfirm({
      style: { width: '560px' },
      title: <span className="Bold">{_l('删除对话机器人 “%0”', data.name)}</span>,
      description: (
        <div>
          <span style={{ color: '#151515', fontWeight: 'bold' }}>
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
        desc: value,
      })
      .then(data => {
        if (data) {
          alert(_l('保存成功'));
          onChangeDesc(value);
        }
      });
  };

  return (
    <Fragment>
      {desc && (
        <Popover
          arrowPointAtCenter={true}
          title={null}
          zIndex={2000}
          placement="bottomLeft"
          overlayClassName="sheetDescPopoverOverlay"
          content={
            <div className="popoverContent" style={{ maxHeight: document.body.clientHeight / 2 }}>
              <RichText data={desc || ''} disabled={true} />
            </div>
          }
        >
          <Icon
            icon="info"
            className="Font20 Gray_9e pointer mRight6"
            onClick={() => {
              if (isLand) return;
              setDescIsEditing(false);
              setEditIntroVisible(true);
            }}
          />
        </Popover>
      )}
      {!isLand && (
        <Dropdown
          trigger={['click']}
          visible={popupVisible}
          onVisibleChange={value => setPopupVisible(value)}
          overlay={
            <MenuWrap style={{ width: 200 }}>
              <Menu.Item
                key="edit"
                onClick={() => {
                  setEditNameVisible(true);
                  setPopupVisible(false);
                }}
              >
                <div className="flexRow valignWrapper">
                  <Icon icon="edit" className="Font18 mLeft5 mRight10 Gray_9e" />
                  <div>{_l('修改名称和图标')}</div>
                </div>
              </Menu.Item>
              <Menu.Item
                key="info"
                onClick={() => {
                  setEditIntroVisible(true);
                  setPopupVisible(false);
                }}
              >
                <div className="flexRow valignWrapper">
                  <Icon icon="info" className="Font18 mLeft5 mRight10 Gray_9e" />
                  <div>{_l('说明')}</div>
                </div>
              </Menu.Item>
              {!isLock && (
                <Fragment>
                  <Menu.Divider />
                  <Menu.Item key="delete" className="danger" onClick={handleDelete}>
                    <div className="flexRow valignWrapper">
                      <Icon icon="delete2" className="Font18 mLeft5 mRight10" />
                      <div>{_l('删除')}</div>
                    </div>
                  </Menu.Item>
                </Fragment>
              )}
            </MenuWrap>
          }
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
        isEditing={descIsEditing}
        setDescIsEditing={setDescIsEditing}
        onClose={() => {
          setEditIntroVisible(false);
        }}
        onSave={value => {
          handleSaveDesc(value);
          setEditIntroVisible(false);
        }}
      />
      {editNameVisible && (
        <SelectIcon
          isActive
          style={{ top: 50 }}
          projectId={projectId}
          appId={appId}
          groupId={groupId}
          workSheetId={data.chatbotId}
          appItem={data}
          name={data.name}
          icon={data.icon}
          updateSheetListAppItem={props.updateSheetListAppItem}
          onCancel={() => {
            setEditNameVisible(false);
          }}
        />
      )}
    </Fragment>
  );
};

export default connect(
  state => ({
    base: state.sheet.base,
  }),
  dispatch => bindActionCreators({ ..._.pick(actions, ['deleteSheet', 'updateSheetListAppItem']) }, dispatch),
)(MoreMenu);
