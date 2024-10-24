// Display locations in the locationList
var API_KEY = '38734772-9a4efa24da820dffd50b42987'; // Replace with your API key
var URL = "https://pixabay.com/api/?key=" + API_KEY + "&q=";



function handleLogin(event) {
  event.preventDefault(); // Prevent form submission

  const username = document.getElementById('adminuser').value;
  const password = document.getElementById('adminpass').value;

  if(username === "admin" && password === "8742"){
    document.querySelector('.preloader').style.display = 'none';
  } else {
    window.alert("Wrong password");
  }
}

// Add Location to Firestore
function addLocation() {
  var locationName = document.getElementById('locationName').value.trim();
  var details = document.getElementById('details').value.trim();
  var address = document.getElementById('address').value.trim();
  var mapLink = document.getElementById('mapLink').value.trim();
  var latitude = document.getElementById('latitude').value.trim();
  var longitude = document.getElementById('longitude').value.trim();

  // Check if inputs are empty
  if (locationName === '' || details === '' || address === '' || mapLink === '' || latitude === '' || longitude === '') {
      alert('Please fill in all fields.');
      return;
  }

  // Validate Google Maps link
  if (!isValidGoogleMapsLink(mapLink)) {
      alert('Please enter a valid Google Maps link.');
      return;
  }

  // Validate latitude and longitude
  if (!isValidLatitude(latitude) || !isValidLongitude(longitude)) {
      alert('Please enter valid latitude and longitude values.');
      return;
  }

  const elocation = encrypt(locationName, passphrase);
  const edetails = encrypt(details, passphrase);
  const eaddress = encrypt(address, passphrase);
  const emapLink = encrypt(mapLink, passphrase);
  const elatitude = encrypt(latitude, passphrase);
  const elongitude = encrypt(longitude, passphrase);

  var data = {
      locationName: elocation,
      details: edetails,
      address: eaddress,
      mapLink: emapLink,
      latitude: elatitude,
      longitude: elongitude,
      createdAt: firebase.firestore.FieldValue.serverTimestamp()
  };

  addData('locations', data);

  // Clear input fields after successful addition
  document.getElementById('locationName').value = '';
  document.getElementById('details').value = '';
  document.getElementById('address').value = '';
  document.getElementById('mapLink').value = '';
  document.getElementById('latitude').value = '';
  document.getElementById('longitude').value = '';
}

function isValidGoogleMapsLink(link) {
  const googleMapsRegex = /^(https?:\/\/)?(www\.)?google\.com\/maps\/|maps\.google\.com\/.+/i;
  return googleMapsRegex.test(link);
}

function isValidLatitude(lat) {
  return !isNaN(lat) && lat >= -90 && lat <= 90;
}

function isValidLongitude(lng) {
  return !isNaN(lng) && lng >= -180 && lng <= 180;
}

// Add data to Firestore
function addData(collection, data) {
  db.collection(collection).add(data)
      .then((docRef) => {
          console.log("Document written with ID: ", docRef.id);
          readLocations();
      })
      .catch((error) => {
          console.error("Error adding document: ", error);
      });
}

// Array to store locations
let locationsArray = [];

// Read Locations from Firestore
function readLocations(userLatitude, userLongitude) {
  db.collection('locations').orderBy('createdAt').onSnapshot((querySnapshot) => {
      const newLocationsArray = [];
      querySnapshot.forEach((doc) => {
          var location = doc.data();
          location.id = doc.id;
          location.locationName = decrypt(location.locationName, passphrase);
          location.details = decrypt(location.details, passphrase);
          location.address = decrypt(location.address, passphrase);
          location.mapLink = decrypt(location.mapLink, passphrase);
          location.latitude = decrypt(location.latitude, passphrase);
          location.longitude = decrypt(location.longitude, passphrase);
          location.distance = calculateDistance(userLatitude, userLongitude, parseFloat(location.latitude), parseFloat(location.longitude));
          location.imageUrl = null;
          newLocationsArray.push(location);
      });
      locationsArray = newLocationsArray;
      displayLocations(locationsArray, true, true);
      console.log('Locations array:', locationsArray);
  }, (error) => {
      console.error("Error in snapshot listener:", error);
  });
}

// Display locations in the locationList
function displayLocations(locationsArray, initialLoad = false, sortByDistance = true) {
  var locationList = document.getElementById('locationList');
  locationList.innerHTML = ''; // Clear the list

  if (locationsArray.length === 0) {
      var noResultsMessage = document.createElement('div');
      noResultsMessage.className = 'no-results-message';
      noResultsMessage.textContent = 'No locations found.';
      locationList.appendChild(noResultsMessage);
      return;
  }

  if (sortByDistance) {
    locationsArray.sort((a, b) => parseFloat(a.distance) - parseFloat(b.distance));
  }

  if (initialLoad) {
      imageFetchPromises = [];
  }

  locationsArray.forEach(function(location) {
      var locationItem = document.createElement('div');
      locationItem.className = 'location-item';

      var imageElement = document.createElement('img');
      imageElement.className = 'location-image';

      if (!location.imageUrl && initialLoad) {
          const promise = $.getJSON(URL + encodeURIComponent(location.locationName))
              .then(function(data) {
                  if (parseInt(data.totalHits) > 0) {
                      var randomIndex = Math.floor(Math.random() * data.hits.length);
                      var bestImage = data.hits[randomIndex];
                      location.imageUrl = bestImage.webformatURL;
                  } else {
                      location.imageUrl = "https://via.placeholder.com/100x200?text=No+Image";
                  }
                  imageElement.src = location.imageUrl;
                  imageElement.alt = `Image of ${location.locationName}`;
              });
          imageFetchPromises.push(promise);
      } else {
          imageElement.src = location.imageUrl || "https://via.placeholder.com/200x200?text=No+Image";
          imageElement.alt = `Image of ${location.locationName}`;
      }

      var nameElement = document.createElement('div');
      nameElement.className = 'location-name';
      nameElement.textContent = location.locationName;

      var addressElement = document.createElement('div');
      addressElement.className = 'location-address';
      addressElement.textContent = location.address;

      var detailsElement = document.createElement('div');
      detailsElement.className = 'location-details';
      detailsElement.textContent = location.details;

      var coordsElement = document.createElement('div');
      coordsElement.className = 'location-distance';
      coordsElement.textContent = location.distance;

      var viewButton = document.createElement('button');
      viewButton.className = 'view-map-button';
      viewButton.textContent = 'View Map';
      viewButton.onclick = function() {
          window.open(location.mapLink, '_blank');
      };

      locationItem.appendChild(imageElement);
      locationItem.appendChild(nameElement);
      locationItem.appendChild(addressElement);
      locationItem.appendChild(detailsElement);
      locationItem.appendChild(coordsElement);
      locationItem.appendChild(viewButton);
      locationList.appendChild(locationItem);
  });

  if (initialLoad) {
      Promise.all(imageFetchPromises).then(() => {
          // Optional: Add any additional logic after images load
      });
  }
}

function getGeolocation() {
  return new Promise((resolve, reject) => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            userLatitude: position.coords.latitude,
            userLongitude: position.coords.longitude
          });
        },
        (error) => {
          reject(error);
        }
      );
    } else {
      reject(new Error("Geolocation is not supported by this browser."));
    }
  });
}

async function getGeolocationByIP() {
  try {
    const response = await fetch("https://ipapi.co/json/");
    const data = await response.json();
    return {
      userLatitude: data.latitude,
      userLongitude: data.longitude
    };
  } catch (error) {
    console.error("Error fetching geolocation by IP:", error);
    return null;
  }
}

async function getUserLocation() {
  try {
    const userGeolocation = await getGeolocation();
    return userGeolocation;
  } catch (error) {
    try {
      const userIpGeolocation = await getGeolocationByIP();
      return userIpGeolocation;
    } catch (error) {
      console.error("Error getting user location:", error);
      return null;
    }
  }
}

window.onload = () => {
  getUserLocation()
    .then((location) => {
      if (location) {
        const userLatitude = location.userLatitude;
        const userLongitude = location.userLongitude;
        document.getElementById("locationInfo").innerHTML = "Using your location";
        readLocations(userLatitude, userLongitude);
      } else {
        document.getElementById("locationInfo").innerHTML = "Unable to get user location.";
        readLocations(null, null);
      }
    })
    .catch((error) => {
      document.getElementById("locationInfo").innerHTML = "Error getting user location.";
      readLocations(null, null);
    });
};

function calculateDistance(lat1, lon1, lat2, lon2) {
  const R = 6371; // Radius of the Earth in km
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = 
    Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) * 
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  const distance = R * c; // Distance in km
  return distance.toFixed(2) + " km";
}

function searchLocations() {
  const searchText = document.getElementById('searchBar').value.toLowerCase().trim();

  if (searchText === '') {
    displayLocations(locationsArray, false, true);
    return;
  }

  const parsedQuery = parseSearchQuery(searchText);

  const filteredLocations = locationsArray.filter(location => {
    const locationText = `${location.locationName} ${location.address} ${location.details}`.toLowerCase();
    
    const allTermsPresent = parsedQuery.searchTerms.every(term => locationText.includes(term));
    const typeMatch = parsedQuery.type ? locationText.includes(parsedQuery.type) : true;
    const locationMatch = parsedQuery.location ? locationText.includes(parsedQuery.location) : true;

    return allTermsPresent && typeMatch && locationMatch;
  });

  filteredLocations.sort((a, b) => {
    const aRelevance = calculateRelevance(a, parsedQuery);
    const bRelevance = calculateRelevance(b, parsedQuery);
    return bRelevance - aRelevance;
  });

  displayLocations(filteredLocations, false, true);
}

function parseSearchQuery(query) {
  const words = query.split(/\s+/);
  const result = {
    searchTerms: [],
    type: null,
    location: null
  };

  const typeKeywords = [
    'cafe', 'restaurant', 'park', 'museum', 'hotel', 'library', 'theater',
    'shopping mall', 'stadium', 'gym', 'hospital', 'school', 'university',
    'beach', 'amusement park', 'zoo', 'aquarium', 'art gallery', 'cinema',
    'nightclub', 'bar', 'pharmacy', 'supermarket', 'bus station', 'train station',
    'airport', 'church', 'temple', 'mosque', 'synagogue', 'market', 'bank',
    'post office', 'police station', 'fire station'
  ];
  const locationKeywords = ['near', 'in', 'at', 'around'];

  for (let i = 0; i < words.length; i++) {
    if (typeKeywords.includes(words[i])) {
      result.type = words[i];
    } else if (locationKeywords.includes(words[i]) && i + 1 < words.length) {
      result.location = words[i + 1];
      i++;
    } else {
      result.searchTerms.push(words[i]);
    }
  }

  return result;
}

function calculateRelevance(location, parsedQuery) {
  const locationText = `${location.locationName} ${location.address} ${location.details}`.toLowerCase();
  let relevance = 0;

  relevance += parsedQuery.searchTerms.filter(term => locationText.includes(term)).length;

  if (parsedQuery.type && locationText.includes(parsedQuery.type)) {
    relevance += 2;
  }

  if (parsedQuery.location && locationText.includes(parsedQuery.location)) {
    relevance += 2;
  }

  if (location.locationName.toLowerCase().includes(parsedQuery.searchTerms.join(' '))) {
    relevance += 3;
  }

  return relevance;
}

document.getElementById('searchBar').addEventListener('input', searchLocations);

readLocations();

