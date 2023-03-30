import React, { useState, useEffect, useRef } from 'react';
import styled from 'styled-components';
import { Menu, MenuItem, Icon } from 'ming-ui';
import GroupType from './GroupType';
import { useSetState } from 'react-use';
import Trigger from 'rc-trigger';
const MenuWrap = styled(Menu)`
  position: relative !important;
  padding: 6px 0 !important;
  width: 200px !important;
  .ming.MenuItem .Item-content {
    overflow: initial;
    position: relative;
  }
  .GroupTypeMenuWrap {
    position: absolute;
    left: 100%;
    width: 160px;
    bottom: 0;
    background: #ffffff;
    box-shadow: 0px 4px 16px rgba(0, 0, 0, 0.25) !important;
    opacity: 1;
    border-radius: 3px;
    padding: 6px 0;
    border-right: none;
    li {
      height: 36px;
      line-height: 36px;
      padding: 0 16px;
      &:hover {
        background: #f5f5f5;
        color: #2196f3;
      }
    }
  }
`;
export default function DropOption(props) {
  const [{ keywords, optionVisible, popupVisible }, setState] = useSetState({
    keywords: '',
    popupVisible: false,
    optionVisible: false,
  });
  useEffect(() => {
    setState({
      list: !!keywords ? props.list.filter(o => o.controlName.indexOf(keywords) >= 0) : props.list,
    });
  }, [keywords]);
  return (
    <Trigger
      action={['click']}
      popupClassName="moOption"
      getPopupContainer={() => document.body}
      popupVisible={popupVisible}
      onPopupVisibleChange={popupVisible => {
        setState({ popupVisible });
      }}
      popupAlign={{
        points: ['tr', 'br'],
        offset: [0, 10],
        overflow: { adjustX: true, adjustY: true },
      }}
      popup={
        <MenuWrap>
          <MenuItem
            onClick={e => {
              props.handleOpenChangeName();
              setState({ popupVisible: false });
              e.stopPropagation();
            }}
          >
            {_l('重命名')}
          </MenuItem>
          {props.showAction && (
            <MenuItem
              className=""
              style={{ overflow: 'initial' }}
              onMouseEnter={() => setState({ optionVisible: true })}
              onMouseLeave={() => setState({ optionVisible: false })}
            >
              <span className="text">{_l('汇总方式')}</span>
              <Icon icon="arrow-right-tip Font15" style={{ fontSize: '16px', right: '10px', left: 'initial' }} />
              {optionVisible && (
                <GroupType
                  onClickAway={() => setState({ optionVisible: false })}
                  onClick={type => {
                    props.handleChangeType(type);
                    setState({ optionVisible: false, visible: false });
                  }}
                />
              )}
            </MenuItem>
          )}
        </MenuWrap>
      }
    >
      <i className="icon icon-expand_more Hand Font16 mLeft10"></i>
    </Trigger>
  );
}
