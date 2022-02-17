import React from 'react';
import qs from 'query-string';
import preall from 'src/common/preall';
import service from '../../api/service';
import shareajax from 'src/api/share';
import LoadDiv from 'ming-ui/components/LoadDiv';
import { NODE_TYPE } from '../../constant/enum';

let AttachmentsPreview;

class NodeShare extends React.Component {
  state = {
    node: null,
    currentAccountId: null,
    loading: true,
  };

  _isMounted = false;

  componentDidMount() {
    this._isMounted = true;
    require.ensure([], require => {
      AttachmentsPreview = require('../AttachmentsPreview');
      let promise, shareId;
      try {
        shareId = location.pathname.match(/.*\/apps\/kcshare\/(\w+)/)[1];
      } catch (err) {}
      if (shareId) {
        promise = shareajax.getShareNode({ shareId }).then(data => {
          this.actionResult = data.actionResult;
          return data.node;
        });
      } else if (location.search) {
        const query = qs.parse(location.search.slice(1, location.search.length));
        if (query.id) {
          promise = service.getNodeById(query.id);
        }
      }

      $.when(promise).then(node => {
        if (!node) {
          this.setState({ loading: false });
          return;
        }
        if (node.type === NODE_TYPE.FOLDER) {
          node = null;
        }
        document.title = `${node.name}.${node.ext}`;
        this._isMounted && this.setState({ node, loading: false });
      });
    });
  }

  componentWillUnmount() {
    this._isMounted = false;
  }

  render() {
    if (!AttachmentsPreview || this.state.loading) {
      return <LoadDiv size="big" />;
    } else if (!this.state.node) {
      if (this.actionResult === 2) {
        window._alert(_l('请先登录'));
        location.href =
          md.global.Config.WebUrl +
          'login?ReturnUrl=' +
          encodeURIComponent(window.location.href.replace('checked=login', ''));
      } else {
        window._alert(_l('当前文件不存在或您没有权限查看此文件'));
      }
      return '';
    } else {
      return (
        <AttachmentsPreview
          options={{
            attachments: [this.state.node],
            callFrom: 'kc',
            fromType: 6,
            index: 0,
          }}
        />
      );
    }
  }
}

module.exports = preall(NodeShare, { allownotlogin: true });
