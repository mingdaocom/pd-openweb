let googleMapApiPromise;

export default function loadGoogleMapApi() {
  if (!googleMapApiPromise) {
    googleMapApiPromise = import('@react-google-maps/api');
  }

  return googleMapApiPromise;
}
