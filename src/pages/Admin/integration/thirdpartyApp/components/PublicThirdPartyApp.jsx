import React, { forwardRef, useEffect, useImperativeHandle, useMemo, useRef } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { Button, Dialog, Icon, LoadDiv, Switch } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import openAuthorAjax from 'src/api/openAuthor';
import PageTableCon from 'src/pages/Admin/components/PageTableCon';
import Search from 'src/pages/workflow/components/Search';
import ConfigScopeDrawer from './ConfigScopeDrawer';

const DescWrap = styled.div`
  background: var(--color-primary-transparent);
  border-radius: 3px;
  font-size: 13px;
  padding: 12px;
  margin-bottom: 24px;
`;

const EmptyWrap = styled.div`
  flex: 1;
  min-height: 0;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
`;

const ContentWrap = styled.div`
  .searchWrap {
    width: 230px;
    input {
      width: 100%;
    }
  }
  .wMax100 {
    max-width: 100%;
  }
  .iconWrap {
    width: 30px;
    height: 30px;
    border-radius: 50%;
    overflow: hidden;
    img {
      width: 100%;
      height: 100%;
    }
  }
`;

const PublicThirdPartyApp = forwardRef((props, ref) => {
  const { projectId, updateIsEnabled } = props;
  const [{ searchValue, dataSource, currentItem, isEnabled, configLoading, dataSourceLoading }, setState] = useSetState(
    {
      dataSource: [],
      currentItem: {},
      isEnabled: false, // 是否开通
      configLoading: true,
      dataSourceLoading: true,
    },
  );
  const ajaxRef = useRef(null);

  useImperativeHandle(
    ref,
    () => ({
      isEnabled,
      handleClose: () => editSetting(false),
    }),
    [isEnabled],
  );

  const columns = useMemo(() => {
    return [
      {
        dataIndex: 'name',
        title: _l('应用名称'),
        className: 'flex minWidth120',
        render: (text, item) => {
          return (
            <div className="flexRow alignItemsCenter">
              <div className="iconWrap">
                <img src={item.iconUrl} alt={item.name} />
              </div>
              <div className="flex mLeft10 ellipsis">{item.name}</div>
            </div>
          );
        },
      },
      {
        dataIndex: 'desc',
        title: _l('说明'),
        width: 200,
        ellipsis: true,
        render: (text, item) => {
          const { desc } = item;
          return (
            <div className="ellipsis">
              <Tooltip placement="bottom" title={desc} mouseEnterDelay={0.5}>
                <span className="ellipsis InlineBlock wMax100 space">{desc}</span>
              </Tooltip>
            </div>
          );
        },
      },
      {
        dataIndex: 'scopeType',
        title: _l('使用范围'),
        width: 150,
        render: (text, item) => {
          return item.scopeType === 1 ? _l('全部应用') : _l('指定应用');
        },
      },
      {
        dataIndex: 'status',
        title: _l('是否启用'),
        width: 150,
        render: (text, item) => {
          const { status, scopeType, appIds, name } = item;
          return (
            <div>
              <Switch
                checked={status}
                onClick={() => {
                  Dialog.confirm({
                    title: !status ? _l('启用 %0 集成应用', name) : _l('停用 %0 集成应用', name),
                    description: !status
                      ? _l('启用后，该集成将可以正常访问数据，请确认操作。')
                      : _l('停用后，该集成将无法继续访问任何数据，请确认操作。'),
                    onOk: () =>
                      editAppConfigs(
                        { oAuthAppId: item.oAuthAppId, status: status ? 0 : 1, scopeType, appIds },
                        success => {
                          if (success) {
                            alert(!status ? _l('已开启，允许用户授权使用') : _l('已停用，应用已无法操作用户数据'));
                          } else {
                            alert(!status ? _l('开启失败') : _l('停用失败'), 2);
                          }
                        },
                      ),
                  });
                }}
              />
            </div>
          );
        },
      },
      {
        dataIndex: 'action',
        title: _l('操作'),
        width: 100,
        fixed: 'right',
        render: (text, item) => {
          return (
            <span className="colorPrimary Hand hoverTextPrimaryLight" onClick={() => setState({ currentItem: item })}>
              {_l('配置范围')}
            </span>
          );
        },
      },
    ];
  }, [dataSource]);

  /* 组织第三方应用开关 */
  const getSetting = () => {
    openAuthorAjax
      .getSetting({ projectId })
      .then(res => {
        setState({ isEnabled: res, configLoading: false });
        updateIsEnabled(res);
        if (res) {
          getDataSource();
        }
      })
      .catch(() => {
        setState({ configLoading: false });
      });
  };

  /* 设置组织第三方应用开关 */
  const editSetting = enabled => {
    openAuthorAjax.editSetting({ projectId, enabled }).then(res => {
      if (res) {
        setState({ isEnabled: enabled });
        updateIsEnabled(enabled);
        enabled && getDataSource();
      }
    });
  };

  const getDataSource = (params = {}) => {
    if (ajaxRef.current && ajaxRef.current.abort) {
      ajaxRef.current.abort();
    }

    ajaxRef.current = openAuthorAjax.getAppConfigs({
      projectId,
      keywords: !_.isUndefined(params.keywords) ? params.keywords : searchValue,
    });

    ajaxRef.current
      .then(res => {
        setState({ dataSource: res, dataSourceLoading: false });
      })
      .catch(() => {
        setState({ dataSourceLoading: false });
      });
  };

  const handleSearch = _.debounce(val => {
    setState({ searchValue: val });
    getDataSource({ keywords: val });
  }, 500);

  const editAppConfigs = (params = {}, callback) => {
    openAuthorAjax
      .editAppConfigs({ projectId, ...params })
      .then(res => {
        if (res.resultCode === 1) {
          const copyDataSource = _.cloneDeep(dataSource);
          const index = copyDataSource.findIndex(item => item.oAuthAppId === params.oAuthAppId);

          if (index !== -1) {
            copyDataSource[index] = {
              ...copyDataSource[index],
              ...params,
            };
          }

          callback(true);
          setState({ dataSource: copyDataSource });
        } else {
          callback(false);
        }
      })
      .catch(() => {
        callback(false);
      });
  };

  useEffect(() => {
    getSetting();
  }, []);

  const renderEmpty = () => {
    if (configLoading) {
      return (
        <EmptyWrap>
          <LoadDiv />
        </EmptyWrap>
      );
    }

    return (
      <EmptyWrap>
        <div className="imgWrap">
          <Icon icon="oauth" className="Font64 textTertiary" />
        </div>
        <div className="Font22 mTop20">{_l('公共集成应用')}</div>
        <div className="mTop20">{_l('平台统一提供的集成应用，组织可配置使用范围，成员授权后以个人权限访问数据。')}</div>
        <div>
          <Button className="mTop16" radius onClick={() => editSetting(true)}>
            {_l('立即开通')}
          </Button>
        </div>
      </EmptyWrap>
    );
  };

  return (
    <div className="orgManagementContent flexColumn">
      <DescWrap>
        <div>{_l('1、 公共应用由平台统一提供并维护，适用于通用的第三方集成场景')}</div>
        <div>{_l('2、 管理员可配置公共应用是否在本组织启用，并设置可授权的成员及可访问的数据范围')}</div>
        <div>{_l('3、 启用后，符合条件的成员可将应用授权为以个人权限访问和操作其可见数据')}</div>
      </DescWrap>
      {!isEnabled ? (
        renderEmpty()
      ) : (
        <ContentWrap className="flex flexColumn minHeight0">
          <Search className="searchWrap" placeholder={_l('搜索应用名称')} handleChange={handleSearch} />
          <PageTableCon
            loading={dataSourceLoading}
            columns={columns}
            dataSource={dataSource}
            emptyInfo={{ emptyIcon: 'device_hub', emptyContent: _l('暂无集成应用') }}
          />
        </ContentWrap>
      )}
      {currentItem?.oAuthAppId && (
        <ConfigScopeDrawer
          projectId={projectId}
          oAuthAppId={currentItem.oAuthAppId}
          scopeCodes={currentItem.scopeCodes}
          editAppConfigs={editAppConfigs}
          onClose={() => setState({ currentItem: {} })}
        />
      )}
    </div>
  );
});

export default PublicThirdPartyApp;
