import {
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
} from 'react-router-dom'

import logo from '../assets/healayra-logo.png'

import { login } from '../services/AuthService.ts'

import '../styles/Login.css'

export default function Login() {
    const navigate = useNavigate()

    const [email, setEmail] =
        useState('')

    const [password, setPassword] =
        useState('')

    const [error, setError] =
        useState('')

    const [loading, setLoading] =
        useState(false)

    // Authenticate the user and redirect them according to their role.
    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {
            // AuthService handles the API request and stores the returned session data.
            const response = await login({
                email,
                password,
            })

            // Doctors enter their dashboard after a successful login.
            if (response.role === 'DOCTOR') {
                navigate('/doctor/dashboard')
                return
            }

            // Client users are redirected to their appointment area.
            navigate('/my-appointments')
        } catch (error) {
            if (error instanceof Error) {
                setError(error.message)
            } else {
                setError(
                    'Δεν ήταν δυνατή η σύνδεση',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="login-page">

            {/* Link back to the public home page */}
            <Link
                to="/"
                className="login-brand"
            >
                <img
                    src={logo}
                    alt="Healayra"
                />

                <span>
                    HEALAYRA
                </span>
            </Link>

            {/* Authentication form */}
            <section className="login-card">
                <div className="login-card-header">
                    <div className="login-logo-wrapper">
                        <img
                            src={logo}
                            alt=""
                            className="login-logo"
                        />
                    </div>

                    <h1>
                        Καλώς ήρθατε
                    </h1>

                    <p>
                        Συνδεθείτε στον λογαριασμό σας
                        για να συνεχίσετε.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="login-form"
                >
                    <div className="login-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value
                                )
                            }
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="login-field">
                        <label htmlFor="password">
                            Κωδικός
                        </label>

                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(event) =>
                                setPassword(
                                    event.target.value
                                )
                            }
                            placeholder="••••••••"
                            autoComplete="current-password"
                            required
                        />
                    </div>

                    {/* Show authentication errors returned by the backend */}
                    {error && (
                        <div
                            className="login-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="login-submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Σύνδεση...'
                            : 'Σύνδεση'}
                    </button>
                </form>

                <div className="login-footer">
                    <span>
                        Δεν έχετε λογαριασμό;
                    </span>

                    <Link to="/register">
                        Δημιουργία λογαριασμού
                    </Link>
                </div>
            </section>

            <p className="login-tagline">
                Trust the Process.
            </p>
        </main>
    )
}