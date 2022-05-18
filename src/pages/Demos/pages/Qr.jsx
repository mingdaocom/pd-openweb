import React, { useState } from 'react';
import { Qr } from 'ming-ui';

export default function D(props) {
  const [content, setContent] = useState('http://mingdao.com');
  return (
    <div>
      <Qr content={content} gap={10} width={200} height={200} />
      <button onClick={() => setContent(Math.random())}>random</button>
    </div>
  );
}
