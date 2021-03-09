// Импорты страниц и компонентов SPA
import tilt from './tilt.js';
// import firebase from 'firebase';
import HomePage from './pages/HomePage.js';
import RulesPage from './pages/RulesPage.js';
import GamePage from './pages/GamePage.js';
import PlayersPage from './pages/PlayersPage.js';
import ErrorPage from './pages/ErrorPage.js';

import Header from './components/Header.js';
import ContentContainer from './components/ContentContainer.js';




// ! FIREBASE
// const firebaseConfig = {
// 	apiKey: "AIzaSyDrrx0qo9fr9649GoqnOxWAb713ARPOV8s",
// 	authDomain: "glass-wars-54dfb.firebaseapp.com",
// 	databaseURL: "https://glass-wars-54dfb-default-rtdb.firebaseio.com",
// 	projectId: "glass-wars-54dfb",
// 	storageBucket: "glass-wars-54dfb.appspot.com",
// 	messagingSenderId: "204829629896",
// 	appId: "1:204829629896:web:b748c50c8315f32ff7f4fd"
// };

// firebase.initializeApp(firebaseConfig);

// let usersDB = firebase.database();
// console.log(usersDB)


// HomePage.render(document.querySelector('.content'));
// HomePage.start();
// tilt.init(document.querySelectorAll('[data-tilt]'));





// Компоненты приложения - хидер и контейнер основного содержимого
const components = [
	Header,
	ContentContainer,
];

// Страницы приложения
const routes = {
	home: HomePage,
	rules: RulesPage,
	game: GamePage,
	players: PlayersPage,
	error: ErrorPage,
};

//! ----------MVC----------
const GlassWarsSPA = (function () {

	//! View - по запросу модели "переходит по ссылке", меняя верстку в контейнере
	function ModuleView() {
		let rootElement = null;
		let contentElement = null;
		let routes = null;

		this.init = function (root, routesHash) {
			rootElement = root;
			routes = routesHash;
			contentElement = rootElement.querySelector('#content');
		}


		this.renderContent = function (hashPageName) {
			// Если на переданный хэш есть страница - обобразим ее, иначе покажем ошибку 404
			let routeName = hashPageName in routes ? hashPageName : 'error';

			// Меняем заголовок страницы, рендерим содержимое в контейнер, запускаем скрипт, инициализируем тильт
			window.document.title = routes[routeName].title;
			routes[routeName].render(contentElement);
			routes[routeName].start();
			tilt.init(document.querySelectorAll('[data-tilt]'));
		}
	};


	//! Model - отрабатывает переход по ссылке, вызывая метод view
	function ModuleModel() {
		let ModuleView = null;

		this.init = function (view) {
			ModuleView = view;
		}

		this.updateState = function () {
			const hashPageName = window.location.hash.slice(1).toLowerCase();
			ModuleView.renderContent(hashPageName);
		}
	}


	//! Controller - слушатели на изменение хэша URL и элементы навигации, запуск метода модели при hashchange
	function ModuleController() {
		let rootElement = null;
		let ModuleModel = null;
		let navigateElement = null;

		// init-метод связывает контроллер с моделью и вешает обработчики на hashchange и ссылки меню
		this.init = function (root, model) {
			rootElement = root;
			ModuleModel = model;
			navigateElement = rootElement.querySelector('nav.nav');

			// Cлушатель на изменение значения хэша URL страницы
			window.addEventListener('hashchange', this.updateState);

			// При инициализации контроллера отображаем стартовую страницу
			window.location.hash = '#home';
			this.updateState();
		}

		this.updateState = function () {
			ModuleModel.updateState();
		}
	};


	// Возвращаем функцию, создающую и связывающую компоненты MVC при вызове
	return function (rootId, routes, components) {
		// Отрисовываем компоненты SPA в root-элементе index.html
		const SPAroot = document.getElementById(rootId);
		components.forEach((component) => component.render(SPAroot));

		// Создаем MVC-компоненты модуля
		const SPAview = new ModuleView();
		const SPAmodel = new ModuleModel();
		const SPAcontroller = new ModuleController();

		// Связываем их инициализацией
		SPAview.init(document.getElementById(rootId), routes);
		SPAmodel.init(SPAview);
		SPAcontroller.init(document.getElementById(rootId), SPAmodel);
	}

})();

GlassWarsSPA('spa', routes, components);
