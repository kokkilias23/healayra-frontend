import {
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
} from 'react-router-dom'

import logo from '../assets/healayra-logo.png'

import {
    register,
} from '../services/AuthService'

import '../styles/Register.css'

export default function Register() {
    const navigate = useNavigate()

    const [
        firstName,
        setFirstName,
    ] = useState('')

    const [
        lastName,
        setLastName,
    ] = useState('')

    const [email, setEmail] =
        useState('')

    const [phone, setPhone] =
        useState('')

    const [
        password,
        setPassword,
    ] = useState('')

    const [
        confirmPassword,
        setConfirmPassword,
    ] = useState('')

    const [error, setError] =
        useState('')

    const [loading, setLoading] =
        useState(false)

    // Validate the form and create a new client account.
    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')

        // Prevent registration when the two password fields do not match.
        if (
            password !==
            confirmPassword
        ) {
            setError(
                'Οι κωδικοί δεν ταιριάζουν.',
            )

            return
        }

        // Apply a minimum password length before sending the request.
        if (password.length < 8) {
            setError(
                'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.',
            )

            return
        }

        setLoading(true)

        try {
            // Trim user input before sending the registration data to the backend.
            await register({
                email: email.trim(),
                password,
                firstName:
                    firstName.trim(),
                lastName:
                    lastName.trim(),
                phone: phone.trim(),
            })

            // After registration, continue directly to appointment booking.
            navigate('/booking')
        } catch (error) {
            if (
                error instanceof Error
            ) {
                setError(
                    error.message,
                )
            } else {
                setError(
                    'Δεν ήταν δυνατή η εγγραφή.',
                )
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <main className="register-page">

            {/* Link back to the public home page */}
            <Link
                to="/"
                className="register-brand"
            >
                <img
                    src={logo}
                    alt="Healayra"
                />

                <span>
                    HEALAYRA
                </span>
            </Link>

            {/* Client registration form */}
            <section className="register-card">
                <div className="register-header">
                    <div className="register-logo-wrapper">
                        <img
                            src={logo}
                            alt=""
                            className="register-logo"
                        />
                    </div>

                    <span className="register-eyebrow">
                        Trust the Process.
                    </span>

                    <h1>
                        Δημιουργία λογαριασμού
                    </h1>

                    <p>
                        Δημιουργήστε τον λογαριασμό σας
                        για να προγραμματίσετε το επόμενο
                        ραντεβού σας.
                    </p>
                </div>

                <form
                    onSubmit={handleSubmit}
                    className="register-form"
                >
                    <div className="register-row">
                        <div className="register-field">
                            <label htmlFor="firstName">
                                Όνομα
                            </label>

                            <input
                                id="firstName"
                                type="text"
                                value={firstName}
                                onChange={(event) =>
                                    setFirstName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Όνομα"
                                autoComplete="given-name"
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="lastName">
                                Επώνυμο
                            </label>

                            <input
                                id="lastName"
                                type="text"
                                value={lastName}
                                onChange={(event) =>
                                    setLastName(
                                        event.target.value,
                                    )
                                }
                                placeholder="Επώνυμο"
                                autoComplete="family-name"
                                required
                            />
                        </div>
                    </div>

                    <div className="register-field">
                        <label htmlFor="email">
                            Email
                        </label>

                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(event) =>
                                setEmail(
                                    event.target.value,
                                )
                            }
                            placeholder="name@example.com"
                            autoComplete="email"
                            required
                        />
                    </div>

                    <div className="register-field">
                        <label htmlFor="phone">
                            Τηλέφωνο
                        </label>

                        <input
                            id="phone"
                            type="tel"
                            value={phone}
                            onChange={(event) =>
                                setPhone(
                                    event.target.value,
                                )
                            }
                            placeholder="69XXXXXXXX"
                            autoComplete="tel"
                        />
                    </div>

                    <div className="register-row">
                        <div className="register-field">
                            <label htmlFor="password">
                                Κωδικός
                            </label>

                            <input
                                id="password"
                                type="password"
                                value={password}
                                onChange={(event) =>
                                    setPassword(
                                        event.target.value,
                                    )
                                }
                                placeholder="••••••••"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>

                        <div className="register-field">
                            <label htmlFor="confirmPassword">
                                Επιβεβαίωση
                            </label>

                            <input
                                id="confirmPassword"
                                type="password"
                                value={confirmPassword}
                                onChange={(event) =>
                                    setConfirmPassword(
                                        event.target.value,
                                    )
                                }
                                placeholder="••••••••"
                                autoComplete="new-password"
                                minLength={8}
                                required
                            />
                        </div>
                    </div>

                    {/* Show validation or backend registration errors */}
                    {error && (
                        <div
                            className="register-error"
                            role="alert"
                        >
                            {error}
                        </div>
                    )}

                    <button
                        type="submit"
                        className="register-submit"
                        disabled={loading}
                    >
                        {loading
                            ? 'Δημιουργία λογαριασμού...'
                            : 'Δημιουργία λογαριασμού'}
                    </button>
                </form>

                <div className="register-footer">
                    <span>
                        Έχετε ήδη λογαριασμό;
                    </span>

                    <Link to="/login">
                        Σύνδεση
                    </Link>
                </div>
            </section>
        </main>
    )
}