// 开发商类型常量 0, 1, 2, 3, 100
export const DEVELOPER_TYPE = {
  OPENAI: 1,
  QWEN: 2,
  DEEPSEEK: 3,
  AZURE_OPENAI: 4,
  CUSTOM: 100,
};
// 基础功能类型常量
export const BASIC_FUNCTION_TYPE = {
  SMS: 1,
  EMAIL: 2,
  TEXT_OCR: 3,
  TEXT_EXTRACTION: 4,
  PDF_GEN: 5,
};

// 基础功能初始配置数据
export const initialFunctionData = [
  {
    id: BASIC_FUNCTION_TYPE.SMS,
    name: _l('短信服务'),
    price: null,
    unit: _l('条'),
    description: _l(
      '短信服务可分为验证码短信和自定义短信。自定义短信仅支持发往中国大陆手机号，按70字计一条计费，超过70字以67字每条计费。每个标点、空格、英文字母都算一个字。',
    ),
    chargeLocation: _l('工作流的发送短信节点；公开表单短信验证；外部门户中验证码、邀请、审核等短信服务'),
  },
  {
    id: BASIC_FUNCTION_TYPE.EMAIL,
    name: _l('邮件服务'),
    price: null,
    unit: _l('封'),
    description: _l('一次邮件费用=(收件人与抄送人的总人数)* 单价'),
    chargeLocation: _l('工作流的发送邮件节点；外部门户中验证码、邀请、审核等邮件服务'),
  },
  {
    id: BASIC_FUNCTION_TYPE.TEXT_OCR,
    name: _l('文本识别(OCR)'),
    price: null,
    unit: _l('文件'),
    description: _l('按文件数量*单价计费'),
    chargeLocation: _l('文本识别字段'),
  },
  // {
  //   id: BASIC_FUNCTION_TYPE.TEXT_EXTRACTION,
  //   name: _l('文档提取文本'),
  //   price: null,
  //   unit: _l('文档'),
  //   description: _l('从文档中提取文本内容'),
  //   chargeLocation: _l('对话机器人、工作流ai agent节点的文档提取文本能力'),
  // },
  // {
  //   id: BASIC_FUNCTION_TYPE.WEB_SEARCH,
  //   name: _l('联网搜索'),
  //   price: null,
  //   unit: _l('次'),
  //   description: _l('调用联网能力服务'),
  //   chargeLocation: _l('使用大模型联网搜索服务'),
  // },
  {
    id: BASIC_FUNCTION_TYPE.PDF_GEN,
    name: _l('生成 PDF'),
    price: null,
    unit: _l('次'),
    description: _l('转换失败的文件将不收取费用'),
    chargeLocation: _l('工作流中“获取记录打印文件”节点'),
  },
];
