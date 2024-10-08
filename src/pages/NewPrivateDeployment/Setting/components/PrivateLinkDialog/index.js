import React, { Component, Fragment } from 'react';
import { Icon, Dialog, Input, LoadDiv, SortableList } from 'ming-ui';
import privateLinkApi from 'src/api/privateLink';
import './index.less';

function SortableItem(props) {
  const { item, isVerify, editLink, delLink, DragHandle } = props;
  const errorStyle = { borderColor: 'red' };

  return (
    <div className="flexRow valignWrapper mBottom10" key={item.linkId}>
      <div className="valignWrapper mRight10">
        <DragHandle>
          <Icon className="Font17 Gray_9e pointer" icon="drag" />
        </DragHandle>
      </div>
      <Input
        autoFocus={true}
        style={isVerify && !item.name ? errorStyle : {}}
        className="flex mRight10"
        value={item.name}
        onChange={value => {
          editLink(item.linkId, { name: value });
        }}
      />
      <Input
        className="flex"
        style={isVerify && !item.href ? errorStyle : {}}
        value={item.href}
        onChange={value => {
          editLink(item.linkId, { href: value });
        }}
      />
      <div className="mLeft10 ThemeColor pointer" onClick={() => delLink(item.linkId)}>
        {_l('删除')}
      </div>
    </div>
  );
}

export default class PrivateLinkDialog extends Component {
  constructor(props) {
    super(props);
    this.state = {
      linkList: [],
      loading: true,
      isVerify: false,
    };
  }
  componentDidMount() {
    this.getLinkList();
  }
  componentWillReceiveProps(nextProps) {}
  getLinkList() {
    privateLinkApi.getLinkList().then(data => {
      this.setState({
        linkList: data,
        loading: false,
      });
    });
  }
  shouldCancelStart = ({ target }) => {
    return !target.classList.contains('icon-drag');
  };
  createLink = () => {
    const { linkList } = this.state;
    this.setState({
      linkList: linkList.concat({
        linkId: Date.now(),
        name: '',
        href: '',
        sortIndex: linkList.length,
      }),
    });
  };
  editLink = (id, data) => {
    const { linkList } = this.state;
    this.setState({
      isVerify: false,
      linkList: linkList.map(item => {
        if (item.linkId === id) {
          return {
            ...item,
            ...data,
          };
        }
        return item;
      }),
    });
  };
  delLink = id => {
    const { linkList } = this.state;
    this.setState({
      linkList: linkList.filter(n => n.linkId !== id),
    });
  };
  handleSortEnd = newItems => {
    this.setState(
      {
        linkList: newItems.map((n, i) => {
          return {
            ...n,
            sortIndex: i,
          };
        }),
      },
      () => {
        this.handleSave();
      },
    );
  };
  handleSave = event => {
    const { linkList } = this.state;

    if (linkList.filter(n => !n.name || !n.href).length) {
      this.setState({
        isVerify: true,
      });
      alert(_l('请填写名称和链接'), 3);
      return;
    }

    privateLinkApi
      .addLink({
        links: linkList,
      })
      .then(data => {
        if (data) {
          this.props.onSave(linkList);
          alert(_l('保存成功'));
        }
      });

    if (event) {
      this.props.onCancel();
    }
  };

  renderList = () => {
    const { linkList, isVerify } = this.state;

    return (
      <div>
        {!!linkList.length && (
          <div className="flexRow valignWrapper mBottom10">
            <div className="flex" style={{ marginLeft: 27 }}>
              {_l('名称')}
            </div>
            <div className="flex" style={{ marginLeft: -27 }}>
              {_l('链接')}
              <span className="Gray_9e">{` (${_l('请输入完整链接，以http://或https://开头')})`}</span>
            </div>
          </div>
        )}
        <SortableList
          useDragHandle
          items={linkList}
          itemKey="linkId"
          helperClass="linkSortableCard"
          onSortEnd={this.handleSortEnd}
          renderItem={options => (
            <SortableItem {...options} isVerify={isVerify} editLink={this.editLink} delLink={this.delLink} />
          )}
        />
        <span className="ThemeColor pointer" onClick={this.createLink}>
          {_l('添加链接')}
        </span>
      </div>
    );
  };

  render() {
    const { visible, onCancel } = this.props;
    const { loading } = this.state;

    return (
      <Dialog
        visible={visible}
        width={800}
        title={_l('设置链接')}
        okText={_l('保存')}
        onOk={this.handleSave}
        onCancel={onCancel}
      >
        {loading ? <LoadDiv /> : this.renderList()}
      </Dialog>
    );
  }
}
