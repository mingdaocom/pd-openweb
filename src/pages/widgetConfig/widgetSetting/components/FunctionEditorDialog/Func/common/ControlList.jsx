import React from 'react';
import { arrayOf, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { Collapse } from 'ming-ui/antd-components';
import { SearchFn } from 'src/utils/domain/control/capabilities';
import { getIconByType } from 'src/utils/domain/control/metadata';
import { checkTypeSupportForFunction } from 'src/utils/domain/control/type';

const Con = styled.div`
  padding: 10px 0;
  .hap-collapse,
  .hap-collapse-borderless {
    background-color: transparent !important;
  }
  .fnTitle {
    font-weight: bold;
    color: var(--color-text-primary);
  }
  .hap-collapse-header {
    padding: 12px 14px !important;
    .hap-collapse-expand-icon {
      margin-inline-end: 0px !important;
    }
  }
  .hap-collapse > .hap-collapse-item > .hap-collapse-header .hap-collapse-arrow {
    margin-right: 4px;
    vertical-align: middle;
  }
  .hap-collapse-item {
    border-bottom: none !important;
  }
  .hap-collapse-arrow {
    top: 15px !important;
    padding: 0px !important;
    left: 14px !important;
  }
  .hap-collapse-body {
    padding: 0px !important;
  }
`;

const ControlItem = styled.div`
  display: flex;
  height: 36px;
  line-height: 36px;
  font-size: 13px;
  padding: 0 20px;
  cursor: pointer;
  &:hover {
    background: var(--color-border-secondary);
  }
`;

const ExpandIcon = styled.i`
  display: inline-block;
  font-size: 16px;
  color: var(--color-text-tertiary);
  vertical-align: middle !important;
  transform: ${({ $isActive }) => `rotate(${$isActive ? 0 : -90}deg)`};
`;

const Icon = styled.i`
  font-size: 18px;
  color: var(--color-text-tertiary);
  margin-right: 8px;
  line-height: 36px;
`;

export function getControlType(control) {
  if (control.type === 30) {
    return control.sourceControlType;
  } else if (control.type === 53) {
    return control.enumDefault2;
  } else {
    return control.type;
  }
}

export default function ControlList(props) {
  const { keywords, controls, controlGroups, insertTagToEditor } = props;
  const visibleControls = controls.filter(c => c.controlName && checkTypeSupportForFunction(c));

  if (controlGroups && controlGroups.length) {
    return (
      <Con>
        <Collapse
          defaultActiveKey="commonly"
          bordered={false}
          expandIcon={({ isActive }) => (
            <span>
              <ExpandIcon $isActive={isActive} className="icon icon-worksheet_fall" />
            </span>
          )}
          // {...(keywords
          //   ? {
          //       // activeKey: types,
          //     }
          //   : {})}
          items={controlGroups.map(group => ({
            key: group.id,
            label: <span className="fnTitle">{group.name}</span>,
            children: group.controls
              .filter(c => c.controlName && checkTypeSupportForFunction(c))
              .filter(c => SearchFn(keywords, c.controlName))
              .map((c, i) => (
                <ControlItem
                  key={i}
                  onClick={() => {
                    insertTagToEditor({
                      value: group.id + '-' + c.controlId,
                      text: c.controlName,
                    });
                  }}
                >
                  <Icon className={`icon icon-${getIconByType(c.type || 6)}`} />
                  <span className="ellipsis" title={c.controlName}>
                    {c.controlName}
                  </span>
                </ControlItem>
              )),
          }))}
        />
      </Con>
    );
  } else {
    return (
      <Con>
        {(keywords ? visibleControls.filter(c => SearchFn(keywords, c.controlName)) : visibleControls).map((c, i) => (
          <ControlItem
            key={i}
            onClick={() => {
              insertTagToEditor({
                value: c.controlId,
                text: c.controlName,
              });
            }}
          >
            <Icon className={`icon icon-${getIconByType(getControlType(c) || 6)}`} />
            <span className="ellipsis" title={c.controlName}>
              {c.controlName}
            </span>
          </ControlItem>
        ))}
      </Con>
    );
  }
}

ControlList.propTypes = {
  insertTagToEditor: func,
  keywords: string,
  controls: arrayOf(shape({})),
  controlGroups: arrayOf(shape({})),
};
