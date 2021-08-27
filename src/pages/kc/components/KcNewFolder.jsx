import React, { Component } from 'react';
import PropTypes from 'prop-types';
import { autobind } from 'core-decorators';

export default class KcNewFolder extends Component {
  static propTypes = {
    isList: PropTypes.bool,
    addNewFolder: PropTypes.func,
    onHideAddNewFolder: PropTypes.func,
  };
  constructor(props) {
    super(props);
    this.state = {
      folderName: '',
    };
  }
  componentDidMount() {
    if (this.input) {
      this.input.focus();
    }
  }

  @autobind
  handleNewFolder() {
    const { addNewFolder, onHideAddNewFolder } = this.props;
    const { folderName } = this.state;
    addNewFolder(folderName, (err) => {
      if (!err) {
        onHideAddNewFolder();
      } else if (err.validName) {
        this.setState({
          folderName: err.validName,
        }, () => {
          if (this.input) {
            this.input.focus();
          }
        });
      } else {
        onHideAddNewFolder();
      }
    });
  }

  @autobind
  handleKeyDownInFolder(evt) {
    if (evt.keyCode == 13) {
      this.handleNewFolder();
      evt.preventDefault();
      evt.stopPropagation();
    }
  }
  render() {
    const { isList } = this.props;
    const { folderName } = this.state;
    return isList ? <li key="new" className="flexRow addNewFolder">
      <span className="noSelectPoint" />
      <span className="type fileIcon-folder" />
      <input
        ref={input => (this.input = input)}
        type="text"
        className="addFolderName flex"
        value={folderName}
        placeholder={_l('请输入文件夹名称')}
        onChange={ (evt) => { this.setState({ folderName: evt.target.value }); } }
        onBlur={this.handleNewFolder}
        onKeyDown={this.handleKeyDownInFolder}
      />
    </li> : <li key="new" className="thumbnailItem addNewFolder">
      <div className="thumbnailImg">
        <span className="type fileIcon-folder" />
      </div>
      <input
        ref={input => (this.input = input)}
        type="text"
        className="addFolderName thumbnailName"
        value={folderName}
        placeholder={_l('请输入文件夹名称')}
        onChange={ (evt) => { this.setState({ folderName: evt.target.value }); } }
        onBlur={this.handleNewFolder}
        onKeyDown={this.handleKeyDownInFolder}
      />
    </li>;
  }
}
