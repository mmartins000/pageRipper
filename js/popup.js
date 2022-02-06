function onSuccessUpdateStash(page) {
    updateStashItems(page.getStash());
}

function onSuccessUpdateSettings(page) {
    updateSettingsSwitches(page.getPageRipperSettings());
}

function toggleMediaSwitch(page) {
    page.toggleMediaSwitch();
}

function toggleImageSwitch(page) {
    page.toggleImageSwitch();
}

function toggleFontSwitch(page) {
    page.toggleFontSwitch();
}

function toggleXHRSwitch(page) {
    page.toggleXHRSwitch();
}

function toggleThemeSwitch(page) {
    page.toggleThemeSwitch();
}

function onError(error) {
    console.log(`Error: ${error}`);
}

function setTheme(theme_name) {
    // Darkly comes from https://bootswatch.com/darkly/
    let theme = "css/" + theme_name + "/bootstrap.min.css";
    $('link[title="main"]').attr('href', theme);
    if (theme.includes('default')) {
        // toggleClass didn't work as expected on page reload
        $('img').removeClass("inverted");
    } else {
        $('img').addClass("inverted");
    }
}

this_stash = [];

function process_single_stash_item(stash_item) {
    getCurrentWindowTabs().then((tabs) => {
        tabID = tabs[0].id;
        if (tabID === 0)
            return

        if (parseInt(stash_item["tabId"]) !== tabID)
            return

        // console.log("tabs[0].id", tabID, 'stash_item["tabId"]', stash_item["tabId"])
        if (stash_item["type"] === "media") {
            if (stash_item["subtype"] === "video")
                $("#stash_list").append(populate_video_item(stash_item));
            else
                $("#stash_list").append(populate_audio_item(stash_item));
        }
        else if (stash_item["type"] === "image")
            $("#stash_list").append(populate_image_item(stash_item));
        else if (stash_item["type"] === "font")
            $("#stash_list").append(populate_font_item(stash_item));
        else if (stash_item["type"] === "xmlhttprequest")
            $("#stash_list").append(populate_xhr_item(stash_item));

        this_stash.push(stash_item);
    });
}

function updateStashItems(stash) {
    if (typeof $("#stash_list") != "undefined") {
        for (let s in stash) {
            if (!$("#stash_list").attr('id').includes('stash_row_' + s)) {
                process_single_stash_item(stash[s]);
            }
        }
    }
}

function populate_video_item(item) {
    return "<li class=\"list-group-item\">" +
        "    <div class=\"bd-callout bd-callout-danger d-flex\">" +
        "       <div class=\"d-flex flex-grow-1 justify-content-center align-self-center\" style=\"width: 260px; height: 120px\">" +
        "           <video controls>" +
        "               <source src=\"" + item["url"] + "\" type=\"audio/mpeg\">" +
        "           </video>" +
        "       </div>" +
        "       <div class=\"d-flex pb-sm-1 pt-sm-1 p-3 flex-shrink-1 justify-content-center align-self-center\">" +
        "           <a href=\"" + item["url"] + "\">" +
        "               <img src=\"images/cloud-computing.svg\" title=\"Download\" alt=\"Download\" style=\"height: 36px; width: 36px;\">" +
        "           </a>" +
        "       </div>" +
        "    </div>" +
        "</li>";
}

function populate_audio_item(item) {
    let audio_name = basename(item["url"]);
    return "<li class=\"list-group-item\">\n" +
        "     <div class=\"bd-callout bd-callout-primary d-flex\">\n" +
        "        <div class=\"flex-grow-1 justify-content-center\">\n" +
        "           <figure class='justify-content-center align-self-center'>" +
        "               <audio controls class='text-center'>" +
        "                   <source src=\"" + item["url"] + "\" type=\"audio/mpeg\">" +
        "               </audio>" +
        "               <figcaption class='figure-caption text-center'>" + audio_name + "</figcaption>" +
        "           </figure>" +
        "       </div>" +
        "       <div class=\"pb-sm-1 pt-sm-1 p-3 flex-shrink-1 justify-content-center align-self-center\">" +
        "           <a href=\"" + item["url"] + "\">" +
        "               <img src=\"images/cloud-computing.svg\" title=\"Download\" alt=\"Download\" style=\"height: 36px; width: 36;\">" +
        "           </a>" +
        "       </div>" +
        "    </div>" +
        "</li>";
}

function populate_image_item(item) {
    return "<li class=\"list-group-item\">" +
        "     <div class=\"bd-callout bd-callout-success d-flex\">" +
        "        <div class=\"flex-grow-1 justify-content-center align-self-center text-center\">" +
        "           <img src=\"" + item["url"] + "\" alt=\"\" style=\"height: 40px; width: 40px;\"/>" +
        "       </div>" +
        "       <div class=\"pb-sm-1 pt-sm-1 p-3 flex-shrink-1 justify-content-center align-self-center\">" +
        "           <a href=\"" + item["url"] + "\">" +
        "               <img src=\"images/cloud-computing.svg\" title=\"Download\" alt=\"Download\" style=\"height: 36px; width: 36px;\">" +
        "           </a>" +
        "       </div>" +
        "    </div>" +
        "</li>";
}

function populate_font_item(item) {
    let double_quote = "\"";
    let stashID = "stash-" + makeID(5);
    let font_name = basename(item["url"]);
    return "<li class=\"list-group-item\">\n" +
        "     <div class=\"bd-callout bd-callout-warning d-flex\">\n" +
        "        <div class=\"flex-grow-1 justify-content-center\">\n" +
        "           <style type=\"text/css\" media=\"screen, print\">" +
        "               @font-face {" +
        "                   font-family: \"" + font_name + "\";" +
        "                   src: url(" + double_quote + item["url"] + double_quote + ");" +
        "               }" +
        "               " + stashID + " { font-family: \"" + font_name + "\", serif }" +
        "           </style>" +
        "           <div class=\"" + stashID + "\">" +
        "               " + font_name +
        "           </div>" +
        "       </div>" +
        "       <div class=\"pb-sm-1 pt-sm-1 p-3 flex-shrink-1 justify-content-center align-self-center\">" +
        "           <a href=\"" + item["url"] + "\">" +
        "               <img src=\"images/cloud-computing.svg\" title=\"Download\" alt=\"Download\" style=\"height: 36px; width: 36px;\">" +
        "           </a>" +
        "       </div>\n" +
        "    </div>\n" +
        "</li>";
}

function populate_xhr_item(item) {
    let str_return = "";
    if (item["subtype"] === "vimeo") {
        for (let i in item["progressive"]) {
            str_return += "<li class=\"list-group-item\">" +
            "    <div class=\"bd-callout bd-callout-danger d-flex\">" +
            "       <div class=\"d-flex flex-grow-1 justify-content-center align-self-center\" style=\"width: 260px; height: 120px\">" +
            "           <figure class='justify-content-center align-self-center text-center'>" +
            "               <img src=\"" + item["img"] + "\" alt=\"\" class='figure-img img-fluid rounded' style=\"height: 80px;\"/>" +
            "               <figcaption class='figure-caption text-center'>" + item["caption"] + " (" + item["progressive"][i]["width"] + ")</figcaption>" +
            "           </figure>" +
            "       </div>" +
            "       <div class=\"d-flex pb-sm-1 pt-sm-1 p-3 flex-shrink-1 justify-content-center align-self-center\">" +
            "           <a href=\"" + item["progressive"][i]["url"] + "\">" +
            "               <img src=\"images/cloud-computing.svg\" title=\"Download\" alt=\"Download\" style=\"height: 36px; width: 36px;\">" +
            "           </a>" +
            "       </div>" +
            "    </div>" +
            "</li>";
        }
        return str_return
    }
}

function makeID(length) {
    let result = '';
    let characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    let charactersLength = characters.length;
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * charactersLength));
    }
    return result;
}

function basename(path) {
    return path.split('?')[0].split(/[\\/]/).pop();
}

function updateSettingsSwitches(json_object) {
    if (json_object["settings"]["general"]["default_theme"]) {
        setTheme("default");
    } else {
        setTheme("darkly");
    }
    $('#checkboxTheme').prop('checked', json_object["settings"]["general"]["default_theme"]);
    $('#checkboxMedia').prop('checked', json_object["settings"]["types"]["media"]["enabled"]);
    $('#checkboxImages').prop('checked', json_object["settings"]["types"]["image"]["enabled"]);
    $('#checkboxFonts').prop('checked', json_object["settings"]["types"]["font"]["enabled"]);
    $('#checkboxXHR').prop('checked', json_object["settings"]["types"]["xhr"]["enabled"]);
}

let getting = browser.runtime.getBackgroundPage();
// getting.then(onSuccessUpdateStash, onError);

function getCurrentWindowTabs() {
    return browser.tabs.query({active: true, currentWindow: true});
}

let tabID = 0;

$(document).ready(function() {
    getting.then(onSuccessUpdateSettings, onError);
    getting.then(onSuccessUpdateStash, onError);

    $('#checkboxMedia').click(function() {
        getting.then(toggleMediaSwitch, onError);
    });

    $('#checkboxImages').click(function() {
        getting.then(toggleImageSwitch, onError);
    });

    $('#checkboxFonts').click(function() {
        getting.then(toggleFontSwitch, onError);
    });

    $('#checkboxXHR').click(function() {
        getting.then(toggleXHRSwitch, onError);
    });

    $('#checkboxTheme').click(function() {
        if(document.getElementById('checkboxTheme').checked) {
            setTheme("default");
        } else {
            setTheme("darkly");
        }
        getting.then(toggleThemeSwitch, onError);
    });

    $('#popupOptions').click(function() {
        let div = document.getElementById('div-options');
        let div2 = document.getElementById('div-options2');
        if (div.style.display === 'none') {
            div.style.display = 'block';
            div2.style.display = 'block';

        } else {
            div.style.display = 'none';
            div2.style.display = 'none';
        }
    });

    $('#reloadPage').click(function() {
        browser.tabs.reload(tabID);
    });

    $('#reloadExtension').click(function() {
        browser.runtime.reload();
    });

});
