import {
    Link,
} from 'react-router-dom'

import logo
    from '../../assets/healayra-logo.png'

interface DoctorSidebarProps {
    doctorEmail: string | null

    activePage:
        | 'dashboard'
        | 'clients'
        | 'availability'

    onLogout:
        () => void

    doctorName?: string
    doctorSubtitle?: string
    avatarText?: string
}

export default function DoctorSidebar({
                                          doctorEmail,
                                          activePage,
                                          onLogout,
                                          doctorName,
                                          doctorSubtitle,
                                          avatarText,
                                      }: DoctorSidebarProps) {
    // Apply the active class only to the page currently displayed.
    function getMenuLinkClass(
        page:
            | 'dashboard'
            | 'clients'
            | 'availability',
    ): string {
        return `doctor-menu-link ${
            activePage === page
                ? 'active'
                : ''
        }`
    }

    // Optional profile details let pages display richer doctor information.
    const profileName =
        doctorName ??
        'Doctor Workspace'

    const profileSubtitle =
        doctorSubtitle ??
        doctorEmail ??
        'Επαγγελματίας Υγείας'

    const profileAvatar =
        avatarText ??
        'D'

    return (
        <aside className="doctor-sidebar">
            {/* Healayra doctor workspace branding */}
            <Link
                to="/doctor/dashboard"
                className="doctor-sidebar-brand"
            >
                <img
                    src={logo}
                    alt="Healayra"
                />

                <span>
                    HEALAYRA
                </span>
            </Link>

            {/* Display the currently authenticated doctor */}
            <div className="doctor-profile">
                <div className="doctor-avatar">
                    {profileAvatar}
                </div>

                <div>
                    <strong>
                        {profileName}
                    </strong>

                    <span>
                        {profileSubtitle}
                    </span>
                </div>
            </div>

            {/* Main navigation shared by doctor pages */}
            <nav className="doctor-menu">
                <Link
                    to="/doctor/dashboard"
                    className={
                        getMenuLinkClass(
                            'dashboard',
                        )
                    }
                >
                    <span className="menu-icon">
                        ⌂
                    </span>

                    Dashboard
                </Link>

                <Link
                    to="/doctor/clients"
                    className={
                        getMenuLinkClass(
                            'clients',
                        )
                    }
                >
                    <span className="menu-icon">
                        ♙
                    </span>

                    Θεραπευόμενοι
                </Link>

                <Link
                    to="/doctor/availability"
                    className={
                        getMenuLinkClass(
                            'availability',
                        )
                    }
                >
                    <span className="menu-icon">
                        ◷
                    </span>

                    Διαθεσιμότητα
                </Link>
            </nav>

            {/* Keep logout available at the bottom of the sidebar */}
            <div className="doctor-sidebar-footer">
                <button
                    type="button"
                    onClick={onLogout}
                    className="doctor-logout"
                >
                    <span>
                        ↪
                    </span>

                    Αποσύνδεση
                </button>
            </div>
        </aside>
    )
}