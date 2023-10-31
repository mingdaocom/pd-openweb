import React, { useState, useEffect, Fragment } from 'react';
import { ScrollView, Skeleton } from 'ming-ui';
import { useSetState } from 'react-use';
import api from 'api/homeApp';
import './index.less';
import NativeModule from './NativeModule';
import SideAppGroup from './SideAppGroup';
import { isEmpty } from 'lodash';

const GROUP_TYPES = ['validProject', 'expireProject', 'externalApps', 'aloneApps'];
export default function SideContent(props) {
  const { posX, visible, onClose } = props;
  const [value, setValue] = useState('');
  const [loading, setLoading] = useState(false);
  const [{ data, filteredData }, setData] = useSetState({ data: [], filteredData: [] });

  const getData = () => {
    setLoading(true);
    api
      .getAllHomeApp({ containsLinks: true })
      .then(data => {
        setData({ data, filteredData: data });
      })
      .always(() => {
        setLoading(false);
      });
  };

  useEffect(() => {
    if (visible && !loading && isEmpty(data)) {
      getData();
    }
  }, [visible]);

  const filterData = () => {
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
    setData({ filteredData: temp });
  };

  useEffect(() => {
    filterData();
  }, [value]);

  const handleMarkApp = para => {
    api.markApp(para).then(res => {
      if (res) {
        getData();
      }
    });
  };
  const renderAppGroups = () => {
    const markedApps = _.get(filteredData, 'markedApps') || [];
    const propsAndMethods = {
      value,
      handleMarkApp: handleMarkApp,
      closeIndexSide: onClose,
    };
    return (
      <Fragment>
        {markedApps && markedApps.length > 0 && (
          <SideAppGroup type="markedApps" items={markedApps} {...propsAndMethods} />
        )}
        <NativeModule />
        {GROUP_TYPES.map((type, index) => {
          const group = _.get(filteredData, type);
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
          type="text"
          value={value}
          placeholder={_l('搜索应用名称')}
          onChange={e => {
            const nextVal = e.target.value;
            setValue(nextVal);
          }}
        />
      </div>
      {loading && posX !== 0 ? (
        <Skeleton active widths={['60%', '30%', '40%', '60%', '30%', '40%', '60%', '30%', '40%']} />
      ) : (
        <ScrollView>{renderAppGroups()}</ScrollView>
      )}
    </Fragment>
  );
}
