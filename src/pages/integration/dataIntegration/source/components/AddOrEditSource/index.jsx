import React, { useEffect, useRef, useState } from 'react';
import cx from 'classnames';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Button, Modal } from 'ming-ui/antd-components';
import 'src/pages/integration/svgIcon';
import { navigateTo } from 'src/router/navigation/navigateTo';
import { getCurrentProject } from 'src/utils/services/project';
import ConfigForm from '../../../components/configForm';
import ConfigGuide from '../../../components/configGuide';
import { DATABASE_TYPE, DETAIL_TYPE, ROLE_TYPE, SOURCE_DETAIL_TAB_LIST } from '../../../constant';
import { isSuccessfulDatasourceUpdate } from '../../../requestResult';
import dataSourceApi from '../../../services/datasource';
import { getSensitiveRequestErrorMessages } from '../../../services/sensitiveRequest';
import { getExtraParams } from '../../../utils';
import TimingSettingList from '../TimingSettingList';
import UsageDetail from '../UsageDetail';

const AddOrEditSourceWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: var(--color-background-secondary);
  display: flex;
  flex-direction: column;
`;

const HeaderWrapper = styled.div`
  display: flex;
  z-index: 1;
  height: 64px;
  min-height: 64px;
  justify-content: space-between;
  align-items: center;
  background-color: var(--color-background-primary);
  box-shadow: var(--shadow-sm);

  .headerLeft {
    display: flex;
    align-items: center;
    padding-left: 32px;
    cursor: pointer;
  }

  .headerMiddle {
    box-sizing: border-box;

    ul {
      /* text-align: center; */
      li {
        display: inline-block;
        margin: 0 18px;
        box-sizing: border-box;
        border-bottom: 3px solid rgba(0, 0, 0, 0);
        a {
          color: var(--color-text-title);
          display: inline-block;
          height: 64px;
          padding: 26px 20px 12px 20px;
          font-size: 15px;
          font-weight: 600;
        }
        &.isCur {
          border-bottom: 3px solid var(--color-primary);
          a {
            color: var(--color-primary);
          }
        }
      }
    }
  }

  .headerRight {
    display: inline-flex;
    padding-right: 32px;
    width: 120px;
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  background-color: var(--color-background-secondary);

  .configForm {
    flex: 2;
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 0px 80px;
    background-color: var(--color-background-primary);
    font-size: 13px;
  }

  .configGuide {
    flex: 1;
    padding: 20px;
    height: calc(100vh - 50px);
    min-width: 400px;
    overflow: auto;
  }
`;

export default function AddOrEditSource(props) {
  const requestPending = useRef(null);
  const pendingParams = useRef(null);
  const { source, onRefresh, isCreateDialog, onClose } = props;
  const { sourceId, type } = (props.match || {}).params || {};
  const currentProject = getCurrentProject(localStorage.getItem('currentProjectId')) || {};
  const [currentTab, setCurrentTab] = useState(type || DETAIL_TYPE.SETTING);
  const [dataSource, setDataSource] = useState(isCreateDialog ? source : {});
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [saving, setSaving] = useState(false);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [noExistSource, setNoExistSource] = useState(false);
  const projectId = currentProject.projectId;

  useEffect(
    () => () => {
      requestPending.current?.abort();
      requestPending.current = null;
    },
    [],
  );

  useEffect(() => {
    let active = true;
    let redirectTimer;

    if (!isCreateDialog) {
      // 获取数据源详情信息
      dataSourceApi
        .getDatasource({
          projectId,
          datasourceId: sourceId,
        })
        .then(res => {
          if (active && res) {
            if (res.errorMsgList) {
              setNoExistSource(true);
              alert(_l('数据源不存在'), 2);
              redirectTimer = setTimeout(() => navigateTo('/integration/source'), 5000);
            } else {
              const detail = {
                ...res,
                address: res.hosts[0].split(':')[0],
                post: res.hosts[0].split(':')[1],
                type: res.dsTypeInfo,
                roleType: JSON.stringify(
                  res.roleType ? (res.roleType === 'ALL' ? [ROLE_TYPE.SOURCE, ROLE_TYPE.DEST] : [res.roleType]) : [],
                ),
              };
              setDataSource({ formData: detail, ...res.dsTypeInfo });
            }
          }
        });
    }

    return () => {
      active = false;
      clearTimeout(redirectTimer);
    };
  }, [isCreateDialog, projectId, sourceId]);

  const onSave = async () => {
    if (requestPending.current) return;
    const { formData } = dataSource;
    const roleTypeArr = JSON.parse(formData.roleType);

    const postParams = {
      projectId: currentProject.projectId,
      name: formData.name,
      hosts: [`${formData.address}:${formData.post}`],
      user: formData.user,
      password: formData.password,
      initDb: formData.initDb,
      connectOptions: formData.connectOptions,
      cdcParams: formData.cdcParams,
      type: dataSource.type,
      fromType: dataSource.fromType,
      roleType: roleTypeArr.length > 1 ? 'ALL' : roleTypeArr[0],
      extraParams: getExtraParams(dataSource.type, formData),
      enableSsh: formData.enableSsh,
      sshConfigId: formData.sshConfigId,
    };

    if (!isCreateDialog) {
      pendingParams.current = postParams;
      setDialogVisible(true);
    } else {
      const controller = new AbortController();
      requestPending.current = controller;
      setSaving(true);
      try {
        const res = await dataSourceApi.addDatasource(postParams, { abortController: controller });
        if (controller.signal.aborted) return;

        if (!isSuccessfulDatasourceUpdate(res)) {
          alert(_l('数据源创建失败'), 2);
          return;
        }

        alert(_l('数据源创建成功'));
        onClose();
        onRefresh();
      } catch (error) {
        if (!controller.signal.aborted) {
          const messages = getSensitiveRequestErrorMessages(error, _l('数据源创建失败'));
          if (messages.length) alert(messages[0], 2);
        }
      } finally {
        if (requestPending.current === controller) {
          requestPending.current = null;
          setSaving(false);
        }
      }
    }
  };

  return (
    <AddOrEditSourceWrapper>
      <HeaderWrapper>
        <div className="headerLeft" onClick={isCreateDialog ? onClose : () => navigateTo('/integration/source')}>
          <Icon icon="backspace" className="textSecondary Font22 bold" />
          <span className="textPrimary Font16 bold pLeft10">
            {isCreateDialog ? _l('创建数据源') : _l('编辑数据源')}
          </span>
        </div>

        {!isCreateDialog && (
          <div className="headerMiddle">
            <ul>
              {SOURCE_DETAIL_TAB_LIST.filter(
                item => !(item.key === DETAIL_TYPE.TIMING_SETTING && dataSource.type !== DATABASE_TYPE.HANA),
              ).map((item, index) => {
                return (
                  <li
                    key={index}
                    className={cx({
                      isCur: item.key === currentTab || (!currentTab && item.key === DETAIL_TYPE.SETTING),
                    })}
                    onClick={() => setCurrentTab(item.key)}
                  >
                    <a className="pLeft18">{item.text}</a>
                  </li>
                );
              })}
            </ul>
          </div>
        )}
        <div className="headerRight">
          {currentTab === DETAIL_TYPE.SETTING && (
            <Button type="primary" disabled={saveDisabled} loading={saving} onClick={onSave}>
              {_l('保存')}
            </Button>
          )}
          {dialogVisible && (
            <Modal
              title={_l('修改数据源')}
              open={dialogVisible}
              mask={{ closable: true }}
              keyboard
              okText={_l('修改')}
              confirmLoading={saving}
              onOk={async () => {
                if (requestPending.current) return;

                const params = { ...pendingParams.current, id: sourceId };
                const controller = new AbortController();
                requestPending.current = controller;
                setSaving(true);
                try {
                  const res = await dataSourceApi.updateDatasource(params, { abortController: controller });
                  if (controller.signal.aborted) return;

                  if (!isSuccessfulDatasourceUpdate(res)) {
                    alert(_l('数据源修改失败'), 2);
                    return;
                  }

                  alert(_l('数据源修改成功'));
                  setDialogVisible(false);
                  navigateTo('/integration/source');
                } catch (error) {
                  if (!controller.signal.aborted) {
                    const messages = getSensitiveRequestErrorMessages(error, _l('数据源修改失败'));
                    if (messages.length) alert(messages[0], 2);
                  }
                } finally {
                  if (requestPending.current === controller) {
                    requestPending.current = null;
                    setSaving(false);
                  }
                }
              }}
              onCancel={() => !requestPending.current && setDialogVisible(false)}
            >
              <div className="textSecondary">
                <span>{_l('修改后，相关的同步任务可能会终止')}</span>
                <a
                  className="mLeft10"
                  onClick={() => {
                    if (requestPending.current) return;
                    setCurrentTab(DETAIL_TYPE.USE_DETAIL);
                    setDialogVisible(false);
                  }}
                >
                  {_l('查看使用详情')}
                </a>
              </div>
            </Modal>
          )}
        </div>
      </HeaderWrapper>

      {!noExistSource && (
        <React.Fragment>
          {currentTab === DETAIL_TYPE.SETTING && (
            <ContentWrapper>
              <div className="configForm">
                <ConfigForm
                  key={sourceId || 'new'}
                  {...props}
                  currentProjectId={currentProject.projectId}
                  connectorConfigData={{ source: dataSource }}
                  setConnectorConfigData={result => setDataSource(result.source)}
                  roleType="source"
                  isCreateConnector={false}
                  isEditSource={!isCreateDialog}
                  setSaveDisabled={setSaveDisabled}
                  disabled={saving}
                />
              </div>
              <div className="configGuide">
                <ConfigGuide source={dataSource} current="source" />
              </div>
            </ContentWrapper>
          )}

          {currentTab === DETAIL_TYPE.TIMING_SETTING && (
            <TimingSettingList
              projectId={currentProject.projectId}
              sourceId={sourceId}
              onViewUseDetail={() => setCurrentTab(DETAIL_TYPE.USE_DETAIL)}
            />
          )}

          {currentTab === DETAIL_TYPE.USE_DETAIL && (
            <UsageDetail projectId={currentProject.projectId} sourceId={sourceId} />
          )}
        </React.Fragment>
      )}
    </AddOrEditSourceWrapper>
  );
}
