// =================
// 1. Common section
// =================

// Defining variables rules
let default_pattern = "<all_urls>";

function onStartup() {
    loadFromLocalStorage();
    console.log("pageRipper running.");
}

function isValidJSON(json_string) {
    try {
        JSON.parse(JSON.stringify(json_string));
    } catch (e) {
        console.log(e);
        console.log(json_string);
        return false;
    }
    return true;
}

function saveToLocalStorage(object) {
    console.log("Saving JSON data to LocalStorage...");
    if (isValidJSON(object)) {
        localStorage.setItem('pageRipperSettings', JSON.stringify(object))
        // Should verify first if it is a Storage object...
        console.log("pageRipper settings were saved to the LocalStorage.")
    } else {
        console.log("Import Error: invalid JSON file.");
    }
}

function loadFromLocalStorageError() {
    console.log("Import error: failed to parse JSON data from LocalStorage.");
}

function loadFromLocalStorage() {
    if (localStorage.getItem("pageRipperSettings") != null) {
        Promise.resolve(localStorage.getItem('pageRipperSettings'))
            // .then(JSON.parse)
            .then(processLocalStorage)
            .catch(loadFromLocalStorageError);
    } else {
        saveToLocalStorage(pageRipperSettings);
    }
}

function processLocalStorage(data) {
    try {
        let parsedData = JSON.parse(data);
        if (parsedData["settings"]) {
            pageRipperSettings = parsedData;
            console.log("Settings loaded from LocalStorage.");
        } else {
            console.log("Malformed JSON: Keeping default hardcoded settings.");
            saveToLocalStorage(pageRipperSettings);
        }
    } catch (error) {
        console.log("Non-existent JSON: Keeping default hardcoded settings.");
        saveToLocalStorage(pageRipperSettings);
    }
}

let pageRipperSettings = {
    "settings": {
        "general": {
            "default_theme": true
        },
        "types": {
            "media": {
                "enabled": true
            },
            "image": {
                "enabled": false
            },
            "font": {
                "enabled": false
            },
            "xhr": {
                "enabled": true
            }
        },
        "thirdParty": {
            "enabled": true
        }
    }
}

let stash = [];

function getStash() {
    return stash;
}

function getPageRipperSettings() {
    return pageRipperSettings;
}

function toggleMediaSwitch() {
    pageRipperSettings["settings"]["types"]["media"]["enabled"] = !pageRipperSettings["settings"]["types"]["media"]["enabled"];
    console.log("Media capture enabled: " + pageRipperSettings["settings"]["types"]["media"]["enabled"]);
    saveToLocalStorage(pageRipperSettings);
}

function toggleImageSwitch() {
    pageRipperSettings["settings"]["types"]["image"]["enabled"] = !pageRipperSettings["settings"]["types"]["image"]["enabled"];
    console.log("Image capture enabled: " + pageRipperSettings["settings"]["types"]["image"]["enabled"]);
    saveToLocalStorage(pageRipperSettings);
}

function toggleFontSwitch() {
    pageRipperSettings["settings"]["types"]["font"]["enabled"] = !pageRipperSettings["settings"]["types"]["font"]["enabled"];
    console.log("Font capture enabled: " + pageRipperSettings["settings"]["types"]["font"]["enabled"]);
    saveToLocalStorage(pageRipperSettings);
}

function toggleXHRSwitch() {
    pageRipperSettings["settings"]["types"]["xhr"]["enabled"] = !pageRipperSettings["settings"]["types"]["xhr"]["enabled"];
    console.log("XHR capture enabled: " + pageRipperSettings["settings"]["types"]["xhr"]["enabled"]);
    saveToLocalStorage(pageRipperSettings);
}

function toggleThemeSwitch() {
    pageRipperSettings["settings"]["general"]["default_theme"] = !pageRipperSettings["settings"]["general"]["default_theme"];
    console.log("Default theme enabled: " + pageRipperSettings["settings"]["general"]["default_theme"]);
    saveToLocalStorage(pageRipperSettings);
}

// Page Load
onStartup();

// ===============
// 2. page.Ripper
// ===============

function pageRipper(details) {
    let media_enabled = pageRipperSettings["settings"]["types"]["media"]["enabled"];
    let image_enabled = pageRipperSettings["settings"]["types"]["image"]["enabled"];
    let font_enabled = pageRipperSettings["settings"]["types"]["font"]["enabled"];
    let third_enabled = pageRipperSettings["settings"]["thirdParty"]["enabled"];

    if ((details["type"] === "media" && media_enabled === false) ||
        (details["type"] === "image" && image_enabled === false) ||
        (details["type"] === "font" && font_enabled === false)
    )
        return

    // Let me guess the media using regex. It's all I've got for now.
    if (details["type"] === "media") {
        if (/\.(ogm|ogv|ogg|mp4|webm|mov)/.test(details["url"])) {
            details["subtype"] = "video";
        } else {
            details["subtype"] = "audio";
        }
    }

    if ((details["thirdParty"] === false) || (details["thirdParty"] && third_enabled)) {
        if (stash.length > 0) {
            if (! check_stash_url(details["url"])) {
                stash.push(details);
            }
        } else {
            stash.push(details);
        }
    }
}

function pageRipperResponse(details) {
    let xhr_enabled = pageRipperSettings["settings"]["types"]["xhr"]["enabled"];
    let third_enabled = pageRipperSettings["settings"]["thirdParty"]["enabled"];

    if (details["type"] === "xmlhttprequest" && xhr_enabled === false)
        return

    // XHR
    if (details["type"] === "xmlhttprequest") {
        // Vimeo
        if (/player\.vimeo\.com/.test(details["url"])) {
            fetch(details["url"])
                .then(r => r.json())
                .then(data => {
                    let [lowestItems] = Object.entries(data.video.thumbs).sort(([, v1], [, v2]) => v1 - v2);
                    details["img"] = lowestItems[1];  // Always the smallest file for thumbnails
                    details["caption"] = data.video.title;
                    details["subtype"] = "vimeo";
                    details["progressive"] = data.request.files.progressive;

                    if ((details["thirdParty"] === false) || (details["thirdParty"] && third_enabled)) {
                        if (stash.length > 0) {
                            if (! check_stash_url(details["url"])) {
                                stash.push(details)
                            }
                        } else {
                            stash.push(details)
                        }
                    }
                }).catch(function (err) {
                    // console.log(err);
                }
            );
        }

        // // Any m3u8 list file
        // else if (/\.m3u8/.test(details["url"])) {
        //     if (! check_stash_url(details["url"]))
        //         fetch(details["url"])
        //             .then(function(response) {
        //                 response.text().then(function(text) {
        //                     // If master m3u8 file
        //                     if (/variants/.test(text)) {
        //                         details["subtype"] = "m3u8";
        //                         details["m3u8"] = text;
        //
        //                         if ((details["thirdParty"] === false) || (details["thirdParty"] && third_enabled)) {
        //                             if (stash.length > 0) {
        //                                 if (! check_stash_url(details["url"])) {
        //                                     stash.push(details)
        //                                 }
        //                             } else {
        //                                 stash.push(details)
        //                             }
        //                         }
        //                     }
        //                 })
        //         }).catch(function (err) {
        //             // console.log(err);
        //         }
        //     );
        // }
    }
};

// function pageRipperYT(details) {
//     let media_enabled = pageRipperSettings["settings"]["types"]["media"]["enabled"];
//     if (media_enabled === false)
//         return
//
//     if (/youtube\.com/.test(details["url"])) {
//         let info = getVideoInfo(details["url"]);
//         //let audioFormats = ytdl.filterFormats(info.formats, 'audioonly');
//         console.log(info);
//         //console.log('Formats with only audio: ' + audioFormats.length);
//     }
//
//     // Let me guess the media using regex. It's all I've got for now.
//     if (details["type"] === "media") {
//         if (/\.(ogm|ogv|ogg|mp4|webm|mov)/.test(details["url"])) {
//             details["subtype"] = "video";
//         } else {
//             details["subtype"] = "audio";
//         }
//     }
//
//     if ((details["thirdParty"] === false) || (details["thirdParty"] && third_enabled)) {
//         if (stash.length > 0) {
//             if (! check_stash_url(details["url"])) {
//                 stash.push(details);
//             }
//         } else {
//             stash.push(details);
//         }
//     }
// }

function check_stash_url(details_url) {
    for (let s in stash)
        if (stash[s]["url"] === details_url)
            return true

    return false
}

browser.webRequest.onBeforeRequest.addListener(
    pageRipper,
    {urls: [default_pattern], types: ["media", "image", "font"]},
    ["requestBody"]
);

browser.webRequest.onResponseStarted.addListener(
    pageRipperResponse,
    {urls: [default_pattern], types: ["xmlhttprequest"]},
    []
);

// browser.webRequest.onBeforeRequest.addListener(
//     pageRipperYT,
//     {urls: [default_pattern], types: ["main_frame"]},
//     ["requestBody"]
// );
