import React, { useEffect, useState } from 'react';
import { Icon, SvgIcon } from 'ming-ui';
import { Input, Popover } from 'ming-ui/antd-components';
import HomeAjax from 'src/api/homeApp';
import './index.less';

export default function SelectApp(props) {
  const { projectId, onChange, className, filterIds } = props;
  const [value, setValue] = useState(null);
  const [visible, setVisible] = useState(false);
  const [search, setSearch] = useState('');
  const [list, setList] = useState([]);

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
    <Popover
      noPadding
      className="appSelectTrigger"
      open={visible}
      onOpenChange={setVisible}
      trigger="click"
      placement="bottomRight"
      content={
        <div className="appDrowSelectCon">
          <div className="appSearchCon">
            <Input
              variant="borderless"
              prefix={<Icon icon="search Font16 textTertiary" />}
              placeholder={_l('搜索')}
              className="flex"
              value={search}
              onChange={event => searchHandle(event.target.value)}
            />
          </div>
          <ul className="appList">
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
          <Icon icon="widgets" className={`${value ? 'color_light' : 'textTertiary'}`} />
        )}
        <span className={`mLeft6 ${value ? 'color_light Bold' : 'textTertiary'}`}>
          {value ? value.name : _l('按应用')}
        </span>
        {value && <Icon icon="clear_bold" className="Font12 color_light lineHeight13 mLeft8" onClick={clearValue} />}
      </span>
    </Popover>
  );
}
