import React from 'react';
import ReactDom from 'react-dom';
import styled from 'styled-components';
import { browserIsMobile } from 'src/util';
import cx from 'classnames';
import { RichText, LoadDiv } from 'ming-ui';
import privateDeclareAjax from 'src/api/privateDeclare';

const Wrap = styled.div`
  background: #f5f5f5;
  .con {
    margin: 40px auto;
    background: #fff;
    max-width: 900px;
    padding: 30px;
    border-radius: 4px;
    border: #dce2e4 1px solid;
    box-sizing: border-box;
    &.isMobile {
      width: 100%;
      margin: 0;
      .editorNull {
        border: none;
      }
    }
  }
`;
class AgreenOrPrivacy extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      summary: '',
      loading: true,
    };
  }
  componentDidMount() {
    this.ajax = privateDeclareAjax.getDeclare();
    this.ajax.then(res => {
      document.title = location.pathname.indexOf('privacy') < 0 ? _l('服务协议') : _l('隐私政策');
      this.setState({
        summary: location.pathname.indexOf('privacy') < 0 ? res.agreement : res.privacy,
        loading: false,
      });
    });
  }
  render() {
    const { summary, loading } = this.state;
    if (loading) {
      return <LoadDiv />;
    }
    return (
      <Wrap>
        <div className={cx('con', { isMobile: browserIsMobile() })}>
          <RichText data={summary || ``} className={''} disabled={true} backGroundColor={'#fff'} />
        </div>
      </Wrap>
    );
  }
}

ReactDom.render(<AgreenOrPrivacy />, document.getElementById('app'));
