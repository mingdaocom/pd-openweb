import React, { Component } from 'react';
import TagTextarea from './TagTextarea';

export default class DEMO extends Component {
  render() {
    return (<div className="TagTextareaDemo">
      <TagTextarea
        /**
         * renderTag 渲染tag
         * @param {string} tag $$匹配到的之间的值
         * @param {object} options 一些参数
         * @return {element} 返回一个dom节点
         * */
        renderTag={(tag, options) => {
          const ele = document.createElement('div');
          ele.innerHTML = `<div style="padding: 4px;
          margin: 4px;
          border: 1px solid #ccc;
          border-radius: 5px;
          line-height: 1em;">${tag}</div>`;
          return ele;
        }}
        /**
         * 用来接受组件暴露出来this对象
         * setValue 强制更新 TagTextarea里值
         * eg: this.tagtextarea.setValue('$id$----$id$-******-$id$')
         * insertColumnTag 插入 tag
         * eg: this.tagtextarea.insertColumnTag('id')
         * */
        getRef={(tagtextarea) => { this.tagtextarea = tagtextarea; }}
        onFocus={() => {
          // focus 事件
          console.log('focus');
        }}
        onBlur={() => {
          // blur 事件
          console.log('blur');
        }}
        onChange={(err, value, obj) => {
          /**
           * change 事件
           * @param err 错误信息 正常为null
           * @param value 控件最新值
           * @param obj codeMirror change事件的对象
           * */
          console.log('change', value, obj);
        }}
      />
      <div>
        { [...new Array(10)].map((a, i) => <button
          onClick={() => {
            this.tagtextarea.insertColumnTag(i);
          }}>{ i }</button>) }
        <button onClick={() => { this.tagtextarea.setValue(''); }}>reset</button>
      </div>
    </div>);
  }
}
