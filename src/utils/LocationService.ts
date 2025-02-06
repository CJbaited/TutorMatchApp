import * as Location from 'expo-location';

const LocationService = {
  async getCurrentLocation() {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        throw new Error('Permission denied');
      }

      const location = await Location.getCurrentPositionAsync({});
      return {
        latitude: location.coords.latitude,
        longitude: location.coords.longitude
      };
    } catch (error) {
      console.error('Error getting location:', error);
      return null;
    }
  },

  async getCityFromCoordinates(latitude: number, longitude: number) {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
      );
      const data = await response.json();
      return data.address.city || data.address.town;
    } catch (error) {
      console.error('Error getting city:', error);
      return null;
    }
  },

  async updateUserLocation(supabase: any, userId: string) {
    try {
      const location = await this.getCurrentLocation();
      if (!location) return null;

      const city = await this.getCityFromCoordinates(
        location.latitude,
        location.longitude
      );

      const { error } = await supabase
        .from('profiles')
        .update({
          city,
          latitude: location.latitude,
          longitude: location.longitude
        })
        .eq('user_id', userId);

      if (error) throw error;

      return { city, ...location };
    } catch (error) {
      console.error('Error updating location:', error);
      return null;
    }
  }
};

export default LocationService;