const RulesPage = {
	id: 'rules',
	title: 'Glass wars - правила игры',
	HTML: `
	<section class="rules">

	<ul class="rules__navigate rules-nav">
		<li class="rules-nav__item active" data-rules="general">
			<svg class="rules-nav__icon" viewBox="0 0 512 512">
				<rect fill="rgb(0, 70, 100)" fill-opacity="1" height="512" width="512" rx="100" ry="100"></rect>
				<g>
					<path d="M57.594 43v242.563l80 30.53V292c-22.504-3.217-45.065-8.633-62.53-26.844l13.5-12.937c12.15 12.667 29.032 17.263 48.28 20.374L110.656 55.03C93.3 51.725 75.492 48.1 57.594 43zm397.125.03c-65.178 17.392-138.354.102-191.22 70.814v208.812c19.795-29.15 45.443-40.866 70.72-46.53 33.914-7.603 66.18-7.163 91.5-27.626l11.75 14.53c-31.256 25.263-68.25 24.386-99.158 31.314-29.295 6.566-53.978 17.63-72.25 63.187l188.657-71.967V43.03zM128.81 49.28l27.407 228.157.06.563V494.906l19.94-39.28 20.468 38.155V296.814L168.563 57.5l-39.75-8.22zm60.47 24.25l25.593 217.782c4.175 2.3 8.258 4.96 12.188 8.063 6.452 5.097 12.412 11.36 17.75 18.97V109.5c-15.496-17.475-34.402-28.327-55.532-35.97zM20.5 74.376v239.813l6.125 2.25 110.97 40.78v-19.906l-98.407-36.156V74.376H20.5zm452.594.03v226.75l-216.938 79.69-40.78-14.97v38.28c23.21 8.03 58.078 6.813 86.25-2.53v-17.563l184.03-67.625 6.125-2.25V74.407h-18.686zm-257.72 239.532v31.813l27.564 10.53c-7.04-20.847-16.565-33.66-27.438-42.25-.04-.03-.084-.06-.125-.092z"
					fill="#ffffff"></path>
				</g>
			</svg>
			<span class="rules-nav__text">Общие правила</span>
		</li>

		<li class="rules-nav__item" data-rules="race1">
			<svg class="rules-nav__icon" viewBox="0 0 512 512">
				<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(0, 0, 165)"></polygon>
				<g>
					<path d="M96.375 20.094l30.813 40.75 130.28 130.28L375.313 73.282l40.22-53.186-159.594 108.094L96.375 20.094zM452.22 59.53l-113.564 76.845-74.562 74.563-6.594 6.625-6.625-6.625L176.937 137 62.594 59.625l80.844 119.47 69.656 69.655 6.594 6.594-6.594 6.625-74.813 74.81L61.563 450.19l120.75-81.688 68.657-68.656 6.593-6.625 6.625 6.624 69.562 69.562 119.53 80.906-77.374-114.343-73.937-73.94-6.595-6.592 6.594-6.625 68.56-68.563 81.69-120.72zm-430 34.69l108.124 159.593L22.22 413.375l53.468-40.438L193.25 255.375 62.812 124.937 22.22 94.22zm470.624 3.155l-53.22 40.22-117.812 117.843 130.47 130.468 40.53 30.656L384.72 256.97 492.843 97.374zm-235.28 222.28l-117.69 117.69-40.343 53.342 159.595-108.093 159.563 108.094L388 450.094 257.562 319.656z"
					fill="#fff" transform="translate(25.6, 25.6) scale(0.9, 0.9) rotate(0, 256, 256)"></path>
				</g>
			</svg>
			<span class="rules-nav__text">Империя</span>
		</li>

		<li class="rules-nav__item" data-rules="race2">
			<svg class="rules-nav__icon" viewBox="0 0 512 512">
				<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(130, 65, 0)"></polygon>
				<g>
					<path d="M331.924 20.385c-36.708.887-82.53 60.972-116.063 147.972h.003c30.564-65.57 71.17-106.39 97.348-99.378 28.058 7.516 37.11 69.42 24.847 148.405-.895-.32-1.773-.642-2.672-.96.893.367 1.765.738 2.65 1.106-2.988 19.215-7.22 39.424-12.767 60.12-2.77 10.332-5.763 20.39-8.936 30.14-24.996-3.82-52.374-9.537-80.82-17.16-105.856-28.36-186.115-72.12-179.307-97.53 4.257-15.884 42.167-23.775 95.908-20.29-74.427-8.7-128.912-2.044-135.035 20.803-9.038 33.73 89.168 89.372 219.147 124.2 24.436 6.55 48.267 11.897 70.918 16.042-28.965 75.878-68.293 126.078-96.653 118.48-21.817-5.85-35.995-45.443-36.316-100.206-4.79 75.476 9.278 131.945 40.66 140.356 38.836 10.407 91.394-54.998 127.896-152.98 80.12 10.74 138.958 4.278 145.38-19.682 6.384-23.82-41.025-58.44-115.102-89.03 20.713-109.022 8.483-198.5-31.96-209.34-2.968-.796-6.013-1.144-9.124-1.07zm40.568 213.086c44.65 22.992 71.146 47.135 67.07 62.348-4.055 15.13-38.104 20.457-87.333 16.303 3.415-10.604 6.64-21.502 9.63-32.663 4.176-15.588 7.713-30.965 10.632-45.986z"
					fill="#ffffff"></path>
				</g>
			</svg>
			<span class="rules-nav__text">Династия</span>
		</li>

		<li class="rules-nav__item" data-rules="race3">
			<svg class="rules-nav__icon" viewBox="0 0 512 512">
				<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(105, 0, 35)"></polygon>
				<g>
					<path d="M296.03 12.742c-8.175 10.024-15.62 32.142-20.735 56.78-3.86-.373-7.738-.633-11.63-.764-1.526-.052-3.054-.086-4.583-.1-19.25-.178-38.79 2.634-57.988 8.69-10.223-23.05-22.23-43.093-32.293-51.176-2.068 12.775 2.546 35.67 10.442 59.578-23.396 10.692-43.644 25.71-60.156 43.73-20.387-14.86-40.818-26.22-53.58-28.19 4.598 12.105 20.058 29.64 38.865 46.405-14.49 20.423-24.804 43.577-30.294 68.008-10.005-1.068-19.74-1.653-28.59-1.67-13.356-.026-24.705 1.234-31.95 4.047 10.033 8.18 32.178 15.633 56.84 20.748-2.36 24.396.04 49.565 7.79 74.172-23.062 10.225-43.112 22.24-51.2 32.31 12.78 2.068 35.683-2.55 59.596-10.45 10.705 23.446 25.752 43.734 43.81 60.27-14.82 20.13-26.266 40.39-28.286 53.474 12.83-4.873 30.2-20.173 46.623-38.682 20.405 14.446 43.53 24.724 67.93 30.193-2.772 24.845-2.557 48.113 2.233 60.455 8.667-10.627 16.056-32.535 21.023-56.754 24.295 2.32 49.352-.082 73.854-7.785 10.018 22.885 21.83 42.907 32.146 51.193 2.192-13.53-2.36-36.185-10.16-59.63 23.44-10.708 43.72-25.754 60.252-43.812 20.11 14.802 40.34 26.226 53.41 28.243-4.868-12.818-20.142-30.167-38.627-46.576 14.454-20.42 24.734-43.56 30.2-67.972 24.82 2.764 48.062 2.546 60.395-2.24-10.62-8.66-32.507-16.04-56.703-21.006 2.314-24.306-.094-49.373-7.81-73.882 22.872-10.016 42.883-21.824 51.166-32.135-2.085-.338-4.385-.515-6.872-.545-13.65-.167-32.907 4.112-52.73 10.705-10.695-23.394-25.72-43.64-43.74-60.15 14.836-20.365 26.175-40.765 28.142-53.512-12.092 4.594-29.603 20.027-46.353 38.808-20.437-14.5-43.61-24.818-68.06-30.303 2.674-25.076 2.296-48.44-2.376-60.473zm-37.032 74.545c1.378.012 2.753.04 4.127.086 2.966.098 5.92.276 8.865.53-1.01 6.593-1.837 13.192-2.447 19.642-2.382-.196-4.77-.356-7.168-.438-1.214-.04-2.43-.066-3.646-.078-14.618-.138-29.444 1.886-44.04 6.255-1.93-6.155-4.115-12.405-6.47-18.603 16.837-5.148 33.936-7.536 50.778-7.395zm36.926 4.42c20.965 4.893 40.844 13.743 58.506 26.055-4.18 5.213-8.204 10.524-11.963 15.814-15.226-10.483-32.288-18.078-50.262-22.394 1.416-6.336 2.655-12.886 3.72-19.475zm-110.326 11.68c2.41 6.177 4.977 12.27 7.658 18.127-17.103 8.11-32.037 19.16-44.432 32.29-4.764-4.38-9.797-8.713-14.953-12.915 14.34-15.316 31.735-28.155 51.728-37.503zm73.047 22.287c1.065.01 2.13.03 3.19.066 2.196.072 4.38.22 6.56.403-.394 15.126.757 28.186 3.943 36.396 5.737-7.035 10.904-19.037 15.19-33.356 15.994 3.776 31.165 10.522 44.667 19.892-7.91 12.912-13.45 24.807-14.793 33.516 8.493-3.226 18.98-11.046 29.862-21.317 11.705 11.02 21.522 24.366 28.697 39.68-13.383 7.34-24.122 14.923-29.517 21.64 8.522 1.38 21.555-.222 36.377-3.777 4.914 16.198 6.533 32.702 5.196 48.74-1.52-.035-3.025-.06-4.498-.062-13.357-.026-24.705 1.234-31.95 4.047 6.7 5.463 18.812 10.602 33.455 14.937-3.765 16.077-10.545 31.324-19.96 44.89-13.068-7.938-25.02-13.45-33.545-14.765 3.07 8.082 10.99 18.586 21.502 29.663-11.06 11.787-24.465 21.674-39.866 28.884-7.34-13.382-14.923-24.11-21.638-29.504-1.38 8.518.22 21.544 3.77 36.358-16.197 4.91-32.7 6.523-48.735 5.182.338-15.28-.865-28.377-3.986-36.415-5.46 6.694-10.59 18.795-14.925 33.422-16.075-3.767-31.318-10.548-44.88-19.96 7.925-13.056 13.425-24.995 14.74-33.512-8.073 3.066-18.565 10.974-29.63 21.47-11.742-11.016-21.6-24.36-28.804-39.687 13.263-7.21 23.97-14.725 29.475-21.578-2.083-.338-4.383-.515-6.87-.545-8.193-.1-18.406 1.4-29.55 4.04-4.9-16.19-6.51-32.68-5.17-48.706 15.12.392 28.176-.76 36.384-3.946-7.033-5.734-19.02-10.905-33.334-15.19 3.778-15.988 10.536-31.15 19.904-44.646 12.9 7.9 24.78 13.43 33.483 14.773-3.223-8.486-11.03-18.962-21.287-29.832 10.976-11.66 24.256-21.448 39.494-28.615 7.213 13.27 14.73 23.98 21.586 29.486 1.45-8.952-.07-21.912-3.512-36.437 12.928-3.92 26.052-5.743 38.977-5.636zm114.623 7.34c15.328 14.347 28.18 31.755 37.53 51.765-6.184 2.44-12.276 5.048-18.124 7.76-8.117-17.15-19.183-32.12-32.344-44.54 4.387-4.774 8.728-9.82 12.938-14.986zm-254.65 26.71c5.203 4.17 10.503 8.188 15.782 11.938-10.48 15.222-18.085 32.28-22.402 50.248-6.324-1.413-12.86-2.658-19.436-3.72 4.898-20.95 13.75-40.816 26.055-58.465zm138.704 30.413c-2.253.01-4.528.133-6.818.375-36.65 3.86-63.052 36.478-59.19 73.127 3.86 36.647 36.477 63.048 73.125 59.188 36.648-3.86 63.05-36.478 59.19-73.127-3.618-34.357-32.512-59.71-66.308-59.563zm162.164 17.258c6.455 21.126 8.57 42.665 6.793 63.587-6.606-.983-13.213-1.775-19.66-2.353 1.475-18.062-.323-36.618-5.776-54.816 6.157-1.92 12.42-4.08 18.642-6.42zM88.754 242.127c6.578 1.006 13.163 1.835 19.598 2.443-1.49 18.07.297 36.64 5.744 54.852-6.152 1.93-12.394 4.1-18.588 6.453-6.464-21.183-8.563-42.776-6.754-63.748zM403.03 291.13c6.33 1.422 12.875 2.69 19.474 3.782-4.874 20.98-13.716 40.877-26.018 58.557-5.238-4.163-10.572-8.156-15.877-11.886 10.51-15.283 18.122-32.412 22.42-50.455zm-280.708 29.716c8.15 17.197 19.268 32.205 32.49 44.642-4.382 4.753-8.736 9.766-12.966 14.916-15.383-14.375-28.274-31.83-37.65-51.9 6.178-2.41 12.27-4.978 18.126-7.658zm243.994 38.478c4.762 4.39 9.783 8.75 14.942 12.987-14.384 15.395-31.85 28.297-51.938 37.674-2.442-6.184-5.048-12.27-7.76-18.117 17.245-8.156 32.292-19.29 44.756-32.543zM172.55 379.78c15.276 10.507 32.4 18.12 50.436 22.42-1.422 6.323-2.69 12.86-3.78 19.45-20.97-4.878-40.852-13.72-58.52-26.017 4.154-5.232 8.14-10.557 11.863-15.854zm127.74 20.25c1.92 6.155 4.077 12.415 6.415 18.636-21.124 6.445-42.656 8.55-63.574 6.766.983-6.6 1.77-13.198 2.347-19.64 18.06 1.48 36.614-.312 54.812-5.76z"
					fill="#ffffff" transform="rotate(30, 256, 256)"></path>
				</g>
			</svg>
			<span class="rules-nav__text">Анклав</span>
		</li>
	</ul>

	<article class="rules__info rules-info">

	</article>


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
		const $rulesNav = $content.querySelector('.rules__navigate');
		const $rulesInfo = $content.querySelector('.rules__info');

		// Отрисовываем основные правила игры
		renderRules('general');

		// Обработчик на клики по навигации
		const $rulesNavItems = Array.from($rulesNav.querySelectorAll('.rules-nav__item'));
		$rulesNav.addEventListener('click', (event) => {
			let item = event.target.closest('.rules-nav__item');
			if (!item || item.classList.contains('active')) return;
			// Если клик не по активной кнопке - делаем target активной, отрисовываем выбранные правила
			$rulesNavItems.forEach((item) => item.classList.remove('active'));
			item.classList.add('active');
			renderRules(item.getAttribute('data-rules'));
		});

		// Функция отрисовывает в блоке info переданные правила
		function renderRules(page) {
			const rulesPages = {};

			rulesPages.general = {
				title: 'Основные правила игры',
				HTML: `
					<h1 class="rules-info__title">Glass wars - основные правила игры</h1>
					<p class="rules-info__text">Перед вами пошаговая стратегия для двух пользователей. Игроки выбирают одну из трех ассиметричных фракций и пытаются уничтожить противника, строя здания на индивидуальном поле размером 8х8 клеток, и атакуя здания на поле соперника. Кроме поля, в игровой зоне игрока имеется планшет с доступными для постройки пятью зданиями.</p>
					<p class="rules-info__text">Игра длится несколько раундов, в течение которых игроки ходят по очереди, совершая действия. Количество действий зависит от наличия основных зданий на поле. Доступны два типа действий:</p>
					<p class="rules-info__text"><img class="rules-info__icon" src="/media/build.svg" alt="иконка действия строительства"> - строительство - перетащите здание с планшета на поле, создав фундамент. Для постройки здания необходимо потратить по действию на каждый элемент фундамента, кликнув на шестеренку над ним. Каждое здание имеет условия постройки (ограничения выбора клеток для строительства, требуемый уровень) и полезные свойства.</p>
					<p class="rules-info__text"><img class="rules-info__icon" src="/media/crosshair.svg" alt="иконка действия атаки"> - атака - кликните на свое атакующее здание и перенесите появившуюся мишень на легальную цель на поле соперника. После успешной атаки клетки атакованный элемент вражеского здания будет уничтожен, как и ваше атакующее здание. Такие клетки недоступны для строительства до конца игры.</p>
					<p class="rules-info__text">Игра заканчивается поражением игрока, который не сможет совернить любое действие в свой ход. Это может произойти при потере всех основных зданий или отсутствии возможности построить здание или атаковать (либо слишком много, либо нет действий.) Для победы грамотно выбирайте здания и клетки для строительства, подбирайте оптимальный момент для атаки и используйте сильные стороны своей фракции. И да пребудет с вами Сила!</p>
				`,
			};

			rulesPages.race1 = {
				title: 'Правила игры за Империю',
				HTML: `
					<h1 class="rules-info__title">Правила игры за Империю</h1>

					<div class="rules-info__bldg-info">
						<div class="rules-info__bldg-cont">
							<div class="b_1_0 rules-info__bldg-model rules-info__bldg-model--2x2" data-tilt>
								<div class="foundation_2x2">
									<div class="f_0_0"></div>
									<div class="f_1_0"></div>
									<div class="f_0_1"></div>
									<div class="f_1_1"></div>
								</div>

								<div class="lvl_1"></div>
								<div class="lvl_2"></div>
								<div class="lvl_3"></div>
								<div class="lvl_4"></div>
							</div>
						</div>

						<div class="rules-info__bldg-rules">
							<p class="rules-info__text">Командный центр - основное здание империи. Каждый центр увеличивает количество доступных действий в ход на 1. Можно строить рядом с другим командным центром.</p>
						</div>
						
						<div class="br"></div>

						<div class="rules-info__bldg-cont">
							<div class="b_1_1 rules-info__bldg-model rules-info__bldg-model--1x1" data-tilt>
								<div class="foundation_1x1">
									<div class="f_0_0"></div>
								</div>

								<div class="lvl_1"></div>
								<div class="lvl_2"></div>
								<div class="lvl_3"></div>
							</div>
						</div>

						<div class="rules-info__bldg-rules">
							<p class="rules-info__text">Ракета - атакующее здание. При выполнении действия атаки уничтожает элемент здания противника и уничтожается сама. Строится рядом с другой ракетой.</p>
						</div>

						<div class="br"></div>

						<div class="rules-info__bldg-cont">
							<div class="b_1_2 rules-info__bldg-model rules-info__bldg-model--2x2" data-tilt>
								<div class="foundation_2x2">
									<div class="f_0_0"></div>
									<div class="f_1_0"></div>
									<div class="f_0_1"></div>
									<div class="f_1_1"></div>
								</div>
		
								<div class="lvl_1"></div>
								<div class="lvl_2"></div>
								<div class="lvl_3"></div>
								<div class="lvl_4"></div>
							</div>
						</div>

						<div class="rules-info__bldg-rules">
							<p class="rules-info__text">Научный центр. При постройке повышает уровень игрока до 2, позволяя строить сейсмобомбы и ионную пушку. Строится рядом с командным центром.</p>
						</div>

						<div class="br"></div>

						<div class="rules-info__bldg-cont">
							<div class="b_1_3 rules-info__bldg-model rules-info__bldg-model--1x1" data-tilt>
								<div class="foundation_1x1">
									<div class="f_0_0"></div>
								</div>
			
								<div class="lvl_1"></div>
								<div class="lvl_2"></div>
								<div class="lvl_3"></div>
							</div>
						</div>

						<div class="rules-info__bldg-rules">
							<p class="rules-info__text">Сейсмобомба. Атакующее здание уровня 2. При атаке уничтожает пустую клетку поля противника и уничтожается сама. При атаке фундамента уничтожает все клетки под ним. Строится рядом с научным центром и сейсмобомбой.</p>
						</div>

						<div class="br"></div>

						<div class="rules-info__bldg-cont">
							<div class="b_1_4 rules-info__bldg-model rules-info__bldg-model--3x3" data-tilt>
								<div class="foundation_3x3">
									<div class="f_0_0"></div>
									<div class="f_1_0"></div>
									<div class="f_2_0"></div>
									<div class="f_0_1"></div>
									<div class="f_1_1"></div>
									<div class="f_2_1"></div>
									<div class="f_0_2"></div>
									<div class="f_1_2"></div>
									<div class="f_2_2"></div>
								</div>
			
								<div class="lvl_1"></div>
								<div class="lvl_2"></div>
								<div class="lvl_3"></div>
								<div class="lvl_4"></div>
							</div>
						</div>

						<div class="rules-info__bldg-rules">
							<p class="rules-info__text">Ионная пушка. Атакующее здание уровня 2. При атаке уничтожает клетки со зданиями противника размером 2х2 и уничтожает 1 элемент самой пушки. Строится рядом с научным центром.</p>
						</div>

					</div>
				`
			};

			rulesPages.race2 = {
				title: 'Правила игры за Династию',
				HTML: `
				<h1 class="rules-info__title">Правила игры за Династию</h1>

				<div class="rules-info__bldg-info">
					<div class="rules-info__bldg-cont">
						<div class="b_2_0 rules-info__bldg-model rules-info__bldg-model--2x1" data-tilt>
							<div class="foundation_2x1">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
							</div>
			
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
							<div class="lvl_4"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Пилон. Здания Династии можно строить лишь рядом с пилоном. Строится на любых клетках поля.</p>
					</div>
					
					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_2_1 rules-info__bldg-model rules-info__bldg-model--2x3" data-tilt>
							<div class="foundation_2x3">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
								<div class="f_0_1"></div>
								<div class="f_1_1"></div>
								<div class="f_0_2"></div>
								<div class="f_1_2"></div>
							</div>
				
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
							<div class="lvl_4"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Нексус - главное здание Династии. Каждый Нексус увеличивает максимально доступное количество действий на 2. Строится рядом с пилоном.</p>
					</div>

					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_2_2 rules-info__bldg-model rules-info__bldg-model--1x1" data-tilt>
							<div class="foundation_1x1">
								<div class="f_0_0"></div>
							</div>
			
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Фотонная пушка. Атакующее здание. При атаке уничтожает элемент здания противника и уничтожается сама. Строится рядом с пилоном.</p>
					</div>

					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_2_3 rules-info__bldg-model rules-info__bldg-model--2x2" data-tilt>
							<div class="foundation_2x2">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
								<div class="f_0_1"></div>
								<div class="f_1_1"></div>
							</div>
					
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
							<div class="lvl_4"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Ассимилятор. Повышает уровень игрока до 2. Атакующее здание. При атаке уничтожает пустую клетку поля противника, делая ее недоступной для строительства. При атаке фундамента уничтожает все клетки под ним. Строится рядом с пилоном.</p>
					</div>

					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_2_4 rules-info__bldg-model rules-info__bldg-model--2x2" data-tilt>
							<div class="foundation_2x2">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
								<div class="f_0_1"></div>
								<div class="f_1_1"></div>
							</div>
					
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
							<div class="lvl_4"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Анигилятор. Атакующее здание уровня 2. При атаке уничтожает клетки со зданиями противника размером 2х2 и уничтожает 1 элемент самого Анигилятора. Строится рядом с пилоном.</p>
					</div>

				</div>
				`
			};

			rulesPages.race3 = {
				title: 'Правила игры за Анклав',
				HTML: `
				<h1 class="rules-info__title">Правила игры за Анклав</h1>

				<div class="rules-info__bldg-info">
					<div class="rules-info__bldg-cont">
						<div class="b_3_0 rules-info__bldg-model rules-info__bldg-model--2x2" data-tilt>
							<div class="foundation_2x2">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
								<div class="f_0_1"></div>
								<div class="f_1_1"></div>
							</div>
			
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
							<div class="lvl_4"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Цитадель. Основное здание Анклава. Увеличивает максимально доступное число действий на 1. Строится рядом с любыми зданиями Анклава.</p>
					</div>
					
					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_3_1 rules-info__bldg-model rules-info__bldg-model--2x1" data-tilt>
							<div class="foundation_2x1">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
							</div>
					
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Тотем. Атакующее здание. При атаке уничтожает элемент здания противника, уничтожая при этом один элемент тотема. Строится рядом с любыми зданиями Анклава.</p>
					</div>

					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_3_2 rules-info__bldg-model rules-info__bldg-model--2x3" data-tilt>
							<div class="foundation_2x3">
								<div class="f_0_0"></div>
								<div class="f_1_0"></div>
								<div class="f_0_1"></div>
								<div class="f_1_1"></div>
								<div class="f_0_2"></div>
								<div class="f_1_2"></div>
							</div>
					
							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
							<div class="lvl_4"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Вапр-портал. Повышает уровень игрока до 2. Позволяет строить Маяк пустоты и Маяк гнева. Строится рядом с любыми зданиями Анклава.</p>
					</div>

					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_3_3 rules-info__bldg-model rules-info__bldg-model--1x1" data-tilt>
							<div class="foundation_1x1">
								<div class="f_0_0"></div>
							</div>

							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Маяк пустоты. Атакующее здание 2 уровня. При атаке уничтожает пустую клетку поля противника, при этом уничтожается сам. При атаке фундамента уничтожает все клетки под ним. Строится на любой свободной клетке поля.</p>
					</div>

					<div class="br"></div>

					<div class="rules-info__bldg-cont">
						<div class="b_3_4 rules-info__bldg-model rules-info__bldg-model--1x1" data-tilt>
							<div class="foundation_1x1">
								<div class="f_0_0"></div>
							</div>

							<div class="lvl_1"></div>
							<div class="lvl_2"></div>
							<div class="lvl_3"></div>
						</div>
					</div>

					<div class="rules-info__bldg-rules">
						<p class="rules-info__text">Маяк гнева. Атакующее здание 2 уровня. При атаке уничтожает элемент здания противника, при этом уничтожается сам. Строится на любой свободной клетке поля.</p>
					</div>

				</div>
				`
			};

			$rulesInfo.innerHTML = rulesPages[page].HTML;
		}


	},
}

export default RulesPage;
