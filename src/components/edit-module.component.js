import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useNavigate } from 'react-router-dom';
import API_URL from '../config';

function EditModule() {
  const [username, setUsername] = useState('');
  const [description, setDescription] = useState('');
  const [duration, setDuration] = useState(0);
  const [date, setDate] = useState(new Date());
  const [users, setUsers] = useState([]);
  
  const { id } = useParams();
  const navigate = useNavigate();

  useEffect(() => {
    // Get the module data to pre-fill the form
    axios.get(`${API_URL}/modules/${id}`)
      .then(response => {
        if (response.data) {
          setUsername(response.data.username || '');
          setDescription(response.data.description || '');
          setDuration(response.data.duration || 0);
          if (response.data.date) setDate(new Date(response.data.date));
        }
      })
      .catch(function (error) {
        console.log('Error fetching module:', error);
      });

    // Get the list of users for the dropdown
    axios.get(`${API_URL}/users/`)
      .then(response => {
        if (response.data.length > 0) {
          setUsers(response.data.map(user => user.username));
        }
      })
      .catch((error) => {
        console.log('Error fetching users:', error);
      });
  }, [id]);

  const onSubmit = (e) => {
    e.preventDefault();

    const module = {
      username: username,
      description: description,
      duration: Number(duration),
      date: date
    };

    axios.post(`${API_URL}/modules/update/${id}`, module)
      .then(res => {
        console.log(res.data);
        navigate('/');
      })
      .catch(err => {
        console.error('Error updating module:', err);
      });
  };

  return (
    <div className="card shadow-sm p-4 mt-3">
      <h3 className="mb-4">Edit Module Log</h3>
      <form onSubmit={onSubmit}>
        <div className="mb-3"> 
          <label className="form-label fw-semibold">Username: </label>
          <select
              required
              className="form-select"
              value={username}
              onChange={(e) => setUsername(e.target.value)}>
              {
                users.map(function(user) {
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
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold">Duration (in minutes): </label>
          <input 
              type="number"
              min="1" 
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              />
        </div>
        <div className="mb-3">
          <label className="form-label fw-semibold d-block">Date: </label>
          <DatePicker
            selected={date}
            onChange={(d) => setDate(d)}
            className="form-control"
          />
        </div>
        <div className="mt-4">
          <input type="submit" value="Edit Module Log" className="btn btn-primary px-4" />
        </div>
      </form>
    </div>
  );
}

export default EditModule;