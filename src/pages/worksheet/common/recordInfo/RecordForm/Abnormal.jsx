import React from 'react';
import { isFunction } from 'lodash';
import PropTypes from 'prop-types';

export default function Abnormal(props) {
  const { resultCode, entityName, empty, renderAbnormal } = props;
  if (isFunction(renderAbnormal)) {
    return <div className="abnormalCon flexColumn">{renderAbnormal()}</div>;
  }
  return (
    <div className="abnormalCon flexColumn">
      <span className="statusIcon Icon icon icon-error1" />
      <p className="mTop5">
        {(() => {
          if (resultCode === 7) {
            return entityName ? _l('无权限查看%0', entityName) : _l('无权限查看记录');
          } else if (resultCode === 1 && empty) {
            return _l('当前子表中的字段为空');
          } else {
            return entityName ? _l('%0无法查看', entityName) : _l('记录无法查看');
          }
        })()}
      </p>
    </div>
  );
}

Abnormal.propTypes = {
  resultCode: PropTypes.number,
  entityName: PropTypes.string,
  empty: PropTypes.bool,
  renderAbnormal: PropTypes.func,
};
