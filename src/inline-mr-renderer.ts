// InlineMRRenderer
import { MarkdownPostProcessorContext } from "obsidian"
import GitlabApi from "./gitlab-api"
import { GitlabIssuesSettings, SettingsData } from "./settings"
import { GitlabMergeRequests, customReference, getState, getText } from './gitlab-mr'

// import JiraClient from "../client/jiraClient"
// import { IJiraIssue } from "../interfaces/issueInterfaces"
// import { COMPACT_SYMBOL, JIRA_KEY_REGEX } from "../interfaces/settingsInterfaces"
// import ObjectsCache from "../objectsCache"
// import { SettingsData } from "../settings"
// import RC from "./renderingCommon"

// TODO: support explicit account selection in inline issues

// function convertInlineIssuesToTags(el: HTMLElement): void {
//     if (SettingsData.inlineIssuePrefix) {
//         let match
//         while (match = new RegExp(`${SettingsData.inlineIssuePrefix}(${COMPACT_SYMBOL}?)(${JIRA_KEY_REGEX})`).exec(el.innerHTML)) {
//             // console.log({ match })
//             const compact = !!match[1]
//             const issueKey = match[2]
//             const container = createSpan({ cls: 'gitlab-inline-merge-request gitlab-merge-request-container', attr: { 'data-issue-key': issueKey, 'data-compact': compact } })
//             container.appendChild(RC.renderLoadingItem(issueKey, true))
//             el.innerHTML = el.innerHTML.replace(match[0], container.outerHTML)
//         }
//     }
// }

export function renderMR(mr: GitlabMergeRequests): HTMLElement {
    // convert to createEl calls

    const container = createDiv({ cls: 'gitlab-mr-container' })
    const mrLink = createEl('a', { cls: 'gitlab-mr-link', attr: { href: mr.web_url, target: '_blank' } })
    // mrLink.appendChild(createEl('input',{ cls: 'merged', attr: { type: 'checkbox' } }))
    mrLink.appendChild(createSpan({ cls: 'gitlab-mr-state-indicator gitlab-mr-state-'+getState(mr), text: getText(mr)}))
    mrLink.appendChild(createSpan({ cls: 'gitlab-mr-id gitlab-mr-text', text: customReference(mr.references.full) }))
    // mrLink.appendChild(createSpan({ cls: 'gitlab-mr-state', text: mr.state }))
    // mrLink.appendChild(createSpan({ cls: 'gitlab-mr-author', text: mr.author.name }))
    // mrLink.appendChild(createSpan({ cls: 'gitlab-mr-created-at', text: mr.created_at }))

    mrLink.appendChild(createSpan({ cls: 'gitlab-mr-title gitlab-mr-text', text: mr.title }))
    container.appendChild(mrLink)
    return container
}

function convertInlineIssuesUrlToTags(el: HTMLElement): void {
    const gitlabUrl = "https://gitlab.com"

    // mrUrl = "https://gitlab.com/htonkovac/test-project-123/-/merge_requests/2"
    // mrUrl2 = "https://gitlab.com/test-group334183924/thesubgroup/awesome-project/-/merge_requests/1"

    const MRUrlElements = el.querySelectorAll(`a.external-link[href^="${gitlabUrl}/"]`)

    //FIXME sometimes may not be a MR link
    MRUrlElements.forEach((mrUrlElement: HTMLAnchorElement) => {

        const path = mrUrlElement.href.split("gitlab.com/")[1]
        // extract MR ID from URL
        const splitted_path = path.split("/-/merge_requests/")
        const mrKey = splitted_path[0] + "!" + splitted_path[1]
        const container = createSpan({ cls: 'gitlab-mr', attr: { 'mr-key': mrKey } })
        mrUrlElement.replaceWith(container)
    })
}

export function getInlineIssueRenderer() {
    return async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        // console.log({ el })
        // convertInlineIssuesToTags(el)
        convertInlineIssuesUrlToTags(el)

        const inlineIssueTags: NodeListOf<HTMLSpanElement> = el.querySelectorAll(`span.gitlab-mr`)
        inlineIssueTags.forEach((value: HTMLSpanElement) => {
            const issueKey = value.getAttribute('mr-key')
            if (issueKey == null) {
                console.log("issueKey is null")
                throw new Error("issueKey is null")
            }


            const mr = GitlabApi.getMR(issueKey).then((mr) => {

                value.replaceWith(renderMR(mr))
            })
            //TODO: add cache


            // JiraClient.getIssue(issueKey).(newIssue => {
            //     const issue = ObjectsCache.adthend(issueKey, newIssue).data as IJiraIssue
            //     value.replaceChildren(RC.renderIssue(issue, compact))
            // }).catch(err => {
            //     ObjectsCache.add(issueKey, err, true)
            //     value.replaceChildren(RC.renderIssueError(issueKey, err))
            // })
        }
        )
    }
}
