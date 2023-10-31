import React, { useState } from 'react';
import styled from 'styled-components';
import { Checkbox, Icon } from 'ming-ui';
import cx from 'classnames';
import _ from 'lodash';

const Wrapper = styled.div`
  .expandIcon {
    position: absolute;
    top: 0px;
    right: 0;
    color: #9e9e9e;
    font-size: 18px;
    cursor: pointer;
    &:hover {
      color: #2196f3;
    }
  }
  .sectionLiCon::before {
    content: '';
    width: 9px;
    height: 100%;
    border: none;
    border-left: 1px solid #eaeaea;
    border-bottom: 1px solid #eaeaea;
    position: absolute;
    display: inline-block;
    left: 7px;
    top: -9px;
  }
`;

export default function ({ disabled, controls, hidedControls, disabledControls, onAdd = () => {}, onHide = () => {} }) {
  const [expandIds, setExpandIds] = useState([]);

  const renderControlList = (list, filterSection = true) => {
    return (
      <Wrapper>
        {list
          .filter(
            c => (!c.sectionId || !filterSection) && !_.find(disabledControls, item => item.controlId === c.controlId),
          )
          .map(c => {
            const isExpand = _.includes(expandIds, c.controlId);
            let isCheck = !_.find(hidedControls, item => item.controlId === c.controlId);
            let sectionList = [];
            if (c.type === 52) {
              sectionList = controls.filter(
                item =>
                  item.sectionId === c.controlId && !_.find(disabledControls, d => d.controlId === item.controlId),
              );
              if (!!sectionList.length) {
                isCheck = sectionList.some(item => !_.find(hidedControls, h => h.controlId === item.controlId));
                if (isCheck && _.find(hidedControls, item => item.controlId === c.controlId)) {
                  //标签页内字段全选中，将标签页显示
                  onAdd(c);
                }
              }
            }
            return (
              <div key={c.controlId} className={cx('Relative', { mLeft25: !!c.sectionId })}>
                <Checkbox
                  className="mTop12"
                  checked={isCheck}
                  text={c.controlName || _l('未命名')}
                  onClick={() => {
                    if (isCheck) {
                      onHide(c.controlId);
                    } else {
                      if (c.type === 52) {
                        const updateControls = sectionList.concat([c]);
                        updateControls.forEach(item => onAdd(item));
                      } else {
                        if (!!c.sectionId) {
                          const tabControl = controls.filter(item => item.controlId === c.sectionId)[0] || {};
                          const showTabSectionList = controls.filter(
                            item =>
                              item.sectionId === tabControl.controlId &&
                              !_.find(hidedControls, i => i.controlId === item.controlId),
                          );
                          if (!showTabSectionList.length) {
                            //勾选标签页内第一个字段，则勾选标签页
                            onAdd(tabControl);
                          }
                        }
                        onAdd(c);
                      }
                    }
                  }}
                />
                {c.type === 52 && (
                  <div>
                    <Icon
                      icon={isExpand ? 'expand_less' : 'expand_more'}
                      className="expandIcon"
                      onClick={() =>
                        setExpandIds(
                          isExpand ? expandIds.filter(item => item !== c.controlId) : expandIds.concat([c.controlId]),
                        )
                      }
                    />
                    {isExpand && !!sectionList.length && (
                      <div className="Relative sectionLiCon">{renderControlList(sectionList, false)}</div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
      </Wrapper>
    );
  };

  return renderControlList(controls);
}
