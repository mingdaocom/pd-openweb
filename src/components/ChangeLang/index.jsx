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
    color: #9e9e9e;
  }
  .txt {
    color: #757575;
  }
  &:hover {
    .iconCon {
      color: #1677ff !important;
    }
    .Dropdown--input {
      .txt,
      .icon-arrow-down-border {
        color: #1677ff !important;
      }
    }
  }
`;

export default props => {
  const DATA = [
    { text: 'English', value: 'en', display: 'EN' },
    { text: '简体中文', value: 'zh-Hans', display: 'CN' },
    { text: '繁體中文', value: 'zh-Hant', display: 'TC' },
    { text: '日本語', value: 'ja', display: 'JA' },
  ];
  const currentValue = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

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
