import fetch from 'node-fetch';

/**
 * Fetches place details from Google Maps API based on a short link.
 * @param {string} shortLink - The short link to be expanded.
 * @param {string} apiKey - The Google Maps API key.
 * @returns {Promise<Object[]>} - An array of place details.
 */
async function getPlaceDetails(shortLink, apiKey) {
    let responseArray = [];

  

    try {
        const response = await fetch(shortLink, { method: 'HEAD', redirect: 'manual' });
        const expandedUrl = response.headers.get('location');

        // Log the expanded URL for debugging
        console.log('Expanded URL:', expandedUrl);

        // Validate the expanded URL
        if (!expandedUrl || !/^https?:\/\//.test(expandedUrl)) {
            throw new Error('Invalid expanded URL');
        }

        // Extract the address from the expanded URL
        const address = expandedUrl.split('/place/')[1].split('/data=')[0].replace(/-/g, ' ').replace(/\+/g, ' ').trim();

        // Call Google Maps Geocoding API with the extracted address
        const apiEndpoint = `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(address)}&key=${apiKey}`;
        const apiResponse = await fetch(apiEndpoint);
        const data = await apiResponse.json();

        // Log the API response for debugging
        console.log('API Response:', JSON.stringify(data, null, 2));

        if (!data || data.status !== 'OK' || data.results.length === 0) {
            throw new Error('Unable to obtain place name');
        }

        responseArray = await extractDetails(data.results,shortLink, apiKey);

    } catch (error) {
        console.error('Error fetching place details:', error);
        return {
            status: 'error',
            message: 'Error retrieving place details'
        };
    }

    return responseArray;
}

/**
 * Extracts the long name of a specific type from address components.
 * @param {Array} addressComponents - The address components array.
 * @param {string} type - The type of address component to find.
 * @returns {string|null} - The long name or null if not found.
 */
function getLongNameByType(addressComponents, type) {
    const component = addressComponents.find(comp => comp.types.includes(type));
    return component ? component.long_name : null;
}


/**
 * Extracts detailed information from the results returned by the Google Maps API.
 * @param {Array} results - The results array from the API response.
 * @param {string} apiKey - The Google Maps API key.
 * @returns {Promise<Object[]>} - An array of detailed place information.
 */
async function extractDetails(results,  shortLink,apiKey) {
    const details = [];

    for (const result of results) {
        const placeDetails = await getPlaceDetailsById(result.place_id, apiKey);

        const detail = {
            name: placeDetails.name || '',
            endereco: result.formatted_address || '',
            cidade: getLongNameByType(placeDetails.address_components, "administrative_area_level_2") || '',
            cep: getLongNameByType(placeDetails.address_components, "postal_code") || '',
            place_id: result.place_id || '',
            rating: placeDetails.rating || null,
            icon: placeDetails.icon || '',
            icon_background_color: placeDetails.icon_background_color || '',
            photos: placeDetails.photos ? placeDetails.photos.map(photo => photo.photo_reference).join(', ') : '',
            url: shortLink || '',
            types: placeDetails.types ? placeDetails.types.join(', ') : '',
            qd_lt: getLongNameByType(placeDetails.address_components, "subpremise") || '',
            street_number: getLongNameByType(placeDetails.address_components, "street_number") || '',
            Lagradouto: getLongNameByType(placeDetails.address_components, "route") || '',
            setor: getLongNameByType(placeDetails.address_components, "sublocality_level_1") || '',
            estado: getLongNameByType(placeDetails.address_components, "administrative_area_level_1") || '',
            lat: result.geometry.location.lat || null,
            lng: result.geometry.location.lng || null,
            telefone: placeDetails.international_phone_number || '',
            horarioFuncionamento: placeDetails.opening_hours ? placeDetails.opening_hours.weekday_text.join(', ') : ''
        };

        details.push(detail);
    }

    return details;
}

/**
 * Fetches detailed place information based on place ID.
 * @param {string} place_id - The place ID to fetch details for.
 * @param {string} apiKey - The Google Maps API key.
 * @returns {Promise<Object>} - The place details.
 */
async function getPlaceDetailsById(place_id, apiKey) {
    const apiEndpoint = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${place_id}&key=${apiKey}`;
    const apiResponse = await fetch(apiEndpoint);
    const data = await apiResponse.json();

    return data.result;
}

export default getPlaceDetails;