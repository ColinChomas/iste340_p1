
function init(){
    console.log("init");
    checkLegacyBrowser();
    let form = document.createElement('form');
    form.id = "_form";

    fetch("./assets/data.json")
        .then(response => response.json())
        .then(data => {
            // console.log("data", data);
            // console.log("init data ",data.football.init[0]);
            document.title = data.football.Question[0];

            createHeader(data.football.Question[0]);

            $("selector").appendChild (form);

            buildSelectors(data, "init", 0);
        })
        .catch(error => console.error(error));
}

function checkLegacyBrowser() {
    var isLegacy = false;

    // Check for features not supported in legacy browsers
    if (!('fetch' in window) || !('localStorage' in window)) {
        isLegacy = true;
    }

    if (isLegacy) {
        window.location.href = "legacy.html";
    }
}

function checkCookies() {
    document.cookie = "testCookie=1";
    const cookiesEnabled = document.cookie.indexOf("testCookie") != -1;
    console.log("cookiesEnabled", cookiesEnabled);
    return cookiesEnabled;
}


function buildSelectors(dataSet, key, id) {
    console.log("buildSelectors");

    // grab data from the key
    var data = dataSet.football[key];

    // grab the first element
    var question = data[0];

    // create a select element
    let x = document.createElement('select')


    // set the name of the select element
    x.setAttribute("name", question);
    x.id = id;

    // set the initial option of the select to the question
    var questionOption = document.createElement('option');
    questionOption.text = question;
    x.add(questionOption);

    // add all of the options
    for(let i = 1; i < data.length; i += 2) {
        let option = document.createElement('option');
        option.id = data[i+1];
        option.text = data[i] //+ ": " + option.id;
        option.value = data[i];
        x.add(option);
    }




    // Check if we are at the final selection
    if(data.length == 1) {
        // console.log("done");
        let selected = document.createElement('div');

        // Print out the final selection
        selected.id = "selectedDiv";
        selected.textContent = "Selected Club: " + data[0];
        if (checkCookies()) {
            SetCookie(encodeURIComponent("club"), data[0], 60*60*24*365, "/", "", "strict", true);
        } else {
            localStorage.setItem('club', data[0]);
        }
        $("selected").appendChild(selected);
        
        createForm();
    }

    // add event listener to the select element
    x.addEventListener('change', function() {
        // check if the form exists, if so delete it
        if ($("_userInfoForm")) {
            deleteForm();
        }

        // get the selected key
        let selectedKey = x.options[x.selectedIndex].id;

        // remove final selected club
        let finalSelection = $("selected");
        finalSelection.textContent = "";

         // Remove children after parent change
        let form = $('_form'); // get the form all the selects are in
        let selects = form.children; // get access to array of the selects
        let sLength = selects.length; // find how many selects are present

        for (let i = sLength - 1; i >= 0; i--) {
               if (parseInt(selects[i].id) > id) { // if the select is left over from a previous selection
                form.removeChild(selects[i]); // removes select from the page
            }
        }

        if (dataSet.football[selectedKey]) {
            buildSelectors(dataSet, selectedKey, id+1); //recursivley build the next selector
         }
    });
    //animate
    let parent = $("selector");
    let targetHeight = $('_form').children.length * 90 + 200 + "px";
    let initialHeight = parent.offsetHeight + 3 + "px";
    animateHeight(initialHeight, targetHeight, parent, x);


}

function animateHeight(initialHeight, targetHeight, parent, element) {
    console.log("animateHeight");
    // console.log("initialHeight", initialHeight);
    // console.log("targetHeight", targetHeight);
    let currentHeightInt = parseInt(initialHeight);
    let targetHeightInt = parseInt(targetHeight);

    function step() {
        if (currentHeightInt < targetHeightInt) {
            // console.log("if");
            currentHeightInt += 2;
            parent.style.height = currentHeightInt + "px";
            requestAnimationFrame(step);
        } else if (currentHeightInt > targetHeightInt) {
            // console.log("else if");
            currentHeightInt -= 1;
            parent.style.height = currentHeightInt + "px";
            requestAnimationFrame(step);
        } else {
            // console.log("else");
            // console.log(element);
            $("_form").appendChild(element);
            fadeIn(element);
        }
    }

    requestAnimationFrame(step);
}

function fadeIn(element) {
    element.style.opacity = 0;
    element.style.transition = "opacity 1s";
    requestAnimationFrame(() => {
        element.style.opacity = 1;
    });
}

function createHeader(text){
    let header = document.createElement('h1');
    header.textContent = text;
    $("selector").appendChild(header);
}

function createForm(){

    let form = document.createElement('form');
    form.id = "_userInfoForm";

    // test for cookies
    if (checkCookies()) {
        console.log("cookies");
        let cookies = document.cookie.split('; ').reduce((acc, cookie) => {
            let [name, value] = cookie.split('=');
            acc[name] = value;
            return acc;
        }, {});

        if (!cookies.firstName) {
            SetCookie("firstName", "", 0, "/", "", "strict", true);
        }
        if (!cookies.lastName) {
            SetCookie("lastName", "", 0, "/", "", "strict", true);
        }
        if (!cookies.email) {
            SetCookie("email", "", 0, "/", "", "strict", true);
        }
        if (!cookies.club) {
            SetCookie("club", "", 0, "/", "", "strict", true);
        }

        let fn = decodeURIComponent(GetCookie("firstName") || '');
        let ln = decodeURIComponent(GetCookie("lastName") || '');
        let email = decodeURIComponent(GetCookie("email") || '');

        // create form elements
        createInputFormElement(fn, "First Name", form);
        createInputFormElement(ln, "Last Name", form);
        createInputFormElement(email, "Email", form);
    }
    // test for localStorage
    else if(window.localStorage){
        console.log("localStorage");
        if(!localStorage.getItem("firstName") || localStorage.getItem("firstName") == 'undefined'){
            localStorage.setItem("firstName", ''); // create First Name
        }
        if(!localStorage.getItem("lastName") || localStorage.getItem("lastName") == 'undefined'){
            localStorage.setItem("lastName", ''); // create Last Name
        }
        if(!localStorage.getItem("email") || localStorage.getItem("email") == 'undefined'){
            localStorage.setItem("email", ''); // create Email
        }
        if(!localStorage.getItem("club") || localStorage.getItem("club") == 'undefined'){
            localStorage.setItem("club", ''); // create Club storage
        }

        let fn = localStorage.getItem("firstName");
        let ln = localStorage.getItem("lastName");
        let email = localStorage.getItem("email");

        //create form elements
        createInputFormElement(fn, "First Name", form);
        createInputFormElement(ln, "Last Name", form);
        createInputFormElement(email, "Email", form);
        
    } 
    var submit = document.createElement('input');
    submit.setAttribute("type", "submit");
    submit.setAttribute("value", "Submit");
    submit.addEventListener('click', function(event) {
        event.preventDefault();
        getUserInfo();
    });
    form.appendChild(submit);

    $("userForm").appendChild(form);
}

function deleteForm(){
    let form = $("_userInfoForm");
    for (let i = 0; i < form.children.length; i++) {
        form.removeChild(form.children[i]);
    }
    form.remove();
}

function getUserInfo(){
    // let form = $("_userInfoForm")
    // console.log(form);
    
    if(validateForm()) {
        if(checkCookies()) {
            SetCookie(encodeURIComponent("firstName"), $("First Name").value, 60*60*24*365, "/", "", "strict", true);
            SetCookie(encodeURIComponent("lastName"), $("Last Name").value, 60*60*24*365, "/", "", "strict", true);
            SetCookie(encodeURIComponent("email"), $("Email").value, 60*60*24*365, "/", "", "strict", true);
        }
        else {
            localStorage.setItem('firstName', $("First Name").value);
            localStorage.setItem('lastName', $("Last Name").value);
            localStorage.setItem('email', $("Email").value);
        }
    }

}

function createInputFormElement(value, name, parent){

    let div = document.createElement('div');
    div.id = name + " Div";
    div.textContent = name + ": ";
    parent.appendChild(div);

    let element = document.createElement('input');
    element.setAttribute("type", "text");
    // element.setAttribute("name", name);
    element.setAttribute("value", value);
    element.setAttribute("id", name);
    div.appendChild(element);
}

function validateForm() {
    let valid = true;

    for (let i = 0; i < $("_userInfoForm").children.length; i++) {
        console.log($$('input',i));
        $$('input',i).style.borderColor = "";
    }

    if ($("First Name").value == '') {
        // alert("First Name must be filled out");
        valid = false;
        $("First Name").style.borderColor = "red";
    }

    if ($("Last Name").value == '') {
        // alert("Last Name must be filled out");
        valid = false;
        $("Last Name").style.borderColor = "red";
    }

    if ($("Email").value == '') {
        // alert("Email must be filled out");
        valid = false;
        $("Email").style.borderColor = "red";
    }

    const email = $("Email").value;
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
        // alert("Please enter a valid email address");
        valid = false;
        $("Email").style.borderColor = "red";
    }

    console.log("valid");

    return valid;
}

function $ (id) {
    return document.getElementById(id);
}

function $$ (tag, num) {
    return document.getElementsByTagName(tag)[num];
}

function getCookieVal (offset) {
	var endstr = document.cookie.indexOf (";", offset);
	if (endstr == -1) { endstr = document.cookie.length; }
	return decodeURIComponent(document.cookie.substring(offset, endstr));
	}

function GetCookie (name) {
	var arg = name + "=";
	var alen = arg.length;
	var clen = document.cookie.length;
	var i = 0;
	while (i < clen) {
		var j = i + alen;
		if (document.cookie.substring(i, j) == arg) {
			return getCookieVal (j);
			}
		i = document.cookie.indexOf(" ", i) + 1;
		if (i == 0) break; 
		}
	return null;
	}

function DeleteCookie (name,path,domain) {
	if (GetCookie(name)) {
		document.cookie = name + "=" +
		((path) ? "; path=" + path : "") +
		((domain) ? "; domain=" + domain : "") +
		"; expires=Thu, 01-Jan-70 00:00:01 GMT"; // its the fucking beginning of time
		}
	}

    function SetCookie (name,value,maxAge,path,domain,sameSite,secure) {
        document.cookie = name + "=" + encodeURIComponent(value) +
          ((maxAge) ? ";max-age=" + maxAge  : "") +
          ((path) ? ";path=" + path  : "") +
          ((domain) ? ";domain=" + domain : "") +
          ((sameSite) ? ";samesite=" + sameSite : ";samesite=strict") +
          ((secure) ? ";secure;" : ";");
      }