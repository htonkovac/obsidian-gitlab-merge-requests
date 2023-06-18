import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';
import { SettingsData } from './settings';
import { GitlabMergeRequests } from './gitlab-mr'
const ms = require('ms')

class Cache {
	//Interesting learning - in async programming you have to cache the promise, not the result
	//https://medium.com/@hayavuk/global-async-cache-44bc282cb7df
	cache: Promise<Array<GitlabMergeRequests>> | null = null
	cacheUpdateTime: number = 0

	setCache(mrs: Promise<Array<GitlabMergeRequests>>) {
		this.cache = mrs
		this.cacheUpdateTime = Date.now()
	}

	getCache(): Promise<Array<GitlabMergeRequests>> | null{
		if (this.cacheUpdateTime + ms('3000000') < Date.now()) {
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

	static async getAllMRs(): Promise<Array<GitlabMergeRequests>> {
		const date = new Date();
		date.setDate(date.getDate() - 30);

		const url = `${SettingsData.gitlabUrl}/api/v4/merge_requests?created_after=${date.toISOString()}`;
		const mrs = this.load<Array<GitlabMergeRequests>>(url, SettingsData.gitlabToken)

		this.cache.setCache(mrs)
		return mrs
	}

	static async getMR( mrId: string): Promise<GitlabMergeRequests> {
		let all_mrs_promise = this.cache.getCache()
		if (all_mrs_promise == null) {
			all_mrs_promise = this.getAllMRs()
		}
		const all_mrs = await all_mrs_promise
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
