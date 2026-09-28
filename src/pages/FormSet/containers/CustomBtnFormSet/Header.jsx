import React from 'react';
import { Icon, UpgradeIcon } from 'ming-ui';
import { Button } from 'ming-ui/antd-components';
import { buriedUpgradeVersionDialog } from 'src/components/upgradeVersion';
import { VersionProductType } from 'src/utils/domain/shared/productFeatures';

export default function Header({ featureType, isFree, worksheetInfo, onOpenTrash, onAdd }) {
  return (
    <div className="topBoxText flexRow alignItemsCenter">
      <div className="textCon flex">
        <h5 className="formName textPrimary Font17 Bold">{_l('自定义动作')}</h5>
        <p className="desc mTop8">
          <span className="Font13 textTertiary">{_l('自定义在查看记录详情时或批量选择记录时可执行的操作')}</span>
        </p>
      </div>
      {featureType && (
        <Button
          className="mRight20"
          color="default"
          variant="text"
          icon={<Icon icon="knowledge-recycle" />}
          onClick={() => {
            // 免费版展示入口但升级拦截，避免用户进入不可用的回收站能力。
            if (isFree) {
              buriedUpgradeVersionDialog(worksheetInfo.projectId, VersionProductType.recycle);
              return;
            }

            onOpenTrash();
          }}
        >
          {_l('回收站')}
          {isFree && <UpgradeIcon />}
        </Button>
      )}
      <Button type="primary" shape="round" icon={<Icon icon="plus" />} onClick={onAdd}>
        {_l('添加按钮')}
      </Button>
    </div>
  );
}
