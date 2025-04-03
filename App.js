import React, { useState, useEffect } from "react";
import axios from "axios";
import { MapContainer, TileLayer, Marker, Popup } from "react-leaflet";
import "leaflet/dist/leaflet.css";

const App = () => {
  const [location, setLocation] = useState(null);
  const [bathrooms, setBathrooms] = useState([]);

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          });
        },
        () => alert("Unable to fetch your location. Please enable GPS.")
      );
    } else {
      alert("Geolocation is not supported by your browser.");
    }
  }, []);

  // Fetch nearby bathrooms using Overpass API
  const fetchBathrooms = async () => {
    if (!location) return;

    const query = `
      [out:json];
      node
        [amenity=toilets]
        (around:1500, ${location.lat}, ${location.lng});
      out;
    `;

    try {
      const response = await axios.post(
        "https://overpass-api.de/api/interpreter",
        query,
        {
          headers: { "Content-Type": "text/plain" },
        }
      );
      setBathrooms(response.data.elements);
    } catch (error) {
      console.error("Error fetching bathrooms:", error);
    }
  };

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h1>Bathroom Locator</h1>
      {location ? (
        <>
          <button onClick={fetchBathrooms} style={{ padding: "10px 20px" }}>
            Find Nearby Bathrooms
          </button>
          <MapContainer
            center={[location.lat, location.lng]}
            zoom={15}
            style={{ height: "400px", width: "100%", marginTop: "20px" }}
          >
            <TileLayer
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            <Marker position={[location.lat, location.lng]}>
              <Popup>You are here</Popup>
            </Marker>
            {bathrooms.map((bathroom, index) => (
              <Marker
                key={index}
                position={[bathroom.lat, bathroom.lon]}
              >
                <Popup>
                  Bathroom at Latitude: {bathroom.lat}, Longitude: {bathroom.lon}
                </Popup>
              </Marker>
            ))}
          </MapContainer>
        </>
      ) : (
        <p>Loading your location...</p>
      )}
    </div>
  );
};

export default App;

