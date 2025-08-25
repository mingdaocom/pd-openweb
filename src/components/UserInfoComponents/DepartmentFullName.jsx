import React, { useRef } from 'react';
import _ from 'lodash';
import styled from 'styled-components';
import { Tooltip } from 'ming-ui';

const DepartmentFullNameWrapper = styled.span`
  max-width: 100%;
  display: inline-block;
  overflow: hidden;
  .departmentFullNameContent {
    width: 100%;
    display: flex;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    .otherContent {
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
      direction: rtl;
      unicode-bidi: bidi-override;
      margin-left: 3px;
    }
  }
`;

export default function DepartmentFullName(props) {
  const { currentDepartmentFullName = '' } = props;
  const deptArr = currentDepartmentFullName.split('/');
  const firstName = deptArr.length > 1 ? deptArr[0] + '/' : deptArr[0];
  const copyDeptArr = _.clone(deptArr);
  copyDeptArr.shift();
  const other = copyDeptArr.length ? copyDeptArr.join(' / ').split('').reverse().join('') : '';
  const $ref = useRef();

  return (
    <DepartmentFullNameWrapper ref={$ref}>
      <Tooltip
        getPopupContainer={() => $ref.current}
        tooltipStyle={{ maxWidth: 310, whiteSpace: 'pre-wrap', wordWrap: 'break-all', overflowWrap: 'break-word' }}
        tooltipClass="departmentFullNametip"
        popupPlacement="bottom"
        text={<div>{currentDepartmentFullName}</div>}
        mouseEnterDelay={0.5}
        autoCloseDelay={0}
      >
        <div className="departmentFullNameContent">
          <span className="ellipsis">{firstName}</span>
          <span className="otherContent flex">{other}</span>
        </div>
      </Tooltip>
    </DepartmentFullNameWrapper>
  );
}
