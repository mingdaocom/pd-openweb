import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';

const Box = styled.div`
  gap: 4px;
  .iconCon {
    color: var(--color-text-tertiary);
  }
  .txt {
    color: var(--color-text-secondary);
  }
  &:hover {
    .iconCon {
      color: var(--color-primary) !important;
    }
    .txt {
      color: var(--color-primary) !important;
    }
  }
`;

const SELECT_STYLES = {
  root: { paddingInline: 0 },
  popup: { root: { minWidth: 160 } },
};

export default props => {
  const displayMap = { en: 'EN', 'zh-Hans': 'CN', 'zh-Hant': 'TC', ja: 'JP', th: 'TH', ms: 'MS' };
  const DATA = window
    .getAllowLangConfig()
    .map(item => ({ label: item.value, value: item.key, display: displayMap[item.key] }));
  const currentValue = getCookie('i18n_langtag') || window.getDefaultLangKey();

  return (
    <Box className={cx('flexRow alignItemsCenter justifyContentCenter', props.className)}>
      <Icon icon="folder-public" className="Font12 iconCon" />
      <Select
        size="small"
        variant="borderless"
        options={DATA}
        value={currentValue}
        labelRender={() => {
          return <span className="txt">{(DATA.find(o => o.value === currentValue) || {}).display}</span>;
        }}
        onChange={value => {
          setCookie('i18n_langtag', value);
          window.location.reload();
        }}
        styles={SELECT_STYLES}
      />
    </Box>
  );
};
