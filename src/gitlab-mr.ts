//https://gitlab.com/api/v4/merge_requests
//https://gitlab.com/api/v4/merge_requests?state=opened&scope=all
//https://gitlab.com/api/v4/merge_requests?state=opened&scope=all&per_page=100
//https://docs.gitlab.com/ee/api/merge_requests.html

export interface GitlabMergeRequests {
    // The ID of the merge request
    id: number;
    // The ID of the project
    project_id: number;
    // The title of the merge request
    title: string;
    // The description of the merge request
    description: string;
    // The state of the merge request. Can be opened, closed, locked, or merged
    state: string;
    // Whether the merge request is a work in progress
    work_in_progress: boolean;
    // Whether the merge request is a draft
    draft: boolean;
    // Whether the merge request can be merged
    merge_status: string;
    // Whether the merge request has conflicts
    has_conflicts: boolean;
    // The date the merge request was created
    created_at: string;
    // The date the merge request was last updated
    updated_at: string;
    // The user who merged the merge request
    merged_by: string;
    // The user who created the merge request
    merge_user: string;
    // The date the merge request was merged
    merged_at: string;
    // The user who closed the merge request
    closed_by: string;
    // The date the merge request was closed
    closed_at: string;
    // The target branch of the merge request
    target_branch: string;
    // The source branch of the merge request
    source_branch: string;
    // The number of user notes
    user_notes_count: number;
    // The number of upvotes
    upvotes: number;
    // The number of downvotes
    downvotes: number;
    detailed_merge_status: string;


    approved_by: string;
    approved: boolean;

    web_url: string;
    references: {
        short: string;
        relative: string;
        full: string;
    };

    author: {
        id: number;
        username: string;
        name: string;
        state: string;
        avatar_url: string;
        web_url: string;
    };

    blocking_discussions_resolved: boolean;



}

export function customReference(fullRef: string): string {
    const splitted = fullRef.split("/");
    return splitted[splitted.length - 1]
}

export function getIsDraftClass(isDraft: boolean): string {
    if (isDraft) {
        return "-draft"
    }
    return ""
}

export function getText(mr: GitlabMergeRequests): string {
    if (mr.state === "merged") {
        return "Merged"
    }

    if (mr.has_conflicts) {
        return "Conflict"
    }

    // detailed_merege_status is still not available in the api
    if (mr.merge_status === "cannot_be_merged" || mr.detailed_merge_status === "cannot_be_merged_recheck" || mr.detailed_merge_status === "cannot_be_merged_recheck_conflicts") { //not sure if cannot_be_merged_recheck_conflicts was hallucinated or really exists 
        return "Failure!"
    }

    if (mr.draft) {
        return "Drafted"
    }

    if (!mr.blocking_discussions_resolved) {
        return "Discuss"
    }

    if (mr.merge_status === "can_be_merged") { //can_be_merged doesn't account for approvals
        return "Ready!"
    }
    if (mr.approved) { //lol doesn't work - is not part of the api
        return "Approved"
    }
    if (mr.state === "opened") {
        return "Opened"
    }
    if (mr.state === "closed") {
        return "Closed"
    }
    if (mr.state === "locked") {
        return "Locked"
    }

    return "Unknown"
}

export function getState(mr: GitlabMergeRequests): string {
    if (mr.state === "merged") {
        return "merged"
    }

    if (mr.has_conflicts) {
        return "conflicts"
    }
    // detailed_merege_status is still not available in the api
    if (mr.merge_status === "cannot_be_merged" || mr.detailed_merge_status === "cannot_be_merged_recheck" || mr.detailed_merge_status === "cannot_be_merged_recheck_conflicts") { //not sure if cannot_be_merged_recheck_conflicts was hallucinated or really exists 
        return "conflicts"
    }

    if (mr.blocking_discussions_resolved) {
        return "draft"
    }

    if (mr.draft) {
        return "draft"
    }

    if (mr.approved) {
        return "approved"
    }
    if (mr.merge_status === "can_be_merged") {
        return "mergeable"
    }
    if (mr.state === "opened") {
        return "opened"
    }
    if (mr.state === "closed") {
        return "closed"
    }
    if (mr.state === "locked") {
        return "locked"
    }

    return "unknown"
}   