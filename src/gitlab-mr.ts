//https://gitlab.com/api/v4/merge_requests
//https://gitlab.com/api/v4/merge_requests?state=opened&scope=all
//https://gitlab.com/api/v4/merge_requests?state=opened&scope=all&per_page=100



/// Gitlab merge requests object 
// {
//     "id": 230313686,
//     "iid": 3,
//     "project_id": 46835458,
//     "title": "My new feature",
//     "description": "",
//     "state": "opened",
//     "created_at": "2023-06-13T20:55:23.807Z",
//     "updated_at": "2023-06-13T20:55:24.383Z",
//     "merged_by": null,
//     "merge_user": null,
//     "merged_at": null,
//     "closed_by": null,
//     "closed_at": null,
//     "target_branch": "main",
//     "source_branch": "my-new-feature",
//     "user_notes_count": 0,
//     "upvotes": 0,
//     "downvotes": 0,
//     "author": {
//         "id": 2446813,
//         "username": "htonkovac",
//         "name": "Hrvoje Tonkovac",
//         "state": "active",
//         "avatar_url": "https://secure.gravatar.com/avatar/2e7643e5ea797c7d56ce7950bce371a0?s=80\u0026d=identicon",
//         "web_url": "https://gitlab.com/htonkovac"
//     },
//     "assignees": [],
//     "assignee": null,
//     "reviewers": [],
//     "source_project_id": 46835458,
//     "target_project_id": 46835458,
//     "labels": [],
//     "draft": false,
//     "work_in_progress": false,
//     "milestone": null,
//     "merge_when_pipeline_succeeds": false,
//     "merge_status": "cannot_be_merged",
//     "detailed_merge_status": "broken_status",
//     "sha": "1f11489feeaf2223d289f4ef6848ea24573a1ecf",
//     "merge_commit_sha": null,
//     "squash_commit_sha": null,
//     "discussion_locked": null,
//     "should_remove_source_branch": null,
//     "force_remove_source_branch": true,
//     "prepared_at": "2023-06-13T20:55:24.378Z",
//     "reference": "!3",
//     "references": {
//         "short": "!3",
//         "relative": "!3",
//         "full": "htonkovac/test-project-123!3"
//     },
//     "web_url": "https://gitlab.com/htonkovac/test-project-123/-/merge_requests/3",
//     "time_stats": {
//         "time_estimate": 0,
//         "total_time_spent": 0,
//         "human_time_estimate": null,
//         "human_total_time_spent": null
//     },
//     "squash": true,
//     "squash_on_merge": true,
//     "task_completion_status": {
//         "count": 0,
//         "completed_count": 0
//     },
//     "has_conflicts": true,
//     "blocking_discussions_resolved": true,
//     "approvals_before_merge": null
// },

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
    
    
}

export function customReference(fullRef: string): string {
    const splitted =  fullRef.split("/");
    return splitted[splitted.length - 1]
}

export function getIsDraftClass(isDraft: boolean): string {
    if (isDraft) {
        return "-draft"
    }
    return ""
}

export function getText(isDraft: boolean, state: string): string {
    if (isDraft) {
        return "Drafted"
    }
    if (state === "opened") {
        return "Opened"
    }
    if (state === "closed") {
        return "Closed"
    }
    if (state === "locked") {
        return "Locked"
    }
    if (state === "merged") {
        return "Merged"
    }
    return "Unknown"
}