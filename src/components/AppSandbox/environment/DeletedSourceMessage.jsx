import React from 'react';
import { getPeerEnvironmentUrl, isSandboxEnvironment } from 'src/utils/domain/app/sandbox';

export default function DeletedSourceMessage({ worksheetId, deletedText = _l('已删除') }) {
  if (!isSandboxEnvironment()) {
    return <span className="Red Bold">{deletedText}</span>;
  }

  const productionUrl = worksheetId ? getPeerEnvironmentUrl(`/worksheet/${worksheetId}`) : '';

  return (
    <span className="Bold">
      <span style={{ color: 'var(--color-warning)' }}>{_l('已删除/未开启沙盒')}</span>
      {productionUrl && (
        <a
          className="colorPrimary hoverColorPrimaryDark mLeft5"
          href={productionUrl}
          target="_blank"
          rel="noopener noreferrer"
          onClick={event => event.stopPropagation()}
        >
          {_l('查看生产应用')}
        </a>
      )}
    </span>
  );
}
