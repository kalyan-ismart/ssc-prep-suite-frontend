import React, { Component } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const Module = props => (
  <tr>
    <td>{props.module.username}</td>
    <td>{props.module.description}</td>
    <td>{props.module.duration}</td>
    <td>{props.module.date.substring(0,10)}</td>
    <td>
  <Link to={"/edit/"+props.module._id}>edit</Link> | <button onClick={() => { props.deleteModule(props.module._id) }} className="btn btn-link p-0">delete</button>
    </td>
  </tr>
)

export default class ModulesList extends Component {
  constructor(props) {
    super(props);

    this.deleteModule = this.deleteModule.bind(this);

    this.state = {modules: []};
  }

  componentDidMount() {
    // This now points to your live Render server
    axios.get('https://ssc-prep-suite-backend-123.onrender.com/modules/')
      .then(response => {
        this.setState({ modules: response.data })
      })
      .catch((error) => {
        console.log(error);
      })
  }

  deleteModule(id) {
    // This now points to your live Render server
    axios.delete('https://ssc-prep-suite-backend-123.onrender.com/modules/'+id)
      .then(res => console.log(res.data));
    
    this.setState({
      modules: this.state.modules.filter(el => el._id !== id)
    })
  }

  moduleList() {
    return this.state.modules.map(currentmodule => {
      return <Module module={currentmodule} deleteModule={this.deleteModule} key={currentmodule._id}/>;
    })
  }

  render() {
    return (
      <div>
        <h3>Logged Modules</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Username</th>
              <th>Description</th>
              <th>Duration (min)</th>
              <th>Date</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            { this.moduleList() }
          </tbody>
        </table>
      </div>
    )
  }
}