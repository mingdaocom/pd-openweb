import React, { useEffect, useRef, useState } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { v4 as uuidv4 } from 'uuid';
import { Icon, Input, LoadDiv, RadioGroup } from 'ming-ui';
import dataSourceApi from '../../../api/datasource';
import appManagementApi from 'src/api/appManagement';
import CustomFields from 'src/components/newCustomFields';
import { CREATE_TYPE, CREATE_TYPE_RADIO_LIST, DATABASE_TYPE, sourceNamePattern, TEST_STATUS } from '../../constant';
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
    .ant-select-selector {
      height: 36px !important;
      padding: 2px 11px !important;
      border-radius: 3px !important;
    }
  }
`;

const SelectCard = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  height: 90px;
  padding: 20px;
  margin: 24px 0px;
  background: #fff;
  border: 2px solid #ededed;
  border-radius: 12px;
  cursor: pointer;

  &:hover {
    border-color: #1677ff;
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
    color: #bdbdbd;
    background: #fff;
    font-size: 20px;

    &:hover {
      color: #1677ff;
      background: #f5f5f5;
    }
  }
`;

const FormFooter = styled.div`
  padding-bottom: 24px;

  .info {
    background-color: rgba(244, 67, 54, 0.05);
    border-radius: 3px;
    padding: 8px 16px;
  }
`;

const FormItem = styled.div`
  margin-top: 16px;
  color: #757575;
  font-size: 13px;
  font-weight: bold;
`;

const SourceSelectFormWrapper = styled.div`
  .requiredStar {
    position: absolute;
    top: 0;
    margin: 3px 0 0 -8px;
    color: #f44336;
  }
  .sourceNameInput {
    width: 50%;
    padding-right: 12px;

    .Input {
      background: #f7f7f7;
      border: 1px solid #f7f7f7 !important;
      border-radius: 4px;
      padding: 8px 12px 6px;
      font-size: 13px;

      :hover {
        border-color: #f2f2f2 !important;
        background: #f2f2f2;
      }
      :focus {
        border-color: #1677ff !important;
        background: #fff;
      }
    }
  }

  .Radio {
    margin-right: 80px !important;
  }
`;

export default function ConfigForm(props) {
  const { connectorConfigData, setConnectorConfigData, roleType, isCreateConnector, setSaveDisabled, isEditSource } =
    props;
  const [flag, setFlag] = useState(+new Date());
  const [allFieldDisabled, setAllFieldDisabled] = useState(false);
  const [appOptionList, setAppOptionList] = useState({ fetching: true, list: [] });
  const [selectModalVisible, setSelectModalVisible] = useState(false);
  const [existSourceModalVisible, setExistSourceModalVisible] = useState(false);
  const [errorInfo, setErrorInfo] = useState([]);
  const [whitelistIp, setWhitelistIp] = useState([]);
  const [testStatus, setTestStatus] = useState(TEST_STATUS.DEFAULT);
  const [sshEnable, setSshEnable] = useState(false);
  const fieldRef = useRef(null);

  // 获取白名单
  useEffect(() => {
    dataSourceApi.whitelistIp().then(res => res && _.isArray(res) && setWhitelistIp(res));
    dataSourceApi.sshServerEnable().then(res => setSshEnable(!!res));
  }, []);

  // 获取应用列表
  useEffect(() => {
    if (connectorConfigData[roleType].type === DATABASE_TYPE.APPLICATION_WORKSHEET) {
      appManagementApi.getAppForManager({ projectId: props.currentProjectId, type: 0 }).then(res => {
        if (res) {
          const optionList = res.map(item => {
            return { label: item.appName, value: item.appId };
          });
          setAppOptionList({ fetching: false, list: optionList });
        }
      });
    }
  }, [connectorConfigData[roleType].type]);

  useEffect(() => {
    setAllFieldDisabled(connectorConfigData[roleType].createType === CREATE_TYPE.SELECT_EXIST);
    setFlag(+new Date());
  }, [connectorConfigData[roleType].formData, connectorConfigData[roleType].createType]);

  const isApplicationSheet = connectorConfigData[roleType].type === DATABASE_TYPE.APPLICATION_WORKSHEET;

  const onTestConnect = () => {
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

    setTestStatus(TEST_STATUS.TESTING);

    dataSourceApi.test(params).then(result => {
      setTestStatus(result.isSucceeded ? TEST_STATUS.SUCCESS : TEST_STATUS.FAILED);
      setErrorInfo(result.isSucceeded ? [] : result.errorMsgList);

      setTimeout(() => {
        setTestStatus(TEST_STATUS.DEFAULT);
      }, 2000);

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
    });
  };

  const onCreateTypeChange = createType => {
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
      setAllFieldDisabled(false);
    } else {
      setExistSourceModalVisible(true);
    }
  };

  const renderSourceSelectForm = () => {
    return (
      <SourceSelectFormWrapper>
        <div className="Font13 Gray_75 bold mBottom16 relative">
          <div className="requiredStar">*</div>
          {_l('数据源')}
        </div>
        <RadioGroup
          className="mBottom24"
          data={CREATE_TYPE_RADIO_LIST}
          checkedValue={connectorConfigData[roleType].createType || CREATE_TYPE.NEW}
          onChange={createType => onCreateTypeChange(createType)}
        />
        {connectorConfigData[roleType].createType !== CREATE_TYPE.SELECT_EXIST ? (
          <div className="sourceNameInput">
            <Input
              className="mBottom24 w100"
              value={connectorConfigData[roleType].sourceName}
              onBlur={event =>
                setConnectorConfigData({
                  [roleType]: Object.assign({}, connectorConfigData[roleType], {
                    sourceName: event.target.value.replace(sourceNamePattern, ''),
                  }),
                })
              }
              onChange={sourceName =>
                setConnectorConfigData({
                  [roleType]: Object.assign({}, connectorConfigData[roleType], { sourceName }),
                })
              }
            />
          </div>
        ) : (
          <Select
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
  };

  return (
    <Wrapper>
      <SelectCard onClick={() => setSelectModalVisible(true)}>
        <svg className="icon svg-icon" aria-hidden="true">
          <use xlinkHref={`#icon${connectorConfigData[roleType].className}`} />
        </svg>

        <div className="flex mLeft16">
          <h3 className="Gray Font20 mBottom0">{connectorConfigData[roleType].name}</h3>
          <span className="Font14 Gray_9e">{getCardDescription(connectorConfigData[roleType].type)}</span>
        </div>
        <div className="selectIcon" data-tip={_l('更换数据源类型')}>
          <Icon icon="arrow-down-border" />
        </div>
      </SelectCard>
      {selectModalVisible && (
        <SourceSelectModal
          projectId={props.currentProjectId}
          onChange={value => {
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

      {isCreateConnector && !isApplicationSheet && renderSourceSelectForm()}

      {existSourceModalVisible && (
        <ExistSourceModal
          {...props}
          connectorConfigData={connectorConfigData}
          roleType={roleType}
          setConnectorConfigData={obj => {
            setConnectorConfigData(obj);
            setSaveDisabled(false);
            setAllFieldDisabled(true);
          }}
          onClose={() => setExistSourceModalVisible(false)}
        />
      )}

      {isApplicationSheet ? (
        <div>
          <FormItem>
            <div className="mBottom8">{_l('应用')}</div>
            <Select
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
              const formData = {};
              data.forEach(element => {
                formData[element.controlId] = element.value;
              });

              setConnectorConfigData({
                [roleType]: Object.assign({}, connectorConfigData[roleType], {
                  formData: {
                    ...connectorConfigData[roleType].formData,
                    ...formData,
                    id: (connectorConfigData[roleType].formData || {}).id,
                    extraParams: getExtraParams(connectorConfigData[roleType].type, formData),
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
                setConnectorConfigData({
                  [roleType]: Object.assign({}, connectorConfigData[roleType], {
                    formData: { ...connectorConfigData[roleType].formData, ...obj },
                  }),
                });
              }}
              setSubmitDisabled={setSaveDisabled}
              disabled={isCreateConnector && connectorConfigData[roleType].createType === CREATE_TYPE.SELECT_EXIST}
            />
          )}
        </React.Fragment>
      )}

      {((!isApplicationSheet && connectorConfigData[roleType].createType !== CREATE_TYPE.SELECT_EXIST) ||
        !isCreateConnector) && (
        <FormFooter>
          {!md.global.Config.IsLocal && (
            <div className="mTop24">
              <p className="Gray Font13">{_l('请将以下IP加入数据库服务器的访问白名单')}</p>
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
