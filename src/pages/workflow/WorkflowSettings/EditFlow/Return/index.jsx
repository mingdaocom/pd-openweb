import React, { Component } from 'react';
import { Icon } from 'ming-ui';
import { SimplifyNode } from '../components';

export default class Return extends Component {
  render() {
    const { item } = this.props;

    return (
      <div className="flexColumn">
        <section className="workflowBox" data-id={item.id}>
          <SimplifyNode
            {...this.props}
            IconClassName="BGRed"
            IconElement={<Icon type="rounded_square" />}
            info={_l(
              '强制中止当前流程，后续所有节点不再执行。在封装业务流程中，输出参数中所有引用本节点之后的值将输出空值。在配置了开启了平台 API 的封装业务流程或配置了自定义响应的Webhook流程中，响应值中所有引用本节点之后的值将输出空值。',
            )}
          />
        </section>
      </div>
    );
  }
}
