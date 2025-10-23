import axios from "axios";
import Swal from 'sweetalert2';
import withReactContent from 'sweetalert2-react-content';
import { useDispatch, useSelector } from "react-redux";
import { f as ff } from "./fs";


const MySwal = withReactContent(Swal);

const link = 'http://localhost:8369/api/';
// const link = 'http://192.168.16.3:8000/api/';
axios.defaults.withCredentials = true
const miAxios = axios.create({
    baseURL: link,
});
const pjid = "reapibase";

const updates = () => {
    const ls = useSelector(state => state.fs.ls);
    const d = useDispatch();

    const urs = () => {
        d(ff.rs());
    }
    const u0 = (f0, value) => {
        d(ff.u0({f0, value}));
    }
    const u1 = (f0, f1, value) => {
        d(ff.u1({f0, f1, value}));
    }
    const u2 = (f0, f1, f2, value) => {
        d(ff.u2({f0, f1, f2, value}));
    }
    const u3 = (f0, f1, f2, f3, value) => {
        d(ff.u3({f0, f1, f2, f3, value}));
    }
    const u4 = (f0, f1, f2, f3, f4, value) => {
        d(ff.u4({f0, f1, f2, f3, f4, value}));
    }
    const u5 = (f0, f1, f2, f3, f4, f5, value) => {
        d(ff.u5({f0, f1, f2, f3, f4, f5, value}));
    }
    const u6 = (f0, f1, f2, f3, f4, f5, f6, value) => {
        d(ff.u6({f0, f1, f2, f3, f4, f5, f6, value}));
    }
    const u7 = (f0, f1, f2, f3, f4, f5, f6, f7, value) => {
        d(ff.u7({f0, f1, f2, f3, f4, f5, f6, f7, value}));
    }
    const u8 = (f0, f1, f2, f3, f4, f5, f6, f7, f8, value) => {
        d(ff.u8({f0, f1, f2, f3, f4, f5, f6, f7, f8, value}));
    }
    const u9 = (f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, value) => {
        d(ff.u9({f0, f1, f2, f3, f4, f5, f6, f7, f8, f9, value}));
    }
    return {urs, u0, u1, u2, u3, u4, u5, u6, u7, u8, u9}
}

const useF = props => {
    const s = useSelector(state => state.fs.s);
    const { urs, u0, u1, u2, u3, u4, u5, u6, u7, u8, u9 } = updates();

    const app = {
        helloWorld: () => {
            const end = 'base/hh';
            const auth_code = "0e5a332d-9e2e-427d-bd84-4e581fe8a806"

            const header = {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${auth_code}`
            }

            miAxios.get(end)
            .then(res => {
                console.log(res.data);
                u2("app", "hh", "response", res.data);
            })
            .catch(err => {
                console.log(err);
            });
        }, 
        getModes: () => {
            const end = 'base/get_modes';
            miAxios.get(end)
            .then(res => {
                u1("app", "modes", res.data);
            })
            .catch(err => {
                console.log(err);
            });
        }
    }

    const auth = {
        login: (usuario, passwd) => {
            if (s.loadings?.auth?.login) return;
            u2("loadings", "auth", "login", true);
            const url = "auth/login"
            const data = {
                usuario, passwd
            }
            miAxios.post(url, data)
            .then(response => {
                console.log(response.data);
                const { user, token } = response.data;
                u2("auth", "form", "usuario", "");
                u2("auth", "form", "passwd", "");
                u1("auth", "logged", true);
                u1("usuario", "data", user);

                // set cookie unqvs for 12 hr
                const date = new Date();
                                    // ms  *  s  *  m  *  h
                const miliseconds = 1000 * 60 * 60 * 12;
                date.setTime(date.getTime() + (miliseconds));
                const dateExpired = date.toUTCString();
                const expires = 'expires=' + dateExpired
                const miCookie = pjid + "=" + token + ";" + expires + ";path=/";
                document.cookie = miCookie;

            }).catch(error => {
                console.log(error);
                const message = error.response.data.detail || "error";
                general.notificacion({
                    message,
                    title: "Error",
                    mode: "danger"
                })
                u1("auth", "logged", false);

            }).finally(() => {
                u2("loadings", "auth", "login", false);
            })
        },
        validateLogin: () => {
            if (s.loadings?.auth?.validateLogin) return;
            u2("loadings", "auth", "validateLogin", true);
            const end = 'auth/validate_login';
            miAxios.get(end)
            .then(res => {
                const { user, token } = res.data;
                // set cookie unqvs for 5 hr
                const date = new Date();
                                    // ms  *  s  *  m  *  h
                const miliseconds = 1000 * 60 * 60 * 5;
                date.setTime(date.getTime() + (miliseconds));
                const dateExpired = date.toUTCString();
                const expires = 'expires=' + dateExpired
                const miCookie = pjid + "=" + token + ";" + expires + ";path=/";
                document.cookie = miCookie;
                u1("auth", "logged", true);
                u1("usuario", "data", user);
            })
            .catch(err => {
                auth.closeSession();
            }).finally(() => {
                u2("loadings", "auth", "validateLogin", false);
            });
        },
        closeSession: () => {
            if (s.users?.logged) {
                const end = 'auth/close_session';
                miAxios.get(end)
                .then(res => {
                    console.log(res.data);
                });
            }
            urs();
            document.cookie = pjid + "=;expires=Thu, 01 Jan 1970 00:00:00 UTC;path=/";
        }
    }

    const general = {
        notificacion: props => {
            u1("general", "notification", props);
            u2("modals", "general", "notification", true);
        }
    }

    return { 
        u0, u1, u2, u3, u4, u5, u6, u7, u8, u9, 
        app, general, auth, 
    };
}

export { useF };