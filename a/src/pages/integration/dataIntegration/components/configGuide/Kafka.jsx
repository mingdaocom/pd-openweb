import React from 'react';
import './index.less';

export default function KafkaGuide(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 Kafka 的数据通过系统实时同步到工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('kafka 版本 2.3.x 以上')}</li>
        <li>{_l('已有topic且仅支持 JSON 字符串的消息格式 ，如 {"id":1, "name": "张三"}')}</li>
      </ul>

      <h5>{_l('检查kfaka版本')}</h5>
      <div className="subTitle">{_l('进入kafka安装目录执行')}</div>
      <div className="sqlText">
        <div>find ./libs/ -name \*kafka_\* | head -1 | grep -o '\kafka[^\n]*' 1</div>
      </div>
      <div className="subTitle">{_l('执行命令查询')}</div>
      <div className="sqlText">
        <div>{"ps -ef|grep '/libs/kafka.\\{2,40\\}.jar' 1"}</div>
      </div>
    </div>
  ) : null;
}
