import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Dropdown } from 'ming-ui';
import { FlexCenter } from 'worksheet/components/Basics';
import { FILTER_RELATION_TYPE } from '../enum';

const Con = styled.div`
  position: relative;
  padding: 12px 0;
  margin: 12px 0;
  hr {
    margin: 0 28px;
    border: none;
    border-top: 2px solid #eaeaea;
  }
  .text {
    position: absolute;
    top: 3px;
    left: calc(50% - 27px);
    padding: 0 12px;
    background: #fff;
  }
  .removeGroup {
    display: none;
    width: 24px;
    height: 24px;
    position: absolute;
    right: 0;
    top: 0px;
    right: 24px;
    background: #fff;
    font-size: 16px;
    color: #9e9e9e;
    cursor: pointer;
  }
  &:hover {
    .removeGroup {
      display: flex;
    }
  }
`;

const DropdownCon = styled.div`
  display: inline-block;
  padding: 0 6px;
  position: absolute;
  left: calc(50% - 27px);
  top: 0;
  background: #fff;
  .Dropdown--input {
    padding: 2px 6px !important;
    border-radius: 4px;
    .icon {
      margin-left: 4px !important;
      vertical-align: middle;
    }
    &:hover {
      background: #f2f2f2;
    }
  }
`;

export default function SplitDropdown(props) {
  const { canEdit, type = FILTER_RELATION_TYPE.AND, onChange, onDelete } = props;
  return (
    <Con>
      <hr />
      <Fragment>
        {canEdit ? (
          <DropdownCon>
            <Dropdown
              dropIcon="task_custom_btn_unfold"
              defaultValue={type}
              isAppendToBody
              menuStyle={{ width: 'auto' }}
              data={[
                { text: _l('且%25000'), value: FILTER_RELATION_TYPE.AND },
                { text: _l('或'), value: FILTER_RELATION_TYPE.OR },
              ]}
              onChange={value => {
                onChange(value);
              }}
            />
          </DropdownCon>
        ) : (
          <span className="text">{['', _l('且%25000'), _l('或')][type]}</span>
        )}
        <FlexCenter className="removeGroup ThemeHoverColor3" onClick={onDelete}>
          <i className="icon icon-close"></i>
        </FlexCenter>
      </Fragment>
    </Con>
  );
}
