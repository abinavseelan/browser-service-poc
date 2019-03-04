import React, { Component } from 'react';
import io from 'socket.io-client';

const socket = io('http://localhost:1337/');

import { ActionRow, Container } from './styles';

class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      loading: true,
      pageContent: null,
      urlBarFocused: false,
      urlBar: '',
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
      const updateObject = {
        loading: false,
        pageContent: data.pageContent,
      };

      if (!this.state.urlBarFocused) {
        updateObject.urlBar = data.url;
      }

      this.setState(updateObject);
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

  handleBack = () => {
    socket.emit('go-back');
  }

  handleUrlUpdate = (e) => {
    this.setState({
      urlBar: e.target.value,
    });
  }

  handleNavigation = (e) => {
    e.preventDefault();

    socket.emit('navigate', { url: this.state.urlBar });
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
                <ActionRow>
                  <button onClick={this.handleBack}>
                    Go Back
                  </button>
                  <form onSubmit={this.handleNavigation}>
                    <input
                      type='text'
                      onFocus={() => this.setState({ urlBarFocused: true })}
                      onBlur={() => this.setState({ urlBarFocused: false })}
                      value={this.state.urlBar}
                      onChange={this.handleUrlUpdate}
                    />
                  </form>
                </ActionRow>
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
