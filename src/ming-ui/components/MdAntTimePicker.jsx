import React, { forwardRef } from 'react';
import { TimePicker } from 'antd';
import en_US from 'antd/es/date-picker/locale/en_US';
import ja_JP from 'antd/es/date-picker/locale/ja_JP';
import zh_CN from 'antd/es/date-picker/locale/zh_CN';
import zh_TW from 'antd/es/date-picker/locale/zh_TW';
import styled from 'styled-components';

const lang = getCookie('i18n_langtag') || window.getDefaultLangKey();
const datePickerLocale = { en: en_US, ja: ja_JP, 'zh-Hans': zh_CN, 'zh-Hant': zh_TW }[lang] || en_US;

const Comp = styled(TimePicker)`
  width: 100%;
  box-shadow: none !important;
  outline: none !important;
  * {
    box-shadow: none !important;
    outline: none !important;
  }
`;

const MdAntTimePicker = (props, ref) => {
  return <Comp ref={ref} locale={datePickerLocale} {...props} />;
};

export default forwardRef(MdAntTimePicker);
