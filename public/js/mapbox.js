/* eslint-disable */
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1IjoiZHJvZ3NoZWxsIiwiYSI6ImNtYnoycXFpZDF0NG4ybnExeWtjcnF4Z3YifQ.Dk1vlHT-1TXo7IEzUOmQWA';

    const map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/drogshell/cmbz3osnq00ns01spg6kn77q5',
        scrollZoom: false,
        doubleClickZoom: false,
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((location) => {
        // Create the marker
        const el = document.createElement('div');
        el.className = 'marker';

        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom',
        })
            .setLngLat(location.coordinates)
            .addTo(map);

        new mapboxgl.Popup({ offset: 30, focusAfterOpen: false })
            .setLngLat(location.coordinates)
            .setHTML(`<p>Day ${location.day}: ${location.description}</p>`)
            .addTo(map);

        bounds.extend(location.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100,
        },
    });
};
