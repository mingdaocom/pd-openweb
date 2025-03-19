import React, { Fragment, Component } from 'react';
import Back from '../components/Back';
import DocumentTitle from 'react-document-title';
import { getHelpUrl } from 'src/common/helpUrls';

const data = {
  help: {
    url: getHelpUrl('common', 'root'),
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
          className="overflowHidden Border0"
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
