import Styled from 'styled-components';

export const Container = Styled.div`
  overflow: auto;
  max-width: 1200px;
  max-height: 800px;
  width: 1200px;
  height: 800px;

  img {
    width: 100%;
  }
`;


export const ActionRow = Styled.div`
  display: flex;
  margin: 20px 0;

  button {
    margin-right: 12px;
  }

  form, input {
    font-size: 14px;
    padding: 8px 16px;
    border-radius: 8px;
    width: 50%;
  }
`;
