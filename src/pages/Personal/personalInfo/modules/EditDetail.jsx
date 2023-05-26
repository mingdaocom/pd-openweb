import React from 'react';
import account from 'src/api/account';
import cx from 'classnames';
import { DatePicker, RadioGroup } from 'ming-ui';
import './index.less';
import moment from 'moment';
import fixedDataAjax from 'src/api/fixedData.js';
export default class EditDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseInfo: this.props.baseInfo || {},
      isError: false,
      errTxtInfo: [],
    };
  }

  updateValue(key, value) {
    this.setState(preState => ({
      baseInfo: {
        ...preState.baseInfo,
        [key]: value,
      },
    }));
  }

  saveBaseInfo = () => {
    const { isError, baseInfo, errTxtInfo } = this.state;
    if (isError || errTxtInfo.length > 0) {
      return;
    }
    Promise.all([
      fixedDataAjax.checkSensitive({ content: baseInfo.fullname }),
      fixedDataAjax.checkSensitive({ content: baseInfo.companyName }),
      fixedDataAjax.checkSensitive({ content: baseInfo.profession }),
      fixedDataAjax.checkSensitive({ content: baseInfo.address }),
    ]).then(
      results => {
        if (!results.find(result => result)) {
          account
            .editAccountBasicInfo(baseInfo)
            .then(data => {
              if (data) {
                alert(_l('编辑成功'), 1);
                this.props.updateValue(baseInfo);
                this.props.closeDialog();
              } else {
                alert(_l('编辑失败'), 2);
              }
            })
            .fail();
        } else {
          alert(_l('输入内容包含敏感词，请重新填写'), 3);
        }
      },
      () => {},
    );
  };

  setTxterr = (e, domStr) => {
    const { errTxtInfo } = this.state;
    fixedDataAjax.checkSensitive({ content: e.target.value }).then(res => {
      if (res) {
        this.setState({ errTxtInfo: errTxtInfo.concat(domStr) });
      } else {
        this.setState({ errTxtInfo: errTxtInfo.filter(o => o !== domStr) });
      }
    });
  };

  renderErrTxt = () => {
    return (
      <div className="Red errorBox">
        <span>{_l('输入内容包含敏感词，请重新填写')}</span>
      </div>
    );
  };

  render() {
    const { baseInfo, isError, errTxtInfo = [] } = this.state;
    return (
      <div className="baseInfoEditContent Gray">
        {/**姓名 */}
        <div className="Bold">
          {_l('姓名')}
          <span className="TxtMiddle Red">*</span>
        </div>
        <input
          type="text"
          className={cx('formControl mTop6', { error: isError })}
          defaultValue={baseInfo.fullname}
          onChange={e => {
            this.updateValue('fullname', e.target.value);
          }}
          onBlur={e => {
            if (!!baseInfo.fullname) {
              this.setTxterr(e, 'fullname');
            } else {
              this.setState({ isError: !baseInfo.fullname });
            }
          }}
          onFocus={() => this.setState({ isError: false })}
        />
        <div className="Red errorBox">
          <span className={cx({ Hidden: !isError && !errTxtInfo.includes('fullname') })}>
            {errTxtInfo.includes('fullname') ? _l('输入内容包含敏感词，请重新填写') : _l('姓名不能为空')}
          </span>
        </div>
        {/**生日 */}
        <div className="Bold">{_l('生日')}</div>
        <DatePicker
          selectedValue={baseInfo.birthdate ? moment(baseInfo.birthdate) : moment('19900101')}
          min={moment('19500101')}
          max={moment(`${new Date().getFullYear() - 18}0101`)}
          onClear={() => {
            this.updateValue('birthdate', '');
          }}
          onSelect={date => {
            if (date) {
              this.updateValue('birthdate', moment(date).format('YYYY-MM-DD'));
            }
          }}
        >
          <input
            className="formControl mTop6 mBottom24"
            value={baseInfo.birthdate ? moment(baseInfo.birthdate).format('YYYY-MM-DD') : ''}
          />
        </DatePicker>
        {/**性别 */}
        <div className="Bold">{_l('性别')}</div>
        <RadioGroup
          className="wsRadioGroup mTop6 mBottom24"
          data={[
            {
              value: 1,
              text: _l('男'),
            },
            {
              value: 2,
              text: _l('女'),
            },
          ]}
          checkedValue={baseInfo.gender}
          onChange={value => {
            this.updateValue('gender', value);
          }}
          size="small"
        />
        {/**组织名称 */}
        <div className="Bold">{_l('组织名称')}</div>
        <input
          type="text"
          className="mTop6 formControl"
          maxLength={50}
          value={baseInfo.companyName}
          onChange={e => {
            this.updateValue('companyName', e.target.value);
          }}
          onBlur={e => {
            this.setTxterr(e, 'companyName');
          }}
        />
        {errTxtInfo.includes('companyName') && this.renderErrTxt()}
        {/**职位 */}
        <div className="Bold mTop24">{_l('职位')}</div>
        <input
          type="text"
          className="mTop6 formControl"
          maxLength={50}
          value={baseInfo.profession}
          onChange={e => {
            this.updateValue('profession', e.target.value);
          }}
          onBlur={e => {
            this.setTxterr(e, 'profession');
          }}
        />
        {errTxtInfo.includes('profession') && this.renderErrTxt()}
        {/**职位 */}
        <div className="Bold mTop24">{_l('居住地址')}</div>
        <input
          type="text"
          className="mTop6 formControl"
          value={baseInfo.address}
          onChange={e => {
            this.updateValue('address', e.target.value);
          }}
          onBlur={e => {
            this.setTxterr(e, 'address');
          }}
        />
        {errTxtInfo.includes('address') && this.renderErrTxt()}
        <div className="mTop20 mBottom24 flexEnd ">
          <button
            type="button"
            className="ming Button Button--link Gray_9e mRight30"
            onClick={() => this.props.closeDialog()}
          >
            {_l('取消')}
          </button>
          <button type="button" className="ming Button Button--primary saveBtn" onClick={() => this.saveBaseInfo()}>
            {_l('确认')}
          </button>
        </div>
      </div>
    );
  }
}
