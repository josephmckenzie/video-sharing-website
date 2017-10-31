var userController = {
    data: {
        auth0Lock: null,
        config: null
    },
    uiElements: {
        loginButton: null,
        logoutButton: null,
        profileButton: null,
        profileNameLabel: null,
        profileImage: null
    },
    init: function (config) {
        this.uiElements.loginButton = $('#auth0-login');
        this.uiElements.logoutButton = $('#auth0-logout');
        this.uiElements.profileButton = $('#user-profile');
        this.uiElements.profileNameLabel = $('#profilename');
        this.uiElements.profileImage = $('#profilepicture');

        this.data.config = config;
        this.data.auth0Lock = new Auth0Lock(config.auth0.clientId, config.auth0.domain);

        // check to see if the user has previously logged in
        var idToken = localStorage.getItem('userToken');

        if (idToken) {
            this.configureAuthenticatedRequests();

            var that = this;

            this.data.auth0Lock.getProfile(idToken, function (err, profile) {
                if (err) {
                    return alert('There was an error getting the profile: ' + err.message);
                }
                // Display user information
                that.showUserAuthenticationDetails(profile);

            });
        }

        this.wireEvents();
    },
    configureAuthenticatedRequests: function () {
        $.ajaxSetup({
            'beforeSend': function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer ' + localStorage.getItem('userToken'));
            }
        });
    },
    showUserAuthenticationDetails: function (profile) {
        var showAuthenticationElements = !!profile;
        var loginprofile = JSON.stringify(profile);
        if (showAuthenticationElements) {
            this.uiElements.profileNameLabel.text(profile.nickname);
            this.uiElements.profileImage.attr('src', profile.picture);
            console.log("The Login profile for " + profile.name + ":" + loginprofile);
        }

        this.uiElements.loginButton.toggle(!showAuthenticationElements);
        this.uiElements.logoutButton.toggle(showAuthenticationElements);
        this.uiElements.profileButton.toggle(showAuthenticationElements);
    },
    wireEvents: function () {
        var that = this;

        this.uiElements.loginButton.click(function (e) {
            var params = {
                authParams: {
                    scope: 'openid email user_metadata picture'
                }
            };

            that.data.auth0Lock.show(params, function (err, profile, token) {
                if (err) {
                    // Error callback
                    alert('There was an error');
                } else {
                    // Save the JWT token.
                 console.log(token);
                    localStorage.setItem('userToken', token);
                    
                    that.configureAuthenticatedRequests();

                    that.showUserAuthenticationDetails(profile);
                }
            });
        });

        this.uiElements.logoutButton.click(function (e) {
            localStorage.removeItem('userToken');

            that.uiElements.logoutButton.hide();
            that.uiElements.profileButton.hide();
            that.uiElements.loginButton.show();
        });
    }
};