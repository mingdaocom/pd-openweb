import React, { Component } from 'react';
import kc from 'src/api/kc';
import RegExpValidator from 'src/utils/expression';
import FileMessage from '../FileMessage';
import ImageMessage from '../ImageMessage';

export default class KcFileMessage extends Component {
  constructor(props) {
    super(props);
  }
  componentDidMount() {
    this.getNodeDetail();
  }
  componentWillReceiveProps(nextProps) {
    this.getNodeDetail();
  }
  getNodeDetail() {
    const { message } = this.props;
    const { entityid } = message.card;
    if (!message.kcFile) {
      kc.getNodeDetail({
        id: entityid,
        actionType: 14,
      }).then(result => {
        if (result) {
          this.props.onUpdateKcFile(this.format(result));
        }
      });
    }
  }
  format(kcFile) {
    const { message } = this.props;
    message.msg.files = {
      name: message.card.title,
      size: kcFile ? kcFile.size : 0,
      url: kcFile ? kcFile.viewUrl : '',
    };
    message.kcFile = kcFile;
    return message;
  }
  render() {
    const { message, session } = this.props;
    const { title } = message.card;
    const isPicture = RegExpValidator.fileIsPicture(`.${RegExpValidator.getExtOfFileName(title)}`);
    const msg = message.kcFile ? message : this.format();
    return isPicture && message.kcFile ? (
      <ImageMessage message={msg} session={session} />
    ) : (
      <FileMessage message={msg} session={session} />
    );
  }
}
