// let HOST = 'http://localhost:88';
// let razorpayMerchantId = 'rzp_test_F0TUZmabOwKkhe'
let razorpayMerchantId = 'rzp_live_tdfTCMm8C9gJNN'
if (['gcsconsultant.com', 'www.gcsconsultant.com'].includes(window.location.hostname)) {
  HOST = 'https://admin.gcsconsultant.com';
}

let USER_ROUTE = '/admin/pages';
let PUBLIC_ROUTE = '/admin/pages';
let BASE_URL = HOST + USER_ROUTE;

// Set Redirect Dir
let redirectDir = '';
let path = window.location.pathname
let currentSubPath = {
  account: path.split('/account/').length,
  blogs: path.split('/blogs/').length,
  services: path.split('/services/').length,
  courses: path.split('/courses/').length,
  workshop: path.split('/workshop/').length
}

let currentSubPathName = ''
Object.keys(currentSubPath).forEach(key => {
  if (currentSubPath[key] > 1) {
    currentSubPath = currentSubPath[key]
    currentSubPathName = key
  }
})

if (currentSubPath > 1) {
  let dirCount = path.split(`/${currentSubPathName}/`).length - 1
  if (dirCount > 0) {
    for (let i = 0; i < dirCount; i++) {
      redirectDir += '../'
    }
  }
}


let profilePage = redirectDir + 'profile.html'

// Sent Header default in all API Request
$.ajaxSetup({
  headers: { 'authorization': localStorage.getItem("GCS_user_authorization") || null },
  cache: false,
});


function submitForm(event) {
  event.preventDefault();
  const formData = new FormData(event.target);
  URL_FORM = BASE_URL + '/user/'

  fetch(URL_FORM, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded'
    },
    body: new URLSearchParams(formData).toString()
  })
    .then(response => {
      if (response.ok) {
        Swal.fire({
          icon: 'success',
          title: 'Thanks you for contact us',
          text: 'We will contact you soon.'
        })
        event.target.reset();
        $('#myModal').modal('hide');
      } else {
        Swal.fire({
          icon: 'error',
          title: 'Invalid Details',
          text: 'Please enter valid Details'
        })
      }
    })
    .catch(error => {
      Swal.fire({
        icon: 'error',
        title: 'An error occurred while sending your message',
      })
      console.error(error);
    });
}

// Get Profile
async function http_getProfile(option = {}) {
  try {
    let userResult = await $.get({
      url: HOST + '/pages/gcs/view/',
      headers: { 'authorization': option.authorization || localStorage.getItem("GCS_user_authorization") }
    }).then(result => result)
    isUserLoggedIn = true;
    let userData = userResult.data
    localStorage.setItem('user_info', JSON.stringify({ ...userData.user }))
    return userResult;
  } catch (error) {
    error = error.responseJSON
    if (option.login == undefined) {
      return modalLogin()
    }
  }
}

function _getUserInfo() {
  try {
    return JSON.parse(localStorage.getItem("user_info"))
  } catch (error) {
    modalLogin()
    return null;
  }
}

// Date Time
function getDateTime(dateObject) {
  if (dateObject && (new Date(dateObject)) != 'Invalid Date') {
    let date = new Date(dateObject)
    return `${('0' + date.getDate()).slice(-2)}/${('0' + (date.getMonth() + 1)).slice(-2)}/${date.getFullYear()} ${('0' + date.getHours()).slice(-2)}:${('0' + date.getMinutes()).slice(-2)}:${('0' + date.getSeconds()).slice(-2)}`
  }
  return 'INVALID DATE'
}

// Time Convert 24 Hour to 12 Hour
function t24to12(time) {
  if (!time) { return }
  // Check correct time format and split into components
  time = time.toString().match(/^([01]\d|2[0-3])(:)([0-5]\d)(:[0-5]\d)?$/) || [time];

  if (time.length > 1) { // If time format correct
    time = time.slice(1); // Remove full string match value
    time[5] = +time[0] < 12 ? ' AM' : ' PM'; // Set AM/PM
    time[0] = +time[0] % 12 || 12; // Adjust hours
  }
  return time.join(''); // return adjusted time or original string
}

// Append Current Query String to URL
function redirectTo(url) {
  let queryString = new URLSearchParams(window.location.search);

  let redirectURL = url + '?';
  queryString.forEach((value, key) => {
    redirectURL += (key + '=' + value + '&');
  })

  redirectURL = redirectURL.substr(0, redirectURL.length - 1);
  window.location.href = redirectURL
}

function logout() {
  // clear local storage
  localStorage.removeItem('GCS_user_authorization')
  localStorage.removeItem('user_info')
  window.location.reload()
}


// Check Login
function signInRequired() {
  if (localStorage.getItem("GCS_user_authorization") == null || localStorage.getItem("user_info") == null) {
    localStorage.removeItem('GCS_user_authorization')
    localStorage.removeItem('user_info')
    return modalLogin()
  }
}
userInfoCheck()


// Check + HTML Append
let isUserLoggedIn = false;
function userInfoCheck() {
  if (!document.getElementsByClassName('userInfo')[0]) {
    return;
  }
  http_getProfile({ login: true })

  if (localStorage.getItem("GCS_user_authorization") == null || localStorage.getItem("user_info") == null) {
    document.getElementsByClassName('userInfo')[0].classList.remove('ddmenu')
    document.getElementsByClassName('userInfo')[0].innerHTML = `
        <li class="mr-0"></li>
        <a href="javascript:void(0);" onclick="modalLogin()">Login&nbsp;<i class="far fa-user"></i></a>`
    document.getElementsByClassName('mobileUserInfo')[0].innerHTML = `
        <ul>
        <li><a href="javascript:void(0);" onclick="modalLogin()">Log in</a></li>
        </ul>
       `

    return
  }

  if (localStorage.getItem("user_info") != null) {
    let userInfo;
    let user_name = '';
    document.getElementsByClassName('userInfo')[0].innerHTML = '';

    userInfo = JSON.parse(localStorage.getItem("user_info"))
    try {
      user_name = userInfo.first_name

      let options = ` <ul>
            <li class="mr-0"><a href="${redirectDir}account/profile.html"><i class="far fa-user mr-3" style="font-size: 18px;"></i>Profile</a></li>
        `

      options += `<li class="mr-0" onclick="logout()"><a href="javascript:void(0);"><i class="fas fa-sign-out-alt mr-3" style="font-size: 18px;"></i>Log Out</a></li>
            </ul>`

      document.getElementsByClassName('userInfo')[0].innerHTML += `
                    <li class="mr-0">Hi, ${user_name}&nbsp;&nbsp;</li>
                    <a href="javascript:void(0);"><i class="far fa-user" style="color:#000;"></i></a>
                    ${options} 
                   `
    } catch (error) {
      // When no user info
      document.getElementsByClassName('userInfo')[0].innerHTML = `
            <a href="javascript:void(0);"><i class="far fa-user"></i></a>
            <ul>
                <li class="mr-0"><a href="${redirectDir}account/profile.html"><i class="far fa-user mr-3" style="font-size: 18px;"></i>Profile</a></li>
                <li class="mr-0" onclick="logout()"><a href="javascript:void(0);"><i class="fas fa-sign-out-alt mr-3" style="font-size: 18px;"></i>Log Out</a></li>
            </ul>`
    }

    // Mobile View
    try {

      user_name = userInfo.first_name

      let options = ` 
            <ul>
            <hr>
            <li class="mr-0 p-2" style="font-size: 18px;">Hi, ${user_name}</li>
            <li class="mr-0 p-0"><a href="${redirectDir}account/profile.html" class="p-2"><i class="far fa-user mr-3" style="font-size: 18px;"></i>Profile</a></li>
        `

      options += `
            <li class="mr-0 p-0"><a href="javascript:void(0);" onclick="logout()" class="p-2"><i class="fas fa-sign-out-alt mr-3" style="font-size: 18px;"></i>Log out</a></li>
            </ul>`

      document.getElementsByClassName('mobileUserInfo')[0].innerHTML = options;
    } catch (error) {
      document.getElementsByClassName('mobileUserInfo')[0].innerHTML = `
            <ul>
                <li class="mr-0"><a href="${redirectDir}account/profile.html"><i class="far fa-user mr-3" style="font-size: 18px;"></i>Profile</a></li>
                <li class="mr-0" onclick="logout()"><a href="javascript:void(0);"><i class="fas fa-sign-out-alt mr-3" style="font-size: 18px;"></i>Log Out</a></li>
            </ul>`
    }
  } else {

  }

}
