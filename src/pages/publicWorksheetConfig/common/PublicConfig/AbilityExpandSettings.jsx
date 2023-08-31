import React, { useEffect } from 'react';
import styled from 'styled-components';
import { Dropdown, Radio, Input } from 'ming-ui';
import _ from 'lodash';
import CommonSwitch from './CommonSwitch';
import SectionTitle from './SectionTitle';
import CommonFieldDropdown from './CommonFieldDropdown';
import { ALLOW_EDIT_TYPES } from '../../enum';

const CustomTimeInput = styled(Input)`
  width: 50px;
  height: 32px !important;
`;

export default function AbilityExpandSettings(props) {
  const { data, setState } = props;
  const { abilityExpand, originalControls, writeScope, weChatSetting, extendSourceId, controls, titleFolded } = data;

  useEffect(() => {
    if (writeScope === 1 && !weChatSetting.isCollectWxInfo) {
      let newAbilityExpand = _.cloneDeep(abilityExpand);
      newAbilityExpand = {
        autoFillField: { isAutoFillField: false, autoFillFields: [] },
        allowViewChange: { isAllowViewChange: false, switchViewChange: 1 },
      };
      setState({ abilityExpand: newAbilityExpand });
    }
  }, [writeScope, weChatSetting.isCollectWxInfo]);

  return (
    <React.Fragment>
      <SectionTitle
        className="mBottom12"
        title={_l('功能增强')}
        isFolded={titleFolded.abilityExpand}
        onClick={() =>
          setState({ titleFolded: Object.assign({}, titleFolded, { abilityExpand: !titleFolded.abilityExpand }) })
        }
      />
      {!titleFolded.abilityExpand && (
        <div className="mLeft25">
          <p className="Gray_75 mBottom24">
            {_l('当启用"收集填写者微信信息"，或填写范围为"平台/本组织用户"时，可使用以下增强功能')}
          </p>
          <div className="mBottom24">
            <div>
              <CommonSwitch
                disabled={writeScope === 1 && !weChatSetting.isCollectWxInfo}
                checked={_.get(abilityExpand, 'autoFillField.isAutoFillField')}
                onClick={checked => {
                  const newAbilityExpand = _.cloneDeep(abilityExpand);
                  newAbilityExpand.autoFillField = {
                    isAutoFillField: !checked,
                    autoFillFields: [],
                  };
                  setState({ abilityExpand: newAbilityExpand });
                }}
                name={_l('获取填写者上次提交内容，并自动填充')}
              />
            </div>
            {_.get(abilityExpand, 'autoFillField.isAutoFillField') && (
              <div className="commonMargin">
                <p className="mBottom8 mTop16">{_l('自动填充')}</p>
                <CommonFieldDropdown
                  controls={originalControls
                    .filter(item =>
                      _.includes(
                        controls.map(c => {
                          return c.controlId;
                        }),
                        item.controlId,
                      ),
                    )
                    .map(item => {
                      return _.pick(item, ['controlId', 'controlName', 'type']);
                    })}
                  extendSourceId={extendSourceId}
                  weChatSetting={weChatSetting}
                  selectedFields={_.get(abilityExpand, 'autoFillField.autoFillFields') || []}
                  onChange={value => {
                    const selectedFields = _.get(abilityExpand, 'autoFillField.autoFillFields') || [];
                    const checked = _.includes(selectedFields, value);
                    const newAbilityExpand = _.cloneDeep(abilityExpand);
                    newAbilityExpand.autoFillField.autoFillFields = checked
                      ? _.remove(selectedFields, f => f !== value)
                      : [...selectedFields, value];
                    !!value && setState({ abilityExpand: newAbilityExpand });
                  }}
                />
              </div>
            )}
          </div>
          <div>
            <CommonSwitch
              disabled={writeScope === 1 && !weChatSetting.isCollectWxInfo}
              checked={_.get(abilityExpand, 'allowViewChange.isAllowViewChange')}
              onClick={checked => {
                const newAbilityExpand = _.cloneDeep(abilityExpand);
                newAbilityExpand.allowViewChange = {
                  isAllowViewChange: !checked,
                  switchViewChange: 1,
                };
                setState({ abilityExpand: newAbilityExpand });
              }}
              name={_l('提交后允许查看/修改')}
              tip={_l(
                '打开后，拥有平台账号的填写者可以再次进入表单查看/修改，请注意如果表单已停止收集数据，将不能进行数据修改',
              )}
            />
            {_.get(abilityExpand, 'allowViewChange.isAllowViewChange') && (
              <div className="commonMargin">
                {ALLOW_EDIT_TYPES.map((item, i) => (
                  <Radio
                    key={i}
                    {...item}
                    disableTitle
                    checked={item.value === _.get(abilityExpand, 'allowViewChange.switchViewChange')}
                    onClick={() => {
                      const newAbilityExpand = _.cloneDeep(abilityExpand);
                      newAbilityExpand.allowViewChange.switchViewChange = item.value;
                      newAbilityExpand.allowViewChange.changeSetting = item.value === 2 ? { changeType: 1 } : {};
                      setState({ abilityExpand: newAbilityExpand });
                    }}
                  />
                ))}
                {_.get(abilityExpand, 'allowViewChange.switchViewChange') === 2 && (
                  <div className="flexRow alignItemsCenter mTop16">
                    <span>{_l('修改时效：')}</span>
                    <Dropdown
                      border
                      isAppendToBody
                      className="effectiveTimeDropdown"
                      value={_.get(abilityExpand, ['allowViewChange', 'changeSetting', 'changeType'])}
                      data={[
                        { text: _l('始终允许修改'), value: 1 },
                        { text: _l('一段时间内可修改'), value: 2 },
                      ]}
                      onChange={value => {
                        const newAbilityExpand = _.cloneDeep(abilityExpand);
                        newAbilityExpand.allowViewChange.changeSetting.changeType = value;
                        setState({ abilityExpand: newAbilityExpand });
                      }}
                    />
                    {_.get(abilityExpand, ['allowViewChange', 'changeSetting', 'changeType']) === 2 && (
                      <div className="mLeft10">
                        <CustomTimeInput
                          value={_.get(abilityExpand, ['allowViewChange', 'changeSetting', 'expireTime']) || ''}
                          onChange={value => {
                            if (parseInt(value) || value === '') {
                              const newAbilityExpand = _.cloneDeep(abilityExpand);
                              const expireTime = parseInt(value) ? (parseInt(value) < 1 ? 1 : parseInt(value)) : '';
                              newAbilityExpand.allowViewChange.changeSetting.expireTime = expireTime;
                              setState({ abilityExpand: newAbilityExpand });
                            }
                          }}
                        />
                        <span className="mLeft8">{_l('小时')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
