import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { getRequest, mdAppResponse } from 'src/util';
import preall from 'src/common/preall';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import { getWorksheetInfo } from 'src/api/worksheet';
import WorksheetRocordLog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRocordLog';
import 'src/common/mdcss/inStyle.css';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/Themes/theme.less';
import 'src/common/mdcss/iconfont/mdfont.css';

const store = configureStore();

const { appId, worksheetId, rowId } = getRequest();

const LogContent = styled.div`
  width: 100%;
  height: 100%;
  color: rgba(0, 0, 0, 0.85);
  background-color: #fafafa;
`;

class MobileLog extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      filters: [],
    };
  }

  componentDidMount() {
    this.getControls();
  }

  getControls = () => {
    getWorksheetInfo({
      appId,
      getTemplate: true,
      worksheetId,
    }).then(res => {
      this.setState({ controls: _.get(res, 'template.controls') });
    });
  };

  render() {
    const { controls = [] } = this.state;
    return (
      <Provider store={store}>
        <LogContent>
          <WorksheetRocordLog controls={controls} worksheetId={worksheetId} rowId={rowId} />
        </LogContent>
      </Provider>
    );
  }
}

const Comp = preall(MobileLog, { allownotlogin: false });

ReactDOM.render(<Comp />, document.querySelector('#mobileLog'));
