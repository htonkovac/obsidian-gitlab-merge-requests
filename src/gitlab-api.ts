import { requestUrl, RequestUrlParam, RequestUrlResponse } from 'obsidian';
import { GitlabIssuesSettings } from './settings';
import { GitlabMergeRequests } from './gitlab-mr'
export default class GitlabApi {

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

	static getAllMRs(settings: GitlabIssuesSettings): Promise<Array<GitlabMergeRequests>> {

		const date = new Date();
		date.setDate(date.getDate() - 30);

		const url = `${settings.gitlabUrl}/api/v4/merge_requests?created_after=${date.toISOString()}`;
		return GitlabApi.load<Array<GitlabMergeRequests>>(url, settings.gitlabToken)
	}

	static async getMR(settings: GitlabIssuesSettings, mrId: string): Promise<GitlabMergeRequests> {
		const all_mrs = await this.getAllMRs(settings)

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
