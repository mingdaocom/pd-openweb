import React, { useEffect, useState } from 'react';
import Trigger from 'rc-trigger';
import { Icon, Input, LoadDiv, SvgIcon } from 'ming-ui';
import cx from 'classnames';
import HomeAjax from 'src/api/homeApp';
import './index.less';

export default function SelectApp(props) {
  const { projectId, onChange, defaultAppId, className, filterIds } = props;

  const [value, setValue] = useState(null);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    HomeAjax.getMyApp({ projectId: projectId || localStorage.getItem('currentProjectId') }).then(res => {
      setList(res.apps);
    });
  }, [projectId]);

  const searchHandle = value => {
    setSearch(value);
  };

  const clickHandle = value => {
    setValue(value);
    onChange(value.id);
    setVisible(false);
  };

  const clearValue = e => {
    setValue(null);
    onChange(undefined);
    e.stopPropagation();
  };

  return (
    <Trigger
      className="appSelectTrigger"
      popupVisible={visible}
      onPopupVisibleChange={visible => setVisible(visible)}
      action={['click']}
      popupAlign={{ points: ['tr', 'br'] }}
      popup={
        <div className="appDrowSelectCon">
          <div className="appSearchCon">
            <Icon icon="search Font16 Gray_9d" />
            <Input placeholder={_l('搜索')} className="flex" value={search} onChange={searchHandle} />
          </div>
          <ul className="appList">
            {loading && <LoadDiv size="middle" />}
            {list
              .filter(l => l.name.indexOf(search) > -1)
              .filter(l => filterIds.length === 0 || filterIds.indexOf(l.id) > -1)
              .map(item => {
                return (
                  <li
                    className="appListItem"
                    key={`appDrowSelectList-item-${item.id}`}
                    onClick={() => clickHandle(item)}
                  >
                    <span className="imgCon" style={{ background: item.iconColor }}>
                      <SvgIcon url={item.iconUrl} fill="#FFF" size={16} />
                    </span>
                    <span className="name mLeft15 ellipsis">{item.name}</span>
                  </li>
                );
              })}
          </ul>
        </div>
      }
    >
      <span className={`${className} selectApp ${value ? 'light' : ''}`}>
        {value ? (
          <span className="selectedIconCon" style={{ background: value.iconColor }}>
            <SvgIcon url={value.iconUrl} fill="#FFF" size={10} />
          </span>
        ) : (
          <Icon icon="widgets" className={`${value ? 'color_light' : 'Gray_9e'}`} />
        )}
        <span className={`mLeft6 ${value ? 'color_light Bold' : 'Gray_9e'}`}>{value ? value.name : _l('按应用')}</span>
        {value && <Icon icon="clear_bold" className="Font12 color_light lineHeight13 mLeft8" onClick={clearValue} />}
      </span>
    </Trigger>
  );
}
