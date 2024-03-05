import React from 'react';
import { Icon, Dropdown } from 'ming-ui';
import styled from 'styled-components';

const Box = styled.div`
  .Dropdown--input {
    display: flex;
    align-items: center;
  }
`;

export default () => {
  const DATA = [
    { text: '简体中文', value: 'zh-Hans', display: 'CN' },
    { text: '繁體中文', value: 'zh-Hant', display: 'TC' },
    { text: 'English', value: 'en', display: 'EN' },
    { text: '日本語', value: 'ja', display: 'JA' },
  ];
  const currentValue = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

  return (
    <Box className="flexRow alignItemsCenter justifyContentCenter">
      <Icon icon="folder-public" className="Font12 Gray_9e" />
      <Dropdown
        data={DATA}
        value={currentValue}
        renderTitle={() => {
          return <span className="Gray_75">{(DATA.find(o => o.value === currentValue) || {}).display}</span>;
        }}
        onChange={value => {
          setCookie('i18n_langtag', value);
          window.location.reload();
        }}
      />
    </Box>
  );
};
