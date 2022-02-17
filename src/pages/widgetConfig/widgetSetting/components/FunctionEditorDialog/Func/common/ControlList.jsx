import React, { useState } from 'react';
import styled from 'styled-components';
import { Collapse } from 'antd';
import { func, arrayOf, shape, string } from 'prop-types';
import { getIconByType } from 'src/pages/widgetConfig/util';
import { checkTypeSupportForFunction } from '../enum';

const Con = styled.div`
  padding: 10px 0;
  .fnTitle {
    font-weight: bold;
    margin-left: 18px;
  }
  .ant-collapse-header {
    padding: 12px 14px !important;
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

export default function ControlList(props) {
  const { keywords, controls, controlGroups, insertTagToEditor } = props;
  const [visibleControls, setVisibleControls] = useState(
    controls.filter(c => c.controlName && checkTypeSupportForFunction(c)),
  );
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
              {group.controls.map((c, i) => (
                <ControlItem
                  key={i}
                  onClick={() => {
                    insertTagToEditor({
                      value: c.controlId + '-' + group.id,
                      text: c.controlName,
                    });
                  }}
                >
                  <Icon className={`icon icon-${getIconByType(c.type || 6)}`} />
                  {c.controlName}
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
        {(keywords ? visibleControls.filter(c => new RegExp(keywords).test(c.controlName)) : visibleControls).map(
          (c, i) => (
            <ControlItem
              key={i}
              onClick={() => {
                insertTagToEditor({
                  value: c.controlId,
                  text: c.controlName,
                });
              }}
            >
              <Icon className={`icon icon-${getIconByType(c.type || 6)}`} />
              {c.controlName}
            </ControlItem>
          ),
        )}
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
