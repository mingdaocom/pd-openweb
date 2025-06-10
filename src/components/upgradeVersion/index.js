import React from 'react';
import _ from 'lodash';
import { Dialog, Support } from 'ming-ui';
import { purchaseMethodFunc } from 'src/components/pay/versionUpgrade/PurchaseMethodModal';
import 'src/pages/PageHeader/components/NetState/index.less';
import { navigateTo } from 'src/router/navigateTo';
import { VersionProductHelpLink } from 'src/utils/enum';
import { getCurrentProject, getSyncLicenseInfo } from 'src/utils/project';

/**
 * 升级版本dialog
 */
export const upgradeVersionDialog = options => {
  const okText = options.okText ? options.okText : options.isFree ? _l('立即购买') : _l('立即升级');
  const hint = options.hint || _l('当前版本无法使用此功能');
  const explainText = options.explainText || _l('请升级至专业版或旗舰版解锁开启');
  const versionType = options.versionType ? options.versionType : undefined;
  const isExternal = _.isEmpty(getCurrentProject(options.projectId)); // 是否为外协人员
  const helpLink = VersionProductHelpLink[options.featureId] || options.helpLink; // 帮助链接
  const removeFooter = options.removeFooter;
  const descFunc = () => {
    return (
      <div className="netStateWrap">
        <div className="imgWrap" />
        <div className="hint">{hint}</div>
        {!md.global.Config.IsLocal && !md.global.Account.isPortal && !isExternal && options.explainText && (
          <div className="explain">{explainText}</div>
        )}
      </div>
    );
  };
  const onOkFunc = () => {
    !options.projectId
      ? (location.href = `/price`)
      : options.isFree
        ? purchaseMethodFunc({ projectId: options.projectId, select: versionType })
        : options.onOk
          ? options.onOk()
          : navigateTo(`/admin/upgradeservice/${options.projectId}${versionType ? '/' + versionType : ''}`);
  };

  if (options.dialogType === 'content') {
    return <div className="upgradeWrap">{descFunc()}</div>;
  }

  Dialog.confirm({
    className: options.className || 'upgradeVersionDialogBtn',
    title: '',
    description: descFunc(),
    noFooter: true,
  });
};

/**
 * 功能埋点授权显示升级版本内容dialogType： dialog弹层（默认） content 页面
 */
export function buriedUpgradeVersionDialog(projectId, featureId, extra, onOk) {
  const { Versions = [] } = md.global || {};
  const { licenseType, version = {} } = getSyncLicenseInfo(projectId);
  const { explainText = '', dialogType } = extra || {};
  let upgradeName, versionType;

  if (!md.global.Config.IsLocal) {
    const TYPE_NAME = { 1: _l('标准版'), 2: _l('专业版'), 3: _l('旗舰版') };
    const getFeatureType = versionIdV2 => {
      const versionInfo = _.find(Versions || [], item => item.VersionIdV2 === versionIdV2) || {};
      return {
        versionName: TYPE_NAME[versionIdV2],
        versionType: versionIdV2,
        type: (_.find(versionInfo.Products || [], item => item.ProductType === featureId) || {}).Type,
      };
    };

    let usableVersion = [getFeatureType('1'), getFeatureType('2'), getFeatureType('3')].filter(
      item => item.type === '1',
    )[0];

    if (featureId === 38) {
      usableVersion = {
        versionName: TYPE_NAME[parseInt(version.versionIdV2 || 0) + 1],
        versionType: parseInt(version.versionIdV2 || 0) + 1,
      };
    }

    upgradeName = usableVersion.versionName;
    versionType = usableVersion.versionType;
  }

  return upgradeVersionDialog({
    projectId,
    featureId,
    isFree: licenseType === 0 || licenseType === 2,
    explainText:
      md.global.Config.IsLocal || md.global.Account.isPortal
        ? _l('请升级版本')
        : !!explainText
          ? explainText
          : _l('请升级至%0解锁开启', upgradeName),
    versionType,
    dialogType,
    onOk,
  });
}

// 验证网络是否到期异步
export const expireDialogAsync = function (projectId) {
  return new Promise((resolve, reject) => {
    // 个人
    if (!projectId) {
      resolve();
    } else {
      if (getCurrentProject(projectId, true).licenseType === 0) {
        upgradeVersionDialog({
          projectId,
          explainText: _l('请升级至付费版解锁开启'),
          isFree: true,
        });
        reject();
      } else {
        resolve();
      }
    }
  });
};
