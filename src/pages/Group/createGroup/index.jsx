import React, { Fragment, useEffect } from 'react';
import { useSetState } from 'react-use';
import styled from 'styled-components';
import { Avatar, Dialog, Dropdown, Icon, Input, Radio, Switch, Tooltip } from 'ming-ui';
import functionWrap from 'ming-ui/components/FunctionWrap';
import { dialogSelectDept } from 'ming-ui/functions';
import groupAjax from 'src/api/group';
import { checkPermission } from 'src/components/checkPermission';
import { expireDialogAsync } from 'src/components/upgradeVersion';
import { PERMISSION_ENUM } from 'src/pages/Admin/enum';
import { getStringBytes } from 'src/utils/common';
import { getCurrentProject } from 'src/utils/project';
import SelectAvatarTrigger from './SelectAvatarTrigger';

const ContentWrap = styled.div`
  .group {
    margin-bottom: 24px;
    display: flex;
    align-items: center;
    &.flexStart {
      align-items: flex-start;
    }
    .label {
      font-size: 13px;
      color: #151515;
      width: 20%;
      font-weight: 600;
    }
    .content {
      flex: 1;
      width: 80%;
    }
  }
`;

const CreateDialog = styled(Dialog)`
  .mui-dialog-header {
    padding: 24px !important;
  }
`;

const GROUP_TYPES = [
  {
    label: _l('组织群组'),
    value: 0,
  },
  {
    label: _l('个人群组'),
    value: 1,
  },
];

function CreateGroup(props) {
  const { visible, projectId, onClose, callback } = props;
  const currentProject = projectId ? { projectId } : getCurrentProject(localStorage.getItem('currentProjectId'));
  const [
    {
      type,
      name,
      orgId,
      lastOrgId,
      avatar,
      isApproval,
      isOfficial,
      hideOfficial,
      disabledCreate,
      department,
      avatarName,
      createLoading,
    },
    setState,
  ] = useSetState({
    type: 0,
    name: undefined,
    orgId: currentProject.projectId,
    lastOrgId: currentProject.projectId,
    avatar: undefined,
    isApproval: true,
    isOfficial: false,
    hideOfficial: false,
    disabledCreate: false,
    department: undefined,
    avatarName: undefined,
    createLoading: false,
  });

  useEffect(() => {
    checkIsProjectAdmin();
    disableBtn();
  }, [orgId]);

  const disableBtn = () => {
    expireDialogAsync(orgId)
      .then(() => {
        setState({ disabledCreate: false, lastOrgId: orgId });
      })
      .catch(() => {
        setState({ disabledCreate: true, orgId: lastOrgId });
      });
  };

  const checkIsProjectAdmin = () => {
    if (orgId) {
      setState({ hideOfficial: !checkPermission(orgId, PERMISSION_ENUM.GROUP_MANAGE) });
    } else {
      setState({ hideOfficial: true });
    }
  };

  const onCreate = () => {
    if (!name) return alert(_l('群组名称不能为空'), 3);
    if (getStringBytes(name) > 64) return alert(_l('群组名称不能超过64个字符'), 3);

    setState({ createLoading: true });
    groupAjax
      .addGroup({
        groupName: name,
        groupAbout: '',
        groupAvatar: avatarName,
        isApproval,
        projectId: type === 0 ? orgId : '',
        mapDepartmentId: isApproval ? _.get(department, 'departmentId', '') : '',
      })
      .then(res => {
        setState({ createLoading: false });
        if (res) {
          callback && callback(res);
          onClose();
        } else {
          alert(_l('创建失败'), 2);
        }
      })
      .catch(err => {
        setState({ createLoading: false });
      });
  };

  const onSelectDept = () => {
    if (!orgId) return;

    dialogSelectDept({
      projectId: orgId,
      unique: true,
      selectFn: data => setState({ department: data[0] }),
    });
  };

  const renderOther = () => {
    return (
      <Fragment>
        <div className="mBottom24">
          <Switch checked={isApproval} onClick={() => setState({ isApproval: !isApproval })} size="small" />
          <span className="Font13 Gray_15 mLeft8">{_l('新成员加入需要管理员验证')}</span>
          <Tooltip text={_l('仅对主动申请加入和通过链接邀请的用户生效')}>
            <Icon icon="info_outline" className="mLeft4 Gray_bd Font16" />
          </Tooltip>
        </div>
        {type === 0 && !hideOfficial && (
          <div>
            <Switch checked={isOfficial} onClick={() => setState({ isOfficial: !isOfficial })} size="small" />
            <span className="Font13 Gray_15 mLeft8">{_l('设为官方群组')}</span>
            <span className="ThemeColor mLeft8 Hand" onClick={onSelectDept}>
              {_.isEmpty(department) ? _l('选择关联部门') : _l('关联部门：%0', department.departmentName)}
            </span>
          </div>
        )}
      </Fragment>
    );
  };

  const renderAvatar = () => {
    return (
      <div>
        <Avatar
          size={40}
          shape="circle"
          src={
            avatar ||
            `${md.global.FileStoreConfig.pictureHost.replace(/\/$/, '')}/GroupAvatar/default.png?imageView2/1/w/100/h/100/q/90`
          }
        />
        <SelectAvatarTrigger onChange={value => setState(value)}>
          <span className="ThemeColor mLeft12 Hand">{_l('修改')}</span>
        </SelectAvatarTrigger>
      </div>
    );
  };

  const renderOrg = () => {
    const projects = _.get(md, 'global.Account.projects', []).map(l => ({ value: l.projectId, text: l.companyName }));

    return (
      <Dropdown
        border
        isAppendToBody
        className="w100"
        value={orgId}
        data={projects}
        onChange={val => orgId !== val && setState({ orgId: val, department: undefined })}
      />
    );
  };

  const renderGroupType = () => {
    return (
      <Fragment>
        {GROUP_TYPES.map(l => (
          <Radio
            text={l.label}
            value={l.value}
            checked={type === l.value}
            onClick={() => setState({ type: l.value })}
          />
        ))}
      </Fragment>
    );
  };

  if (disabledCreate) {
    return null;
  }

  return (
    <CreateDialog
      visible={visible}
      width={540}
      title={_l('创建群组')}
      okDisabled={(type === 0 && disabledCreate) || createLoading}
      onOk={onCreate}
      onCancel={onClose}
    >
      <ContentWrap>
        <div className="group">
          <div className="label">{_l('群类型')}</div>
          <div className="content">{renderGroupType()}</div>
        </div>
        {type === 0 && (
          <div className="group">
            <div className="label">{_l('所属组织')}</div>
            <div className="content">{renderOrg()}</div>
          </div>
        )}
        <div className="group">
          <div className="label">{_l('群名称')}</div>
          <div className="content">
            <Input
              className="w100"
              value={name}
              onChange={value => setState({ name: value })}
              placeholder={_l('群名称（必填）')}
            />
          </div>
        </div>
        <div className="group">
          <div className="label">{_l('群头像')}</div>
          <div className="content">{renderAvatar()}</div>
        </div>
        <div className="group flexStart">
          <div className="label">{_l('其他')}</div>
          <div className="content">{renderOther()}</div>
        </div>
      </ContentWrap>
    </CreateDialog>
  );
}

export default function createGroup(props) {
  functionWrap(CreateGroup, props);
}
