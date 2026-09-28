import React, { useEffect, useMemo, useState } from 'react';
import { Icon, LoadDiv } from 'ming-ui';
import projectSettingController from 'src/api/projectSetting';
import { alertIfNotUnauthorized } from 'src/utils/services/request/error';
import PermissionList from './createEditRole/PermissionList';
import RoleDrawer from './RoleDrawer';
import { hasPermissionEditChanged } from './utils';

const PERSISTED_FEATURE_KEYS = [
  'onlyManagerCreateApp',
  'onlyManagerDeleteApp',
  'apiIntgOnlyManager',
  'pluginsOnlyManager',
  'dataPipeOnlyManager',
  'mingoAppBuild',
  'mingoDataQueryAndAnalysis',
  'mingoAppOthers',
  'superSearchOnlyManager',
];

const createLeafPermission = (permissionId, permissionName, options = {}) => ({
  permissionId,
  permissionName,
  subPermission: [],
  ...options,
});

const getFeaturePermissions = () => {
  const appPermissions = [
    createLeafPermission('onlyManagerCreateApp', _l('创建应用'), { visible: window.platformENV.isPlatform }),
    createLeafPermission('onlyManagerDeleteApp', _l('删除应用'), { visible: true }),
    createLeafPermission('apiIntgOnlyManager', _l('创建 API 连接'), {
      visible: !md.global.SysSettings.hideIntegration,
    }),
    createLeafPermission('pluginsOnlyManager', _l('创建插件'), { visible: !md.global.SysSettings.hidePlugin }),
    // 创建同步任务权限改由组织角色的 CREATE_SYNC_TASK_FEATURE / CREATE_SYNC_TASK 控制，暂不在全员默认功能中展示。
    // createLeafPermission('dataPipeOnlyManager', _l('创建同步任务'), {
    //   visible: !md.global.SysSettings.hideIntegration,
    // }),
  ].filter(item => item.visible);

  const permissions = [
    { permissionId: 'appDevelopment', permissionName: _l('应用开发'), subPermission: appPermissions },
    !md.global.SysSettings.hideAIBasicFun && {
      permissionId: 'mingoAI',
      permissionName: _l('Mingo AI 功能'),
      subPermission: [
        createLeafPermission('mingoAppBuild', _l('应用规划与搭建')),
        createLeafPermission('mingoDataQueryAndAnalysis', _l('数据查询')),
        createLeafPermission('mingoAppOthers', _l('其他应用辅助功能'), {
          description: _l(
            '除应用规划与搭建、数据查询外的其他 Mingo AI 辅助功能，包含：创建工作表、创建记录、优化名称和图标、生成示例数据等。',
          ),
        }),
      ],
    },
    {
      permissionId: 'other',
      permissionName: _l('其他'),
      subPermission: [createLeafPermission('superSearchOnlyManager', _l('超级搜索（搜索记录）'))],
    },
  ].filter(Boolean);

  return permissions.filter(item => item.subPermission.length);
};

const getInitialSelectedIds = (permissions, data) => {
  const selectedIds = [];

  permissions.forEach(permission => {
    permission.subPermission.forEach(item => {
      if (!data[item.permissionId]) {
        selectedIds.push(item.permissionId);
      }
    });

    if (permission.subPermission.every(item => selectedIds.includes(item.permissionId))) {
      selectedIds.push(permission.permissionId);
    }
  });

  return selectedIds;
};

export default function DefaultFeatureDrawer(props) {
  const { projectId, onClose } = props;
  const permissions = useMemo(() => getFeaturePermissions(), []);
  const [selectedIds, setSelectedIds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [initialValue, setInitialValue] = useState();

  useEffect(() => {
    let cancelled = false;

    projectSettingController.getOnlyManagerSettings({ projectId }).then(data => {
      if (cancelled) return;

      const initialSelectedIds = getInitialSelectedIds(permissions, data || {});

      setSelectedIds(initialSelectedIds);
      setInitialValue({ selectedIds: initialSelectedIds });
      setLoading(false);
    });

    return () => {
      cancelled = true;
    };
  }, [permissions, projectId]);

  const hasUnsavedChanges = hasPermissionEditChanged(initialValue, { selectedIds });

  const onSave = async () => {
    const visibleFeatureKeys = permissions
      .flatMap(item => item.subPermission.map(permission => permission.permissionId))
      .filter(key => PERSISTED_FEATURE_KEYS.includes(key));
    const settings = visibleFeatureKeys.reduce((result, key) => ({ ...result, [key]: !selectedIds.includes(key) }), {});

    setSaving(true);

    try {
      const result = await projectSettingController.setOnlyManager({ projectId, ...settings });

      if (!result) {
        alert(_l('设置失败'), 2);
        return;
      }

      alert(_l('设置成功'));
      onClose();
    } catch (_requestError) {
      alertIfNotUnauthorized(_requestError, _l('设置失败'), 2);
    } finally {
      setSaving(false);
    }
  };

  return (
    <RoleDrawer
      open
      width={600}
      mask={{ closable: !hasUnsavedChanges }}
      title={_l('全员默认功能')}
      extra={<Icon icon="close" className="Font20 textTertiary Hand" onClick={onClose} />}
      okText={_l('确定')}
      okLoading={saving}
      okDisabled={loading}
      onOk={onSave}
      onClose={onClose}
    >
      {loading && <LoadDiv />}
      {!loading && (
        <PermissionList
          projectId={projectId}
          permissions={permissions}
          selectedIds={selectedIds}
          onChangePermission={setSelectedIds}
        />
      )}
    </RoleDrawer>
  );
}
