const UID = {
  /**
   * generate UID
   */
  generate: () => {
    return new Date().getTime().toString() + '-' + (Math.random() * 100000000).toString();
  },
};

export default UID;
