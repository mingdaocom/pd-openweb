import React from 'react';
import { Dropdown } from 'ming-ui';
import filterXSS from 'xss';
import '../components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import Config from '../config';
import { getRequest } from 'src/util';
import { inputFocusFn, inputBlurFn, setCNFn } from '../util';
import { setPssId } from 'src/util/pssId';
import RegExp from 'src/util/expression';
import { browserIsMobile } from 'src/util';
import { getDataByFilterXSS } from '../util';
import styled from 'styled-components';
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
      dataArr: [
        {
          value: 1,
          text: _l('10人以下'),
        },
        {
          value: 2,
          text: _l('10～50人'),
        },
        {
          value: 3,
          text: _l('51～100人'),
        },
        {
          value: 4,
          text: _l('101～250人'),
        },
        {
          value: 5,
          text: _l('251～500人'),
        },
        {
          value: 6,
          text: _l('501人及以上'),
        },
      ],
      loading: false,
      // warnningText: '',
      // tipDom: "",
      warnningData: [],
      focusDiv: '',
      companyList: [],
      show: false,
      tpCompanyId: -1,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.companyName) {
        $(this.companyName).focus();
        $(this.companyName).bind('keydown', this.onInputBoxKeyDown);
      }
    }, 300);
  }

  componentWillReceiveProps(nextProps) {
    const { warnningData = [], focusDiv } = this.state;
    if (warnningData.length > 0) {
      if (!focusDiv) {
        $(warnningData[0].tipDom).focus();
      }
    }
  }

  // 提交企业网络信息
  submitCompanyInfo = () => {
    if (this.validateCompanyInfoRequiredField()) {
      this.setState({
        loading: true,
      });
      const { registerData, setDataFn } = this.props;
      const { company = {}, TPParams } = registerData;
      const {
        companyName,
        tpCompanyId,
        job, // 加入网络使用
        email, //邮箱
        scaleId, //预计人数
        code,
      } = company;
      RegisterController.createCompany({
        companyName: filterXSS(companyName),
        tpCompanyId: tpCompanyId,
        job,
        code: code,
        email: email,
        scaleId: scaleId,
        unionId: TPParams.unionId,
        state: TPParams.state,
        tpType: TPParams.tpType,
        regFrom: window.localStorage.getItem('RegFrom'),
        referrer: window.localStorage.getItem('Referrer'),
      })
        .then(data => {
          window.localStorage.removeItem('RegFrom');
          window.localStorage.removeItem('Referrer');
          this.setState({
            loading: false,
          });
          var actionResult = Config.ActionResult;
          if (data.actionResult == actionResult.success) {
            setPssId(data.sessionId);
            this.loginSuc(data.user.encrypeAccount, data.user.encrypePassword, data.user.projectId);
          } else if (data.actionResult == actionResult.userInfoNotFound) {
            alert(_l('账号不存在'), 3);
          } else if (data.actionResult == actionResult.userFromError) {
            alert(_l('账号来源类型受限'), 3);
          } else {
            alert(_l('操作失败'), 3);
          }
        })
        .fail(() => {
          this.setState({
            loading: false,
          });
        });
    }
  };

  // 登录成功跳转
  loginSuc = (encrypeAccount, encrypePassword, createProjectId) => {
    const { registerData } = this.props;
    const { inviteFromType } = registerData;
    let isMobile = browserIsMobile();
    let request = getRequest();
    let returnUrl = getDataByFilterXSS(request.ReturnUrl || '');

    if (returnUrl.indexOf('type=privatekey') > -1) {
      location.href = returnUrl;
    } else {
      location.href = '/app';
    }
  };

  inputOnFocus = e => {
    inputFocusFn(e, () => {
      this.setState({
        focusDiv: e.target,
      });
    });
  };

  inputOnBlur = e => {
    inputBlurFn(e, () => {
      this.setState({
        focusDiv: '',
      });
    });
  };

  // 企业网络基本信息 字段验证
  validateCompanyInfoRequiredField = () => {
    this.setState({
      warnningText: '',
      tipDom: null,
    });
    const { registerData, setDataFn } = this.props;
    const { company = {} } = registerData;
    const {
      companyName,
      job, // 加入网络使用
      email, //邮箱
      scaleId, //预计人数
    } = company;
    // 企业网络名称
    let isRight = true;
    let warnningData = [];
    if (!companyName) {
      warnningData.push({ tipDom: this.companyName, warnningText: _l('请填写组织名称') });
      isRight = false;
    }
    // 职位
    if (!job) {
      warnningData.push({ tipDom: this.job, warnningText: _l('请填写职位') });
      isRight = false;
    }
    // 邮箱
    if (!email) {
      warnningData.push({ tipDom: this.email, warnningText: _l('请填写邮箱') });
      isRight = false;
    }
    if (!RegExp.isEmail(email)) {
      warnningData.push({ tipDom: this.email, warnningText: _l('邮箱格式错误') });
      isRight = false;
    }
    // 公司规模
    if (!scaleId) {
      warnningData.push({ tipDom: this.scaleId, warnningText: _l('请选择预计使用人数') });
      isRight = false;
    }
    this.setState({
      warnningData,
    });
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
    const { registerData, setDataFn } = this.props;
    const { company = {} } = registerData;
    let { companyList = [] } = this.state;
    let o = companyList[tpCompanyI];
    setDataFn({
      ...registerData,
      company: {
        ...company,
        companyName: o.name,
        tpCompanyId: o.id,
      },
    });
    this.setState({
      tpCompanyI,
    });
  };

  requestDebounce = _.debounce(searchKeyword => {
    this.getByKeywords(searchKeyword);
  }, 500);

  renderTxt = o => {
    const { registerData } = this.props;
    const { company = {} } = registerData;
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
    const { changeStep, step, registerData, setDataFn } = this.props;
    const { company = {} } = registerData;
    const { warnningText, tipDom, warnningData, focusDiv, companyList, show, tpCompanyI } = this.state;
    const {
      companyName,
      job, // 加入网络使用
      email,
      scaleId,
    } = company;

    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          <div
            className={cx('mesDiv', {
              ...setCNFn(warnningData, [this.companyName, '.companyName'], focusDiv, companyName),
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
                this.inputOnFocus(e);
              }}
              onChange={e => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.companyName),
                });
                if (e.target.value.length >= 2) {
                  this.requestDebounce(e.target.value);
                }
                setDataFn({
                  ...registerData,
                  company: {
                    ...company,
                    companyName: e.target.value,
                  },
                });
              }}
              value={companyName}
            />
            {companyName && companyList.length > 0 && show && (
              <WrapCon className="companyList">
                <div
                  className="cover"
                  onClick={() => {
                    this.setState({
                      show: false,
                    });
                  }}
                ></div>
                {companyList.map((o, i) => {
                  return (
                    <div
                      className={cx('liBox Hand', { isCur: tpCompanyI === i })}
                      onClick={() => {
                        setDataFn({
                          ...registerData,
                          company: {
                            ...company,
                            companyName: o.name,
                            tpCompanyId: o.id,
                          },
                        });
                        this.setState({
                          companyList: [],
                        });
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
                $(this.companyName).focus();
              }}
            >
              {_l('组织名称')}
            </div>
            {_.find(warnningData, it => it.tipDom === this.companyName || it.tipDom === '.companyName') && (
              <div
                className={cx('warnningTip', {
                  Hidden:
                    (!!warnningData[0] && !_.includes([this.companyName, '.companyName'], warnningData[0].tipDom)) ||
                    warnningData[0].tipDom !== focusDiv,
                })}
              >
                {
                  _.find(warnningData, it => it.tipDom === this.companyName || it.tipDom === '.companyName')
                    .warnningText
                }
              </div>
            )}
          </div>
          <div
            className={cx('mesDiv', {
              ...setCNFn(warnningData, [this.job, '.job'], focusDiv, job),
            })}
          >
            <input
              type="text"
              className="job"
              maxLength={'60'}
              autoComplete="off"
              ref={job => (this.job = job)}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={e => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.job),
                });
                setDataFn({
                  ...registerData,
                  company: {
                    ...company,
                    job: e.target.value,
                  },
                });
              }}
              value={job}
            />
            <div
              className="title"
              onClick={e => {
                $(this.job).focus();
              }}
            >
              {_l('职位')}
            </div>
            {_.find(warnningData, it => it.tipDom === this.job || it.tipDom === '.job') && (
              <div
                className={cx('warnningTip', {
                  Hidden:
                    (!!warnningData[0] && !_.includes([this.job, '.job'], warnningData[0].tipDom)) ||
                    warnningData[0].tipDom !== focusDiv,
                })}
              >
                {_.find(warnningData, it => it.tipDom === this.job || it.tipDom === '.job').warnningText}
              </div>
            )}
          </div>
          <div
            className={cx('mesDiv', {
              ...setCNFn(warnningData, [this.email, '.email'], focusDiv, email),
            })}
          >
            <input
              type="text"
              className="email"
              maxLength={'60'}
              autoComplete="off"
              ref={email => (this.email = email)}
              onBlur={this.inputOnBlur}
              onFocus={this.inputOnFocus}
              onChange={e => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.email),
                });
                setDataFn({
                  ...registerData,
                  company: {
                    ...company,
                    email: e.target.value,
                  },
                });
              }}
              value={email}
            />
            <div
              className="title"
              onClick={e => {
                $(this.email).focus();
              }}
            >
              {_l('邮箱')}
            </div>
            {_.find(warnningData, it => it.tipDom === this.email || it.tipDom === '.email') && (
              <div
                className={cx('warnningTip', {
                  Hidden:
                    (!!warnningData[0] && !_.includes([this.email, '.email'], warnningData[0].tipDom)) ||
                    warnningData[0].tipDom !== focusDiv,
                })}
              >
                {_.find(warnningData, it => it.tipDom === this.email || it.tipDom === '.email').warnningText}
              </div>
            )}
          </div>
          <div
            className={cx('mesDiv current', {
              ...setCNFn(warnningData, [this.scaleId], focusDiv, scaleId),
              current: !!scaleId,
            })}
          >
            <div ref={scaleId => (this.scaleId = scaleId)}>
              <Dropdown
                // placeholder={_l('预计使用人数')}
                showItemTitle
                value={scaleId || undefined}
                onChange={value => {
                  this.setState({
                    warnningData: _.filter(warnningData, it => it.tipDom !== this.scaleId),
                  });
                  setDataFn({
                    ...registerData,
                    company: {
                      ...company,
                      scaleId: value,
                    },
                  });
                }}
                onBlur={this.inputOnBlur}
                onFocus={this.inputOnFocus}
                data={this.state.dataArr}
              />
            </div>
            <div className="title">{_l('预计人数')}</div>
            {_.find(warnningData, it => it.tipDom === this.scaleId) && (
              <div
                className={cx('warnningTip', {
                  Hidden:
                    (!!warnningData[0] && !_.includes([this.scaleId], warnningData[0].tipDom)) ||
                    warnningData[0].tipDom !== focusDiv,
                })}
              >
                {_.find(warnningData, it => it.tipDom === this.scaleId).warnningText}
              </div>
            )}
          </div>
        </div>
      </React.Fragment>
    );
  };

  render() {
    const { changeStep, step, registerData, setDataFn } = this.props;
    return (
      <React.Fragment>
        {this.state.loading && <div className="loadingLine"></div>}
        <div className="titleHeader">
          {location.href.indexOf('/enterpriseRegister.htm?type=create') < 0 && (
            <span
              className="mTop40 Font15 InlineBlock Hand backspaceT"
              onClick={() => {
                changeStep('createOrAdd');
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
            if (this.state.loading) {
              return;
            }
            this.submitCompanyInfo();
          }}
        >
          {this.state.loading ? _l('创建...') : _l('创建')}
        </span>
      </React.Fragment>
    );
  }
}
