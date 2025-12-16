import React, { useEffect } from 'react';
import { useSetState } from 'react-use';
import _ from 'lodash';
import styled from 'styled-components';
import { LoadDiv } from 'ming-ui';
import { Tooltip } from 'ming-ui/antd-components';
import departmentController from 'src/api/department';

const DepartmentFullNameWrapper = styled.span`
  max-width: 100%;
  display: inline-block;
  overflow: hidden;
  &.flexColumn {
    display: flex;
    flex-direction: column;
  }
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

const getDepartmentSplitting = departmentFullName => {
  if (!departmentFullName) {
    return { firstName: '', lastName: '' };
  }

  const deptArr = departmentFullName.split('/');
  const firstName = deptArr.length > 1 ? deptArr[0] + '/' : deptArr[0];
  const copyDeptArr = _.clone(deptArr);
  copyDeptArr.shift();
  const lastName = copyDeptArr.length ? copyDeptArr.join(' / ').split('').reverse().join('') : '';

  return { firstName, lastName };
};

export default function DepartmentFullName(props) {
  const { projectId, departmentInfos = [], noPath = false, className, onContentLoaded } = props;
  const [{ fullDepartmentInfo, fullDepartmentLoading, expand }, setData] = useSetState({
    fullDepartmentInfo: {},
    fullDepartmentLoading: false,
    expand: false,
  });

  const getDepartmentFullName = () => {
    let departmentIds = departmentInfos.map(item => item.departmentId);
    departmentIds = departmentIds.filter(it => !fullDepartmentInfo[it]);

    if (_.isEmpty(departmentIds)) {
      return;
    }
    setData({ fullDepartmentLoading: true });
    departmentController.getDepartmentFullNameByIds({ projectId, departmentIds }).then(res => {
      res.forEach(it => {
        fullDepartmentInfo[it.id] = it.name;
      });
      setData({ fullDepartmentLoading: false, fullDepartmentInfo });
      // 在名片层中部门加载完成强制更新计算卡片位置
      if (_.isFunction(onContentLoaded)) {
        setTimeout(() => {
          onContentLoaded();
        }, 0);
      }
    });
  };

  useEffect(() => {
    if (!_.isEmpty(departmentInfos) && !noPath) {
      getDepartmentFullName();
    }
  }, [departmentInfos]);

  const renderItem = item => {
    const { firstName, lastName } = getDepartmentSplitting(fullDepartmentInfo[item.departmentId]);

    if (!noPath && !firstName && !lastName) {
      return null;
    }

    return (
      <div>
        <Tooltip
          tooltipStyle={{
            maxWidth: 310,
            whiteSpace: 'pre-wrap',
            wordWrap: 'break-all',
            overflowWrap: 'break-word',
          }}
          placement="bottom"
          title={noPath ? item.departmentName : fullDepartmentInfo[item.departmentId]}
          mouseEnterDelay={0.5}
        >
          {noPath ? (
            <div className="w100 ellipsis">{item.departmentName}</div>
          ) : (
            <span className="InlineBlock Hidden" style={{ maxWidth: '100%' }}>
              <div className="departmentFullNameContent">
                <span className="ellipsis">{firstName}</span>
                <span className="otherContent flex">{lastName}</span>
              </div>
            </span>
          )}
        </Tooltip>
      </div>
    );
  };

  if (fullDepartmentLoading) {
    return <LoadDiv size="small" style={{ textAlign: 'left!important' }} />;
  }

  if (!_.isEmpty(departmentInfos)) {
    if (noPath) {
      const departmentNames = departmentInfos.map(item => item.departmentName).join(';');
      return (
        <Tooltip title={<span>{departmentNames}</span>}>
          <DepartmentFullNameWrapper className={`${className || ''} ellipsis`}>
            {departmentNames}
          </DepartmentFullNameWrapper>
        </Tooltip>
      );
    }

    return (
      <DepartmentFullNameWrapper className={`${className || ''} flexColumn`}>
        {departmentInfos.slice(0, 6).map(item => renderItem(item))}
        {expand && departmentInfos.slice(6).map(item => renderItem(item))}
        {departmentInfos.length > 6 && (
          <div className="Hand Font14 ThemeColor Hover_49" onClick={() => setData({ expand: !expand })}>
            {expand ? _l('收起') : _l('展开')}
          </div>
        )}
      </DepartmentFullNameWrapper>
    );
  }
}
