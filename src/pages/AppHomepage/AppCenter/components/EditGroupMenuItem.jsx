import React, { useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Checkbox, Input, Modal } from 'ming-ui/antd-components';
import { PERMISSION_ENUM } from 'src/utils/domain/security/permission';
import { hasPermission } from 'src/utils/services/security/permission';

const EditPanelCon = styled.div`
  .title {
    font-weight: bold;
    margin: 14px 0 4px;
  }
  .groups {
    overflow-y: auto;
    max-height: 400px;
  }
`;
const Header = styled.div`
  display: flex;
  align-items: center;
  height: 40px;
  border-bottom: 1px solid var(--color-border-secondary);
  input {
    margin-left: 6px;
    flex: 1;
  }
`;
const GroupItem = styled.div`
  display: flex;
  align-items: center;
  cursor: pointer;
  padding: 0 4px;
  height: 36px;
  &:hover {
    background: var(--color-background-hover);
  }
`;

const GROUP_CHECKBOX_STYLES = {
  root: { flex: 1, minWidth: 0 },
  label: { display: 'flex', flex: 1, minWidth: 0, paddingInlineStart: 10, paddingInlineEnd: 0 },
};

const Empty = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  flex-direction: column;
  height: 140px;
  margin-bottom: -10px;
`;

function EditPanel(props) {
  const {
    isEmpty,
    hasManageAppAuth,
    personalGroups = [],
    projectGroups = [],
    selectedGroupIds = [],
    onUpdateAppBelongGroups,
    isDashboard,
    projectGroupsLang,
  } = props;
  const [selectedIds, setSelectedIds] = useState(selectedGroupIds);
  const [keywords, setKeywords] = useState('');
  const normalizedKeywords = keywords.trim().toLowerCase();
  const filteredPersonalGroups = personalGroups.filter(
    group => !normalizedKeywords || (group.name || '').toLowerCase().includes(normalizedKeywords),
  );
  const filteredProjectGroups = projectGroups.filter(
    group => !normalizedKeywords || (group.name || '').toLowerCase().includes(normalizedKeywords),
  );

  function renderGroups(group) {
    const checked = _.includes(selectedIds, group.id);
    return (
      <GroupItem
        key={group.id}
        onClick={() => {
          onUpdateAppBelongGroups({
            editingGroup: group,
            isRemove: checked,
          });
          setSelectedIds(sids => (checked ? sids.filter(id => id !== group.id) : _.uniq([...sids, group.id])));
        }}
      >
        <Checkbox checked={checked} styles={GROUP_CHECKBOX_STYLES}>
          <span className="ellipsis flex" title={_.get(projectGroupsLang, `${group.id}.data[0].value`) || group.name}>
            {_.get(projectGroupsLang, `${group.id}.data[0].value`) || group.name}
          </span>
        </Checkbox>
      </GroupItem>
    );
  }

  if (isEmpty) {
    return (
      <EditPanelCon>
        <Empty>
          <Icon icon="folder_off" className="Font26 textTertiary" />
          <div className="Font13 textTertiary mTop12">
            {isDashboard ? _l('无分组') : _l('无分组，可从左侧列表创建')}
          </div>
        </Empty>
      </EditPanelCon>
    );
  }

  return (
    <EditPanelCon>
      <Header className="search">
        <Input
          variant="borderless"
          placeholder={_l('搜索分组')}
          prefix={<Icon icon="search" className="Font18 textTertiary" />}
          value={keywords}
          onChange={e => setKeywords(e.target.value)}
        />
      </Header>
      <div className="groups">
        {!!filteredPersonalGroups.length && (
          <React.Fragment>
            <div className="title">{_l('个人')}</div>
            {filteredPersonalGroups.map(renderGroups)}
          </React.Fragment>
        )}
        {hasManageAppAuth && !!filteredProjectGroups.length && (
          <React.Fragment>
            <div className="title">{_l('组织')}</div>
            {filteredProjectGroups.map(renderGroups)}
          </React.Fragment>
        )}
        {!filteredPersonalGroups.length && !filteredProjectGroups.length && (
          <div className="Font13 textDisabled TxtCenter mTop20 mBottom10">{_l('没有搜索结果')}</div>
        )}
      </div>
    </EditPanelCon>
  );
}

export default function EditGroupModal(props) {
  const { groups = [], myPermissions = [], open, onCancel } = props;
  const personalGroups = groups.filter(g => g.groupType === 0);
  const projectGroups = groups.filter(g => g.groupType === 1);
  const hasManageAppAuth = hasPermission(myPermissions, PERMISSION_ENUM.APP_RESOURCE_SERVICE);
  const isEmpty = !personalGroups.length && (!projectGroups.length || !hasManageAppAuth);

  return (
    <Modal
      open={open}
      title={_l('设置分组%01010')}
      width={480}
      footer={null}
      mask={{ closable: true }}
      keyboard
      onCancel={onCancel}
    >
      <EditPanel
        {...props}
        isEmpty={isEmpty}
        personalGroups={personalGroups}
        projectGroups={projectGroups}
        hasManageAppAuth={hasManageAppAuth}
      />
    </Modal>
  );
}
