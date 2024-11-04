import React, { useEffect, useState } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon, Button, Dialog } from 'ming-ui';
import { DATABASE_TYPE, DETAIL_TYPE, ROLE_TYPE, SOURCE_DETAIL_TAB_LIST } from '../../../constant';
import ConfigForm from '../../../components/configForm';
import ConfigGuide from '../../../components/configGuide';
import UsageDetail from '../UsageDetail';
import TimingSettingList from '../TimingSettingList';
import dataSourceApi from '../../../../api/datasource';
import { getCurrentProject } from 'src/util';
import { navigateTo } from 'src/router/navigateTo';
import { getExtraParams } from '../../../utils';
import 'src/pages/integration/svgIcon';

const AddOrEditSourceWrapper = styled.div`
  position: fixed;
  left: 0;
  top: 0;
  width: 100%;
  height: 100%;
  z-index: 999;
  background-color: #f5f5f5;
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
  background-color: #fff;
  box-shadow: 0 1px 2px rgb(0 0 0 / 0.16);

  .headerLeft {
    display: flex;
    align-items: center;
    padding-left: 32px;
    cursor: pointer;
  }

  .headerMiddle {
    box-sizing: border-box;
    border-bottom: 1px solid #ddd;

    ul {
      /* text-align: center; */
      li {
        display: inline-block;
        margin: 0 18px;
        box-sizing: border-box;
        border-bottom: 3px solid rgba(0, 0, 0, 0);
        a {
          color: #333;
          display: inline-block;
          height: 64px;
          padding: 26px 20px 12px 20px;
          font-size: 15px;
          font-weight: 600;
        }
        &.isCur {
          border-bottom: 3px solid #2196f3;
          a {
            color: #2196f3;
          }
        }
      }
    }
  }

  .headerRight {
    display: inline-flex;
    padding-right: 32px;
    width: 120px;

    .saveButton {
      height: 36px;
      min-width: 88px;

      &.disabled {
        background: #93c4f1 !important;
      }
    }
  }
`;

const ContentWrapper = styled.div`
  display: flex;
  height: 100%;
  background-color: #fafafa;

  .configForm {
    flex: 2;
    height: calc(100vh - 64px);
    overflow: auto;
    padding: 0px 80px;
    background-color: #fff;
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

let postParams;
export default function AddOrEditSource(props) {
  const { source, onRefresh, isCreateDialog, onClose } = props;
  const { sourceId, type } = (props.match || {}).params || {};
  const currentProject = getCurrentProject(localStorage.getItem('currentProjectId')) || {};
  const [currentTab, setCurrentTab] = useState(type || DETAIL_TYPE.SETTING);
  const [dataSource, setDataSource] = useState(isCreateDialog ? source : {});
  const [saveDisabled, setSaveDisabled] = useState(true);
  const [dialogVisible, setDialogVisible] = useState(false);
  const [noExistSource, setNoExistSource] = useState(false);

  useEffect(() => {
    if (!isCreateDialog) {
      // 获取数据源详情信息
      dataSourceApi
        .getDatasource({
          projectId: currentProject.projectId,
          datasourceId: sourceId,
        })
        .then(res => {
          if (res) {
            if (!!res.errorMsgList) {
              setNoExistSource(true);
              alert(_l('数据源不存在'), 2);
              setTimeout(() => location.assign('/integration/source'), 5000);
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
  }, []);

  const onSave = async () => {
    const { formData } = dataSource;
    const roleTypeArr = JSON.parse(formData.roleType);

    postParams = {
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
      setDialogVisible(true);
    } else {
      await dataSourceApi.addDatasource(postParams).then(res => res && onClose());
      alert(_l('数据源创建成功'));
      onRefresh();
    }
  };

  return (
    <AddOrEditSourceWrapper>
      <HeaderWrapper>
        <div className="headerLeft" onClick={isCreateDialog ? onClose : () => navigateTo('/integration/source')}>
          <Icon icon="arrow_back" className="Gray_75 Font22 bold" />
          <span className="Gray Font16 bold pLeft10">{isCreateDialog ? _l('创建数据源') : _l('编辑数据源')}</span>
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
            <Button
              type="primary"
              size="small"
              className={cx('saveButton', { disabled: saveDisabled })}
              disabled={saveDisabled}
              onClick={onSave}
            >
              {_l('保存')}
            </Button>
          )}
          {dialogVisible && (
            <Dialog
              title={_l('修改数据源')}
              visible={dialogVisible}
              description={
                <div>
                  <span>{_l('修改后，相关的同步任务可能会终止')}</span>
                  <a
                    className="mLeft10"
                    onClick={() => {
                      setCurrentTab(DETAIL_TYPE.USE_DETAIL);
                      setDialogVisible(false);
                    }}
                  >
                    {_l('查看使用详情')}
                  </a>
                </div>
              }
              okText={_l('修改')}
              onOk={async () => {
                const params = { ...postParams, id: sourceId };
                await dataSourceApi.updateDatasource(params).then(res => res && navigateTo('/integration/source'));
                alert(_l('数据源修改成功'));
                setDialogVisible(false);
              }}
              onCancel={() => setDialogVisible(false)}
            />
          )}
        </div>
      </HeaderWrapper>

      {!noExistSource && (
        <React.Fragment>
          {currentTab === DETAIL_TYPE.SETTING && (
            <ContentWrapper>
              <div className="configForm">
                <ConfigForm
                  {...props}
                  currentProjectId={currentProject.projectId}
                  connectorConfigData={{ source: dataSource }}
                  setConnectorConfigData={result => setDataSource(result.source)}
                  roleType="source"
                  isCreateConnector={false}
                  isEditSource={!isCreateDialog}
                  setSaveDisabled={setSaveDisabled}
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
