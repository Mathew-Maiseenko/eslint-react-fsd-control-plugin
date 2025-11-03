/**
 * @fileoverview control rule for moduled stules importing obj name
 * @author bananacat
 */
'use strict'

//------------------------------------------------------------------------------
// Requirements
//------------------------------------------------------------------------------

const rule = require('../../../lib/rules/module-styles-import-var-control'),
	RuleTester = require('eslint').RuleTester

//------------------------------------------------------------------------------
// Tests
//------------------------------------------------------------------------------

const ruleTester = new RuleTester()
ruleTester.run('module-styles-import-var-control', rule, {
	valid: [
		// Корректные импорты с default именем 'classes'
		{
			code: "import classes from './styles.module.css'",
		},
		{
			code: "import classes from './component.module.scss'",
		},
		{
			code: "import classes from '../styles.module.sass'",
		},
		{
			code: "import classes from '@/shared/styles.module.less'",
		},

		// Корректные импорты с кастомным именем из конфига
		{
			code: "import styles from './button.module.css'",
			options: ['styles'],
		},
		{
			code: "import myStyles from './header.module.scss'",
			options: ['myStyles'],
		},

		// Импорты не стилевых файлов (должны игнорироваться)
		{
			code: "import React from 'react'",
		},
		{
			code: "import Component from './Component.js'",
		},
		{
			code: "import utils from './utils.js'",
		},
		{
			code: "import something from './regular.css'", // не module.css
		},
	],

	invalid: [
		// Импорты с namespace или другими specifiers
		{
			code: "import * as styles from './styles.module.css'",
			options: ['styles'],
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport_Global',
					data: {
						importPath: './styles.module.css',
						requiredEntityName: 'styles',
					},
				},
			],
		},
		{
			code: "import { className } from './styles.module.css'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport_Named',
					data: {
						importPath: './styles.module.css',
						requiredEntityName: 'className',
					},
				},
			],
		},
		// Неправильное имя импорта с default конфигом
		{
			code: "import styles from './styles.module.css'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
					data: {
						importPath: './styles.module.css',
						requiredEntityName: 'classes',
					},
				},
			],
		},
		{
			code: "import myClasses from './component.module.scss'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
					data: {
						importPath: './component.module.scss',
						requiredEntityName: 'classes',
					},
				},
			],
		},

		// Неправильное имя импорта с кастомным конфигом
		{
			code: "import classes from './styles.module.css'",
			options: ['styles'],
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
					data: {
						importPath: './styles.module.css',
						requiredEntityName: 'styles',
					},
				},
			],
		},
		{
			code: "import something from './button.module.less'",
			options: ['myStyles'],
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
					data: {
						importPath: './button.module.less',
						requiredEntityName: 'myStyles',
					},
				},
			],
		},

		// Разные расширения стилевых файлов
		{
			code: "import styles from './app.module.sass'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
				},
			],
		},
		{
			code: "import styles from './layout.module.styl'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
				},
			],
		},

		// Относительные и абсолютные пути
		{
			code: "import styles from '../styles.module.css'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
				},
			],
		},
		{
			code: "import styles from '@/components/button.module.scss'",
			errors: [
				{
					messageId: 'incorrectModulesStylesObjImport',
				},
			],
		},
	],
})
