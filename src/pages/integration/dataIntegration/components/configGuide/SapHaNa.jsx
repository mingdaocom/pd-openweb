import React from 'react';
import './index.less';

export default function SapHaNa(props) {
  const { type } = props;
  return type === 'source' ? (
    <div className="guideContent">
      <p>{_l('你可以把 SAP HANA 数据库的数据通过系统定时同步到应用工作表或者其它数据目的地。')}</p>
      <h5>{_l('先决条件')}</h5>
      <ul>
        <li>{_l('确保数据库可以与数据集成通信')}</li>
      </ul>
    </div>
  ) : null;
}
