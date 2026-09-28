/** AI 功能调用场景类型。 */
export const AI_FEATURE_TYPE = {
  CREATE_SHEET: 1, // 创建工作表
  CREATE_RECORD: 2, // 创建记录
  CODEGEN_TABLE_FIELDS: 3, // 生成代码（工作表自定义字段）
  CODEGEN_WORKFLOW_NODE: 4, // 生成代码（工作流代码块节点）
  PROMPT_FOR_AGENT_NODE: 5, // 生成提示词（工作流智能体节点）
  SAMPLE_DATA: 6, // 生成示例数据
  I18N_APP: 7, // 应用多语言翻译
  AGENT_SMART_PICK: 8, // agent 智能选择模型
  GENERATE_APP_SHEET_DESCRIPTION: 9, // 生成应用/工作表描述
  MISC_HELPERS: 10, // 其他辅助功能
};
