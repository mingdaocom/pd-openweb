import React, { Fragment, useEffect, useState } from 'react';
import { Select } from 'antd';
import _ from 'lodash';
import styled from 'styled-components';
import { Dropdown, Icon, Input, RadioGroup, Textarea } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { ACCESS_CONDITION_ENUM, DEVICE_ENUM, YES_NO_ENUM } from '../enum';

const AccessConditionsWrap = styled.div`
  margin-bottom: 20px;
  .keyInput {
    width: 130px;
  }
  .delete {
    color: var(--color-text-tertiary);
    &:hover {
      color: var(--color-error);
    }
  }
`;

const SelectWrap = styled(Select)`
  .ant-select-selection-search {
    right: unset !important;
  }
  .anticon-search {
    display: none !important;
  }
`;

export default function AccessConditions(props) {
  const { actionRecord = {}, updateData = () => {} } = props;
  const [accessType, setAccessType] = useState(0);
  const [accessPass, setAccessPass] = useState(0);
  const [ipRule, setIpRule] = useState([]);
  const [hearderRule, setHearderRule] = useState([{ index: 0, key: '', value: '' }]);
  const [addressRule, setAdressRule] = useState([]);
  const [clientRule, setDeviceList] = useState([]);

  const addRequestHeader = () => {
    if (hearderRule.length >= 10) {
      alert(_l('最多添加10个请求头'), 3);
      return;
    }
    setHearderRule([...hearderRule, { index: hearderRule.length + 1, key: '', value: '' }]);
  };

  const addDomain = () => {
    setAdressRule([...addressRule, '']);
  };

  useEffect(() => {
    updateData({
      accessType,
      accessPass,
      ipRule,
      hearderRule,
      addressRule,
      clientRule,
    });
  }, [accessType, accessPass, ipRule, hearderRule, addressRule, clientRule]);

  useEffect(() => {
    if (!actionRecord || _.isEmpty(actionRecord)) {
      return;
    }
    setAccessType(actionRecord.accessType);
    setAccessPass(actionRecord.accessPass ? 1 : 0);
    setIpRule(actionRecord.ipRule || []);
    setHearderRule(actionRecord.hearderRule);
    setAdressRule(actionRecord.addressRule);
    setDeviceList(actionRecord.clientRule);
  }, [actionRecord]);

  const renderCon = () => {
    switch (accessType) {
      case 0:
        return (
          <Fragment>
            <div className="mBottom12">
              <span className="textSecondary TxtMiddle"> {_l('仅支持IPv4，可输入IP地址或CIDR格式的IP地址段')}</span>
              <Tooltip
                title={
                  <Fragment>
                    <div>{_l('单个 IP： 如 192.168.1.1')}</div>
                    <div>{_l('CIDR 网段： 如 10.0.0.0/24')}</div>
                    <div>{_l('注： 输入多个地址时，请使用英文逗号“,”分隔，最多添加50个地址。')}</div>
                  </Fragment>
                }
              >
                <Icon icon="info_outline" className=" mLeft5 pointer Font16 textTertiary TxtMiddle" />
              </Tooltip>
            </div>
            <Textarea
              placeholder={_l('输入多个地址时，请使用英文逗号","分割')}
              value={ipRule.join(',')}
              onChange={value => {
                const ipList = value.trim().split(',');
                if (ipList.length > 50) {
                  alert(_l('最多添加50个地址'), 3);
                  return;
                }
                setIpRule(value.trim().split(','));
              }}
              minHeight={80}
              maxHeight={200}
            />
          </Fragment>
        );
      case 1:
        return (
          <Fragment>
            {hearderRule.map(item => (
              <div className="flexRow alignItemsCenter mBottom8">
                <Input
                  className="keyInput mRight8"
                  placeholder={_l('Key')}
                  value={item.key}
                  onChange={value =>
                    setHearderRule(hearderRule.map(v => (v.index === item.index ? { ...v, key: value } : v)))
                  }
                />
                <Input
                  className="flex"
                  value={item.value}
                  onChange={value =>
                    setHearderRule(hearderRule.map(v => (v.index === item.index ? { ...v, value: value } : v)))
                  }
                />
                {hearderRule.length > 1 && (
                  <span
                    className="delete mLeft8 Hand"
                    onClick={() => setHearderRule(hearderRule.filter(v => v.index !== item.index))}
                  >
                    <Icon icon="delete1" />
                  </span>
                )}
              </div>
            ))}
            <span className="colorPrimary Hand" onClick={addRequestHeader}>
              <Icon icon="add" />
              <span className="mLeft2">{_l('请求头')}</span>
            </span>
          </Fragment>
        );
      case 2:
        return (
          <Fragment>
            {addressRule.map((item, index) => (
              <div className="flexRow alignItemsCenter mBottom8">
                <Input
                  className="flex"
                  value={item}
                  onChange={value => setAdressRule(addressRule.map((v, i) => (index === i ? value : v)))}
                />
                {addressRule.length > 1 && (
                  <span
                    className="delete mLeft8 Hand"
                    onClick={() => setAdressRule(addressRule.filter((v, i) => index !== i))}
                  >
                    <Icon icon="delete1" />
                  </span>
                )}
              </div>
            ))}
            <span className="colorPrimary Hand" onClick={addDomain}>
              <Icon icon="add" />
              <span className="mLeft2">{_l('域名')}</span>
            </span>
          </Fragment>
        );
      case 3:
        return (
          <div className="w100">
            <SelectWrap
              showArrow
              allowClear
              mode="multiple"
              options={DEVICE_ENUM}
              className="w100 mBottom16 mdAntSelect"
              placeholder={_l('请选择')}
              value={clientRule}
              suffixIcon={<Icon icon="arrow-down-border" className="textTertiary Font14" />}
              filterOption={(inputValue, option) => {
                return (
                  DEVICE_ENUM.find(item => item.value === option.value)
                    .label.toLowerCase()
                    .indexOf(inputValue.toLowerCase()) > -1
                );
              }}
              onChange={value => setDeviceList(value)}
            ></SelectWrap>
          </div>
        );
      default:
        return null;
    }
  };

  return (
    <AccessConditionsWrap>
      <div className="bold mBottom16">{_l('条件')}</div>
      <RadioGroup
        className="accessTypeRadioGroup"
        size="middle"
        checkedValue={accessType}
        data={ACCESS_CONDITION_ENUM}
        onChange={value => {
          setAccessType(value);
          setIpRule([]);
          setHearderRule([{ index: 0, key: '', value: '' }]);
          setAdressRule(['']);
          setDeviceList([]);
        }}
      />
      <Dropdown
        className="accessPass mTop16 mBottom16"
        data={YES_NO_ENUM}
        border
        value={accessPass}
        onChange={value => setAccessPass(value)}
      />
      <div>{renderCon()}</div>
    </AccessConditionsWrap>
  );
}
