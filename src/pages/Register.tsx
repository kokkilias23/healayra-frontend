import {
    useState,
    type FormEvent,
} from 'react'

import {
    Link,
    useNavigate,
} from 'react-router-dom'

import {
    register,
} from '../services/AuthService'

export default function Register() {
    const navigate =
        useNavigate()

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

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')

        if (
            password !==
            confirmPassword
        ) {
            setError(
                'Οι κωδικοί δεν ταιριάζουν.',
            )

            return
        }

        if (password.length < 8) {
            setError(
                'Ο κωδικός πρέπει να έχει τουλάχιστον 8 χαρακτήρες.',
            )

            return
        }

        setLoading(true)

        try {
            await register({
                email: email.trim(),
                password,
                firstName:
                    firstName.trim(),
                lastName:
                    lastName.trim(),
                phone: phone.trim(),
            })

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
        <main>
            <h1>
                Δημιουργία Λογαριασμού
            </h1>

            <p>
                Δημιουργήστε λογαριασμό
                για να κλείσετε το
                ραντεβού σας.
            </p>

            <form
                onSubmit={handleSubmit}
            >
                <div>
                    <label
                        htmlFor="firstName"
                    >
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
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="lastName"
                    >
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
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="email"
                    >
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
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="phone"
                    >
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
                    />
                </div>

                <div>
                    <label
                        htmlFor="password"
                    >
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
                        minLength={8}
                        required
                    />
                </div>

                <div>
                    <label
                        htmlFor="confirmPassword"
                    >
                        Επιβεβαίωση Κωδικού
                    </label>

                    <input
                        id="confirmPassword"
                        type="password"
                        value={
                            confirmPassword
                        }
                        onChange={(event) =>
                            setConfirmPassword(
                                event.target.value,
                            )
                        }
                        minLength={8}
                        required
                    />
                </div>

                {error && (
                    <p role="alert">
                        {error}
                    </p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                >
                    {loading
                        ? 'Εγγραφή...'
                        : 'Εγγραφή'}
                </button>
            </form>

            <p>
                Έχετε ήδη λογαριασμό;{' '}
                <Link to="/login">
                    Σύνδεση
                </Link>
            </p>
        </main>
    )
}