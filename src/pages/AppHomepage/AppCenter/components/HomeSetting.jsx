import React, { useRef } from 'react';
import { func, shape } from 'prop-types';
import Trigger from 'rc-trigger';
import styled from 'styled-components';
import { Radio, Switch } from 'ming-ui';
import { VerticalMiddle, FlexCenter } from 'worksheet/components/Basics';
import _ from 'lodash';

const EditPanelCon = styled.div`
  width: 260px;
  background: #fff;
  border-radius: 3px;
  box-shadow: 0px 8px 16px rgba(0, 0, 0, 0.24);
  padding: 8px 0;
  .title {
    font-weight: bold;
    padding: 8px 0 8px 16px;
  }
  .switch {
    margin-right: 13px;
  }
`;

const BaseBtnCon = styled(FlexCenter)`
  margin-left: 12px;
  display: inline-flex;
  cursor: pointer;
  width: 32px;
  height: 32px;
  border-radius: 32px;
  &:hover {
    background: #f5f5f5;
  }
`;

const Hr = styled.div`
  border-top: 1px solid #eaeaea;
  margin: 8px 0;
`;

const ConfigItem = styled(VerticalMiddle)`
  padding: 0 16px;
  height: 36px;
  ${({ noHover }) => !noHover && 'cursor: pointer;&:hover {background: #fafafa;}'}
`;

const config = {
  starApp: [
    {
      value: 0,
      text: _l('仅看当前组织'),
    },
    {
      value: 1,
      text: _l('显示所有组织'),
    },
  ],
  starAppGroup: [
    {
      value: 0,
      text: _l('平铺排列'),
    },
    {
      value: 1,
      text: _l('以选项卡切换'),
    },
  ],
};

export default function HomeSetting(props) {
  const { setting = {}, onUpdate = _.noop } = props;
  function handleUpdate(key, value) {
    onUpdate({
      ...setting,
      [key]: value,
      editingKey: key,
    });
  }
  return (
    <Trigger
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 10],
      }}
      popup={
        <EditPanelCon>
          <div className="title">{_l('星标应用')}</div>
          {config.starApp.map((item, i) => (
            <ConfigItem onClick={() => handleUpdate('markedAppDisplay', item.value)}>
              <Radio {...item} size="small" checked={setting.markedAppDisplay === item.value} />
            </ConfigItem>
          ))}
          <Hr />
          <div className="title">{_l('星标应用分组')}</div>
          {config.starAppGroup.map((item, i) => (
            <ConfigItem onClick={() => handleUpdate('displayType', item.value)}>
              <Radio {...item} size="small" checked={setting.displayType === item.value} />
            </ConfigItem>
          ))}
          <Hr />

          <ConfigItem noHover>
            <Switch
              className="switch"
              primaryColor="#2196f3"
              size="small"
              checked={setting.exDisplay}
              onClick={() => handleUpdate('exDisplay', !setting.exDisplay)}
            />
            {_l('显示外部协作')}
          </ConfigItem>
        </EditPanelCon>
      }
      destroyPopupOnHide
    >
      <BaseBtnCon data-tip={_l('自定义显示')}>
        <i className="icon-tune Font20 Gray_75"></i>
      </BaseBtnCon>
    </Trigger>
  );
}

HomeSetting.propTypes = {
  setting: shape({}),
  onUpdate: func,
};
