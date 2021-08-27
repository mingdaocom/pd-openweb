export default {
  selectFormulaId: '', // 当前编辑的公式id
  preDataSource: '', // 当前编辑的公式的公式
  caretPos: 0, // 光标位置
  cursorContent: '', // 光标所处的内容
  characterLength: 0, // 字符长度
  clickFormulaIndex: 0, // 点击的常用公式项index
  alreadySaved: false, // 已经保存过了
  isFocus: false, // 处理contentEditable focus光标到处跑bug
  isControlNameFocus: false, // 处理编辑公式名称时自定义公式获得焦点bug
  shouldScroll: false, // 是否需要滚动公式编辑框及表单编辑区
  activeFormulaId: '', // 正在编辑，未保存的公式 ID
  isFirstInputSelect: '', // 设置项中的第一个input是否全选
};
