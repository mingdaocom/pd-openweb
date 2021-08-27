import React, { Component } from 'react';
import { string, func } from 'prop-types';

/**
 * 高阶组件
 * 适用于弹窗中的信息展示
 */

export default (WrapComponent) => {
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
      let { data, pageIndex, pageSize, haveMoreData } = this.state;
      const para = { companyId, pageIndex, pageSize };
      if (haveMoreData && !this.pending) {
        api(para).then((res) => {
          this.pending = false;
          data = data.concat(res);
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

    render() {
      const { data } = this.state;
      return <WrapComponent data={data} handleScroll={_.debounce(this.handleScroll)} {...this.props} />;
    }
  };
};
