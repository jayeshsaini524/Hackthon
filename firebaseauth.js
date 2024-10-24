
/* Authentication */
function rsignUp() {
    var email = document.getElementById('signUpEmail').value;
    var password = document.getElementById('signUpPassword').value;
    signUp(email, password);
}

firebase.auth().onAuthStateChanged(function(user) {
    if (user) {
      // User is signed in.
      console.log('User is already signed in:', user);
      showHomepage();
    } else {
      // No user is signed in.
      console.log('No user is signed in.');
      showLoginPage();
    }
  });


// Sign up new users
function signUp(email, password) {
    console.log('Signing up...');
    auth.createUserWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            console.log('User signed up: ', user);
            
            // Create a document in Firestore for the new user
            db.collection('users').doc(user.uid).set({
                email: user.email,
                firstName: '',
                lastName: ''
            })
            .then(() => {
                console.log("User document created in Firestore");
                showHomepage();
            })
            .catch((error) => {
                console.error("Error creating user document: ", error);
            });
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error('Error signing up: ', errorCode, errorMessage);
            window.alert(errorMessage);
        });
}

// Sign In function
function rsignIn() {
    var email = document.getElementById('signInEmail').value;
    var password = document.getElementById('signInPassword').value;
    signIn(email, password);
}


// Sign in existing users
function signIn(email, password) {
    auth.signInWithEmailAndPassword(email, password)
        .then((userCredential) => {
            var user = userCredential.user;
            console.log('User signed in: ', user);
            showHomepage();
        })
        .catch((error) => {
            var errorCode = error.code;
            var errorMessage = error.message;
            console.error('Error signing in: ', errorCode, errorMessage);
            var signInMessage = document.getElementById('signInMessage');
            if (signInMessage) {
                signInMessage.textContent = errorMessage;
                signInMessage.style.display = 'block';
            }
        });
}

function showHomepage() {
    document.querySelector('.login-page').style.display = 'none';
    document.querySelector('.homepage').style.display = 'block';
    document.title ="Homepage";
}

// Add a new function to show the login page
function showLoginPage() {
    document.querySelector('.login-page').style.display = 'block';
    document.querySelector('.homepage').style.display = 'none';
}

// Add a sign out function
function signOut() {
    firebase.auth().signOut().then(() => {
        console.log('User signed out');
        showLoginPage();
    }).catch((error) => {
        console.error('Error signing out:', error);
    });
}

// Add User to Firestore
function addUser() {
    var name = document.getElementById('userName').value;
    var email = document.getElementById('userEmail').value;
    var data = {
        name: name,
        email: email,
        createdAt: firebase.firestore.FieldValue.serverTimestamp()
    };
    addData('users', data);
}


/* Firebase Storage */

//-----------------------------------------------------------------------------------------------------

