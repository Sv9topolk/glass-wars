// Компонент - контейнер для содержимого страниц приложения

const ContentContainer = {
	HTML: `
	<main class="content" id="content">
	</main>
	`,

	render: function (root) {
		root.insertAdjacentHTML('beforeend', this.HTML);
	}
}

export default ContentContainer;
