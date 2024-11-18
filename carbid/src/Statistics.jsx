import React, { useState, useEffect, memo } from 'react';
import { NavLink } from 'react-router-dom';
import { FiHome, FiList, FiCalendar, FiDollarSign, FiTruck, FiBarChart2, FiRepeat, FiSearch, FiSettings, FiHelpCircle, FiBell } from 'react-icons/fi';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import PropTypes from 'prop-types';
import './Statistics.css';
import user from '../assets/images/user_avatar.jpg';
import Sidebar from './Sidebar';


// Header Component

// StatisticsHeader Component
const StatisticsHeader = () => (
  <div className="statistics-header">
    <div>
      <h1>Statistics</h1>
      <p>Get your latest update for the last 7 days</p>
    </div>
    <button className="export-button">Export</button>
  </div>
);

// AnalyticsReport Component
const AnalyticsReport = memo(({ data }) => (
  <section className="analytics-section">
    <div className="section-header">
      <h2>Analytics Report</h2>
      <select>
        <option>Monthly</option>
        <option>Weekly</option>
        <option>Yearly</option>
      </select>
    </div>
    <ResponsiveContainer width="100%" height={300}>
      <LineChart data={data}>
        <CartesianGrid strokeDasharray="3 3" />
        <XAxis dataKey="name" />
        <YAxis />
        <Tooltip />
        <Legend />
        <Line type="monotone" dataKey="spent" stroke="#4a6ee0" name="Spent" />
        <Line type="monotone" dataKey="gotBack" stroke="#48d6d2" name="Got Back" />
      </LineChart>
    </ResponsiveContainer>
  </section>
));

AnalyticsReport.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      spent: PropTypes.number.isRequired,
      gotBack: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// BreakdownTable Component
const BreakdownTable = memo(({ data }) => (
  <section className="breakdown-section">
    <h2>Number of Breakdown</h2>
    <table className="breakdown-table">
      <thead>
        <tr>
          <th>Car Name</th>
          <th>Breakdown</th>
          <th>Broken Car's</th>
        </tr>
      </thead>
      <tbody>
        {data.map((item, index) => (
          <tr key={index}>
            <td>{item.carName}</td>
            <td>{item.breakdown}</td>
            <td>{item.brokenCars}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </section>
));

BreakdownTable.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      carName: PropTypes.string.isRequired,
      breakdown: PropTypes.string.isRequired,
      brokenCars: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// CarsUsed Component
const CarsUsed = memo(({ data }) => (
  <section className="cars-used-section">
    <h2>Car's Used</h2>
    <div className="cars-used-chart">
      {data.map((item, index) => (
        <div key={index} className="car-usage">
          <span className="car-name">{item.name}</span>
          <div className="usage-bar-container">
            <div className="usage-bar" style={{ width: `${(item.hours / 9) * 100}%` }}></div>
            <span className="usage-hours">{item.hours} hour</span>
          </div>
        </div>
      ))}
    </div>
  </section>
));

CarsUsed.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      hours: PropTypes.number.isRequired,
    })
  ).isRequired,
};

// BreakdownPeriod Component
const BreakdownPeriod = memo(({ data }) => (
  <section className="breakdown-period-section">
    <h2>Breakdown Period</h2>
    <div className="breakdown-period-content">
      <ResponsiveContainer width={200} height={200}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            fill="#8884d8"
            paddingAngle={5}
            dataKey="value"
          >
            {data.map((entry, index) => (
              <Cell key={`cell-${index}`} fill={entry.color} />
            ))}
          </Pie>
        </PieChart>
      </ResponsiveContainer>
      <div className="total-period">
        <h3>Total Period</h3>
        <p>15 Days</p>
      </div>
    </div>
    <div className="breakdown-period-legend">
      {data.map((item, index) => (
        <div key={index}>
          <span className="legend-color" style={{backgroundColor: item.color}}></span>
          {item.name}
        </div>
      ))}
    </div>
  </section>
));

BreakdownPeriod.propTypes = {
  data: PropTypes.arrayOf(
    PropTypes.shape({
      name: PropTypes.string.isRequired,
      value: PropTypes.number.isRequired,
      color: PropTypes.string.isRequired,
    })
  ).isRequired,
};

// Custom hook for fetching statistics data
const useStatisticsData = () => {
  const [analyticsData, setAnalyticsData] = useState([]);
  const [breakdownData, setBreakdownData] = useState([]);
  const [carsUsedData, setCarsUsedData] = useState([]);
  const [breakdownPeriodData, setBreakdownPeriodData] = useState([]);

  useEffect(() => {
    setAnalyticsData([
      { name: 'Jan', spent: 49, gotBack: 0 },
      { name: 'Feb', spent: 0, gotBack: 25 },
      { name: 'Mar', spent: 20, gotBack: 0 },
      { name: 'Apr', spent: 0, gotBack: 18 },
      { name: 'May', spent: 0, gotBack: 0 },
      { name: 'Jun', spent: 0, gotBack: 0 },
      { name: 'Jul', spent: 0, gotBack: 0 },
      { name: 'Aug', spent: 0, gotBack: 0 },
      { name: 'Sep', spent: 32, gotBack: 0 },
      { name: 'Oct', spent: 0, gotBack: 42 },
      { name: 'Nov', spent: 0, gotBack: 0 },
    ]);

    setBreakdownData([
      { carName: 'Mercedes', breakdown: '20/10', brokenCars: '10 Car' },
      { carName: 'Bentely', breakdown: '14/09', brokenCars: '14 Car' },
      { carName: 'Lamborghini', breakdown: '11/20', brokenCars: '13 Car' },
      { carName: 'Porsche', breakdown: '01/24', brokenCars: '24 Car' },
      { carName: 'Maruti Suzuki', breakdown: '12/18', brokenCars: '31 Car' },
    ]);

    setCarsUsedData([
      { name: 'Mercedes', hours: 7 },
      { name: 'Bentley', hours: 6 },
      { name: 'Porsche Tayca', hours: 4 },
      { name: 'Lamborghini', hours: 2 },
    ]);

    setBreakdownPeriodData([
      { name: '20/30 Days', value: 20, color: '#4a6ee0' },
      { name: '114 Weeks', value: 114, color: '#48d6d2' },
    ]);
  }, []);

  return { analyticsData, breakdownData, carsUsedData, breakdownPeriodData };
};

// Main Statistics Component
const Statistics = () => {
  const { analyticsData, breakdownData, carsUsedData, breakdownPeriodData } = useStatisticsData();
  const [theme, setTheme] = useState('light');
  const toggleTheme = () => setTheme(theme === 'light' ? 'dark' : 'light');

  return (
    <div className="statistics-page">
      <Sidebar toggleTheme={toggleTheme} theme={theme} user={{ name: "Smith", avatar: user }} />        
      <div className="statistics-content">
        <main className="statistics-main">
          <StatisticsHeader />
          <div className="statistics-grid">
            <AnalyticsReport data={analyticsData} />
            <BreakdownTable data={breakdownData} />
            <CarsUsed data={carsUsedData} />
            <BreakdownPeriod data={breakdownPeriodData} />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Statistics;