import React, { Component } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:1337/');

import { Container } from './styles';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      pageContent: null,
    }

    socket.on('enviroment-setup', () => {
      socket.emit('bootstrap', { width: 1200, height: 800 });
    })

    socket.on('bootstrap-complete', (data) => {
      this.setState({
        loading: false,
        pageContent: data.pageContent,
      });
    });

    socket.on('new-page-content', (data) => {
      this.setState({
        loading: false,
        pageContent: data.pageContent,
      }, () => {
        socket.emit('blah', {});
      })
    })
  }

  handleClick = (e) => {
    e.stopPropagation();

    const rect = e.target.getBoundingClientRect();
    const x = e.clientX - rect.left; //x position within the element.
    const y = e.clientY - rect.top;  //y position within the element.

    socket.emit('click', { x, y });
  }

  handleKeyPress = (e) => {
    e.stopPropagation();

    socket.emit('keypress', {
      which: e.keyCode,
      capsLock: e.getModifierState('CapsLock'),
      shiftKey: e.shiftKey,
    });
  }

  render() {
    return (
      <div>
        {
          this.state.loading
            ? (
              <p>Loading Enviroment</p>
            )
            : (
              <React.Fragment>
                {/* <div>
                <input
                  type='text'
                  onChange={this.handleUrl}
                  placeholder='Enter Url'
                  value={this.state.currentUrl}
                />
                <button onClick={this.goToUrl}>Go</button>
              </div> */}
                <Container
                  onClick={this.handleClick}
                  tabIndex='0'
                  onKeyDown={this.handleKeyPress}
                >
                  <img alt='Cloud Browser' src={`data:image/jpeg;base64, ${this.state.pageContent}`} />
                </Container>
              </React.Fragment>
            )
        }
      </div>
    );
  }
}

export default App;
