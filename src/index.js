import SodexoData from './modules/sodexo-data';
import FazerData from './modules/fazer-data';
import {setModalControls} from './modules/modal';
import './styles/style.scss';
import './styles/mobile.scss';
import './styles/widescreen.scss';

const today = new Date().toISOString().split('T')[0];
let languageSetting = 'fi';

// TODO: Load from local storage if exists or use default:
const userSettings = {
  colorTheme: 'dark',
  //move lang setting here
};

// TODO: updateUserSettings function
// - refresh page (e.g. use DOM manipulation to change class names)
// - save settings object to local storage

const restaurants = [{
  displayName: 'Myyrmäen Sodexo',
  name: 'sodexo-myyrmaki',
  id: 152,
  type: SodexoData
}, {
  displayName: 'Karaportin Fasu',
  name: 'fazer-kp',
  id: 270540,
  type: FazerData
}];

// adding a restaurant
// restaurants.push(
//   {
//     displayName: 'Arabian Sodexo',
//     name: 'sodexo-arabia',
//     id: 999,
//     type: SodexoData
//   }
// );

/**
 * Displays lunch menu items as html list
 *
 * @param {Array} menuData - Lunch menu array
 * @param {string} restaurant - element target id
 */
const renderMenu = (menuData, restaurant) => {
  const restaurantDiv = document.querySelector('#' + restaurant);
  restaurantDiv.innerHTML = '';
  const ul = document.createElement('ul');
  for (const item of menuData) {
    const listItem = document.createElement('li');
    listItem.textContent = item;
    ul.appendChild(listItem);
  }
  restaurantDiv.appendChild(ul);
};

/**
 * Displays a notification message instead of dishes
 * when menu data is not available
 *
 * @param {string} message
 * @param {string} restaurant
 */
const renderNoDataNotification = (message, restaurant) => {
  const restaurantDiv = document.querySelector('#' + restaurant);
  restaurantDiv.innerHTML = `<p>${message}</p>`;
};

/**
 * Switches application language between en/fi
 * and updates menu data
 */
const switchLanguage = () => {
  if (languageSetting === 'fi') {
    languageSetting = 'en';
  } else {
    languageSetting = 'fi';
  }
  console.log('language changed to: ', languageSetting);
  loadAllMenuData();
};

/**
 * Load data for all restaurant boxes
 * @async
 */
const loadAllMenuData = async () => {
  for (const restaurant of restaurants) {
    try {
      const parsedMenu = await restaurant.type.getDailyMenu(restaurant.id, languageSetting, today);
      renderMenu(parsedMenu, restaurant.name);
    } catch (error) {
      console.error(error);
      // notify user if errors with data
      renderNoDataNotification('No data available..', restaurant.name);
    }
  }
};

/**
 * Registers the service worker (SW) generated by Workbox
 */
const registerServiceWorkers = () => {
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', () => {
      navigator.serviceWorker.register('./service-worker.js').then(registration => {
        console.log('SW registered: ', registration);
      }).catch(registrationError => {
        console.log('SW registration failed: ', registrationError);
      });
    });
  }
};

/**
 * App initialization
 */
const init = () => {
  document.querySelector('#switch-lang').addEventListener('click', switchLanguage);
  loadAllMenuData();
  setModalControls();
  // Service workers registeration below disabled temporarily for easier local development
  // must be uncommented from init() before building for "production"
  //registerServiceWorkers();
};
init();
