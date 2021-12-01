import React, { Component } from 'react';
import { Menu, MenuItem } from 'ming-ui';
import withClickAway from 'ming-ui/decorators/withClickAway';
import styled from 'styled-components';

const ClearSelect = styled.div`
  padding: 4px 16px 6px 16px;
  color: #757575;
  cursor: pointer;
`;

@withClickAway
export default class ClickAwayMenu extends Component {
  render() {
    const { types, handleTimeSelect, dynamicValue, showClear = true } = this.props;
    return (
      <Menu style={{ width: 'calc(100% - 36px)' }}>
        {!_.isEmpty(dynamicValue) && showClear && (
          <ClearSelect key={'clear'} onClick={() => handleTimeSelect({ id: 'clear' })}>
            {_l('清除选择')}
          </ClearSelect>
        )}
        {types.map(type => (
          <MenuItem key={type.id} onClick={() => handleTimeSelect(type)}>
            {type.text}
          </MenuItem>
        ))}
      </Menu>
    );
  }
}
