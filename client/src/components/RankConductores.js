import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './RankConductores.css';

const RankConductores = () => {
  const [driverData, setDriverData] = useState([]); // State to store the ranked drivers
  const [loading, setLoading] = useState(true); // Loading state
  const [error, setError] = useState(null); // Error state

  const token = localStorage.getItem('token'); // Get the JWT token
  const decodedToken = token ? JSON.parse(atob(token.split('.')[1])) : null;
  const companyId = decodedToken?.user?.companyId; // Get the companyId from the token

  useEffect(() => {
    const fetchDriverData = async () => {
      try {
        // Fetch users from the backend where companyId matches
        const response = await axios.get(`https://tirepro.onrender.com/api/auth/users`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        // Filter users by companyId and sort by pointcount (descending)
        const filteredAndSortedUsers = response.data
          .filter((user) => user.companyId === companyId) // Match companyId
          .sort((a, b) => b.pointcount - a.pointcount); // Sort by pointcount (descending)

        // Map the sorted data into the format we need for the table
        const formattedData = filteredAndSortedUsers.map((user, index) => ({
          rank: index + 1, // Add ranking based on the index
          name: user.name, // User's name
          score: user.pointcount, // User's pointcount
        }));

        setDriverData(formattedData); // Update the state with ranked drivers
        setLoading(false); // Turn off loading
      } catch (err) {
        console.error('Error fetching driver data:', err);
        setError('Error fetching driver data. Please try again later.');
        setLoading(false);
      }
    };

    fetchDriverData();
  }, [companyId, token]);

  if (loading) {
    return <p>Loading...</p>; // Show a loading message while fetching data
  }

  if (error) {
    return <p className="error-message">{error}</p>; // Show an error message if something goes wrong
  }

  return (
    <div className="revenue-updates-card">
      <h2 className="revenue-updates-title">Top Conductores</h2>
      <div className="scrollable-table-container">
        <table className="rank-table">
          <thead>
            <tr>
              <th>Ranking</th>
              <th>Nombre</th>
              <th>Puntaje</th>
            </tr>
          </thead>
          <tbody>
            {driverData.map((driver) => (
              <tr key={driver.rank}>
                <td>{driver.rank}</td>
                <td>{driver.name}</td>
                <td>{driver.score}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default RankConductores;
