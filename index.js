const markedIt = require("./marked-it.js")()

const CONFIG = { GITHUB_USERNAME, GITHUB_API_TOKEN }

var OkHeaders = new Headers()
OkHeaders.set("Content-Type", "application/json")
OkHeaders.set("Access-Control-Allow-Origin", "*")
var HtmlHeaders = new Headers()
HtmlHeaders.set("Content-Type", "text/html")
HtmlHeaders.set("Access-Control-Allow-Origin", "*")
var InvalidHeaders = new Headers()
InvalidHeaders.set("Content-Type", "text/plain")
InvalidHeaders.set("Access-Control-Allow-Origin", "*")

async function handelRequest(req) {
    var url = new URL(req.url)
    var version = url.pathname.split("/")[1]
    var endpoint = url.pathname.split("/").slice(2, url.pathname.split("/").length - 1)

    if (version == "v1") {
        if (endpoint[0] == "github") {
            if (endpoint[1] == "profile") {
                var response = {}

                await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME, { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                    if (data == undefined) return new Response("500 Internal fetch error")

                    response = data
                })

                response.url = response.html_url
                response.homepage = response.blog

                var todelete = ["id", "node_id", "html_url", "followers_url", "following_url", "gists_url", "starred_url", "subscriptions_url", "organizations_url", "repos_url", "events_url", "received_events_url", "type", "site_admin", "blog", "company", "hireable", "created_at"]
                todelete.forEach(item => { delete response[item] })

                return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "profile-raw") {
                var response = {}

                await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME, { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                    if (data == undefined) return new Response("500 Internal fetch error")

                    response = data
                })

                return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "readme") {
                var readme = ""

                await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                    if (data == undefined) return new Response("500 Internal fetch error")

                    readme = markedIt.render(data)
                })

                return new Response(readme, { status: 200, statusText: "Ok", headers: HtmlHeaders })
            } else if (endpoint[1] == "readme-raw") {
                var readme = ""

                await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                    if (data == undefined) return new Response("500 Internal fetch error")

                    readme = data
                })

                return new Response(readme, { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "projects") {
                var repos = []

                await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                    if (data == undefined) return new Response("500 Internal fetch error")

                    data.forEach(repo => {
                        if (repo.stargazers_count > 0 && !repo.private) {
                            repo.url = repo.html_url

                            var todelete = ["id", "node_id", "private", "owner", "fork", "html_url", "forks_url", "keys_url", "collaborators_url", "teams_url", "hooks_url", "issue_events_url", "events_url", "assignees_url", "branches_url", "tags_url", "blobs_url", "git_tags_url", "git_refs_url", "trees_url", "statuses_url", "languages_url", "stargazers_url", "contributors_url", "subscribers_url", "subscription_url", "commits_url", "git_commits_url", "comments_url", "issue_comment_url", "contents_url", "compare_url", "merges_url", "archive_url", "downloads_url", "issues_url", "pulls_url", "milestones_url", "notifications_url", "labels_url", "releases_url", "deployments_url", "pushed_at", "git_url", "ssh_url", "clone_url", "svn_url", "size", "has_issues", "has_projects", "has_downloads", "has_wiki", "has_pages", "forks_count", "mirror_url", "open_issues_count", "license", "allow_forking", "forks", "open_issues", "watchers", "default_branch", "permissions", "language", "disabled", "created_at"]
                            todelete.forEach(item => { delete repo[item] })

                            repos.push(repo)
                        }
                    })
                })

                repos.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                repos.sort((a, b) => (a.archived == b.archived) ? 0 : (a.archived ? 1 : -1))

                return new Response(JSON.stringify(repos, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "projects-raw") {
                var repos = []

                await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                    if (data == undefined) return new Response("500 Internal fetch error")

                    data.forEach(repo => { if (repo.stargazers_count > 0 && !repo.private) repos.push(repo) })
                })

                repos.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))

                return new Response(JSON.stringify(repos, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "showcase") {
                var showcase = []

                await fetch("https://api.github.com/graphql", { method: "POST", body: JSON.stringify({ query: `query { user(login:"${CONFIG.GITHUB_USERNAME}") { pinnedItems(last:6) { nodes { ... on Repository { name } } } } }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(async data => {
                    data = JSON.parse(data).data

                    if (data == undefined) return new Response("500 Internal fetch error")

                    var pinned = []
                    data.user.pinnedItems.nodes.forEach(item => { pinned.push(item.name) })

                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        data.forEach(repo => {
                            if (pinned.includes(repo.name) && !repo.private) {
                                repo.url = repo.html_url

                                var todelete = ["id", "node_id", "private", "owner", "fork", "html_url", "forks_url", "keys_url", "collaborators_url", "teams_url", "hooks_url", "issue_events_url", "events_url", "assignees_url", "branches_url", "tags_url", "blobs_url", "git_tags_url", "git_refs_url", "trees_url", "statuses_url", "languages_url", "stargazers_url", "contributors_url", "subscribers_url", "subscription_url", "commits_url", "git_commits_url", "comments_url", "issue_comment_url", "contents_url", "compare_url", "merges_url", "archive_url", "downloads_url", "issues_url", "pulls_url", "milestones_url", "notifications_url", "labels_url", "releases_url", "deployments_url", "pushed_at", "git_url", "ssh_url", "clone_url", "svn_url", "size", "has_issues", "has_projects", "has_downloads", "has_wiki", "has_pages", "forks_count", "mirror_url", "open_issues_count", "license", "allow_forking", "forks", "open_issues", "watchers", "default_branch", "permissions", "language", "disabled", "created_at"]
                                todelete.forEach(item => { delete repo[item] })

                                showcase[pinned.indexOf(repo.name)] = repo
                            }
                        })
                    })
                })

                return new Response(JSON.stringify(showcase, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else if (endpoint[1] == "showcase-raw") {
                var showcase = []

                await fetch("https://api.github.com/graphql", { method: "POST", body: JSON.stringify({ query: `query { user(login:"${CONFIG.GITHUB_USERNAME}") { pinnedItems(last:6) { nodes { ... on Repository { name } } } } }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(async data => {
                    data = JSON.parse(data).data

                    if (data == undefined) return new Response("500 Internal fetch error")

                    var pinned = []
                    data.user.pinnedItems.nodes.forEach(item => { pinned.push(item.name) })

                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        data.forEach(repo => {
                            if (pinned.includes(repo.name) && !repo.private) showcase[pinned.indexOf(repo.name)] = repo
                        })
                    })
                })

                return new Response(JSON.stringify(showcase, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
            } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
        } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
    } else if (version == "v2") {
        if (endpoint[0] == "github") {
            if (endpoint[1] == "profile") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME, { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = data
                    })

                    response.url = response.html_url
                    response.homepage = response.blog

                    var todelete = ["id", "node_id", "html_url", "followers_url", "following_url", "gists_url", "starred_url", "subscriptions_url", "organizations_url", "repos_url", "events_url", "received_events_url", "type", "site_admin", "blog", "company", "hireable", "created_at"]
                    todelete.forEach(item => { delete response[item] })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else if (endpoint[2] == "raw-json") {
                    var response = {}

                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME, { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
            } else if (endpoint[1] == "readme") {
                if (endpoint[2] == "html") {
                    var readme = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        readme = markedIt.render(data)
                    })

                    return new Response(readme, { status: 200, statusText: "Ok", headers: HtmlHeaders })
                } else if (endpoint[2] == "json") {
                    var readme = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        readme = markedIt.parse(data)
                    })

                    return new Response(JSON.stringify(readme, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else if (endpoint[2] == "text") {
                    var readme = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        readme = data
                    })

                    return new Response(readme, { status: 200, statusText: "Ok", headers: OkHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
            } else if (endpoint[1] == "projects") {
                if (endpoint[2] == "json") {
                    var repos = []

                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        data.forEach(repo => {
                            if (repo.stargazers_count > 0 && !repo.private) {
                                repo.url = repo.html_url

                                var todelete = ["id", "node_id", "private", "owner", "fork", "html_url", "forks_url", "keys_url", "collaborators_url", "teams_url", "hooks_url", "issue_events_url", "events_url", "assignees_url", "branches_url", "tags_url", "blobs_url", "git_tags_url", "git_refs_url", "trees_url", "statuses_url", "languages_url", "stargazers_url", "contributors_url", "subscribers_url", "subscription_url", "commits_url", "git_commits_url", "comments_url", "issue_comment_url", "contents_url", "compare_url", "merges_url", "archive_url", "downloads_url", "issues_url", "pulls_url", "milestones_url", "notifications_url", "labels_url", "releases_url", "deployments_url", "pushed_at", "git_url", "ssh_url", "clone_url", "svn_url", "size", "has_issues", "has_projects", "has_downloads", "has_wiki", "has_pages", "forks_count", "mirror_url", "open_issues_count", "license", "allow_forking", "forks", "open_issues", "watchers", "default_branch", "permissions", "language", "disabled", "created_at"]
                                todelete.forEach(item => { delete repo[item] })

                                repos.push(repo)
                            }
                        })
                    })

                    repos.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                    repos.sort((a, b) => (a.archived == b.archived) ? 0 : (a.archived ? 1 : -1))

                    return new Response(JSON.stringify(repos, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else if (endpoint[2] == "raw-json") {
                    var repos = []

                    await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        data.forEach(repo => { if (repo.stargazers_count > 0 && !repo.private) repos.push(repo) })
                    })

                    repos.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))

                    return new Response(JSON.stringify(repos, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
            } else if (endpoint[1] == "showcase") {
                if (endpoint[2] == "json") {
                    var showcase = []

                    await fetch("https://api.github.com/graphql", { method: "POST", body: JSON.stringify({ query: `query { user(login:"${CONFIG.GITHUB_USERNAME}") { pinnedItems(last:6) { nodes { ... on Repository { name } } } } }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(async data => {
                        data = JSON.parse(data).data

                        if (data == undefined) return new Response("500 Internal fetch error")

                        var pinned = []
                        data.user.pinnedItems.nodes.forEach(item => { pinned.push(item.name) })

                        await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                            if (data == undefined) return new Response("500 Internal fetch error")

                            data.forEach(repo => {
                                if (pinned.includes(repo.name) && !repo.private) {
                                    repo.url = repo.html_url

                                    var todelete = ["id", "node_id", "private", "owner", "fork", "html_url", "forks_url", "keys_url", "collaborators_url", "teams_url", "hooks_url", "issue_events_url", "events_url", "assignees_url", "branches_url", "tags_url", "blobs_url", "git_tags_url", "git_refs_url", "trees_url", "statuses_url", "languages_url", "stargazers_url", "contributors_url", "subscribers_url", "subscription_url", "commits_url", "git_commits_url", "comments_url", "issue_comment_url", "contents_url", "compare_url", "merges_url", "archive_url", "downloads_url", "issues_url", "pulls_url", "milestones_url", "notifications_url", "labels_url", "releases_url", "deployments_url", "pushed_at", "git_url", "ssh_url", "clone_url", "svn_url", "size", "has_issues", "has_projects", "has_downloads", "has_wiki", "has_pages", "forks_count", "mirror_url", "open_issues_count", "license", "allow_forking", "forks", "open_issues", "watchers", "default_branch", "permissions", "language", "disabled", "created_at"]
                                    todelete.forEach(item => { delete repo[item] })

                                    showcase[pinned.indexOf(repo.name)] = repo
                                }
                            })
                        })
                    })

                    return new Response(JSON.stringify(showcase, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else if (endpoint[2] == "raw-json") {
                    var showcase = []

                    await fetch("https://api.github.com/graphql", { method: "POST", body: JSON.stringify({ query: `query { user(login:"${CONFIG.GITHUB_USERNAME}") { pinnedItems(last:6) { nodes { ... on Repository { name } } } } }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(async data => {
                        data = JSON.parse(data).data

                        if (data == undefined) return new Response("500 Internal fetch error")

                        var pinned = []
                        data.user.pinnedItems.nodes.forEach(item => { pinned.push(item.name) })

                        await fetch("https://api.github.com/users/" + CONFIG.GITHUB_USERNAME + "/repos?per_page=100", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.json()).then(data => {
                            if (data == undefined) return new Response("500 Internal fetch error")

                            data.forEach(repo => {
                                if (pinned.includes(repo.name) && !repo.private) showcase[pinned.indexOf(repo.name)] = repo
                            })
                        })
                    })

                    return new Response(JSON.stringify(showcase, null, 2), { status: 200, statusText: "Ok", headers: OkHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
            } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
        } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: InvalidHeaders })
    } else if (version == undefined || version == "") return new Response("400 An api version must be specified", { status: 400, statusText: "An api version must be specified", headers: InvalidHeaders })
    else return new Response("400 Invalid api version", { status: 400, statusText: "Invalid api version", headers: InvalidHeaders })
}

addEventListener("fetch", event => { event.respondWith(handelRequest(event.request)) })