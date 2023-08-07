function modalHide() {
    modelResetTextField()
    try { $('.modal').modal('hide') } catch (error) { console.log(error) }
    $('body').removeClass('modal-open');
    $('.modal-backdrop').remove();
}

function modalShow() {
    modalHide()
    modelResetTextField()
    try { $('#modal').modal('show') } catch (error) { console.log(error) }
}

function modelResetTextField() {
    // Find ID starts with txt_ and in ID modal
    $('#modal input[id^="txt_"]').val(null)
}

// LOGIN USING MOBILE OTP

function modalLogin(action) {
    $('#div_modal').html(`
    <div class="modal fade p-0" id="modal" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
        <div class="modal-dialog modal-dialog-centered" role="document">
            <div class="modal-content black-form" style="background-color: #121212;">
                <div class="modal-body">
                    <button type="button" class="close" style="color:#fff;" data-dismiss="modal" aria-label="Close">
                        <span aria-hidden="true">&times;</span>
                    </button>
                    <div class="text-center">
                        <img src="${redirectDir}images/mix-img/login.png" class="img-fluid ml-2" width="40%"
                          alt="Login IMG">
                    </div>
                    <form onsubmit="return false">
                        <div class="page_modal slide-page_modal" style="width:100%!important;">
                            <div class="">
                                <h4><div class="label_modal text-center mb-3" id="lbl_modal_login">OTP Verification</div></h4>
                                <input type="mobile" id="txt_modal_user_name" placeholder="Enter mobile number" class="in-put" style="height: 80%; background-color: white;">
                            </div>
                            <div class="mb-3 mt-md-3">
                                <button type="button" class="submit-btn btn" style="width:100%; margin: 0;" id="btn_modal_login" onclick="modalLoginRequest(this,'${action}')">Log In</button>
                            </div>
                            <div class="d-none" style="margin-top: 0px;">
                                <button type="button" class="submit-btn btn" style="width:100%; margin: 0;">Continue With <i class="mx-1 fab fa-google"></i><i class="mx-1 fab fa-facebook-square"></i><i class="mx-1 fas fa-envelope"></i></button>
                            </div>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    </div>
    `);

    modalShow()

    $('#div_modal').on('keypress', function (e) {
        if (((e.which && e.which == 13) || (e.keyCode && e.keyCode == 13)) && !swal.isVisible()) {
            $('#btn_modal_login').click();
        }
    });
}


function modalLoginRequest(element, action) {
    let user_name = $('#txt_modal_user_name').val().trim()

    if (!user_name) {
        return Swal.fire({
            title: 'Mobile number is missing',
            icon: 'error'
        })
    }
    value = String(user_name)
    let payload = {}

    let mobileRegex = /^[6-9][0-9]{9}$/
    if (value.match(mobileRegex) && value.match(mobileRegex)[0] == value) {
        payload.mobile = user_name
    }

    $.post({
        url: HOST + '/pages/gcs/login',
        contentType: 'application/json',
        data: JSON.stringify(payload),
        success: (result) => {
            return Swal.fire({
                title: "OTP has been sent successfully on your mobile",
                icon: 'success'
            }).then(() => {
                $('#btn_modal_login').attr('onclick', `verifyOTP(this,'mobile','${Object.values(payload)[0]}','${action}')`).html('Verify OTP')
                $('#btn_modal_login').html('Verify OTP')
                $('#lbl_modal_login').html('Enter OTP here')

                // OTP for Testing Environment
                let OTP = (result && result.OTP) ? result.OTP : undefined;

                (result && result.OTP != undefined) ? toastr.warning('You can see OTP only because you are using test version.') : null;

                $('#txt_modal_user_name').attr('placeholder', `Enter OTP here`).val(OTP || '')
            })
        },
        error: (error) => {
            error = error.responseJSON
            try {
                return Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                })
            } catch (error) {
                return Swal.fire({
                    title: 'Error',
                    text: 'Something went wrong!',
                    icon: 'error',
                })
            }
        },
        complete: () => {
            $(element).removeAttr('disabled')
        },
        beforeSend: () => {
            $(element).attr('disabled', 'disabled')
        }
    })
}


function verifyOTP(element, type, data, action) {

    let otp_code = $('#txt_modal_user_name').val().trim()

    if (!otp_code) {
        return Swal.fire({
            title: 'Error',
            text: 'OTP is required',
            icon: 'error',
        })
    }

    $.post({
        url: HOST + '/pages/gcs/verifyotp',
        contentType: 'application/json',
        data: JSON.stringify({
            mobile: data,
            otp: otp_code
        }),
        success: async (result) => {
            return Swal.fire({
                title: "successfully login",
                icon: 'success'
            }).then(() => {
                localStorage.setItem('GCS_user_authorization', result.token)
                localStorage.setItem('user_info', JSON.stringify(result.user))

                $.ajaxSetup({
                    headers: { 'authorization': localStorage.getItem("GCS_user_authorization") || alert("header not setup yet") }
                })

                modalHide(result)

                // Reload page without action=Login parameter
                let urlParams = new URLSearchParams(window.location.search);
                if (urlParams.has('action') && urlParams.get('action') == 'Login') {
                    urlParams.delete('action')
                }

                if (String(action) != "undefined") {
                    urlParams.set('action', String(action))
                } else {
                    urlParams.delete('action')
                }

                window.location.href = window.location.href.split('?')[0] + (urlParams.toString() != "" ? '?' + urlParams.toString() : '')
                userInfoCheck()
                return toastr.success(result.message)
            })
        },
        error: (error) => {
            error = error.responseJSON
            try {
                return Swal.fire({
                    title: 'Error',
                    text: error.message,
                    icon: 'error',
                })
            } catch (error) {
                return Swal.fire({
                    title: 'Error',
                    text: 'Something went wrong!',
                    icon: 'error',
                })
            }
        },
        complete: () => {
            $(element).removeAttr('disabled')
        },
        beforeSend: () => {
            $(element).attr('disabled', 'disabled')
        }
    })
}