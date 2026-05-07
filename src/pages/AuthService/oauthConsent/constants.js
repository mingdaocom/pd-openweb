export const ACTION_RESULT = {
  Failed: 0, // 失败，通常是指内部错误等
  Success: 1, // 成功
  ClientAlreadyAuthorized: 2, // 应用已授权，直接颁发 code 即可
  ClientNotExist: 3, // 应用不存在
  ClientClosed: 4, // 应用已关闭
  ClientRedirectUriError: 5, // redirect_uri 非法
  ClientIpBlocked: 6, // IP 不在白名单
  ClientScopeChanged: 7, // 应用 Scope 变更
};

export const ERROR_MSG = {
  title: () => _l('无法访问此应用'),
  desc: () => _l('应用不存在,它可能使用了无效的 Client ID,或不在授权允许范围内'),
};

/** 与后端枚举一致：code -> displayName（用于授权页展示） */
export const SCOPES = {
  10000: _l('应用'),
  10500: _l('获取列表'),
  10100: _l('创建'),
  10200: _l('编辑'),
  10300: _l('删除'),
  10400: _l('获取信息'),

  20000: _l('工作表'),
  20500: _l('获取列表'),
  20400: _l('获取结构信息'),
  20100: _l('创建'),
  20200: _l('编辑'),
  20300: _l('删除'),

  30000: _l('行记录'),
  30100: _l('获取详情'),
  30200: _l('创建'),
  30300: _l('更新'),
  30400: _l('删除'),
  30500: _l('获取列表'),
  30600: _l('批量创建'),
  30700: _l('批量更新'),
  30800: _l('批量删除'),
  30900: _l('获取记录讨论'),
  31000: _l('获取记录日志'),
  31100: _l('获取透视表数据'),
  31200: _l('获取记录关联关系'),
  31300: _l('获取记录分享链接'),

  40000: _l('选项集'),
  40100: _l('创建'),
  40200: _l('删除'),
  40300: _l('获取列表'),
  40400: _l('更新'),

  50000: _l('公共查询'),
  50100: _l('查找部门'),
  50200: _l('查找成员'),
  50300: _l('获取地区信息'),

  60000: _l('角色'),
  60700: _l('创建'),
  60100: _l('删除'),
  60200: _l('获取详情'),
  60300: _l('成员退出所有角色'),
  60400: _l('获取列表'),
  60500: _l('移除成员'),
  60600: _l('添加成员'),

  70000: _l('工作流'),
  70100: _l('获取详情'),
  70200: _l('获取列表'),
  70300: _l('触发'),
  70400: _l('根据表id行id获取审批流程执行列表'),
  70500: _l('获取审批流程执行详情'),

  80000: _l('知识库'),
  80100: _l('获取应用下知识库列表'),
  80200: _l('知识库检索'),
};

export function getScopeDisplayListFromScopes(scopes) {
  if (!Array.isArray(scopes) || scopes.length === 0) return [];
  const list = [];
  scopes.forEach(scope => {
    const categoryName = scope && scope.code != null ? SCOPES[scope.code] : null;
    const children = scope && Array.isArray(scope.children) ? scope.children : [];
    const labels = children
      .filter(child => child && child.checked)
      .map(child => SCOPES[child.code] || child.displayName || child.key)
      .filter(Boolean);

    if (labels.length > 0) {
      const prefix = categoryName ? `${categoryName}${_l('：')}` : '';
      list.push({ prefix, suffix: labels.join(_l('、')) });
    }
  });
  return list;
}
