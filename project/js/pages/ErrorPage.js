(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('errorPage', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.errorPage = factory());
}(this, (function () { 'use strict';

	const RulesPage = {
		id: 'error',
		title: 'Ошибка 404',
		HTML: `
	<div class="error">
		<div class="error__err" data-tilt data-tilt-full-page-listening data-tilt-glare data-tilt-reverse="true">Error</div>
		<div class="error__404" data-tilt data-tilt-full-page-listening data-tilt-glare>404,2</div>
		<h1 class="error__message">Такой страницы не существует!</h1>
		<a class="error__return" href="#home">Вернуться на главную</a>
</div>
	`,

		render: function (container) {
			container.innerHTML = this.HTML;
		},

		start: function () {
			// Прячем хидер с навигацией, на главную по ссылке
			const $header = document.querySelector('.header');
			$header.classList.add('hidden');

		},
	};

	return RulesPage;

})));
