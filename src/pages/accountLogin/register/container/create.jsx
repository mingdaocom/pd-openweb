import React from 'react';
import { LoadDiv } from 'ming-ui';
import filterXSS from 'xss';
import 'src/pages/accountLogin/components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import { ActionResult } from 'src/pages/accountLogin/config.js';
import { setWarnningData, registerSuc, warnningTipFn } from 'src/pages/accountLogin/util.js';
import { setPssId } from 'src/util/pssId';
import styled from 'styled-components';
import RegExpValidator from 'src/util/expression';
import fixedDataAjax from 'src/api/fixedData.js';
import _ from 'lodash';
import CompanyDrop from 'src/pages/accountLogin/components/companyDrop';

const WrapCon = styled.div`
  position: absolute;
  top: 100%;
  background: #fff;
  z-index: 10;
  width: 100%;
  padding: 6px 0;
  box-shadow: 0px 8px 16px rgb(0 0 0 / 24%);
  border-radius: 2px;
  overflow: auto;
  max-height: 400px;
  .cover {
    position: fixed;
    z-index: -1;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
  & > div.liBox {
    padding: 6px 8px;
    &:hover,
    &.isCur {
      background: #2196f3;
      color: #fff;
      .ThemeColor3 {
        color: #fff !important;
      }
    }
  }
`;

export default class Create extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      warnningData: [],
      focusDiv: '',
      companyList: [],
      show: false,
      tpCompanyId: -1,
      loading: true,
      extraList: [],
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.companyName) {
        $(this.companyName).focus();
        $(this.companyName).bind('keydown', this.onInputBoxKeyDown);
      }
    }, 300);
    fixedDataAjax.loadExtraDatas({}).then(res => {
      this.setState({
        loading: false,
        extraList: res,
      });
    });
  }

  // 提交企业网络信息
  submitCompanyInfo = () => {
    this.validateCompanyInfoRequiredField().then(res => {
      if (!res) {
        return;
      }
      this.props.updateState({ lineLoading: true });
      const { registerData, company = {} } = this.props;
      let { TPParams, email = '', emailOrTel = '' } = registerData;
      email = emailOrTel && RegExpValidator.isEmail(emailOrTel) ? emailOrTel : email;
      const { companyName, tpCompanyId, code } = company;
      const extraDatas = JSON.stringify(
        this.state.extraList.map(o => {
          return {
            id: o.id,
            value: _.get(company, `extraDatas.${o.id}`) || '',
          };
        }),
      );
      RegisterController.createCompany({
        companyName: filterXSS(companyName),
        tpCompanyId: tpCompanyId,
        code: code,
        email: email,
        unionId: TPParams.unionId,
        state: TPParams.state,
        tpType: TPParams.tpType,
        regFrom: window.localStorage.getItem('RegFrom'),
        referrer: window.localStorage.getItem('Referrer'),
        extraDatas,
      })
        .then(data => {
          window.localStorage.removeItem('RegFrom');
          window.localStorage.removeItem('Referrer');
          this.props.updateState({ lineLoading: false });

          if (data.actionResult == ActionResult.success) {
            setPssId(data.sessionId);
            registerSuc(this.props.registerData, 'enterpriseRegister.createSuccess');
          } else if (data.actionResult == ActionResult.userInfoNotFound) {
            alert(_l('账号不存在'), 3);
          } else if (data.actionResult == ActionResult.userFromError) {
            alert(_l('账号来源类型受限'), 3);
          } else {
            alert(_l('操作失败'), 3);
          }
        })
        .catch(() => {
          this.props.updateState({ lineLoading: false });
        });
    });
  };

  inputOnFocus = e => {
    this.setState({ focusDiv: e });
  };

  inputOnBlur = () => {
    this.setState({ focusDiv: '' });
  };

  // 企业网络基本信息 字段验证
  validateCompanyInfoRequiredField = async () => {
    this.setState({
      warnningText: '',
      tipDom: null,
    });
    const { extraList } = this.state;
    const { company = {} } = this.props;
    const { companyName, extraDatas = {} } = company;
    // 企业网络名称
    let isRight = true;
    let warnningData = [];

    if (!companyName) {
      warnningData.push({ tipDom: '.companyName', warnningText: _l('请填写组织名称') });
      isRight = false;
    }

    if (!!companyName) {
      await fixedDataAjax.checkSensitive({ content: companyName }).then(res => {
        if (res) {
          warnningData.push({ tipDom: '.companyName', warnningText: _l('输入内容包含敏感词，请重新填写') });
          isRight = false;
        }
      });
    }

    extraList
      .filter(o => o.required === 1)
      .map(o => {
        if (!extraDatas[o.id]) {
          warnningData.push({
            tipDom: `.${o.id}`,
            warnningText: o.type === 3 ? _l('请选择%0', o.name) : _l('请输入%0', o.name),
          });
          isRight = false;
        }
      });

    this.setState({ warnningData });

    if (warnningData.length > 0) {
      $(warnningData[0].tipDom).focus();
    }

    return isRight;
  };

  getByKeywords = searchKeyword => {
    if (this.ajax) {
      this.ajax.abort();
    }

    this.ajax = RegisterController.getCompanyInfo({
      companynameKeyword: searchKeyword,
    });
    this.ajax.then(res => {
      const ids = _.keys(res);
      this.setState({
        companyList: ids.map(o => {
          return { name: res[o], id: o };
        }),
      });
    });
  };

  onInputBoxKeyDown = e => {
    let { companyList = [], tpCompanyI } = this.state;

    if (companyList.length <= 0) {
      this.setState({
        tpCompanyI: -1,
      });
      return;
    }

    switch (e.keyCode) {
      case 38: //up
        if (tpCompanyI - 1 < 0) {
          return this.setCompany(companyList.length - 1);
        } else {
          return this.setCompany(tpCompanyI - 1);
        }
      case 40: //KEY.DOWN:
        if (tpCompanyI + 1 > companyList.length - 1) {
          return this.setCompany(0);
        } else {
          return this.setCompany(tpCompanyI + 1);
        }
    }
  };

  setCompany = tpCompanyI => {
    let { companyList = [] } = this.state;
    let o = companyList[tpCompanyI];

    this.props.updateCompany({ companyName: o.name, tpCompanyId: o.id });
    this.setState({ tpCompanyI });
  };

  requestDebounce = _.debounce(searchKeyword => {
    this.getByKeywords(searchKeyword);
  }, 500);

  renderTxt = o => {
    const { company = {} } = this.props;
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

  renderCon = () => {
    const { company = {} } = this.props;
    const { warnningData, focusDiv, companyList, show, tpCompanyI, extraList } = this.state;
    const { companyName, extraDatas = {} } = company;

    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, ['.companyName'], focusDiv, companyName),
            })}
          >
            <input
              type="text"
              maxLength={'60'}
              className="companyName"
              autoComplete="off"
              ref={companyName => (this.companyName = companyName)}
              onBlur={this.inputOnBlur}
              onFocus={e => {
                this.setState({
                  show: true,
                });
                this.inputOnFocus('.companyName');
              }}
              onChange={e => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== '.companyName'),
                });
                if (e.target.value.length >= 2) {
                  this.requestDebounce(e.target.value);
                }
                this.props.updateCompany({
                  companyName: e.target.value,
                });
              }}
              value={companyName}
            />
            {companyName && companyList.length > 0 && show && (
              <WrapCon className="companyList">
                <div
                  className="cover"
                  onClick={() => {
                    this.setState({ show: false });
                  }}
                ></div>
                {companyList.map((o, i) => {
                  return (
                    <div
                      className={cx('liBox Hand', { isCur: tpCompanyI === i })}
                      onClick={() => {
                        this.props.updateCompany({ companyName: o.name, tpCompanyId: o.id });
                        this.setState({ companyList: [] });
                      }}
                    >
                      {this.renderTxt(o)}
                    </div>
                  );
                })}
              </WrapCon>
            )}
            <div
              className="title"
              onClick={e => {
                $('.companyName').focus();
              }}
            >
              {_l('组织名称')}
            </div>
            {warnningTipFn(warnningData, ['.companyName'], focusDiv)}
          </div>
          {extraList.map(o => {
            //id：自定义，字符串不重复
            //name：前端显示字段名称
            //required：1代表必填；0代表可不填。注意：后端不会进行校验，前端要校验
            //type：1 为文本；2为数值；3为选项
            // （multiple：1代表可多选；0代表单选）
            if (o.type === 3) {
              return (
                <div
                  className={cx('mesDiv current mesDivDrop', {
                    ...setWarnningData(warnningData, [`.${o.id}`], focusDiv, extraDatas[o.id]),
                  })}
                >
                  <CompanyDrop
                    extraDatas={extraDatas || {}}
                    extraList={this.state.extraList || []}
                    inputOnFocus={this.inputOnFocus}
                    inputOnBlur={this.inputOnBlur}
                    updateCompany={this.props.updateCompany}
                    updateState={data => {
                      this.setState({ ...data });
                    }}
                    info={o}
                    warnningData={warnningData}
                  />
                  <div
                    className="title"
                    onClick={() => {
                      $(`.${o.id}`).focus();
                    }}
                  >
                    {o.name}
                  </div>
                  {warnningTipFn(warnningData, [`.${o.id}`], focusDiv)}
                </div>
              );
            } else {
              return (
                <div
                  className={cx('mesDiv', {
                    ...setWarnningData(warnningData, [`.${o.id}`], focusDiv, extraDatas[o.id]),
                  })}
                >
                  <input
                    type="text"
                    className={o.id}
                    autoComplete="off"
                    onBlur={e => {
                      let value = e.target.value;
                      this.inputOnBlur();
                      this.props.updateCompany({
                        extraDatas: {
                          ...extraDatas,
                          [o.id]: value.trim(),
                        },
                      });
                    }}
                    onFocus={() => {
                      this.inputOnFocus(`.${o.id}`);
                    }}
                    onChange={e => {
                      let value = e.target.value;
                      if (o.type === 2) {
                        //数值类型
                        value = e.target.value.replace(/[^\d]/g, '');
                      }
                      this.setState({
                        warnningData: _.filter(warnningData, it => it.tipDom !== `.${o.id}`),
                      });
                      this.props.updateCompany({
                        extraDatas: {
                          ...extraDatas,
                          [o.id]: value,
                        },
                      });
                    }}
                    value={extraDatas[o.id] || ''}
                    placeholder={extraDatas[o.id] || ''}
                  />
                  <div
                    className="title"
                    onClick={e => {
                      $(`.${o.id}`).focus();
                    }}
                  >
                    {o.name}
                  </div>
                  {warnningTipFn(warnningData, [`.${o.id}`], focusDiv)}
                </div>
              );
            }
          })}
        </div>
      </React.Fragment>
    );
  };

  render() {
    if (this.state.loading) {
      return <LoadDiv />;
    }
    return (
      <React.Fragment>
        <div className="titleHeader">
          {!location.href.match(/enterpriseRegister(\.htm)?\?type=create/i) && (
            <span
              className="mTop40 Font15 InlineBlock Hand backspaceT"
              onClick={() => {
                this.props.setStep('createOrAdd');
              }}
            >
              <span className="Font16 backspace Gray_9e"></span> {_l('返回')}
            </span>
          )}
          <div className="title mTop24">{_l('创建组织')}</div>
          <p className="mTop15 Gray_9e Font15">{_l('您当前账号默认成为组织的管理员')}</p>
        </div>
        {this.renderCon()}
        <span
          className="btnForRegister Hand"
          onClick={() => {
            if (this.props.stateList.lineLoading) {
              return;
            }
            this.submitCompanyInfo();
          }}
        >
          {this.props.stateList.lineLoading ? _l('创建...') : _l('创建')}
        </span>
      </React.Fragment>
    );
  }
}
