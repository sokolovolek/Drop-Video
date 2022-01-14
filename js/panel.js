function initEvents() {
    $('body').on('click', 'button.btn-download', onDownloadButtonClicked);
}

async function loadYoutubeVideos(query) {
    showProgress('#youtube_fragment');
    const data = await sendMessage({ action: 'get_youtube_videos', search_query: query });

    if (data == undefined || !data['videosFound']) {
        return;
    }

    for (const video of data['videos']) {
        const content = `
        <tr>
            <td><img src="${video['thumbnail']}" class="img-thumbnail"></td>
            <td class="video-title">
                <a href="${video['url']}" target="_blank">${video['title']}</a>
            </td>
            <td>
                <a href="${video['url']}" target="_blank" class="btn btn-danger text-white" title="Watch on Youtube">
                    <i class="fa fa-youtube-play"></i> 
                    Watch
                </a>
                <a href="${Server_URL}/video/download?website=youtube&url=${encodeURIComponent(video['url'])}"
                    class="btn btn-primary btn-download"
                    target="_blank"
                    title="Download"
                >
                    <i class="fa fa-download"></i> 
                    Download
                </a>
            </td>
        </tr>`;

        $("#youtube_fragment tbody").append(content);
    }

    hideProgress('#youtube_fragment');
}

async function loadVimeoVideos(query) {
    showProgress('#vimeo_fragment');
    const data = await sendMessage({ action: 'get_vimeo_videos', search_query: query });
    hideProgress('#vimeo_fragment');

    if (data == undefined || !data['videosFound']) {
        return;
    }

    for (const video of data['videos']) {
        const content = `
        <tr>
            <td><img src="${video['thumbnail']}" class="img-thumbnail"></td>
            <td class="video-title">
                <a href="${video['url']}" target="_blank">${video['title']}</a>
            </td>
            <td>
                <a href="${video['url']}" target="_blank" class="btn btn-primary" title="Watch on Vimeo">
                    <i class="fa fa-vimeo"></i> Watch
                </a>
                <button type="button" 
                    class="btn btn-primary btn-download ladda-button" 
                    title="Download"
                    data-url="${video['url']}" 
                    data-website="vimeo"
                    data-style="slide-right"
                >
                    <i class="fa fa-download"></i> 
                    Download
                </button>
            </td>
        </tr>`;
        $("#vimeo_fragment tbody").append(content);
    }
}

async function loadPinterestVideos(query) {
    showProgress('#pinterest_fragment');
    const data = await sendMessage({ action: 'get_pinterest_videos', search_query: query });
    hideProgress('#pinterest_fragment');

    if (data == undefined || !data['videosFound']) {
        return;
    }

    for (const video of data['videos']) {
        const content = `
        <tr>
            <td><img src="${video['thumbnail']}" class="img-thumbnail" width="200"></td>
            <td class="video-title">
                <a href="${video['url']}" target="_blank">${video['title']}</a>
            </td>
            <td>
                <a href="${video['url']}" target="_blank" class="btn btn-danger" title="Watch on Pinterest">
                    <i class="fa fa-pinterest"></i> Watch
                </a>
                <button type="button" 
                    class="btn btn-primary btn-download ladda-button" 
                    title="Download"
                    data-url="${video['url']}" 
                    data-website="pinterest"
                    data-style="slide-right"
                >
                    <i class="fa fa-download"></i> 
                    Download
                </button>
            </td>
        </tr>`;
        $("#pinterest_fragment tbody").append(content);
    }
}

async function loadFacebookVideos(query) {
    showProgress('#facebook_fragment');
    const data = await sendMessage({ action: 'get_facebook_videos', search_query: query });
    hideProgress('#facebook_fragment');

    if (data == undefined || !data['videosFound']) {
        return;
    }

    for (const video of data.videos) {
        const content = `
            <tr>
                <td><img src="${video['thumbnail']}" class="img-thumbnail"></td>
                <td class="video-title">
                    <a href="${video['url']}" target="_blank">${video['title']}</a>
                </td>
                <td>
                    <a href="${video['url']}" target="_blank" class="btn btn-primary" title="Watch on Vimeo">
                        <i class="fa fa-facebook"></i> 
                        Watch
                    </a>
                    <button type="button" 
                        class="btn btn-primary btn-download ladda-button" 
                        title="Download"
                        data-url="${video['url']}" 
                        data-website="facebook"
                        data-style="slide-right"
                    >
                        <i class="fa fa-download"></i> 
                        Download
                    </button>
                </td>
            </tr>`;
        $("#facebook_fragment tbody").append(content);
    }
}

async function loadInstagramVideos(query) {
    showProgress('#instagram_fragment');
    const data = await sendMessage({ action: 'get_instagram_videos', search_query: query });
    hideProgress('#instagram_fragment');

    if (data == undefined || !data['videosFound']) {
        return;
    }

    for (const video of data.videos) {
        const content = `
            <tr>
                <td><img src="${video['thumbnail']}" class="img-thumbnail"></td>
                <td class="video-title">
                    <a href="${video['url']}" target="_blank">${video['title']}</a>
                </td>
                <td>
                    <a href="${video['url']}" target="_blank" class="btn btn-primary" title="Watch on Vimeo">
                        <i class="fa fa-instagram"></i> 
                        Watch
                    </a>
                    <button type="button" 
                        class="btn btn-primary btn-download ladda-button" 
                        title="Download"
                        data-url="${video['url']}" 
                        data-dlLink="${video['dlLink']}"
                        data-website="instagram"
                        data-style="slide-right"
                    >
                        <i class="fa fa-download"></i> 
                        Download
                    </button>
                </td>
            </tr>`;
        $("#instagram_fragment tbody").append(content);
    }
}

function sendMessage(message) {
    return new Promise((resolve, reject) => {
        chrome.runtime.sendMessage(message, response => resolve(response));
    });
}


async function loadJSPanel() {
    //debugger;
    //send message to background script what is the status of the unlock code now 
    chrome.runtime.sendMessage({ method: "getSubscriptionStatus" }, function(response) {
        console.log(response.status);
        localStorage.unlockid = response;
    });

    //alert(localStorage.unlockid);
    if (localStorage.unlockid != 'NOTAC' && localStorage.unlockid != 'SPEXP' && localStorage.unlockid != 'CARDDEC') {

    } else {

        //there are 3 case which will be handel here 
        //1. when subs is expired 
        //2. when card is declined 
        //3. when first time login and subs is not active 


        if (localStorage.unlockid == 'SPEXP') {

            swal('Opps!', 'Your Subscription is expired', 'error');
            window.location.href = "https://payments.dropvid.co";

        } else if (localStorage.unlockid == 'CARDDEC') {

            swal('Opps!', 'Your Subscription is expired or Card is been Declined on renewal', 'error');
            window.location.href = "https://payments.dropvid.co";

        } else if (localStorage.unlockid == 'NOTAC') {

            //ask user for there email check status in DB set in background js and then reload page 
            swal({
                    title: 'Extension Activation',
                    text: 'If You Already Subscribed Enter Your Email here To Activate Or You Can Disable This Extension',
                    content: "input",
                    closeOnEsc: false,
                    closeOnClickOutside: false,
                    icon: "warning"
                })
                .then((value) => {
                    // swal(`You typed: ${value}`);
                    var url = "https://www.dropvid.co/wp-json/chrome-ext/checksubscription";
                    var email = value;
                    $.ajax({
                        url: url,
                        type: "post",
                        data: { email: email },
                        beforeSend: function() {
                            // setting a timeout
                            $.LoadingOverlay("show", {
                                image: "",
                                fontawesome: "fa fa-cog fa-spin"
                                    //text        : "Checking for Subscription...."
                            });
                        },
                        success: function(d) {
                            //alert(d);
                            if (d.status == 'NOTSUBS') {
                                $.LoadingOverlay("hide");
                                window.location.href = "https://payments.dropvid.co";
                            } else if (d.status === 'SPEXP') {
                                swal("oops!!", "Your Subscription expired", "error");
                                $.LoadingOverlay("hide");
                                window.location.href = "https://payments.dropvid.co";

                            } else if (d.status === 'CARDDEC') {

                                $.LoadingOverlay("hide");
                                window.location.href = "https://payments.dropvid.co";

                            } else if (d.status === 'ACTSUB') {

                                swal("Success!!", "Thanks for Activation", "success");
                                $.LoadingOverlay("hide");
                                //set local storage to active subs 
                                localStorage.unlockid = 'null';
                                localStorage.user_email = d.user_email;

                                chrome.extension.sendMessage({ action: "setSubscriptionStatus", data: d }, function(value) {
                                    //reload page for refresh state
                                    localStorage.unlockid = response;

                                    if (localStorage.unlockid != 'NOTAC') {
                                        location.reload();
                                    }
                                });

                                location.reload();



                            }

                        },
                        error: function(xhr) { // if error occured
                            swal("oops!!", "Error occured.please try again", "error");
                            $.LoadingOverlay("hide");
                        }
                    });



                });

        }



        //alert('feature is locked ');
        return;

    }


    await new Promise(resolve => {
        jsPanel.create({
            contentFetch: {
                resource: `${chrome.extension.getURL("panel_template.html")}`,
                done: function(response, panel) {
                    panel.contentRemove();
                    $(panel.content).css({ 'padding': '5px', 'background': 'white' });
                    panel.content.append(jsPanel.strToHtml(response));
                    $(".vf_ext_panel_tablinks").click(openVideosPanel);
                    $(".vf_ext_panel_tablinks").first().click();
                    resolve();
                }
            },
            contentSize: { width: 685, height: 400 },
            theme: 'royalblue filledlight',
            borderRadius: '.5rem',
            headerTitle: 'Videos found for this Query'
        });
    });
}

function openVideosPanel(event) {
    const id = "#" + $(event.target).data('fragment');
    $(".vf_ext_panel_tabcontent").each((index, tabcontent) => $(tabcontent).hide());
    $(id).show();
    $(".vf_ext_panel_tablinks").each((index, tablink) => $(tablink).removeClass("active"));
    $(event.target).addClass("active");
}

async function onDownloadButtonClicked() {
    Ladda.create(this).start();
    console.log(`dllink:`, $(this).data('dllink'))
    if ($(this).data('dllink')) {
        // let element = document.createElement('a');
        // element.setAttribute('href', $(this).data('dllink'));
        // element.setAttribute('target', "_blank");

        // element.style.display = 'none';
        // document.body.appendChild(element);

        // element.click();

        // document.body.removeChild(element);
        window.open($(this).data('dllink'), '_blank').focus();
        Ladda.create(this).stop();
        return;
    }
    await sendMessage({
        action: 'download_video',
        url: $(this).data('url'),
        website: $(this).data('website'),
    });
    Ladda.create(this).stop();
}

function showProgress(selector) {
    const spinner = `
    <div class="ispinner-container">
        <div class="ispinner gray large animating m-r-10">
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
            <div class="ispinner-blade"></div>
        </div>
    </div>`;

    $(selector).prepend(spinner);
}

function hideProgress(selector) {
    $(`${selector} .ispinner-container`).remove();
}