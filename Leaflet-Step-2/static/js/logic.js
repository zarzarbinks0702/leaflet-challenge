//data links
const earthquakeData = 'https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_month.geojson';
const boundaryData = 'static/PB2002_boundaries.json'
//enter initial map view on the USA
const usCenterCoords = [42.877742, -97.380979];
//define the map
var myMap = L.map("mapid").setView(usCenterCoords, 3);
//read the data
d3.json(earthquakeData).then((data) => {
  d3.json(boundaryData).then((boundaries) => buildMap(data, boundaries))
});

/********************************************************************************/

function buildMap(data, boundaries) {

  const mapLayouts = [L.tileLayer("https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: "© <a href='https://www.mapbox.com/about/maps/'>Mapbox</a> © <a href='http://www.openstreetmap.org/copyright'>OpenStreetMap</a> <strong><a href='https://www.mapbox.com/map-feedback/' target='_blank'>Improve this map</a></strong>",
    tileSize: 512,
    maxZoom: 18,
    zoomOffset: -1,
    id: "mapbox/streets-v11",
    accessToken: API_KEY
  }), L.tileLayer(
  "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
    attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
    maxZoom: 18,
    id: "light-v10",
    accessToken: API_KEY,
  }), L.tileLayer(
    "https://api.mapbox.com/styles/v1/mapbox/{id}/tiles/{z}/{x}/{y}?access_token={accessToken}", {
      attribution:
      'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
      maxZoom: 18,
      id: "dark-v10",
      accessToken: API_KEY,
    })];

  mapLayouts.forEach((map) => map.addTo(myMap));
  buildMarkers(data);
  buildLegend(data);
  buildBoundaries(boundaries);

}

function buildMarkers(data) {

  data.features.forEach((earthquake) => {

    var magnitude = earthquake.properties.mag;
    var depth = parseInt(earthquake.geometry.coordinates[2]);
    var earthquakeLon = earthquake.geometry.coordinates[0];
    var earthquakeLat = earthquake.geometry.coordinates[1];

    var circleSize = magnitude * 20000;

    var color = '';
    if (depth < 10) {
      var color = 'green';
    } else if (depth < 30) {
      var color = '#b1db3d';
    } else if (depth < 50) {
      var color = 'yellow';
    } else if (depth < 70) {
      var color = '#dbbc3d';
    } else if (depth < 90) {
      var color = '#db9c3d';
    } else if (depth >= 90){
      var color = 'red';
    }

    var earthquakeCircle = L.circle([earthquakeLat, earthquakeLon], {
      radius: circleSize,
      color: '#000000',
      fillColor: color,
      fillOpacity: .6,
      weight: 0.5
    });

    //adding the pop-up when clicked
    let popuptext = `<h1> ${earthquake.properties.place} </h1> <hr> <h1> Magnitude: ${magnitude} </h1> <h1>Depth: ${depth}km</h1> <hr> <h1>[${earthquakeLat}, ${earthquakeLon}]</h1>`;

    earthquakeCircle.bindPopup(popuptext);

    earthquakeCircle.addTo(myMap);
  })
}

function buildLegend(data) {
  let legendControl = L.control({
    position: "bottomright",
  });

  legendControl.onAdd = function () {
    let div = L.DomUtil.create("div", "legend");

    const htmlInfo = `<p>Earthquake Depth</p>
    <hr>
      <p class='green'><10km</p>
      <p class='lt-green'>10-30km</p>
      <p class='yellow'>30-50km</p>
      <p class='yellow-orange'>50-70km</p>
      <p class='red-orange'>70-90km</p>
      <p class='red'>+90km</p>`;
    div.innerHTML = htmlInfo;
    return div;

  };
  legendControl.addTo(myMap);
  return legendControl;
}

function buildBoundaries(boundaries) {
  boundaries.features.forEach((bound) => {

    var coords = bound.geometry.coordinates;
    var draw_bound = L.polygon(coords, {color: '#af5ec0'});

    draw_bound.addTo(myMap);
  });

}
