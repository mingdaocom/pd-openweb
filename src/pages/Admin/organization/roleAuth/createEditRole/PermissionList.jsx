import React, { useState } from 'react';
import { Tooltip } from 'antd';
import cx from 'classnames';
import styled from 'styled-components';
import { Checkbox, Icon } from 'ming-ui';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/enum';
import { getFeatureStatus } from 'src/utils/project';

const PermissionListWrapper = styled.div`
  .Checkbox {
    span {
      font-size: 14px !important;
    }
    &.rootCheckbox {
      span {
        font-weight: bold;
        font-size: 15px !important;
      }
    }
  }

  .marginLeft22 {
    margin-left: 22px;
  }
  .needLefMove {
    margin-left: -22px;
  }
  .divider {
    height: 1px;
    background: #eaeaea;
    margin: 16px 0;
  }
`;

export default function PermissionList(props) {
  const { permissions, selectedIds = [], onChangePermission, canEdit = true, projectId } = props;
  const [foldedId, setFoldedId] = useState([]);

  const getAllChildIds = permission => {
    const subPermissions = permission.subPermission || [];

    if (!subPermissions.length) {
      return [];
    }

    const childIds = subPermissions.map(sub => sub.permissionId);

    return childIds.concat(subPermissions.map(sub => getAllChildIds(sub)).flat());
  };

  const findParentsByPermissionId = (permissions, targetPermissionId, parents = []) => {
    for (let item of permissions) {
      if (item.permissionId === targetPermissionId) {
        return parents; // 找到目标节点，返回当前父节点列表
      } else if (item.subPermission.length > 0) {
        // 复制当前父节点列表，添加当前节点的 permissionId
        const newParents = [...parents, item];
        // 递归搜索子节点
        const found = findParentsByPermissionId(item.subPermission, targetPermissionId, newParents);
        if (found) {
          return found; // 找到目标节点的父节点列表，返回
        }
      }
    }
    return null; // 未找到目标节点
  };

  const renderPermissions = (list, deep = 1) => {
    return list.map((item, index) => {
      const isFolded = foldedId.includes(item.permissionId);
      const hasChildren = !!(item.subPermission || []).length;
      const checked = selectedIds.includes(item.permissionId);

      // 商户服务功能授权
      const featureType = getFeatureStatus(projectId, VersionProductType.PAY);
      if (!featureType && item.permissionId === 16000) return null;
      
      // 私有部署非平台版无账务
      if (item.permissionId === 13300 && md.global.Config.IsLocal && !md.global.Config.IsPlatformLocal) return null;

      if (
        (item.permissionId === 19500 && md.global.SysSettings.hidePlugin) ||
        (_.includes([19100, 19300], item.permissionId) && md.global.SysSettings.hideIntegration) ||
        (item.permissionId === 19000 && md.global.SysSettings.hidePlugin && md.global.SysSettings.hidePlugin)
      )
        return null;

      const onCheck = () => {
        const parents = findParentsByPermissionId(permissions, item.permissionId);
        const parentIds = parents.map(item => item.permissionId);
        const childIds = hasChildren ? getAllChildIds(item) : [];

        if (featureType === '2' && item.permissionId === 16000) {
          buriedUpgradeVersionDialog(projectId, VersionProductType.PAY);
          return;
        }

        let newIds = selectedIds;

        if (checked) {
          newIds = selectedIds.filter(id => !parentIds.concat(childIds.concat(item.permissionId)).includes(id));
        } else {
          newIds = selectedIds.concat(childIds.concat(item.permissionId));

          _.reverse(parents).forEach(parentPermission => {
            const parentChildIds = getAllChildIds(parentPermission);
            const selectCount = parentChildIds.filter(subId => newIds.includes(subId)).length;
            if (parentChildIds.length === selectCount) {
              newIds.push(parentPermission.permissionId);
            }
          });
        }

        onChangePermission(newIds);
      };

      return (
        <React.Fragment key={index}>
          <div
            className={cx('flexRow alignItemsCenter mBottom12', {
              needLefMove: hasChildren && deep !== 1,
              marginLeft22: deep === 1 && !hasChildren,
            })}
          >
            {hasChildren && (
              <Icon
                icon={isFolded ? 'arrow-right-tip' : 'arrow-down'}
                className="Font14 mRight8 pointer Gray_9e ThemeHoverColor3"
                onClick={() => {
                  setFoldedId(
                    isFolded ? foldedId.filter(id => id !== item.permissionId) : foldedId.concat(item.permissionId),
                  );
                }}
              />
            )}
            {canEdit ? (
              <Checkbox
                text={item.permissionName}
                className={cx({ rootCheckbox: deep === 1 })}
                checked={checked}
                onClick={onCheck}
              />
            ) : (
              <span className={cx({ 'Font15 bold': deep === 1 })}>{item.permissionName}</span>
            )}

            {item.description && (
              <Tooltip title={item.description}>
                <Icon icon="info_outline" className="pointer Gray_bd mLeft4" />
              </Tooltip>
            )}
          </div>

          {hasChildren && !isFolded && (
            <div className={deep === 1 ? 'mLeft48' : 'mLeft24'}>{renderPermissions(item.subPermission, deep + 1)}</div>
          )}

          {deep === 1 && index !== list.length - 1 && <div className="divider" />}
        </React.Fragment>
      );
    });
  };

  return <PermissionListWrapper>{renderPermissions(permissions)}</PermissionListWrapper>;
}
