import React, { Component } from 'react';
import { string } from 'prop-types';
import JsonView from 'react-json-view';
import LoadDiv from 'ming-ui/components/LoadDiv';
import ScrollView from 'ming-ui/components/ScrollView';
import ErrorState from 'src/components/errorPage/errorState';
import api from '../../api/flowNode';
import './index.less';

export default class WebHookCheatSheet extends Component {
  constructor(props) {
    super(props);
    const { selectNodeId, processId } = props.match.params;
    this.state = {
      apiData: { data: {}, formatData: [] },
      loading: true,
      errorState: !selectNodeId || !processId,
    };
  }
  componentDidMount() {
    const { processId, currentNodeId: nodeId, selectNodeId } = this.props.match.params;
    if (processId && selectNodeId) {
      api.getWebHookData({ selectNodeId, nodeId, processId }).then(apiData => {
        this.setState({ apiData, loading: false });
      });
    }
  }
  goIndex = () => {
    location.href = '/';
  };
  render() {
    const { apiData, loading, errorState } = this.state;
    const { app, process, data, formatData } = apiData;
    if (errorState) return <ErrorState text={_l('参数错误')} />;
    if (loading) return <LoadDiv />;
    return (
      <div className="c-workflowWebHookCheatSheet">
        <header onClick={this.goIndex} />
        <div className="detail">
          <div className="header">
            <div className="title Font22">{_l('触发Webhook')}</div>
            <div className="source">
              <div className="flow Font15 Gray_75">{_l('流程: %0', process.name)}</div>
              <div className="sheet Font15 Gray_75">{_l('工作表: %0', app.name)}</div>
            </div>
          </div>
          <ScrollView style={{ height: 750 }}>
            <div className="content">
              <div className="title Font17">{_l('字段对照表')}</div>
              <div className="explain">{_l('将向对应的HTTP地址，以POST方式发送JSON格式数据')}</div>
              <ul>
                <li className="header Font14">
                  <div className="item">{_l('字段名称')}</div>
                  <div className="item">{_l('数据类型')}</div>
                  <div className="item">{_l('API Code')}</div>
                </li>
                {formatData.map((item, key) => {
                  const { name, type, code } = item;
                  return (
                    <li key={key} className={type}>
                      <div className="item">{name}</div>
                      <div className="item">{type}</div>
                      <div className="item">{code}</div>
                    </li>
                  );
                })}
              </ul>
            </div>
            <div className="jsonExample">
              <JsonView src={data} theme="apathy:inverted" name={null} />
            </div>
          </ScrollView>
        </div>
      </div>
    );
  }
}
