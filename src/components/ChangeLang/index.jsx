import React, { useEffect, useRef } from 'react';
import './lang.css';

export default function ChangeLang() {
  const inputRef = useRef();
  useEffect(() => {
    if (inputRef.current) {
      require(['../dropDown'], function (Dropdown) {
        const dropdown = new Dropdown({
          element: $(inputRef.current),
          defaultValue: getCookie('i18n_langtag') || getNavigatorLang() || 'zh-Hans',
          data: [
            {
              key: '简体中文',
              value: 'zh-Hans',
              display: 'CN',
            },
            {
              key: '繁体中文',
              value: 'zh-Hant',
              display: 'TC',
            },
            {
              key: 'English',
              value: 'en',
              display: 'EN',
            },
          ],
          callback: function (key, value) {
            setCookie('i18n_langtag', value);
            window.location.reload();
          },
        });
      });
    }
  }, []);
  return (
    <div className="showLangChangeBottom">
      <div className="langChangeContainer">
        <div className="langIcon"></div>
        <div className="langWrap">
          <input ref={inputRef} type="hidden" id="hidLang" />
        </div>
      </div>
    </div>
  );
}
