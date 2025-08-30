import React, { Component } from 'react';
import axios from 'axios';

export default class ModulesList extends Component {
  constructor(props) {
    super(props);
    this.state = { modules: [] };
  }

  componentDidMount() {
    axios.get('http://localhost:5000/modules/')
      .then(response => {
        this.setState({ modules: response.data });
      })
      .catch((error) => {
        console.log(error);
      })
  }

  render() {
    return (
      <div>
        <h3>Preparation Modules</h3>
        <table className="table">
          <thead className="thead-light">
            <tr>
              <th>Title</th>
              <th>Description</th>
            </tr>
          </thead>
          <tbody>
            { this.state.modules.map(currentmodule => {
              return (
                <tr key={currentmodule.id}>
                  <td>{currentmodule.title}</td>
                  <td>{currentmodule.description}</td>
                </tr>
              );
            }) }
          </tbody>
        </table>
      </div>
    )
  }
}