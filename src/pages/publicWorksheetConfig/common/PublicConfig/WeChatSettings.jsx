import React, { useState, Fragment } from 'react';
import { Dropdown, Radio, Icon } from 'ming-ui';
import _ from 'lodash';
import styled from 'styled-components';
import CommonSwitch from './CommonSwitch';
import SectionTitle from './SectionTitle';
import { COLLECT_WAY_OPTIONS, AUTH_OPTIONS, WECHAT_MAPPING_SOURCE_FIELDS, WECHAT_FIELD_KEY } from '../../enum';
import { getIconByType } from 'src/pages/widgetConfig/util';
import AddControlDialog from '../../components/AddControlDialog';

const BindingTip = styled.div`
  width: 410px;
  padding: 16px;
  margin: 16px 0;
  background: #f8f8f8;
  border-radius: 6px;
  .bindText {
    color: #4caf50;
  }
`;

const AddControl = styled.div`
  :hover {
    color: #fff !important;
  }
  :hover .icon {
    color: #fff !important;
  }
`;

export default function WeChatSettings(props) {
  const { data, setState, projectId, addWorksheetControl, weChatBind } = props;
  const {
    weChatSetting,
    originalControls,
    extendSourceId,
    ipControlId,
    browserControlId,
    deviceControlId,
    systemControlId,
    titleFolded,
  } = data;
  const [addControl, setAddControl] = useState({ visible: false });

  const getDropdownOptions = (key, hasClear) => {
    const controls = originalControls
      .filter(
        item =>
          ((key !== WECHAT_FIELD_KEY.HEAD_IMG_URL && _.includes([2, 41], item.type)) ||
            (key === WECHAT_FIELD_KEY.HEAD_IMG_URL && item.type === 14)) &&
          !_.find(
            Object.values(weChatSetting.fieldMaps || {}).concat([
              extendSourceId,
              ipControlId,
              browserControlId,
              deviceControlId,
              systemControlId,
            ]),
            id => item.controlId === id,
          ),
      )
      .map(item => {
        return {
          text: (
            <div>
              <Icon icon={getIconByType(item.type, false)} />
              <span className="mLeft20">{item.controlName}</span>
            </div>
          ),
          value: item.controlId,
        };
      });

    return (
      hasClear
        ? [
            {
              style: { color: '#757575' },
              text: (
                <div>
                  <Icon icon="delete1" />
                  <span className="mLeft20">{_l('清除')}</span>
                </div>
              ),
              value: 'clear',
            },
          ]
        : []
    )
      .concat(controls)
      .concat(
        key !== WECHAT_FIELD_KEY.HEAD_IMG_URL
          ? {
              style: { borderTop: '1px solid #ddd', paddingTop: '4px', height: '36px' },
              text: (
                <AddControl className="hand ThemeColor3" onClick={() => setAddControl({ visible: true, key })}>
                  <i className="icon icon-plus mRight5 ThemeColor3"></i>
                  {_l('新建文本字段')}
                </AddControl>
              ),
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
                      collectChannel: 2,
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
                  {COLLECT_WAY_OPTIONS.map((item, i) => (
                    <Radio
                      key={i}
                      {...item}
                      disableTitle
                      checked={item.value === weChatSetting.collectChannel}
                      onClick={() =>
                        setState({
                          weChatSetting: Object.assign({}, weChatSetting, {
                            collectChannel: item.value,
                            isRequireAuth: item.value === 2 && !weChatBind.isBind ? false : weChatSetting.isRequireAuth,
                          }),
                        })
                      }
                    />
                  ))}
                  {weChatSetting.collectChannel === 2 &&
                    (!weChatBind.isBind ? (
                      <BindingTip>
                        <span className="Gray_9e">{_l('暂未绑定认证的服务号, 请前往')}</span>
                        <a className="ThemeColor pointer" href={`/admin/weixin/${projectId}`} target="_blank">
                          {_l('组织后台')}
                        </a>
                        <span className="Gray_9e">{_l('添加微信服务号')}</span>
                      </BindingTip>
                    ) : (
                      <BindingTip>
                        <span>{weChatBind.name}</span>
                        <span className="bindText mLeft8">{_l('官方认证服务号')}</span>
                      </BindingTip>
                    ))}
                  <p className="mTop24 mBottom16">{_l('获取填写信息')}</p>
                  {AUTH_OPTIONS.map((item, i) => (
                    <Radio
                      key={i}
                      {...item}
                      disableTitle
                      disabled={weChatSetting.collectChannel === 2 && !weChatBind.isBind && i === 1}
                      checked={item.value === weChatSetting.isRequireAuth}
                      onClick={() =>
                        setState({
                          weChatSetting: Object.assign({}, weChatSetting, { isRequireAuth: item.value }),
                        })
                      }
                    />
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

                          <Icon icon="arrow_forward" className="Font16 ThemeColor mLeft16 mRight16" />
                          <Dropdown
                            border
                            isAppendToBody
                            className="flex minWidth0"
                            value={destId}
                            data={getDropdownOptions(sourceField.key, !!destId)}
                            onChange={value => {
                              const newMappingSet = _.cloneDeep(weChatSetting.fieldMaps);
                              newMappingSet[sourceField.key] = value === 'clear' ? '' : value;
                              setState({
                                weChatSetting: Object.assign({}, weChatSetting, { fieldMaps: newMappingSet }),
                              });
                            }}
                            renderTitle={() => {
                              return currentData ? (
                                <Fragment>
                                  <Icon icon={getIconByType(currentData.type, false)} className="Gray_9e Font14" />
                                  <span className="mLeft10">{currentData.controlName}</span>
                                </Fragment>
                              ) : (
                                <span className="Gray_bd">{_l('请选择')}</span>
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
