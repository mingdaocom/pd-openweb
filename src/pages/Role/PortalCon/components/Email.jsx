import React, { Component } from 'react';
import cx from 'classnames';

export default class EmailInput extends Component {
  render() {
    const { inputClassName, onInputKeydown, clickCallback } = this.props;

    return (
      <div className={cx({})}>
        <input
          type="tel"
          className={cx(inputClassName)}
          ref={input => {
            this.input = input;
          }}
          placeholder={_l('填写邮箱')}
          onBlur={e => {
            //邮箱验证规则
            var emailReg =
              /^[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*@[\u4e00-\u9fa5\w-]+(\.[\u4e00-\u9fa5\w-]+)*\.[\u4e00-\u9fa5\w-]+$/i;
            if (!!e.target.value.trim() && !emailReg.test(e.target.value.trim())) {
              $(this.input).addClass('err');
              this.props.onChange({ value: e.target.value.trim(), isErr: true });
              alert(_l('请输入正确的邮箱'), 3);
              return;
            }
            $(this.input).removeClass('err');
            this.props.onChange({ value: e.target.value.trim(), isErr: false });
          }}
          onKeyDown={onInputKeydown}
          onClick={clickCallback}
        />
      </div>
    );
  }
}
