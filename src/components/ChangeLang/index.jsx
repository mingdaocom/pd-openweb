import React from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Dropdown, Icon } from 'ming-ui';

const Box = styled.div`
  .Dropdown--input {
    display: flex;
    align-items: center;
  }
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
    .Dropdown--input {
      .txt,
      .icon-arrow-down-border {
        color: var(--color-primary) !important;
      }
    }
  }
`;

export default props => {
  const displayMap = { en: 'EN', 'zh-Hans': 'CN', 'zh-Hant': 'TC', ja: 'JP', th: 'TH', ms: 'MS' };
  const DATA = window
    .getAllowLangConfig()
    .map(item => ({ text: item.value, value: item.key, display: displayMap[item.key] }));
  const currentValue = getCookie('i18n_langtag') || window.getDefaultLangKey();

  return (
    <Box className={cx('flexRow alignItemsCenter justifyContentCenter', props.className)}>
      <Icon icon="folder-public" className="Font12 iconCon" />
      <Dropdown
        data={DATA}
        value={currentValue}
        renderTitle={() => {
          return <span className="txt">{(DATA.find(o => o.value === currentValue) || {}).display}</span>;
        }}
        onChange={value => {
          setCookie('i18n_langtag', value);
          window.location.reload();
        }}
      />
    </Box>
  );
};
