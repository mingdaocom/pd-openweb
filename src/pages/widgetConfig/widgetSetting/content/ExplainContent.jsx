import React, { Fragment, useEffect, useState } from 'react';
import { CaretRightOutlined } from '@ant-design/icons';
import { Collapse, Input } from 'antd';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import { HAS_EXPLAIN_CONTROL, NO_DES_WIDGET } from '../../config';
import { AnimationWrap, SettingItem } from '../../styled';
import { notExplainDisplay, notWidgetDes } from '../../util';
import { handleAdvancedSettingChange } from '../../util/setting';
import { SectionItem } from '../components/SplitLineConfig/style';
import WidgetDes from '../components/WidgetDes';
import WidgetExplain from '../components/WidgetExplain';
import { SettingCollapseWrap } from './styled';

const { Panel } = Collapse;

const DISPLAY_TYPES = [
  {
    text: _l('自动'),
    value: '0',
  },
  {
    text: _l('图标%04025'),
    value: '1',
  },
  {
    text: _l('文字%04026'),
    value: '2',
  },
];

const UserContent = props => {
  const { data = {}, onChange } = props;
  const { type, advancedSetting: { showtype, checktype, hinttype = '0' } = {} } = data;
  return (
    <Fragment>
      {(HAS_EXPLAIN_CONTROL.includes(type) ||
        (type === 11 && showtype !== '2') ||
        (type === 10 && checktype === '1') ||
        (type === 29 && showtype === '3')) && <WidgetExplain {...props} />}

      {!NO_DES_WIDGET.includes(type) && (
        <Fragment>
          <WidgetDes {...props} />
          {!notExplainDisplay(data) && (
            <SectionItem>
              <div className="label Width90">{_l('显示方式')}</div>
              <AnimationWrap className="flex">
                {DISPLAY_TYPES.map(item => (
                  <div
                    className={cx('animaItem', { active: hinttype === item.value })}
                    onClick={() => {
                      onChange(handleAdvancedSettingChange(data, { hinttype: item.value }));
                    }}
                  >
                    {item.text}
                  </div>
                ))}
              </AnimationWrap>
            </SectionItem>
          )}
        </Fragment>
      )}
    </Fragment>
  );
};

const DevelopContent = ({ data, allControls, onChange }) => {
  const { alias = '', remark, controlId } = data;
  const [value, setValue] = useState(alias);
  const [error, setError] = useState(0);

  useEffect(() => {
    setValue(alias);
  }, [controlId]);

  return (
    <Fragment>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('字段别名')}
          <Tooltip
            placement="bottom"
            title={_l('仅允许使用字母（不区分大小写）、数字和下划线组合， 且必须以字母开头，不可重复。')}
          >
            <Icon icon="help" className="Font16 Gray_bd mLeft4" />
          </Tooltip>
        </div>
        <Input
          className={cx({ inputError: error })}
          placeholder={_l('请输入别名')}
          value={value}
          onChange={e => {
            const tempAlias = e.target.value.trim();
            setValue(tempAlias);
            if (tempAlias && allControls.filter(o => tempAlias === o.alias && o.controlId !== controlId).length > 0) {
              setError(1);
            } else if (tempAlias && !/^[a-zA-Z]{1}\w*$/.test(tempAlias)) {
              setError(2);
            } else {
              setError(0);
            }
          }}
          onBlur={e => {
            const newAlias = e.target.value.trim();
            if (error === 1) {
              alert(_l('该别名已存在'), 3);
            } else if (error === 2) {
              alert(_l('该别名格式错误'), 3);
            } else {
              onChange({ alias: newAlias });
              setValue(newAlias);
            }
          }}
        />
      </SettingItem>
      <SettingItem>
        <div className="settingItemTitle">
          {_l('备注')}
          <Tooltip placement="bottom" title={_l('输入的内容仅应用管理员和开发者可见')}>
            <Icon icon="help" className="Font16 Gray_bd mLeft4" />
          </Tooltip>
        </div>
        <Input.TextArea autoSize={false} rows={4} value={remark} onChange={e => onChange({ remark: e.target.value })} />
      </SettingItem>
    </Fragment>
  );
};

const getItems = props => {
  const { data } = props;
  const defaultData = [
    {
      key: 'develop',
      label: _l('开发者'),
      children: <DevelopContent {...props} />,
    },
  ];

  // 分段、备注、关联列表等不支持用户设置,标签页支持
  if (!notWidgetDes(data) || data.type === 52) {
    defaultData.unshift({
      key: 'user',
      label: _l('用户'),
      children: <UserContent {...props} />,
    });
  }

  return defaultData;
};

export default function ExplainContent(props) {
  const items = getItems(props);
  const [expandKeys, setExpandKeys] = useState(items.map(i => i.key));

  return (
    <SettingCollapseWrap
      bordered={false}
      activeKey={expandKeys}
      expandIcon={({ isActive }) => <CaretRightOutlined rotate={isActive ? 90 : 0} />}
      items={getItems(props)}
      onChange={value => setExpandKeys(value)}
    >
      {items.map(item => {
        return (
          <Panel header={item.label} key={item.key}>
            {item.children}
          </Panel>
        );
      })}
    </SettingCollapseWrap>
  );
}
