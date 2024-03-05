//根据分段id 处理呈现数据
export const formatControlsBySectionId = controls => {
  let list = [];
  const data = controls.filter(o => !o.sectionId);
  const dataChild = controls.filter(o => !!o.sectionId);
  data.map(o => {
    list = list.concat([o, ...dataChild.filter(it => it.sectionId === o.controlId)]);
  });
  return list.sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1));
};

export const formatControlsChildBySectionId = controls => {
  const sectionIds = getSectionId(controls);
  const list = [];
  controls.map(o => {
    if (sectionIds.includes(o.controlId) || !o.sectionId) {
      list.push(o);
    }
  });
  list.map(o => {
    o.child = controls
      .filter(it => it.sectionId === o.controlId)
      .sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1));
  });
  return list.sort((a, b) => (a.row * 10 + a.col > b.row * 10 + b.col ? 1 : -1));
};

//根据分段id
export const getSectionId = controls => {
  const sectionIds = _.uniq(controls.map(o => o.sectionId).filter(o => !!o));
  return sectionIds;
};

export const getRealData = (control, controls, allControls, isAdd) => {
  //自身是子集
  if (!!control.sectionId) {
    //新增
    if (isAdd) {
      let parent = controls.find(o => o.controlId === control.sectionId);
      //已存在父级
      if (parent) {
        return controls.concat([control]);
      } else {
        return controls.concat([allControls.find(o => o.controlId === control.sectionId), control]);
      }
    } else {
      //删减
      let childs = controls.filter(o => o.sectionId === control.sectionId);
      //只剩唯一子集，则包括父级一起删除
      if (childs.length <= 1) {
        return controls.filter(o => o.controlId !== control.controlId && o.controlId !== control.sectionId);
      } else {
        return controls.filter(o => o.controlId !== control.controlId);
      }
    }
  } else {
    //不是子集
    let childs = allControls.filter(o => (!!o.sectionId ? o.sectionId === control.controlId : false));
    if (isAdd) {
      return controls.concat([control, ...childs]);
    } else {
      //删减
      return controls.filter(o => ![...childs.map(it => it.controlId), control.controlId].includes(o.controlId));
    }
  }
};
