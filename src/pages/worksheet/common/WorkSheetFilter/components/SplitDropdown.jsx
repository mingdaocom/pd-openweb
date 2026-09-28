import React, { Fragment } from 'react';
import styled from 'styled-components';
import { Icon } from 'ming-ui';
import { Select } from 'ming-ui/antd-components';
import { FlexCenter } from 'worksheet/components/Basics';
import { FILTER_RELATION_TYPE } from 'src/utils/domain/worksheet/filterConstants';

const Con = styled.div`
  position: relative;
  padding: 12px 0;
  margin: 12px 0;
  hr {
    margin: 0 28px;
    border: none;
    border-top: 2px solid var(--color-border-secondary);
  }
  .text {
    position: absolute;
    top: 3px;
    left: calc(50% - 27px);
    padding: 0 12px;
    background: var(--color-background-card);
  }
  .removeGroup {
    display: none;
    width: 24px;
    height: 24px;
    position: absolute;
    right: 0;
    top: 0px;
    right: 24px;
    background: var(--color-background-card);
    font-size: 16px;
    color: var(--color-text-tertiary);
    cursor: pointer;
  }
  &:hover {
    .removeGroup {
      display: flex;
    }
  }
`;

const SelectCon = styled.div`
  display: inline-block;
  padding: 0 6px;
  position: absolute;
  left: calc(50% - 27px);
  top: 0;
  background: var(--color-background-card);
  .splitRelationSelect {
    width: 52px;
  }
`;

const RELATION_OPTIONS = [
  { label: _l('且%25000'), value: FILTER_RELATION_TYPE.AND },
  { label: _l('或'), value: FILTER_RELATION_TYPE.OR },
];

export default function SplitDropdown(props) {
  const { canEdit, type = FILTER_RELATION_TYPE.AND, onChange, onDelete } = props;
  return (
    <Con>
      <hr />
      <Fragment>
        {canEdit ? (
          <SelectCon>
            <Select
              className="splitRelationSelect"
              value={type}
              options={RELATION_OPTIONS}
              popupMatchSelectWidth={false}
              showSearch={false}
              size="small"
              variant="borderless"
              suffixIcon={<Icon icon="task_custom_btn_unfold" className="Font14" />}
              onChange={value => {
                onChange(value);
              }}
            />
          </SelectCon>
        ) : (
          <span className="text">{['', _l('且%25000'), _l('或')][type]}</span>
        )}
        <FlexCenter className="removeGroup hoverColorPrimary" onClick={onDelete}>
          <i className="icon icon-close"></i>
        </FlexCenter>
      </Fragment>
    </Con>
  );
}
