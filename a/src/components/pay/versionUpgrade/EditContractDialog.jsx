import React, { useState, useEffect } from 'react';
import { Dialog, Input, CityPicker, Icon } from 'ming-ui';
import filterXSS from 'xss';
import { whiteList } from 'xss/lib/default';
import cx from 'classnames';
import styled from 'styled-components';
import upgradeAjax from 'src/api/upgrade';
import fixedDataAjax from 'src/api/fixedData';
import RegExp from 'src/util/expression';

const formData = [
  { key: 'companyName', label: _l('组织全称'), type: 'input', placeholder: _l('组织名称'), isRequired: true },
  { key: 'geographyId', label: _l('组织所在城市'), type: 'area', isRequired: true, placeholder: _l('请选择') },
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
    .cityPickerBox {
      width: 100%;
      border: none;
      text-align: left;
      outline: none;
      align-items: center;
      background: #f7f7f7;
      cursor: pointer;
      &:focus {
        border-color: #f2f2f2 !important;
        background: #f2f2f2 !important;
      }

      &:not(.controlDisabled):hover {
        > .ming.Icon:not(.customFormButtoDel) {
          color: #2196f3 !important;
        }
        .customFormButtoDel {
          display: block;
          &:hover {
            color: rgba(0, 0, 0, 0.45) !important;
          }
          & ~ i {
            display: none;
          }
        }
      }

      .customFormButtoDel {
        display: none;
      }
      input {
        padding: 0;
        background: transparent;
        border: 1px solid transparent;
      }
      input:focus {
        border: 1px solid transparent;
      }
    }
  }
`;

export default function EditContractDialog(props) {
  const { visible, projectId, onCancel = () => {}, updateContractInfo = () => {} } = props;
  const [keywords, setKeywords] = useState('');
  const [cityPickVisible, setCityPickerVisible] = useState(false);
  const [cityPath, setCityPath] = useState('');
  const [contractInfo, setContractInfo] = useState({});
  const {
    companyName = '',
    geographyId = '',
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
          if (res.geographyId) {
            getCityPath(res.geographyId);
          }
        }
      });
  };

  const getCityPath = id => {
    fixedDataAjax.loadCityCountyById({ id }).then(res => {
      if (res && res.values) {
        setCityPath(_.get(res, 'values.displayText'));
      }
    });
  };

  const validate = () => {
    if (!address || !geographyId || !companyName || !email || !mobilePhone || !postcode || !recipientName) {
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

  const changeCity = data => {
    const last = _.last(data);
    if (keywords) {
      setKeywords('');
    }

    setCityPath(last.path);
    setContractInfo({ ...contractInfo, geographyId: last.id });
  };

  const onOk = () => {
    if (validate()) return;

    upgradeAjax
      .updateProjectContractInfo({
        projectId,
        companyName: getDataFilterXSS(companyName),
        geographyId,
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
              {type === 'area' ? (
                <CityPicker
                  className="w100"
                  search={keywords}
                  level={3}
                  mustLast={false}
                  callback={changeCity}
                  destroyPopupOnHide={true}
                  showConfirmBtn={false}
                  onClear={() => setKeywords('')}
                  handleVisible={value => setCityPickerVisible(value)}
                >
                  <button type="button" className="cityPickerBox flexRow">
                    <Input
                      className="flex mRight20 ellipsis CityPicker-input-textCon"
                      placeholder={placeholder}
                      value={!!keywords ? keywords : cityPath}
                      onChange={value => {
                        setKeywords(value);
                        if (!value) {
                          setCityPath('');
                        }
                      }}
                    />
                    {!!cityPath && (
                      <Icon
                        icon="workflow_cancel"
                        className="Font12 Gray_9e customFormButtoDel"
                        onClick={e => {
                          setCityPath('');
                          e.stopPropagation();
                        }}
                      />
                    )}
                    <Icon icon="text_map" className="Font16 Gray_bd" />
                  </button>
                </CityPicker>
              ) : (
                <Input
                  className="w100"
                  placeholder={placeholder}
                  value={contractInfo[key]}
                  onChange={val => setContractInfo({ ...contractInfo, [key]: val })}
                />
              )}
            </div>
          </FormGroup>
        );
      })}
    </DialogWrap>
  );
}
