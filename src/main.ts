import { App, Modal, Plugin } from 'obsidian';
import { DEFAULT_SETTINGS, GitlabIssuesSettings, GitlabIssuesSettingTab, SettingsData , updateSettings} from './settings';

import {examplePlugin} from './view-plugin';
import {getInlineIssueRenderer} from './inline-mr-renderer';

export default class MyPlugin extends Plugin {
	settings: GitlabIssuesSettings;
    // private _inlineIssueViewPlugin: ViewPluginManager

	async onload() {
		await this.loadSettings();
		this.registerEditorExtension(examplePlugin);
		this.registerMarkdownPostProcessor(getInlineIssueRenderer())

		// This adds a settings tab so the user can configure various aspects of the plugin
		this.addSettingTab(new GitlabIssuesSettingTab(this.app, this));

		this.registerInterval(window.setInterval(() => console.log('setInterval'), 5 * 60 * 1000));
	}

	onunload() {

	}

	async loadSettings() {
		console.log(await this.loadData())
		this.settings = Object.assign({}, DEFAULT_SETTINGS, await this.loadData());
		updateSettings(this.settings);
		// SettingsData = this.settings;
		// console.log(SettingsData)

	}

	async saveSettings() {
		await this.saveData(this.settings);
	}
}
