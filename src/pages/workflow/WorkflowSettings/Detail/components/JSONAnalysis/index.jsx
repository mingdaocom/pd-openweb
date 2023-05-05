import React, { Fragment } from 'react';
import cx from 'classnames';
import jp from 'jsonpath';
import { CONTROLS_NAME } from '../../../enum';
import _ from 'lodash';

export default ({ list, isIntegration = false, json }) => {
  const renderList = source => {
    return source.map((item, i) => {
      if (item.dataSource && _.find(list, o => o.controlId === item.dataSource).type === 10000007) {
        return null;
      }

      return (
        <Fragment>
          <li className="flexRow" key={i}>
            <div className={cx('w180 ellipsis', { pLeft20: item.dataSource })}>{item.controlName || ''}</div>
            {isIntegration && <div className="w120 ellipsis">{CONTROLS_NAME[item.type]}</div>}
            <div className={cx('mLeft15 flex', { ellipsis: !isIntegration })} style={{ minWidth: 0 }}>
              {isIntegration ? item.desc : renderParameters(item)}
            </div>
          </li>
          {renderList(list.filter(o => o.dataSource === item.controlId))}
        </Fragment>
      );
    });
  };
  const renderParameters = ({ type, controlId, dataSource, jsonPath }) => {
    if (!jsonPath) return '';

    // 处理@.的问题
    if (dataSource) {
      const parentSource = list.find(o => o.controlId === dataSource);

      if (parentSource.type === 10000008) {
        jsonPath = jsonPath.replace(/^@/, `${parentSource.jsonPath}[0]`);
      }
    }

    try {
      let result = jp.query(JSON.parse(json), jsonPath.replace(/\.(\d[^\.]*)/g, `['$1']`));

      // 文本
      if (type === 2) {
        if (_.isArray(result)) {
          if (!result.length) {
            result = '';
          } else if (result.length === 1) {
            result = _.isString(result[0]) ? result[0] : JSON.stringify(result[0]);
          } else {
            result = result.map(o => o);
          }
        }
      }

      // 数值
      if (type === 6) {
        if (result.length === 1 && (_.isNumber(result[0]) || _.isBoolean(result[0]))) {
          result = _.isBoolean(result[0]) ? (result[0] ? 1 : 0) : result[0];
        } else {
          result = '';
        }
      }

      // 日期时间
      if (type === 16) {
        if (
          result.length === 1 &&
          typeof result[0] === 'string' &&
          new Date(result[0].replace(/-/g, '/')).toString() !== 'Invalid Date'
        ) {
          result = result[0];
        } else {
          result = '';
        }
      }

      // 人员 部门
      if (_.includes([26, 27], type)) {
        if (result.length === 1 && /^\w{8}-\w{4}-\w{4}-\w{4}-\w{12}$/.test(result[0])) {
          result = result[0];
        } else {
          result = '';
        }
      }

      // 普通数组
      if (type === 10000007) {
        if (!result.length) {
          result = '';
        } else if (_.isObject(result[0])) {
          if (dataSource) {
            result = result[0];
          } else if (result.length === 1 && _.isArray(result[0]) && result[0].length > 1) {
            result = result[0].map(o => (_.isObject(o) ? JSON.stringify(o) : o));
          } else {
            result =
              result.length === 1
                ? _.isArray(result[0])
                  ? result[0]
                  : ''
                : result.map(o => (_.isObject(o) ? JSON.stringify(o) : o));
          }
        }
      }

      // 对象数组
      if (type === 10000008) {
        if (result.length && _.isArray(result[0])) {
          result = result[0];
        } else {
          result = '';
        }
      }

      if (type === 10000008 && !!list.find(o => o.dataSource === controlId)) {
        return result && _.isArray(result) ? (
          <span className="Gray_9e">{_l('共 %0 组数据，以下仅显示第 1 组参考值', result.length)}</span>
        ) : (
          ''
        );
      }

      return _.isObject(result) ? JSON.stringify(result) : result;
    } catch (e) {
      return <span className="Gray_9e">{_l('暂无结果')}</span>;
    }
  };

  return <ul className="webhookList">{renderList(list.filter(item => !item.dataSource))}</ul>;
};
