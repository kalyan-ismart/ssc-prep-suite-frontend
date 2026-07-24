import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import API_URL from '../config';

const ModuleRow = (props) => (
  <tr>
    <td>{props.module.username}</td>
    <td>{props.module.description}</td>
    <td>{props.module.duration} mins</td>
    <td>{props.module.date ? props.module.date.substring(0, 10) : ''}</td>
    <td>
      <Link to={"/edit/" + props.module._id} className="btn btn-sm btn-outline-primary me-2">edit</Link>
      <button 
        className="btn btn-sm btn-outline-danger" 
        onClick={() => { props.deleteModule(props.module._id); }}>
        delete
      </button>
    </td>
  </tr>
);

export default class ModulesList extends Component {
  constructor(props) {
    super(props);

    this.deleteModule = this.deleteModule.bind(this);
    this.state = { modules: [], error: null };
  }

  componentDidMount() {
    axios.get(`${API_URL}/modules/`)
      .then(response => {
        if (Array.isArray(response.data)) {
          this.setState({ modules: response.data, error: null });
        }
      })
      .catch((error) => {
        const errorMsg = error.response?.data || error.message || 'Could not connect to backend server';
        console.warn('Modules API notice:', errorMsg);
        this.setState({ error: errorMsg });
      });
  }

  deleteModule(id) {
    axios.delete(`${API_URL}/modules/${id}`)
      .then(response => {
        console.log(response.data);
        this.setState({
          modules: this.state.modules.filter(el => el._id !== id)
        });
      })
      .catch((error) => {
        console.log('Error deleting module:', error);
      });
  }

  moduleList() {
    return this.state.modules.map(currentmodule => {
      return (
        <ModuleRow 
          module={currentmodule} 
          deleteModule={this.deleteModule} 
          key={currentmodule._id} 
        />
      );
    });
  }

  render() {
    return (
      <div>
        <h3 className="mb-3">Preparation Modules</h3>
        <table className="table table-striped table-hover align-middle">
          <thead className="table-dark">
            <tr>
              <th>Username</th>
              <th>Description</th>
              <th>Duration</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { this.moduleList() }
          </tbody>
        </table>
        { this.state.modules.length === 0 && (
          <div className="alert alert-info text-center">
            No module logs found. Click <strong>Create Module Log</strong> to add one!
          </div>
        ) }
      </div>
    );
  }
}