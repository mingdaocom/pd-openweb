import React from 'react';
import account from 'src/api/account';
import cx from 'classnames';
import { DatePicker, RadioGroup } from 'ming-ui';
import './index.less';
import moment from 'moment';

export default class EditDetail extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      baseInfo: this.props.baseInfo || {},
      isError: false,
    };
  }

  updateValue(key, value) {
    this.setState(preState => ({
      baseInfo: {
        ...preState.baseInfo,
        [key]: value,
      }
    }));
  }

  saveBaseInfo() {
    const { isError, baseInfo } = this.state
    if(isError) {
      return
    }
    account.editAccountBasicInfo(baseInfo).then((data) => {
      if (data) {
        alert(_l('编辑成功'), 1);
        this.props.updateValue(baseInfo)
        this.props.closeDialog()
      } else {
        alert(_l('编辑失败'), 2);
      }
    }).fail();
  }

  render() {
    const { baseInfo, isError } = this.state;
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
          onChange={(e) => {
            this.updateValue('fullname', e.target.value)
          }}
          onBlur={() => {
            this.setState({ isError: !baseInfo.fullname })
          }}
          onFocus={() => this.setState({ isError: false })}
        />
        <div className='Red errorBox'><span className={cx({ Hidden: !isError })}>{_l('姓名不能为空')}</span></div>
        {/**生日 */}
        <div className="Bold">{_l('生日')}</div>
        <DatePicker
          selectedValue={baseInfo.birthdate ? moment(baseInfo.birthdate) : moment('19900101')}
          min={moment('19500101')}
          max={moment(`${new Date().getFullYear()-18}0101`)}
          onClear={() => {
            this.updateValue('birthdate', '');
          }}
          onSelect={date => {
            if (date) {
              this.updateValue('birthdate', moment(date).format('YYYY-MM-DD'));
            }
          }}
        >
          <input className="formControl mTop6 mBottom24" value={baseInfo.birthdate ? moment(baseInfo.birthdate).format('YYYY-MM-DD') : ''} />
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
          className="mTop6 mBottom24 formControl"
          value={baseInfo.companyName}
          onChange={e => {
            this.updateValue('companyName', e.target.value);
          }}
        />
        {/**职位 */}
        <div className="Bold">{_l('职位')}</div>
        <input
          type="text"
          className="mTop6 mBottom24 formControl"
          value={baseInfo.profession}
          onChange={e => {
            this.updateValue('profession', e.target.value);
          }}
        />
        {/**职位 */}
        <div className="Bold">{_l('居住地址')}</div>
        <input
          type="text"
          className="mTop6 mBottom24 formControl"
          value={baseInfo.address}
          onChange={e => {
            this.updateValue('address', e.target.value);
          }}
        />
        <div className="mTop20 flexEnd mBottom24">
          <button
            type="button"
            className="ming Button Button--link Gray_9e mRight30"
            onClick={() => this.props.closeDialog()}>
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
