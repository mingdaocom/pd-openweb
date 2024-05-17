import React, { useState, useEffect } from 'react';
import { Dialog, Input } from 'ming-ui';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import styled from 'styled-components';
import upgradeAjax from 'src/api/upgrade';
import RegExp from 'src/util/expression';

const formData = [
  { key: 'companyName', label: _l('组织全称'), type: 'input', placeholder: _l('组织名称'), isRequired: true },
  { key: 'address', label: _l('具体地址'), type: 'input', placeholder: _l('街道、楼栋、门牌号码'), isRequired: true },
  { key: 'postcode', label: _l('邮政编码'), type: 'input', isRequired: true },
  { key: 'email', label: _l('电子邮箱'), type: 'input', isRequired: true },
  { key: 'recipientName', label: _l('联系人'), type: 'input', placeholder: _l('真实姓名'), isRequired: true },
  { key: 'mobilePhone', label: _l('手机号'), type: 'input', isRequired: true },
  { key: 'fax', label: _l('传真'), type: 'input', placeholder: _l('传真号码'), isRequired: false },
];

const getDataFilterXSS = summary =>
  filterXSS(summary, {
    whiteList: Object.assign({}, whiteList, { span: ['style'] }),
  });

const DialogWrap = styled(Dialog)`
  .mui-dialog-body {
    overflow-x: hidden !important;
  }
`;

const FormGroup = styled.div`
  margin-bottom: 20px;
  width: 512px;
  .required {
    margin-right: 2px;
    color: #ff4d4f;
    font-size: 14px;
    vertical-align: text-top;
  }
  .formBox {
    background: #f7f7f7;
    border: 1px solid #f7f7f7;
    border-radius: 4px;
    input {
      background: transparent;
      border: 1px solid transparent;
      &:hover {
        border-color: transparent;
      }
      &:focus {
        background-color: #fff;
        border: 1px solid #2196f3;
      }
    }
  }
`;

export default function EditContractDialog(props) {
  const { visible, projectId, onCancel = () => {}, updateContractInfo = () => {} } = props;
  const [contractInfo, setContractInfo] = useState({});
  const {
    companyName = '',
    address = '',
    postcode = '',
    email = '',
    recipientName = '',
    mobilePhone = '',
    fax = '',
  } = contractInfo;

  const getProjectContractInfo = () => {
    upgradeAjax
      .getProjectContractInfo({
        projectId,
      })
      .then(res => {
        if (res) {
          setContractInfo(res);
        }
      });
  };

  const validate = () => {
    if (!address || !companyName || !email || !mobilePhone || !postcode || !recipientName) {
      alert(_l('* 号标识的为必填项'), 3);
      return true;
    }
    if (isNaN(postcode) || postcode.length != 6) {
      alert(_l('请确保邮编正确'), 3); // "请确保邮编正确"
      return true;
    }
    if (!RegExp.isEmail(email)) {
      alert(_l('请输入正确的邮箱'), 3); // 请输入正确的邮箱
      return true;
    }
    if (!RegExp.isPhoneNumber(mobilePhone)) {
      alert(_l('手机号码未正确填写'), 3); // '请输入正确的手机号码！'
      return true;
    }

    if (fax && !/^[+]{0,1}(\d){1,3}[ ]?([-]?((\d)|[ ]){1,12})+$/.exec(fax)) {
      alert(_l('请输入正确的传真号'), 3);
      return true;
    }
    return false;
  };

  const onOk = () => {
    if (validate()) return;

    upgradeAjax
      .updateProjectContractInfo({
        projectId,
        companyName: getDataFilterXSS(companyName),
        address: getDataFilterXSS(address),
        postcode: getDataFilterXSS(postcode),
        email,
        recipientName: getDataFilterXSS(recipientName),
        mobilePhone,
        fax,
      })
      .then(function (data) {
        if (data) {
          alert(_l('组织信息保存成功'));
          onCancel();
          updateContractInfo(contractInfo);
        } else {
          alert(_l('保存失败，请稍后重试'), 3);
        }
      });
  };

  useEffect(() => {
    getProjectContractInfo();
  }, []);

  return (
    <DialogWrap width={560} title={_l('组织信息')} visible={visible} onOk={onOk} onCancel={onCancel}>
      {formData.map(item => {
        const { key, label, type, placeholder, isRequired } = item;
        return (
          <FormGroup className="formGroup">
            <div className="label mBottom4">
              {isRequired && <span className="required">*</span>}
              {label}
            </div>
            <div className="formBox">
              <Input
                className="w100"
                placeholder={placeholder}
                value={contractInfo[key]}
                onChange={val => setContractInfo({ ...contractInfo, [key]: val })}
              />
            </div>
          </FormGroup>
        );
      })}
    </DialogWrap>
  );
}
