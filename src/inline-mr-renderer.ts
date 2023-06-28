// InlineMRRenderer
import { MarkdownPostProcessorContext } from "obsidian"
import GitlabApi from "./gitlab-api"
import { GitlabMergeRequests, customReference, getState, getText } from './gitlab-mr'
import { SettingsData } from './settings';

function transformTitle(title: string): string {
    //if title starts with Draft: then remove it
    if (title.startsWith("Draft: ")) {
        return title.substring(7)
    }
    return title
}

export function renderMR(mr: GitlabMergeRequests): HTMLElement {
    // convert to createEl calls

    const container = createDiv({ cls: 'gitlab-mr-container' })
    const mrLink = createEl('a', { cls: 'gitlab-mr-link', attr: { href: mr.web_url, target: '_blank' } })
    // mrLink.appendChild(createEl('input',{ cls: 'merged', attr: { type: 'checkbox' } }))
    mrLink.appendChild(createSpan({ cls: 'gitlab-mr-state-indicator gitlab-mr-state-'+getState(mr), text: getText(mr)}))
    // mrLink.appendChild(createSpan({ cls: 'gitlab-mr-state', text: mr.state }))
    // mrLink.appendChild(createSpan({ cls: 'gitlab-mr-author', text: mr.author.name }))
    // mrLink.appendChild(createSpan({ cls: 'gitlab-mr-created-at', text: mr.created_at }))
    
    mrLink.appendChild(createSpan({ cls: 'gitlab-mr-title gitlab-mr-text', text: transformTitle(mr.title) }))
    mrLink.appendChild(createSpan({ cls: 'gitlab-mr-id gitlab-mr-text', text: customReference(mr.references.full) }))
    container.appendChild(mrLink)
    return container
}

function convertInlineIssuesUrlToTags(el: HTMLElement): void {
    //read gitlab url from settings

    const gitlabUrl = SettingsData.gitlabUrl

    // mrUrl = "https://gitlab.com/htonkovac/test-project-123/-/merge_requests/2"
    // mrUrl2 = "https://gitlab.com/test-group334183924/thesubgroup/awesome-project/-/merge_requests/1"

    const MRUrlElements = el.querySelectorAll(`a.external-link[href^="${gitlabUrl}/"]`)

    //FIXME sometimes may not be a MR link
    MRUrlElements.forEach((mrUrlElement: HTMLAnchorElement) => {

        const path = mrUrlElement.href.split(gitlabUrl)[1]
        // extract MR ID from URL
        const splitted_path = path.split("/-/merge_requests/")
        const mrKey = splitted_path[0] + "!" + splitted_path[1]
        const container = createSpan({ cls: 'gitlab-mr', attr: { 'mr-key': mrKey } })
        mrUrlElement.replaceWith(container)
    })
}

export function getInlineIssueRenderer() {
    return async (el: HTMLElement, ctx: MarkdownPostProcessorContext) => {
        convertInlineIssuesUrlToTags(el)

        const inlineIssueTags: NodeListOf<HTMLSpanElement> = el.querySelectorAll(`span.gitlab-mr`)
        inlineIssueTags.forEach((value: HTMLSpanElement) => {
            const issueKey = value.getAttribute('mr-key')
            if (issueKey == null) {
                throw new Error("issueKey is null")
            }


            const mr = GitlabApi.getMR(issueKey).then((mr) => {

                value.replaceWith(renderMR(mr))
            })
        }
        )
    }
}
