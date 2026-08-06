import React, { useEffect, useMemo, useState } from 'react';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon, LoadDiv } from 'ming-ui';
import { dialogSelectApp } from 'ming-ui/functions';
import emailAjax from 'src/api/email';
import AdminTitle from 'src/pages/Admin/common/AdminTitle';
import AuthAppList from 'src/pages/Admin/components/AuthAppList';
import SearchApp from 'src/pages/Admin/components/SearchApp/index.js';
import { navigateTo } from 'src/router/navigateTo';

const PageWrap = styled.div`
  .filterAppWrap {
    width: 220px;
  }
  .serviceCard {
    border: 1px solid var(--color-border-primary);
    border-radius: 4px;
    margin-top: 16px;
    background: var(--color-background-card);
  }
  .serviceHeader {
    min-height: 64px;
    padding: 0 24px;
  }
  .serviceName {
    max-width: 220px;
  }
  .serviceEmail {
    max-width: 360px;
  }
  .defaultTag {
    display: inline-flex;
    align-items: center;
    height: 22px;
    padding: 0 8px;
    border-radius: 11px;
    color: var(--color-white);
    background: var(--color-primary);
  }
  .serviceAppList {
    padding: 0 24px 18px;

    .appEmailAuthList {
      border: 0;

      .headTr {
        border-bottom: 1px solid var(--color-border-secondary);
      }
    }

    .appList {
      height: unset;
      max-height: 280px;
      padding-top: 10px;
      .dataItem .removeItem {
        text-align: right;
        margin-right: 30px;
      }
    }
  }
`;

const APP_EMAIL_SCENE_TYPE = 2;

// 处理应用显示数据
const getAuthApp = (bindings = []) => {
  return bindings.map(item => ({ ...item.sceneEntity, ctime: item.operateTime, createAccountInfo: item.operator }));
};

const mergeExpandedState = (nextServices = [], prevServices = []) => {
  const expandedMap = prevServices.reduce((result, item) => {
    result[item.id] = item.expanded;
    return result;
  }, {});

  return nextServices.map(item => ({
    ...item,
    expanded: _.has(expandedMap, item.id) ? expandedMap[item.id] : item.expanded,
  }));
};

export default function AppEmailService(props) {
  const { projectId } = props;
  const [loading, setLoading] = useState(true);
  const [filterSceneEntityIds, setFilterSceneEntityIds] = useState([]);
  const [services, setServices] = useState([]);
  const [serviceLoading, setServiceLoading] = useState({});

  const filteredServices = useMemo(() => {
    if (!filterSceneEntityIds.length) {
      return services;
    }

    return services
      .filter(s =>
        _.find(
          s.bindings.map(({ sceneEntityId }) => sceneEntityId),
          id => _.includes(filterSceneEntityIds, id),
        ),
      )
      .map(item => {
        return {
          ...item,
          expanded: true,
          bindings: item.bindings.filter(v => _.includes(filterSceneEntityIds, v.sceneEntityId)),
        };
      });
  }, [filterSceneEntityIds, services]);

  const allAppIds = useMemo(() => {
    return services.reduce((result, s) => {
      const ids = s.bindings.map(v => v.sceneEntityId);
      return result.concat(ids);
    }, []);
  }, [services]);

  const updateService = (serviceId, updater) => {
    setServices(list => list.map(item => (item.id === serviceId ? updater(item) : item)));
  };

  const setServiceOperateLoading = (serviceId, value) => {
    setServiceLoading(data => ({ ...data, [serviceId]: value }));
  };

  const getBindingPayload = (serviceId, sceneEntityIds) => ({
    id: serviceId,
    projectId,
    sceneType: APP_EMAIL_SCENE_TYPE,
    sceneEntityIds,
  });

  const getSmtpEntityBindings = (options = {}) => {
    const { keepExpanded = true } = options;

    emailAjax
      .getSmtpEntityBindings({ projectId, sceneType: APP_EMAIL_SCENE_TYPE }, { silent: true })
      .then(data => {
        const nextServices = _.isArray(data) ? data : [];
        setServices(list => (keepExpanded ? mergeExpandedState(nextServices, list) : nextServices));
      })
      .catch(() => {
        setServices([]);
      })
      .finally(() => {
        setLoading(false);
      });
  };

  const addApps = (e, service) => {
    e.stopPropagation();

    if (serviceLoading[service.id]) return;

    dialogSelectApp({
      projectId,
      title: _l('添加应用'),
      filterFun: l => !allAppIds.includes(l.appId),
      onOk: selectedApps => {
        const addedApps = selectedApps.filter(app => !service.bindings.some(item => item.sceneEntityId === app.appId));
        const appIds = addedApps.map(app => app.appId).filter(Boolean);

        if (!appIds.length) return;

        setServiceOperateLoading(service.id, true);
        emailAjax
          .addSmtpEntityBinding({
            id: service.id,
            projectId,
            sceneType: APP_EMAIL_SCENE_TYPE,
            sceneEntityIds: appIds,
          })
          .then(data => {
            if (data) {
              getSmtpEntityBindings();
              alert(_l('添加应用成功'));
            } else {
              alert(_l('添加应用失败'), 2);
            }
          })
          .catch(() => {
            alert(_l('添加应用失败'), 2);
          })
          .finally(() => {
            setServiceOperateLoading(service.id, false);
          });
      },
    });
  };

  const removeApp = (serviceId, appId) => {
    if (serviceLoading[serviceId]) return;

    setServiceOperateLoading(serviceId, true);
    emailAjax
      .deleteSmtpEntityBinding(getBindingPayload(serviceId, [appId]), { silent: true })
      .then(result => {
        if (result) {
          updateService(serviceId, item => ({
            ...item,
            bindings: item.bindings.filter(v => v.sceneEntityId !== appId),
          }));
          alert(_l('移除应用成功'));
        } else {
          alert(_l('移除应用失败'), 2);
        }
      })
      .catch(() => {
        alert(_l('移除应用失败'), 2);
      })
      .finally(() => {
        setServiceOperateLoading(serviceId, false);
      });
  };

  useEffect(() => {
    setLoading(true);
    getSmtpEntityBindings({ keepExpanded: false });
  }, [projectId]);

  const renderServiceCard = (service, index) => {
    const isDefault = index === 0 && _.isEmpty(filterSceneEntityIds); // 第一个是默认服务

    return (
      <div className="serviceCard" key={service.id}>
        <div
          className={cx('serviceHeader flexRow alignItemsCenter', { Hand: !isDefault })}
          onClick={() =>
            isDefault ? null : updateService(service.id, item => ({ ...item, expanded: !item.expanded }))
          }
        >
          <div className="flex minWidth0 flexRow alignItemsCenter">
            <span className="serviceName overflow_ellipsis bold Font14">{service.signature}</span>
            <span className="serviceEmail overflow_ellipsis textSecondary mLeft12">{service.fromAddress}</span>
          </div>
          <div className={cx('textSecondary mRight20', { bold: !isDefault })}>
            {isDefault ? _l('其他所有应用') : _l('%0个应用', service?.bindings?.length)}
          </div>
          {isDefault ? (
            <span className="defaultTag Font12 bold">{_l('默认')}</span>
          ) : (
            <span className="colorPrimary Hand bold mRight24" onClick={e => addApps(e, service)}>
              <Icon icon="add" />
              <span className="mLeft4 bold">{_l('应用')}</span>
            </span>
          )}
          {!isDefault && (
            <Icon
              icon={service.expanded ? 'arrow-up-border' : 'arrow-down-border'}
              className="Font18 textTertiary Hand"
            />
          )}
        </div>
        {!isDefault && service.expanded && (
          <div className="serviceAppList">
            <AuthAppList
              customDateTitle={_l('添加时间')}
              customAccountTitle={_l('添加人')}
              dateFormat="YYYY-MM-DD HH:mm:ss"
              className="appEmailAuthList"
              authApps={getAuthApp(service.bindings)}
              onRemove={id => removeApp(service.id, id)}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <PageWrap className="orgManagementWrap">
      <AdminTitle prefix={_l('应用邮件服务')} />
      <div className="orgManagementHeader flexRow">
        <div className="flexRow alignItemsCenter">
          <Icon
            icon="backspace"
            className="Font22 hoverColorPrimary pointer"
            onClick={() => navigateTo(`/admin/settings/${projectId}`)}
          />
          <div className="Font17 bold flex mLeft10">{_l('应用邮件服务')}</div>
        </div>
      </div>
      <div className="orgManagementContent flex">
        <div className="flexRow alignItemsCenter mBottom16">
          <div className="textSecondary flex">
            {_l(
              '所有应用默认使用默认服务。如需为特定应用（如工作流、外部门户）更改发送服务，请将其添加至对应的邮件服务下',
            )}
          </div>
          <SearchApp
            className="filterAppWrap"
            projectId={projectId}
            mode="multiple"
            onChange={value => {
              setFilterSceneEntityIds(value);
            }}
          />
        </div>
        {loading ? <LoadDiv /> : filteredServices.map(renderServiceCard)}
      </div>
    </PageWrap>
  );
}
