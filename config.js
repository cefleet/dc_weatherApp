const appId = '69d874382a7e6753c7ab9a6f79d6f431';//from signup on openWeathermap.org
const proxy = 'https://cors-anywhere.herokuapp.com/';//cors is not allowed with this api. A proxy needs to be used.
//const proxy = 'http://localhost:8080/';
export const baseUrl = `${proxy}http://api.openweathermap.org/data/2.5/weather/?appId=${appId}`;
export const iconUrl = 'http://openweathermap.org/img/wn/';
