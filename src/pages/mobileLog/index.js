import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { getRequest, mdAppResponse } from 'src/util';
import preall from 'src/common/preall';
import { Flex, ActivityIndicator } from 'antd-mobile';
import { Provider } from 'react-redux';
import { configureStore } from 'src/redux/configureStore';
import worksheetAjax from 'src/api/worksheet';
import WorksheetRocordLog from 'src/pages/worksheet/components/WorksheetRecordLog/WorksheetRocordLog';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/Themes/theme.less';
import 'src/common/mdcss/iconfont/mdfont.css';
import _ from 'lodash';

const store = configureStore();

const { access_token, appId, worksheetId, rowId, getLogParams } = getRequest();

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
      filterUniqueIds: [],
    };
    window.access_token = access_token;
  }

  componentDidMount() {
    this.getControls();
    if (getLogParams === 'true') {
      mdAppResponse({ type: 'getLogParams' }).then(data => {
        const { value } = data;
        this.setState({
          filterUniqueIds: _.isArray(value) && value.length ? value : [],
        });
      });
    }
  }

  getControls = () => {
    worksheetAjax
      .getWorksheetInfo({
        appId,
        getTemplate: true,
        worksheetId,
      })
      .then(res => {
        this.setState({ controls: _.get(res, 'template.controls') });
      });
  };

  render() {
    const { controls = [], filterUniqueIds } = this.state;
    let param = getLogParams === 'true' ? { filterUniqueIds: filterUniqueIds, showFilter: false } : {};
    return (
      <Provider store={store}>
        <LogContent>
          {getLogParams === 'true' ? (
            !!filterUniqueIds.length && (
              <WorksheetRocordLog controls={controls} worksheetId={worksheetId} rowId={rowId} {...param} />
            )
          ) : (
            <WorksheetRocordLog controls={controls} worksheetId={worksheetId} rowId={rowId} {...param} />
          )}
        </LogContent>
      </Provider>
    );
  }
}

const Comp = preall(MobileLog, { allownotlogin: false });

ReactDOM.render(<Comp />, document.querySelector('#mobileLog'));
