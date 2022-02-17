import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import cx from 'classnames';
import { Icon } from 'ming-ui';
import { getFilterRows } from 'src/api/worksheet';
import { getTitleTextFromControls } from 'src/components/newCustomFields/tools/utils';
import { arrayOf, bool, func, shape, string } from 'prop-types';

const Item = styled.div`
  padding: 8px 0;
  .icon-done {
    color: #2196f3;
  }
`;

export default function OptionsList(props) {
  const { selected, control, multiple, onChange } = props;
  const { options } = control;

  return (
    <div className="pLeft15 pRight15">
      {options
        .filter(o => !o.isDeleted)
        .map((o, i) => (
          <Item className="flexRow valignWrapper" key={i}>
            <div
              key={i}
              className="flex ellipsis Font13"
              onClick={() => {
                if (_.includes(selected, o.key)) {
                  onChange(selected.filter(v => v !== o.key));
                } else {
                  onChange(multiple ? _.uniqBy(selected.concat(o.key)) : [o.key]);
                }
              }}
            >
              {o.value}
            </div>
            {_.includes(selected, o.key) && <Icon className="Font20" icon="done"/>}
          </Item>
        ))}
    </div>
  );
}

OptionsList.propTypes = {
  multiple: bool,
  control: shape({}),
  selected: arrayOf(string),
  onChange: func,
};
