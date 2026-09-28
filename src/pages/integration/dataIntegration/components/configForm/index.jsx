import React, { useEffect, useMemo, useRef, useState } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon, LoadDiv } from 'ming-ui';
import { Input, Radio, Select, Tooltip } from 'ming-ui/antd-components';
import appManagementApi from 'src/api/appManagement';
import CustomFields from 'src/components/Form';
import { CREATE_TYPE, CREATE_TYPE_RADIO_LIST, DATABASE_TYPE, sourceNamePattern, TEST_STATUS } from '../../constant';
import dataSourceApi from '../../services/datasource';
import { getSensitiveRequestErrorMessages } from '../../services/sensitiveRequest';
import { getExtraParams } from '../../utils';
import ExistSourceModal from '../ExistSourceModal';
import SourceSelectModal from '../SourceSelectModal';
import { customFormData, getCardDescription } from './formConfig';
import SSHConnect from './SSHConnect';
import TestConnectButton from './testConnectButton';

const Wrapper = styled.div`
  .selectItem {
    width: 100%;
    font-size: 13px;
  }
`;

const SelectCard = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 90px;
  padding: 20px;
  margin: 24px 0px;
  background: var(--color-background-primary);
  border: 2px solid var(--color-border-secondary);
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    border-color: var(--color-primary);
  }

  .svg-icon {
    width: 27px;
    height: 27px;
  }

  .selectIcon {
    display: flex;
    justify-content: center;
    align-items: center;
    width: 36px;
    height: 36px;
    border-radius: 18px;
    color: var(--color-text-disabled);
    background: var(--color-background-primary);
    font-size: 20px;

    &:hover {
      color: var(--color-primary);
      background: var(--color-background-secondary);
    }
  }
`;

const FormFooter = styled.div`
  padding-bottom: 24px;

  .info {
    background-color: var(--color-error-bg);
    border-radius: 3px;
    padding: 8px 16px;
  }
`;

const FormItem = styled.div`
  margin-top: 16px;
  color: var(--color-text-secondary);
  font-size: 13px;
  font-weight: bold;
`;

const SourceSelectFormWrapper = styled.div`
  .requiredStar {
    position: absolute;
    top: 0;
    margin: 3px 0 0 -8px;
    color: var(--color-error);
  }
  .sourceNameInput {
    width: 50%;
    padding-right: 12px;
  }

  .ant-radio-wrapper {
    margin-right: 80px !important;
  }
`;

export default function ConfigForm(props) {
  const { connectorConfigData, setConnectorConfigData, roleType, isCreateConnector, setSaveDisabled, isEditSource } =
    props;
  const config = connectorConfigData[roleType];
  const { formData: currentFormData, createType, type: sourceType } = config;
  const currentProjectId = props.currentProjectId;
  const allFieldDisabled = props.disabled || createType === CREATE_TYPE.SELECT_EXIST;
  const flag = useMemo(() => ({ formData: currentFormData, createType }), [currentFormData, createType]);
  const [appOptionList, setAppOptionList] = useState({ fetching: true, list: [] });
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [existSourceModalVisible, setExistSourceModalVisible] = useState(false);
  const [errorInfo, setErrorInfo] = useState([]);
  const [whitelistIp, setWhitelistIp] = useState([]);
  const [testStatus, setTestStatus] = useState(TEST_STATUS.DEFAULT);
  const [sshEnable, setSshEnable] = useState(false);
  const fieldRef = useRef(null);
  const connectorConfigDataRef = useRef(connectorConfigData);
  const testRequest = useRef(null);
  const resetTimer = useRef(null);

  useEffect(
    () => () => {
      testRequest.current?.abort();
      testRequest.current = null;
      clearTimeout(resetTimer.current);
    },
    [],
  );

  const cancelTest = () => {
    testRequest.current?.abort();
    testRequest.current = null;
    clearTimeout(resetTimer.current);
    setTestStatus(TEST_STATUS.DEFAULT);
    setErrorInfo([]);
  };

  // 获取白名单
  useEffect(() => {
    dataSourceApi.whitelistIp().then(res => res && _.isArray(res) && setWhitelistIp(res));
    dataSourceApi.sshServerEnable().then(res => setSshEnable(!!res));
  }, []);

  // 获取应用列表
  useEffect(() => {
    let active = true;

    if (sourceType === DATABASE_TYPE.APPLICATION_WORKSHEET) {
      appManagementApi.getAppForManager({ projectId: currentProjectId, type: 0 }).then(res => {
        if (active && res) {
          const optionList = res.map(item => {
            return { label: item.appName, value: item.appId };
          });
          setAppOptionList({ fetching: false, list: optionList });
        }
      });
    }

    return () => {
      active = false;
    };
  }, [sourceType, currentProjectId]);

  useEffect(() => {
    connectorConfigDataRef.current = connectorConfigData;
  }, [connectorConfigData]);

  const isApplicationSheet = connectorConfigData[roleType].type === DATABASE_TYPE.APPLICATION_WORKSHEET;

  const onTestConnect = async () => {
    if (props.disabled || testRequest.current) return;
    const { data, error } = fieldRef.current.getSubmitData();
    const formData = {};

    if (error) return;

    if (connectorConfigData[roleType].formData.enableSsh && !connectorConfigData[roleType].formData.sshConfigId) {
      alert(_l('请选择SSH进行测试连接'), 3);
      return;
    }

    data.forEach(element => {
      formData[element.controlId] = element.value;
    });

    const params = {
      datasourceId: connectorConfigData[roleType].formData.id,
      projectId: props.currentProjectId,
      name: formData.name,
      hosts: [`${formData.address}:${formData.post}`],
      user: formData.user,
      password: formData.password,
      initDb: formData.initDb,
      connectOptions: formData.connectOptions,
      cdcParams: formData.cdcParams,
      type: connectorConfigData[roleType].type,
      extraParams: getExtraParams(connectorConfigData[roleType].type, formData),
      enableSsh: connectorConfigData[roleType].formData.enableSsh,
      sshConfigId: connectorConfigData[roleType].formData.sshConfigId,
    };

    const controller = new AbortController();
    testRequest.current = controller;
    clearTimeout(resetTimer.current);
    setTestStatus(TEST_STATUS.TESTING);
    setSaveDisabled(true);
    setErrorInfo([]);

    try {
      const result = await dataSourceApi.test(params, { abortController: controller });
      if (controller.signal.aborted) return;
      setTestStatus(result.isSucceeded ? TEST_STATUS.SUCCESS : TEST_STATUS.FAILED);
      setErrorInfo(result.isSucceeded ? [] : result.errorMsgList || [_l('测试连接失败')]);

      if (result.isSucceeded) {
        setSaveDisabled(false);

        setConnectorConfigData({
          [roleType]: Object.assign({}, connectorConfigData[roleType], {
            formData: {
              ...connectorConfigData[roleType].formData,
              ...formData,
              id: connectorConfigData[roleType].formData.id,
              extraParams: getExtraParams(connectorConfigData[roleType].type, formData),
            },
          }),
        });
      }
    } catch (error) {
      if (controller.signal.aborted) return;
      setTestStatus(TEST_STATUS.FAILED);
      setErrorInfo(getSensitiveRequestErrorMessages(error, _l('测试连接失败')));
    } finally {
      if (testRequest.current === controller) {
        testRequest.current = null;
        resetTimer.current = setTimeout(() => setTestStatus(TEST_STATUS.DEFAULT), 2000);
      }
    }
  };

  const onCreateTypeChange = createType => {
    cancelTest();
    if (createType === CREATE_TYPE.NEW) {
      setConnectorConfigData({
        [roleType]: Object.assign({}, connectorConfigData[roleType], {
          id: '',
          createType,
          sourceName: '',
          formData: {},
        }),
      });
      setSaveDisabled(true);
    } else {
      setExistSourceModalVisible(true);
    }
  };

  const sourceSelectForm = (
    <SourceSelectFormWrapper>
      <div className="Font13 textSecondary bold mBottom16 relative">
        <div className="requiredStar">*</div>
        {_l('数据源')}
      </div>
      <Radio.Group
        disabled={props.disabled}
        className="mBottom24"
        options={(CREATE_TYPE_RADIO_LIST || []).map(({ text, ...option }) => ({ ...option, label: text }))}
        value={connectorConfigData[roleType].createType || CREATE_TYPE.NEW}
        onChange={event => onCreateTypeChange(event.target.value)}
      />
      {connectorConfigData[roleType].createType !== CREATE_TYPE.SELECT_EXIST ? (
        <div className="sourceNameInput">
          <Input
            disabled={props.disabled}
            className="mBottom24 w100"
            radius
            variant="filled"
            value={connectorConfigData[roleType].sourceName}
            onBlur={event =>
              setConnectorConfigData({
                [roleType]: Object.assign({}, connectorConfigData[roleType], {
                  sourceName: event.target.value.replace(sourceNamePattern, ''),
                }),
              })
            }
            onChange={event => {
              cancelTest();
              setConnectorConfigData({
                [roleType]: Object.assign({}, connectorConfigData[roleType], {
                  sourceName: event.target.value,
                }),
              });
            }}
          />
        </div>
      ) : (
        <Select
          disabled={props.disabled}
          className="selectItem mBottom24"
          showSearch={true}
          open={false}
          value={connectorConfigData[roleType].sourceName}
          options={[]}
          onFocus={() => setExistSourceModalVisible(true)}
        />
      )}
    </SourceSelectFormWrapper>
  );

  return (
    <Wrapper>
      <SelectCard onClick={() => !props.disabled && setSelectModalVisible(true)}>
        <svg className="icon svg-icon" aria-hidden="true">
          <use xlinkHref={`#icon${connectorConfigData[roleType].className}`} />
        </svg>

        <div className="flex mLeft16">
          <h3 className="textPrimary Font20 mBottom0">{connectorConfigData[roleType].name}</h3>
          <span className="Font14 textTertiary">{getCardDescription(connectorConfigData[roleType].type)}</span>
        </div>
        <Tooltip title={_l('更换数据源类型')}>
          <div className="selectIcon">
            <Icon icon="arrow-down-border" />
          </div>
        </Tooltip>
      </SelectCard>
      {selectModalVisible && (
        <SourceSelectModal
          projectId={props.currentProjectId}
          onChange={value => {
            if (props.disabled) return;
            cancelTest();
            setConnectorConfigData({
              [roleType]: Object.assign({}, value, { createType: CREATE_TYPE.NEW, sourceName: '', formData: {} }),
            });
            setSaveDisabled(true);
            setSelectModalVisible(false);
          }}
          onClose={() => setSelectModalVisible(false)}
          isCreateConnector={isCreateConnector}
          roleType={roleType}
        />
      )}

      {isCreateConnector && !isApplicationSheet && sourceSelectForm}

      {existSourceModalVisible && (
        <ExistSourceModal
          {...props}
          connectorConfigData={connectorConfigData}
          roleType={roleType}
          setConnectorConfigData={obj => {
            if (props.disabled) return;
            cancelTest();
            setConnectorConfigData(obj);
            setSaveDisabled(false);
          }}
          onClose={() => setExistSourceModalVisible(false)}
        />
      )}

      {isApplicationSheet ? (
        <div>
          <FormItem>
            <div className="mBottom8">{_l('应用')}</div>
            <Select
              disabled={props.disabled}
              className="selectItem"
              labelInValue={true}
              allowClear={true}
              showSearch={true}
              placeholder={_l('请选择')}
              notFoundContent={appOptionList.fetching ? <LoadDiv size="small" /> : _l('暂无应用')}
              options={appOptionList.list}
              value={
                connectorConfigData[roleType].id.length === 36
                  ? { label: connectorConfigData[roleType].sourceName, value: connectorConfigData[roleType].id }
                  : {}
              }
              filterOption={(inputValue, option) => {
                return option.label.toLowerCase().includes(inputValue.toLowerCase());
              }}
              onChange={app => {
                setSaveDisabled(!app);
                setConnectorConfigData({
                  [roleType]: Object.assign(
                    {},
                    connectorConfigData[roleType],
                    app ? { id: app.value, sourceName: app.label } : { id: '', sourceName: '' },
                  ),
                });
              }}
            />
          </FormItem>
        </div>
      ) : (
        <React.Fragment>
          <CustomFields
            ref={fieldRef}
            flag={flag}
            disabled={allFieldDisabled}
            from={3}
            disableRules={true}
            recordId={uuidv4()}
            data={customFormData(
              connectorConfigData[roleType].type,
              connectorConfigData[roleType].roleType,
              isCreateConnector,
              connectorConfigData[roleType].formData,
              allFieldDisabled,
            )}
            onChange={(data, changed) => {
              if (props.disabled) return;
              cancelTest();
              const formData = {};
              data.forEach(element => {
                formData[element.controlId] = element.value;
              });

              // 使用 ref 中的最新值，避免闭包问题（解决 sourceName 丢失问题）
              const currentConfigData = connectorConfigDataRef.current || {};

              setConnectorConfigData({
                [roleType]: Object.assign({}, currentConfigData[roleType], {
                  formData: {
                    ...(currentConfigData[roleType]?.formData || {}),
                    ...formData,
                    id: (currentConfigData[roleType]?.formData || {}).id,
                    extraParams: getExtraParams(currentConfigData[roleType]?.type, formData),
                  },
                }),
              });
              setSaveDisabled(!(_.includes(['name', 'roleType'], changed[0]) && isEditSource));
            }}
          />
          {sshEnable && connectorConfigData[roleType].type !== DATABASE_TYPE.HANA && (
            <SSHConnect
              projectId={props.currentProjectId}
              data={connectorConfigData[roleType].formData}
              onChange={obj => {
                cancelTest();
                setConnectorConfigData({
                  [roleType]: Object.assign({}, connectorConfigData[roleType], {
                    formData: { ...connectorConfigData[roleType].formData, ...obj },
                  }),
                });
              }}
              setSubmitDisabled={setSaveDisabled}
              disabled={props.disabled || (isCreateConnector && createType === CREATE_TYPE.SELECT_EXIST)}
            />
          )}
        </React.Fragment>
      )}

      {((!isApplicationSheet && connectorConfigData[roleType].createType !== CREATE_TYPE.SELECT_EXIST) ||
        !isCreateConnector) && (
        <FormFooter>
          {window.platformENV.isHap && (
            <div className="mTop24">
              <p className="textPrimary Font13">{_l('请将以下IP加入数据库服务器的访问白名单')}</p>
              <div className="info">{whitelistIp.join(', ')}</div>
            </div>
          )}

          <TestConnectButton testStatus={testStatus} onTestConnect={onTestConnect} className="mTop50" />

          {errorInfo.length > 0 && (
            <div className="info mTop15">
              {errorInfo.map((error, index) => {
                return <div key={index} className="mTop5">{`${index + 1}. ${error}`}</div>;
              })}
            </div>
          )}
        </FormFooter>
      )}
    </Wrapper>
  );
}
