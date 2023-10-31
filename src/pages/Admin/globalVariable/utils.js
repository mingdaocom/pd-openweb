import _ from 'lodash';

export const formatVarList = list => {
  let resultList = [];
  list.forEach(el => {
    const nameArr = el.name.split('.');
    for (let i = 0; i < nameArr.length; i++) {
      const key = nameArr.slice(0, i + 1).join('.');
      const hasChild = i !== nameArr.length - 1;
      const varItem = hasChild ? {} : el;

      if (!resultList.filter(item => item.key === key).length) {
        resultList.push({
          key,
          name: nameArr[i],
          pid: i === 0 ? '' : nameArr.slice(0, i).join('.'),
          hasChild,
          ...varItem,
        });
      }
    }
  });
  return resultList;
};
