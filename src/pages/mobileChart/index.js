import React from 'react';
import ReactDOM from 'react-dom';
import styled from 'styled-components';
import { getRequest } from 'src/util';
import preall from 'src/common/preall';
import ChartContent from 'src/pages/Mobile/CustomPage/ChartContent';
import 'src/common/mdcss/inStyle.css';
import 'src/common/mdcss/basic.css';
import 'src/common/mdcss/Themes/theme.less';
import 'src/common/mdcss/iconfont/mdfont.css';

const LayoutContent = styled.div`
  width: 100%;
  height: 100%;
  padding: 8px 15px;
  box-sizing: border-box;
  background-color: #fff;
`;

const { reportId, access_token } = getRequest();

class MobileChart extends React.Component {
  constructor(props) {
    super(props);
  }
  render() {
    const paddingHorizontal = 15 * 2;
    const paddingVertical = 8 * 2;
    const dimensions = {
      width: document.documentElement.clientWidth - paddingHorizontal,
      height: document.documentElement.clientHeight - paddingVertical,
    };
    return (
      <LayoutContent className="mobileAnalysis flexColumn">
        <ChartContent reportId={reportId} accessToken={access_token} dimensions={dimensions} />
      </LayoutContent>
    );
  }
}

const Comp = preall(MobileChart, { allownotlogin: true });

ReactDOM.render(<Comp />, document.querySelector('#mobileChart'));
