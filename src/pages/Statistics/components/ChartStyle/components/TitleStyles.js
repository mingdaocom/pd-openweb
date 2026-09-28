import React from 'react';
import { Input } from 'ming-ui/antd-components';

export default props => {
  const { currentReport, onChangeCurrentReport } = props;
  const { name, desc } = currentReport;

  return (
    <div className="mBottom12">
      <div className="mBottom8">{_l('显示标题')}</div>
      <Input
        defaultValue={name}
        className="w100 mBottom12"
        placeholder={_l('添加图表标题')}
        onPressEnter={event => event.currentTarget.blur()}
        onBlur={event => {
          onChangeCurrentReport(
            {
              name: event.target.value,
            },
            false,
          );
        }}
      />
      <div className="mBottom8">{_l('显示说明')}</div>
      <Input.TextArea
        rows={4}
        className="w100"
        autoSize={{ minRows: 4, maxRows: 6 }}
        placeholder={_l('添加图表描述')}
        defaultValue={desc}
        onBlur={event => {
          onChangeCurrentReport(
            {
              desc: event.target.value,
            },
            false,
          );
        }}
      />
    </div>
  );
};
