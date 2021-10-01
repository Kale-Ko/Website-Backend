const CONFIG = { GITHUB_USERS: JSON.parse(JSON.stringify(JSON.parse(GITHUB_USERS.replace(/'/g, '"')))), GITHUB_API_TOKEN }

var OkHeaders = new Headers()
OkHeaders.set("Content-Type", "application/json")
OkHeaders.set("Access-Control-Allow-Origin", "*")
var InvalidHeaders = new Headers()
InvalidHeaders.set("Content-Type", "text/plain")
InvalidHeaders.set("Access-Control-Allow-Origin", "*")

async function handelRequest(req) {
    var url = new URL(req.url)
    var version = url.pathname.split("/")[1]
    var endpoint = url.pathname.split("/").slice(2, url.pathname.split("/").length - 1)

    if (version == "v1") {
        if (endpoint[0] == "github") {
            if (endpoint[1] == "projects") {
                var repos = []

                for (var user in CONFIG.GITHUB_USERS) {
                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERS[user] + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        data.forEach(repo => {
                            if (repo.stargazers_count > 0 && !repo.private) {
                                repo.url = repo.html_url

                                var todelete = ["id", "node_id", "private", "owner", "fork", "html_url", "forks_url", "keys_url", "collaborators_url", "teams_url", "hooks_url", "issue_events_url", "events_url", "assignees_url", "branches_url", "tags_url", "blobs_url", "git_tags_url", "git_refs_url", "trees_url", "statuses_url", "languages_url", "stargazers_url", "contributors_url", "subscribers_url", "subscription_url", "commits_url", "git_commits_url", "comments_url", "issue_comment_url", "contents_url", "compare_url", "merges_url", "archive_url", "downloads_url", "issues_url", "pulls_url", "milestones_url", "notifications_url", "labels_url", "releases_url", "deployments_url", "pushed_at", "git_url", "ssh_url", "clone_url", "svn_url", "size", "has_issues", "has_projects", "has_downloads", "has_wiki", "has_pages", "forks_count", "mirror_url", "open_issues_count", "license", "allow_forking", "forks", "open_issues", "watchers", "default_branch", "permissions", "language", "disabled", "created_at"]
                                todelete.forEach(item => { delete repo[item] })

                                repos.push(repo)
                            }
                        })
                    })
                }

                repos.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                repos.sort((a, b) => (a.archived == b.archived) ? 0 : (a.archived ? 1 : -1))

                return new Response(JSON.stringify(repos, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "projects-raw") {
                var repos = []

                for (var user in CONFIG.GITHUB_USERS) {
                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERS[user] + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        data.forEach(repo => { if (!repo.private) repos.push(repo) })
                    })
                }

                repos.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))

                return new Response(JSON.stringify(repos, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
        } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
    } else if (version == undefined || version == "" || version == " ") return new Response("400 You must specify an api version", { status: 400, statusText: "You must specify an api version", headers: InvalidHeaders })
    else return new Response("400 Invalid api version", { status: 400, statusText: "Invalid api version", headers: InvalidHeaders })
}

addEventListener("fetch", event => {
    event.respondWith(handelRequest(event.request))
})