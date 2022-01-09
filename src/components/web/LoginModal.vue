<template>
    <div class="modal" tabindex="-1">
        <div class="modal-dialog">
            <div class="modal-content">
                <div class="modal-header">
                    <h5 class="modal-title">Anmeldung</h5>
                    <button type="button" class="btn-close" data-bs-dismiss="modal" aria-label="Close" @click="close"></button>
                </div>
                <div class="modal-body">
                    <ul class="nav nav-tabs">
                        <li class="nav-item">
                            <a :class="['nav-link', {active: activeTab === 'login'}]" href="javascript:void(0)" @click="activateTab('login')">Login</a>
                        </li>
                        <li class="nav-item">
                            <a :class="['nav-link', {active: activeTab === 'register'}]" href="javascript:void(0)" @click="activateTab('register')">Registrierung</a>
                        </li>
                    </ul>
                    <div v-show="activeTab === 'login'">
                        <div class="alert alert-warning" role="alert" v-show="loginError !== ''">
                            {{ loginError }}
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="name-input" class="col-form-label">Name:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="name-input" placeholder="Name" v-model="name">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="pass-input" class="col-form-label">Passwort:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="password" class="form-control" name="pass-input" placeholder="Passwort" v-model="password" @keydown.enter="login">
                            </div>
                        </div>
                    </div>
                    <div v-show="activeTab === 'register'">
                        <div class="alert alert-warning" role="alert" v-show="registerError !== ''">
                            {{ registerError }}
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="name-input" class="col-form-label">Name:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="name-input" placeholder="Name" v-model="name">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="pass-input" class="col-form-label">Passwort:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="password" class="form-control" name="pass-input" placeholder="Passwort" v-model="password">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="pass-input" class="col-form-label">Passwort:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="password" class="form-control" name="pass-input" placeholder="Passwort (Wiederholung)" v-model="passwordRepeat">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="email-input" class="col-form-label">Email:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="email-input" placeholder="Email-Adresse" v-model="email">
                            </div>
                        </div>
                        <div class="row mb-3">
                            <div class="col-sm-3">
                                <label for="invite-input" class="col-form-label">Einladecode:</label>
                            </div>
                            <div class="col-sm-9">
                                <input type="text" class="form-control" name="invite-input" placeholder="Einladecode" v-model="invitationCode">
                            </div>
                        </div>
                    </div>
                </div>
                <div class="modal-footer">
                    <button v-show="activeTab === 'login'" type="button" class="btn btn-primary" @click="login" :disabled="name === '' || password === ''">Anmelden</button>
                    <button v-show="activeTab === 'register'" type="button" class="btn btn-primary" @click="register" 
                        :disabled="name === '' || password === '' || invitationCode === '' || passwordRepeat === '' || email == ''">Registrieren</button>
                </div>
            </div>
        </div>
    </div>
</template>

<script>
import { defineComponent } from 'vue';

export default defineComponent({
    name: 'LoginModal',
    data() {
        return {
            activeTab: 'login',
            name: '',
            password: '',
            passwordRepeat: '',
            email: '',
            invitationCode: '',
            loginError: '',
            registerError: '',
        }
    },
    methods: {
        activateTab(tabName) {
            this.activeTab = tabName;
        },
        async login() {
            if (this.name === '' || this.password === '') {
                return;
            }
            const response = await fetch(`${process.env.API}/api/auth`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login_id: this.name, 
                    password: this.password, 
                })
            });
            if (response.status > 400) {
                this.loginError = 'Anmeldung fehlgeschlagen';
            } else {
                this.loginError = '';
                this.$store.commit('authenticated', true);
                this.$store.dispatch('loadInitialData');
            }
        },
        async register() {
            if (this.password !== this.passwordRepeat) {
                this.registerError = 'Passwort wurde nicht korrekt wiederholt!';
                return;
            }
            const response = await fetch(`${process.env.API}/api/signup`, {
                method: 'POST',
                credentials: 'include',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    login_id: this.name, 
                    password: this.password, 
                    email: this.email,
                    invitation_code: this.invitationCode,
                })
            });
            if (response.status > 400) {
                const errDetails = await response.json();
                let msg = '';
                if (errDetails.error) {
                    msg = ' (' + {
                        'Username taken': 'Benutzername vergeben',
                        'Password too short': 'Passwort muss mindestens 12 Zeichen lang sein',
                        'Invalid email': 'Ungültige Email-Adresse',
                        'Invalid invitation code': 'Ungültiger Einladecode'
                    }[errDetails.error] + ')';
                }
                this.registerError = `Registrierung fehlgeschlagen${msg}`;
            } else {
                this.registerError = '';
                this.$store.commit('authenticated', true);
                this.$store.dispatch('loadInitialData');
            }
        },
        close() {
            this.$store.commit('forceNoAuth', true);
        },
    },
});
</script>

<style scoped>
  .modal {
    display: block;
  }
  ul.nav-tabs {
      margin-bottom: 1rem;
  }
</style>