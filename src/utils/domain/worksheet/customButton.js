/**
 * 向按钮列表追加按钮，或按按钮 ID 替换已有按钮。
 *
 * 新增时沿用历史行为，直接修改传入的按钮数组。
 */
export const refreshBtnData = (data, btns, isAdd) => {
  const btnData = data;

  if (isAdd) {
    btnData.push(btns);
    return btnData;
  }

  return data.map(item => {
    if (item.btnId === btns.btnId) {
      return btns;
    } else {
      return item;
    }
  });
};
