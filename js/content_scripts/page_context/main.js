//run extension if it is turned on:
chrome.storage.local.get(
    ["extension_state"],
    (info) => {
        const extension_state_ = info.extension_state;

        if (extension_state_ == "on") {
            loading_bar.inject();
            start_labelling();
            convert_dinamic_anchors_to_static_anchors();
        };
    }
);

function start_labelling() {
    const is_search_products_page = location.href.split("galleryofferlist").length > 1 ||
        location.href.split("&SearchText").length > 1;

    if (is_search_products_page == true) {
        fetch_items_video_urls
            (
                (item_with_video) => {
                    const item_ = item_with_video.item;
                    const video_url_ = item_with_video.video_url;

                    if (video_url_) {

                        //this is responsible for creating button on the product so we have to disable this too 
                        chrome.runtime.sendMessage({ method: "getSubscriptionStatus" }, function(response) {
                            console.log(response);
                            localStorage.unlockid = response;
                        });

                        //alert(localStorage.unlockid);
                        if (true || (localStorage.unlockid != 'NOTAC' && localStorage.unlockid != 'SPEXP' && localStorage.unlockid != 'CARDDEC')) {
                            wrap_item(item_);
                            re_arrange_item_with_video_at_top(item_.parentElement);
                            set_label_to_item(item_.parentElement);
                            item_.parentElement.prepend(create_download_button_for_item(video_url_));

                        } else {
                            //alert('feature is locked ');
                            return;

                        }

                    };
                }
            );
    };
};

function observe_search_items(node) {
    const node_html = node.outerHTML;
    const matching_keywords = [
        `ui2-icon-loading ui2-icon-x`,
        `next-pagination-item`,
        `seb-pagination__pages-link`
    ];

    for (matching_key of matching_keywords) {
        if (node_html && node_html.split(matching_key).length > 1) {
            console.log("searchs items found.");

            start_labelling();

            break;
        };
    };
};