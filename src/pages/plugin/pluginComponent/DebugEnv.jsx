import React from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Modal, Select, Tooltip } from 'ming-ui/antd-components';
import homeAppApi from 'src/api/homeApp';
import checkIsAppAdmin from 'src/components/checkIsAppAdmin';
import { navigateToView } from 'src/pages/widgetConfig/navigation';
import { addBehaviorLog } from 'src/utils/services/project';
import { pluginConfigType } from '../config';

const Wrapper = styled.div`
  .envList {
    .headTr,
    .dataItem {
      display: flex;
      align-items: center;
      margin: 0;
      padding: 15px 12px;
      border-bottom: 1px solid var(--color-border-primary);
    }
    .headTr {
      color: var(--color-text-secondary);
      font-weight: 500;
    }
    .dataItem {
      .viewCon {
        display: flex;
        align-items: center;

        &.isValidView {
          cursor: pointer;
          &:hover {
            color: var(--color-primary);
            i {
              color: var(--color-primary) !important;
            }
          }
        }
      }
      &.isCreate {
        border: none;
      }
    }
    .appName,
    .worksheetName,
    .viewName {
      flex: 5;
      width: 0;
      padding-right: 8px;

      .isDel {
        color: var(--color-error);
      }
    }
    .operate {
      flex: 1;
      .icon-trash {
        color: var(--color-text-tertiary);
        font-size: 14px;
        cursor: pointer;
        &:hover {
          color: var(--color-error);
        }
      }
    }
  }
`;

export default function DebugEnv(props) {
  const { configType, debugEnvList, onChangeDebugEnvList, onUpdate, appList, belongType, onGetAppList } = props;
  const [worksheetList, setWorksheetList] = useSetState({});

  const updateDebugEnv = (data, index) => {
    const newDebugEnvList = debugEnvList.map((item, i) => {
      return i === index ? data : item;
    });
    onChangeDebugEnvList(newDebugEnvList);
  };

  const onChangeApp = (env, index) => {
    updateDebugEnv(env, index);
    if (!worksheetList[env.appId]) {
      homeAppApi.getWorksheetsByAppId({ type: 0, appId: env.appId }).then(res => {
        if (res) {
          const list = res.map(item => {
            return { label: item.workSheetName, value: item.workSheetId };
          });
          setWorksheetList({ [env.appId]: list });
        }
      });
    }
  };

  const envColumns = [
    {
      dataIndex: 'appName',
      title: _l('应用'),
      render: (item, index) =>
        item.isEdit ? (
          <Select
            className="w100"
            showPopupSearch={true}
            placeholder={_l('请选择应用')}
            optionFilterProp="label"
            options={appList || []}
            value={item.appId}
            loading={!appList}
            onOpenChange={visible => {
              if (visible && !appList) {
                onGetAppList();
              }
            }}
            onChange={appId => onChangeApp({ ...item, appId, worksheetId: null }, index)}
          />
        ) : (
          <Tooltip placement="topLeft" title={item.appName || item.appId}>
            <div className={cx('overflow_ellipsis', { isDel: !item.appName })}>{item.appName || _l('已删除')}</div>
          </Tooltip>
        ),
    },
    {
      dataIndex: 'worksheetName',
      title: _l('工作表'),
      render: (item, index) =>
        item.isEdit ? (
          <Select
            className="w100"
            showPopupSearch={true}
            disabled={!item.appId}
            placeholder={_l('请选择工作表')}
            optionFilterProp="label"
            options={worksheetList[item.appId] || []}
            value={item.worksheetId}
            onChange={worksheetId => updateDebugEnv({ ...item, worksheetId }, index)}
          />
        ) : (
          <div className={cx('overflow_ellipsis', { isDel: !item.worksheetName })} title={item.worksheetName}>
            {!item.worksheetName ? (
              <Tooltip title={item.worksheetId}>
                <span>{_l('已删除')}</span>
              </Tooltip>
            ) : (
              item.worksheetName
            )}
          </div>
        ),
    },
    {
      dataIndex: 'viewName',
      title: _l('视图'),
      render: (item, index) => {
        const isValidView = item.viewId && item.viewName;
        return item.isEdit ? (
          configType !== pluginConfigType.create ? (
            <Button
              type="primary"
              disabled={!item.appId || !item.worksheetId}
              onClick={() => {
                onUpdate(
                  {
                    debugEnvironments: debugEnvList.map(item => {
                      return { ..._.pick(item, ['appId', 'worksheetId', 'viewId']) };
                    }),
                  },
                  data => {
                    updateDebugEnv(
                      {
                        ...item,
                        isEdit: false,
                        appName: data.appName,
                        worksheetName: data.worksheetName,
                        viewName: data.viewName,
                        viewId: data.viewId,
                      },
                      index,
                    );
                    alert(_l('添加调试应用成功'));
                  },
                  _l('添加调试应用失败'),
                );
              }}
            >
              {_l('确认')}
            </Button>
          ) : (
            ''
          )
        ) : (
          <div
            className={cx('viewCon', { isValidView })}
            onClick={() => {
              isValidView &&
                (belongType === 'myPlugin'
                  ? navigateToView(item.worksheetId, item.viewId)
                  : checkIsAppAdmin({
                      appId: item.appId,
                      appName: item.appName,
                      callback: () => {
                        addBehaviorLog('app', item.appId); // 浏览应用埋点
                        navigateToView(item.worksheetId, item.viewId);
                      },
                    }));
            }}
          >
            <div className="overflow_ellipsis" title={item.viewName}>
              {item.viewName || '-'}
            </div>
            {isValidView && <Icon icon="launch" className="mLeft4 textTertiary" />}
          </div>
        );
      },
    },
    {
      dataIndex: 'operate',
      title: '',
      render: (item, index) =>
        !item.isEdit ? (
          <Icon
            icon="trash"
            onClick={() => {
              Modal.confirm({
                title: <span className="textError">{_l('删除调试应用')}</span>,
                okButtonProps: {
                  danger: true,
                },
                onOk: () => {
                  const newDebugEnvList = debugEnvList.filter((_, i) => i !== index);
                  onUpdate(
                    {
                      debugEnvironments: newDebugEnvList.map(item => {
                        return {
                          ..._.pick(item, ['appId', 'worksheetId', 'viewId']),
                        };
                      }),
                    },
                    () => {
                      onChangeDebugEnvList(newDebugEnvList);
                      alert(_l('删除调试应用成功'));
                    },
                    _l('删除调试应用失败'),
                  );
                },
              });
            }}
          />
        ) : null,
    },
  ];

  return (
    <Wrapper>
      {configType === pluginConfigType.create && (
        <p className="Font14 mBottom0 mLeft12 mTop24">{_l('选择在线调试环境')}</p>
      )}
      <div className="envList">
        {configType !== pluginConfigType.create && (
          <div className="headTr">
            {envColumns.map((item, i) => {
              return (
                <div key={i} className={`${item.dataIndex}`}>
                  {item.title}
                </div>
              );
            })}
          </div>
        )}

        {debugEnvList.map((env, i) => {
          return (
            <div key={i} className={cx('dataItem', { isCreate: configType === pluginConfigType.create })}>
              {envColumns
                .filter(item => configType !== pluginConfigType.create || item.dataIndex !== 'operate')
                .map((item, j) => {
                  return (
                    <div key={`${i}-${j}`} className={`${item.dataIndex}`}>
                      {item.render ? item.render(env, i) : env[item.dataIndex]}
                    </div>
                  );
                })}
            </div>
          );
        })}
      </div>
      {configType !== pluginConfigType.create && !debugEnvList.filter(item => item.isEdit).length && (
        <div
          className="mTop24 InlineBlock colorPrimary hoverColorPrimaryDark pointer"
          onClick={() => {
            const newDebugEnvList = debugEnvList.concat([{ isEdit: true }]);
            onChangeDebugEnvList(newDebugEnvList);
          }}
        >
          {_l('+ 调试应用')}
        </div>
      )}
    </Wrapper>
  );
}
