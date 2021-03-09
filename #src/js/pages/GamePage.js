const GamePage = {
	id: 'game',
	title: 'Glass wars - игра',
	HTML: `
	<section class="game-container">

		<!--! Игровая зона левого игрока -->
		<div class="player player--left">

			<!-- Планшет игрока -->
			<div class="player__mat">
				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

			</div>

			<!-- Контенер для информации игрока и поля -->
			<div class="player__area">

				<!-- Фракция и имя игрока -->
				<div class="info">
					<div class="info__player"></div>

					<div class="info__symbol"></div>

					<div class="info__race"></div>
				</div>

				<!-- Игровое поле -->
				<div class="board" data-tilt data-tilt-glare>
					<table class="board__back"></table>

					<table class="board__front"></table>
				</div>

			</div>

		</div>

		<!--! Игровая зона правого игрока -->
		<div class="player player--right">

			<!-- Контенер для информации игрока и поля -->
			<div class="player__area">

				<!-- Фракция и имя игрока -->
				<div class="info">
					<div class="info__player"></div>

					<div class="info__symbol"></div>

					<div class="info__race"></div>
				</div>

				<!-- Игровое поле -->
				<div class="board" data-tilt data-tilt-glare>
					<table class="board__back">
					</table>

					<table class="board__front">
					</table>
				</div>

			</div>

			<!-- Планшет игрока -->
			<div class="player__mat">
				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

				<div class="building">
					<h3 class="building__name"></h3>
					<div class="building__model">

					</div>
				</div>

			</div>

		</div>

		<div class="game-state">
			<div class="game-state__icon game-state__icon--left"></div>
			<div class="game-state__message"></div>
			<div class="game-state__icon game-state__icon--right"></div>
		</div>

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
		let timeout = null;

		//! Структура объекта класса Board
		/*
		boardL: {
			front(<table>).cells: [
				[<td>.status = 'empty', ... , <td>.status = 'empty'],
				... ,
				[<td>.status = 'empty', ... , <td>.status = 'empty']
			],
		
			back(<table>).cells: [
				[<td>, ... , <td>],
				... ,
				[<td>, ... , <td>]
			],
		
			actions: [<th>, ... , <th>]
		}
		*/
		class Board {
			constructor(side) {
				this.side = side;
				this.back = createBoardBack(side);
				this.front = createBoardFront(side);

				this.actions = Array.from(this.back.querySelectorAll('.P_bb_PA div'));

				// Создает и возвращает таблицу 8х8 со свойством-хэшэм ссылок на клетки
				function createBoardFront(side) {
					// Создаем таблицу и задаем ей класс
					const $tableF = document.createElement('table');
					$tableF.classList.add('board__front');

					// Создаем и вставляем в таблицу 8 рядов по 8 клеток
					$tableF.cells = [[], [], [], [], [], [], [], []];
					for (let coordY = 0; coordY <= 7; coordY++) {
						const $tr = document.createElement('tr');

						for (let coordX = 0; coordX < 8; coordX++) {
							let $td = document.createElement('td');
							// Запоминаем координаты XY в двумерном массиве
							$tableF.cells[coordX].push($td);

							// Каждой клетке задаем id матрицы координат
							$td.id = `p${side[0].toUpperCase()}_bf_C${coordX}_${coordY}`;
							// Создаем клетке свойство-статус, пока пустой, будем менять
							$td.status = 'empty';
							$td.dataset.status = 'empty';

							$tr.append($td);
						}
						$tableF.append($tr);
					}

					return $tableF;
				}

				function createBoardBack(side) {
					// Создаем таблицу и задаем ей класс
					const $tableB = document.createElement('table');
					$tableB.classList.add('board__back');

					// Создаем хедер с клетками действий игрока
					const $tHeader = document.createElement('tr');
					// $tableB.actions = {};
					for (let num = 0; num <= 7; num++) {
						let $th = document.createElement('th');
						$th.classList.add('P_bb_PA');
						$th.id = `p${side[0].toUpperCase()}_bb_PA${num}`;
						$th.innerHTML = `<div></div>`;
						// Запоминаем ячейки действий в хэшэ объекта игрока
						// $tableB.actions[`PA${num}`] = $th.firstElementChild;

						$tHeader.append($th);
					}
					$tableB.append($tHeader);

					// Создаем и вставляем в таблицу 8 рядов по 8 клеток
					$tableB.cells = [[], [], [], [], [], [], [], []];
					for (let coordY = 0; coordY <= 7; coordY++) {
						const $tr = document.createElement('tr');

						for (let coordX = 0; coordX < 8; coordX++) {
							let $td = document.createElement('td');
							// Запоминаем координаты XY в двумерном массиве
							$tableB.cells[coordX].push($td);

							// Каждой клетке задаем id матрицы координат
							$td.id = `p${side[0].toUpperCase()}_bb_C${coordX}_${coordY}`;
							$td.dataset.status = 'empty';
							$tr.append($td);
						}
						$tableB.append($tr);
					}

					// Создаем и вставляем в таблицу нижний ряд с буквенными координатами
					const $tFooter = document.createElement('tr');
					for (let letter = 0; letter < 8; letter++) {
						let $td = document.createElement('td');
						$td.classList.add(`P_bb_BS`);
						$td.innerHTML = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'][letter];
						$tFooter.append($td);
					}
					$tableB.append($tFooter);

					// Для каждого ряда создаем крайние правые и левые ячейки (леваые с цифровыми координатами)
					Array.from($tableB.querySelectorAll('tr')).forEach(($tr, i) => {
						let tdLS = document.createElement('td');
						tdLS.classList.add('P_bb_LS');
						if (i >= 1 && i <= 8) tdLS.innerHTML = i;
						let tdRS = document.createElement('td');
						tdRS.classList.add('P_bb_RS');
						$tr.prepend(tdLS);
						$tr.append(tdRS);
					});

					return $tableB;
				}
			}

			// init-метод
			start(containerForBack, containerForFront) {
				containerForBack.replaceWith(this.back);
				containerForFront.replaceWith(this.front);

				// Связываем клетку с копией на задней таблице для упрощения доступа к ней
				// $td.back = document.querySelector(`#p${side[0].toUpperCase()}_bb_C${coordX}_${coordY}`);
				for (let X = 0; X <= 7; X++) {
					for (let Y = 0; Y <= 7; Y++) {

						let cellBack = document.getElementById(`p${this.side[0].toUpperCase()}_bb_C${X}_${Y}`);
						let cellFront = document.getElementById(`p${this.side[0].toUpperCase()}_bf_C${X}_${Y}`);
						cellFront.back = cellBack;
					}
				}
			}
		}

		//! Структура объекта класса Player
		/*  */
		class Player {
			constructor(name = 'Гость') {
				this.name = name;
				this.race = null;
				this.board = null;
				this.side = null;
				this.enemy = null;
				this.buildingsOnBoard = [{}, {}, {}, {}, {}];
				this.foundationOnBoard = false;
				this.status = 'passive';
				this.currentTier = 1;
				this.actionsTotal = 0;
				this.actionsLeft = 0;
				this.actions = [];
				this.actionsWasted = [];
			}

			// init-метод
			start(board, race, enemy, side = 'left') {
				this.board = board;
				this.race = race;
				this.enemy = enemy;
				this.side = side;
				this.actions = board.actions;

				// Отрисовываем стартовые здания на поле
				this.race.start.forEach((startBldg) => {
					const newBldg = this.createBldg(startBldg[0]);
					this.placeBldg(newBldg, startBldg[1], startBldg[2]);
					this.updateActions();
				});

				// Указываем в игровой зоне игрока его имя, символ и название фракции
				const $playerArea = document.querySelector(`.player--${side}`);
				$playerArea.querySelector(`.info__player`).innerHTML = this.name;
				$playerArea.querySelector(`.info__symbol`).innerHTML = this.race.logo;
				$playerArea.querySelector(`.info__race`).innerHTML = this.race.name;

				// Размещаем на планшете игрока здания
				const $playerMat = $playerArea.querySelector(`.player__mat`);
				const bldgNameFields = Array.from($playerMat.querySelectorAll('.building__name'));
				const bldgModelFields = Array.from($playerMat.querySelectorAll('.building__model'));

				bldgModelFields.forEach((bldgField, num) => {
					const bldgElem = this.createBldg(num);
					bldgElem.setAttribute('data-tilt', '');
					let bldgSizeX = this.race.buildings[num].sizeX;
					let tiltScale;
					switch (bldgSizeX) {
						case 1:
							tiltScale = 1.3;
							break;
						case 2:
							tiltScale = 1.2;
							break;
						case 3:
							tiltScale = 1.1;
							break;
						default:
							tiltScale = 1;
					}
					bldgElem.setAttribute('data-tilt-scale', tiltScale);

					bldgField.innerHTML = '';
					bldgField.append(bldgElem);

					bldgNameFields[num].innerHTML = this.race.buildings[num].name;
				});

				// Вешаем слушатель на доступные для строительства здания на планшете игрока
				$playerMat.ondragstart = () => false;
				$playerMat.addEventListener('mousedown', (event) => {

					// Предотвратить срабатывание, если чужой ход, или не осталось действий, или есть недостроенное здание
					if (this.status !== 'active' || this.actionsLeft <= 0 || this.foundationOnBoard) return;

					// Находим цель нажатия - здание, если клик мимо - предотвратить
					const targetBldg = event.target.closest('.b__');
					if (!targetBldg) return;

					// Отключаем тилт для предотвращения багов отображения
					switchTilt(false);

					// Высчитываем смещение точки нажатия мыши в границах здания - padding
					const padding = 5;
					const shiftX = event.clientX - targetBldg.getBoundingClientRect().left - padding;
					const shiftY = event.clientY - targetBldg.getBoundingClientRect().top - padding;

					// Вычисляем конкретную модель здания по классу targetBldg
					const bldgNum = +targetBldg.className[4];

					// Создаем копию здания для перемещения и помещаем ее под курсор
					const cloneBldg = this.createBldg(bldgNum);
					cloneBldg.style.position = 'absolute';
					cloneBldg.style.zIndex = 1000;
					cloneBldg.classList.add('ghost');
					moveAt(event.pageX, event.pageY);
					document.body.append(cloneBldg);

					// Подсвечиваем доступные для строительства клетки
					const obj = this.checkCellsForBuild(cloneBldg);
					const cellsForFoundation = obj.cellsForFoundation;
					const cellsForAppendBldg = obj.cellsForAppendBldg;

					// Добавляем стили найденным клеткам для возможности их поиска
					cellsForFoundation.forEach((cell) => cell.classList.add('cell-for-foundation'));
					cellsForAppendBldg.forEach((cell) => cell.classList.add('cell-for-append'));


					//! Передвигаем здание при перемещении мыши
					let cellBelow;
					document.addEventListener('mousemove', onMouseMove);


					//! При отпускании клавиши удаляем обработчики
					document.addEventListener('mouseup', () => {
						document.removeEventListener('mousemove', onMouseMove);
						switchTilt(true);
						cloneBldg.remove();
						cellsForFoundation.forEach((cell) => cell.classList.remove('cell-for-foundation'));
						cellsForAppendBldg.forEach((cell) => cell.classList.remove('cell-for-append'));

						// Если здание не над клетками, где может быть построено, далее не выполняем
						if (!cellsForAppendBldg.includes(cellBelow)) return;

						// Создаем фундамент здания
						const $foundation = this.createFoundation(bldgNum);
						// Размещаем фундамент в целевой клетке
						this.placeFoundation($foundation, +cellBelow.id[7], +cellBelow.id[9]);
					}, { once: true });



					// ---------- Функции ----------
					function moveAt(pageX, pageY) {
						cloneBldg.style.left = pageX - shiftX + 'px';
						cloneBldg.style.top = pageY - shiftY + 'px';
					}

					function onMouseMove(event) {
						cloneBldg.hidden = true;
						if (!document.elementFromPoint(event.clientX - shiftX, event.clientY - shiftY)) return;
						cellBelow = document.elementFromPoint(event.clientX - shiftX, event.clientY - shiftY).closest('.board__front td');
						if (cellBelow && cellsForAppendBldg.includes(cellBelow)) {
							cloneBldg.classList.add('on-cell-for-append');
							let cellBelowCoord = cellBelow.getBoundingClientRect();

							cloneBldg.style.left = cellBelowCoord.left + padding / 2 + 'px';
							cloneBldg.style.top = cellBelowCoord.top + padding / 2 + 'px';
						} else {
							cloneBldg.classList.remove('on-cell-for-append');
							moveAt(event.pageX, event.pageY);
						}
						cloneBldg.hidden = false;
					}
				});

			}



			// Метод подготовки к новому раунду
			prepareForRound() {
				this.actionsLeft = this.actionsTotal;
				this.actionsWasted = [];
				this.updateActions();
			}

			// Метод обновляет визуальное отображение панели действий
			updateActions() {
				const actionsCells = this.actions.map((div) => div.parentElement);
				actionsCells.forEach((th) => th.className = 'P_bb_PA');

				// Добавляем стили всем возможным действиям
				for (let i = 0; i <= (this.actionsTotal - 1); i++) {
					actionsCells[i].classList.add('total');
				}
				for (let i = 0; i <= (this.actionsWasted.length - 1); i++) {
					actionsCells[i].classList.add(this.actionsWasted[i]);
				}
				if (this.actionsLeft !== 0) {
					actionsCells[this.actionsWasted.length].classList.add('current');
				}
			}

			// Метод тратит действие
			spendAction(actionType) {
				if (this.actionsLeft <= 0 || this.status === 'passive') return;
				console.log(this);

				// Обновить отображение действий на поле игрока
				this.actionsLeft--;
				this.actionsWasted.push(actionType);
				this.updateActions();

				// Вывести сообщение о типе действия
				let message = (actionType === 'build') ? `${this.name} тратит действие на строительство` : `${this.name} тратит действие на атаку`;
				showMessage(message, 3, this.side, actionType);

				// Проверить победные условия
				if (this.checkVictory()) return;

				// Если действий не осталось - передать ход
				if (this.actionsLeft <= 0) this.passTurn();
			}

			// Метод передает ход противнику
			passTurn() {
				this.status = 'passive';
				this.enemy.status = 'active';
				this.enemy.prepareForRound();

				document.querySelector(`.player--${this.enemy.side}`).classList.add('active');
				document.querySelector(`.player--${this.side}`).classList.remove('active');

				showMessage(`Ход переходит к ${this.enemy.name}`, 3, this.enemy.side, 'race' + this.enemy.race.num);
			}

			// Метод проверяет победные условия
			checkVictory() {
				// Игрок победил, если у противника не сможет подействовать (нет дающих действие зданий)
				if (this.enemy.actionsTotal <= 0) {
					this.winTheGame();
					return true;
				};

				// Игрок победил, если у противника не осталось доступных для строительства клеток и атакующих зданий
				let enemyCellsForAppend = [];
				this.race.buildings.forEach((bldgObj, bldgNum) => {
					enemyCellsForAppend = enemyCellsForAppend.concat(this.enemy.checkCellsForBuild(this.enemy.createBldg(bldgNum)).cellsForAppendBldg);
				});
				let enemyHasAttackBldgs = this.enemy.race.attackingBldg.find((bldgNum) => {
					for (let key in this.enemy.buildingsOnBoard[bldgNum]) return true;
				});

				if (enemyCellsForAppend.length === 0 && this.enemy.foundationOnBoard === false && !enemyHasAttackBldgs) {
					this.winTheGame();
					return true;
				}

				// Игрок проиграл, если у него не осталось доступных для строительства клеток и атакующих зданий
				let thisCellsForAppend = [];
				this.race.buildings.forEach((bldgObj, bldgNum) => {
					thisCellsForAppend = thisCellsForAppend.concat(this.checkCellsForBuild(this.createBldg(bldgNum)).cellsForAppendBldg);
				});
				let thisHasAttackBldgs = this.race.attackingBldg.find((bldgNum) => {
					for (let key in this.buildingsOnBoard[bldgNum]) return true;
				});

				if (thisCellsForAppend.length === 0 && this.foundationOnBoard === false && !thisHasAttackBldgs) {
					this.enemy.winTheGame();
					return true;
				}

			}

			// Метод запускает сценарий конца игры
			winTheGame() {
				let message = `Игрок ${this.name} побеждает!`
				showMessage(message, 100, this.side, 'race' + this.race.num);
				this.status = 'passive';
				this.enemy.status = 'passive';
				this.actionsTotal = 0;
				this.enemy.actionsTotal = 0;
				this.actionsLeft = 0;
				this.enemy.actionsTotal = 0;
			}

			// Метод создает и возвращает DOM-элемент здания
			createBldg(bldgNum) {
				const newBldg = document.createElement('div');
				const newBldgClass = this.race.buildings[bldgNum].class;
				const newBldgHTML = this.race.buildings[bldgNum].HTML;
				newBldg.classList.add(newBldgClass, 'b__');
				newBldg.insertAdjacentHTML('afterbegin', newBldgHTML);
				return newBldg;
			}

			// Метод вставляет здание в указанную клетку и запоминает в них фундамент
			placeBldg(bldgElem, posX, posY) {
				// Запоминаем модель здания и поле для упрощения доступа к их свойтвам
				const bldgNum = bldgElem.className[4];
				const bldgModel = this.race.buildings[bldgNum];
				const cellsMatrix = this.board.front.cells;

				// Добавляем зданию стили
				bldgElem.style.position = 'absolute';
				bldgElem.style.top = '0px';
				bldgElem.style.left = '0px';
				bldgElem.style.pointerEvents = 'none';
				bldgElem.dataset.coordinates = `X${posX}_Y${posY}`;

				// Размещаем здание в клетке поля
				cellsMatrix[posX][posY].append(bldgElem);

				// Сохраняем информацию о здании в объект: клетка, элемент и элементы фундамента
				const bldgData = {
					bldgElem: bldgElem,
					unbrokenFndtElems: {},
				};

				// Меняем статус клеток под зданием на "застроена"
				for (let Y = 0; Y < bldgModel.sizeY; Y++) {
					for (let X = 0; X < bldgModel.sizeX; X++) {
						// Записываем в статус клетки поля ссылку на ячейку фундамента здания
						const thisFndtElem = bldgElem.firstElementChild.children[bldgModel.sizeX * Y + X];
						const thisFndtCell = cellsMatrix[posX + X][posY + Y];

						thisFndtCell.status = thisFndtElem;
						thisFndtCell.dataset.status = 'building';
						thisFndtCell.back.dataset.status = 'building';
						thisFndtElem.cell = thisFndtCell;
						// и запоминаем клетки фундамента в объекте здания
						bldgData.unbrokenFndtElems[`f${bldgNum}_X${posX + X}_Y${posY + Y}`] = thisFndtElem;
					}
				}

				// Игрок узнает здание и все его клетки фундамента.
				// При атаке будем удалять из хэша элемент фундамента, если фундаментов не осталось - удаляем здание
				this.buildingsOnBoard[bldgNum][`b${bldgNum}_X${posX}_Y${posY}`] = bldgData;

				// Выполняем события здания при постройке
				bldgModel.onPlaceAction(bldgElem, this, this.enemy);
			}

			// Метод проверяет и подсвечивает доступные для строительства клетки и возвращает их массивы
			checkCellsForBuild(bldgElem) {
				const bldgNum = bldgElem.className[4];
				const bldgModel = this.race.buildings[bldgNum];
				const cellsMatrix = this.board.front.cells;

				// Массив для клеток, подходящих для строительства (верхний левый угол здания)
				const cellsForAppendBldg = [];
				const cellsForFoundation = [];

				// Проходим по всем столбцам поля
				cellsMatrix.forEach((col, X, matrix) => {
					if (X + bldgModel.sizeX > matrix.length) return;
					col.forEach((cell, Y, col) => {
						if (Y + bldgModel.sizeY > col.length) return;
						// Перебираем только клетки, при размещении здания на которых оно не будет выходить за край поля

						let cellsFitBelowCondition = [];
						let cellFitNearCondition = null;
						for (let bX = 0; bX < bldgModel.sizeX; bX++) {
							for (let bY = 0; bY < bldgModel.sizeY; bY++) {
								// Проверяем клетки на удовлетворение условию фундамента
								if (bldgModel.checkBelowCondition(cellsMatrix[X + bX][Y + bY])) {
									cellsFitBelowCondition.push(cellsMatrix[X + bX][Y + bY]);
								}

								// Проверяем клетки на удовлетворение условию соседства
								if ((Y + bY - 1) >= 0 && bldgModel.checkNearCondition(cellsMatrix[X + bX][Y + bY - 1])) {
									cellFitNearCondition = cellsMatrix[X + bX][Y + bY - 1];
								} else if ((X + bX - 1) >= 0 && bldgModel.checkNearCondition(cellsMatrix[X + bX - 1][Y + bY])) {
									cellFitNearCondition = cellsMatrix[X + bX - 1][Y + bY];
								} else if ((X + bX + 1) < matrix.length && bldgModel.checkNearCondition(cellsMatrix[X + bX + 1][Y + bY])) {
									cellFitNearCondition = cellsMatrix[X + bX + 1][Y + bY];
								} else if ((Y + bY + 1) < col.length && bldgModel.checkNearCondition(cellsMatrix[X + bX][Y + bY + 1])) {
									cellFitNearCondition = cellsMatrix[X + bX][Y + bY + 1];
								}
							}
						}

						// Если клетка и соседние удовлетворяет обоим условиям, пушим ее к подходящим для вставки здания,
						// а все соседние - к подходящим для фундамента
						if (cellsFitBelowCondition.length === bldgModel.sizeX * bldgModel.sizeY && cellFitNearCondition) {

							cellsForAppendBldg.push(cellsMatrix[X][Y]);
							cellsFitBelowCondition.forEach((cell) => {
								if (!cellsForFoundation.includes(cell)) cellsForFoundation.push(cell);
							});
						}
					});
				});

				return {
					cellsForFoundation,
					cellsForAppendBldg
				}
			}

			createFoundation(bldgNum) {
				const newFndt = document.createElement('div');
				const newFndtClass = this.race.buildings[bldgNum].class;
				const newFndtHTML = this.race.buildings[bldgNum].foundationHTML;
				newFndt.classList.add(newFndtClass, 'foundation');
				newFndt.insertAdjacentHTML('afterbegin', newFndtHTML);
				const fndtElems = Array.from(newFndt.firstElementChild.children);
				fndtElems.forEach((fndtElem) => fndtElem.classList.add('fndtElem'));

				return newFndt;
			}

			placeFoundation(fndnElem, posX, posY) {
				let player = this;
				// Запоминаем модель здания и поле для упрощения доступа к их свойтвам
				const bldgNum = fndnElem.className[4];
				const bldgModel = player.race.buildings[bldgNum];
				const cellsMatrix = player.board.front.cells;

				// Добавляем фундаменту стили
				fndnElem.style.position = 'absolute';
				fndnElem.style.top = '0px';
				fndnElem.style.left = '0px';

				// Размещаем фундамент в клетке поля
				player.board.front.cells[posX][posY].append(fndnElem);
				// Пока фундамент на поле - другой не поставить
				player.foundationOnBoard = true;

				// Находим все клетки фундамента и для каждой...
				const fndtElems = Array.from(fndnElem.firstElementChild.children);
				fndtElems.forEach((elem) => {
					// добавляем класс
					elem.classList.add('not-ready');
					// И меняем статусы на "фундамент"
					let elemCoordX = +elem.classList[0][2];
					let elemCoordY = +elem.classList[0][4];
					let cellCoordX = +elemCoordX + posX;
					let cellCoordY = +elemCoordY + posY;
					let cellBelow = cellsMatrix[cellCoordX][cellCoordY];
					cellBelow.status = 'foundation';
					cellBelow.dataset.status = 'foundation';
					cellBelow.back.dataset.status = 'foundation';

					elem.cell = cellBelow;
				});

				// Вешаем на клетки фундамента слушатели на застройку
				fndnElem.addEventListener('mouseup', (event) => {
					let fndtCell = event.target.closest('.not-ready');
					if (!fndtCell) return;
					// Если у игрока не осталось действий - предотвратить клик
					if (player.status !== 'active' || player.actionsLeft <= 0) return;

					fndtCell.classList.remove('not-ready');
					// Если в фундаменте не осталось not-ready - строим здание и удаляем фундамент
					if (Array.from(fndnElem.querySelectorAll('.not-ready')).length === 0) {
						let newBldg = player.createBldg(bldgNum);
						player.placeBldg(newBldg, posX, posY);
						player.foundationOnBoard = false;
						fndnElem.remove();
					}

					// Тратим действие
					player.spendAction('build');
				});
			}
		}



		//! Объект с фракциями
		const races = {
			race1: {
				name: 'Империя',
				num: 1,
				logo: `
					<svg viewBox="0 0 512 512">
						<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(0, 0, 155)"></polygon>
						<g>
							<path d="M96.375 20.094l30.813 40.75 130.28 130.28L375.313 73.282l40.22-53.186-159.594 108.094L96.375 20.094zM452.22 59.53l-113.564 76.845-74.562 74.563-6.594 6.625-6.625-6.625L176.937 137 62.594 59.625l80.844 119.47 69.656 69.655 6.594 6.594-6.594 6.625-74.813 74.81L61.563 450.19l120.75-81.688 68.657-68.656 6.593-6.625 6.625 6.624 69.562 69.562 119.53 80.906-77.374-114.343-73.937-73.94-6.595-6.592 6.594-6.625 68.56-68.563 81.69-120.72zm-430 34.69l108.124 159.593L22.22 413.375l53.468-40.438L193.25 255.375 62.812 124.937 22.22 94.22zm470.624 3.155l-53.22 40.22-117.812 117.843 130.47 130.468 40.53 30.656L384.72 256.97 492.843 97.374zm-235.28 222.28l-117.69 117.69-40.343 53.342 159.595-108.093 159.563 108.094L388 450.094 257.562 319.656z"
							fill="#fff"
							transform="translate(25.6, 25.6) scale(0.9, 0.9) rotate(0, 256, 256) skewX(0) skewY(0)"></path>
						</g>
					</svg>
				`,
				start: [
					[0, 0, 0],
					[0, 0, 2],
					[1, 6, 5],
					[1, 6, 6],
					[1, 6, 7],
					[1, 7, 5],
					[1, 7, 6],
					[1, 7, 7],
				],
				attackingBldg: [1, 3, 4],

				buildings: [
					{
						name: 'Командный центр',
						tier: 1,
						class: 'b_1_0',
						sizeX: 2,
						sizeY: 2,
						HTML: `
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
				`,
						foundationHTML: `
					<div class="foundation_2x2">
						<div class="f_0_0"></div>
						<div class="f_1_0"></div>
						<div class="f_0_1"></div>
						<div class="f_1_1"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '0');
						},

						onPlaceAction(bldg, player, enemy) {
							// Игрок учеличивает число своих максимальных действий за ход
							if (player.actionsTotal < 8) player.actionsTotal++;
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[0][`b1_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля игрока
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_2x2')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
							});

							// Количество максимальных действий игрока за ход уменьшается на 1
							player.actionsTotal--;
						},
					},

					{
						name: 'Ракета',
						tier: 1,
						class: 'b_1_1',
						sizeX: 1,
						sizeY: 1,
						HTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>
	
					<div class="lvl_1"></div>
					<div class="lvl_2"></div>
					<div class="lvl_3"></div>
				`,
						foundationHTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '1');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];
							// Находим клетку поля под ракетой
							let cellWithRocket = bldg.querySelector('.foundation_1x1').firstElementChild.cell;

							// Вешаем на нее слушатель на готовность к атаке
							cellWithRocket.ondragstart = () => false;
							cellWithRocket.addEventListener('mousedown', attackAction);
							function attackAction(event) {
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0 || player.status === 'passive') return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								// Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', () => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем 
									if (!cellBelowAim || cellBelowAim.dataset.status !== 'building') return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля
									// Клетка здания уничтожена
									cellBelowAim.status.dataset.destroy = 'true';

									// Удаляем элемент фундамента атакованного здания из хэша в объекте противника
									const attackedBldgElem = cellBelowAim.status.parentElement.parentElement;
									const attackedBldgNum = +attackedBldgElem.className[4];
									const attackedBldgX = attackedBldgElem.dataset.coordinates[1];
									const attackedBldgY = attackedBldgElem.dataset.coordinates[4];
									const enemyObjBldg = enemy.buildingsOnBoard[attackedBldgNum][`b${attackedBldgNum}_X${attackedBldgX}_Y${attackedBldgY}`];
									delete enemyObjBldg.unbrokenFndtElems[`f${attackedBldgNum}_X${cellBelowAim.id[7]}_Y${cellBelowAim.id[9]}`];
									// Если это был последний фундамент этого здания - уничтожить здание
									if (Object.keys(enemyObjBldg.unbrokenFndtElems).length === 0) {
										enemy.race.buildings[attackedBldgNum].onDestroyAction(attackedBldgElem, enemy, player);
									}

									// Статус клеток полей back и front также crater
									cellBelowAim.status = 'crater';
									cellBelowAim.dataset.status = 'crater';
									document.getElementById(cellBelowAim.id.replace('f', 'b')).dataset.status = 'crater';

									// При успешной атаке уничтожаем саму ракету
									bldgModel.onDestroyAction(bldg, player, enemy);
									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									cellWithRocket.removeEventListener('mousedown', attackAction);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									$aim.hidden = true;
									cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} [data-status="building"]`);
									if (cellBelowAim) {
										$aim.classList.add('on-target');
										let cellBelowCoord = cellBelowAim.getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}

							}
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[1][`b1_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статус клеток под ним на кратер
							bldg.remove();
							const cellBelow = bldg.querySelector('.foundation_1x1').firstElementChild.cell;
							cellBelow.status = 'crater';
							cellBelow.dataset.status = 'crater';
							document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
						},
					},

					{
						name: 'Научный центр',
						tier: 1,
						class: 'b_1_2',
						sizeX: 2,
						sizeY: 2,
						HTML: `
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
				`,
						foundationHTML: `
					<div class="foundation_2x2">
						<div class="f_0_0"></div>
						<div class="f_1_0"></div>
						<div class="f_0_1"></div>
						<div class="f_1_1"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '0' ||
								nearCell.status.closest('.b__').className[4] === '2');
						},

						onPlaceAction(bldg, player, enemy) {
							// Если это первый научный центр - повышаем тир игрока
							if (player.currentTier < 2) player.currentTier = 2;
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[2][`b2_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статусы клеток под ним на кратер
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_2x2')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
							});

							// Если уничтожен последний научный центр - снижаем тир тир игрока
							if (Object.keys(player.buildingsOnBoard[2]).length === 0) player.currentTier = 1;
						},
					},

					{
						name: 'Сейсмобомба',
						tier: 2,
						class: 'b_1_3',
						sizeX: 1,
						sizeY: 1,
						HTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
					<div class="lvl_2"></div>
					<div class="lvl_3"></div>
				`,
						foundationHTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '2' ||
								nearCell.status.closest('.b__').className[4] === '3');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];
							// Находим клетку поля под ракетой
							let cellWithRocket = bldg.querySelector('.foundation_1x1').firstElementChild.cell;

							// Вешаем на нее слушатель на готовность к атаке
							cellWithRocket.ondragstart = () => false;
							cellWithRocket.addEventListener('mousedown', attackAction);
							function attackAction(event) {
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0 || player.status === 'passive') return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								// Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', () => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем 
									if (!cellBelowAim) return;
									if (cellBelowAim.dataset.status !== 'empty' && !cellBelowAim.classList.contains('fndtElem')) return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля
									if (cellBelowAim.dataset.status === 'empty') {
										// Статус клеток полей back и front также crater
										cellBelowAim.status = 'crater';
										cellBelowAim.dataset.status = 'crater';
										cellBelowAim.back.dataset.status = 'crater';
									}
									// Если цель атаки - фундамент, уничтожаем фундамент и заменяем кратерами
									if (cellBelowAim.classList.contains('fndtElem')) {
										let targetFndtElem = cellBelowAim.parentElement.parentElement;
										let fndtCells = Array.from(cellBelowAim.parentElement.children).map((fndtElem) => fndtElem.cell);
										fndtCells.forEach((fndtCell) => {
											fndtCell.status = 'crater';
											fndtCell.dataset.status = 'crater';
											fndtCell.back.dataset.status = 'crater';
										})
										targetFndtElem.remove();

										// Противник больше не имеет фундамента, может строить новый
										enemy.foundationOnBoard = false;
									}

									// При успешной атаке уничтожаем саму ракету
									bldgModel.onDestroyAction(bldg, player, enemy);
									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									cellWithRocket.removeEventListener('mousedown', attackAction);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									$aim.hidden = true;
									cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} [data-status="empty"]`);
									if (!cellBelowAim) cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} .fndtElem`);
									if (cellBelowAim) {
										$aim.classList.add('on-target');
										let cellBelowCoord = cellBelowAim.getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}

							}
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[3][`b3_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статус клеток под ним на кратер
							bldg.remove();
							const cellBelow = bldg.querySelector('.foundation_1x1').firstElementChild.cell;
							cellBelow.status = 'crater';
							cellBelow.dataset.status = 'crater';
							document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
						},
					},

					{
						name: 'Ионная пушка',
						tier: 2,
						class: 'b_1_4',
						sizeX: 3,
						sizeY: 3,
						HTML: `
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
				`,
						foundationHTML: `
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
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '2' ||
								nearCell.status.closest('.b__').className[4] === '4');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];

							// Находим клетки поля под ионной пушкой
							const launchCells = Array.from(bldg.firstElementChild.children).map((fndtCell) => fndtCell.cell);
							// И на каждую вешаем слушатель на начало атаки
							launchCells.forEach((launch) => launch.addEventListener('mousedown', attackAction));
							function attackAction(event) {
								let launchCell = event.target;
								launchCell.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0 || player.status === 'passive') return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim-big');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellsBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								//! Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', (event) => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем
									if (!(cellsBelowAim.filter(cell => !!cell).length === 4 &&
										cellsBelowAim.filter(cell => (cell && cell.dataset.status === 'building')).length > 0)) return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля

									// Удаляем элемент фундамента атакованного здания из хэша в объекте противника
									let targets = cellsBelowAim.filter(cell => cell.dataset.status === 'building');
									targets.forEach(cellBelowAim => {
										const attackedBldgElem = cellBelowAim.status.parentElement.parentElement;
										const attackedBldgNum = +attackedBldgElem.className[4];
										const attackedBldgX = attackedBldgElem.dataset.coordinates[1];
										const attackedBldgY = attackedBldgElem.dataset.coordinates[4];
										const enemyObjBldg = enemy.buildingsOnBoard[attackedBldgNum][`b${attackedBldgNum}_X${attackedBldgX}_Y${attackedBldgY}`];
										delete enemyObjBldg.unbrokenFndtElems[`f${attackedBldgNum}_X${cellBelowAim.id[7]}_Y${cellBelowAim.id[9]}`];
										// Если это был последний фундамент этого здания - уничтожить здание
										if (Object.keys(enemyObjBldg.unbrokenFndtElems).length === 0) {
											enemy.race.buildings[attackedBldgNum].onDestroyAction(attackedBldgElem, enemy, player);
										}

										// Статус клеток полей back и front также crater
										cellBelowAim.status = 'crater';
										cellBelowAim.dataset.status = 'crater';
										cellBelowAim.back.dataset.status = 'crater';
									});

									//!!! ТУТ ДОДЕЛАТЬ НА УНИЧТОЖЕНИЕ КЛЕТКИ И ЧЕК УНИЧТОЖЕНИЯ ЗДАНИЯ При успешной атаке уничтожаем саму ракету

									// Удаляем элемент фундамента ионной пушки, и если он последний - удаляем и ее
									const launchBldgElem = launchCell.status.parentElement.parentElement;
									const launchBldgX = launchBldgElem.dataset.coordinates[1];
									const launchBldgY = launchBldgElem.dataset.coordinates[4];
									const playerObjBldg = player.buildingsOnBoard[4][`b${4}_X${launchBldgX}_Y${launchBldgY}`];
									delete playerObjBldg.unbrokenFndtElems[`f${4}_X${launchCell.id[7]}_Y${launchCell.id[9]}`];
									// Если это был последний фундамент ионной пушки - уничтожить ее
									if (Object.keys(playerObjBldg.unbrokenFndtElems).length === 0) {
										player.race.buildings[4].onDestroyAction(launchBldgElem, player, enemy);
									}
									// Под уничтоженной клеткой фундамента оставляем кратер
									launchCell.status = 'crater';
									launchCell.dataset.status = 'crater';
									launchCell.back.dataset.status = 'crater';

									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									launchCell.removeEventListener('mousedown', attackAction);

									// !!! TEST !!!
									console.log('Активный игрок');
									console.log(player);
									console.log('Пассивный игрок');
									console.log(enemy);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									const quaterAimSize = $aim.offsetWidth / 4;
									$aim.hidden = true;
									// Находим массив из клеток поля противника под мишенью, если ячейки нету тогда вместо нее [null]
									cellsBelowAim = [
										document.elementFromPoint(event.clientX - quaterAimSize, event.clientY - quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX + quaterAimSize, event.clientY - quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX - quaterAimSize, event.clientY + quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX + quaterAimSize, event.clientY + quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
									];

									// Если среди найденных клеток 4 (не выходит за границу поля), и среди них есть хоть одна со зданием - заххватить цель
									if (cellsBelowAim.filter(cell => !!cell).length === 4 &&
										cellsBelowAim.filter(cell => (cell && cell.dataset.status === 'building')).length > 0) {

										$aim.classList.add('on-target');
										let cellBelowCoord = cellsBelowAim[0].getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}
							}

						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[4][`b4_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статусы клеток под ним на кратер
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_3x3')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								cellBelow.back.dataset.status = 'crater';
							});
						},

					},
				]
			},

			race2: {
				name: 'Династия',
				num: 2,
				logo: `
					<svg viewBox="0 0 512 512">
						<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(130, 65, 0)"></polygon>
						<g>
							<path d="M331.924 20.385c-36.708.887-82.53 60.972-116.063 147.972h.003c30.564-65.57 71.17-106.39 97.348-99.378 28.058 7.516 37.11 69.42 24.847 148.405-.895-.32-1.773-.642-2.672-.96.893.367 1.765.738 2.65 1.106-2.988 19.215-7.22 39.424-12.767 60.12-2.77 10.332-5.763 20.39-8.936 30.14-24.996-3.82-52.374-9.537-80.82-17.16-105.856-28.36-186.115-72.12-179.307-97.53 4.257-15.884 42.167-23.775 95.908-20.29-74.427-8.7-128.912-2.044-135.035 20.803-9.038 33.73 89.168 89.372 219.147 124.2 24.436 6.55 48.267 11.897 70.918 16.042-28.965 75.878-68.293 126.078-96.653 118.48-21.817-5.85-35.995-45.443-36.316-100.206-4.79 75.476 9.278 131.945 40.66 140.356 38.836 10.407 91.394-54.998 127.896-152.98 80.12 10.74 138.958 4.278 145.38-19.682 6.384-23.82-41.025-58.44-115.102-89.03 20.713-109.022 8.483-198.5-31.96-209.34-2.968-.796-6.013-1.144-9.124-1.07zm40.568 213.086c44.65 22.992 71.146 47.135 67.07 62.348-4.055 15.13-38.104 20.457-87.333 16.303 3.415-10.604 6.64-21.502 9.63-32.663 4.176-15.588 7.713-30.965 10.632-45.986z"
							fill="#ffffff">
						</path>
					</g>
				</svg>
				`,
				start: [
					[0, 0, 0],
					[0, 0, 2],
					[1, 6, 5],
					[1, 6, 6],
					[1, 6, 7],
					[1, 7, 5],
					[1, 7, 6],
					[1, 7, 7],
				],
				attackingBldg: [1, 3, 4],

				buildings: [
					{
						name: 'Командный центр',
						tier: 1,
						class: 'b_1_0',
						sizeX: 2,
						sizeY: 2,
						HTML: `
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
						`,
						foundationHTML: `
					<div class="foundation_2x2">
						<div class="f_0_0"></div>
						<div class="f_1_0"></div>
						<div class="f_0_1"></div>
						<div class="f_1_1"></div>
					</div>

					<div class="lvl_1"></div>
						`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '0');
						},

						onPlaceAction(bldg, player, enemy) {
							// Игрок учеличивает число своих максимальных действий за ход
							if (player.actionsTotal < 8) player.actionsTotal++;
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[0][`b1_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля игрока
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_2x2')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
							});

							// Количество максимальных действий игрока за ход уменьшается на 1
							player.actionsTotal--;
						},
					},

					{
						name: 'Ракета',
						tier: 1,
						class: 'b_1_1',
						sizeX: 1,
						sizeY: 1,
						HTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>
	
					<div class="lvl_1"></div>
					<div class="lvl_2"></div>
					<div class="lvl_3"></div>
						`,
						foundationHTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
						`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '1');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];
							// Находим клетку поля под ракетой
							let cellWithRocket = bldg.querySelector('.foundation_1x1').firstElementChild.cell;

							// Вешаем на нее слушатель на готовность к атаке
							cellWithRocket.addEventListener('mousedown', attackAction);
							function attackAction(event) {
								event.target.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0) return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								// Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', () => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем 
									if (!cellBelowAim || cellBelowAim.dataset.status !== 'building') return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля
									// Клетка здания уничтожена
									cellBelowAim.status.dataset.destroy = 'true';

									// Удаляем элемент фундамента атакованного здания из хэша в объекте противника
									const attackedBldgElem = cellBelowAim.status.parentElement.parentElement;
									const attackedBldgNum = +attackedBldgElem.className[4];
									const attackedBldgX = attackedBldgElem.dataset.coordinates[1];
									const attackedBldgY = attackedBldgElem.dataset.coordinates[4];
									const enemyObjBldg = enemy.buildingsOnBoard[attackedBldgNum][`b${attackedBldgNum}_X${attackedBldgX}_Y${attackedBldgY}`];
									delete enemyObjBldg.unbrokenFndtElems[`f${attackedBldgNum}_X${cellBelowAim.id[7]}_Y${cellBelowAim.id[9]}`];
									// Если это был последний фундамент этого здания - уничтожить здание
									if (Object.keys(enemyObjBldg.unbrokenFndtElems).length === 0) {
										enemy.race.buildings[attackedBldgNum].onDestroyAction(attackedBldgElem, enemy, player);
									}

									// Статус клеток полей back и front также crater
									cellBelowAim.status = 'crater';
									cellBelowAim.dataset.status = 'crater';
									document.getElementById(cellBelowAim.id.replace('f', 'b')).dataset.status = 'crater';

									// При успешной атаке уничтожаем саму ракету
									bldgModel.onDestroyAction(bldg, player, enemy);
									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									cellWithRocket.removeEventListener('mousedown', attackAction);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									$aim.hidden = true;
									cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} [data-status="building"]`);
									if (cellBelowAim) {
										$aim.classList.add('on-target');
										let cellBelowCoord = cellBelowAim.getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}

							}
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[1][`b1_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статус клеток под ним на кратер
							bldg.remove();
							const cellBelow = bldg.querySelector('.foundation_1x1').firstElementChild.cell;
							cellBelow.status = 'crater';
							cellBelow.dataset.status = 'crater';
							document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
						},
					},

					{
						name: 'Научный центр',
						tier: 1,
						class: 'b_1_2',
						sizeX: 2,
						sizeY: 2,
						HTML: `
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
						`,
						foundationHTML: `
					<div class="foundation_2x2">
						<div class="f_0_0"></div>
						<div class="f_1_0"></div>
						<div class="f_0_1"></div>
						<div class="f_1_1"></div>
					</div>

					<div class="lvl_1"></div>
						`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '0' ||
								nearCell.status.closest('.b__').className[4] === '2');
						},

						onPlaceAction(bldg, player, enemy) {
							// Если это первый научный центр - повышаем тир игрока
							if (player.currentTier < 2) player.currentTier = 2;
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[2][`b2_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статусы клеток под ним на кратер
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_2x2')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
							});

							// Если уничтожен последний научный центр - снижаем тир тир игрока
							if (Object.keys(player.buildingsOnBoard[2]).length === 0) player.currentTier = 1;
						},
					},

					{
						name: 'Сейсмобомба',
						tier: 2,
						class: 'b_1_3',
						sizeX: 1,
						sizeY: 1,
						HTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
					<div class="lvl_2"></div>
					<div class="lvl_3"></div>
				`,
						foundationHTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '2' ||
								nearCell.status.closest('.b__').className[4] === '3');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];
							// Находим клетку поля под ракетой
							let cellWithRocket = bldg.querySelector('.foundation_1x1').firstElementChild.cell;

							// Вешаем на нее слушатель на готовность к атаке
							cellWithRocket.addEventListener('mousedown', attackAction);
							function attackAction(event) {
								event.target.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0) return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								// Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', () => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем 
									if (!cellBelowAim) return;
									if (cellBelowAim.dataset.status !== 'empty' && !cellBelowAim.classList.contains('fndtElem')) return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля
									if (cellBelowAim.dataset.status === 'empty') {
										// Статус клеток полей back и front также crater
										cellBelowAim.status = 'crater';
										cellBelowAim.dataset.status = 'crater';
										cellBelowAim.back.dataset.status = 'crater';
									}
									// Если цель атаки - фундамент, уничтожаем фундамент и заменяем кратерами
									if (cellBelowAim.classList.contains('fndtElem')) {
										let targetFndtElem = cellBelowAim.parentElement.parentElement;
										let fndtCells = Array.from(cellBelowAim.parentElement.children).map((fndtElem) => fndtElem.cell);
										fndtCells.forEach((fndtCell) => {
											fndtCell.status = 'crater';
											fndtCell.dataset.status = 'crater';
											fndtCell.back.dataset.status = 'crater';
										})
										targetFndtElem.remove();

										// Противник больше не имеет фундамента, может строить новый
										enemy.foundationOnBoard = false;
									}

									// При успешной атаке уничтожаем саму ракету
									bldgModel.onDestroyAction(bldg, player, enemy);
									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									cellWithRocket.removeEventListener('mousedown', attackAction);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									$aim.hidden = true;
									cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} [data-status="empty"]`);
									if (!cellBelowAim) cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} .fndtElem`);
									if (cellBelowAim) {
										$aim.classList.add('on-target');
										let cellBelowCoord = cellBelowAim.getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}

							}
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[3][`b3_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статус клеток под ним на кратер
							bldg.remove();
							const cellBelow = bldg.querySelector('.foundation_1x1').firstElementChild.cell;
							cellBelow.status = 'crater';
							cellBelow.dataset.status = 'crater';
							document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
						},
					},

					{
						name: 'Ионная пушка',
						tier: 2,
						class: 'b_1_4',
						sizeX: 3,
						sizeY: 3,
						HTML: `
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
				`,
						foundationHTML: `
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
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '2' ||
								nearCell.status.closest('.b__').className[4] === '4');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];

							// Находим клетки поля под ионной пушкой
							const launchCells = Array.from(bldg.firstElementChild.children).map((fndtCell) => fndtCell.cell);
							// И на каждую вешаем слушатель на начало атаки
							launchCells.forEach((launch) => launch.addEventListener('mousedown', attackAction));
							function attackAction(event) {
								let launchCell = event.target;
								launchCell.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0) return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim-big');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellsBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								//! Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', (event) => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем
									if (!(cellsBelowAim.filter(cell => !!cell).length === 4 &&
										cellsBelowAim.filter(cell => (cell && cell.dataset.status === 'building')).length > 0)) return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля

									// Удаляем элемент фундамента атакованного здания из хэша в объекте противника
									let targets = cellsBelowAim.filter(cell => cell.dataset.status === 'building');
									targets.forEach(cellBelowAim => {
										const attackedBldgElem = cellBelowAim.status.parentElement.parentElement;
										const attackedBldgNum = +attackedBldgElem.className[4];
										const attackedBldgX = attackedBldgElem.dataset.coordinates[1];
										const attackedBldgY = attackedBldgElem.dataset.coordinates[4];
										const enemyObjBldg = enemy.buildingsOnBoard[attackedBldgNum][`b${attackedBldgNum}_X${attackedBldgX}_Y${attackedBldgY}`];
										delete enemyObjBldg.unbrokenFndtElems[`f${attackedBldgNum}_X${cellBelowAim.id[7]}_Y${cellBelowAim.id[9]}`];
										// Если это был последний фундамент этого здания - уничтожить здание
										if (Object.keys(enemyObjBldg.unbrokenFndtElems).length === 0) {
											enemy.race.buildings[attackedBldgNum].onDestroyAction(attackedBldgElem, enemy, player);
										}

										// Статус клеток полей back и front также crater
										cellBelowAim.status = 'crater';
										cellBelowAim.dataset.status = 'crater';
										cellBelowAim.back.dataset.status = 'crater';
									});

									//!!! ТУТ ДОДЕЛАТЬ НА УНИЧТОЖЕНИЕ КЛЕТКИ И ЧЕК УНИЧТОЖЕНИЯ ЗДАНИЯ При успешной атаке уничтожаем саму ракету

									// Удаляем элемент фундамента ионной пушки, и если он последний - удаляем и ее
									const launchBldgElem = launchCell.status.parentElement.parentElement;
									const launchBldgX = launchBldgElem.dataset.coordinates[1];
									const launchBldgY = launchBldgElem.dataset.coordinates[4];
									const playerObjBldg = player.buildingsOnBoard[4][`b${4}_X${launchBldgX}_Y${launchBldgY}`];
									delete playerObjBldg.unbrokenFndtElems[`f${4}_X${launchCell.id[7]}_Y${launchCell.id[9]}`];
									// Если это был последний фундамент ионной пушки - уничтожить ее
									if (Object.keys(playerObjBldg.unbrokenFndtElems).length === 0) {
										player.race.buildings[4].onDestroyAction(launchBldgElem, player, enemy);
									}
									// Под уничтоженной клеткой фундамента оставляем кратер
									launchCell.status = 'crater';
									launchCell.dataset.status = 'crater';
									launchCell.back.dataset.status = 'crater';

									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									launchCell.removeEventListener('mousedown', attackAction);

									// !!! TEST !!!
									console.log('Активный игрок');
									console.log(player);
									console.log('Пассивный игрок');
									console.log(enemy);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									const quaterAimSize = $aim.offsetWidth / 4;
									$aim.hidden = true;
									// Находим массив из клеток поля противника под мишенью, если ячейки нету тогда вместо нее [null]
									cellsBelowAim = [
										document.elementFromPoint(event.clientX - quaterAimSize, event.clientY - quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX + quaterAimSize, event.clientY - quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX - quaterAimSize, event.clientY + quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX + quaterAimSize, event.clientY + quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
									];

									// Если среди найденных клеток 4 (не выходит за границу поля), и среди них есть хоть одна со зданием - заххватить цель
									if (cellsBelowAim.filter(cell => !!cell).length === 4 &&
										cellsBelowAim.filter(cell => (cell && cell.dataset.status === 'building')).length > 0) {

										$aim.classList.add('on-target');
										let cellBelowCoord = cellsBelowAim[0].getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}
							}

						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[4][`b4_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статусы клеток под ним на кратер
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_3x3')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								cellBelow.back.dataset.status = 'crater';
							});
						},

					},
				]
			},

			race3: {
				name: 'Анклав',
				num: 3,
				logo: `
					<svg viewBox="0 0 512 512">
						<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(155, 0, 50)"></polygon>
						<g>
							<path d="M296.03 12.742c-8.175 10.024-15.62 32.142-20.735 56.78-3.86-.373-7.738-.633-11.63-.764-1.526-.052-3.054-.086-4.583-.1-19.25-.178-38.79 2.634-57.988 8.69-10.223-23.05-22.23-43.093-32.293-51.176-2.068 12.775 2.546 35.67 10.442 59.578-23.396 10.692-43.644 25.71-60.156 43.73-20.387-14.86-40.818-26.22-53.58-28.19 4.598 12.105 20.058 29.64 38.865 46.405-14.49 20.423-24.804 43.577-30.294 68.008-10.005-1.068-19.74-1.653-28.59-1.67-13.356-.026-24.705 1.234-31.95 4.047 10.033 8.18 32.178 15.633 56.84 20.748-2.36 24.396.04 49.565 7.79 74.172-23.062 10.225-43.112 22.24-51.2 32.31 12.78 2.068 35.683-2.55 59.596-10.45 10.705 23.446 25.752 43.734 43.81 60.27-14.82 20.13-26.266 40.39-28.286 53.474 12.83-4.873 30.2-20.173 46.623-38.682 20.405 14.446 43.53 24.724 67.93 30.193-2.772 24.845-2.557 48.113 2.233 60.455 8.667-10.627 16.056-32.535 21.023-56.754 24.295 2.32 49.352-.082 73.854-7.785 10.018 22.885 21.83 42.907 32.146 51.193 2.192-13.53-2.36-36.185-10.16-59.63 23.44-10.708 43.72-25.754 60.252-43.812 20.11 14.802 40.34 26.226 53.41 28.243-4.868-12.818-20.142-30.167-38.627-46.576 14.454-20.42 24.734-43.56 30.2-67.972 24.82 2.764 48.062 2.546 60.395-2.24-10.62-8.66-32.507-16.04-56.703-21.006 2.314-24.306-.094-49.373-7.81-73.882 22.872-10.016 42.883-21.824 51.166-32.135-2.085-.338-4.385-.515-6.872-.545-13.65-.167-32.907 4.112-52.73 10.705-10.695-23.394-25.72-43.64-43.74-60.15 14.836-20.365 26.175-40.765 28.142-53.512-12.092 4.594-29.603 20.027-46.353 38.808-20.437-14.5-43.61-24.818-68.06-30.303 2.674-25.076 2.296-48.44-2.376-60.473zm-37.032 74.545c1.378.012 2.753.04 4.127.086 2.966.098 5.92.276 8.865.53-1.01 6.593-1.837 13.192-2.447 19.642-2.382-.196-4.77-.356-7.168-.438-1.214-.04-2.43-.066-3.646-.078-14.618-.138-29.444 1.886-44.04 6.255-1.93-6.155-4.115-12.405-6.47-18.603 16.837-5.148 33.936-7.536 50.778-7.395zm36.926 4.42c20.965 4.893 40.844 13.743 58.506 26.055-4.18 5.213-8.204 10.524-11.963 15.814-15.226-10.483-32.288-18.078-50.262-22.394 1.416-6.336 2.655-12.886 3.72-19.475zm-110.326 11.68c2.41 6.177 4.977 12.27 7.658 18.127-17.103 8.11-32.037 19.16-44.432 32.29-4.764-4.38-9.797-8.713-14.953-12.915 14.34-15.316 31.735-28.155 51.728-37.503zm73.047 22.287c1.065.01 2.13.03 3.19.066 2.196.072 4.38.22 6.56.403-.394 15.126.757 28.186 3.943 36.396 5.737-7.035 10.904-19.037 15.19-33.356 15.994 3.776 31.165 10.522 44.667 19.892-7.91 12.912-13.45 24.807-14.793 33.516 8.493-3.226 18.98-11.046 29.862-21.317 11.705 11.02 21.522 24.366 28.697 39.68-13.383 7.34-24.122 14.923-29.517 21.64 8.522 1.38 21.555-.222 36.377-3.777 4.914 16.198 6.533 32.702 5.196 48.74-1.52-.035-3.025-.06-4.498-.062-13.357-.026-24.705 1.234-31.95 4.047 6.7 5.463 18.812 10.602 33.455 14.937-3.765 16.077-10.545 31.324-19.96 44.89-13.068-7.938-25.02-13.45-33.545-14.765 3.07 8.082 10.99 18.586 21.502 29.663-11.06 11.787-24.465 21.674-39.866 28.884-7.34-13.382-14.923-24.11-21.638-29.504-1.38 8.518.22 21.544 3.77 36.358-16.197 4.91-32.7 6.523-48.735 5.182.338-15.28-.865-28.377-3.986-36.415-5.46 6.694-10.59 18.795-14.925 33.422-16.075-3.767-31.318-10.548-44.88-19.96 7.925-13.056 13.425-24.995 14.74-33.512-8.073 3.066-18.565 10.974-29.63 21.47-11.742-11.016-21.6-24.36-28.804-39.687 13.263-7.21 23.97-14.725 29.475-21.578-2.083-.338-4.383-.515-6.87-.545-8.193-.1-18.406 1.4-29.55 4.04-4.9-16.19-6.51-32.68-5.17-48.706 15.12.392 28.176-.76 36.384-3.946-7.033-5.734-19.02-10.905-33.334-15.19 3.778-15.988 10.536-31.15 19.904-44.646 12.9 7.9 24.78 13.43 33.483 14.773-3.223-8.486-11.03-18.962-21.287-29.832 10.976-11.66 24.256-21.448 39.494-28.615 7.213 13.27 14.73 23.98 21.586 29.486 1.45-8.952-.07-21.912-3.512-36.437 12.928-3.92 26.052-5.743 38.977-5.636zm114.623 7.34c15.328 14.347 28.18 31.755 37.53 51.765-6.184 2.44-12.276 5.048-18.124 7.76-8.117-17.15-19.183-32.12-32.344-44.54 4.387-4.774 8.728-9.82 12.938-14.986zm-254.65 26.71c5.203 4.17 10.503 8.188 15.782 11.938-10.48 15.222-18.085 32.28-22.402 50.248-6.324-1.413-12.86-2.658-19.436-3.72 4.898-20.95 13.75-40.816 26.055-58.465zm138.704 30.413c-2.253.01-4.528.133-6.818.375-36.65 3.86-63.052 36.478-59.19 73.127 3.86 36.647 36.477 63.048 73.125 59.188 36.648-3.86 63.05-36.478 59.19-73.127-3.618-34.357-32.512-59.71-66.308-59.563zm162.164 17.258c6.455 21.126 8.57 42.665 6.793 63.587-6.606-.983-13.213-1.775-19.66-2.353 1.475-18.062-.323-36.618-5.776-54.816 6.157-1.92 12.42-4.08 18.642-6.42zM88.754 242.127c6.578 1.006 13.163 1.835 19.598 2.443-1.49 18.07.297 36.64 5.744 54.852-6.152 1.93-12.394 4.1-18.588 6.453-6.464-21.183-8.563-42.776-6.754-63.748zM403.03 291.13c6.33 1.422 12.875 2.69 19.474 3.782-4.874 20.98-13.716 40.877-26.018 58.557-5.238-4.163-10.572-8.156-15.877-11.886 10.51-15.283 18.122-32.412 22.42-50.455zm-280.708 29.716c8.15 17.197 19.268 32.205 32.49 44.642-4.382 4.753-8.736 9.766-12.966 14.916-15.383-14.375-28.274-31.83-37.65-51.9 6.178-2.41 12.27-4.978 18.126-7.658zm243.994 38.478c4.762 4.39 9.783 8.75 14.942 12.987-14.384 15.395-31.85 28.297-51.938 37.674-2.442-6.184-5.048-12.27-7.76-18.117 17.245-8.156 32.292-19.29 44.756-32.543zM172.55 379.78c15.276 10.507 32.4 18.12 50.436 22.42-1.422 6.323-2.69 12.86-3.78 19.45-20.97-4.878-40.852-13.72-58.52-26.017 4.154-5.232 8.14-10.557 11.863-15.854zm127.74 20.25c1.92 6.155 4.077 12.415 6.415 18.636-21.124 6.445-42.656 8.55-63.574 6.766.983-6.6 1.77-13.198 2.347-19.64 18.06 1.48 36.614-.312 54.812-5.76z"
							fill="#ffffff" transform="rotate(30, 256, 256)">
							</path>
						</g>
					</svg>
				`,
				start: [
					[0, 0, 0],
					[0, 0, 2],
					[1, 6, 5],
					[1, 6, 6],
					[1, 6, 7],
					[1, 7, 5],
					[1, 7, 6],
					[1, 7, 7],
				],
				attackingBldg: [1, 3, 4],

				buildings: [
					{
						name: 'Командный центр',
						tier: 1,
						class: 'b_1_0',
						sizeX: 2,
						sizeY: 2,
						HTML: `
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
				`,
						foundationHTML: `
					<div class="foundation_2x2">
						<div class="f_0_0"></div>
						<div class="f_1_0"></div>
						<div class="f_0_1"></div>
						<div class="f_1_1"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '0');
						},

						onPlaceAction(bldg, player, enemy) {
							// Игрок учеличивает число своих максимальных действий за ход
							if (player.actionsTotal < 8) player.actionsTotal++;
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[0][`b1_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля игрока
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_2x2')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
							});

							// Количество максимальных действий игрока за ход уменьшается на 1
							player.actionsTotal--;
						},
					},

					{
						name: 'Ракета',
						tier: 1,
						class: 'b_1_1',
						sizeX: 1,
						sizeY: 1,
						HTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>
	
					<div class="lvl_1"></div>
					<div class="lvl_2"></div>
					<div class="lvl_3"></div>
				`,
						foundationHTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '1');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];
							// Находим клетку поля под ракетой
							let cellWithRocket = bldg.querySelector('.foundation_1x1').firstElementChild.cell;

							// Вешаем на нее слушатель на готовность к атаке
							cellWithRocket.addEventListener('mousedown', attackAction);
							function attackAction(event) {
								event.target.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0) return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								// Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', () => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем 
									if (!cellBelowAim || cellBelowAim.dataset.status !== 'building') return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля
									// Клетка здания уничтожена
									cellBelowAim.status.dataset.destroy = 'true';

									// Удаляем элемент фундамента атакованного здания из хэша в объекте противника
									const attackedBldgElem = cellBelowAim.status.parentElement.parentElement;
									const attackedBldgNum = +attackedBldgElem.className[4];
									const attackedBldgX = attackedBldgElem.dataset.coordinates[1];
									const attackedBldgY = attackedBldgElem.dataset.coordinates[4];
									const enemyObjBldg = enemy.buildingsOnBoard[attackedBldgNum][`b${attackedBldgNum}_X${attackedBldgX}_Y${attackedBldgY}`];
									delete enemyObjBldg.unbrokenFndtElems[`f${attackedBldgNum}_X${cellBelowAim.id[7]}_Y${cellBelowAim.id[9]}`];
									// Если это был последний фундамент этого здания - уничтожить здание
									if (Object.keys(enemyObjBldg.unbrokenFndtElems).length === 0) {
										enemy.race.buildings[attackedBldgNum].onDestroyAction(attackedBldgElem, enemy, player);
									}

									// Статус клеток полей back и front также crater
									cellBelowAim.status = 'crater';
									cellBelowAim.dataset.status = 'crater';
									document.getElementById(cellBelowAim.id.replace('f', 'b')).dataset.status = 'crater';

									// При успешной атаке уничтожаем саму ракету
									bldgModel.onDestroyAction(bldg, player, enemy);
									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									cellWithRocket.removeEventListener('mousedown', attackAction);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									$aim.hidden = true;
									cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} [data-status="building"]`);
									if (cellBelowAim) {
										$aim.classList.add('on-target');
										let cellBelowCoord = cellBelowAim.getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}

							}
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[1][`b1_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статус клеток под ним на кратер
							bldg.remove();
							const cellBelow = bldg.querySelector('.foundation_1x1').firstElementChild.cell;
							cellBelow.status = 'crater';
							cellBelow.dataset.status = 'crater';
							document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
						},
					},

					{
						name: 'Научный центр',
						tier: 1,
						class: 'b_1_2',
						sizeX: 2,
						sizeY: 2,
						HTML: `
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
				`,
						foundationHTML: `
					<div class="foundation_2x2">
						<div class="f_0_0"></div>
						<div class="f_1_0"></div>
						<div class="f_0_1"></div>
						<div class="f_1_1"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '0' ||
								nearCell.status.closest('.b__').className[4] === '2');
						},

						onPlaceAction(bldg, player, enemy) {
							// Если это первый научный центр - повышаем тир игрока
							if (player.currentTier < 2) player.currentTier = 2;
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[2][`b2_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статусы клеток под ним на кратер
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_2x2')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
							});

							// Если уничтожен последний научный центр - снижаем тир тир игрока
							if (Object.keys(player.buildingsOnBoard[2]).length === 0) player.currentTier = 1;
						},
					},

					{
						name: 'Сейсмобомба',
						tier: 2,
						class: 'b_1_3',
						sizeX: 1,
						sizeY: 1,
						HTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
					<div class="lvl_2"></div>
					<div class="lvl_3"></div>
				`,
						foundationHTML: `
					<div class="foundation_1x1">
						<div class="f_0_0"></div>
					</div>

					<div class="lvl_1"></div>
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '2' ||
								nearCell.status.closest('.b__').className[4] === '3');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];
							// Находим клетку поля под ракетой
							let cellWithRocket = bldg.querySelector('.foundation_1x1').firstElementChild.cell;

							// Вешаем на нее слушатель на готовность к атаке
							cellWithRocket.addEventListener('mousedown', attackAction);
							function attackAction(event) {
								event.target.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0) return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								// Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', () => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем 
									if (!cellBelowAim) return;
									if (cellBelowAim.dataset.status !== 'empty' && !cellBelowAim.classList.contains('fndtElem')) return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля
									if (cellBelowAim.dataset.status === 'empty') {
										// Статус клеток полей back и front также crater
										cellBelowAim.status = 'crater';
										cellBelowAim.dataset.status = 'crater';
										cellBelowAim.back.dataset.status = 'crater';
									}
									// Если цель атаки - фундамент, уничтожаем фундамент и заменяем кратерами
									if (cellBelowAim.classList.contains('fndtElem')) {
										let targetFndtElem = cellBelowAim.parentElement.parentElement;
										let fndtCells = Array.from(cellBelowAim.parentElement.children).map((fndtElem) => fndtElem.cell);
										fndtCells.forEach((fndtCell) => {
											fndtCell.status = 'crater';
											fndtCell.dataset.status = 'crater';
											fndtCell.back.dataset.status = 'crater';
										})
										targetFndtElem.remove();

										// Противник больше не имеет фундамента, может строить новый
										enemy.foundationOnBoard = false;
									}

									// При успешной атаке уничтожаем саму ракету
									bldgModel.onDestroyAction(bldg, player, enemy);
									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									cellWithRocket.removeEventListener('mousedown', attackAction);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									$aim.hidden = true;
									cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} [data-status="empty"]`);
									if (!cellBelowAim) cellBelowAim = document.elementFromPoint(event.clientX, event.clientY).closest(`.player--${enemy.side} .fndtElem`);
									if (cellBelowAim) {
										$aim.classList.add('on-target');
										let cellBelowCoord = cellBelowAim.getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}

							}
						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[3][`b3_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статус клеток под ним на кратер
							bldg.remove();
							const cellBelow = bldg.querySelector('.foundation_1x1').firstElementChild.cell;
							cellBelow.status = 'crater';
							cellBelow.dataset.status = 'crater';
							document.getElementById(cellBelow.id.replace('f', 'b')).dataset.status = 'crater';
						},
					},

					{
						name: 'Ионная пушка',
						tier: 2,
						class: 'b_1_4',
						sizeX: 3,
						sizeY: 3,
						HTML: `
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
				`,
						foundationHTML: `
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
				`,

						checkBelowCondition(foundationCell) {
							return (foundationCell.status === 'empty');
						},

						checkNearCondition(nearCell) {
							if (typeof nearCell.status === 'string') return false;
							return (nearCell.status.closest('.b__').className[4] === '2' ||
								nearCell.status.closest('.b__').className[4] === '4');
						},

						onPlaceAction(bldg, player, enemy) {
							const bldgNum = bldg.className[4];
							const bldgModel = player.race.buildings[bldgNum];

							// Находим клетки поля под ионной пушкой
							const launchCells = Array.from(bldg.firstElementChild.children).map((fndtCell) => fndtCell.cell);
							// И на каждую вешаем слушатель на начало атаки
							launchCells.forEach((launch) => launch.addEventListener('mousedown', attackAction));
							function attackAction(event) {
								let launchCell = event.target;
								launchCell.ondragstart = () => false;
								// Сработает только при наличии у игрока действий
								if (player.actionsLeft <= 0) return;

								switchTilt(false);

								// Создаем мишень и помещаем ее под курсор
								const $aim = document.createElement('div');
								$aim.classList.add('aim-big');
								document.body.append($aim);
								moveAt(event.pageX, event.pageY);

								// Слушатель на перетаскивание мишени
								let cellsBelowAim;
								document.addEventListener('mousemove', onMouseMove);

								//! Слушатель на drag-end c once: true при успешном срабатывании
								document.addEventListener('mouseup', (event) => {
									document.removeEventListener('mousemove', onMouseMove);
									switchTilt(true);
									$aim.remove();

									// Проверяем клетки под прицелом
									// Если невалидная - тогда ничего не делаем и прерываем
									if (!(cellsBelowAim.filter(cell => !!cell).length === 4 &&
										cellsBelowAim.filter(cell => (cell && cell.dataset.status === 'building')).length > 0)) return;

									// Иначе цель валидна - атака, -действие, уничтожение ракеты, убираем слушатель клетки поля

									// Удаляем элемент фундамента атакованного здания из хэша в объекте противника
									let targets = cellsBelowAim.filter(cell => cell.dataset.status === 'building');
									targets.forEach(cellBelowAim => {
										const attackedBldgElem = cellBelowAim.status.parentElement.parentElement;
										const attackedBldgNum = +attackedBldgElem.className[4];
										const attackedBldgX = attackedBldgElem.dataset.coordinates[1];
										const attackedBldgY = attackedBldgElem.dataset.coordinates[4];
										const enemyObjBldg = enemy.buildingsOnBoard[attackedBldgNum][`b${attackedBldgNum}_X${attackedBldgX}_Y${attackedBldgY}`];
										delete enemyObjBldg.unbrokenFndtElems[`f${attackedBldgNum}_X${cellBelowAim.id[7]}_Y${cellBelowAim.id[9]}`];
										// Если это был последний фундамент этого здания - уничтожить здание
										if (Object.keys(enemyObjBldg.unbrokenFndtElems).length === 0) {
											enemy.race.buildings[attackedBldgNum].onDestroyAction(attackedBldgElem, enemy, player);
										}

										// Статус клеток полей back и front также crater
										cellBelowAim.status = 'crater';
										cellBelowAim.dataset.status = 'crater';
										cellBelowAim.back.dataset.status = 'crater';
									});

									//!!! ТУТ ДОДЕЛАТЬ НА УНИЧТОЖЕНИЕ КЛЕТКИ И ЧЕК УНИЧТОЖЕНИЯ ЗДАНИЯ При успешной атаке уничтожаем саму ракету

									// Удаляем элемент фундамента ионной пушки, и если он последний - удаляем и ее
									const launchBldgElem = launchCell.status.parentElement.parentElement;
									const launchBldgX = launchBldgElem.dataset.coordinates[1];
									const launchBldgY = launchBldgElem.dataset.coordinates[4];
									const playerObjBldg = player.buildingsOnBoard[4][`b${4}_X${launchBldgX}_Y${launchBldgY}`];
									delete playerObjBldg.unbrokenFndtElems[`f${4}_X${launchCell.id[7]}_Y${launchCell.id[9]}`];
									// Если это был последний фундамент ионной пушки - уничтожить ее
									if (Object.keys(playerObjBldg.unbrokenFndtElems).length === 0) {
										player.race.buildings[4].onDestroyAction(launchBldgElem, player, enemy);
									}
									// Под уничтоженной клеткой фундамента оставляем кратер
									launchCell.status = 'crater';
									launchCell.dataset.status = 'crater';
									launchCell.back.dataset.status = 'crater';

									// Игрок тратит действие на атаку
									player.spendAction('attack');

									// Убираем слушатель с клетки-ракеты, она уничтожена
									launchCell.removeEventListener('mousedown', attackAction);

									// !!! TEST !!!
									console.log('Активный игрок');
									console.log(player);
									console.log('Пассивный игрок');
									console.log(enemy);

								}, { once: true });



								// ---------- Функции ----------
								function moveAt(pageX, pageY) {
									$aim.style.left = pageX - $aim.offsetWidth / 2 + 'px';
									$aim.style.top = pageY - $aim.offsetHeight / 2 + 'px';
								}

								function onMouseMove(event) {
									const halfAimSize = $aim.offsetWidth / 2;
									const quaterAimSize = $aim.offsetWidth / 4;
									$aim.hidden = true;
									// Находим массив из клеток поля противника под мишенью, если ячейки нету тогда вместо нее [null]
									cellsBelowAim = [
										document.elementFromPoint(event.clientX - quaterAimSize, event.clientY - quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX + quaterAimSize, event.clientY - quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX - quaterAimSize, event.clientY + quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
										document.elementFromPoint(event.clientX + quaterAimSize, event.clientY + quaterAimSize).closest(`.player--${enemy.side} .board__front td`),
									];

									// Если среди найденных клеток 4 (не выходит за границу поля), и среди них есть хоть одна со зданием - заххватить цель
									if (cellsBelowAim.filter(cell => !!cell).length === 4 &&
										cellsBelowAim.filter(cell => (cell && cell.dataset.status === 'building')).length > 0) {

										$aim.classList.add('on-target');
										let cellBelowCoord = cellsBelowAim[0].getBoundingClientRect();
										moveAt(cellBelowCoord.left, cellBelowCoord.top);
									} else {
										$aim.classList.remove('on-target');
										moveAt(event.pageX - halfAimSize, event.pageY - halfAimSize);
									}
									$aim.hidden = false;
								}
							}

						},

						onDestroyAction(bldg, player, enemy) {
							// Удаляем здание из хэша игрока
							const bldgCoordX = bldg.dataset.coordinates[1];
							const bldgCoordY = bldg.dataset.coordinates[4];
							delete player.buildingsOnBoard[4][`b4_X${bldgCoordX}_Y${bldgCoordY}`];

							// Убираем здание с поля и меняем статусы клеток под ним на кратер
							bldg.remove();
							const cellsBelow = Array.from(bldg.querySelectorAll('.foundation_3x3')).map(i => i.firstElementChild.cell);
							cellsBelow.forEach((cellBelow) => {
								cellBelow.status = 'crater';
								cellBelow.dataset.status = 'crater';
								cellBelow.back.dataset.status = 'crater';
							});
						},

					},
				]
			},
		};


		// Функция начала игры
		let playerL = null;
		let playerR = null;

		function startGame() {
			// Создаем поля
			const $boardL = new Board('left');
			const $boardR = new Board('right');
			// Размещаем их на странице
			$boardL.start(document.querySelector('.player--left .board__back'), document.querySelector('.player--left .board__front'));
			$boardR.start(document.querySelector('.player--right .board__back'), document.querySelector('.player--right .board__front'));

			// Получаем из хранилища данные игроков и создаем их
			const playerLeftData = JSON.parse(sessionStorage.getItem('playerL'));
			const playerRightData = JSON.parse(sessionStorage.getItem('playerR'));
			playerL = new Player(playerLeftData.name);
			playerR = new Player(playerRightData.name);
			// Заполняем игровые зоны игроков 
			playerL.start($boardL, races[playerLeftData.race], playerR, 'left');
			playerR.start($boardR, races[playerRightData.race], playerL, 'right');

			// Выбираем первого игрока
			let firstPlayer = (Math.random() > 0.5) ? playerL : playerR;
			firstPlayer.status = 'active';
			firstPlayer.prepareForRound();
			showMessage(`${firstPlayer.name} начинает игру`, 3, firstPlayer.side, 'race' + firstPlayer.race.num)
			setTimeout(() => {
				showMessage(`У вас два действия. Постройте здание или атакуйте противника`, 3, firstPlayer.side, 'race' + firstPlayer.race.num)
			}, 3000);

			document.querySelector(`.player--${firstPlayer.side}`).classList.add('active');
		}

		startGame();



		// ---------- Функции ----------

		// Выводит сообщение в строку под полями
		function showMessage(message, timeSec = 10, side, icon) {
			clearTimeout(timeout);
			const $messageCont = document.querySelector('.game-state');
			if (!$messageCont) return;

			const $messageField = $messageCont.querySelector('.game-state__message');
			const $messageIconL = $messageCont.querySelector('.game-state__icon--left');
			const $messageIconR = $messageCont.querySelector('.game-state__icon--right');

			const icons = {
				race1: races.race1.logo,
				race2: races.race2.logo,
				race3: races.race3.logo,
				build: '<svg viewBox="0 0 512 512"><g><path d="M241.406 21l-15.22 34.75c-7.864.478-15.703 1.472-23.467 2.97l-23.282-30.064-25.094 8.532-.125 38.25c-10.63 5.464-20.817 12.07-30.44 19.78L88.313 79.25 70.156 98.563 88.312 133c-5.852 8.346-10.925 17.072-15.218 26.094l-38.938 1.062-7.906 25.28 31.438 23.158c-1.505 9.38-2.24 18.858-2.282 28.344L20.5 254.625l3.656 26.25 38.313 7.5c2.284 7.982 5.107 15.826 8.5 23.5L45.72 343.22l14.093 22.436 39.25-9.187c2.47 2.895 5.037 5.757 7.718 8.53 5.643 5.835 11.565 11.206 17.72 16.125l-7.625 39.313 22.938 13.25 29.968-26.094c8.606 3.462 17.435 6.23 26.407 8.312l9.782 38.406 26.405 2.157 15.875-36.22c10.97-.66 21.904-2.3 32.656-4.938l25.22 29.22 24.593-9.844-.72-14.813-57.406-43.53c-16.712 4.225-34.042 5.356-51.063 3.436-31.754-3.58-62.27-17.92-86.218-42.686-54.738-56.614-53.173-146.67 3.438-201.406 27.42-26.513 62.69-39.963 98-40.344 37.59-.406 75.214 13.996 103.438 43.187 45.935 47.512 52.196 118.985 19.562 173.095l31.97 24.25c3.997-6.28 7.594-12.75 10.75-19.375l38.655-1.063 7.906-25.28-31.217-23c1.513-9.457 2.262-19.035 2.28-28.594l34.688-17.625-3.655-26.25-38.28-7.5c-3.196-10.993-7.444-21.762-12.75-32.125l22.81-31.594-15.25-21.657-37.56 10.906c-.472-.5-.93-1.007-1.408-1.5-5.998-6.205-12.33-11.89-18.937-17.064l7.188-37.125L334 43.78l-28.5 24.814c-9.226-3.713-18.702-6.603-28.313-8.75l-9.343-36.688L241.406 21zM183.25 174.5c-10.344.118-20.597 2.658-30 7.28l45.22 34.314c13.676 10.376 17.555 30.095 7.06 43.937-10.498 13.85-30.656 15.932-44.53 5.408l-45.188-34.282c-4.627 24.793 4.135 51.063 25.594 67.344 19.245 14.597 43.944 17.33 65.22 9.688l4.78-1.72 4.03 3.063 135.19 102.564 4.03 3.062-.344 5.063c-1.637 22.55 7.59 45.61 26.844 60.217 21.46 16.28 49.145 17.63 71.78 6.5l-45.186-34.28c-13.874-10.526-17.282-30.506-6.78-44.344 10.5-13.84 30.537-15.405 44.217-5.032l45.188 34.283c4.616-24.784-4.11-51.067-25.563-67.344-19.313-14.658-43.817-17.562-64.968-10.033l-4.75 1.688-4.03-3.063-135.19-102.562-4.03-3.063.344-5.03c1.55-22.387-7.85-45.194-27.157-59.845-12.544-9.516-27.222-13.978-41.78-13.812zm43.563 90.25l163.875 124.344L379.406 404 215.5 279.625l11.313-14.875z" fill="rgb(0, 70, 100)"></path></g></svg>',
				attack: '<svg viewBox="0 0 512 512"><g><path d="M247 32v23.21C143.25 59.8 59.798 143.25 55.21 247H32v18h23.21C59.8 368.75 143.25 452.202 247 456.79V480h18v-23.21C368.75 452.2 452.202 368.75 456.79 265H480v-18h-23.21C452.2 143.25 368.75 59.798 265 55.21V32h-18zm0 41.223V128h18V73.223C359 77.76 434.24 153 438.777 247H384v18h54.777C434.24 359 359 434.24 265 438.777V384h-18v54.777C153 434.24 77.76 359 73.223 265H128v-18H73.223C77.76 153 153 77.76 247 73.223zM247 224v23h-23v18h23v23h18v-23h23v-18h-23v-23h-18z" fill="rgb(0, 70, 100)"></path></g></svg>',
			}

			$messageField.innerHTML = message;
			if (side && icon) {
				if (side === 'left') $messageIconL.innerHTML = icons[icon];
				if (side === 'right') $messageIconR.innerHTML = icons[icon];
			}

			timeout = setTimeout(() => {
				$messageField.innerHTML = '';
				$messageIconL.innerHTML = '';
				$messageIconR.innerHTML = '';
			}, timeSec * 1000);
		}


		// Отключает срабатывание поведения tilt
		function switchTilt(state) {
			let boards = Array.from(document.querySelectorAll('.board'));
			let glares = Array.from(document.querySelectorAll('.board .js-tilt-glare'));
			if (state) {
				boards.forEach((div) => div.classList.remove('tilt-off'));
				glares.forEach((div) => div.classList.remove('display-none'));
			} else {
				boards.forEach((div) => div.classList.add('tilt-off'));
				glares.forEach((div) => div.classList.add('display-none'));
			}
		}

	}
}

export default GamePage;
