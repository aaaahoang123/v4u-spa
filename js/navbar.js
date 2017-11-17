var videoApi = 'https://youtube-api-challenger2.appspot.com/videos';
var membersApi = 'https://youtube-api-challenger2.appspot.com/members';
var authenticationApi = 'https://youtube-api-challenger2.appspot.com/authentication';
var playlistApi = 'https://youtube-api-challenger2.appspot.com/playlists';
var userToken = localStorage.getItem('token');
toastr.options.positionClass = "toast-bottom-right";
if (userToken !== null) {
    document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[0].innerHTML = '<i class="fa fa-user"></i> ' + localStorage.getItem('username');
	document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[0].removeAttribute("href");
    document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[1].innerHTML = '<i class="fa fa-sign-out"></i> Đăng xuất';
    document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[1].addEventListener('click', signOut);
}
else {
    document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[0].innerHTML = '<i class="fa fa-user-plus"></i> Đăng ký';
    document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[1].innerHTML = '<i class="fa fa-sign-in"></i> Đăng nhập';
    document.querySelector("ul.navbar-nav.ml-auto").querySelectorAll("li a")[1].addEventListener('click', openSigninModal);
}
function openSigninModal() {
    $("#modalLoginForm").modal('show');
    return true;
}
function signOut() {
    localStorage.removeItem('token');
    localStorage.removeItem('username');
    setTimeout (function () {
        location.reload();
    },400);
}
var signinData = function (username,password) {
    this.data = {
        "type": "MemberLogin",
        "attributes": {
            "username": username,
            "password": password
        }
    }
};
signinData.prototype.signIn = function () {
    var username = this.data.attributes.username;
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.status === 200 && this.readyState === 4) {
            var response = JSON.parse(this.responseText);
            localStorage.setItem('username', username);
            localStorage.setItem('token', response.data.attributes.secretToken);
            document.querySelector("#modalLoginForm").classList.remove('fadeIn');
            document.querySelector("#modalLoginForm").classList.add('fadeOut');
            setTimeout(function () {
                $("#modalLoginForm").modal('hide');
                toastr["success"]("Đăng nhập thành công!");
            },100);
            setTimeout (function () {
                var patt = new RegExp("#signup", "gi");
                console.log(patt.test(location.pathname));
                console.log(location.pathname);
                if (patt.test(location.pathname)) {
                    location.href = "/";
                }
                else {
                    location.reload();
                }
            },1200);
        }
        else if (this.readyState === 4 && this.status !== 200){
            var errorResponse = JSON.parse(this.responseText);
            toastr["error"](errorResponse.errors[0].title + "! " + errorResponse.errors[0].detail);
        }
    };
    xhttp.open("POST", authenticationApi, true);
    xhttp.send(JSON.stringify(this));
};
var signIn = function () {
    var username = document.forms["signinForm"]["username"].value;
    var password = document.forms["signinForm"]["password"].value;
    var signinDataToSend  = new signinData(username, password);
    signinDataToSend.signIn();
};

var videoData = function (id, name, description, keywords, playlistId, thumbnail) {
    this.data = {
        "type":"Video",
        "attributes":{
            "youtubeId": id,
            "name": name,
            "description": description,
            "keywords": keywords,
            "playlistId": playlistId,
            "thumbnail": thumbnail
        }
    }
};
videoData.prototype.pUploadVideo = function (callBackFunction) {
    var xhttp = new XMLHttpRequest();
    xhttp.onreadystatechange = function () {
        if (this.readyState === 4) {
            var response = JSON.parse(this.responseText);
            if (this.status === 201 || this.status === 200) {
                callBackFunction.success(response);
            }
            else {
                callBackFunction.error(response);
            }
        }
    };
    xhttp.open("POST", videoApi, true);
    xhttp.setRequestHeader("Content-Type", "application/json");
    xhttp.setRequestHeader("Authorization", localStorage.getItem('token'));
    xhttp.send(JSON.stringify(this));
};
var playlistData = function(name, description, thumbnailUrl) {
    this.data = {
        "type":"Playlist",
        "attributes":{
            "name": name,
            "description": description,
            "thumbnailUrl": thumbnailUrl
        }
    }
};

playlistData.prototype.sendPlaylist = function() {
    var dataToSend = new playlistData();
    dataToSend.data = this.data;
    this.xhttp = new XMLHttpRequest();
    this.xhttp.open("POST", playlistApi, false);
    this.xhttp.setRequestHeader("Content-Type", "application/json");
    this.xhttp.setRequestHeader("Authorization", localStorage.getItem('token'));
    this.xhttp.send(JSON.stringify(dataToSend));
};
function convertLocationSearchToJSON(search) {
    var params = search;
    params = "{\"" +
        params
            .replace("#upload", "")
            .replace("#watch", "")
            .replace( /\?/gi, "" )
            .replace( /\&/gi, "\",\"" )
            .replace( /\=/gi, "\":\"" ) +
        "\"}";
    try {
        params = JSON.parse( params );
    }
    catch (err) {
        console.log(err);
    }
    return params;
}

function loadPage(hash) {
    $.ajax({
        url: hash,
        method: 'GET',
        success: function(response) {
            $("#v-view").html(response);
        },
        error: function(response) {
            var resp = response.responseText;
            $("#v-view").html(resp);
        }
    })
}
function loadPageByHash() {
    if (location.hash === "") {
        loadPage('pages/home.htm');
    }
    else if (location.hash === "#playlist") {
        loadPage('pages/playlist.htm');
    }
    else if (location.hash.match(/#upload/gi) !== null) {
        loadPage('pages/upload.htm');
    }
    else if (location.hash.match(/#watch/gi) !== null) {
        loadPage('pages/watch.htm')
    }
    else if (location.hash === "#signup") {
        loadPage('pages/signup.htm')
    }
    else {
        loadPage('pages/home.htm');
    }
}
function activeNavbarByHash() {
    var hashList = [new RegExp( ),  new RegExp("#upload"), new RegExp("#playlist"), new RegExp("#signup")];
    var navItems = document.querySelectorAll(".main-nav-item");
    if (location.hash === "") {
        navItems[0].className += " active";
        for (var i = 1; i < hashList.length; i++) {
            navItems[i].className = navItems[i].className.replace("active", "");
        }
    }
    else {
        navItems[0].className = navItems[0].className.replace("active", "");
        for (i = 1; i < hashList.length; i++) {
            if (hashList[i].test(location.hash)) {
                navItems[i].className += " active";
            }
            else {
                navItems[i].className = navItems[i].className.replace("active", "");
            }
        }
    }
}
// loadpage by hash
loadPageByHash();
activeNavbarByHash();
window.addEventListener("hashchange",function(event){
    $(".modal").modal('hide');
    $(".popover").popover('hide');
    try {
        document.body.removeChild(document.querySelector(".modal-backdrop.fade.show"));
    }
    catch (error) {
        console.log(error);
    }
    loadPageByHash();
    activeNavbarByHash();
});