import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';
import { GitlabIssuesSettings } from './settings';
import { GitlabMergeRequests } from './gitlab-mr'
const ms = require('ms')

class Cache {
	cache: Array<GitlabMergeRequests> = []
	cacheUpdateTime: number = 0

	setCache(mrs: Array<GitlabMergeRequests>) {
		this.cache = mrs
		this.cacheUpdateTime = Date.now()
	}

	getCache(): Array<GitlabMergeRequests> | null{
		if (this.cacheUpdateTime + ms('3000') < Date.now()) {
			return null
		}

		return this.cache
	}
}

export default class GitlabApi {
	static cache: Cache = new Cache()

	// refactor to async/await
	static load<T>(url: string, gitlabToken: string): Promise<T> {

		const headers = { 'PRIVATE-TOKEN': gitlabToken };

		const params: RequestUrlParam = { url: url, headers: headers };

		return requestUrl(params)
			.then((response: RequestUrlResponse) => {
				if (response.status !== 200) {
					throw new Error(response.text);
				}

				return response.json as Promise<T>;
			});
	}

	static async getAllMRs(settings: GitlabIssuesSettings): Promise<Array<GitlabMergeRequests>> {
		const date = new Date();
		date.setDate(date.getDate() - 30);

		const url = `${settings.gitlabUrl}/api/v4/merge_requests?created_after=${date.toISOString()}`;
		const mrs = await this.load<Array<GitlabMergeRequests>>(url, settings.gitlabToken)

		this.cache.setCache(mrs)
		return mrs
	}

	static async getMR(settings: GitlabIssuesSettings, mrId: string): Promise<GitlabMergeRequests> {
		let all_mrs = this.cache.getCache()
		if (all_mrs == null) {
			all_mrs = await this.getAllMRs(settings)
		}

		const mr = all_mrs.find((mr: GitlabMergeRequests) => {
			return mr.references.full == mrId
		}
		)

		if (mr == undefined) {
			throw new Error("MR with id " + mrId + " not found")
		}
		return mr
	}
}
