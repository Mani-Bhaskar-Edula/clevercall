import './App.css';

import React, { useState } from 'react';
import axios from 'axios';

const App = () => {
  const [message, setMessage] = useState('');
  const [currentNumber, setCurrentNumber] = useState('');
  const [numbers, setNumbers] = useState([]);

  const handleAddNumber = (e) => {
    if (e.key === 'Enter' && currentNumber.trim()) {
      setNumbers([...numbers, currentNumber.trim()]);
      setCurrentNumber(''); // Clear the input field
    }
  };

  const sendCall = () => {
    console.log("trying to send");
    axios
      .post('http://localhost:5000/send-call', {
        message,
        numbers,
      })
      .then((response) => {
        console.log(response.data);
        alert('Calls have been initiated!');
      })
      .catch((error) => {
        console.error('There was an error sending the calls!', error);
      });
  };

  return (
    <div>
      <h1>Send a Voice Message</h1>
      <textarea
        placeholder="Enter your message here"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />
      <input
        type="text"
        placeholder="Enter phone number and press Enter"
        value={currentNumber}
        onChange={(e) => setCurrentNumber(e.target.value)}
        onKeyPress={handleAddNumber}
      />
      <div>
        <h3>Numbers:</h3>
        <ul>
          {numbers.map((num, index) => (
            <li key={index}>{num}</li>
          ))}
        </ul>
      </div>
      <button onClick={sendCall}>Send as Phone Call</button>
    </div>
  );
};

export default App;

