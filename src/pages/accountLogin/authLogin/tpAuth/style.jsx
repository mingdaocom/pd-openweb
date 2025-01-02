import styled from 'styled-components';

export const Wrap = styled.div`
  width: 100%;
  height: 100%;
  overflow: auto;
  background-color: #f2f5f7;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  background-color: #f2f5f7;

  .tpLoginContent {
    a {
      color: #2196f3;
    }
    a:hover {
      text-decoration: none;
      color: #1565c0;
    }
    .contianerBGStyle {
      -moz-border-radius: 2px;
      -webkit-border-radius: 2px;
      border-radius: 2px;
      background-color: #fff;
      box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
      -weblit-box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
      -moz-box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
      -ms-box-shadow: 0 2px 6px 0px rgba(0, 0, 0, 0.15);
    }
    .btn {
      color: white;
      height: 44px;
      text-align: center;
      border-radius: 4px;
      -moz-border-radius: 4px;
      -webkit-border-radius: 4px;
      font-size: 14px;
      border: 0px;
      width: 100%;
    }
    .btnEnabled {
      background-color: #2196f3;
      cursor: pointer;
      -webkit-transition: background-color 0.5s;
      transition: background-color 0.5s;
    }
    .btnEnabled:hover {
      background-color: #42a5f5;
      -webkit-transition: background-color 0.5s;
      transition: background-color 0.5s;
    }
    .main .container {
      width: 392px;
      margin: 0px auto;
      margin-top: 45px;
    }
  }
  .tpLoginContentArea {
    width: 350px;
    margin: 0px auto;
    text-align: center;
    margin-top: 60px;
    padding: 30px;
  }
  
  @media screen and (max-width: 400px) {
    .tpLoginContentArea {
      width: 290px;
    }
  }
  
  .tpLoginContentArea .title {
    font-size: 18px;
    color: #151515;
    margin-bottom: 15px;
  }
  .tpLoginContentArea .desc {
    font-size: 13px;
    color: #aaa;
    margin-bottom: 30px;
  }
  .tpLoginContentArea .btn {
    line-height: 44px;
  }
  .tpLoginContentArea .btnReg {
    background-color: #f0f0f0;
    border: 1px solid #ddd;
    color: #151515;
  }
  .tpAutoBind {
    width: 120px;
    margin: 0px auto;
    margin-top: 100px;
  }
  .tpAutoBind .sucIcon {
    background: url('images/sucIcon.png') no-repeat center center;
    width: 32px;
    height: 32px;
    display: inline-block;
    margin-right: 10px;
  }
  .tpAutoBind .txt {
    line-height: 32px;
    color: #999;
    font-size: 16px;
  }
  @media screen and (max-width: 500px) {
    background-color: #eef1f6;
  }
`;
