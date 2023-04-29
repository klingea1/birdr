//user location, updated once location is received from browser
const myLocation = {
    lat: '',
    lng: ''
};
//scientific and common names, used to get sample images from Wikipedia
var sciNames = {};
var nearbySpecies = {};



//initialize map for Leaflet at 0,0
const myMap = L.map('bird-map').setView([0, 0], 9);
const attribution = '&copy; <a href="https://openstreetmap.org/copyright">OpenStreetMap';
const tileUrl = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const tiles = L.tileLayer(tileUrl,{attribution});
tiles.addTo(myMap);

//create marker group for birds & hotspots, enables easy clearing of the canvas when changing species
var birdMarkers = L.featureGroup();
var hotSpotMarkers = L.featureGroup();
var markerCluster = L.markerClusterGroup();

//bird icon for Leaflet markers
var birdMarker = L.icon({
    iconUrl: './images/293092.png',
    shadowUrl: '',
    iconSize:     [45, 45], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [27, 27], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -26] // point from which the popup should open relative to the iconAnchor
});

//hotspot icon for Leaflet markers
var hotSpotIcon = L.icon({
    iconUrl: './images/789468.png',
    shadowUrl: '',
    iconSize:     [45, 45], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [27, 27], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -26] // point from which the popup should open relative to the iconAnchor
});

//user icon for Leaflet markers
var myIcon = L.icon({
    iconUrl: './images/2503463.png',
    shadowUrl: '',
    iconSize:     [60, 60], // size of the icon
    shadowSize:   [50, 64], // size of the shadow
    iconAnchor:   [27, 27], // point of the icon which will correspond to marker's location
    shadowAnchor: [4, 62],  // the same for the shadow
    popupAnchor:  [-3, -76] // point from which the popup should open relative to the iconAnchor
});

//initialize user location as const for cleaner updating of location using myMarker.setLatLng() once location is received
const myMarker = L.marker([0, 0], {icon: myIcon}).addTo(myMap).bindPopup("<b>My Location</b><br />" + myLocation.lat,myLocation.lng);



//check if the browser supports geolocation, then try getting current position. Send to ebird if successful.
if ("geolocation" in navigator) {
    console.log('geolocation available');
    navigator.geolocation.getCurrentPosition(async function(position) {
        myLocation.lat = position.coords.latitude;
        myLocation.lng = position.coords.longitude;
        console.log(myLocation);
        var options = {
            method: 'POST',
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(myLocation)
        };
        
        //send user location to api node
        const locResponse = await fetch('/init', options);
        const locData = await locResponse.json();
        console.log('got ' + locData.speciesList.length + ' species nearby');
        sciNames = locData.sciNameList;
        nearbySpecies = locData.speciesList;
        
        //center the map on user's current location
        myMap.setView([myLocation.lat, myLocation.lng],13);
        myMarker.setLatLng([myLocation.lat, myLocation.lng]);

        //once location is retrieved fetch recent nearby sightings to populate select options for each species, append to html <select> with species as <option>s
        var speciesContainer = document.getElementById('select-species');
        const nearBirds = locData.speciesList;
        for (var i = 0; i < nearBirds.length; i++) {
            var op = document.createElement('option');
            op.innerHTML = nearBirds[i].comName;
            op.value = nearBirds[i].speciesCode;
            op.ID = 'speciesOption';
            speciesContainer.appendChild(op);	
        };

        //alphabetize the <select> options list, there's gotta be a better way...
        var list, z, switching, b, shouldSwitch;
        list = document.getElementById("select-species");
        switching = true;
        while (switching) {
            switching = false;
            b = list.getElementsByTagName("option");
            for (z = 0; z < (b.length - 1); z++) {
                shouldSwitch = false;
                if (b[z].innerHTML.toLowerCase() > b[z + 1].innerHTML.toLowerCase()) {
                    shouldSwitch = true;
                    break;
                }
            }
            if (shouldSwitch) {
                b[z].parentNode.insertBefore(b[z + 1], b[z]);
                switching = true;
            }
        }
        
        $(document).ready(function() {
            $('#select-species').select2({
                placeholder: 'Select a species'
            });
        });

    });
} else{
    console.log('geolocation not available');
};



//send selected species to api, get nearby recent observations, and map them
async function getBirds() {
    if (document.getElementById("select-species").value == '') {
        alert("Select a bird first!");
        return;
    }
    //change 'get birds' button color back to base
    console.log('changed button class back to normal');
    document.getElementById('get-birds').className = "btn";

    //get species code from species selector
    var e = document.getElementById("select-species");
    var selectValue = e.value;
    var selectText = e.options[e.selectedIndex].text;

    //clear any bird icons, hotspot icons, or table rows that are already on the screen
    var birdsContainer = document.getElementById("birds-table");
    clearMap();

    //
    var options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({selectValue, myLocation})
    };

    //send species request to api node
    console.log(selectText + ' sent to api');
    const obsResponse = await fetch('/obs', options);
    const obsData = await obsResponse.json();
    console.log('got ' + obsData.length + ' observations nearby');   

    //drop a bird icon on each location
    for (var i = 0; i < obsData.length; i++) {
        var popInfo = '<b>' + obsData[i].comName + '</b><br />' + obsData[i].obsDt + '<br />' + obsData[i].locName;
        L.marker([obsData[i].lat,obsData[i].lng], {icon:birdMarker}).addTo(birdMarkers).bindPopup(popInfo);
        birdMarkers.addTo(myMap);
    };

    //re-center the map & set zoom appropriate to results when done
    myMap.setView([myLocation.lat, myLocation.lng],10);
}



//highlight #get-birds button green to prompt user action once they have selected a bird
function makeClassActive() {
    console.log('changed button class');
    document.getElementById('get-birds').className = "ready";
    document.getElementById('image-search').className = "ready";
};



//centers map on user and resets zoom to default
function reCenter() {
    myMap.setView([myLocation.lat, myLocation.lng],13);
};



//clear any bird icons, hotspot icons, or table rows that are already on the screen
function clearMap() { 
    var birdsContainer = document.getElementById("birds-table");
    var rowCount = birdsContainer.rows.length;
    for (var i = rowCount - 1; i > 0; i--) {
        birdsContainer.deleteRow(i);
    };
    birdMarkers.clearLayers();
    hotSpotMarkers.clearLayers();
    markerCluster.clearLayers();
};



//get reference image from Wikipedia API using initialJson.birdCodes.<selection>.sciName
async function getImage() {
    if (document.getElementById("select-species").value == '') {
        alert("Select a bird first!");
        return;
    }

    //change getImage button color back to base
    console.log('changed button class back to normal');
    document.getElementById('image-search').className = "btn";

    //get the bird id from the select box
    var e = document.getElementById("select-species");
    var selectValue = e.value;
    imgRequest = {
        name: ''
    };

    //set imgOptions to the scientific name of the bird id from the select box
    imgRequest.name = sciNames[selectValue];
    var imgOptions = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify(imgRequest)
    };
    
    //send user location to img api node
    console.log('requesting ' + imgOptions.body.name + ' image');
    const imgResponse = await fetch('/img', imgOptions);
    const imgSrc = await imgResponse.json();
    console.log('got an image');
    
    //get the image and insert it inside the modal
    var modal = document.getElementById("bird-modal");
    var modalImg = document.getElementById("bird-image");
    var captionText = document.getElementById("caption");
    modal.style.display = "block";
    modalImg.src = 'https:' + imgSrc;

    //look up the comName and use it as the image caption
    var captionComName = '';
    for (var i = 0; i < nearbySpecies.length; i++) { 
        if(nearbySpecies[i].speciesCode === selectValue) {
            captionComName = nearbySpecies[i].comName;
        };
    };
    captionText.innerHTML = captionComName;

    //get the <span> element that closes the modal
    var span = document.getElementsByClassName("close")[0];

    //when the user clicks on <span> (x), close the modal
    span.onclick = function() { 
    modal.style.display = "none";
    };  
};



//show hotspots in a 5km radius from the center of the viewport
async function showHotSpot() {
    //first clear any existing hotspots and get the center of the viewport
    hideHotspots();
    const viewCenter = {
        lat: (myMap.getBounds()._northEast.lat + myMap.getBounds()._southWest.lat)/2,
        lng: (myMap.getBounds()._northEast.lng + myMap.getBounds()._southWest.lng)/2,
    };
    console.log('center of viewport is ' + (myMap.getBounds()._northEast.lat + myMap.getBounds()._southWest.lat)/2 + ', ' + (myMap.getBounds()._northEast.lng + myMap.getBounds()._southWest.lng)/2);
    
    var options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({viewCenter})
    };

    //send viewport coords to api node
    const spotResponse = await fetch('/spots', options);
    const spotData = await spotResponse.json();
    console.log('got ' + spotData.length + ' hotspots nearby');

    for (var i = 0; i < spotData.length; i++) {			
    //create button for popup to call hotSpotBirds() with the selected hotspot's lat & lng
    var hotSpotButton = document.createElement("button");
    hotSpotButton.value="View nearby birds";

    //fill out hotspot popup with info & append button
    var spotInfo = '<b id="hotspot'+[i]+'">' + spotData[i].locName + '</b><br /><button onclick="hotSpotBirds('+spotData[i].lat+','+spotData[i].lng+')">Show nearby birds</button>';    
    //drop a marker on each hotspot and bind the popup to it
    L.marker([spotData[i].lat,spotData[i].lng], {icon:hotSpotIcon}).addTo(hotSpotMarkers).bindPopup(spotInfo);
    hotSpotMarkers.addTo(myMap);
    }

    //set zoom to reasonable level to view hotspots
    myMap.setView([viewCenter.lat, viewCenter.lng],11);
};



//get species at specific hotspot
async function hotSpotBirds(x,y) {
    clearMap();
    var spotBirdParams = {
        lat: '',
        lng: ''
    };
    spotBirdParams.lat = x;
    spotBirdParams.lng = y;

    console.log(spotBirdParams);
    var options = {
        method: 'POST',
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({spotBirdParams})
    };

    //send hotspot coords to api node
    const spotBirdResponse = await fetch('/spotBird', options);
    const spotBirdData = await spotBirdResponse.json();
    console.log('got ' + spotBirdData.length + ' bird records near the hotspot');
    var birdsContainer = document.getElementById("birds-table");
    for (var i = 0; i < spotBirdData.length; i++) {
        var row = document.createElement("tr");
        row.innerHTML = '<td id="bird-row">' + spotBirdData[i].comName + '</td><td>' + spotBirdData[i].obsDt + '</td><td>' + spotBirdData[i].locName + '</td>';
        birdsContainer.appendChild(row);	
    };

    //drop a bird icon on each location
    for (var i = 0; i < spotBirdData.length; i++) {
        var popInfo = '<b>' + spotBirdData[i].comName + '</b><br />' + spotBirdData[i].obsDt + '<br />' + spotBirdData[i].locName;
        var hotSpotMarker = L.marker([spotBirdData[i].lat,spotBirdData[i].lng], {icon:birdMarker}).addTo(markerCluster).bindPopup(popInfo);
        markerCluster.addTo(myMap);
    };

    //re-center the map & set zoom appropriate to results when done
    myMap.setView([spotBirdParams.lat, spotBirdParams.lng],12);
}


//remove hotspots from the map
function hideHotspots() {
    hotSpotMarkers.clearLayers();
};