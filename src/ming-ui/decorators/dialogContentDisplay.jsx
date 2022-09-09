import React, { Component } from 'react';
import { string, func } from 'prop-types';

/**
 * 高阶组件
 * 适用于弹窗中的信息展示
 */

export default WrapComponent => {
  return class DialogInfoDisplay extends Component {
    static propTypes = {
      companyId: string,
      api: func,
    };

    state = {
      data: [],
      pageIndex: 1,
      pageSize: 20,
      haveMoreData: true,
    };

    componentDidMount() {
      this.getData();
      this.pending = true;
    }

    /**
     * 请求是否正在进行
     */
    pending = false;

    /**
     * 获取数据
     */
    getData = () => {
      const { companyId, api } = this.props;
      let { data, pageIndex, pageSize, haveMoreData, isAsc, sortId } = this.state;
      const para = { companyId, pageIndex, pageSize, isAsc, sortId };
      if (haveMoreData && !this.pending) {
        api(para).then(res => {
          this.pending = false;
          data = pageIndex === 1 ? res : data.concat(res);
          this.setState({
            data,
            pageIndex: pageIndex + 1,
          });

          if (res.length < pageSize) {
            this.setState({ haveMoreData: false });
          }
        });
      }
    };

    /**
     * 滚动加载数据
     */
    handleScroll = (e, o) => {
      const { haveMoreData } = this.state;
      if (o.maximum - o.position <= 30 && haveMoreData) {
        this.getData();
        this.pending = true;
      }
    };

    handleSorter = params => {
      const { pageIndex, isAsc, sortId } = params;
      this.setState(
        {
          pageIndex,
          isAsc,
          sortId,
        },
        () => {
          this.getData();
          this.pending = false;
        },
      );
    };

    handleDelete = messageTemplateIds => {
      const { deleteSMSTemplate } = this.props;
      let { data = [] } = this.state;
      deleteSMSTemplate({
        messageTemplateIds,
      }).then(res => {
        if (res) {
          let result = data.filter(item => !_.includes(messageTemplateIds, item.id));
          this.setState({ data: result });
          alert(_l('删除成功'));
        } else {
          alert(_l('删除失败'), 2);
        }
      });
    };

    render() {
      const { data } = this.state;
      return (
        <WrapComponent
          data={data}
          handleScroll={_.debounce(this.handleScroll)}
          handleSorter={this.handleSorter}
          handleDelete={this.handleDelete}
          {...this.props}
        />
      );
    }
  };
};
