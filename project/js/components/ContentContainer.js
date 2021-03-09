(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define('contentContainer', factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.contentContainer = factory());
}(this, (function () { 'use strict';

	// Компонент - контейнер для содержимого страниц приложения

	const ContentContainer = {
		HTML: `
	<main class="content" id="content">
	</main>
	`,

		render: function (root) {
			root.insertAdjacentHTML('beforeend', this.HTML);
		}
	};

	return ContentContainer;

})));
