"use strict";

const gulp = require("gulp");
const rollup = require('gulp-better-rollup');
const babel = require('rollup-plugin-babel');
const resolve = require('rollup-plugin-node-resolve');
const commonjs = require('rollup-plugin-commonjs');
const watch = require("gulp-watch");
const sass = require("gulp-sass");
const postcss = require("gulp-postcss");
const autoprefixer = require("autoprefixer");
const cssnano = require("cssnano");
const rimraf = require("rimraf");
const browserSync = require("browser-sync");
const preprocess = require("gulp-preprocess");
const svgInject = require("gulp-inject-svg");
const reload = browserSync.reload;

const path = {
	build: {   // куда складывать готовый проект
		html: "project/",  // путь к проекту
		js: "project/js/",  // путь к скриптам
		css: "project/css/",  // путь к стилям
		img: "project/media/", // путь к картинкам
		fonts: "project/fonts/" // путь к шрифтам
	},
	src: { // где лежит проект
		html: "#src/*.html", // файлы страниц
		js: "#src/js/**/*.*", // скрипты
		css: "#src/scss/main.scss", // файл стилей, в котором мы подключаем все наши компоненты
		img: "#src/media/**/*.*", // путь к картинкам
		fonts: "#src/fonts/**/*.*" // путь к шрифтам
	},
	watch: { // за какими изменениями будем следить
		html: "#src/**/*.html",
		js: "#src/**/*.js",
		css: "#src/**/*.scss",
		img: "#src/media/**/*.*",
		svg: "#src/media/**/*.svg",
		fonts: "#src/fonts/**/*.*"
	},
	clean: "./project" // очистка папки с проектом
};

const config = {
	server: {
		baseDir: "./project" // папка c готовым проектом (для запуска локального сервера)
	},
	host: "localhost",
	port: 9000,
	logPrefix: "Sv9topolk"
};

/***
	Описание задач и действий
***/

//Задача для HTML
function htmlBuild() {
	return gulp
		.src(path.src.html)
		.pipe(preprocess())  // склейка шаблонов
		.pipe(svgInject({ base: "/src/" })) // инлайним SVG
		.pipe(gulp.dest(path.build.html)) // переписываем в папку build
		.pipe(reload({ stream: true })); // перезагружаем сервер
}
//Задача для CSS
function cssBuild() {
	return gulp
		.src(path.src.css)
		.pipe(sass().on("error", sass.logError)) // перегнали scss -> css
		.pipe(
			postcss([
				autoprefixer(),
				cssnano() // сжатие css
			])
		)
		.pipe(gulp.dest(path.build.css))  // переписываем в папку build
		.pipe(reload({ stream: true }));  // перезагружаем сервер
}
//Задача для Javascript
function jsBuild() {
	return gulp
		.src(path.src.js)
		// .pipe(rollup({ plugins: [babel(), resolve(), commonjs()] }, 'umd'))
		.pipe(rollup({ plugins: [resolve(), commonjs()] }, 'umd'))
		.pipe(gulp.dest(path.build.js)) // переписываем в папку build
		.pipe(reload({ stream: true })); // перезагружаем сервер
}
//Задача для картинок
function imageBuild() {
	return gulp
		.src(path.src.img)
		.pipe(gulp.dest(path.build.img))
		.pipe(reload({ stream: true }));
}
//Задача для шрифтов
function fontsBuild() {
	return gulp.src(path.src.fonts).pipe(gulp.dest(path.build.fonts));
}

//Cписок тасков для команды build
const build = gulp.parallel(
	htmlBuild,
	jsBuild,
	cssBuild,
	fontsBuild,
	imageBuild);
//Задача для сборки билда
gulp.task("build", build);

//Cписок тасков для команды watch
function watchTask() {
	gulp.watch([path.watch.html], htmlBuild);
	gulp.watch([path.watch.svg], htmlBuild);
	gulp.watch([path.watch.css], cssBuild);
	gulp.watch([path.watch.js], jsBuild);
	gulp.watch([path.watch.img], imageBuild);
	gulp.watch([path.watch.fonts], fontsBuild);
}

//Задача для запуска локального сервера
function webserver() {
	browserSync(config);
}

//Задача по очистке папки с проектом
gulp.task("cleanTask", function (cb) {
	rimraf(path.clean, cb);
});

//Запуск действий по умолчанию
gulp.task("default", gulp.parallel(build, webserver, watchTask));
