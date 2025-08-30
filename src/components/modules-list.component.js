import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

// Individual Module component
const Module = props => (
  <tr>
    <td>{props.module.username}</td>
    <td>{props.module.description}</td>
    <td>{props.module.duration}</td>
    <td>{new Date(props.module.date).toDateString()}</td>
    <td>
      {/* ✅ CORRECT: Using Link instead of <a> for React Router navigation */}
      <Link to={"/edit/" + props.module._id} className="btn btn-primary btn-sm me-2">
        Edit
      </Link>
      {/* ✅ CORRECT: Using button for delete action */}
      <button 
        className="btn btn-danger btn-sm" 
        onClick={() => { props.deleteModule(props.module._id) }}
        type="button"
      >
        Delete
      </button>
    </td>
  </tr>
);

export default class ModulesList extends Component {
  constructor(props) {
    super(props);

    this.deleteModule = this.deleteModule.bind(this);

    this.state = { modules: [] };
  }

  componentDidMount() {
    // ✅ CORRECT: Using your backend API URL
    axios.get('https://ssc-prep-suite-backend-123.onrender.com/modules')
      .then(response => {
        this.setState({ modules: response.data });
      })
      .catch((error) => {
        console.log('Error fetching modules:', error);
      });
  }

  deleteModule(id) {
    // ✅ CORRECT: Proper delete request
    axios.delete('https://ssc-prep-suite-backend-123.onrender.com/modules/' + id)
      .then(response => { 
        console.log(response.data);
        // Refresh the list after deletion
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
      return <Module 
        module={currentmodule} 
        deleteModule={this.deleteModule} 
        key={currentmodule._id}
      />;
    });
  }

  render() {
    return (
      <div className="container mt-4">
        <div className="row">
          <div className="col-12">
            <div className="d-flex justify-content-between align-items-center mb-4">
              <h3>📚 Modules List</h3>
              {/* ✅ CORRECT: Using Link for navigation */}
              <Link to="/create" className="btn btn-success">
                Add New Module
              </Link>
            </div>

            {this.state.modules.length === 0 ? (
              <div className="alert alert-info text-center">
                <h5>No modules found</h5>
                <p>Start by creating your first module!</p>
                <Link to="/create" className="btn btn-primary">
                  Create First Module
                </Link>
              </div>
            ) : (
              <div className="card">
                <div className="card-body">
                  <div className="table-responsive">
                    <table className="table table-striped table-hover">
                      <thead className="table-dark">
                        <tr>
                          <th>Username</th>
                          <th>Description</th>
                          <th>Duration (min)</th>
                          <th>Date</th>
                          <th>Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {this.moduleList()}
                      </tbody>
                    </table>
                  </div>
                  
                  <div className="mt-3">
                    <small className="text-muted">
                      Total modules: {this.state.modules.length}
                    </small>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}
