import React, { Component } from 'react';
import axios from 'axios';
import API_URL from '../config';

export default class CreateUser extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      message: null,
      messageType: 'success'
    };
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const user = {
      username: this.state.username
    };

    axios.post(`${API_URL}/users/add`, user)
      .then(res => {
        this.setState({
          username: '',
          message: `User '${user.username}' created successfully!`,
          messageType: 'success'
        });
      })
      .catch(err => {
        const errorMsg = err.response?.data ? JSON.stringify(err.response.data) : err.message;
        this.setState({
          message: `Error creating user: ${errorMsg}`,
          messageType: 'danger'
        });
      });
  }

  render() {
    return (
      <div className="card shadow-sm p-4 mt-3">
        <h3 className="mb-4">Create New User</h3>
        { this.state.message && (
          <div className={`alert alert-${this.state.messageType} alert-dismissible fade show`} role="alert">
            {this.state.message}
            <button type="button" className="btn-close" onClick={() => this.setState({ message: null })}></button>
          </div>
        ) }
        <form onSubmit={this.onSubmit}>
          <div className="mb-3"> 
            <label className="form-label fw-semibold">Username: </label>
            <input  type="text"
                required
                className="form-control"
                placeholder="Enter username (min 3 characters)"
                value={this.state.username}
                onChange={this.onChangeUsername}
                />
          </div>
          <div className="mt-4">
            <input type="submit" value="Create User" className="btn btn-primary px-4" />
          </div>
        </form>
      </div>
    );
  }
}