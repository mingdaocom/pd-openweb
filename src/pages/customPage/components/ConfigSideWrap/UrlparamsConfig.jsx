import React, { Fragment } from 'react';
import { Icon } from 'ming-ui';
import { Tooltip, Input } from 'antd';

export default props => {
  const { urlParams, updatePageInfo } = props;
  const onAdd = () => {
    updatePageInfo({
      urlParams: urlParams.concat('')
    });
    setTimeout(() => {
      const inputs = document.querySelectorAll('.urlParamsWrap input');
      const input = inputs[inputs.length - 1];
      input && input.focus();
    }, 0);
  }
  const onValidate = index => {
    const currentValue = urlParams[index];

    if (!currentValue.trim()) {
      alert(_l('参数名不能为空'), 3);
      return;
    }

    if (urlParams.filter(p => p === currentValue).length > 1) {
      alert(_l('参数重复'), 3);
      return;
    }
  };
  return (
    <Fragment>
      <div className="Gray Font14 bold mTop20 mBottom10">{_l('链接参数')}</div>
      <div className="Gray_9e Font13 mBottom10">{_l('指定参数名，可作为查询字符串附加在自定义页面链接后。在加载页面时可动态获取参数值用于自定义页面的筛选条件。')}</div>
      {urlParams.map((value, index) => (
        <div className="flexRow alignItemsCenter mBottom10 urlParamsWrap">
          <Input
            placeholder={_l('请输入参数名')}
            className="pageInput"
            value={value}
            maxLength={20}
            onChange={event => {
              const newParams = urlParams.map((p, i) => {
                return i === index ? event.target.value : p;
              });
              updatePageInfo({
                urlParams: newParams
              });
            }}
            onBlur={() => {
              onValidate(index);
            }}
          />
          <Tooltip title={_l('删除')} placement="top">
            <Icon
              icon="delete1"
              className="Gray_9e Font19 pointer"
              onClick={() => {
                const newParams = urlParams.filter((_, i) => i !== index);
                updatePageInfo({
                  urlParams: newParams
                });
              }}
            />
          </Tooltip>
        </div>
      ))}
      <div className="flexRow alignItemsCenter pointer Gray_9e mTop10 hoverText" onClick={onAdd} style={{ width: 'fit-content' }}>
        <Icon icon="add" className="Font17" />
        <span>{_l('参数')}</span>
      </div>
    </Fragment>
  );
}