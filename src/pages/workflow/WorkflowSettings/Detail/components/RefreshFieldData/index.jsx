import React, { Fragment } from 'react';
import _ from 'lodash';
import { Checkbox } from 'ming-ui';
import { getIconByType } from 'src/pages/widgetConfig/util';

export default ({ isSingle = false, controls, fields, updateSource }) => {
  // 刷新计算结果 字段类型 公式数值 || 文本组合 || 公式日期 || 公式函数 || 级联选择存储路径
  const refreshControls = controls.filter(
    c =>
      _.includes([31, 32, 38, 53], c.type) ||
      (_.includes([c.type, c.originalType], 35) && _.get(c, 'advancedSetting.storelayer') === '1' && !isSingle),
  );
  // 刷新选项排序和分值 字段类型 单选 || 多选 || 下拉
  const refreshSortControls = isSingle ? [] : controls.filter(c => _.includes([9, 10, 11], c.type));
  const getOtherTableControls = () => {
    const list = controls.filter(
      l => l.dataSource && ((l.type === 30 && _.get(l, 'strDefault.0') !== '1') || l.type === 37),
    );
    const group = _.groupBy(list, l => l.dataSource);
    const data = [];

    _.forEach(group, (value, key) => {
      const control = controls.find(l => l.controlId === key.slice(1, key.length - 1));

      data.push({
        ..._.pick(control, ['controlId', 'controlName', 'type']),
        children: value,
      });
    });

    return data;
  };
  const refreshData = [
    { title: _l('刷新计算结果'), controls: refreshControls },
    { title: _l('刷新选项排序和分值'), controls: refreshSortControls },
    { title: _l('刷新字段加密值'), controls: controls.filter(c => c.encryId) },
    { title: _l('刷新他表字段和汇总结果'), controls: getOtherTableControls(), hasChildren: true },
  ];
  const handleAllChecked = (controls, checked) => {
    const ids = controls.map(o => o.controlId);

    updateSource({
      fields: checked
        ? _.uniqBy(fields.concat(ids.map(controlId => ({ fieldId: controlId, isClear: true }))), 'fieldId')
        : fields.filter(o => !_.includes(ids, o.fieldId)),
    });
  };
  const getIsSelectAll = controls => {
    const ids = controls.map(o => o.controlId);

    return fields.filter(o => _.includes(ids, o.fieldId)).length === ids.length;
  };
  const renderCheckbox = list => {
    return list.map((c, i) => (
      <Checkbox
        className="mTop10"
        key={i}
        text={
          <span>
            <i className={`icon-${getIconByType(c.type)} Gray_9e Font16 mRight8`}></i>
            {c.controlName}
          </span>
        }
        checked={!!(_.find(fields, o => o.fieldId === c.controlId) || {}).isClear}
        onClick={checked => {
          updateSource({
            fields: checked
              ? fields.filter(o => o.fieldId !== c.controlId)
              : fields.concat({ fieldId: c.controlId, isClear: true }),
          });
        }}
      />
    ));
  };

  return refreshData
    .filter(item => item.controls.length)
    .map((item, i) => {
      return (
        <Fragment key={i}>
          <div className="mTop20 Bold">
            {item.title}
            {!item.hasChildren && (
              <span
                className="mLeft14 Gray_75 Normal Hand"
                onClick={() => handleAllChecked(item.controls, !getIsSelectAll(item.controls))}
              >
                {getIsSelectAll(item.controls) ? _l('取消全选') : _l('全选')}
              </span>
            )}
          </div>
          {item.hasChildren
            ? item.controls.map(l => {
                return (
                  <Fragment key={`relation-${l.controlId}`}>
                    <div className="mTop10">
                      <i className={`icon-${getIconByType(l.type)} Gray_9e Font16 mRight8`}></i>
                      {l.controlName}
                      <span
                        className="mLeft14 Gray_75 Normal Hand"
                        onClick={() => handleAllChecked(l.children, !getIsSelectAll(l.children))}
                      >
                        {getIsSelectAll(l.children) ? _l('取消全选') : _l('全选')}
                      </span>
                    </div>
                    <div className="mLeft25">{renderCheckbox(l.children)}</div>
                  </Fragment>
                );
              })
            : renderCheckbox(item.controls)}
        </Fragment>
      );
    });
};
