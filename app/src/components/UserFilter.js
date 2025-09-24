import React from "react";

const UserFilter = ({ selectedLocation, setSelectedLocation, selectedProfession, setSelectedProfession, locations, professions }) => {
  return (
    <div>
      <div style={{ display: "flex", gap: "1rem", marginBottom: "1rem" }}>
        <select
          value={selectedLocation}
          onChange={(e) => setSelectedLocation(e.target.value)}
        >
          <option value="">All Locations</option>
          {locations.map((loc) => (
            <option key={loc} value={loc}>{loc}</option>
          ))}
        </select>
        <select
          value={selectedProfession}
          onChange={(e) => setSelectedProfession(e.target.value)}
        >
          <option value="">All Professions</option>
          {professions.map((prof) => (
            <option key={prof} value={prof}>{prof}</option>
          ))}
        </select>
      </div>
    </div>
  );
};

export default UserFilter;
