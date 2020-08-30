// global variables to deal with multiple uses in diffrent functions
var map;
var markers = [];
var descriptionText;
var lastInfo;
var myWrapper = $("#wrapper");
// var mc;
var hmarker = [];
var heatmap;
// image sources for map icons
var icons = {
  pv: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/pv.png'
  },
  hydro: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/hydro.png'
  },
  wind: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/wind.png'
  },
  biogas: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/biogas.png'
  },
  storage: {
    icon: 'https://raw.githubusercontent.com/edama-research/RE-Map/master/battery.png'
  }
};
var clusterimage = 'https://developers.google.com/maps/documentation/javascript/examples/markerclusterer/m';

// after the geojson is loaded, iterate through the map data to create markers
// and add the info to the side bar
function loadMarkers() {
  console.log('loading markers')
  // source of geojson data
  geojson_url = 'https://raw.githubusercontent.com/edama-research/RE-Map/master/re-projects-markers.geojson'
  // load features into variables for display and manipulation
  $.getJSON(geojson_url, function (result) {
    data = result['features']
    $.each(data, function (key, val) {
      var point = new google.maps.LatLng(
        parseFloat(val['geometry']['coordinates'][1]),
        parseFloat(val['geometry']['coordinates'][0]));
      var titleText = val['properties']['project']
      descriptionText = val['properties']['description']
      var marker = new google.maps.Marker({
        position: point,
        title: titleText,
        animation: google.maps.Animation.DROP,
        map: map,
        // label: {
        //     color: 'white',
        //     fontWeight: 'bold',
        //     text: titleText
        //   },
        province: val['properties']['province'],
        type: val['properties']['tech'],
        grantType: val['properties']['project-type'],
        status: val['properties']['status'],
        icon: {
          path: google.maps.SymbolPath.CIRCLE,
          scale: 4.5,
          fillColor: "#F00",
          fillOpacity: 0.7,
          strokeWeight: 0.4,
          // labelOrigin: new google.maps.Point(30, 65),
          // size: new google.maps.Size(30, 30),
        },
        ac: val['properties']['ac'],
        dc: val['properties']['dc'],
        price: val['properties']['price'],
        location: val['properties']['location'],
        owner: val['properties']['owner'],
        epc: val['properties']['epc'],
        invest: val['properties']['invest'],
        cod: val['properties']['cod'],
        note: val['properties']['note'],
        storage: val['properties']['storage'],
        coord: [point.lat(0), point.lng(0)]
      });
      // unit display properly from fraction of MW to KW
      var unitsizeac = marker.ac;
      var unitsizedc = marker.dc;
      var unitac;
      var unitdc;
      if (unitsizeac < 1) {
        unitsizeac = unitsizeac * 1000;
        unitac = "kW";
      } else {
        unitac = "MW";
      }
      if (unitsizedc < 1) {
        unitsizedc = unitsizedc * 1000;
        unitdc = "kW";
      } else {
        unitdc = "MW";
      }
      var markerInfo =
        "<div style='color:#e4e4e4;''><h2>" + titleText + "</h2></div>"
        + "<table>"
        + (marker.ac !== null ? "<div><tr><th>AC capacity </th><td>" + unitsizeac + unitac + "&nbsp;</td></tr></div>" : "")
        + (marker.dc !== null ? "<tr><th>DC capacity </th><td>" + unitsizedc + unitdc + " </td></tr>" : "")
        + (marker.storage !== "" ? "<tr><th>Capacity </th><td>" + marker.storage + " </td></tr>" : "")
        + (marker.price !== null ? "<tr><th>kWh price </th><td>" + marker.price + " piasters/kWh</td></tr>" : "")
        + (marker.location !== "" ? "<tr><th>Location </th><td>" + marker.location + "</td></tr>" : "")
        + (marker.owner !== "" ? "<tr><th>Owner </th><td>" + marker.owner + "</td></tr>" : "")
        + (marker.epc !== "" ? "<tr><th>EPC </th><td>" + marker.epc + "</td></tr>" : "")
        + (marker.invest !== null ? "<tr><th>Investment  </th><td>" + marker.invest + " million USD</td></tr>" : "")
        + (marker.cod !== "" ? "<tr><th>Operation Date </th><td>" + marker.cod + "</td></tr>" : "")
        + (marker.note !== "" ? "<tr><th>Notes </th><td>" + marker.note + "</td></tr>" : "")
        + ("<tr><th>Coordinates </th><td>" + marker.coord + "</td></tr>")
        + "</table>";
      // marker clusterer                   
      // google.maps.event.addListener(marker, 'visible_changed', function(){
      //         mc.clearMarkers();
      //         mc = new MarkerClusterer(map, markers,{imagePath: clusterimage});
      //         mc.repaint();      
      //     });  
      // A bunch of listerners for double click zoom and marker info to the side bar and transition element function
      marker.addListener('dblclick', function () {
        map.panTo(marker.position);
        map.setZoom(16);
      });

      marker.addListener('click', function () {
        addInfo(markerInfo);
        $("#wrapper").addClass("toggled");
        myWrapper.one('webkitTransitionEnd otransitionend oTransitionEnd msTransitionEnd transitionend', function (e) {
          // code to execute after transition ends
          google.maps.event.trigger(map, 'resize');
        });
      });
      markers.push(marker);
      hmarker.push(marker.position);
    });

    // Add a marker clusterer to manage the markers.
    // mc = new MarkerClusterer(map, markers,{imagePath: clusterimage});
  });
}

// adds info entry to sidebar while removing previous element
addInfo = function (description) {
  var sidebar = $('#side_bar');
  $('<li></li>').html(description).appendTo(sidebar);
  var element = sidebar.children();
  if (element[3]) {
    element[3].parentNode.removeChild(element[2]);
  }
}

// Map initilizer
function initMap() {
  map_options = {
    zoom: 7,
    center: { lat: 31.324, lng: 37.5 },
    mapTypeId: 'hybrid'
  }
  map_document = document.getElementById('map')
  map = new google.maps.Map(map_document, map_options);
  loadMarkers();

  // preserve newlines, etc - use valid JSON Thanks stackoverflow
  allLocations = allLocations
  .replace(/\\n/g, "\\n")  
  .replace(/\\'/g, "\\'")
  .replace(/\\"/g, '\\"')
  .replace(/\\&/g, "\\&")
  .replace(/\\r/g, "\\r")
  .replace(/\\t/g, "\\t")
  .replace(/\\b/g, "\\b")
  .replace(/\\f/g, "\\f");
  // remove non-printable and other non-valid JSON chars
  allLocations = allLocations.replace(/[\u0000-\u0019]+/g,""); 
  allLocations = JSON.parse(allLocations);

  addNewMarkers(allLocations);
}

// ---------------------- New Markers ---------------------- //
function addNewMarkers(locations) {
  locations.forEach(location => {
    var point = new google.maps.LatLng(
      parseFloat(location.coordinates[1]), parseFloat(location.coordinates[0]));
    console.log(parseFloat(location.coordinates[0]));
    var marker = new google.maps.Marker({
      position: point,
      title: location.name,
      animation: google.maps.Animation.DROP,
      map: map,
      tracksViewChanges: false,
      type: location.type,
      capacity: location.capacity,
      grantType: location.generation,
      location: location.location,
      status: location.status,
      lenders: location.lenders,
      epc: location.epc,
      main_station: location.main_station,
      technology: location.technology,
      province: location.governorate,
      coordinates: [point.lat(0), point.lng(0)],
      icon: {
        path: google.maps.SymbolPath.CIRCLE,
        scale: 4.5,
        fillColor: "#F00",
        fillOpacity: 0.7,
        strokeWeight: 0.4,
      }
    });
  });
}
