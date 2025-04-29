import React from "react";
import PropTypes from "prop-types";
import {
  PieChart,
  Pie,
  Cell,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";
import { Row, Col } from "react-bootstrap"; // Import Row and Col for layout

const Dashboard = ({ stationAnalytics, darkMode }) => {
  // Colors for the pie chart
  const COLORS = ["#0088FE", "#00C49F"];

  // Check if stationAnalytics is defined and is an array
  if (!stationAnalytics || !Array.isArray(stationAnalytics)) {
    return <div>No analytics data available.</div>;
  }

  return (
    <div className="mb-4">
      <h5 className="mb-3">Station Analytics</h5>
      <hr className={darkMode ? "border-light" : "border-dark"} />

      {/* Render pie charts in a grid layout */}
      <Row>
        {stationAnalytics.map((station) => (
          <Col
            key={station.stationId}
            xs={12}
            sm={6}
            md={4}
            lg={3}
            className="mb-4"
          >
            <div className="text-center">
              <h6>{station.stationName}</h6>

              {/* Small Pie Chart for Assigned CVs vs Available Seats */}
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={[
                      { name: "Assigned CVs", value: station.assignedCVs },
                      {
                        name: "Available Seats",
                        value: station.availableSeats,
                      },
                    ]}
                    cx="50%"
                    cy="50%"
                    outerRadius={80} // Smaller radius for compact size
                    fill="#8884d8"
                    dataKey="value"
                    label
                  >
                    {[
                      { name: "Assigned CVs", value: station.assignedCVs },
                      {
                        name: "Available Seats",
                        value: station.availableSeats,
                      },
                    ].map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                      />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend
                    wrapperStyle={{
                      fontSize: "12px", // Smaller legend font size
                      paddingTop: "10px", // Add some spacing
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>

              {/* Display exact numbers below the chart */}
              <div className="mt-2">
                <p>
                  <strong>Assigned CVs:</strong> {station.assignedCVs}
                </p>
                <p>
                  <strong>Available Seats:</strong> {station.availableSeats}
                </p>
              </div>
            </div>
          </Col>
        ))}
      </Row>
    </div>
  );
};

// Define PropTypes for the component
Dashboard.propTypes = {
  stationAnalytics: PropTypes.arrayOf(
    PropTypes.shape({
      stationId: PropTypes.string.isRequired,
      stationName: PropTypes.string.isRequired,
      assignedCVs: PropTypes.number.isRequired,
      availableSeats: PropTypes.number.isRequired,
      cvsEndingThisWeek: PropTypes.arrayOf(
        PropTypes.shape({
          _id: PropTypes.string.isRequired,
          refNo: PropTypes.string,
          fullName: PropTypes.string,
          endDate: PropTypes.string.isRequired,
        })
      ).isRequired,
    })
  ).isRequired,
  darkMode: PropTypes.bool.isRequired,
};

export default Dashboard;
