import React, { useState, Fragment } from 'react';
import { Modal } from 'ming-ui';
import { IconButton, Icon } from './styled';
import Remarkable from 'remarkable';
import { highlight, languages } from 'prismjs/components/prism-core';
import 'prismjs/components/prism-clike';
import 'prismjs/components/prism-javascript';
import { MarkdownWithCSS } from './ChatBot/MarkdownWithCSS';
import styled from 'styled-components';

const Con = styled.div`
  padding: 0px 0px 40px;
`;

const mdParts = [
  _l('自定义字段是一个支持使用 React 语法对当前字段进行样式和交互上的自定义的新字段。'),
  _l('字段分为存储类型和引用类型'),
  _l('存储类型基于现有控件，支持存储值。引用类型只是用于呈现已有的数据，自身无法存储值。'),
  _l('### 快速开始'),
  _l('一个基础的存储类型组件，字段存储类型是文本。'),
  `\`\`\`javascript
function RandomIdGenerator({ value, onChange }) {
  const [id, setId] = useState(value);

  return (
    <div className="flex items-center">
      <span className="flex-1 text-[#151515] text-[20px] font-bold text-center">{id}</span>
      <button
        onClick={() => {
          const newId = Math.random().toString(36).substr(2, 10);
          setId(newId);
          onChange(newId);
        }}
        className="p-2 bg-[#2196f3] text-white rounded-full"
      >
        <LucideIcon name="RefreshCcw" size="16" />
      </button>
    </div>
  );
}
\`\`\``,
  _l('存储类型接收 `value` 和 `onChange`，`value`是当前字段的值，处理好值后可以调用`onChange`来更新值。'),
  _l(
    '组件只支持 function 写法，你需要在编辑器里实现这样一个函数。只支持写一个函数，所有逻辑在函数内实现。不可以使用 import，所有逻辑都需要原生实现。React 下的所有属性都已经暴露到组件内，你可以直接使用。',
  ),
  _l(
    '组件支持 Tailwind CSS 你可以直接使用，组件内已经预置了 lucide icons，用法与官方稍微有些不同，需要使用 `LucideIcon` 组件，name 是具体的图标名称。名称是大驼峰写法，你可以在 [这里][1] 找到，其他属性和 `lucide-react` 一致。',
  ),
  _l('引用类型组件没有 `value` 和 `onChange` 属性，它是从 `formData` 查找字段值来呈现。'),
  _l('这是一个简单的引用类型示例'),
  `\`\`\`javascript
function NameDisplay({ formData, env }) {
  const targetControlId = env.name; // ${_l('获取引用字段的 controlId')}
  const targetValue = formData[targetControlId]?.value || ''; // ${_l('获取名称字段的值')}

  return <div className="text-2xl text-red-500">{targetValue || '名称未设置'}</div>;
}
\`\`\``,
  _l(
    '这个组件功能是去到名称的值，放大以红色显示出来。组件接收 `formData` 属性，formData 是记录的字段数据，你需要先在编辑器右上角把字段添加到引用并设置别名。这时你可以通过 `formData[env.别名]`来获取到对应的字段。',
  ),
  _l('组件 props 属性：'),
  _l('`value` [仅存储类型存在]: 当前字段值'),
  _l('`onChange` [仅存储类型存在]: 更新字段值'),
  _l('`currentControl`: 当前字段'),
  _l(
    '`env`: 环境变量，引用的字段 id 存储在这里，通过 `env.别名` 来获取，此外还包括 isMobile(是否是移动端) 和 isDisabled(是否禁用) 两个属性。',
  ),
  _l('`formData`: 引用的字段数据，{ [controlId]: control } 格式，通过 `formData[env.别名]`来获取。'),
  '[1]: https://lucide.dev/guide/packages/lucide-react',
];

const md = mdParts.join('\n\n');

const mdRemarkable = new Remarkable({
  breaks: true,
  typographer: true,
  highlight(str, lang) {
    return highlight(str, languages.js);
  },
});
export default function DevelopGuide() {
  const [visible, setVisible] = useState(false);
  return (
    <Fragment>
      {visible && (
        <Modal title={_l('开发指南')} visible width={800} showConfirm={false} onCancel={() => setVisible(false)}>
          <Con>
            <MarkdownWithCSS
              dangerouslySetInnerHTML={{
                __html: mdRemarkable.render(md),
              }}
            />
          </Con>
        </Modal>
      )}
      <IconButton className="mLeft15" onClick={() => setVisible(true)}>
        <Icon className="icon icon-help" color="#9e9e9e" />
        <span className="text">{_l('开发指南')} </span>
      </IconButton>
    </Fragment>
  );
}
