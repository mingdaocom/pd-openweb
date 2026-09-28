import { find, findIndex } from 'lodash';
import _ from 'lodash';

/** 过滤查询接口字段，并按父子数据源关系组织查询参数控件。 */
export const dealRequestControls = (controls, needChild) => {
  if (!(controls && controls.length)) return [];
  let newControls = [];

  // 查询过滤无效数据(附件不支持)
  const filterControls = controls
    .filter(i => !_.includes([10000003, 10000006], i.type))
    .filter(i => {
      const hasFind = _.find(controls, o => i.dataSource === o.controlId);
      return i.dataSource ? hasFind && hasFind.type !== 10000007 : true;
    })
    .map(item => {
      const childControl = _.find(controls, o => o.dataSource === item.controlId);

      if (item.type === 10000007 && childControl) {
        return { ...item, originType: childControl.type };
      }

      return item;
    });

  if (needChild) {
    filterControls.forEach(item => {
      if (item.dataSource) {
        const parentIndex = findIndex(newControls, i => i.controlId === item.dataSource);

        if (parentIndex > -1) {
          const parentControl = newControls[parentIndex];
          newControls[parentIndex] = { ...parentControl, child: (parentControl.child || []).concat(item) };
        } else {
          newControls.push({ ...find(controls, i => i.controlId === item.dataSource), child: [item] });
        }
      } else {
        newControls.push(item);
      }
    });
  }

  return needChild ? newControls : filterControls;
};

// 处理自定义事件--查询api成立条件filters里控件type
/** 将查询接口字段转换为筛选条件可使用的控件结构。 */
export const getFilterControls = (controls = []) => {
  const result = [];
  if (_.isEmpty(controls)) return result;
  controls.forEach(c => {
    if (!c.dataSource) {
      // 普通数组按原字段多选类型来
      if (c.type === 10000007) {
        const originType = _.get(
          _.find(controls, o => o.dataSource === c.controlId),
          'type',
        );
        result.push({ ...c, type: originType, enumDefault: !_.includes([6, 16], originType) ? 1 : 0 });
      } else if (c.type === 10000008) {
        // 只有为空、不为空，按子表来
        result.push({ ...c, type: 34 });
      } else {
        result.push(c);
      }
    }
  });
  return result;
};
