import React from 'react';
import { ScrollView } from 'ming-ui';

class ValidationRules extends React.Component {
  render() {
    return (
      <ScrollView className="validationBox">
        <p style={{ lineHeight: `${document.body.clientHeight - 350}px` }}>{_l('功能正在开发中，敬请期待…')}</p>
      </ScrollView>
    );
  }
}

export default ValidationRules;
