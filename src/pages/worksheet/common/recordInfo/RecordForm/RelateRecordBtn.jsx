import React, { useState } from 'react';
import PropTypes from 'prop-types';
import styled from 'styled-components';
import Trigger from 'rc-trigger';
import { Menu, MenuItem } from 'ming-ui';

const Con = styled.div`
  position: relative;
`;

const MenuCon = styled.div`
  position: absolute;
  top: 40px;
`;

const Button = styled.div`
  display: inline-block;
  font-weight: 500;
  border-radius: 3px;
  cursor: pointer;
  height: 36px;
  line-height: 36px;
  color: #2196f3;
  background-color: #f8f8f8;
  .content {
    display: inline-block;
    padding: 0 16px;
    &:hover {
      background-color: #f0f0f0;
    }
  }
`;

const DropIcon = styled.span`
  position: relative;
  display: inline-block;
  width: 36px;
  text-align: center;
  cursor: pointer;
  &:hover {
    background-color: #f0f0f0;
  }
  &:before {
    position: absolute;
    content: '';
    width: 1px;
    height: 16px;
    top: 10px;
    left: -0.5px;
    background-color: #ddd;
  }
`;

export default function RelateRecordBtn(props) {
  const { entityName, addVisible, selectVisible, onNew, onSelect } = props;
  const [menuVisible, setMenuVisible] = useState();
  const btnText = addVisible ? _l('新建%0', entityName) : _l('选择%0', entityName);
  const iconName = addVisible ? 'icon-plus' : 'icon-link_record';
  const btnClick = addVisible ? onNew : onSelect;
  return (
    <Con>
      <Button onClick={btnClick}>
        <div className="content">
          <i className={`icon ${iconName} mRight5 Font16`}></i>
          {btnText}
        </div>
        {addVisible && selectVisible && (
          <DropIcon
            className="relateRecordBtnDropIcon"
            onClick={e => {
              e.stopPropagation();
              setMenuVisible(true);
            }}
          >
            <i className="icon icon-arrow-down"></i>
          </DropIcon>
        )}
      </Button>
      {menuVisible && addVisible && selectVisible && (
        <MenuCon>
          <Menu onClickAwayExceptions={['.relateRecordBtnDropIcon']} onClickAway={() => setMenuVisible(false)}>
            <MenuItem onClick={onNew}>{_l('新建%0', entityName)}</MenuItem>
            <MenuItem onClick={onSelect}>{_l('关联已有%0', entityName)}</MenuItem>
          </Menu>
        </MenuCon>
      )}
    </Con>
  );
}

RelateRecordBtn.propTypes = {
  entityName: PropTypes.string,
  addVisible: PropTypes.bool,
  selectVisible: PropTypes.bool,
  onNew: PropTypes.func,
  onSelect: PropTypes.func,
};
