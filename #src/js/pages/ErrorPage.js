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
}

export default RulesPage;
