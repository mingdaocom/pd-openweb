import React from 'react';
import { Icon } from 'ming-ui';
import { PRINT_TYPE, PRINT_TYPE_STYLE } from 'src/pages/Print/core/config';
import { getPrintCardInfoOfTemplate } from 'src/pages/worksheet/common/PrintQrBarCode/enum';

export default function PrintTemplateIcon({ template = {}, className = '', size, muted = false }) {
  const templateStyle = PRINT_TYPE_STYLE[template.type];
  const printInfo = getPrintCardInfoOfTemplate(template);
  const icon = templateStyle?.icon || printInfo.icon;
  const fontSize =
    size === 'small'
      ? 'Font18'
      : [PRINT_TYPE.WORD_PRINT, PRINT_TYPE.EXCEL_PRINT].includes(template.type) || icon !== 'doc'
        ? 'Font24'
        : 'Font22';
  const color =
    template.type === PRINT_TYPE.WORD_PRINT
      ? 'colorPrimary'
      : template.type === PRINT_TYPE.EXCEL_PRINT
        ? 'Green'
        : muted || template.type === PRINT_TYPE.CLOUD_PRINT
          ? 'textTertiary'
          : icon === 'doc'
            ? 'textTitle'
            : '';

  return <Icon icon={icon} className={`${fontSize} ${color} ${className}`} />;
}
