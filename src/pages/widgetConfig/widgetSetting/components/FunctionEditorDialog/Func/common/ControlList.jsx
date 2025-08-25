import React from 'react';
import { Collapse } from 'antd';
import { arrayOf, func, shape, string } from 'prop-types';
import styled from 'styled-components';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { SearchFn } from 'src/pages/widgetConfig/util';
import { checkTypeSupportForFunction } from 'src/utils/control';

const Con = styled.div`
  padding: 10px 0;
  .fnTitle {
    font-weight: bold;
  }
  .ant-collapse-header {
    padding: 12px 14px !important;
  }
  .ant-collapse > .ant-collapse-item > .ant-collapse-header .ant-collapse-arrow {
    margin-right: 4px;
    vertical-align: middle;
  }
  .ant-collapse-item {
    border-bottom: none !important;
  }
  .ant-collapse-arrow {
    top: 15px !important;
    padding: 0px !important;
    left: 14px !important;
  }
  .ant-collapse-content-box {
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
    background: #e8e8e8;
  }
`;

const ExpandIcon = styled.i`
  display: inline-block;
  font-size: 16px;
  color: #9d9d9d;
  vertical-align: middle !important;
  transform: ${({ isActive }) => `rotate(${isActive ? 0 : -90}deg)`};
`;

const Icon = styled.i`
  font-size: 18px;
  color: #9e9e9e;
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
              <ExpandIcon isActive={isActive} className="icon icon-worksheet_fall" />
            </span>
          )}
          // {...(keywords
          //   ? {
          //       // activeKey: types,
          //     }
          //   : {})}
        >
          {controlGroups.map(group => (
            <Collapse.Panel key={group.id} header={<span className="fnTitle">{group.name}</span>}>
              {group.controls
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
                ))}
            </Collapse.Panel>
          ))}
        </Collapse>
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
