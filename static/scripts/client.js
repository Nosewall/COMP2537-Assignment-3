"use strict";

$(document).ready(function () {

    $('#audio').buttonAudioPlayer({
        //It's CaramellDansen.
        src: '/sound/Caramelldansen.mp3',
        type: 'bar-animation',
        loop: true,
        loopStart: true
    });

    $("#submit").click(function () {
        $.ajax({
            url: "/authenticate",
            type: "POST",
            dataType: "JSON",
            data: { email: $("#email").val(), password: $("#password").val() },
            success: function (data) {
                //console.log("Data returned from server: ", data);
                if (data['status'] == "success") {
                    // redirect
                    window.location.replace("/profile");
                } else {
                    // show error message
                    $("#errorMsg").html(data['msg']);
                }

            },
            error: function (jqXHR, textStatus, errorThrown) {
                $("body").text(jqXHR.statusText);
            }
        });

    });
});