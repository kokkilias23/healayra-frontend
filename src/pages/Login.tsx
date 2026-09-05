import {
    useState,
    type FormEvent,
} from 'react'

import { useNavigate } from 'react-router-dom'

import { login } from '../services/AuthService.ts'

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

    async function handleSubmit(
        event: FormEvent<HTMLFormElement>,
    ) {
        event.preventDefault()

        setError('')
        setLoading(true)

        try {
            const response = await login({
                email,
                password,
            })

            if (response.role === 'DOCTOR') {
                navigate('/doctor/dashboard')
                return
            }

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
        <main>
            <h1>Σύνδεση</h1>

            <form onSubmit={handleSubmit}>
                <div>
                    <label htmlFor="email">
                        Email
                    </label>

                    <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(event) =>
                            setEmail(event.target.value)
                        }
                        required
                    />
                </div>

                <div>
                    <label htmlFor="password">
                        Κωδικός
                    </label>

                    <input
                        id="password"
                        type="password"
                        value={password}
                        onChange={(event) =>
                            setPassword(event.target.value)
                        }
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
                        ? 'Σύνδεση...'
                        : 'Σύνδεση'}
                </button>
            </form>
        </main>
    )
}