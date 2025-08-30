import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DatePicker from 'react-datepicker';
import "react-datepicker/dist/react-datepicker.css";
import { useParams, useNavigate } from 'react-router-dom';

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
    axios.get('http://localhost:5000/modules/' + id)
      .then(response => {
        setUsername(response.data.username);
        setDescription(response.data.description);
        setDuration(response.data.duration);
        setDate(new Date(response.data.date));
      })
      .catch(function (error) {
        console.log(error);
      });

    // Get the list of users for the dropdown
    axios.get('http://localhost:5000/users/')
      .then(response => {
        if (response.data.length > 0) {
          setUsers(response.data.map(user => user.username));
        }
      })
      .catch((error) => {
        console.log(error);
      });
  }, [id]);

  const onSubmit = (e) => {
    e.preventDefault();

    const module = {
      username: username,
      description: description,
      duration: duration,
      date: date
    };

    axios.post('http://localhost:5000/modules/update/' + id, module)
      .then(res => console.log(res.data));

    navigate('/');
  };

  return (
    <div>
      <h3>Edit Module Log</h3>
      <form onSubmit={onSubmit}>
        <div className="form-group"> 
          <label>Username: </label>
          <select
              required
              className="form-control"
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
        <div className="form-group"> 
          <label>Description: </label>
          <input  type="text"
              required
              className="form-control"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              />
        </div>
        <div className="form-group">
          <label>Duration (in minutes): </label>
          <input 
              type="text" 
              className="form-control"
              value={duration}
              onChange={(e) => setDuration(e.target.value)}
              />
        </div>
        <div className="form-group">
          <label>Date: </label>
          <div>
            <DatePicker
              selected={date}
              onChange={(d) => setDate(d)}
            />
          </div>
        </div>
        <div className="form-group">
          <input type="submit" value="Edit Module Log" className="btn btn-primary" />
        </div>
      </form>
    </div>
  );
}

export default EditModule;