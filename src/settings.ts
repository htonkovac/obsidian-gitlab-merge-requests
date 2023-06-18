import { App, PluginSettingTab, Setting, normalizePath } from "obsidian";
import GitlabIssuesPlugin from "./main";

export interface GitlabIssuesSettings {
	gitlabUrl: string;
	gitlabToken: string;
	templateFile: string;
	outputDir: string;
	filter: string;
	showIcon: boolean;
	gitlabApiUrl(): string;
}

export const DEFAULT_SETTINGS: GitlabIssuesSettings = {
	gitlabUrl: 'https://gitlb.com',
	gitlabToken: '',
	templateFile: '',
	outputDir: '/Gitlab Issues/',
	filter: 'due_date=month',
	showIcon: false,
	gitlabApiUrl(): string {
		return `${this.gitlabUrl}/api/v4`;
	}
};

export function updateSettings(settings: GitlabIssuesSettings) {
	SettingsData = settings;
}

export let SettingsData: GitlabIssuesSettings = JSON.parse(JSON.stringify(DEFAULT_SETTINGS)); //modified in main.ts
export class GitlabIssuesSettingTab extends PluginSettingTab {
	plugin: GitlabIssuesPlugin;

	constructor(app: App, plugin: GitlabIssuesPlugin) {
		super(app, plugin);
		this.plugin = plugin;
	}

	display(): void {
		const { containerEl } = this;

		containerEl.empty();
		containerEl.createEl('h2', { text: 'GitLab Issues Configuration' });

		new Setting(containerEl)
			.setName('Gitlab instance URL')
			.setDesc('Use your own Gitlab instance instead of the public hosted Gitlab.')
			.addText(text => text
				.setPlaceholder('https://gitlab.com')
				.setValue(this.plugin.settings.gitlabUrl)
				.onChange(async (value) => {
					this.plugin.settings.gitlabUrl = value;
					await this.plugin.saveSettings();
				}));

		new Setting(containerEl)
			.setName('Personal Access Token')
			.setDesc('Create a personal access token in your Gitlab account and enter it here.')
			.addText(text => text
				.setPlaceholder('Token')
				.setValue(this.plugin.settings.gitlabToken)
				.onChange(async (value) => {
					this.plugin.settings.gitlabToken = value;
					await this.plugin.saveSettings();
					this.plugin.onload().then(
						() => console.log('Gitlab Issues: Reloading plugin')
					);
				}));

		new Setting(containerEl)
			.setName('Show refresh Gitlab issues icon in left ribbon?')
			.addToggle(value => value
				.setValue(this.plugin.settings.showIcon)
				.onChange(async (value) => {
					this.plugin.settings.showIcon = value;
					await this.plugin.saveSettings();
				}));

		containerEl.createEl('h3', { text: 'More Information' });
		containerEl.createEl('a', {
			text: 'View the Gitlab documentation',
			href: 'https://docs.gitlab.com/ee/api/issues.html#list-issues'
		});
	}
}