import React, { Fragment } from 'react';
import account from 'src/api/account';
import './index.less';
import { Checkbox, DatePicker } from 'ming-ui';
import cx from 'classnames';
import moment from 'moment';
import fixedDataAjax from 'src/api/fixedData.js';
import _ from 'lodash';

const errorList = {
  name: false,
  title: false,
  startDate: false,
  endDate: false,
};

export default class AddOrEditItem extends React.Component {
  constructor(props) {
    super(props);
    const originItem = {
      autoId: 0,
      description: '',
      endDate: '',
      name: '',
      startDate: '',
      title: '',
      isSoFar: false,
    };
    const baseInfo = _.isArray(this.props.item) ? originItem : this.props.item;
    this.state = {
      baseInfo: { ...baseInfo, isSoFar: moment().format('YYYY-MM-DD') === baseInfo.endDate },
      errorList,
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

  updateError(key, value, content) {
    const { errorList = {}, errorSentry = {} } = this.state;
    if (['name', 'title'].includes(key) && !!content) {
      fixedDataAjax.checkSensitive({ content }).then(res => {
        this.setState({
          errorSentry: {
            ...errorSentry,
            [key]: res,
          },
          errorList: {
            ...errorList,
            [key]: value,
          },
        });
      });
    } else {
      this.setState(preState => ({
        errorList: {
          ...preState.errorList,
          [key]: value,
        },
      }));
    }
  }

  getRangeTime(type) {
    const day1 = new Date(
      type === 'max'
        ? new Date().getTime() - 24 * 60 * 60 * 1000
        : new Date(this.state.baseInfo.startDate).getTime() + 24 * 60 * 60 * 1000,
    );
    return moment(day1.getFullYear() + '-' + (day1.getMonth() + 1) + '-' + day1.getDate());
  }

  renderTitleErrorMsg() {
    const { baseInfo } = this.state;
    const { type } = this.props;
    if (!baseInfo.title) {
      return type === 1 ? _l('请输入职位') : _l('请输入专业和学历');
    } else if (!/^[A-Za-z0-9\u0391-\uFFE5 \.,()，。（）\-]+$/.exec($.trim(baseInfo.title))) {
      return type === 1 ? _l('职位名称不能含特殊字符') : _l('专业和学历不能含特殊字符');
    }
  }

  endDateError() {
    const { baseInfo } = this.state;
    let isError = false;
    if (baseInfo.isSoFar) {
      isError = false;
    } else {
      isError = !baseInfo.endDate;
    }
    return isError;
  }

  saveBaseInfo() {
    const { errorList, baseInfo = {}, errorSentry = {} } = this.state;
    let isError = false;
    Object.keys(errorList).forEach(key => {
      isError = key === 'endDate' ? this.endDateError() : !baseInfo[key];
      this.updateError([key], isError);
    });
    if (!isError && !errorSentry.name && !errorSentry.title) {
      Promise.all([
        fixedDataAjax.checkSensitive({ content: baseInfo.name }),
        fixedDataAjax.checkSensitive({ content: baseInfo.title }),
      ]).then(results => {
        if (!results.find(result => result)) {
          const resParams = { ...baseInfo, isSoFar: baseInfo.isSoFar ? 0 : 1, type: this.props.type };
          account
            .editAccountDetail(resParams)
            .then(data => {
              if (data) {
                alert(_l('操作成功'), 1);
                this.props.updateValue();
                this.props.closeDialog();
              } else {
                alert(_l('操作失败'), 2);
              }
            })
            .fail();
        } else {
          alert(_l('输入内容包含敏感词，请重新填写'), 3);
        }
      });
    }
  }

  render() {
    const { baseInfo, errorList, errorSentry = {} } = this.state;
    const { type } = this.props;
    return (
      <div className="baseInfoEditContent Gray">
        {/**学校名称或组织名称 */}
        <div className="Bold">
          {type === 1 ? _l('组织名称') : _l('学校名称')}
          <span className="TxtMiddle Red">*</span>
        </div>
        <input
          type="text"
          className={cx('formControl mTop6', { error: errorList.name })}
          defaultValue={baseInfo.name}
          onChange={e => this.updateValue('name', e.target.value)}
          onBlur={() => this.updateError('name', !baseInfo.name, baseInfo.name)}
          onFocus={() => this.updateError('name', false)}
        />
        <div className="Red errorBox">
          <span className={cx({ Hidden: !errorList.name && !errorSentry.name })}>
            {errorSentry.name
              ? _l('输入内容包含敏感词，请重新填写')
              : type === 1
              ? _l('请输入组织名称')
              : _l('请输入学校名称')}
          </span>
        </div>
        {/**专业学历和职位 */}
        <div className="Bold">
          {type === 1 ? _l('期间最高职位') : _l('专业和学历')}
          <span className="TxtMiddle Red">*</span>
        </div>
        <input
          type="text"
          className={cx('formControl mTop6', { error: errorList.title })}
          defaultValue={baseInfo.title}
          onChange={e => this.updateValue('title', e.target.value)}
          onBlur={() => this.updateError('title', !baseInfo.title, baseInfo.title)}
          onFocus={() => this.updateError('title', false)}
        />
        <div className="Red errorBox">
          <span className={cx({ Hidden: !errorList.title && !errorSentry.title })}>
            {errorSentry.title ? _l('输入内容包含敏感词，请重新填写') : this.renderTitleErrorMsg()}
          </span>
        </div>
        {/**描述或核心课程 */}
        <div className="Bold">{type === 1 ? _l('描述') : _l('核心课程')}</div>
        <textarea
          className="mTop6 mBottom24 formControl"
          value={baseInfo.description}
          onChange={e => {
            this.updateValue('description', e.target.value);
          }}
        />
        {/**起止时间 */}
        <div className="Bold">
          {_l('起止时间')}
          <span className="TxtMiddle Red">*</span>
        </div>
        <div className="flexRow mTop6">
          <div>
            <DatePicker
              selectedValue={baseInfo.startDate ? moment(baseInfo.startDate) : moment()}
              max={this.getRangeTime('max')}
              allowClear={false}
              onOk={value => {
                this.updateValue('startDate', moment(value).format('YYYY-MM-DD'));
                this.updateError('startDate', !value);
              }}
              onSelect={selectedValue => {
                this.updateValue('startDate', moment(selectedValue).format('YYYY-MM-DD'));
                this.updateError('startDate', !selectedValue);
              }}
            >
              <input
                type="text"
                className={cx('formControl', { error: errorList.startDate })}
                placeholder={_l('开始时间')}
                value={baseInfo.startDate}
                onBlur={() => this.updateError('startDate', !baseInfo.startDate)}
                onFocus={() => this.updateError('startDate', false)}
              />
            </DatePicker>
            <div className="Red errorBox">
              <span className={cx({ Hidden: !errorList.startDate })}>{_l('请选择起始年月')}</span>
            </div>
          </div>
          <span className="LineHeight36">
            <span className="mLeft16 mRight16">{_l('至')}</span>
          </span>
          <div>
            <DatePicker
              selectedValue={baseInfo.endDate ? moment(baseInfo.endDate) : moment()}
              disabled={baseInfo.isSoFar}
              min={this.getRangeTime('min')}
              allowClear={false}
              onOk={value => {
                this.updateValue('endDate', moment(value).format('YYYY-MM-DD'));
                this.updateError('endDate', !value);
              }}
              onSelect={selectedValue => {
                this.updateValue('endDate', moment(selectedValue).format('YYYY-MM-DD'));
                this.updateError('endDate', !selectedValue);
              }}
            >
              <input
                type="text"
                className={cx('formControl', { error: !baseInfo.isSoFar && errorList.endDate })}
                placeholder={_l('结束时间')}
                disabled={baseInfo.isSoFar}
                value={baseInfo.isSoFar ? _l('至今') : baseInfo.endDate}
                onBlur={() => this.updateError('endDate', !baseInfo.endDate)}
                onFocus={() => this.updateError('endDate', false)}
              />
            </DatePicker>
            <div className="Red errorBox">
              <span className={cx({ Hidden: (!errorList.endDate && !baseInfo.isSoFar) || baseInfo.isSoFar })}>
                {_l('请选择结束年月')}
              </span>
            </div>
          </div>
        </div>
        <Checkbox
          checked={baseInfo.isSoFar}
          onClick={() => {
            this.updateValue('isSoFar', !baseInfo.isSoFar);
            if (!baseInfo.isSoFar) {
              this.updateValue('endDate', '');
            }
          }}
        >
          {type === 1 ? _l('还在这里工作') : _l('还在这里学习')}
        </Checkbox>
        <div className="mTop20 flexEnd">
          <button
            type="button"
            className="ming Button Button--link Gray_9e mRight30"
            onClick={() => this.props.closeDialog()}
          >
            {_l('取消')}
          </button>
          <button type="button" className="ming Button Button--primary saveBtn" onClick={() => this.saveBaseInfo()}>
            {baseInfo.autoId ? _l('确认') : _l('添加')}
          </button>
        </div>
      </div>
    );
  }
}
