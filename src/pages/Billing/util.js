import { DEVELOPER_TYPE } from './config';

export const getDeveloperInfo = type => {
  switch (type) {
    case DEVELOPER_TYPE.OPENAI:
      return { icon: 'openai', name: 'OpenAI' };
    case DEVELOPER_TYPE.AZURE_OPENAI:
      return { icon: 'azure', name: 'Azure' };
    case DEVELOPER_TYPE.QWEN:
      return { icon: 'qwen', name: _l('通义千问') };
    case DEVELOPER_TYPE.DEEPSEEK:
      return { icon: 'deepseek', name: 'DeepSeek' };
    case DEVELOPER_TYPE.CUSTOM:
      return { icon: 'custom', name: _l('自主集成') };
    default:
      return { icon: 'openai', name: 'OpenAI' };
  }
};
