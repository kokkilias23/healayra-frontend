import '../styles/ServicesPreview.css'

const services = [
    {
        icon: '◉',
        title: 'Ατομική Συνεδρία',
        description:
            'Εξατομικευμένες συνεδρίες δια ζώσης ή online, προσαρμοσμένες στις ανάγκες του θεραπευόμενου.',
    },
    {
        icon: '⌁',
        title: 'Online Συνεδρία',
        description:
            'Ασφαλείς συνεδρίες εξ αποστάσεως με ευελιξία και άμεση πρόσβαση από οπουδήποτε.',
    },
    {
        icon: '♡',
        title: 'Συμβουλευτική',
        description:
            'Υποστήριξη και καθοδήγηση με επίκεντρο τις προσωπικές ανάγκες και τους στόχους του θεραπευόμενου.',
    },
]

export default function ServicesPreview() {
    return (
        <section className="services-preview">
            <div className="services-container">
                <div className="services-heading">
                    <span className="services-eyebrow">
                        Υπηρεσίες
                    </span>

                    <h2>
                        Φροντίδα προσαρμοσμένη
                        <span> σε κάθε άνθρωπο.</span>
                    </h2>

                    <p>
                        Ένα σύγχρονο περιβάλλον που συνδέει
                        επαγγελματία και θεραπευόμενο με
                        απλότητα και συνέπεια.
                    </p>
                </div>

                <div className="services-grid">
                    {services.map((service) => (
                        <article
                            className="service-card"
                            key={service.title}
                        >
                            <div className="service-icon">
                                {service.icon}
                            </div>

                            <h3>
                                {service.title}
                            </h3>

                            <p>
                                {service.description}
                            </p>

                            <span className="service-link">
                                Μάθε περισσότερα
                                <span>→</span>
                            </span>
                        </article>
                    ))}
                </div>
            </div>
        </section>
    )
}