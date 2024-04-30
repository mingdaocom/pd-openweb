import React, { useState } from 'react';
import { Icon, Menu, MenuItem } from 'ming-ui';
import Trigger from 'rc-trigger';
import { enumWidgetType } from '../../../../util';
import { DEFAULT_CONFIG, SYS, SYS_CONTROLS } from '../../../../config/widget';
import { DynamicBtn } from '../style';

export default function AddFields(props) {
  const { handleClick, selectControls, text } = props;
  const filterControls = selectControls.filter(i => !_.includes(SYS_CONTROLS.concat(SYS), i.controlId));
  const [visible, setVisible] = useState(false);

  return (
    <Trigger
      popup={() => {
        return (
          <Menu style={{ width: 300, maxHeight: 300, overflow: 'auto' }}>
            {filterControls.map(i => {
              const enumType = enumWidgetType[i.type];
              const { icon } = DEFAULT_CONFIG[enumType];
              return (
                <MenuItem
                  icon={<Icon icon={icon} className="Font15" />}
                  onClick={() => {
                    handleClick([{ controlId: i.controlId }]);
                  }}
                >
                  {i.controlName}
                </MenuItem>
              );
            })}
          </Menu>
        );
      }}
      popupVisible={visible}
      onPopupVisibleChange={visible => {
        setVisible(visible);
      }}
      action={['click']}
      popupAlign={{
        points: ['tl', 'bl'],
        offset: [0, 5],
        overflow: { adjustX: true, adjustY: true },
      }}
      getPopupContainer={() => document.body}
    >
      <DynamicBtn className={props.className}>
        <Icon icon="add" className="Bold" />
        {text || _l('字段')}
      </DynamicBtn>
    </Trigger>
  );
}
