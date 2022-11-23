import { useState, useCallback } from 'react';
import { isUrlRequest } from 'src/util';

export function getUrlList(text) {
  const array = text.replace(/\n/, ' ').split(' ');
  const result = [];

  for(let i = 0; i < array.length; i++) {
    let content = array[i];
    if (isUrlRequest(content)) {
      result.push(content);
    }
  }

  return result;
}