import React, { useEffect, useMemo, useRef } from 'react';
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
import { Wrap, WrapCon, WrapConDp } from './style';

export default function (props) {
  const { updateCompany = () => {}, onChange = () => {} } = props;
  const [{ warnList, focusDiv, companyList, show, tpCompanyId, loading, extraList, geoCountryRegionCode }, setState] =
    useSetState({
      warnList: [],
      focusDiv: '',
      companyList: [],
      show: false,
      tpCompanyId: -1,
      loading: true,
      extraList: [],
      geoCountryRegionCode: _.get(md, 'global.Config.DefaultRegion') || 'CN',
    });
  const companyNameRef = useRef();
  let ajax = null;

  const debouncedRequest = useMemo(
    () =>
      _.debounce(searchKeyword => {
        getByKeywords(searchKeyword);
      }, 500),
    [],
  );

  const requestDebounce = searchKeyword => debouncedRequest(searchKeyword);

  useEffect(() => {
    fixedDataAjax.loadExtraDatas({}).then(res => {
      setState({
        loading: false,
        extraList: res,
      });
    });
    return () => debouncedRequest.cancel();
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
      const { companyName, tpCompanyId, code } = company;
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
        tpCompanyId,
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

  const getByKeywords = searchKeyword => {
    if (ajax) ajax.abort();
    ajax = RegisterController.getCompanyInfo({ companynameKeyword: searchKeyword });
    ajax.then(res => {
      const ids = _.keys(res);
      setState({
        companyList: ids.map(o => {
          return { name: res[o], id: o };
        }),
      });
    });
  };

  const onInputBoxKeyDown = e => {
    if (companyList.length <= 0) {
      setState({ tpCompanyId: -1 });
      return;
    }
    switch (e.keyCode) {
      case 38: //up
        if (tpCompanyId - 1 < 0) {
          setCompany(companyList.length - 1);
        } else {
          setCompany(tpCompanyId - 1);
        }
        break;
      case 40: //KEY.DOWN:
        if (tpCompanyId + 1 > companyList.length - 1) {
          setCompany(0);
        } else {
          setCompany(tpCompanyId + 1);
        }
    }
  };

  const setCompany = tpCompanyId => {
    let o = companyList[tpCompanyId];
    updateCompany({ companyName: o.name, tpCompanyId: o.id });
    setState({ tpCompanyId });
  };

  const renderTxt = o => {
    const { company = {} } = props;
    const { companyName } = company;
    let start = o.name.toLowerCase().indexOf(companyName.toLowerCase());
    let l = companyName.length;
    let str = o.name.split('');
    let stmp = o.name;

    if (start >= 0) {
      let s = stmp.slice(start, start + l);
      str.splice(start, l, <span class="ThemeColor3">{s}</span>);
    }
    return str;
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
              onKeyDown={onInputBoxKeyDown}
              onBlur={() => setState({ focusDiv: '' })}
              onFocus={() => setState({ show: true, focusDiv: 'companyName' })}
              onChange={e => {
                setState({ warnList: _.filter(warnList, it => it.tipDom !== 'companyName') });
                updateCompany({ companyName: e.target.value });
                if (e.target.value.length >= 2) {
                  requestDebounce(e.target.value);
                }
              }}
            />
            {companyName && companyList.length > 0 && show && (
              <WrapCon className="companyList">
                <div className="cover" onClick={() => setState({ show: false })}></div>
                {companyList.map((o, i) => {
                  return (
                    <div
                      className={cx('liBox Hand', { isCur: tpCompanyId === i })}
                      onClick={() => {
                        updateCompany({ companyName: o.name, tpCompanyId: o.id });
                        setState({ companyList: [] });
                      }}
                    >
                      {renderTxt(o)}
                    </div>
                  );
                })}
              </WrapCon>
            )}
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
            <span className="Font16 backspace Gray_9e"></span> {_l('返回')}
          </span>
        )}
        <div className="title mTop24">{_l('创建组织')}</div>
        <p className="mTop15 Gray_9e Font15">{_l('您当前账号默认成为组织的管理员')}</p>
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
