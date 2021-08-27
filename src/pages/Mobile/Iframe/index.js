import React, { Fragment, Component } from 'react';
import { Flex } from 'antd-mobile';
import { Icon } from 'ming-ui';
import Back from '../components/Back';
import DocumentTitle from 'react-document-title';
import './index.less';

const data = {
  help: {
    url: 'https://help.mingdao.com',
    title: _l('帮助中心')
  }
}

export default class Iframe extends Component {
  constructor(props) {
    super(props);
  }
  render() {
    const { alias } = this.props.match.params;
    const { url, title } = data[alias];
    return (
      <Fragment>
        <DocumentTitle title={title} />
        <iframe
          className="mobileFrame"
          width="100%"
          height={document.documentElement.clientHeight}
          src={url}
        >
        </iframe>
        <Back
          className="low"
          onClick={() => {
            history.back();
          }}
        />
      </Fragment>
  	);
  }
}
