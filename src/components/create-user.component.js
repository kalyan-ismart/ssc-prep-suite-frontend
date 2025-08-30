import React, { Component } from 'react';
import axios from 'axios';

export default class CreateUser extends Component {
  constructor(props) {
    super(props);
    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onSubmit = this.onSubmit.bind(this);
    this.state = {
      username: ''
    }
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
    }

    console.log(user);

    axios.post('https://ssc-prep-suite-backend-123.onrender.com/users/add', user)
      .then(res => console.log(res.data))
      .catch(err => console.log('Error:', err));

    this.setState({
      username: ''
    });

    alert('User created successfully!');
  }

  render() {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-md-6 offset-md-3">
            <div className="card">
              <div className="card-header">
                <h3>👤 Create New User</h3>
              </div>
              <div className="card-body">
                <form onSubmit={this.onSubmit}>
                  <div className="form-group mb-3">
                    <label htmlFor="username">Username: </label>
                    <input 
                      type="text"
                      required
                      className="form-control"
                      value={this.state.username}
                      onChange={this.onChangeUsername}
                      placeholder="Enter username"
                    />
                  </div>

                  <div className="form-group">
                    <input 
                      type="submit" 
                      value="Create User" 
                      className="btn btn-primary w-100" 
                    />
                  </div>
                </form>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
