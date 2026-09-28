import React, { Fragment } from 'react';
import { getPeerEnvironmentUrl, isSandboxEnvironment } from 'src/utils/domain/app/sandbox';

export function DeletedOrUnopenedSandboxTitle({ url }) {
  return (
    <Fragment>
      <span className="Normal" style={{ color: 'var(--color-warning)' }}>
        {_l('已删除/未开启沙盒')}
      </span>
      <a
        className="Normal colorPrimary hoverColorPrimaryDark mLeft5"
        href={getPeerEnvironmentUrl(url)}
        target="_blank"
        rel="noopener noreferrer"
        onClick={event => event.stopPropagation()}
      >
        {_l('查看生产应用')}
      </a>
    </Fragment>
  );
}

export default function AppSelectTitle({ data, selectAppItem, invalidText }) {
  if (!data.appId) {
    return <span className="textPlaceholder">{_l('请选择')}</span>;
  }

  if (!selectAppItem) {
    return isSandboxEnvironment() ? (
      <DeletedOrUnopenedSandboxTitle url={`/worksheet/${data.appId}`} />
    ) : (
      <span className="errorColor">{invalidText}</span>
    );
  }

  return (
    <Fragment>
      <span>{selectAppItem.name}</span>
      {selectAppItem.otherApkName && <span className="textSecondary">（{selectAppItem.otherApkName}）</span>}
    </Fragment>
  );
}
