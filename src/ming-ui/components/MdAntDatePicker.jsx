import React from 'react';
import { DatePicker } from 'antd';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import styled from 'styled-components';

const lang = getCookie('i18n_langtag') || md.global.Config.DefaultLang;

const Comp = styled(DatePicker)`
  width: 100%;
  box-shadow: none !important;
  outline: none !important;
  * {
    box-shadow: none !important;
    outline: none !important;
  }
`;

export default function MdAntDatePicker(props) {
  return (
    <Comp locale={lang === 'en' ? en_US : lang === 'ja' ? ja_JP : lang === 'zh-Hant' ? zh_TW : zh_CN} {...props} />
  );
}
