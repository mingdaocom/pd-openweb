const DEFAULT_REVIEW_MODE = 0;

/** 将组织沙盒应用接口数据整理为列表稳定消费的结构。 */
export const normalizeSandboxApps = (apps = []) =>
  apps.map(app => {
    const owner = app.owner || {};
    const appName = app.appName || app.name || '';

    return {
      ...app,
      appId: app.appId || app.id || '',
      appName: appName || _l('应用已删除'),
      isDeleted: !appName,
      icon: app.icon || 'application',
      iconUrl: app.iconUrl || '',
      iconColor: app.iconColor || 'var(--color-primary)',
      reviewMode: [0, 1].includes(app.reviewMode) ? app.reviewMode : DEFAULT_REVIEW_MODE,
      updateTime: app.updateTime || '—',
      owner: {
        ...owner,
        accountId: owner.accountId || '',
        avatar: owner.avatar || owner.userHead || '',
        fullName: owner.fullName || owner.fullname || '—',
      },
    };
  });
