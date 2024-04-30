import React from 'react';
import { Dropdown } from 'ming-ui';
import filterXSS from 'xss';
import 'src/pages/accountLogin/components/message.less';
import cx from 'classnames';
import RegisterController from 'src/api/register';
import { ActionResult, scaleList, depList, rankList, isInterestedList } from 'src/pages/accountLogin/config.js';
import { setWarnningData, registerSuc } from 'src/pages/accountLogin/util.js';
import { setPssId } from 'src/util/pssId';
import styled from 'styled-components';
import fixedDataAjax from 'src/api/fixedData.js';
import _ from 'lodash';

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
      industryList: [],
      warnningData: [],
      focusDiv: '',
      companyList: [],
      show: false,
      tpCompanyId: -1,
      isInterested: null,
    };
  }

  componentDidMount() {
    setTimeout(() => {
      if (this.companyName) {
        $(this.companyName).focus();
        $(this.companyName).bind('keydown', this.onInputBoxKeyDown);
      }
    }, 300);

    fixedDataAjax.loadIndustry({}).then(res => {
      this.setState({
        industryList: (res.industries || []).filter(o => o.isEnable === 1),
      });
    });
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
    this.validateCompanyInfoRequiredField().then(res => {
      if (!res) {
        return;
      }
      this.props.updateState({ lineLoading: true });
      const { registerData, company = {} } = this.props;
      let { TPParams, email = '', emailOrTel = '' } = registerData;
      email = emailOrTel && RegExp.isEmail(emailOrTel) ? emailOrTel : email;
      const {
        companyName,
        tpCompanyId,
        scaleId,
        scale = '',
        code,
        jobType,
        departmentType,
        industryId,
        industry = '',
      } = company;
      const { isInterested } = this.state;
      let param = {};

      if (!md.global.Config.IsLocal) {
        param = { isInterested };
      }

      RegisterController.createCompany({
        companyName: filterXSS(companyName),
        tpCompanyId: tpCompanyId,
        jobType,
        departmentType,
        industryId,
        industry,
        code: code,
        email: email,
        scaleId: scaleId,
        scale,
        unionId: TPParams.unionId,
        state: TPParams.state,
        tpType: TPParams.tpType,
        regFrom: window.localStorage.getItem('RegFrom'),
        referrer: window.localStorage.getItem('Referrer'),
        ...param,
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

  inputOnBlur = e => {
    this.setState({ focusDiv: '' });
  };

  // 企业网络基本信息 字段验证
  validateCompanyInfoRequiredField = async () => {
    this.setState({
      warnningText: '',
      tipDom: null,
    });
    const { isInterested } = this.state;
    const { company = {} } = this.props;
    const { companyName, jobType, departmentType, scaleId, industryId } = company;
    // 企业网络名称
    let isRight = true;
    let warnningData = [];

    if (!companyName) {
      warnningData.push({ tipDom: this.companyName, warnningText: _l('请填写组织名称') });
      isRight = false;
    }

    if (!!companyName) {
      await fixedDataAjax.checkSensitive({ content: companyName }).then(res => {
        if (res) {
          warnningData.push({ tipDom: this.companyName, warnningText: _l('输入内容包含敏感词，请重新填写') });
          isRight = false;
        }
      });
    }

    // 行业
    if (!industryId) {
      warnningData.push({ tipDom: this.industry, warnningText: _l('请选择行业') });
      isRight = false;
    }

    // 公司规模
    if (!scaleId) {
      warnningData.push({ tipDom: this.scaleId, warnningText: _l('请选择规模') });
      isRight = false;
    }

    // 职位
    if (!jobType) {
      warnningData.push({ tipDom: this.rank, warnningText: _l('请选择您的职级') });
      isRight = false;
    }

    // 您的职级
    if (!departmentType) {
      warnningData.push({ tipDom: this.department, warnningText: _l('请选择您的部门') });
      isRight = false;
    }

    if (![0, 1].includes(isInterested) && !md.global.Config.IsLocal) {
      warnningData.push({ tipDom: this.isInterested, warnningText: _l('请选择') });
      isRight = false;
    }

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
    const { warnningData, focusDiv, companyList, show, tpCompanyI, industryList = [], isInterested } = this.state;
    const { companyName, jobType, industryId, scaleId, departmentType } = company;

    return (
      <React.Fragment>
        <div className="messageBox mTop5">
          <div
            className={cx('mesDiv', {
              ...setWarnningData(warnningData, [this.companyName, '.companyName'], focusDiv, companyName),
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
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.companyName),
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
                $(this.companyName).focus();
              }}
            >
              {_l('组织名称')}
            </div>
          </div>
          <div
            className={cx('mesDiv current', {
              ...setWarnningData(warnningData, [this.industry, '.industry'], focusDiv, industryId),
            })}
          >
            <Dropdown
              showItemTitle
              value={industryId || undefined}
              ref={c => (this.industry = c)}
              onChange={value => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.industry),
                });
                this.props.updateCompany({
                  industryId: value,
                  industry: (industryList.find(o => value === o.id) || {}).name,
                });
              }}
              onBlur={this.inputOnBlur}
              onFocus={() => this.inputOnFocus('.industry')}
              data={industryList.map(o => {
                return { value: o.id, text: o.name };
              })}
            />
            <div
              className="title"
              onClick={e => {
                $(this.industry).focus();
              }}
            >
              {_l('行业')}
            </div>
          </div>
          <div
            className={cx('mesDiv current', {
              ...setWarnningData(warnningData, [this.scaleId], focusDiv, scaleId),
              current: !!scaleId,
            })}
          >
            <Dropdown
              showItemTitle
              value={scaleId || undefined}
              ref={c => (this.scaleId = c)}
              onChange={value => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.scaleId),
                });
                this.props.updateCompany({
                  scaleId: value,
                  scale: scaleList[value - 1],
                });
              }}
              onBlur={this.inputOnBlur}
              onFocus={() => this.inputOnFocus(this.scaleId)}
              data={scaleList.map((o, i) => {
                return { value: i + 1, text: o };
              })}
            />

            <div className="title">{_l('规模')}</div>
          </div>
          <div
            className={cx('mesDiv current', {
              ...setWarnningData(warnningData, [this.rank], focusDiv, jobType),
            })}
          >
            <Dropdown
              showItemTitle
              ref={c => (this.rank = c)}
              value={jobType ? rankList.findIndex(o => o === jobType) : undefined}
              onChange={value => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.rank),
                });
                this.props.updateCompany({
                  jobType: rankList[value],
                });
              }}
              onBlur={this.inputOnBlur}
              onFocus={() => this.inputOnFocus(this.rank)}
              data={rankList.map((o, i) => {
                return { value: i, text: o };
              })}
            />
            <div className="title">{_l('您的职级')}</div>
          </div>
          <div
            className={cx('mesDiv current', {
              ...setWarnningData(warnningData, [this.department, '.department'], focusDiv, departmentType),
            })}
          >
            <Dropdown
              showItemTitle
              ref={c => (this.department = c)}
              value={departmentType ? depList.findIndex(o => o === departmentType) : undefined}
              onChange={value => {
                this.setState({
                  warnningData: _.filter(warnningData, it => it.tipDom !== this.department),
                });
                this.props.updateCompany({
                  departmentType: depList[value],
                });
              }}
              onBlur={this.inputOnBlur}
              onFocus={() => this.inputOnFocus(this.department)}
              data={depList.map((o, i) => {
                return { value: i, text: o };
              })}
            />
            <div className="title">{_l('您的部门')}</div>
          </div>
          {!md.global.Config.IsLocal && (
            <div
              className={cx('mesDiv current', {
                ...setWarnningData(warnningData, [this.isInterested], focusDiv, jobType),
              })}
            >
              <Dropdown
                showItemTitle
                ref={c => (this.isInterested = c)}
                value={isInterested}
                onChange={isInterested => {
                  this.setState({
                    warnningData: _.filter(warnningData, it => it.tipDom !== this.isInterested),
                    isInterested,
                  });
                }}
                onBlur={this.inputOnBlur}
                onFocus={() => this.inputOnFocus(this.isInterested)}
                data={isInterestedList}
                renderTitle={() => {
                  return isInterestedList.find(o => o.value === isInterested).text;
                }}
              />
              <div className="title">{_l('用户类型')}</div>
            </div>
          )}
        </div>
      </React.Fragment>
    );
  };

  render() {
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
