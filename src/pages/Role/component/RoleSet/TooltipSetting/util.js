export const getFunction = function (keyName) {
  return function (fields) {
    const isAll = _.every(fields, ({ [keyName]: value }) => !value);
    const isPart = !isAll && _.some(fields, ({ [keyName]: value }) => !value);
    return { isAll, isPart };
  };
};
export const getDecryptCheckboxProps = fields => {
  let fieldData = fields.filter(o => o.dataMask === '1');
  const isAll = _.every(fieldData, o => o.isDecrypt);
  const isPart = !isAll && _.some(fieldData, o => o.isDecrypt);
  return { isAll, isPart };
};
export const formatFields = (checked, fieldId, key, fields) => {
  const changeField = field => {
    if (key === 'notEdit' && !checked) {
      return {
        ...field,
        [key]: checked,
        notRead: checked,
      };
    }
    if (key === 'notRead' && checked) {
      return {
        ...field,
        notRead: true,
        notEdit: true,
        isDecrypt: false, //取消查看，同时取消解密
      };
    }
    //勾选解密时，同时勾选查看
    if (key === 'isDecrypt' && checked && field.dataMask === '1') {
      return {
        ...field,
        isDecrypt: true,
        notRead: false,
      };
    }
    return {
      ...field,
      [key]: checked,
    };
  };
  let fieldsN = _.map(fields, field => {
    // 全选切换
    if (fieldId === undefined) {
      return changeField(field);
    }
    // 单选切换
    if (field.fieldId === fieldId) {
      return changeField(field);
    }
    return field;
  });
  const formatDataBysection = list => {
    const ids = getSectionIds(list);
    const field = list.find(o => o.fieldId === fieldId);
    if (!fieldId || (!ids.includes(fieldId) && !field.sectionId)) {
      return list;
    }
    if (field.type === 52) {
      return list.map(o => {
        if (o.fieldId === fieldId || o.sectionId === fieldId) {
          return {
            ...o,
            [key]: checked,
            notEdit: checked && key === 'notRead' ? true : o.notEdit,
            isDecrypt: checked && key === 'notRead' ? false : o.isDecrypt,
          };
        } else {
          return o;
        }
      });
    } else if (!!field.sectionId) {
      const bros = list.filter(o => o.sectionId === field.sectionId);
      const brosC = bros.filter(o => o[key] === checked);
      if (bros.length <= brosC.length) {
        return list.map(o => {
          if (field.sectionId === o.fieldId) {
            return {
              ...o,
              [key]: checked,
              notEdit: checked && key === 'notRead' ? true : o.notEdit,
              isDecrypt: checked && key === 'notRead' ? false : o.isDecrypt,
            };
          } else {
            return o;
          }
        });
      }
    }
    return list;
  };

  return formatDataBysection(fieldsN);
};

export const getSectionIds = fields => {
  return _.uniq(fields.map(o => o.sectionId).filter(o => !!o));
};
