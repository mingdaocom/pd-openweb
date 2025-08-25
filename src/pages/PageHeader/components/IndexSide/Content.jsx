import React, { Fragment, useEffect, useRef, useState } from 'react';
import api from 'api/homeApp';
import { isEmpty } from 'lodash';
import _ from 'lodash';
import { Icon, Skeleton } from 'ming-ui';
import { navigateTo } from 'src/router/navigateTo';
import SideAppGroup from './SideAppGroup';
import './index.less';

const NATIVE_MODULES = [
  { id: 'feed', icon: 'dynamic-empty', text: _l('动态'), color: '#1677ff', href: '/feed', key: 1 },
  { id: 'task', icon: 'task_basic_application', text: _l('任务'), color: '#3cca8f', href: '/apps/task', key: 2 },
  { id: 'calendar', icon: 'sidebar_calendar', text: _l('日程'), color: '#ff6d6c', href: '/apps/calendar/home', key: 3 },
  { id: 'knowledge', icon: 'sidebar_knowledge', text: _l('文件'), color: '#F89803', href: '/apps/kc', key: 4 },
  { id: 'hr', icon: 'hr_home', text: _l('人事'), color: '#607D8B', href: '/hr', key: 5 },
];

const GROUP_TYPES = ['validProject', 'expireProject', 'externalApps', 'aloneApps'];

export default function SideContent(props) {
  const { posX, visible, onClose } = props;
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [data, setData] = useState([]);
  const [expandKeys, setExpandKeys] = useState([]);
  const inputRef = useRef(null);

  const getData = () => {
    setLoading(true);
    api
      .getAllHomeApp({ containsLinks: true })
      .then(res => {
        setData(res);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (visible && !loading && isEmpty(data)) {
      getData();
    }
    visible && inputRef && inputRef.current && inputRef.current.focus();
  }, [visible]);

  useEffect(() => {
    if (!isEmpty(data)) {
      const keys = getStorageKeys().filter(key => {
        const isShow = safeParse(localStorage.getItem(key));
        return isShow === null ? true : isShow;
      });
      setExpandKeys(keys);
    }
  }, [data]);

  const getFilterData = () => {
    const temp = _.cloneDeep(_.pick(data, GROUP_TYPES.concat('markedApps')));
    _.keys(temp).forEach(key => {
      if (_.includes(['validProject', 'expireProject'], key)) {
        temp[key].forEach(item => {
          item.projectApps = (item.projectApps || []).filter(
            app =>
              [app.enName, app.name]
                .filter(_.identity)
                .join('')
                .toLowerCase()
                .indexOf((value || '').trim().toLowerCase()) > -1,
          );
        });
      } else {
        temp[key] = (temp[key] || []).filter(
          app =>
            [app.enName, app.name]
              .filter(_.identity)
              .join('')
              .toLowerCase()
              .indexOf((value || '').trim().toLowerCase()) > -1,
        );
      }
    });
    return temp;
  };

  const getStorageKeys = () => {
    let keys = [];
    const allTypes = ['markedApps'].concat(GROUP_TYPES);

    allTypes.forEach(type => {
      const group = _.get(getFilterData(), type) || [];
      if (group.length) {
        ['markedApps', 'externalApps', 'aloneApps'].includes(type)
          ? keys.push(`${type}/@INIT`)
          : group.forEach(({ projectId, projectApps }) => !!projectApps.length && keys.push(`${type}/${projectId}`));
      }
    });

    return keys;
  };

  const onExpandCollapse = key => {
    if (key) {
      const isExpand = expandKeys.includes(key);
      safeLocalStorageSetItem(key, !isExpand);
      setExpandKeys(isExpand ? expandKeys.filter(item => item !== key) : expandKeys.concat(key));
    } else {
      const storageKeys = getStorageKeys();
      setExpandKeys(expandKeys.length === 0 ? storageKeys : []);
      storageKeys.forEach(key => {
        safeLocalStorageSetItem(key, expandKeys.length === 0 ? true : false);
      });
    }
  };

  const handleMarkApp = para => {
    api.markApp(para).then(res => {
      if (res) {
        getData();
      }
    });
  };

  const renderAppGroups = () => {
    const markedApps = _.get(getFilterData(), 'markedApps') || [];
    const propsAndMethods = {
      value,
      handleMarkApp,
      closeIndexSide: onClose,
      expandKeys,
      onExpandCollapse,
    };

    if (
      !markedApps.length &&
      !GROUP_TYPES.filter(type => {
        const group = _.get(getFilterData(), type) || [];
        return ['validProject', 'expireProject'].includes(type)
          ? !!group.filter(item => !!item.projectApps?.length).length
          : !!group.length;
      }).length
    ) {
      return <div className="TxtCenter mTop16 Gray_75">{_l('无搜索结果')}</div>;
    }

    return (
      <Fragment>
        {markedApps && markedApps.length > 0 && (
          <SideAppGroup type="markedApps" items={markedApps} {...propsAndMethods} />
        )}
        {GROUP_TYPES.map((type, index) => {
          const group = _.get(getFilterData(), type);
          return _.includes(['validProject', 'expireProject'], type)
            ? group &&
                group.map(({ projectId, projectApps, projectName }, index) =>
                  projectApps.length > 0 ? (
                    <SideAppGroup
                      key={`${projectId}-${index}`}
                      type={type}
                      projectId={projectId}
                      projectName={projectName}
                      items={projectApps}
                      {...propsAndMethods}
                    />
                  ) : null,
                )
            : group && group.length > 0 && <SideAppGroup key={index} type={type} items={group} {...propsAndMethods} />;
        })}
      </Fragment>
    );
  };

  return (
    <Fragment>
      <div className="inputWrap">
        <input
          ref={inputRef}
          type="text"
          value={value}
          placeholder={_l('搜索应用名称')}
          onChange={e => {
            const nextVal = e.target.value;
            setValue(nextVal);
          }}
        />
      </div>

      <div className="flexRow cooperateWrap">
        {NATIVE_MODULES.filter(
          item =>
            !(
              (item.id === 'hr' && !md.global.Account.hrVisible) ||
              md.global.SysSettings.forbidSuites.indexOf(item.key) > -1
            ),
        ).map(item => (
          <div
            className="cooperateItem flex"
            onClick={() => {
              item.id === 'hr' ? window.open(item.href) : navigateTo(item.href);
            }}
          >
            <Icon icon={item.icon} className="Font20" style={{ color: item.color }} />
            <div className="Gray_9e mTop5">{item.text}</div>
          </div>
        ))}
      </div>

      <div className="foldAllWrap" onClick={() => onExpandCollapse()}>
        {expandKeys.length === 0 ? _l('全部展开') : _l('全部收起')}
      </div>

      {loading && posX !== 0 ? (
        <Skeleton active widths={['60%', '30%', '40%', '60%', '30%', '40%', '60%', '30%', '40%']} />
      ) : (
        <div style={{ height: '100%', overflowY: 'auto' }}>{renderAppGroups()}</div>
      )}
    </Fragment>
  );
}
