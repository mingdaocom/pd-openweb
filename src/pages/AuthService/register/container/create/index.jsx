import React, { useEffect, useRef } from 'react';
import { useSetState } from 'react-use';
import cx from 'classnames';
import _ from 'lodash';
import filterXSS from 'xss';
import { LoadDiv } from 'ming-ui';
import fixedDataAjax from 'src/api/fixedData.js';
import RegisterController from 'src/api/register';
import CompanyDrop from 'src/pages/AuthService/components/companyDrop';
import { ActionResult } from 'src/pages/AuthService/config.js';
import { registerSuc } from 'src/pages/AuthService/util.js';
import RegExpValidator from 'src/utils/expression';
import { setPssId } from 'src/utils/pssId';
import SelectCountry from './SelectCountry';
import { Wrap, WrapConDp } from './style';

export default function (props) {
  const { updateCompany = () => {}, onChange = () => {} } = props;
  const [{ warnList, focusDiv, loading, extraList, geoCountryRegionCode }, setState] = useSetState({
    warnList: [],
    focusDiv: '',
    loading: true,
    extraList: [],
    geoCountryRegionCode: _.get(md, 'global.Config.DefaultRegion') || 'CN',
  });
  const companyNameRef = useRef();

  useEffect(() => {
    fixedDataAjax.loadExtraDatas({}).then(res => {
      setState({
        loading: false,
        extraList: res,
      });
    });
  }, []);

  useEffect(() => {
    if (companyNameRef.current) companyNameRef.current.value = _.get(props, 'company.companyName');
  }, [_.get(props, 'company.companyName')]);

  // 提交企业网络信息
  const submitCompanyInfo = () => {
    validateCompanyInfoRequiredField().then(res => {
      if (!res) {
        return;
      }
      onChange({ lineLoading: true });
      let { TPParams = {}, email = '', emailOrTel = '', company = {} } = props;
      email = emailOrTel && RegExpValidator.isEmail(emailOrTel) ? emailOrTel : email;
      const { companyName, code } = company;
      const extraDatas = JSON.stringify(
        extraList.map(o => {
          return {
            id: o.id,
            value: _.get(company, `extraDatas.${o.id}`) || '',
          };
        }),
      );
      RegisterController.createCompany({
        companyName: filterXSS(companyName),
        code,
        email,
        unionId: TPParams.unionId,
        state: TPParams.state,
        tpType: TPParams.tpType,
        regFrom: window.localStorage.getItem('RegFrom'),
        referrer: window.localStorage.getItem('Referrer'),
        extraDatas,
        geoCountryRegionCode: geoCountryRegionCode,
      })
        .then(data => {
          window.localStorage.removeItem('RegFrom');
          window.localStorage.removeItem('Referrer');
          onChange({ lineLoading: false });

          if (data.actionResult == ActionResult.success) {
            setPssId(data.sessionId);
            registerSuc(props, 'enterpriseRegister.createSuccess');
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            alert(_l('账号不存在'), 3);
          } else if (data.actionResult == ActionResult.userFromError) {
            alert(_l('账号来源类型受限'), 3);
          } else {
            alert(_l('操作失败'), 3);
          }
        })
        .catch(() => {
          onChange({ lineLoading: false });
        });
    });
  };

  // 企业网络基本信息 字段验证
  const validateCompanyInfoRequiredField = async () => {
    setState({ warnTxt: '', tipDom: null });
    const { company = {} } = props;
    const { companyName, extraDatas = {} } = company;
    // 企业网络名称
    let isRight = true;
    let warnList = [];

    if (!companyName) {
      warnList.push({ tipDom: 'companyName', warnTxt: _l('请填写组织名称') });
      isRight = false;
    }

    if (companyName) {
      await fixedDataAjax.checkSensitive({ content: companyName }).then(res => {
        if (res) {
          warnList.push({ tipDom: 'companyName', warnTxt: _l('输入内容包含敏感词，请重新填写') });
          isRight = false;
        }
      });
    }

    if (!geoCountryRegionCode) {
      warnList.push({ tipDom: 'geoCountryRegionCode', warnTxt: _l('请选择国家和地区') });
      isRight = false;
    }

    extraList
      .filter(o => o.required === 1)
      .forEach(o => {
        if (!extraDatas[o.id]) {
          warnList.push({
            tipDom: o.id,
            warnTxt: o.type === 3 ? _l('请选择%0', o.name) : _l('请输入%0', o.name),
          });
          isRight = false;
        }
      });

    setState({ warnList });
    return isRight;
  };

  const renderCon = () => {
    const { company = {} } = props;
    const { companyName, extraDatas = {} } = company;

    const renderClassName = (key, value) => {
      const warn = warnList.find(o => o.tipDom === key + '');
      return {
        hasValue: !!value || focusDiv === key + '',
        errorDiv: warn,
        warnDiv: warn && warn.noErr,
        errorDivCu: !!focusDiv && focusDiv === key + '',
      };
    };

    const onVisibleChange = (show, key, value) => {
      if (show) {
        setState({ focusDiv: key });
      } else {
        if (!value) {
          setState({ focusDiv: '' });
        }
      }
    };

    return (
      <React.Fragment>
        <Wrap className="messageBox mTop5">
          <div className={cx('mesDiv', renderClassName('companyName', companyName))}>
            <input
              type="text"
              maxLength={'60'}
              className="companyName"
              autoComplete="off"
              autoFocus
              ref={companyNameRef}
              onBlur={() => setState({ focusDiv: '' })}
              onFocus={() => setState({ focusDiv: 'companyName' })}
              onChange={e => {
                setState({ warnList: _.filter(warnList, it => it.tipDom !== 'companyName') });
                updateCompany({ companyName: e.target.value });
              }}
            />
            <div className="title" onClick={() => setState({ focusDiv: 'companyName' })}>
              {_l('组织名称')}
            </div>
          </div>
          <div
            className={cx(
              'mesDiv mesDivDrop mesDivDrop_geoCountryRegionCode',
              renderClassName('geoCountryRegionCode', geoCountryRegionCode),
            )}
          >
            <WrapConDp>
              <SelectCountry
                geoCountryRegionCode={geoCountryRegionCode}
                onChange={geoCountryRegionCode => {
                  setState({
                    geoCountryRegionCode,
                    focusDiv: '',
                    warnList: warnList.filter(it => it.tipDom !== 'geoCountryRegionCode'),
                  });
                }}
                onVisibleChange={show => onVisibleChange(show, 'geoCountryRegionCode', geoCountryRegionCode)}
              />
            </WrapConDp>
            <div className="title" onClick={() => setState({ focusDiv: 'geoCountryRegionCode' })}>
              {_l('国家和地区')}
            </div>
          </div>
          {extraList.map(o => {
            //id：自定义，字符串不重复
            //name：前端显示字段名称
            //required：1代表必填；0代表可不填。注意：后端不会进行校验，前端要校验
            //type：1 为文本；2为数值；3为选项
            // （multiple：1代表可多选；0代表单选）
            if (o.type === 3) {
              return (
                <div className={cx(`mesDiv mesDivDrop mesDivDrop_${o.id}`, renderClassName(o.id, extraDatas[o.id]))}>
                  <CompanyDrop
                    extraDatas={extraDatas || {}}
                    extraList={extraList || []}
                    updateCompany={data => {
                      updateCompany(data);
                      setState({ focusDiv: '', warnList: warnList.filter(it => it.tipDom !== o.id) });
                    }}
                    updateState={data => setState({ ...data })}
                    info={o}
                    warnList={warnList}
                    onVisibleChange={show => onVisibleChange(show, o.id, extraDatas[o.id])}
                  />
                  <div className="title" onClick={() => setState({ focusDiv: o.id })}>
                    {o.name}
                  </div>
                </div>
              );
            } else {
              return (
                <div className={cx('mesDiv', renderClassName(o.id, extraDatas[o.id]))}>
                  <input
                    type="text"
                    className={o.id}
                    autoComplete="off"
                    onBlur={e => {
                      let value = e.target.value;
                      setState({ focusDiv: '' });
                      updateCompany({ extraDatas: { ...extraDatas, [o.id]: value.trim() } });
                    }}
                    onFocus={() => setState({ focusDiv: o.id })}
                    onChange={e => {
                      let value = e.target.value;
                      if (o.type === 2) {
                        //数值类型
                        value = e.target.value.replace(/[^\d]/g, '');
                      }
                      setState({ focusDiv: '', warnList: warnList.filter(it => it.tipDom !== o.id) });
                      updateCompany({ extraDatas: { ...extraDatas, [o.id]: value } });
                    }}
                    value={extraDatas[o.id] || ''}
                    placeholder={extraDatas[o.id] || ''}
                  />
                  <div className="title" onClick={() => setState({ focusDiv: o.id })}>
                    {o.name}
                  </div>
                </div>
              );
            }
          })}
        </Wrap>
      </React.Fragment>
    );
  };

  if (loading) return <LoadDiv />;
  return (
    <React.Fragment>
      <div className="titleHeader">
        {!location.href.match(/enterpriseRegister(\.htm)?\?type=create/i) && (
          <span className="mTop40 Font15 InlineBlock Hand backspaceT" onClick={() => onChange({ step: 'createOrAdd' })}>
            <span className="Font16 backspace textTertiary"></span> {_l('返回')}
          </span>
        )}
        <div className="title mTop24">{_l('创建组织')}</div>
        <p className="mTop15 textTertiary Font15">{_l('您当前账号默认成为组织的管理员')}</p>
      </div>
      {renderCon()}
      <span
        className="btnForRegister Hand"
        onClick={() => {
          if (props.lineLoading) return;
          submitCompanyInfo();
        }}
      >
        {props.lineLoading ? _l('创建...') : _l('创建')}
      </span>
    </React.Fragment>
  );
}
