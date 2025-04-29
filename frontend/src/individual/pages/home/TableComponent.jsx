import React from "react";
import { Table } from "react-bootstrap";

const TableComponent = ({ tableData, columns, footerText, darkMode }) => {
  return (
    <div
      style={{
        backgroundColor: darkMode ? "dark" : "light",
        padding: "20px",
        borderRadius: "10px",
      }}
    >
      <Table
        striped
        bordered
        hover
        responsive
        variant={darkMode ? "dark" : "light"}
        className="text-center"
      >
        <thead>
          <tr>
            {columns.map((col, index) => (
              <th key={index}>{col.header}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {tableData.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {columns.map((col, colIndex) => (
                <td key={colIndex}>
                  {col.render 
                    ? col.render(row) 
                    : row[col.accessor]
                  }
                </td>
              ))}
            </tr>
          ))}
        </tbody>
        <tfoot>
          <tr>
            <td colSpan={columns.length} className="text-center">
              {footerText}
            </td>
          </tr>
        </tfoot>
      </Table>
    </div>
  );
};

export default TableComponent;