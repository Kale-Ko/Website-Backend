/**
    @license
    MIT License
    Copyright (c) 2021 Kale Ko
    See https://kaleko.ga/license.txt
*/

const markedIt = require("./lib/marked-it.js")()

const CONFIG = { GITHUB_USERNAME, GITHUB_API_TOKEN }

var JsonHeaders = new Headers()
JsonHeaders.set("Content-Type", "application/json")
JsonHeaders.set("Access-Control-Allow-Origin", "*")
var TextHeaders = new Headers()
TextHeaders.set("Content-Type", "text/plain")
TextHeaders.set("Access-Control-Allow-Origin", "*")
var HtmlHeaders = new Headers()
HtmlHeaders.set("Content-Type", "text/html")
HtmlHeaders.set("Access-Control-Allow-Origin", "*")

async function handelRequest(req) {
    var url = new URL(req.url)
    var version = url.pathname.split("/")[1]
    var endpoint = url.pathname.split("/").slice(2, url.pathname.split("/").length - 1)

    if (version == "help") return new Response("/v4 (Current)\n/v3 (Outdated)\n\n/v2 (Depreciated)\n/v1 (Depreciated)", { status: 200, statusText: "Ok", headers: TextHeaders })
    else if (version == "v1" || "v2") return new Response(version + " has been depreciated, please use a different one", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
    else if (version == "v3") {
        if (endpoint[0] == "github") {
            if (endpoint[1] == "profile") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        login,
                                        name,
                                        url,
                                        createdAt,
                                        avatarUrl,
                                        bio,
                                        status {
                                            emoji,
                                            message
                                        },
                                        company,
                                        websiteUrl,
                                        email,
                                        twitterUsername,
                                        location,
                                    
                                        followers(first:100) {
                                            nodes {
                                                login,
                                                name,
                                                url
                                            }
                                        },
                                        following(first:100) {
                                            nodes {
                                                login,
                                                name,
                                                url
                                            }
                                        }, 
                                    
                                        organizations(first:100) {
                                            nodes {
                                                login,
                                                name,
                                                url
                                            }
                                        }
                                    }
                                }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user

                        data.followers = data.followers.nodes
                        data.following = data.following.nodes
                        data.organizations = data.organizations.nodes

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: JsonHeaders })
            } else if (endpoint[1] == "readme") {
                if (endpoint[2] == "html") {
                    var response = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = markedIt.render(data)
                    })

                    return new Response(response, { status: 200, statusText: "Ok", headers: HtmlHeaders })
                } else if (endpoint[2] == "json") {
                    var response = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = markedIt.parse(data)
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else if (endpoint[2] == "text") {
                    var response = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = data
                    })

                    return new Response(response, { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "repositories") {
                if (endpoint[2] == "json") {
                    var response = []

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        repositories(first:100) {
                                            nodes {
                                                name,
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url,
                                                createdAt,
                                                description,
                                                visibility,
                                                homepageUrl,
                                                licenseInfo {
                                                    key,
                                                    name,
                                                    url
                                                },
                                                primaryLanguage {
                                                    name
                                                },

                                                collaborators(first:100) {
                                                    nodes {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },

                                                stargazerCount,
                                                forkCount,
                                                isArchived,
                                                isFork,
                                                isPrivate,

                                                issues(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },
                                                pullRequests(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },

                                                releases(first: 100) {
                                                    nodes {
                                                        tagName,
                                                        name,
                                                        url
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }`
                        }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.repositories.nodes

                        data.forEach(repo => {
                            if (repo == null || repo.visibility == "PRIVATE") return data.splice(data.indexOf(repo), 1)

                            if (repo.collaborators != null) data[data.indexOf(repo)].collaborators = repo.collaborators.nodes
                            if (data[data.indexOf(repo)].primaryLanguage != null) data[data.indexOf(repo)].primaryLanguage = repo.primaryLanguage.name
                            data[data.indexOf(repo)].issues = repo.issues.nodes
                            data[data.indexOf(repo)].pullRequests = repo.pullRequests.nodes
                            data[data.indexOf(repo)].releases = repo.releases.nodes
                        })

                        data.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                        data.sort((a, b) => b.stargazerCount - a.stargazerCount)
                        data.sort((a, b) => (a.isArchived == b.isArchived) ? 0 : (a.isArchived ? 1 : -1))

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "pins") {
                if (endpoint[2] == "json") {
                    var response = []

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        pinnedItems(first:6) {
                                            nodes {
                                                ... on Repository {     
                                                    name,
                                                    owner {
                                                        ... on User {
                                                            login,
                                                            name,
                                                            url
                                                        }
                                                    },
                                                    url,
                                                    createdAt,
                                                    description,
                                                    visibility,
                                                    homepageUrl,
                                                    licenseInfo {
                                                        key,
                                                        name,
                                                        url
                                                    },
                                                    primaryLanguage {
                                                        name
                                                    },
                                                    
                                                    collaborators(first:100) {
                                                        nodes {
                                                            login,
                                                            name,
                                                            url
                                                        }
                                                    },

                                                    stargazerCount,
                                                    forkCount,
                                                    isArchived,
                                                    isFork,
                                                    isPrivate,

                                                    issues(first:100) {
                                                        nodes {
                                                            number,
                                                            title,
                                                            url
                                                        }
                                                    },
                                                    pullRequests(first:100) {
                                                        nodes {
                                                            number,
                                                            title,
                                                            url
                                                        }
                                                    },

                                                    releases(first: 100) {
                                                        nodes {
                                                            tagName,
                                                            name,
                                                            url
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }`
                        }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.pinnedItems.nodes

                        data.forEach(repo => {
                            if (repo == null || repo.visibility == "PRIVATE") return data.splice(data.indexOf(repo), 1)

                            if (repo.collaborators != null) data[data.indexOf(repo)].collaborators = repo.collaborators.nodes
                            if (data[data.indexOf(repo)].primaryLanguage != null) data[data.indexOf(repo)].primaryLanguage = repo.primaryLanguage.name
                            data[data.indexOf(repo)].issues = repo.issues.nodes
                            data[data.indexOf(repo)].pullRequests = repo.pullRequests.nodes
                            data[data.indexOf(repo)].releases = repo.releases.nodes
                        })

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "stars") {
                if (endpoint[2] == "json") {
                    var response = []

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        starredRepositories(first:100) {
                                            nodes { 
                                                name,
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url,
                                                createdAt,
                                                description,
                                                visibility,
                                                homepageUrl,
                                                licenseInfo {
                                                    key,
                                                    name,
                                                    url
                                                },
                                                primaryLanguage {
                                                    name
                                                },
                                                    
                                                collaborators(first:100) {
                                                    nodes {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },

                                                stargazerCount,
                                                forkCount,
                                                isArchived,
                                                isFork,
                                                isPrivate,

                                                issues(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },
                                                pullRequests(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },

                                                releases(first: 100) {
                                                    nodes {
                                                        tagName,
                                                        name,
                                                        url
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }`
                        }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.starredRepositories.nodes

                        data.forEach(repo => {
                            if (repo == null || repo.visibility == "PRIVATE") return data.splice(data.indexOf(repo), 1)

                            if (repo.collaborators != null) data[data.indexOf(repo)].collaborators = repo.collaborators.nodes
                            if (data[data.indexOf(repo)].primaryLanguage != null) data[data.indexOf(repo)].primaryLanguage = repo.primaryLanguage.name
                            data[data.indexOf(repo)].issues = repo.issues.nodes
                            data[data.indexOf(repo)].pullRequests = repo.pullRequests.nodes
                            data[data.indexOf(repo)].releases = repo.releases.nodes
                        })

                        data.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                        data.sort((a, b) => b.stargazerCount - a.stargazerCount)

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "gists") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        gists(first:100) {
                                            nodes {
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url
                                                createdAt,
                                                description,
                                                
                                                stargazerCount
                                                isFork,
                                                isPublic,

                                                files {
                                                    name,
                                                    extension
                                                    size
                                                    language {
                                                        name
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.gists.nodes

                        data.forEach(gist => {
                            if (gist == null || !gist.isPublic) return data.splice(data.indexOf(gist), 1)
                        })

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: JsonHeaders })
            } else if (endpoint[1] == "projects") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        projectsNext(first:100) {
                                            nodes {
                                                number,
                                                title,
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url,
                                                createdAt,
                                                description,

                                                closed
                                            }
                                        }
                                    }
                                }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.projectsNext.nodes

                        data.forEach(project => {
                            if (project == null || project.title.includes("Private")) return data.splice(data.indexOf(project), 1)
                        })

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: JsonHeaders })
            } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
        } else if (endpoint[0] == "online") return new Response("200 Online", { status: 200, statusText: "Online", headers: JsonHeaders })
        else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
    } else if (version == "v4") {
        if (endpoint[0] == "help") return new Response("/help - Api help page\n/online - Check your connection\n/github - Github endpoints", { status: 200, statusText: "Ok", headers: TextHeaders })
        else if (endpoint[0] == "github") {
            if (endpoint[0] == "help") return new Response("/github/help - Github api help page\n/profile\n/readme\n/repositories\n/pins\n/stars\n/gists\n/projects", { status: 200, statusText: "Ok", headers: TextHeaders })
            else if (endpoint[1] == "profile") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        login,
                                        name,
                                        url,
                                        createdAt,
                                        avatarUrl,
                                        bio,
                                        status {
                                            emoji,
                                            message
                                        },
                                        company,
                                        websiteUrl,
                                        email,
                                        twitterUsername,
                                        location,
                                    
                                        followers(first:100) {
                                            nodes {
                                                login,
                                                name,
                                                url
                                            }
                                        },
                                        following(first:100) {
                                            nodes {
                                                login,
                                                name,
                                                url
                                            }
                                        }, 
                                    
                                        organizations(first:100) {
                                            nodes {
                                                login,
                                                name,
                                                url
                                            }
                                        }
                                    }
                                }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user

                        data.followers = data.followers.nodes
                        data.following = data.following.nodes
                        data.organizations = data.organizations.nodes

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: JsonHeaders })
            } else if (endpoint[1] == "readme") {
                if (endpoint[2] == "html") {
                    var response = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = markedIt.render(data)
                    })

                    return new Response(response, { status: 200, statusText: "Ok", headers: HtmlHeaders })
                } else if (endpoint[2] == "json") {
                    var response = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = markedIt.parse(data)
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else if (endpoint[2] == "text") {
                    var response = ""

                    await fetch("https://raw.githubusercontent.com/" + CONFIG.GITHUB_USERNAME + "/" + CONFIG.GITHUB_USERNAME + "/master/README.md", { headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "token ghp_" + CONFIG.GITHUB_API_TOKEN } }).then(res => res.text()).then(data => {
                        if (data == undefined) return new Response("500 Internal fetch error")

                        response = data
                    })

                    return new Response(response, { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "repositories") {
                if (endpoint[2] == "json") {
                    var response = []

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        repositories(first:100) {
                                            nodes {
                                                name,
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url,
                                                createdAt,
                                                description,
                                                visibility,
                                                homepageUrl,
                                                licenseInfo {
                                                    key,
                                                    name,
                                                    url
                                                },
                                                primaryLanguage {
                                                    name
                                                },

                                                collaborators(first:100) {
                                                    nodes {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },

                                                stargazerCount,
                                                forkCount,
                                                isArchived,
                                                isFork,
                                                isPrivate,

                                                issues(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },
                                                pullRequests(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },

                                                releases(first: 100) {
                                                    nodes {
                                                        tagName,
                                                        name,
                                                        url
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }`
                        }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.repositories.nodes

                        data.forEach(repo => {
                            if (repo == null || repo.visibility == "PRIVATE") return data.splice(data.indexOf(repo), 1)

                            if (repo.collaborators != null) data[data.indexOf(repo)].collaborators = repo.collaborators.nodes
                            if (data[data.indexOf(repo)].primaryLanguage != null) data[data.indexOf(repo)].primaryLanguage = repo.primaryLanguage.name
                            data[data.indexOf(repo)].issues = repo.issues.nodes
                            data[data.indexOf(repo)].pullRequests = repo.pullRequests.nodes
                            data[data.indexOf(repo)].releases = repo.releases.nodes
                        })

                        data.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                        data.sort((a, b) => b.stargazerCount - a.stargazerCount)
                        data.sort((a, b) => (a.isArchived == b.isArchived) ? 0 : (a.isArchived ? 1 : -1))

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "pins") {
                if (endpoint[2] == "json") {
                    var response = []

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        pinnedItems(first:6) {
                                            nodes {
                                                ... on Repository {     
                                                    name,
                                                    owner {
                                                        ... on User {
                                                            login,
                                                            name,
                                                            url
                                                        }
                                                    },
                                                    url,
                                                    createdAt,
                                                    description,
                                                    visibility,
                                                    homepageUrl,
                                                    licenseInfo {
                                                        key,
                                                        name,
                                                        url
                                                    },
                                                    primaryLanguage {
                                                        name
                                                    },
                                                    
                                                    collaborators(first:100) {
                                                        nodes {
                                                            login,
                                                            name,
                                                            url
                                                        }
                                                    },

                                                    stargazerCount,
                                                    forkCount,
                                                    isArchived,
                                                    isFork,
                                                    isPrivate,

                                                    issues(first:100) {
                                                        nodes {
                                                            number,
                                                            title,
                                                            url
                                                        }
                                                    },
                                                    pullRequests(first:100) {
                                                        nodes {
                                                            number,
                                                            title,
                                                            url
                                                        }
                                                    },

                                                    releases(first: 100) {
                                                        nodes {
                                                            tagName,
                                                            name,
                                                            url
                                                        }
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }`
                        }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.pinnedItems.nodes

                        data.forEach(repo => {
                            if (repo == null || repo.visibility == "PRIVATE") return data.splice(data.indexOf(repo), 1)

                            if (repo.collaborators != null) data[data.indexOf(repo)].collaborators = repo.collaborators.nodes
                            if (data[data.indexOf(repo)].primaryLanguage != null) data[data.indexOf(repo)].primaryLanguage = repo.primaryLanguage.name
                            data[data.indexOf(repo)].issues = repo.issues.nodes
                            data[data.indexOf(repo)].pullRequests = repo.pullRequests.nodes
                            data[data.indexOf(repo)].releases = repo.releases.nodes
                        })

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "stars") {
                if (endpoint[2] == "json") {
                    var response = []

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        starredRepositories(first:100) {
                                            nodes { 
                                                name,
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url,
                                                createdAt,
                                                description,
                                                visibility,
                                                homepageUrl,
                                                licenseInfo {
                                                    key,
                                                    name,
                                                    url
                                                },
                                                primaryLanguage {
                                                    name
                                                },
                                                    
                                                collaborators(first:100) {
                                                    nodes {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },

                                                stargazerCount,
                                                forkCount,
                                                isArchived,
                                                isFork,
                                                isPrivate,

                                                issues(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },
                                                pullRequests(first:100) {
                                                    nodes {
                                                        number,
                                                        title,
                                                        url
                                                    }
                                                },

                                                releases(first: 100) {
                                                    nodes {
                                                        tagName,
                                                        name,
                                                        url
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }`
                        }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.starredRepositories.nodes

                        data.forEach(repo => {
                            if (repo == null || repo.visibility == "PRIVATE") return data.splice(data.indexOf(repo), 1)

                            if (repo.collaborators != null) data[data.indexOf(repo)].collaborators = repo.collaborators.nodes
                            if (data[data.indexOf(repo)].primaryLanguage != null) data[data.indexOf(repo)].primaryLanguage = repo.primaryLanguage.name
                            data[data.indexOf(repo)].issues = repo.issues.nodes
                            data[data.indexOf(repo)].pullRequests = repo.pullRequests.nodes
                            data[data.indexOf(repo)].releases = repo.releases.nodes
                        })

                        data.sort((a, b) => (a.name < b.name ? -1 : (a.name > b.name ? 1 : 0)))
                        data.sort((a, b) => b.stargazerCount - a.stargazerCount)

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
            } else if (endpoint[1] == "gists") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        gists(first:100) {
                                            nodes {
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url
                                                createdAt,
                                                description,
                                                
                                                stargazerCount
                                                isFork,
                                                isPublic,

                                                files {
                                                    name,
                                                    extension
                                                    size
                                                    language {
                                                        name
                                                    }
                                                }
                                            }
                                        }
                                    }
                                }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.gists.nodes

                        data.forEach(gist => {
                            if (gist == null || !gist.isPublic) return data.splice(data.indexOf(gist), 1)
                        })

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: JsonHeaders })
            } else if (endpoint[1] == "projects") {
                if (endpoint[2] == "json") {
                    var response = {}

                    await fetch("https://api.github.com/graphql", {
                        method: "POST", body: JSON.stringify({
                            query:
                                `query {
                                    user(login:"${CONFIG.GITHUB_USERNAME}") {
                                        projectsNext(first:100) {
                                            nodes {
                                                number,
                                                title,
                                                owner {
                                                    ... on User {
                                                        login,
                                                        name,
                                                        url
                                                    }
                                                },
                                                url,
                                                createdAt,
                                                description,

                                                closed
                                            }
                                        }
                                    }
                                }` }), headers: { "User-Agent": "Mozilla/5.0 Cloudflare/Workers", "Authorization": "bearer ghp_" + CONFIG.GITHUB_API_TOKEN }
                    }).then(res => res.json()).then(data => {
                        data = data.data.user.projectsNext.nodes

                        data.forEach(project => {
                            if (project == null || project.title.includes("Private")) return data.splice(data.indexOf(project), 1)
                        })

                        response = data
                    })

                    return new Response(JSON.stringify(response, null, 2), { status: 200, statusText: "Ok", headers: JsonHeaders })
                } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: JsonHeaders })
            } else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
        } else if (endpoint[0] == "online") return new Response("200 Online", { status: 200, statusText: "Online", headers: JsonHeaders })
        else return new Response("400 Invalid endpoint", { status: 400, statusText: "Invalid endpoint", headers: TextHeaders })
    } else if (version == undefined || version == "") return new Response("Welcome to the api, try sending a request (eg GET https://api.kaleko.ga/v3/github/profile/json/)\nIf you need help go to https://api.kaleko.ga/help", { status: 200, statusText: "Ok", headers: TextHeaders })
    else return new Response("400 Invalid api version", { status: 400, statusText: "Invalid api version", headers: TextHeaders })
}

addEventListener("fetch", event => { event.respondWith(handelRequest(event.request)) })