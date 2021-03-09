const PlayersPage = {
	id: 'players',
	title: 'Glass wars - список игроков',
	HTML: `
	<section class="players">
	<h1 class="players__title">Статистика зарегистрированных игроков</h1>

	<table class="players__table stats">
		<tr class="stats__heading">
			<th>Игрок</th>
			<th>сыграно игр</th>
			<th>побед</th>
			<th>поражений</th>
		</tr>
		<tr class="stats__row">
			<td>Sv9topolk</td>
			<td>12</td>
			<td>6</td>
			<td>6</td>
		</tr>
	</table>

</section>
	`,

	render: function (container) {
		container.innerHTML = this.HTML;
	},

	start: function () {
		// Показываем хидер с навигацией
		const $header = document.querySelector('.header');
		$header.classList.remove('hidden');

		const $content = document.getElementById('content');

		// !!!FIREBASE!!!

	},
}

export default PlayersPage;
