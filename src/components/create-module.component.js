import React, { Component } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import API_URL from '../config';

export default class CreateModule extends Component {
  constructor(props) {
    super(props);

    this.onChangeUsername = this.onChangeUsername.bind(this);
    this.onChangeDescription = this.onChangeDescription.bind(this);
    this.onChangeDuration = this.onChangeDuration.bind(this);
    this.onChangeDate = this.onChangeDate.bind(this);
    this.onSubmit = this.onSubmit.bind(this);

    this.state = {
      username: '',
      description: '',
      duration: 0,
      date: new Date(),
      users: []
    }
  }

  componentDidMount() {
    axios.get(`${API_URL}/users/`)
      .then(response => {
        if (response.data.length > 0) {
          this.setState({
            users: response.data.map(user => user.username),
            username: response.data[0].username
          });
        }
      })
      .catch((error) => {
        console.log('Error loading users:', error);
      });
  }

  onChangeUsername(e) {
    this.setState({
      username: e.target.value
    });
  }

  onChangeDescription(e) {
    this.setState({
      description: e.target.value
    });
  }

  onChangeDuration(e) {
    this.setState({
      duration: e.target.value
    });
  }

  onChangeDate(date) {
    this.setState({
      date: date
    });
  }

  onSubmit(e) {
    e.preventDefault();

    const module = {
      username: this.state.username,
      description: this.state.description,
      duration: Number(this.state.duration),
      date: this.state.date
    };

    axios.post(`${API_URL}/modules/add`, module)
      .then(res => {
        console.log(res.data);
        window.location = '/';
      })
      .catch(err => {
        console.error('Error creating module:', err);
      });
  }

  render() {
    return (
      <div className="card shadow-sm p-4 mt-3">
        <h3 className="mb-4">Create New Module Log</h3>
        <form onSubmit={this.onSubmit}>
          <div className="mb-3"> 
            <label className="form-label fw-semibold">Username: </label>
            { this.state.users.length === 0 && (
              <div className="text-danger small mb-1">
                No registered users found. <a href="/user">Click here to create a user first</a>.
              </div>
            ) }
            <select
                required
                className="form-select"
                value={this.state.username}
                onChange={this.onChangeUsername}>
                <option value="" disabled>-- Select User --</option>
                {
                  this.state.users.map(function(user) {
                    return <option 
                      key={user}
                      value={user}>{user}
                      </option>;
                  })
                }
            </select>
          </div>
          <div className="mb-3"> 
            <label className="form-label fw-semibold">Description: </label>
            <input  type="text"
                required
                className="form-control"
                placeholder="Enter description"
                value={this.state.description}
                onChange={this.onChangeDescription}
                />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold">Duration (in minutes): </label>
            <input 
                type="number" 
                min="1"
                className="form-control"
                value={this.state.duration}
                onChange={this.onChangeDuration}
                />
          </div>
          <div className="mb-3">
            <label className="form-label fw-semibold d-block">Date: </label>
            <DatePicker
              selected={this.state.date}
              onChange={this.onChangeDate}
              className="form-control"
            />
          </div>

          <div className="mt-4">
            <input type="submit" value="Create Module Log" className="btn btn-primary px-4" />
          </div>
        </form>
      </div>
    );
  }
}