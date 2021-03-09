(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? factory(require('firebase')) :
	typeof define === 'function' && define.amd ? define('index', ['firebase'], factory) :
	(global = typeof globalThis !== 'undefined' ? globalThis : global || self, factory(global.firebase));
}(this, (function (firebase) { 'use strict';

	function _interopDefaultLegacy (e) { return e && typeof e === 'object' && 'default' in e ? e : { 'default': e }; }

	var firebase__default = /*#__PURE__*/_interopDefaultLegacy(firebase);

	const tilt = (function () {

		class VanillaTilt {
			constructor(element, settings = {}) {
				if (!(element instanceof Node)) {
					throw ("Can't initialize VanillaTilt because " + element + " is not a Node.");
				}

				this.width = null;
				this.height = null;
				this.clientWidth = null;
				this.clientHeight = null;
				this.left = null;
				this.top = null;

				// for Gyroscope sampling
				this.gammazero = null;
				this.betazero = null;
				this.lastgammazero = null;
				this.lastbetazero = null;

				this.transitionTimeout = null;
				this.updateCall = null;
				this.event = null;

				this.updateBind = this.update.bind(this);
				this.resetBind = this.reset.bind(this);

				this.element = element;
				this.settings = this.extendSettings(settings);

				this.reverse = this.settings.reverse ? -1 : 1;
				this.glare = VanillaTilt.isSettingTrue(this.settings.glare);
				this.glarePrerender = VanillaTilt.isSettingTrue(this.settings["glare-prerender"]);
				this.fullPageListening = VanillaTilt.isSettingTrue(this.settings["full-page-listening"]);
				this.gyroscope = VanillaTilt.isSettingTrue(this.settings.gyroscope);
				this.gyroscopeSamples = this.settings.gyroscopeSamples;

				this.elementListener = this.getElementListener();

				if (this.glare) {
					this.prepareGlare();
				}

				if (this.fullPageListening) {
					this.updateClientSize();
				}

				this.addEventListeners();
				this.updateInitialPosition();
			}

			static isSettingTrue(setting) {
				return setting === "" || setting === true || setting === 1;
			}

			/**
			* Method returns element what will be listen mouse events
			* @return {Node}
			*/
			getElementListener() {
				if (this.fullPageListening) {
					return window.document;
				}

				if (typeof this.settings["mouse-event-element"] === "string") {
					const mouseEventElement = document.querySelector(this.settings["mouse-event-element"]);

					if (mouseEventElement) {
						return mouseEventElement;
					}
				}

				if (this.settings["mouse-event-element"] instanceof Node) {
					return this.settings["mouse-event-element"];
				}

				return this.element;
			}

			/**
			* Method set listen methods for this.elementListener
			* @return {Node}
			*/
			addEventListeners() {
				this.onMouseEnterBind = this.onMouseEnter.bind(this);
				this.onMouseMoveBind = this.onMouseMove.bind(this);
				this.onMouseLeaveBind = this.onMouseLeave.bind(this);
				this.onWindowResizeBind = this.onWindowResize.bind(this);
				this.onDeviceOrientationBind = this.onDeviceOrientation.bind(this);

				this.elementListener.addEventListener("mouseenter", this.onMouseEnterBind);
				this.elementListener.addEventListener("mouseleave", this.onMouseLeaveBind);
				this.elementListener.addEventListener("mousemove", this.onMouseMoveBind);

				if (this.glare || this.fullPageListening) {
					window.addEventListener("resize", this.onWindowResizeBind);
				}

				if (this.gyroscope) {
					window.addEventListener("deviceorientation", this.onDeviceOrientationBind);
				}
			}

			/**
			* Method remove event listeners from current this.elementListener
			*/
			removeEventListeners() {
				this.elementListener.removeEventListener("mouseenter", this.onMouseEnterBind);
				this.elementListener.removeEventListener("mouseleave", this.onMouseLeaveBind);
				this.elementListener.removeEventListener("mousemove", this.onMouseMoveBind);

				if (this.gyroscope) {
					window.removeEventListener("deviceorientation", this.onDeviceOrientationBind);
				}

				if (this.glare || this.fullPageListening) {
					window.removeEventListener("resize", this.onWindowResizeBind);
				}
			}

			destroy() {
				clearTimeout(this.transitionTimeout);
				if (this.updateCall !== null) {
					cancelAnimationFrame(this.updateCall);
				}

				this.reset();

				this.removeEventListeners();
				this.element.vanillaTilt = null;
				delete this.element.vanillaTilt;

				this.element = null;
			}

			onDeviceOrientation(event) {
				if (event.gamma === null || event.beta === null) {
					return;
				}

				this.updateElementPosition();

				if (this.gyroscopeSamples > 0) {
					this.lastgammazero = this.gammazero;
					this.lastbetazero = this.betazero;

					if (this.gammazero === null) {
						this.gammazero = event.gamma;
						this.betazero = event.beta;
					} else {
						this.gammazero = (event.gamma + this.lastgammazero) / 2;
						this.betazero = (event.beta + this.lastbetazero) / 2;
					}

					this.gyroscopeSamples -= 1;
				}

				const totalAngleX = this.settings.gyroscopeMaxAngleX - this.settings.gyroscopeMinAngleX;
				const totalAngleY = this.settings.gyroscopeMaxAngleY - this.settings.gyroscopeMinAngleY;

				const degreesPerPixelX = totalAngleX / this.width;
				const degreesPerPixelY = totalAngleY / this.height;

				const angleX = event.gamma - (this.settings.gyroscopeMinAngleX + this.gammazero);
				const angleY = event.beta - (this.settings.gyroscopeMinAngleY + this.betazero);

				const posX = angleX / degreesPerPixelX;
				const posY = angleY / degreesPerPixelY;

				if (this.updateCall !== null) {
					cancelAnimationFrame(this.updateCall);
				}

				this.event = {
					clientX: posX + this.left,
					clientY: posY + this.top,
				};

				this.updateCall = requestAnimationFrame(this.updateBind);
			}

			onMouseEnter() {
				this.updateElementPosition();
				this.element.style.willChange = "transform";
				this.setTransition();
			}

			onMouseMove(event) {
				if (this.updateCall !== null) {
					cancelAnimationFrame(this.updateCall);
				}

				this.event = event;
				this.updateCall = requestAnimationFrame(this.updateBind);
			}

			onMouseLeave() {
				this.setTransition();

				if (this.settings.reset) {
					requestAnimationFrame(this.resetBind);
				}
			}

			reset() {
				this.event = {
					clientX: this.left + this.width / 2,
					clientY: this.top + this.height / 2
				};

				if (this.element && this.element.style) {
					this.element.style.transform = `perspective(${this.settings.perspective}px) ` +
						`rotateX(0deg) ` +
						`rotateY(0deg) ` +
						`scale3d(1, 1, 1)`;
				}

				this.resetGlare();
			}

			resetGlare() {
				if (this.glare) {
					this.glareElement.style.transform = "rotate(180deg) translate(-50%, -50%)";
					this.glareElement.style.opacity = "0";
				}
			}

			updateInitialPosition() {
				if (this.settings.startX === 0 && this.settings.startY === 0) {
					return;
				}

				this.onMouseEnter();

				if (this.fullPageListening) {
					this.event = {
						clientX: (this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.clientWidth,
						clientY: (this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.clientHeight
					};
				} else {
					this.event = {
						clientX: this.left + ((this.settings.startX + this.settings.max) / (2 * this.settings.max) * this.width),
						clientY: this.top + ((this.settings.startY + this.settings.max) / (2 * this.settings.max) * this.height)
					};
				}


				let backupScale = this.settings.scale;
				this.settings.scale = 1;
				this.update();
				this.settings.scale = backupScale;
				this.resetGlare();
			}

			getValues() {
				let x, y;

				if (this.fullPageListening) {
					x = this.event.clientX / this.clientWidth;
					y = this.event.clientY / this.clientHeight;
				} else {
					x = (this.event.clientX - this.left) / this.width;
					y = (this.event.clientY - this.top) / this.height;
				}

				x = Math.min(Math.max(x, 0), 1);
				y = Math.min(Math.max(y, 0), 1);

				let tiltX = (this.reverse * (this.settings.max - x * this.settings.max * 2)).toFixed(2);
				let tiltY = (this.reverse * (y * this.settings.max * 2 - this.settings.max)).toFixed(2);
				let angle = Math.atan2(this.event.clientX - (this.left + this.width / 2), -(this.event.clientY - (this.top + this.height / 2))) * (180 / Math.PI);

				return {
					tiltX: tiltX,
					tiltY: tiltY,
					percentageX: x * 100,
					percentageY: y * 100,
					angle: angle
				};
			}

			updateElementPosition() {
				let rect = this.element.getBoundingClientRect();

				this.width = this.element.offsetWidth;
				this.height = this.element.offsetHeight;
				this.left = rect.left;
				this.top = rect.top;
			}

			update() {
				let values = this.getValues();

				this.element.style.transform = "perspective(" + this.settings.perspective + "px) " +
					"rotateX(" + (this.settings.axis === "x" ? 0 : values.tiltY) + "deg) " +
					"rotateY(" + (this.settings.axis === "y" ? 0 : values.tiltX) + "deg) " +
					"scale3d(" + this.settings.scale + ", " + this.settings.scale + ", " + this.settings.scale + ")";

				if (this.glare) {
					this.glareElement.style.transform = `rotate(${values.angle}deg) translate(-50%, -50%)`;
					this.glareElement.style.opacity = `${values.percentageY * this.settings["max-glare"] / 100}`;
				}

				this.element.dispatchEvent(new CustomEvent("tiltChange", {
					"detail": values
				}));

				this.updateCall = null;
			}

			/**
			* Appends the glare element (if glarePrerender equals false)
			* and sets the default style
			*/
			prepareGlare() {
				// If option pre-render is enabled we assume all html/css is present for an optimal glare effect.
				if (!this.glarePrerender) {
					// Create glare element
					const jsTiltGlare = document.createElement("div");
					jsTiltGlare.classList.add("js-tilt-glare");

					const jsTiltGlareInner = document.createElement("div");
					jsTiltGlareInner.classList.add("js-tilt-glare-inner");

					jsTiltGlare.appendChild(jsTiltGlareInner);
					this.element.appendChild(jsTiltGlare);
				}

				this.glareElementWrapper = this.element.querySelector(".js-tilt-glare");
				this.glareElement = this.element.querySelector(".js-tilt-glare-inner");

				if (this.glarePrerender) {
					return;
				}

				Object.assign(this.glareElementWrapper.style, {
					"position": "absolute",
					"top": "0",
					"left": "0",
					"width": "100%",
					"height": "100%",
					"overflow": "hidden",
					"pointer-events": "none"
				});

				Object.assign(this.glareElement.style, {
					"position": "absolute",
					"top": "50%",
					"left": "50%",
					"pointer-events": "none",
					"background-image": `linear-gradient(0deg, rgba(255,255,255,0) 0%, rgba(255,255,255,1) 100%)`,
					"width": `${this.element.offsetWidth * 2}px`,
					"height": `${this.element.offsetWidth * 2}px`,
					"transform": "rotate(180deg) translate(-50%, -50%)",
					"transform-origin": "0% 0%",
					"opacity": "0",
				});
			}

			updateGlareSize() {
				if (this.glare) {
					Object.assign(this.glareElement.style, {
						"width": `${this.element.offsetWidth * 2}`,
						"height": `${this.element.offsetWidth * 2}`,
					});
				}
			}

			updateClientSize() {
				this.clientWidth = window.innerWidth
					|| document.documentElement.clientWidth
					|| document.body.clientWidth;

				this.clientHeight = window.innerHeight
					|| document.documentElement.clientHeight
					|| document.body.clientHeight;
			}

			onWindowResize() {
				this.updateGlareSize();
				this.updateClientSize();
			}

			setTransition() {
				clearTimeout(this.transitionTimeout);
				this.element.style.transition = this.settings.speed + "ms " + this.settings.easing;
				if (this.glare) this.glareElement.style.transition = `opacity ${this.settings.speed}ms ${this.settings.easing}`;

				this.transitionTimeout = setTimeout(() => {
					this.element.style.transition = "";
					if (this.glare) {
						this.glareElement.style.transition = "";
					}
				}, this.settings.speed);

			}

			/**
			* Method return patched settings of instance
			* @param {boolean} settings.reverse - reverse the tilt direction
			* @param {number} settings.max - max tilt rotation (degrees)
			* @param {startX} settings.startX - the starting tilt on the X axis, in degrees. Default: 0
			* @param {startY} settings.startY - the starting tilt on the Y axis, in degrees. Default: 0
			* @param {number} settings.perspective - Transform perspective, the lower the more extreme the tilt gets
			* @param {string} settings.easing - Easing on enter/exit
			* @param {number} settings.scale - 2 = 200%, 1.5 = 150%, etc..
			* @param {number} settings.speed - Speed of the enter/exit transition
			* @param {boolean} settings.transition - Set a transition on enter/exit
			* @param {string|null} settings.axis - What axis should be disabled. Can be X or Y
			* @param {boolean} settings.glare - What axis should be disabled. Can be X or Y
			* @param {number} settings.max-glare - the maximum "glare" opacity (1 = 100%, 0.5 = 50%)
			* @param {boolean} settings.glare-prerender - false = VanillaTilt creates the glare elements for you, otherwise
			* @param {boolean} settings.full-page-listening - If true, parallax effect will listen to mouse move events on the whole document, not only the selected element
			* @param {string|object} settings.mouse-event-element - String selector or link to HTML-element what will be listen mouse events
			* @param {boolean} settings.reset - false = If the tilt effect has to be reset on exit
			* @param {gyroscope} settings.gyroscope - Enable tilting by deviceorientation events
			* @param {gyroscopeSensitivity} settings.gyroscopeSensitivity - Between 0 and 1 - The angle at which max tilt position is reached. 1 = 90deg, 0.5 = 45deg, etc..
			* @param {gyroscopeSamples} settings.gyroscopeSamples - How many gyroscope moves to decide the starting position.
			*/
			extendSettings(settings) {
				let defaultSettings = {
					reverse: false,
					max: 15,
					startX: 0,
					startY: 0,
					perspective: 1000,
					easing: "cubic-bezier(.03,.98,.52,.99)",
					scale: 1,
					speed: 300,
					transition: true,
					axis: null,
					glare: false,
					"max-glare": 1,
					"glare-prerender": false,
					"full-page-listening": false,
					"mouse-event-element": null,
					reset: true,
					gyroscope: true,
					gyroscopeMinAngleX: -45,
					gyroscopeMaxAngleX: 45,
					gyroscopeMinAngleY: -45,
					gyroscopeMaxAngleY: 45,
					gyroscopeSamples: 10
				};

				let newSettings = {};
				for (let property in defaultSettings) {
					if (property in settings) {
						newSettings[property] = settings[property];
					} else if (this.element.hasAttribute("data-tilt-" + property)) {
						let attribute = this.element.getAttribute("data-tilt-" + property);
						try {
							newSettings[property] = JSON.parse(attribute);
						} catch (e) {
							newSettings[property] = attribute;
						}

					} else {
						newSettings[property] = defaultSettings[property];
					}
				}

				return newSettings;
			}

			static init(elements, settings) {
				if (elements instanceof Node) {
					elements = [elements];
				}

				if (elements instanceof NodeList) {
					elements = [].slice.call(elements);
				}

				if (!(elements instanceof Array)) {
					return;
				}

				elements.forEach((element) => {
					if (!("vanillaTilt" in element)) {
						element.vanillaTilt = new VanillaTilt(element, settings);
					}
				});
			}
		}

		if (typeof document !== "undefined") {
			/* expose the class to window */
			window.VanillaTilt = VanillaTilt;

			/**
			* Auto load
			*/
			VanillaTilt.init(document.querySelectorAll("[data-tilt]"));
		}

		return VanillaTilt;

	})();

	const HomePage = {
		id: 'home',
		title: 'Glass wars - главное меню',
		HTML: `
	<div class="game-title">
	<h1 class="game-title__description">Пошаговая стратегическая игра для двух пользователей</h1>

	<div class="game-title__glass" data-tilt data-tilt-full-page-listening data-tilt-glare data-tilt-reverse="true">
		Glass</div>
	<div class="game-title__wars" data-tilt data-tilt-full-page-listening data-tilt-glare>
		Wars</div>
</div>

<ul class="menu">
	<li class="menu__item">
		<a class="menu__link menu__link--rules" href="#rules">
			<svg class="menu__icon" viewBox="0 0 512 512">
				<rect fill="rgba(0, 70, 100)" fill-opacity="1" height="512" width="512" rx="100" ry="100"></rect>
				<g>
					<path d="M161.22 19.563l-2.5 5.375-106.44 225.5-1 2.093c-24.493 28.208-34.917 58.587-33.593 88.19 1.38 30.852 15.12 60.388 36.376 86.81l2.812 3.5h49.72c4.817-3.836 8.93-7.817 12.405-12.03 1.758-2.132 3.38-4.358 4.875-6.656H65.97c-17.813-23.187-28.526-47.848-29.626-72.438-1.123-25.11 7.337-50.594 29.937-76.125H498.157l-5.25-12.874-91.844-225.5-2.375-5.843H161.22zm11.843 18.687h177.343l52.656 41.594 38.407 94.28-58.845 70.94H75.47L173.062 38.25zM75.156 282.625c-15.31 18.98-20.975 37.778-20.125 56.438.84 18.398 8.276 36.95 20.5 54.468h57.19c4.392-13.517 6.344-29.847 6.78-50.436h-16.188v-18.688h16.313v-.187h115.749v.186h17.156v18.688h-17.25c-.287 17.8-1.447 34.638-4 50.437h221.626c-9.034-36.872-9.112-74.006-.03-110.905H75.155zm83 60.28c-.77 37.698-6.46 65.83-24.72 87.97-14.595 17.7-36.19 30.747-67.28 42.813 8.69 1.658 17.214 3.225 26.53 5.25 14.048 3.052 27.912 6.338 39.033 9.25 5.56 1.455 10.44 2.826 14.374 4.062 1.94.61 3.533 1.074 5.03 1.625 35.245-13.464 55.78-32.897 68.345-58.72 11.944-24.55 16.287-55.713 16.936-92.25h-78.25zm89.25 69.44c-1.632 6.425-3.532 12.668-5.812 18.686h257.03v-18.686H247.407z"
					fill="#ffffff"></path>
				</g>
			</svg>
			<span class="menu__text">Правила игры</span>
		</a>
	</li>

	<li class="menu__item">
		<a class="menu__link menu__link--game">
			<svg class="menu__icon" viewBox="0 0 512 512">
				<rect fill="rgba(0, 70, 100)" height="512" width="512" rx="100" ry="100"></rect>
				<g>
					<path d="M380.95 114.46c-62.946-13.147-63.32 32.04-124.868 32.04-53.25 0-55.247-44.675-124.87-32.04C17.207 135.072-.32 385.9 60.16 399.045c33.578 7.295 50.495-31.644 94.89-59.593a51.562 51.562 0 0 0 79.77-25.78 243.665 243.665 0 0 1 21.24-.91c7.466 0 14.44.32 21.126.898a51.573 51.573 0 0 0 79.82 25.717c44.45 27.95 61.367 66.93 94.955 59.626 60.47-13.104 42.496-260.845-71.01-284.543zM147.47 242.703h-26.144V216.12H94.73v-26.143h26.594v-26.593h26.144v26.582h26.582v26.144h-26.582v26.582zm38.223 89.615a34.336 34.336 0 1 1 34.337-34.336 34.336 34.336 0 0 1-34.325 34.346zm140.602 0a34.336 34.336 0 1 1 34.367-34.325 34.336 34.336 0 0 1-34.368 34.335zM349.98 220.36A17.323 17.323 0 1 1 367.3 203.04a17.323 17.323 0 0 1-17.323 17.323zm37.518 37.52a17.323 17.323 0 1 1 17.322-17.324 17.323 17.323 0 0 1-17.365 17.334zm0-75.048a17.323 17.323 0 1 1 17.322-17.323 17.323 17.323 0 0 1-17.365 17.333zm37.518 37.518a17.323 17.323 0 1 1 17.323-17.323 17.323 17.323 0 0 1-17.367 17.334z"
					fill="#ffffff"></path>
				</g>
			</svg>
			<span class="menu__text">Новая игра</span>
		</a>
	</li>

	<li class="menu__item">
		<a class="menu__link menu__link--players" href="#players">
			<svg class="menu__icon" viewBox="0 0 512 512">
				<rect fill="rgba(0, 70, 100)" height="512" width="512" rx="100" ry="100"></rect>
				<g>
					<path d="M137.273 41c1.41 59.526 16.381 119.035 35.125 167.77 19.69 51.191 44.086 90.988 57.965 104.867l2.637 2.636V343h46v-26.727l2.637-2.636c13.879-13.88 38.275-53.676 57.965-104.867 18.744-48.735 33.715-108.244 35.125-167.77zm-50.605 68.295c-17.97 6.05-32.296 18.214-37.625 30.367-3.015 6.875-3.48 13.44-.988 20.129.285.766.62 1.54.996 2.318a119.032 119.032 0 0 1 8.504-4.812l6.277-3.215 4.621 5.326c5.137 5.92 9.61 12.37 13.422 19.125 2.573-3.06 5.207-7.864 7.05-14.037 4.491-15.034 4.322-36.95-2.257-55.201zm338.664 0c-6.58 18.25-6.748 40.167-2.258 55.201 1.844 6.173 4.478 10.977 7.051 14.037 3.813-6.756 8.285-13.205 13.422-19.125l4.621-5.326 6.277 3.215a119.033 119.033 0 0 1 8.504 4.812c.375-.779.71-1.552.996-2.318 2.492-6.689 2.027-13.254-.988-20.129-5.329-12.153-19.655-24.317-37.625-30.367zm-365.975 67.74c-20.251 12.486-34.121 31.475-36.746 47.973-1.447 9.1.09 17.224 5.323 24.545 1.66 2.324 3.743 4.594 6.304 6.76a116.606 116.606 0 0 1 11.44-14.977l4.72-5.24 6.217 3.33c7.91 4.236 15.262 9.424 21.94 15.252.973-3.633 1.619-7.892 1.773-12.616.636-19.438-6.762-45.536-20.97-65.027zm393.286 0c-14.21 19.49-21.607 45.59-20.971 65.027.154 4.724.8 8.983 1.773 12.616 6.678-5.828 14.03-11.016 21.94-15.252l6.217-3.33 4.72 5.24a116.606 116.606 0 0 1 11.44 14.976c2.56-2.165 4.643-4.435 6.304-6.76 5.233-7.32 6.77-15.444 5.323-24.544-2.625-16.498-16.495-35.487-36.746-47.973zM54.4 259.133c-14.394 18.806-20.496 41.413-17.004 57.748 1.928 9.014 6.298 16.078 13.844 21.078 4.944 3.276 11.48 5.7 19.94 6.645a120.631 120.631 0 0 1 7.101-17.852l3.125-6.338 6.9 1.535c4.095.911 8.133 2.046 12.094 3.377-.373-3.838-1.309-8.185-2.925-12.82-6.416-18.396-22.749-40.184-43.075-53.373zm403.2 0c-20.326 13.189-36.66 34.977-43.075 53.373-1.616 4.635-2.552 8.982-2.925 12.82a119.337 119.337 0 0 1 12.093-3.377l6.9-1.535 3.126 6.338a120.63 120.63 0 0 1 7.101 17.852c8.46-.944 14.996-3.37 19.94-6.645 7.546-5 11.916-12.065 13.844-21.078 3.492-16.335-2.61-38.942-17.004-57.748zM91.5 341.527c-9.285 23.14-9.027 47.85-.709 63.54 4.57 8.619 11.106 14.607 20.268 17.562 4.586 1.479 9.957 2.19 16.185 1.803-2.135-11.155-2.771-22.97-1.756-34.938l.602-7.074 7.02-1.065a129.43 129.43 0 0 1 13.458-1.312c.554-.025 1.107-.04 1.66-.059-12.419-15.776-33.883-31.43-56.728-38.457zm329 0c-22.845 7.027-44.31 22.68-56.729 38.457.554.019 1.107.034 1.66.059 4.5.206 8.995.637 13.46 1.312l7.02 1.065.6 7.074c1.016 11.967.38 23.783-1.755 34.938 6.228.386 11.6-.324 16.185-1.803 9.162-2.955 15.699-8.943 20.268-17.563 8.318-15.69 8.576-40.4-.709-63.539zM199.729 361c-1.943 7.383-6.045 14.043-11.366 19.363a46.544 46.544 0 0 1-3.484 3.125c14.804 3.295 28.659 8.692 40.404 15.46 2.384-5.36 5.376-10.345 9.408-14.534C239.96 378.942 247.51 375 256 375c8.491 0 16.041 3.942 21.309 9.414 4.032 4.19 7.024 9.175 9.408 14.533 11.815-6.808 25.766-12.23 40.67-15.52a48.107 48.107 0 0 1-3.739-3.413c-5.227-5.333-9.27-11.852-11.261-19.014zM256 393c-3.434 0-5.635 1.084-8.34 3.895-2.704 2.81-5.395 7.52-7.527 13.298-4.265 11.556-6.343 27-7.156 38.446-1.07 15.043 3 33.368 12.285 40.06 4.733 3.412 16.743 3.412 21.476 0 9.285-6.692 13.355-25.017 12.285-40.06-.813-11.446-2.891-26.89-7.156-38.446-2.132-5.777-4.823-10.488-7.527-13.298-2.705-2.81-4.906-3.895-8.34-3.895zm-103.521 4.979c-1.714-.008-3.424.022-5.127.09-1.405.055-2.77.281-4.164.39-.418 27.817 9.816 53.543 24.994 66.644 8.264 7.134 17.586 10.772 28.35 10.157 5.908-.338 12.394-2.03 19.374-5.52-1.27-7.665-1.377-15.42-.883-22.379.632-8.89 1.852-19.962 4.479-30.877-17.16-10.686-42.426-18.395-67.023-18.506zm207.042 0c-24.597.11-49.863 7.82-67.023 18.505 2.627 10.915 3.847 21.987 4.479 30.877.494 6.958.387 14.714-.883 22.38 6.98 3.49 13.466 5.181 19.375 5.519 10.763.615 20.085-3.023 28.35-10.156 15.177-13.102 25.411-38.828 24.993-66.645-1.393-.109-2.76-.335-4.164-.39a116.32 116.32 0 0 0-5.127-.09z"
					fill="#ffffff"></path>
				</g>
			</svg>
			<span class="menu__text">Список игроков</span>
		</a>
	</li>
</ul>

<button class="music" id="musicBtn">
	<svg class="music__icon music__icon--on" viewBox="0 0 512 512">
		<rect fill="rgba(0, 70, 100)" height="512" width="512" rx="100" ry="100"></rect>
		<g>
			<path d="M275.5 96l-96 96h-96v128h96l96 96V96zm51.46 27.668l-4.66 17.387c52.066 13.95 88.2 61.04 88.2 114.945 0 53.904-36.134 100.994-88.2 114.945l4.66 17.387C386.81 372.295 428.5 317.962 428.5 256c0-61.963-41.69-116.295-101.54-132.332zm-12.425 46.365l-4.658 17.387C340.96 195.748 362.5 223.822 362.5 256s-21.54 60.252-52.623 68.58l4.658 17.387C353.402 331.552 380.5 296.237 380.5 256c0-40.238-27.098-75.552-65.965-85.967zm-12.424 46.363l-4.657 17.387C307.55 236.49 314.5 245.547 314.5 256s-6.95 19.51-17.047 22.217l4.658 17.387c17.884-4.792 30.39-21.09 30.39-39.604 0-18.513-12.506-34.812-30.39-39.604z"
			fill="#fff"></path>
		</g>
	</svg>
	<svg class="music__icon music__icon--off display-none" viewBox="0 0 512 512">
		<rect fill="rgba(0, 70, 100)" height="512" width="512" rx="100" ry="100"></rect>
		<g>
			<path d="M275.5 96l-96 96h-96v128h96l96 96V96zm50.863 89.637l-12.726 12.726L371.273 256l-57.636 57.637 12.726 12.726L384 268.727l57.637 57.636 12.726-12.726L396.727 256l57.636-57.637-12.726-12.726L384 243.273l-57.637-57.636z"
			fill="#fff"></path>
		</g>
	</svg>
</button>

<div class="auth">
	<div class="auth__container">
		<div class="auth__player auth__player--left">

			<h2 class="auth__title">Левый игрок</h2>

			<div class="auth__form form">
				<input class="form__input" type="text" id="inpNamePL" placeholder="имя" maxlength="10">
				<input class="form__input" type="email" id="inpEmailPL" placeholder="email">
				<input class="form__input" type="password" id="inpPassPL" placeholder="пароль">

				<div class="form__btns">
					<button class="form__btn form__btn--enter" id="btnEnterAccPL" disabled>Войти в аккаунт</button>
					<button class="form__btn" id="btnCreateAccPL" disabled>Создать аккаунт</button>
					<button class="form__btn" id="btnEnterGuestPL">Войти как гость</button>
				</div>

				<p class="form__error"></p>
			</div>

			<div class="auth__user user display-none">
				<h3 class="user__name"></h3>

				<input class="user__input-name" type="text" maxlength="10" placeholder="имя">

				<div class="user__races">
					<div class="user__race user__race--1 active">
						<svg class="user__race-icon" viewBox="0 0 512 512">
							<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(0, 0, 155)"></polygon>
							<g>
								<path d="M96.375 20.094l30.813 40.75 130.28 130.28L375.313 73.282l40.22-53.186-159.594 108.094L96.375 20.094zM452.22 59.53l-113.564 76.845-74.562 74.563-6.594 6.625-6.625-6.625L176.937 137 62.594 59.625l80.844 119.47 69.656 69.655 6.594 6.594-6.594 6.625-74.813 74.81L61.563 450.19l120.75-81.688 68.657-68.656 6.593-6.625 6.625 6.624 69.562 69.562 119.53 80.906-77.374-114.343-73.937-73.94-6.595-6.592 6.594-6.625 68.56-68.563 81.69-120.72zm-430 34.69l108.124 159.593L22.22 413.375l53.468-40.438L193.25 255.375 62.812 124.937 22.22 94.22zm470.624 3.155l-53.22 40.22-117.812 117.843 130.47 130.468 40.53 30.656L384.72 256.97 492.843 97.374zm-235.28 222.28l-117.69 117.69-40.343 53.342 159.595-108.093 159.563 108.094L388 450.094 257.562 319.656z"
								fill="#ffffff" transform="translate(25.6, 25.6) scale(0.9, 0.9) rotate(0, 256, 256)"></path>
							</g>
						</svg>
					</div>

					<div class="user__race user__race--2">
						<svg class="user__race-icon" viewBox="0 0 512 512">
							<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(130, 65, 0)"></polygon>
							<g>
								<path d="M331.924 20.385c-36.708.887-82.53 60.972-116.063 147.972h.003c30.564-65.57 71.17-106.39 97.348-99.378 28.058 7.516 37.11 69.42 24.847 148.405-.895-.32-1.773-.642-2.672-.96.893.367 1.765.738 2.65 1.106-2.988 19.215-7.22 39.424-12.767 60.12-2.77 10.332-5.763 20.39-8.936 30.14-24.996-3.82-52.374-9.537-80.82-17.16-105.856-28.36-186.115-72.12-179.307-97.53 4.257-15.884 42.167-23.775 95.908-20.29-74.427-8.7-128.912-2.044-135.035 20.803-9.038 33.73 89.168 89.372 219.147 124.2 24.436 6.55 48.267 11.897 70.918 16.042-28.965 75.878-68.293 126.078-96.653 118.48-21.817-5.85-35.995-45.443-36.316-100.206-4.79 75.476 9.278 131.945 40.66 140.356 38.836 10.407 91.394-54.998 127.896-152.98 80.12 10.74 138.958 4.278 145.38-19.682 6.384-23.82-41.025-58.44-115.102-89.03 20.713-109.022 8.483-198.5-31.96-209.34-2.968-.796-6.013-1.144-9.124-1.07zm40.568 213.086c44.65 22.992 71.146 47.135 67.07 62.348-4.055 15.13-38.104 20.457-87.333 16.303 3.415-10.604 6.64-21.502 9.63-32.663 4.176-15.588 7.713-30.965 10.632-45.986z"
								fill="#ffffff"></path>
							</g>
						</svg>
					</div>

					<div class="user__race user__race--3">
						<svg class="user__race-icon" viewBox="0 0 512 512">
							<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(155, 0, 50)"></polygon>
							<g>
								<path d="M296.03 12.742c-8.175 10.024-15.62 32.142-20.735 56.78-3.86-.373-7.738-.633-11.63-.764-1.526-.052-3.054-.086-4.583-.1-19.25-.178-38.79 2.634-57.988 8.69-10.223-23.05-22.23-43.093-32.293-51.176-2.068 12.775 2.546 35.67 10.442 59.578-23.396 10.692-43.644 25.71-60.156 43.73-20.387-14.86-40.818-26.22-53.58-28.19 4.598 12.105 20.058 29.64 38.865 46.405-14.49 20.423-24.804 43.577-30.294 68.008-10.005-1.068-19.74-1.653-28.59-1.67-13.356-.026-24.705 1.234-31.95 4.047 10.033 8.18 32.178 15.633 56.84 20.748-2.36 24.396.04 49.565 7.79 74.172-23.062 10.225-43.112 22.24-51.2 32.31 12.78 2.068 35.683-2.55 59.596-10.45 10.705 23.446 25.752 43.734 43.81 60.27-14.82 20.13-26.266 40.39-28.286 53.474 12.83-4.873 30.2-20.173 46.623-38.682 20.405 14.446 43.53 24.724 67.93 30.193-2.772 24.845-2.557 48.113 2.233 60.455 8.667-10.627 16.056-32.535 21.023-56.754 24.295 2.32 49.352-.082 73.854-7.785 10.018 22.885 21.83 42.907 32.146 51.193 2.192-13.53-2.36-36.185-10.16-59.63 23.44-10.708 43.72-25.754 60.252-43.812 20.11 14.802 40.34 26.226 53.41 28.243-4.868-12.818-20.142-30.167-38.627-46.576 14.454-20.42 24.734-43.56 30.2-67.972 24.82 2.764 48.062 2.546 60.395-2.24-10.62-8.66-32.507-16.04-56.703-21.006 2.314-24.306-.094-49.373-7.81-73.882 22.872-10.016 42.883-21.824 51.166-32.135-2.085-.338-4.385-.515-6.872-.545-13.65-.167-32.907 4.112-52.73 10.705-10.695-23.394-25.72-43.64-43.74-60.15 14.836-20.365 26.175-40.765 28.142-53.512-12.092 4.594-29.603 20.027-46.353 38.808-20.437-14.5-43.61-24.818-68.06-30.303 2.674-25.076 2.296-48.44-2.376-60.473zm-37.032 74.545c1.378.012 2.753.04 4.127.086 2.966.098 5.92.276 8.865.53-1.01 6.593-1.837 13.192-2.447 19.642-2.382-.196-4.77-.356-7.168-.438-1.214-.04-2.43-.066-3.646-.078-14.618-.138-29.444 1.886-44.04 6.255-1.93-6.155-4.115-12.405-6.47-18.603 16.837-5.148 33.936-7.536 50.778-7.395zm36.926 4.42c20.965 4.893 40.844 13.743 58.506 26.055-4.18 5.213-8.204 10.524-11.963 15.814-15.226-10.483-32.288-18.078-50.262-22.394 1.416-6.336 2.655-12.886 3.72-19.475zm-110.326 11.68c2.41 6.177 4.977 12.27 7.658 18.127-17.103 8.11-32.037 19.16-44.432 32.29-4.764-4.38-9.797-8.713-14.953-12.915 14.34-15.316 31.735-28.155 51.728-37.503zm73.047 22.287c1.065.01 2.13.03 3.19.066 2.196.072 4.38.22 6.56.403-.394 15.126.757 28.186 3.943 36.396 5.737-7.035 10.904-19.037 15.19-33.356 15.994 3.776 31.165 10.522 44.667 19.892-7.91 12.912-13.45 24.807-14.793 33.516 8.493-3.226 18.98-11.046 29.862-21.317 11.705 11.02 21.522 24.366 28.697 39.68-13.383 7.34-24.122 14.923-29.517 21.64 8.522 1.38 21.555-.222 36.377-3.777 4.914 16.198 6.533 32.702 5.196 48.74-1.52-.035-3.025-.06-4.498-.062-13.357-.026-24.705 1.234-31.95 4.047 6.7 5.463 18.812 10.602 33.455 14.937-3.765 16.077-10.545 31.324-19.96 44.89-13.068-7.938-25.02-13.45-33.545-14.765 3.07 8.082 10.99 18.586 21.502 29.663-11.06 11.787-24.465 21.674-39.866 28.884-7.34-13.382-14.923-24.11-21.638-29.504-1.38 8.518.22 21.544 3.77 36.358-16.197 4.91-32.7 6.523-48.735 5.182.338-15.28-.865-28.377-3.986-36.415-5.46 6.694-10.59 18.795-14.925 33.422-16.075-3.767-31.318-10.548-44.88-19.96 7.925-13.056 13.425-24.995 14.74-33.512-8.073 3.066-18.565 10.974-29.63 21.47-11.742-11.016-21.6-24.36-28.804-39.687 13.263-7.21 23.97-14.725 29.475-21.578-2.083-.338-4.383-.515-6.87-.545-8.193-.1-18.406 1.4-29.55 4.04-4.9-16.19-6.51-32.68-5.17-48.706 15.12.392 28.176-.76 36.384-3.946-7.033-5.734-19.02-10.905-33.334-15.19 3.778-15.988 10.536-31.15 19.904-44.646 12.9 7.9 24.78 13.43 33.483 14.773-3.223-8.486-11.03-18.962-21.287-29.832 10.976-11.66 24.256-21.448 39.494-28.615 7.213 13.27 14.73 23.98 21.586 29.486 1.45-8.952-.07-21.912-3.512-36.437 12.928-3.92 26.052-5.743 38.977-5.636zm114.623 7.34c15.328 14.347 28.18 31.755 37.53 51.765-6.184 2.44-12.276 5.048-18.124 7.76-8.117-17.15-19.183-32.12-32.344-44.54 4.387-4.774 8.728-9.82 12.938-14.986zm-254.65 26.71c5.203 4.17 10.503 8.188 15.782 11.938-10.48 15.222-18.085 32.28-22.402 50.248-6.324-1.413-12.86-2.658-19.436-3.72 4.898-20.95 13.75-40.816 26.055-58.465zm138.704 30.413c-2.253.01-4.528.133-6.818.375-36.65 3.86-63.052 36.478-59.19 73.127 3.86 36.647 36.477 63.048 73.125 59.188 36.648-3.86 63.05-36.478 59.19-73.127-3.618-34.357-32.512-59.71-66.308-59.563zm162.164 17.258c6.455 21.126 8.57 42.665 6.793 63.587-6.606-.983-13.213-1.775-19.66-2.353 1.475-18.062-.323-36.618-5.776-54.816 6.157-1.92 12.42-4.08 18.642-6.42zM88.754 242.127c6.578 1.006 13.163 1.835 19.598 2.443-1.49 18.07.297 36.64 5.744 54.852-6.152 1.93-12.394 4.1-18.588 6.453-6.464-21.183-8.563-42.776-6.754-63.748zM403.03 291.13c6.33 1.422 12.875 2.69 19.474 3.782-4.874 20.98-13.716 40.877-26.018 58.557-5.238-4.163-10.572-8.156-15.877-11.886 10.51-15.283 18.122-32.412 22.42-50.455zm-280.708 29.716c8.15 17.197 19.268 32.205 32.49 44.642-4.382 4.753-8.736 9.766-12.966 14.916-15.383-14.375-28.274-31.83-37.65-51.9 6.178-2.41 12.27-4.978 18.126-7.658zm243.994 38.478c4.762 4.39 9.783 8.75 14.942 12.987-14.384 15.395-31.85 28.297-51.938 37.674-2.442-6.184-5.048-12.27-7.76-18.117 17.245-8.156 32.292-19.29 44.756-32.543zM172.55 379.78c15.276 10.507 32.4 18.12 50.436 22.42-1.422 6.323-2.69 12.86-3.78 19.45-20.97-4.878-40.852-13.72-58.52-26.017 4.154-5.232 8.14-10.557 11.863-15.854zm127.74 20.25c1.92 6.155 4.077 12.415 6.415 18.636-21.124 6.445-42.656 8.55-63.574 6.766.983-6.6 1.77-13.198 2.347-19.64 18.06 1.48 36.614-.312 54.812-5.76z"
								fill="#ffffff" transform="rotate(30, 256, 256)"></path>
							</g>
						</svg>
					</div>
				</div>

				<div class="user__race-name">Империя</div>
			</div>
		</div>


		<div class="auth__player auth__player--right">
			<h2 class="auth__title">Правый игрок</h2>

			<div class="auth__form form">
				<input class="form__input" type="text" id="inpNamePR" placeholder="имя" maxlength="10">
				<input class="form__input" type="email" id="inpEmailPR" placeholder="email">
				<input class="form__input" type="password" id="inpPassPR" placeholder="пароль">

				<div class="form__btns">
					<button class="form__btn form__btn--enter" id="btnEnterAccPR" disabled>Войти в аккаунт</button>
					<button class="form__btn" id="btnCreateAccPR" disabled>Создать аккаунт</button>
					<button class="form__btn" id="btnEnterGuestPR">Войти как гость</button>
				</div>

				<p class="form__error"></p>
			</div>

			<div class="auth__user user display-none">
				<h3 class="user__name"></h3>

				<input class="user__input-name" type="text" maxlength="10" placeholder="имя">

				<div class="user__races">
					<div class="user__race user__race--1 active">
						<svg class="user__race-icon" viewBox="0 0 512 512">
							<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(0, 0, 155)"></polygon>
							<g>
								<path d="M96.375 20.094l30.813 40.75 130.28 130.28L375.313 73.282l40.22-53.186-159.594 108.094L96.375 20.094zM452.22 59.53l-113.564 76.845-74.562 74.563-6.594 6.625-6.625-6.625L176.937 137 62.594 59.625l80.844 119.47 69.656 69.655 6.594 6.594-6.594 6.625-74.813 74.81L61.563 450.19l120.75-81.688 68.657-68.656 6.593-6.625 6.625 6.624 69.562 69.562 119.53 80.906-77.374-114.343-73.937-73.94-6.595-6.592 6.594-6.625 68.56-68.563 81.69-120.72zm-430 34.69l108.124 159.593L22.22 413.375l53.468-40.438L193.25 255.375 62.812 124.937 22.22 94.22zm470.624 3.155l-53.22 40.22-117.812 117.843 130.47 130.468 40.53 30.656L384.72 256.97 492.843 97.374zm-235.28 222.28l-117.69 117.69-40.343 53.342 159.595-108.093 159.563 108.094L388 450.094 257.562 319.656z"
								fill="#ffffff" transform="translate(25.6, 25.6) scale(0.9, 0.9) rotate(0, 256, 256)"></path>
							</g>
						</svg>
					</div>

					<div class="user__race user__race--2">
						<svg class="user__race-icon" viewBox="0 0 512 512">
							<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(130, 65, 0)"></polygon>
							<g>
								<path d="M331.924 20.385c-36.708.887-82.53 60.972-116.063 147.972h.003c30.564-65.57 71.17-106.39 97.348-99.378 28.058 7.516 37.11 69.42 24.847 148.405-.895-.32-1.773-.642-2.672-.96.893.367 1.765.738 2.65 1.106-2.988 19.215-7.22 39.424-12.767 60.12-2.77 10.332-5.763 20.39-8.936 30.14-24.996-3.82-52.374-9.537-80.82-17.16-105.856-28.36-186.115-72.12-179.307-97.53 4.257-15.884 42.167-23.775 95.908-20.29-74.427-8.7-128.912-2.044-135.035 20.803-9.038 33.73 89.168 89.372 219.147 124.2 24.436 6.55 48.267 11.897 70.918 16.042-28.965 75.878-68.293 126.078-96.653 118.48-21.817-5.85-35.995-45.443-36.316-100.206-4.79 75.476 9.278 131.945 40.66 140.356 38.836 10.407 91.394-54.998 127.896-152.98 80.12 10.74 138.958 4.278 145.38-19.682 6.384-23.82-41.025-58.44-115.102-89.03 20.713-109.022 8.483-198.5-31.96-209.34-2.968-.796-6.013-1.144-9.124-1.07zm40.568 213.086c44.65 22.992 71.146 47.135 67.07 62.348-4.055 15.13-38.104 20.457-87.333 16.303 3.415-10.604 6.64-21.502 9.63-32.663 4.176-15.588 7.713-30.965 10.632-45.986z"
								fill="#ffffff"></path>
							</g>
						</svg>
					</div>

					<div class="user__race user__race--3">
						<svg class="user__race-icon" viewBox="0 0 512 512">
							<polygon points="384,477.7,128,477.7,0,256,128,34.3,384,34.3,512,256" fill="rgb(155, 0, 50)"></polygon>
							<g>
								<path d="M296.03 12.742c-8.175 10.024-15.62 32.142-20.735 56.78-3.86-.373-7.738-.633-11.63-.764-1.526-.052-3.054-.086-4.583-.1-19.25-.178-38.79 2.634-57.988 8.69-10.223-23.05-22.23-43.093-32.293-51.176-2.068 12.775 2.546 35.67 10.442 59.578-23.396 10.692-43.644 25.71-60.156 43.73-20.387-14.86-40.818-26.22-53.58-28.19 4.598 12.105 20.058 29.64 38.865 46.405-14.49 20.423-24.804 43.577-30.294 68.008-10.005-1.068-19.74-1.653-28.59-1.67-13.356-.026-24.705 1.234-31.95 4.047 10.033 8.18 32.178 15.633 56.84 20.748-2.36 24.396.04 49.565 7.79 74.172-23.062 10.225-43.112 22.24-51.2 32.31 12.78 2.068 35.683-2.55 59.596-10.45 10.705 23.446 25.752 43.734 43.81 60.27-14.82 20.13-26.266 40.39-28.286 53.474 12.83-4.873 30.2-20.173 46.623-38.682 20.405 14.446 43.53 24.724 67.93 30.193-2.772 24.845-2.557 48.113 2.233 60.455 8.667-10.627 16.056-32.535 21.023-56.754 24.295 2.32 49.352-.082 73.854-7.785 10.018 22.885 21.83 42.907 32.146 51.193 2.192-13.53-2.36-36.185-10.16-59.63 23.44-10.708 43.72-25.754 60.252-43.812 20.11 14.802 40.34 26.226 53.41 28.243-4.868-12.818-20.142-30.167-38.627-46.576 14.454-20.42 24.734-43.56 30.2-67.972 24.82 2.764 48.062 2.546 60.395-2.24-10.62-8.66-32.507-16.04-56.703-21.006 2.314-24.306-.094-49.373-7.81-73.882 22.872-10.016 42.883-21.824 51.166-32.135-2.085-.338-4.385-.515-6.872-.545-13.65-.167-32.907 4.112-52.73 10.705-10.695-23.394-25.72-43.64-43.74-60.15 14.836-20.365 26.175-40.765 28.142-53.512-12.092 4.594-29.603 20.027-46.353 38.808-20.437-14.5-43.61-24.818-68.06-30.303 2.674-25.076 2.296-48.44-2.376-60.473zm-37.032 74.545c1.378.012 2.753.04 4.127.086 2.966.098 5.92.276 8.865.53-1.01 6.593-1.837 13.192-2.447 19.642-2.382-.196-4.77-.356-7.168-.438-1.214-.04-2.43-.066-3.646-.078-14.618-.138-29.444 1.886-44.04 6.255-1.93-6.155-4.115-12.405-6.47-18.603 16.837-5.148 33.936-7.536 50.778-7.395zm36.926 4.42c20.965 4.893 40.844 13.743 58.506 26.055-4.18 5.213-8.204 10.524-11.963 15.814-15.226-10.483-32.288-18.078-50.262-22.394 1.416-6.336 2.655-12.886 3.72-19.475zm-110.326 11.68c2.41 6.177 4.977 12.27 7.658 18.127-17.103 8.11-32.037 19.16-44.432 32.29-4.764-4.38-9.797-8.713-14.953-12.915 14.34-15.316 31.735-28.155 51.728-37.503zm73.047 22.287c1.065.01 2.13.03 3.19.066 2.196.072 4.38.22 6.56.403-.394 15.126.757 28.186 3.943 36.396 5.737-7.035 10.904-19.037 15.19-33.356 15.994 3.776 31.165 10.522 44.667 19.892-7.91 12.912-13.45 24.807-14.793 33.516 8.493-3.226 18.98-11.046 29.862-21.317 11.705 11.02 21.522 24.366 28.697 39.68-13.383 7.34-24.122 14.923-29.517 21.64 8.522 1.38 21.555-.222 36.377-3.777 4.914 16.198 6.533 32.702 5.196 48.74-1.52-.035-3.025-.06-4.498-.062-13.357-.026-24.705 1.234-31.95 4.047 6.7 5.463 18.812 10.602 33.455 14.937-3.765 16.077-10.545 31.324-19.96 44.89-13.068-7.938-25.02-13.45-33.545-14.765 3.07 8.082 10.99 18.586 21.502 29.663-11.06 11.787-24.465 21.674-39.866 28.884-7.34-13.382-14.923-24.11-21.638-29.504-1.38 8.518.22 21.544 3.77 36.358-16.197 4.91-32.7 6.523-48.735 5.182.338-15.28-.865-28.377-3.986-36.415-5.46 6.694-10.59 18.795-14.925 33.422-16.075-3.767-31.318-10.548-44.88-19.96 7.925-13.056 13.425-24.995 14.74-33.512-8.073 3.066-18.565 10.974-29.63 21.47-11.742-11.016-21.6-24.36-28.804-39.687 13.263-7.21 23.97-14.725 29.475-21.578-2.083-.338-4.383-.515-6.87-.545-8.193-.1-18.406 1.4-29.55 4.04-4.9-16.19-6.51-32.68-5.17-48.706 15.12.392 28.176-.76 36.384-3.946-7.033-5.734-19.02-10.905-33.334-15.19 3.778-15.988 10.536-31.15 19.904-44.646 12.9 7.9 24.78 13.43 33.483 14.773-3.223-8.486-11.03-18.962-21.287-29.832 10.976-11.66 24.256-21.448 39.494-28.615 7.213 13.27 14.73 23.98 21.586 29.486 1.45-8.952-.07-21.912-3.512-36.437 12.928-3.92 26.052-5.743 38.977-5.636zm114.623 7.34c15.328 14.347 28.18 31.755 37.53 51.765-6.184 2.44-12.276 5.048-18.124 7.76-8.117-17.15-19.183-32.12-32.344-44.54 4.387-4.774 8.728-9.82 12.938-14.986zm-254.65 26.71c5.203 4.17 10.503 8.188 15.782 11.938-10.48 15.222-18.085 32.28-22.402 50.248-6.324-1.413-12.86-2.658-19.436-3.72 4.898-20.95 13.75-40.816 26.055-58.465zm138.704 30.413c-2.253.01-4.528.133-6.818.375-36.65 3.86-63.052 36.478-59.19 73.127 3.86 36.647 36.477 63.048 73.125 59.188 36.648-3.86 63.05-36.478 59.19-73.127-3.618-34.357-32.512-59.71-66.308-59.563zm162.164 17.258c6.455 21.126 8.57 42.665 6.793 63.587-6.606-.983-13.213-1.775-19.66-2.353 1.475-18.062-.323-36.618-5.776-54.816 6.157-1.92 12.42-4.08 18.642-6.42zM88.754 242.127c6.578 1.006 13.163 1.835 19.598 2.443-1.49 18.07.297 36.64 5.744 54.852-6.152 1.93-12.394 4.1-18.588 6.453-6.464-21.183-8.563-42.776-6.754-63.748zM403.03 291.13c6.33 1.422 12.875 2.69 19.474 3.782-4.874 20.98-13.716 40.877-26.018 58.557-5.238-4.163-10.572-8.156-15.877-11.886 10.51-15.283 18.122-32.412 22.42-50.455zm-280.708 29.716c8.15 17.197 19.268 32.205 32.49 44.642-4.382 4.753-8.736 9.766-12.966 14.916-15.383-14.375-28.274-31.83-37.65-51.9 6.178-2.41 12.27-4.978 18.126-7.658zm243.994 38.478c4.762 4.39 9.783 8.75 14.942 12.987-14.384 15.395-31.85 28.297-51.938 37.674-2.442-6.184-5.048-12.27-7.76-18.117 17.245-8.156 32.292-19.29 44.756-32.543zM172.55 379.78c15.276 10.507 32.4 18.12 50.436 22.42-1.422 6.323-2.69 12.86-3.78 19.45-20.97-4.878-40.852-13.72-58.52-26.017 4.154-5.232 8.14-10.557 11.863-15.854zm127.74 20.25c1.92 6.155 4.077 12.415 6.415 18.636-21.124 6.445-42.656 8.55-63.574 6.766.983-6.6 1.77-13.198 2.347-19.64 18.06 1.48 36.614-.312 54.812-5.76z"
								fill="#ffffff" transform="rotate(30, 256, 256)"></path>
							</g>
						</svg>
					</div>
				</div>

				<div class="user__race-name">Империя</div>
			</div>
		</div>

		<button class="auth__btn auth__btn--close">Закрыть</button>
		<button class="auth__btn auth__btn--start" disabled>Начать</button>
	</div>
</div>
	`,

		render: function (container) {
			container.innerHTML = this.HTML;
		},

		start: function () {
			// Прячем хидер с навигацией, навигация по главному меню
			const $header = document.querySelector('.header');
			$header.classList.add('hidden');

			const $content = document.getElementById('content');

			// Слушатель на кнопку включения музыки
			const $musicBtn = $content.querySelector('.music');
			const $musicIconOn = $musicBtn.querySelector('.music__icon--on');
			const $musicIconOff = $musicBtn.querySelector('.music__icon--off');
			$musicBtn.addEventListener('click', () => {
				$musicIconOn.classList.toggle('display-none');
				$musicIconOff.classList.toggle('display-none');
			});

			// Слушатель на кнопку Новая игра - вызов окна авторизации
			const $newGameBtn = $content.querySelector('.menu__link--game');
			const $authBlock = $content.querySelector('.auth');
			const $authCloseBtn = $content.querySelector('.auth__btn--close');
			const $authStartBtn = $content.querySelector('.auth__btn--start');
			$newGameBtn.addEventListener('click', () => $authBlock.classList.add('show'));
			$authCloseBtn.addEventListener('click', () => $authBlock.classList.remove('show'));
			$authStartBtn.addEventListener('click', () => window.location.hash = '#game');



			//! Получение имени игроков по авторизации или как гостя и выбор расы
			let playerLeft = {
				name: '',
				race: 'race1',
				hasAccount: false,
			};

			let playerRight = {
				name: '',
				race: 'race1',
				hasAccount: false,
			};


			// --------------------- Левый игрок ---------------------
			// Инпуты ввода имени, почты, пароля
			const $inpNamePL = document.getElementById('inpNamePL');
			const $inpEmailPL = document.getElementById('inpEmailPL');
			const $inpPassPL = document.getElementById('inpPassPL');

			// Кнопки управления формой и слушатели на них - новый аккаунт, войти в аккаунт и войти как гость
			const $btnEnterAccPL = document.getElementById('btnEnterAccPL');
			const $btnCreateAccPL = document.getElementById('btnCreateAccPL');
			const $btnEnterGuestPL = document.getElementById('btnEnterGuestPL');
			$btnEnterAccPL.addEventListener('click', enterAccount);
			$btnCreateAccPL.addEventListener('click', createAccount);
			$btnEnterGuestPL.addEventListener('click', enterAsGuest);

			const $authFormPL = $content.querySelector('.auth__player--left .auth__form');
			const $authUserPL = $content.querySelector('.auth__player--left .auth__user');
			// На фракции вешаем обработчики
			const racesToChooseL = Array.from($authUserPL.querySelectorAll('.user__race'));
			racesToChooseL.forEach((race) => {
				race.addEventListener('click', (event) => {
					let race = event.target.closest('.user__race');
					racesToChooseL.forEach(race => race.classList.remove('active'));
					race.classList.add('active');
					let playerLRaceNum = race.classList[1].slice(-1);

					const raceName = $authUserPL.querySelector('.user__race-name');
					if (playerLRaceNum === '1') raceName.innerHTML = 'Империя';
					if (playerLRaceNum === '2') raceName.innerHTML = 'Династия';
					if (playerLRaceNum === '3') raceName.innerHTML = 'Анклав';

					playerLeft.race = 'race' + playerLRaceNum;
					sessionStorage.setItem('playerL', JSON.stringify(playerLeft));
				});
			});

			const $userInpNamePL = $authUserPL.querySelector('.user__input-name');
			$userInpNamePL.addEventListener('input', (event) => {
				playerLeft.name = event.target.value;
				$authStartBtn.disabled = !($userInpNamePL.value && $userInpNamePR.value);
				sessionStorage.setItem('playerL', JSON.stringify(playerLeft));
			});


			// --------------------- Правый игрок ---------------------
			// Инпуты ввода имени, почты, пароля
			const $inpNamePR = document.getElementById('inpNamePR');
			const $inpEmailPR = document.getElementById('inpEmailPR');
			const $inpPassPR = document.getElementById('inpPassPR');

			// Кнопки управления формой и слушатели на них - новый аккаунт, войти в аккаунт и войти как гость
			const $btnEnterAccPR = document.getElementById('btnEnterAccPR');
			const $btnCreateAccPR = document.getElementById('btnCreateAccPR');
			const $btnEnterGuestPR = document.getElementById('btnEnterGuestPR');
			$btnEnterAccPR.addEventListener('click', enterAccount);
			$btnCreateAccPR.addEventListener('click', createAccount);
			$btnEnterGuestPR.addEventListener('click', enterAsGuest);

			const $authFormPR = $content.querySelector('.auth__player--right .auth__form');
			const $authUserPR = $content.querySelector('.auth__player--right .auth__user');
			// На фракции вешаем обработчики
			const racesToChooseR = Array.from($authUserPR.querySelectorAll('.user__race'));
			racesToChooseR.forEach((race) => {
				race.addEventListener('click', (event) => {
					let race = event.target.closest('.user__race');
					racesToChooseR.forEach(race => race.classList.remove('active'));
					race.classList.add('active');
					let playerRRaceNum = race.classList[1].slice(-1);

					const raceName = $authUserPR.querySelector('.user__race-name');
					if (playerRRaceNum === '1') raceName.innerHTML = 'Империя';
					if (playerRRaceNum === '2') raceName.innerHTML = 'Династия';
					if (playerRRaceNum === '3') raceName.innerHTML = 'Анклав';

					playerRight.race = 'race' + playerRRaceNum;
					sessionStorage.setItem('playerR', JSON.stringify(playerRight));
				});
			});

			const $userInpNamePR = $authUserPR.querySelector('.user__input-name');
			$userInpNamePR.addEventListener('input', (event) => {
				playerRight.name = event.target.value;
				$authStartBtn.disabled = !($userInpNamePL.value && $userInpNamePR.value);
				sessionStorage.setItem('playerR', JSON.stringify(playerRight));
			});


			// --------------------- Общий функционал ---------------------




			function enterAccount(event) {
				console.log('Войти в аккаунт');

				let userEmail = '';
				let userPass = '';

				const side = event.target.id.slice(-1).toLowerCase();
				if (side === 'l') {
					userEmail = $inpEmailPL.value;
					userPass = $inpPassPL.value;
				}
				if (side === 'r') {
					userEmail = $inpEmailPR.value;
					userPass = $inpPassPR.value;
				}

				firebase__default['default'].auth().signInWithEmailAndPassword(userEmail, userPass)
					.then(response => console.log(response))
					.catch(error => console.log(error));

			}

			function createAccount(event) {
				console.log('Создать аккаунт');
				let newUserEmail = '';
				let newUserPass = '';

				const side = event.target.id.slice(-1).toLowerCase();
				if (side === 'l') {
					$inpNamePL.value;
					newUserEmail = $inpEmailPL.value;
					newUserPass = $inpPassPL.value;
				}
				if (side === 'r') {
					$inpNamePR.value;
					newUserEmail = $inpEmailPR.value;
					newUserPass = $inpPassPR.value;
				}

				firebase__default['default'].auth().createUserWithEmailAndPassword(newUserEmail, newUserPass)
					.catch(error => console.log(error));
			}

			function enterAsGuest(event) {
				console.log('Войти как гость');

				const side = event.target.id.slice(-1).toLowerCase();

				if (side === 'l') {
					// Прячем форму, показываем поле выбора фракции с инпутом на имя
					$authFormPL.classList.add('display-none');
					$authUserPL.classList.remove('display-none');
					$authUserPL.querySelector('.user__name').classList.add('display-none');
				}

				if (side === 'r') {
					// Прячем форму, показываем поле выбора фракции с инпутом на имя
					$authFormPR.classList.add('display-none');
					$authUserPR.classList.remove('display-none');
					$authUserPR.querySelector('.user__name').classList.add('display-none');
				}

			}


		},
	};

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
					HTML: `GENERAL RULES`
				};

				rulesPages.race1 = {
					title: 'Правила игры за Империю',
					HTML: `EMPIRE RULES`
				};

				rulesPages.race2 = {
					title: 'Правила игры за Династию',
					HTML: `DINASTION RULES`
				};

				rulesPages.race3 = {
					title: 'Правила игры за Анклав',
					HTML: `ANCLAV RULES`
				};

				$rulesInfo.innerHTML = rulesPages[page].HTML;
			}


		},
	};

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

			document.getElementById('content');
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
					}
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
					let message = `Игрок ${this.name} побеждает!`;
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
					player.race.buildings[bldgNum];
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
											});
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
								player.race.buildings[bldgNum];

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
											});
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
								player.race.buildings[bldgNum];

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
											});
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
								player.race.buildings[bldgNum];

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
				showMessage(`${firstPlayer.name} начинает игру`, 3, firstPlayer.side, 'race' + firstPlayer.race.num);
				setTimeout(() => {
					showMessage(`У вас два действия. Постройте здание или атакуйте противника`, 3, firstPlayer.side, 'race' + firstPlayer.race.num);
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
				};

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
	};

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

			document.getElementById('content');

			// !!!FIREBASE!!!

		},
	};

	const RulesPage$1 = {
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

	// Компонент - хидер с настройками и навигацией по страницам.
	// На HomePage скрыт, появляется на всех прочих страницах

	const Header = {
		HTML: `
	<header class="header">

	<nav class="header__nav nav">
		<ul class="nav__list">
			<li class="nav__item">
				<a class="nav__link" href="#rules" data-tilt data-tilt-glare>
					<svg class="nav__icon" viewBox="0 0 512 512">
						<rect fill="rgba(0, 70, 100)" width="512" height="512" rx="100" ry="100"></rect>
						<g>
							<path d="M161.22 19.563l-2.5 5.375-106.44 225.5-1 2.093c-24.493 28.208-34.917 58.587-33.593 88.19 1.38 30.852 15.12 60.388 36.376 86.81l2.812 3.5h49.72c4.817-3.836 8.93-7.817 12.405-12.03 1.758-2.132 3.38-4.358 4.875-6.656H65.97c-17.813-23.187-28.526-47.848-29.626-72.438-1.123-25.11 7.337-50.594 29.937-76.125H498.157l-5.25-12.874-91.844-225.5-2.375-5.843H161.22zm11.843 18.687h177.343l52.656 41.594 38.407 94.28-58.845 70.94H75.47L173.062 38.25zM75.156 282.625c-15.31 18.98-20.975 37.778-20.125 56.438.84 18.398 8.276 36.95 20.5 54.468h57.19c4.392-13.517 6.344-29.847 6.78-50.436h-16.188v-18.688h16.313v-.187h115.749v.186h17.156v18.688h-17.25c-.287 17.8-1.447 34.638-4 50.437h221.626c-9.034-36.872-9.112-74.006-.03-110.905H75.155zm83 60.28c-.77 37.698-6.46 65.83-24.72 87.97-14.595 17.7-36.19 30.747-67.28 42.813 8.69 1.658 17.214 3.225 26.53 5.25 14.048 3.052 27.912 6.338 39.033 9.25 5.56 1.455 10.44 2.826 14.374 4.062 1.94.61 3.533 1.074 5.03 1.625 35.245-13.464 55.78-32.897 68.345-58.72 11.944-24.55 16.287-55.713 16.936-92.25h-78.25zm89.25 69.44c-1.632 6.425-3.532 12.668-5.812 18.686h257.03v-18.686H247.407z"
							fill="#ffffff"></path>
						</g>
					</svg>
					<span class="nav__text">Правила<br>игры</span>
				</a>
			</li>

			<li class="nav__item">
				<a class="nav__link" href="#game" data-tilt data-tilt-glare>
					<svg class="nav__icon" viewBox="0 0 512 512">
						<rect fill="rgba(0, 70, 100)" fill-opacity="1" height="512" width="512" rx="100" ry="100"></rect>
						<g>
							<path d="M380.95 114.46c-62.946-13.147-63.32 32.04-124.868 32.04-53.25 0-55.247-44.675-124.87-32.04C17.207 135.072-.32 385.9 60.16 399.045c33.578 7.295 50.495-31.644 94.89-59.593a51.562 51.562 0 0 0 79.77-25.78 243.665 243.665 0 0 1 21.24-.91c7.466 0 14.44.32 21.126.898a51.573 51.573 0 0 0 79.82 25.717c44.45 27.95 61.367 66.93 94.955 59.626 60.47-13.104 42.496-260.845-71.01-284.543zM147.47 242.703h-26.144V216.12H94.73v-26.143h26.594v-26.593h26.144v26.582h26.582v26.144h-26.582v26.582zm38.223 89.615a34.336 34.336 0 1 1 34.337-34.336 34.336 34.336 0 0 1-34.325 34.346zm140.602 0a34.336 34.336 0 1 1 34.367-34.325 34.336 34.336 0 0 1-34.368 34.335zM349.98 220.36A17.323 17.323 0 1 1 367.3 203.04a17.323 17.323 0 0 1-17.323 17.323zm37.518 37.52a17.323 17.323 0 1 1 17.322-17.324 17.323 17.323 0 0 1-17.365 17.334zm0-75.048a17.323 17.323 0 1 1 17.322-17.323 17.323 17.323 0 0 1-17.365 17.333zm37.518 37.518a17.323 17.323 0 1 1 17.323-17.323 17.323 17.323 0 0 1-17.367 17.334z"
							fill="#ffffff"></path>
						</g>
					</svg>
					<span class="nav__text">Рестарт<br>игры</span>
				</a>
			</li>

			<li class="nav__item">
				<a class="nav__link" href="#players" data-tilt data-tilt-glare>
					<svg class="nav__icon" viewBox="0 0 512 512">
						<rect fill="rgba(0, 70, 100)" height="512" width="512" rx="100" ry="100"></rect>
						<g>
							<path d="M137.273 41c1.41 59.526 16.381 119.035 35.125 167.77 19.69 51.191 44.086 90.988 57.965 104.867l2.637 2.636V343h46v-26.727l2.637-2.636c13.879-13.88 38.275-53.676 57.965-104.867 18.744-48.735 33.715-108.244 35.125-167.77zm-50.605 68.295c-17.97 6.05-32.296 18.214-37.625 30.367-3.015 6.875-3.48 13.44-.988 20.129.285.766.62 1.54.996 2.318a119.032 119.032 0 0 1 8.504-4.812l6.277-3.215 4.621 5.326c5.137 5.92 9.61 12.37 13.422 19.125 2.573-3.06 5.207-7.864 7.05-14.037 4.491-15.034 4.322-36.95-2.257-55.201zm338.664 0c-6.58 18.25-6.748 40.167-2.258 55.201 1.844 6.173 4.478 10.977 7.051 14.037 3.813-6.756 8.285-13.205 13.422-19.125l4.621-5.326 6.277 3.215a119.033 119.033 0 0 1 8.504 4.812c.375-.779.71-1.552.996-2.318 2.492-6.689 2.027-13.254-.988-20.129-5.329-12.153-19.655-24.317-37.625-30.367zm-365.975 67.74c-20.251 12.486-34.121 31.475-36.746 47.973-1.447 9.1.09 17.224 5.323 24.545 1.66 2.324 3.743 4.594 6.304 6.76a116.606 116.606 0 0 1 11.44-14.977l4.72-5.24 6.217 3.33c7.91 4.236 15.262 9.424 21.94 15.252.973-3.633 1.619-7.892 1.773-12.616.636-19.438-6.762-45.536-20.97-65.027zm393.286 0c-14.21 19.49-21.607 45.59-20.971 65.027.154 4.724.8 8.983 1.773 12.616 6.678-5.828 14.03-11.016 21.94-15.252l6.217-3.33 4.72 5.24a116.606 116.606 0 0 1 11.44 14.976c2.56-2.165 4.643-4.435 6.304-6.76 5.233-7.32 6.77-15.444 5.323-24.544-2.625-16.498-16.495-35.487-36.746-47.973zM54.4 259.133c-14.394 18.806-20.496 41.413-17.004 57.748 1.928 9.014 6.298 16.078 13.844 21.078 4.944 3.276 11.48 5.7 19.94 6.645a120.631 120.631 0 0 1 7.101-17.852l3.125-6.338 6.9 1.535c4.095.911 8.133 2.046 12.094 3.377-.373-3.838-1.309-8.185-2.925-12.82-6.416-18.396-22.749-40.184-43.075-53.373zm403.2 0c-20.326 13.189-36.66 34.977-43.075 53.373-1.616 4.635-2.552 8.982-2.925 12.82a119.337 119.337 0 0 1 12.093-3.377l6.9-1.535 3.126 6.338a120.63 120.63 0 0 1 7.101 17.852c8.46-.944 14.996-3.37 19.94-6.645 7.546-5 11.916-12.065 13.844-21.078 3.492-16.335-2.61-38.942-17.004-57.748zM91.5 341.527c-9.285 23.14-9.027 47.85-.709 63.54 4.57 8.619 11.106 14.607 20.268 17.562 4.586 1.479 9.957 2.19 16.185 1.803-2.135-11.155-2.771-22.97-1.756-34.938l.602-7.074 7.02-1.065a129.43 129.43 0 0 1 13.458-1.312c.554-.025 1.107-.04 1.66-.059-12.419-15.776-33.883-31.43-56.728-38.457zm329 0c-22.845 7.027-44.31 22.68-56.729 38.457.554.019 1.107.034 1.66.059 4.5.206 8.995.637 13.46 1.312l7.02 1.065.6 7.074c1.016 11.967.38 23.783-1.755 34.938 6.228.386 11.6-.324 16.185-1.803 9.162-2.955 15.699-8.943 20.268-17.563 8.318-15.69 8.576-40.4-.709-63.539zM199.729 361c-1.943 7.383-6.045 14.043-11.366 19.363a46.544 46.544 0 0 1-3.484 3.125c14.804 3.295 28.659 8.692 40.404 15.46 2.384-5.36 5.376-10.345 9.408-14.534C239.96 378.942 247.51 375 256 375c8.491 0 16.041 3.942 21.309 9.414 4.032 4.19 7.024 9.175 9.408 14.533 11.815-6.808 25.766-12.23 40.67-15.52a48.107 48.107 0 0 1-3.739-3.413c-5.227-5.333-9.27-11.852-11.261-19.014zM256 393c-3.434 0-5.635 1.084-8.34 3.895-2.704 2.81-5.395 7.52-7.527 13.298-4.265 11.556-6.343 27-7.156 38.446-1.07 15.043 3 33.368 12.285 40.06 4.733 3.412 16.743 3.412 21.476 0 9.285-6.692 13.355-25.017 12.285-40.06-.813-11.446-2.891-26.89-7.156-38.446-2.132-5.777-4.823-10.488-7.527-13.298-2.705-2.81-4.906-3.895-8.34-3.895zm-103.521 4.979c-1.714-.008-3.424.022-5.127.09-1.405.055-2.77.281-4.164.39-.418 27.817 9.816 53.543 24.994 66.644 8.264 7.134 17.586 10.772 28.35 10.157 5.908-.338 12.394-2.03 19.374-5.52-1.27-7.665-1.377-15.42-.883-22.379.632-8.89 1.852-19.962 4.479-30.877-17.16-10.686-42.426-18.395-67.023-18.506zm207.042 0c-24.597.11-49.863 7.82-67.023 18.505 2.627 10.915 3.847 21.987 4.479 30.877.494 6.958.387 14.714-.883 22.38 6.98 3.49 13.466 5.181 19.375 5.519 10.763.615 20.085-3.023 28.35-10.156 15.177-13.102 25.411-38.828 24.993-66.645-1.393-.109-2.76-.335-4.164-.39a116.32 116.32 0 0 0-5.127-.09z"
							fill="#ffffff"></path>
						</g>
					</svg>
					<span class="nav__text">Список<br>игроков</span>
				</a>
			</li>
		</ul>
		
		<a class="nav__link" href="#home" data-tilt data-tilt-glare>
			<svg class="nav__icon" viewBox="0 0 512 512">
				<rect fill="rgba(0, 70, 100)" fill-opacity="1" height="512" width="512" rx="100" ry="100"></rect>
				<g transform="translate(0,-20)">
					<path d="M217 28.098v455.804l142-42.597V70.697zm159.938 26.88l.062 2.327V87h16V55zM119 55v117.27h18V73h62V55zm258 50v16h16v-16zm0 34v236h16V139zm-240 58.727V233H41v46h96v35.273L195.273 256zM244 232c6.627 0 12 10.745 12 24s-5.373 24-12 24-12-10.745-12-24 5.373-24 12-24zM137 339.73h-18V448h18zM377 393v14h16v-14zm0 32v23h16v-23zM32 471v18h167v-18zm290.652 0l-60 18H480v-18z"
					fill="#ffffff" transform="translate(25.6, 25.6) scale(0.9, 0.9) rotate(0, 256, 256)"></path>
				</g>
			</svg>
			<span class="nav__text">Выход<br>в меню</span>
		</a>
	</nav>

</header>
	`,

		render: function (root) {
			root.insertAdjacentHTML('beforeend', this.HTML);
		}
	};

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

	// Импорты страниц и компонентов SPA




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
		error: RulesPage$1,
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
			};


			this.renderContent = function (hashPageName) {
				// Если на переданный хэш есть страница - обобразим ее, иначе покажем ошибку 404
				let routeName = hashPageName in routes ? hashPageName : 'error';

				// Меняем заголовок страницы, рендерим содержимое в контейнер, запускаем скрипт, инициализируем тильт
				window.document.title = routes[routeName].title;
				routes[routeName].render(contentElement);
				routes[routeName].start();
				tilt.init(document.querySelectorAll('[data-tilt]'));
			};
		}

		//! Model - отрабатывает переход по ссылке, вызывая метод view
		function ModuleModel() {
			let ModuleView = null;

			this.init = function (view) {
				ModuleView = view;
			};

			this.updateState = function () {
				const hashPageName = window.location.hash.slice(1).toLowerCase();
				ModuleView.renderContent(hashPageName);
			};
		}


		//! Controller - слушатели на изменение хэша URL и элементы навигации, запуск метода модели при hashchange
		function ModuleController() {
			let rootElement = null;
			let ModuleModel = null;

			// init-метод связывает контроллер с моделью и вешает обработчики на hashchange и ссылки меню
			this.init = function (root, model) {
				rootElement = root;
				ModuleModel = model;
				rootElement.querySelector('nav.nav');

				// Cлушатель на изменение значения хэша URL страницы
				window.addEventListener('hashchange', this.updateState);

				// При инициализации контроллера отображаем стартовую страницу
				window.location.hash = '#home';
				this.updateState();
			};

			this.updateState = function () {
				ModuleModel.updateState();
			};
		}

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

})));
