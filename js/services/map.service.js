
export const mapService = {
    initMap,
    getUserPosition,
    setMarker,
    panTo,
    lookupAddressGeo,
    addClickListener
}

// TODO: Enter your API Key
const API_KEY = 'AIzaSyDVwxTIlJQ5afyuFA_pDIth7MhajY4HqaA'
var gMap
var gMarker

async function initMap(lat = 32.0749831, lng = 34.9120554) {
    await _connectGoogleApi()
    gMap = new google.maps.Map(
        document.querySelector('.map'), {
        center: { lat, lng },
        zoom: 8
    })
}

function panTo({lat, lng, zoom=15}) {
    const laLatLng = new google.maps.LatLng(lat, lng)
    gMap.panTo(laLatLng)
    gMap.setZoom(zoom)
}

async function lookupAddressGeo(geoOrAddress) {
    // Sample URLs:
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?address=${address}`
    // const url = `https://maps.googleapis.com/maps/api/geocode/json?latlng=40.714224,-73.961452`

    var url = `https://maps.googleapis.com/maps/api/geocode/json?key=${API_KEY}&`
    url += (geoOrAddress.lat) ? `latlng=${geoOrAddress.lat},${geoOrAddress.lng}` :
        `address=${geoOrAddress}`

    const res = await fetch(url)
    const res_2 = await res.json()
    // console.log('RES IS', res)
    if (!res_2.results.length) return new Error('Found nothing')
    res_2 = res_2.results[0]
    const { formatted_address, geometry } = res_2
    const geo = {
        address: formatted_address.substring(formatted_address.indexOf(' ')).trim(),
        lat: geometry.location.lat,
        lng: geometry.location.lng,
        zoom: gMap.getZoom()
    }
    return geo

}

function addClickListener(cb) {
    gMap.addListener('click', (mapsMouseEvent) => {
        const geo = { lat: mapsMouseEvent.latLng.lat(), lng: mapsMouseEvent.latLng.lng() }
        lookupAddressGeo(geo).then(cb)
    })
}

function setMarker(loc) {
    (gMarker) && gMarker.setMap(null)
    if (!loc) return
    gMarker = new google.maps.Marker({
        position: loc.geo,
        map: gMap,
        title: loc.name
    })
}

// This function provides a Promise API to the callback-based-api of getCurrentPosition
function getUserPosition() {
    return new Promise((resolve, reject) => {
        function onSuccess(res) {
            const latLng = {
                lat: res.coords.latitude,
                lng: res.coords.longitude
            }
            resolve(latLng)
        }
        navigator.geolocation.getCurrentPosition(onSuccess, reject)
    })
}

function _connectGoogleApi() {
    if (window.google) return Promise.resolve()

    const elGoogleApi = document.createElement('script')
    elGoogleApi.src = `https://maps.googleapis.com/maps/api/js?key=${API_KEY}`
    elGoogleApi.async = true
    document.body.append(elGoogleApi)

    return new Promise((resolve, reject) => {
        elGoogleApi.onload = resolve
        elGoogleApi.onerror = () => reject('GoogleMaps script failed to load')
    })
}
