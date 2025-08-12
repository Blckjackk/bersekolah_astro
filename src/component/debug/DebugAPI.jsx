import React, { useState, useEffect } from 'react';

const DebugAPI = () => {
  const [mentorData, setMentorData] = useState(null);
  const [testimoniData, setTestimoniData] = useState(null);

  useEffect(() => {
    // Environment-aware API URL
    const API_URL = import.meta.env.PROD 
      ? 'https://web-production-0cc6.up.railway.app/api'
      : import.meta.env.PUBLIC_API_BASE_URL || 'http://localhost:8000/api';

    // Test Mentor API
    fetch(`${API_URL}/mentors`)
      .then(res => res.json())
      .then(data => {
        console.log('==== MENTOR API RESPONSE ====');
        console.log('Full response:', data);
        if (data.data && data.data.length > 0) {
          const lastMentor = data.data[data.data.length - 1];
          console.log('Last mentor (Tsalitsa):', lastMentor);
          console.log('Photo field:', lastMentor.photo);
          console.log('Photo URL field:', lastMentor.photo_url);
        }
        setMentorData(data);
      })
      .catch(err => console.error('Mentor API Error:', err));

    // Test Testimoni API  
    fetch(`${API_URL}/testimoni`)
      .then(res => res.json())
      .then(data => {
        console.log('==== TESTIMONI API RESPONSE ====');
        console.log('Full response:', data);
        if (data.data && data.data.length > 0) {
          const lastTestimoni = data.data[data.data.length - 1];
          console.log('Last testimoni:', lastTestimoni);
          console.log('Foto field:', lastTestimoni.foto_testimoni);
          console.log('Foto URL field:', lastTestimoni.foto_testimoni_url);
        }
        setTestimoniData(data);
      })
      .catch(err => console.error('Testimoni API Error:', err));
  }, []);

  return (
    <div style={{ padding: '20px', backgroundColor: '#f0f0f0', margin: '20px' }}>
      <h2>🐛 DEBUG API RESPONSES</h2>
      
      <h3>Mentor API Response:</h3>
      <pre style={{ backgroundColor: 'white', padding: '10px', fontSize: '12px' }}>
        {JSON.stringify(mentorData, null, 2)}
      </pre>

      <h3>Testimoni API Response:</h3>
      <pre style={{ backgroundColor: 'white', padding: '10px', fontSize: '12px' }}>
        {JSON.stringify(testimoniData, null, 2)}
      </pre>
    </div>
  );
};

export default DebugAPI;
