/**
 * 通过替换字段占位符并编译表达式，校验公式或 JavaScript 的基础语法。
 */
export function validateFnExpression(expression, type = 'mdfunction') {
  try {
    const normalizedExpression = String(expression || '').replace(/\$(.+?)\$/g, '"1"');

    // 空表达式不算语法错误：函数编辑器初始化后会先校验一次，mdfunction 走 `return ()` 会直接编译失败，
    // 导致还没输入内容的编辑器一打开就报「语法错误」
    if (!normalizedExpression.trim()) return true;

    if (type === 'mdfunction') {
      Function(`return (${normalizedExpression});`);
    } else if (type === 'javascript') {
      Function(normalizedExpression);
    }

    return true;
  } catch {
    return false;
  }
}
