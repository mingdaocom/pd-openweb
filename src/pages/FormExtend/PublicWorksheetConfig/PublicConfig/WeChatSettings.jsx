import React, { Fragment, useState } from 'react';
import _ from 'lodash';
import { Icon } from 'ming-ui';
import { Radio, Select } from 'ming-ui/antd-components';
import WeChatServiceAccount from 'src/components/WeChatServiceAccountsDialog';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { AUTH_OPTIONS, getCollectWayOptions, WECHAT_FIELD_KEY, WECHAT_MAPPING_SOURCE_FIELDS } from '../../enum';
import AddControlDialog from '../components/AddControlDialog';
import CommonSwitch from './CommonSwitch';
import SectionTitle from './SectionTitle';

export default function WeChatSettings(props) {
  const {
    data,
    setState,
    projectId,
    appId,
    addWorksheetControl,
    weChatBind,
    updateCurrentWeChatServiceAccount = () => {},
  } = props;
  const {
    weChatSetting,
    originalControls,
    extendSourceId,
    ipControlId,
    browserControlId,
    deviceControlId,
    systemControlId,
    titleFolded,
    boundControlIds,
  } = data;
  const [addControl, setAddControl] = useState({ visible: false });

  const getDropdownOptions = key => {
    const needFilterIds = Object.values(weChatSetting.fieldMaps || {})
      .concat([extendSourceId, ipControlId, browserControlId, deviceControlId, systemControlId])
      .concat(boundControlIds);

    const controls = originalControls
      .filter(
        item =>
          (key === WECHAT_FIELD_KEY.HEAD_IMG_URL ? item.type === 14 : _.includes([2, 41], item.type)) &&
          !_.find(needFilterIds, id => item.controlId === id),
      )
      .map(item => {
        return {
          label: (
            <div>
              <Icon icon={getIconByType(item.type, false)} />
              <span className="mLeft20">{item.controlName}</span>
            </div>
          ),
          value: item.controlId,
        };
      });

    return controls.concat(
      key !== WECHAT_FIELD_KEY.HEAD_IMG_URL
        ? {
            style: {
              borderTop: '1px solid var(--color-border-primary)',
              display: 'flex',
              alignItems: 'center',
              height: '36px',
            },
            label: (
              <div className="flexRow alignItemsCenter hand colorPrimary">
                <i className="icon icon-plus mRight5 colorPrimary"></i>
                {_l('新建文本字段')}
              </div>
            ),
            value: 'add',
          }
        : [],
    );
  };

  return (
    <React.Fragment>
      <SectionTitle
        title={_l('微信设置')}
        isFolded={titleFolded.weChatSetting}
        onClick={() =>
          setState({ titleFolded: Object.assign({}, titleFolded, { weChatSetting: !titleFolded.weChatSetting }) })
        }
      />
      {!titleFolded.weChatSetting && (
        <div className="mLeft25">
          <div className="mBottom24">
            <div>
              <CommonSwitch
                checked={weChatSetting.isCollectWxInfo}
                onClick={checked =>
                  setState({
                    weChatSetting: {
                      isCollectWxInfo: !checked,
                      collectChannel: window.platformENV.isHap ? 1 : 2,
                      isRequireAuth: false,
                      fieldMaps: {},
                      onlyWxCollect: weChatSetting.onlyWxCollect,
                    },
                  })
                }
                name={_l('收集填写者微信信息')}
              />
            </div>
            {weChatSetting.isCollectWxInfo && (
              <React.Fragment>
                <div className="commonMargin">
                  <p className="pTop8 mBottom16">{_l('收集渠道')}</p>
                  {getCollectWayOptions().map(item => (
                    <Radio
                      key={item.value}
                      value={item.value}
                      checked={item.value === weChatSetting.collectChannel}
                      onChange={() =>
                        setState({
                          weChatSetting: Object.assign({}, weChatSetting, {
                            collectChannel: item.value,
                            isRequireAuth: item.value === 2 && !weChatBind.isBind ? false : weChatSetting.isRequireAuth,
                          }),
                        })
                      }
                    >
                      {item.text}
                    </Radio>
                  ))}
                  {weChatSetting.collectChannel === 2 && (
                    <WeChatServiceAccount
                      className="mTop16 mBottom16"
                      projectId={projectId}
                      appId={appId}
                      selectedServiceAppId={weChatBind.appId}
                      updateWeChatServiceInfo={({ weChatServiceAccounts, service, appId }) => {
                        updateCurrentWeChatServiceAccount({ weChatServiceAccounts, service, appId });
                      }}
                    />
                  )}
                  <p className="mTop24 mBottom16">{_l('获取填写信息')}</p>
                  {AUTH_OPTIONS.map((item, i) => (
                    <Radio
                      key={String(item.value)}
                      value={item.value}
                      disabled={weChatSetting.collectChannel === 2 && !weChatBind.isBind && i === 1}
                      checked={item.value === weChatSetting.isRequireAuth}
                      onChange={() =>
                        setState({
                          weChatSetting: Object.assign({}, weChatSetting, {
                            isRequireAuth: item.value,
                          }),
                        })
                      }
                    >
                      {item.text}
                    </Radio>
                  ))}
                  <div className="mappingSection">
                    {WECHAT_MAPPING_SOURCE_FIELDS.filter(
                      item => weChatSetting.isRequireAuth || item.key === WECHAT_FIELD_KEY.OPEN_ID,
                    ).map(sourceField => {
                      const destId = (weChatSetting.fieldMaps || {})[sourceField.key];
                      const currentData = originalControls.filter(item => item.controlId === destId)[0];
                      return (
                        <div className="flexRow mBottom10 alignItemsCenter" key={sourceField.key}>
                          <div className="flex">
                            <div className="fieldText">
                              {sourceField.name}
                              {sourceField.required && <span className="Red bold">*</span>}
                            </div>
                          </div>

                          <Icon icon="arrow_forward" className="Font16 colorPrimary mLeft16 mRight16" />
                          <Select
                            allowClear={Boolean(destId)}
                            className="flex minWidth0"
                            value={destId}
                            options={getDropdownOptions(sourceField.key)}
                            onChange={value => {
                              if (value === 'add') {
                                setAddControl({ visible: true, key: sourceField.key });
                                return;
                              }

                              const newMappingSet = _.cloneDeep(weChatSetting.fieldMaps);
                              newMappingSet[sourceField.key] = value || '';
                              setState({
                                weChatSetting: Object.assign({}, weChatSetting, { fieldMaps: newMappingSet }),
                              });
                            }}
                            labelRender={() => {
                              return currentData ? (
                                <Fragment>
                                  <Icon icon={getIconByType(currentData.type, false)} className="textTertiary Font14" />
                                  <span className="mLeft10">{currentData.controlName}</span>
                                </Fragment>
                              ) : (
                                <span className="textDisabled">{_l('请选择')}</span>
                              );
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>
                </div>
              </React.Fragment>
            )}
          </div>
          <div>
            <CommonSwitch
              checked={weChatSetting.onlyWxCollect}
              onClick={checked =>
                setState({ weChatSetting: Object.assign({}, weChatSetting, { onlyWxCollect: !checked }) })
              }
              name={_l('只允许在微信中填写')}
              tip={_l('打开后，填写者只能在微信环境内填写表单。')}
            />
          </div>
        </div>
      )}

      {addControl.visible && (
        <AddControlDialog
          defaultText={''}
          onOk={controlName => {
            addWorksheetControl(controlName, control => {
              const newMappingSet = _.cloneDeep(weChatSetting.fieldMaps);
              newMappingSet[addControl.key] = control.controlId;
              setState({ weChatSetting: Object.assign({}, weChatSetting, { fieldMaps: newMappingSet }) });
            });
          }}
          onClose={() => setAddControl({ visible: false })}
        />
      )}
    </React.Fragment>
  );
}
