import React, { Fragment, useState } from 'react';
import { Checkbox } from 'ming-ui';
import { Tooltip } from 'antd';
import AssignValue from '../OptionList/AssignValue';
import { handleAdvancedSettingChange } from '../../../util/setting';
import _ from 'lodash';

export default function DropConfig(props) {
  const { data, onChange, fromPortal } = props;
  const [visible, setVisible] = useState(false);
  const { type, dataSource, advancedSetting: { showtype, allowadd, checktype } = {}, options = [], enumDefault } = data;

  const hasScore = _.find(options, i => _.isNumber(i.score));

  return (
    <Fragment>
      {!dataSource && !fromPortal && (
        <div className="labelWrap" style={{ justifyContent: 'space-between' }}>
          <Checkbox
            size="small"
            checked={!!enumDefault}
            onClick={checked => {
              if (checked) {
                onChange({ enumDefault: +checked });
              } else {
                setVisible(true);
              }
            }}
          >
            <span>{_l('为选项赋分值')}</span>
          </Checkbox>
          {!!enumDefault && (
            <div className="pointer Gray_75 ThemeHoverColor3" onClick={() => setVisible(true)}>
              {hasScore && <span className="mRight6">{_l('已设置')}</span>}
              <span className="icon-settings Font15"></span>
            </div>
          )}
        </div>
      )}
      {visible && (
        <AssignValue
          options={options}
          enableScore={enumDefault === 1}
          onOk={({ options, enableScore }) => {
            onChange({ options, enumDefault: +enableScore });
            setVisible(false);
          }}
          onCancel={() => setVisible(false)}
        />
      )}
      {((type === 11 && showtype !== '2') || (type === 10 && checktype === '1')) && (
        <div className="labelWrap">
          <Checkbox
            size="small"
            checked={allowadd === '1'}
            onClick={checked => onChange(handleAdvancedSettingChange(data, { allowadd: checked ? '0' : '1' }))}
          >
            <span>{_l('允许用户增加选项')}</span>
            <Tooltip placement={'bottom'} title={_l('勾选后，用户填写时可输入不在备选项中的内容，并添加至选项列表')}>
              <i className="icon-help tipsIcon Gray_9e Font16 pointer"></i>
            </Tooltip>
          </Checkbox>
        </div>
      )}
    </Fragment>
  );
}
