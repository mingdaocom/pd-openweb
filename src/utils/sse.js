/**
 * 一个支持部分解析的JSON解析器类。
 * 它可以从不完整的JSON对象字符串中提取出已经完整的键值对。
 */
class PartialJsonParser {
  constructor() {
    // 存储已接收到的数据流
    this.buffer = '';
    // 存储已成功解析的键值对
    this.parsedData = {};
    // 用于匹配一个完整的键值对的正则表达式
    // 解释:
    // "([^"]+)"       - 捕获组1: 匹配并捕获双引号包裹的key
    // \s*:\s*          - 匹配key和value之间的冒号以及可能的空格
    // ( ... )          - 捕获组2: 匹配value，包含以下几种可能
    //   "(?:\\.|[^"])*" - 匹配一个完整的字符串值，能处理转义字符 \"
    //   | -?\d+(?:\.\d+)? - 或一个数字 (整数或浮点数)
    //   | true|false|null - 或布尔/null字面量
    //   | \{[^{}]*\}     - 或一个对象（不包含嵌套对象）
    //   | \[[^\]]*\]     - 或一个数组（不包含嵌套数组）
    // /g                 - 全局匹配，以便在循环中连续查找
    this.jsonPairRegex = /"([^"]+)"\s*:\s*("(?:\\.|[^"])*"|-?\d+(?:\.\d+)?|true|false|null|\{[^{}]*\}|\[[^\]]*\])/g;
  }

  /**
   * 接收一个新的数据块并尝试解析
   * @param {string} chunk 新传入的数据块
   * @returns {object} 当前已成功解析出的所有数据
   */
  parse(chunk) {
    this.buffer += chunk;

    let match;
    // 重置正则表达式的 lastIndex，确保从头开始搜索
    // 或者每次都基于 buffer 创建新的正则表达式实例
    const regex = new RegExp(this.jsonPairRegex);

    // 使用 a-z循环匹配所有已经完整的键值对
    while ((match = regex.exec(this.buffer)) !== null) {
      const key = match[1];
      const valueStr = match[2];

      // 如果这个key已经解析过了，就跳过，避免重复解析
      if (this.parsedData.hasOwnProperty(key)) {
        continue;
      }

      try {
        // 我们匹配到的 valueStr 是一个合法的JSON值字符串
        // (如 "hello", 123, [1,2])，可以直接用JSON.parse解析
        const isNumberStr = /^-?\d+(?:\.\d+)?$/.test(valueStr);
        const value = isNumberStr ? parseFloat(valueStr) : JSON.parse(valueStr);
        this.parsedData[key] = value;
      } catch (e) {
        // 理论上，由于正则表达式的限制，这里不应该失败
        // 但保留catch以防万一
        console.error(`PartialJsonParser: Failed to parse value for key "${key}":`, valueStr, e);
      }
    }

    // 返回已解析数据的副本，防止外部修改
    return { ...this.parsedData };
  }

  /**
   * 获取当前已解析的完整数据
   * @returns {object}
   */
  getResult() {
    return { ...this.parsedData };
  }
}

export function parseStreamingJsonlData(content, isStreaming = true) {
  const lines = content.split('\n').slice(0, isStreaming ? -2 : undefined);
  return lines
    .map(line => {
      try {
        if (!isStreaming) {
          return JSON.parse(line.replace(/\b0+(\d+(\.\d+)?)\b/g, '$1'));
        }
        const parser = new PartialJsonParser();
        const result = parser.parse(line);
        return result;
      } catch {
        return;
      }
    })
    .filter(Boolean);
}

export function getTextContentFromMessage(content) {
  if (typeof content === 'string') {
    return content;
  }
  return content
    .map(item => {
      if (item.type === 'text') {
        return item.text;
      }
      return '';
    })
    .filter(Boolean)
    .join('\n');
}
