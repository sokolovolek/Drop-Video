const Server_URL = 'http://138.197.70.250:3000';
// const Server_URL = 'http://127.0.0.1:3000';

chrome.runtime.onMessage.addListener(async function(request, sender, sendResponse) {
    if (request.method == 'getSubscriptionStatus') {
        sendResponse(localStorage.unlockid);
    }

    if (request.action == 'setSubscriptionStatus') {

        localStorage.unlockid = 'null';
        localStorage.user_email = request.data.user_email;
        notify_order({ user_email: request.data.user_email, type: "ACTSUB" });
        sendResponse(localStorage.unlockid);
    }

    if (request.action == 'get_vimeo_videos') {
        getVimeoVideos(request.search_query)
            .then(response_videos => {
                sendResponse({ videosFound: true, videos: response_videos });
            })
            .catch(error => {
                sendResponse({ videosFound: false });
            });
    } else if (request.action == 'get_youtube_videos') {
        getYoutubeVideos(request.search_query)
            .then(response_videos => {
                sendResponse({ videosFound: true, videos: response_videos });
            })
            .catch(error => {
                sendResponse({ videosFound: false });
            });
    } else if (request.action == 'get_pinterest_videos') {
        getPinterestVideos(request.search_query)
            .then(response_videos => {
                sendResponse({ videosFound: true, videos: response_videos });
            })
            .catch(error => {
                sendResponse({ videosFound: false });
            });
    } else if (request.action == 'get_facebook_videos') {
        getFacebookVideos(request.search_query)
            .then(videos => {
                console.log('get_facebook_videos:', videos);
                sendResponse({ videosFound: true, videos: videos });
            })
            .catch(error => {
                sendResponse({ videosFound: false });
            });
    } else if (request.action == 'get_instagram_videos') {
        getInstagramVideos(request.search_query)
            .then(videos => {
                console.log('get_instagram_videos', videos);
                sendResponse({ videosFound: true, videos: videos });
            })
            .catch(error => {
                sendResponse({ videosFound: false });
            });
    } else if (request.action === 'download_video') {
        const url = request.url;
        const website = request.website;
        const downloadUrl = await getDownloadUrl(url, website);

        sendResponse();

        if (downloadUrl) {
            chrome.tabs.create({ url: downloadUrl });
        }
    }
    return true;
});

//DEBUG CODE;; remove on production
// if(!localStorage.getItem("user_email")){
//     localStorage.setItem("user_email", "thalesbaiao@hotmail.com")
//     localStorage.setItem("unlockid", "null")
// }

function getPinterestVideos(title) {
    return new Promise((resolve, reject) => {
        let url = `https://www.pinterest.com/resource/BaseSearchResource/get/`;
        url += `?source_urhttps://www.pinterest.com/resource/BaseSearchResource/get/`;
        url += `?source_url=/search/videos/?q=${title}&rs=filter`;
        url += `&data={"options":{"article":null,"query":"${title}","rs":"filter","scope":"videos"}}`;

        fetch(url)
            .then(response => response.json())
            .then(json => {
                let videos = json['resource_response']['data']['results'];
                let response_videos = [];

                for (const video of videos) {
                    let video_item = {};
                    video_item['thumbnail'] = video['videos']['video_list']['V_HLSV3_WEB']['thumbnail'];
                    video_item['title'] = video['title'];
                    video_item['url'] = `https://www.pinterest.com/pin/${video['id']}`;
                    response_videos.push(video_item);
                }
                if (response_videos.length > 0) {
                    resolve(response_videos);
                } else {
                    reject('No videos');
                }
            })
            .catch(error => {
                reject('No videos');
            });
    });
}

function getVimeoVideos(title) {
    return new Promise((resolve, reject) => {
        fetch(`https://api.vimeo.com/videos?query=${title}&per_page=100`, {
                headers: {
                    "Authorization": "bearer b99b8cbf68fc04cc4977b99ea95aeb93"
                }
            })
            .then(resp => resp.json())
            .then(data => {
                let videos = data.data.map(item => {
                    return {
                        thumbnail: item.pictures.sizes[3].link,
                        title: item.name,
                        url: item.link
                    }
                })
                console.log(videos)
                resolve(videos)
            })
    });
}


function getYoutubeVideos(title) {
    return new Promise((resolve, reject) => {
        fetch(`https://.googleapis.com/youtube/v3/search?part=snippet&maxResults=50&order=relevance&key=AIzaSyAPXzwqmi4NCPEqNzTXWopySitzEVIs1bM=${title}`)
            .then(resp => resp.json())
            .then(data => {
                let videos = data.items.map(item => {
                    return {
                        thumbnail: item.snippet.thumbnails.medium.url,
                        title: item.snippet.title,
                        url: `https://www.youtube.com/watch?v=${item.id.videoId}`
                    }
                })

                console.log(videos)
                resolve(videos)
            })
    });
}

async function getFacebookVideos(query) {
    const response = await fetch(`${Server_URL}/video/get`, {
        method: 'POST',
        headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json',
        },
        body: JSON.stringify({
            query,
            website: 'facebook',
        })
    });
    const data = await response.json();

    return data.data;
}

async function getDownloadUrl(url, website) {
    if (website === 'instagram') {
        const response = await fetch(url, {
            method: 'GET',
        });
        const content = await response.text();
        const el = document.createElement('div');
        el.innerHTML = content;
        const meta = el.querySelector("meta[property='og:video']");
        console.log('meta', meta);
        if (meta) {
            return meta.getAttribute('content');
        }
        return null;
    } else {
        const response = await fetch(`${Server_URL}/video/download`, {
            method: 'POST',
            headers: {
                'Accept': 'application/json',
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({ url, website })
        });
        const data = await response.json();
        return data.data;
    }
}

async function getInstagramVideos(query) {

    const delaySeconds = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

    let retryCount = 0;
    let maxRetry = 30;
    const retryHttpRequestIfFailed = async(url) => {
        var response;
        try {
            response = await fetch(url, { method: 'GET' });

            //reset the counter;
            retryCount = 0;
        } catch (error) {
            console.log(`failed ig request`, error, error.message)

            //if retry is less than the maximum enabled retry then try again otherwise not.
            if (retryCount < maxRetry) {
                //increase the counter for status
                retryCount += 1;
                await delaySeconds(300);
                retryHttpRequestIfFailed(url);
            }

        }
        return await response.json();
    }

    const getPosts = async(query, maxId = null, isNewFormat) => {

        // console.log(`before start`)
        await delaySeconds(300);
        // console.log(`start now..`);
        const url = maxId ?
            (isNewFormat ? `https://www.instagram.com/explore/tags/${query}/?__a=1&max_id=${maxId}` :
                `https://www.instagram.com/explore/tags/${query}/?__a=1&max_id=${maxId}`) :
            `https://www.instagram.com/explore/tags/${query}/?__a=1`;

        const data = await retryHttpRequestIfFailed(url);
        const dataToReturn = data.graphql ? data.graphql.hashtag.edge_hashtag_to_media : data.data.recent;
        return dataToReturn;
    }

    query = query.replace(' ', '').toLowerCase();
    const videos = [];
    let maxId = null;
    let ifNewImp = false;

    while (videos.length < 15) {
        const posts = await getPosts(query, maxId, ifNewImp);
        maxId = posts.page_info && posts.page_info.end_cursor;

        if (maxId) {

            if (!posts.page_info.has_next_page) {
                break;
            }

            for (const edge of posts.edges) {
                const node = edge.node;
                console.log(node.is_video);
                if (!node.is_video) {
                    continue;
                }

                const id = node.id;
                const title = node.edge_media_to_caption.edges.length > 0 ? node.edge_media_to_caption.edges[0].node.text : '';
                const thumbnail = node.thumbnail_src;
                const url = `https://www.instagram.com/p/${node.shortcode}/`;

                videos.push({
                    id,
                    title: title.length > 170 ?
                        `${title.substr(0, 170)}...` : title,
                    thumbnail,
                    url,
                    dlLink: ""
                });
            }
        } else {
            ifNewImp = true;
            maxId = posts.next_max_id;
            if (!maxId) {
                console.log(`not found max id from n`);
                break;
            }

            for (const section of posts.sections) {

                for (const content of section.layout_content.medias) {

                    //check if the content is video
                    if (content.media.media_type !== 2) {
                        break;
                    }
                    const title = content.media.caption.text;
                    const thumbnail = content.media.image_versions2.candidates[0].url;
                    const videoUrl = content.media.video_versions[0].url;
                    const url = `https://www.instagram.com/p/${content.media.code}/`;
                    const id = content.media.id;

                    videos.push({
                        id,
                        title: title.length > 170 ?
                            `${title.substr(0, 170)}...` : title,
                        thumbnail,
                        url,
                        dlLink: videoUrl
                    });


                }
            }

            // console.log(`videosfromn"`, videos);


        }
    }

    return videos;
}

//new code start from here where we are just adding event on install
// it will ask user for there email 
//and then it will send user to paddle
// if he is no in our DB if his subscription is ok then 
//he can proceed normal without any redirection and if not then 
//then he will go there

chrome.runtime.onInstalled.addListener(function() {
    //chrome.storage.local.set({'unlockid': null});
    localStorage.unlockid = 'NOTAC';
    // alert('Please Enter Your email Here ');

    chrome.tabs.create({
        url: 'https://www.dropvid.co/how-to-use',
        active: true
    });

    return false;
});

//pusher js code will start here when ever server hit any data about the subsciption like 
//it is expired 
//or it is extended he will get notification as well as the local storage vaiable will update so he can't use the system 

//when tab created match its aliexpress or not and then show everything 
chrome.tabs.onCreated.addListener(function(tab) {
    try {
        console.log('injecting scripts to url');
        console.log(tab);
        var url1 = new URL(tab.url);
        var domain = url1.hostname;
        var email = url1.pathname
        var email = email.replace("/in/", "");
        var email = email.replace("/", "");

        //check if domin is linked is then proceed for injecting the script 
        if (domain == 'www.aliexpress.com') {
            //adding css jquery sweetalert and loading js
            chrome.tabs.executeScript(tab.id, { file: 'js/sweet.js' });
            chrome.tabs.executeScript(tab.id, { file: 'js/loading.js' });
        }
    } catch (error) {
        console.log('Error: chrome.tabs.onCreated', error);
    }
});


chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    try {
        var url1 = new URL(tab.url);
        var domain = url1.hostname;
        var email = url1.pathname
        var email = email.replace("/in/", "");
        var email = email.replace("/", "");

        //check if domin is linked is then proceed for injecting the script 
        if (domain == 'www.aliexpress.com') {
            //adding css jquery sweetalert and loading js
            chrome.tabs.executeScript(tab.id, { file: 'js/sweet.js' });
            chrome.tabs.executeScript(tab.id, { file: 'js/loading.js' });
        }
    } catch (error) {
        console.log('Error: chrome.tabs.onUpdated', error);
    }
});

// debugger;

//pusher activation 
const pusher = new Pusher('84685046062f146b2f27', { cluster: 'us2' });
const channel = pusher.subscribe('my-channel');

channel.bind('my-event', function(data) {
    // alert(JSON.stringify(data));
    const jsondata = JSON.stringify(data);
    const jsonparse = jQuery.parseJSON(jsondata);
    // console.log(jsondata);
    console.log(jsonparse);
    notify_order(jsonparse);
});


function notify_order(requestdata) {
    console.log(requestdata);

    if (requestdata.user_email == localStorage.user_email && requestdata.type == 'CARDDEC') {
        const options = {
            type: "basic",
            title: "Opps ",
            message: "Your Renewal Failed due to payment failed",
            iconUrl: "/assets/icons/16.png",
        };

        localStorage.unlockid = 'CARDDEC';
        chrome.notifications.create('request', options, n_callback);

    } else if (requestdata.user_email == localStorage.user_email && requestdata.type == 'ACTSUB') {
        const options = {
            type: "basic",
            title: "Thanks",
            message: "Your Extension is activated Successfully",
            iconUrl: "/assets/icons/16.png",
        };

        localStorage.unlockid = 'null';
        chrome.notifications.create('request', options, n_callback);

    } else if (requestdata.user_email == localStorage.user_email && requestdata.type == 'SPEXP') {
        const options = {
            type: "basic",
            title: "Thanks",
            message: "You Cancelled Your subsciption",
            iconUrl: "/assets/icons/16.png",
        };

        localStorage.unlockid = 'SPEXP';
        chrome.notifications.create('request', options, n_callback);
    }
}

function n_callback() {

}