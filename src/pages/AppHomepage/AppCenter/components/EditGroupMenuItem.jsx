import React, { useState, useRef } from 'react';
import Trigger from 'rc-trigger';
import { MenuItem, Icon, Checkbox } from 'ming-ui';
import styled from 'styled-components';
import { VerticalMiddle, FlexCenter } from 'worksheet/components/Basics';
import _ from 'lodash';

const Con = styled(MenuItem)`
  .Item-content {
    overflow: visible !important;
  }
`;
const EditPanelCon = styled.div`
  width: 240px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.24);
  padding-top: 2px;
  .title {
    font-weight: bold;
    margin: 14px 0 4px 20px;
  }
  .groups {
    overflow-y: auto;
    max-height: 400px;
    padding-bottom: 10px;
  }
`;
const Header = styled(VerticalMiddle)`
  height: 40px;
  padding: 0 20px;
  border-bottom: 1px solid #eaeaea;
  input {
    border: none;
    margin-left: 6px;
    flex: 1;
  }
`;
const GroupItem = styled(VerticalMiddle)`
  cursor: pointer;
  padding: 0 20px;
  height: 36px;
  &:hover {
    background: #fafafa;
  }
`;

const Empty = styled(FlexCenter)`
  flex-direction: column;
  height: 140px;
  margin-bottom: -10px;
`;

function EditPanel(props) {
  const {
    isEmpty,
    isAdmin,
    personalGroups = [],
    projectGroups = [],
    selectedGroupIds = [],
    onUpdateAppBelongGroups,
  } = props;
  const [selectedIds, setSelectedIds] = useState(selectedGroupIds);
  const [keywords, setKeywords] = useState();
  function renderGroups(group, i) {
    const checked = _.includes(selectedIds, group.id);
    return (
      <GroupItem
        key={i}
        onClick={() => {
          onUpdateAppBelongGroups({
            editingGroup: group,
            isRemove: checked,
          });
          setSelectedIds(sids => (checked ? sids.filter(id => id !== group.id) : _.uniq([...sids, group.id])));
        }}
      >
        <Checkbox checked={checked} />
        <span className="mLeft2 ellipsis flex" title={group.name}>
          {group.name}
        </span>
      </GroupItem>
    );
  }
  if (isEmpty) {
    return (
      <EditPanelCon>
        <Empty>
          <i className="icon icon-folder_off Font26 Gray_9e"></i>
          <div className="Font13 Gray_9e mTop12">{_l('无分组，可从左侧列表创建')}</div>
        </Empty>
      </EditPanelCon>
    );
  }
  return (
    <EditPanelCon>
      <Header className="search">
        <i className="icon icon-search Font18 Gray_9d"></i>
        <input type="text" placeholder={'搜索分组'} value={keywords} onChange={e => setKeywords(e.target.value)} />
      </Header>
      <div className="groups">
        {!!personalGroups.length && (
          <React.Fragment>
            <div className="title">{_l('个人')}</div>
            {personalGroups.map(renderGroups)}
          </React.Fragment>
        )}
        {isAdmin && !!projectGroups.length && (
          <React.Fragment>
            <div className="title">{_l('组织')}</div>
            {projectGroups.map(renderGroups)}
          </React.Fragment>
        )}
      </div>
    </EditPanelCon>
  );
}

export default function EditGroupMenuItem(props) {
  const { keywords, isAdmin, groups = [] } = props;
  const itemRef = useRef();
  const personalGroups = groups.filter(
    g => g.groupType === 0 && (!keywords || new RegExp(keywords.toUpperCase()).test(g.name)),
  );
  const projectGroups = groups.filter(
    g => g.groupType === 1 && (!keywords || new RegExp(keywords.toUpperCase()).test(g.name)),
  );
  const isEmpty = !personalGroups.length && (!projectGroups.length || !isAdmin);
  return (
    <Trigger
      action={['hover']}
      popupAlign={{
        points: ['tl', 'tr'],
        offset: [2, isEmpty ? 0 : -78],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={<EditPanel {...props} isEmpty={isEmpty} personalGroups={personalGroups} projectGroups={projectGroups} />}
      getPopupContainer={() => itemRef.current}
      destroyPopupOnHide
    >
      <div ref={itemRef}>
        <Con icon={<Icon className="operationIcon" icon={'addto-folder'} />}>
          {_l('设置分组')}
          <i className="icon icon-arrow-right-tip Right mTop11"></i>
        </Con>
      </div>
    </Trigger>
  );
}
