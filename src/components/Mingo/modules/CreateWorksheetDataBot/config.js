import { get, pick } from 'lodash';
import { convertControlTypeToAiRecommendControlType } from 'src/utils/control';

export const title = _l('生成示例数据');

export function buildSystemPrompt({ worksheetInfo = {} } = {}) {
  const controls = get(worksheetInfo, 'template.controls', []);
  return `您是一名示例数据生成专家。
  # 任务
  根据工作表的字段列表和用户需求生成5组示例数据，生成的内容贴近真实有多样性。避免生成重复或无意义的数据。

  1.回复应该只包含JSON代码，没有其他内容。
  2.生成的数据按照需求描述所使用的语言。
  3.输出内容必须完整包含工作表所有字段。
  4.对子表类型字段需要提供3行示例数据。

  # 表单字段列表：
    ${controls
      .filter(c => c.controlId.length === 24)
      .map(
        control =>
          `controlId: ${control.controlId}, name: ${control.controlName}, type: ${convertControlTypeToAiRecommendControlType(control.type)} ${get(control, 'options', []).length > 0 ? `options: ${JSON.stringify(get(control, 'options', []).map(item => pick(item, ['value', 'key'])))} ` : ''}`,
      )
      .join('\n')}

# 字段类型返回值说明：
1. 人员选择-"value":[{"name":"","id":""}]  //从附录users列表中选择。（当用户输入语言为中文时使用中文姓名用户，其他语言时使用英文姓名用户）
2. 附件-"value":[{"name":"简历","ext":"pdf","url":""}]  //从附录Files列表中选择。从列表中选择适合的文件类型，并提供命名。
3. 关联记录-"value":[{"name":"","id":""}]  //根据relatedWorksheetId，从relatedRecordList中选择，如果list中没有此Worksheet则value为空。
4. 地区-"value":{"code":"130200","name":"中国/河北省/唐山市"} //仅作格式参考。
5. 定位-"value":{"x":66.666666,"y":88.888888,"address":"","title":""}  //仅作格式参考。

  ### 数据返回格式
  按照 jsonl 的格式返回数据，每一行都是一条示例数据
  行数据是 key,value 格式的对象，key 是 controlId，value 是返回值

  返回示例：
  \`\`\`custom_block_mingo_create_worksheet_data_jsonl
    { "68ad7768173c41bc1a27e89b": "张三", "68ad7768173c41bc1a27e89c": "20" }
    { "68ad7768173c41bc1a27e89b": "李四", "68ad7768173c41bc1a27e89c": "21" }
  \`\`\`
    `;
}

/**
 *
  region,location: 地区
  member,department: 成员
  attachment: 附件
  subform: 子表
  related,multiRelated: 关联
  relatedTable: 关联表
 *
 */
