const services = [
    {
        title: 'Ατομική Συνεδρία',
        description: 'Συνεδρίες δια ζώσης ή online.',
    },
    {
        title: 'Online Συνεδρία',
        description: 'Συνεδρίες εξ αποστάσεως',
    },
    {
        title: 'Συμβουλευτική',
        description: 'Υποστίριξη και καθοδήγηση ανάλογα με τις ανάγκες του θεραπευόμενου',
    },
]

export default function ServicesPreview() {
    return(
        <section className="services-preview">
            <h2>Υπηρεσίες</h2>

            <div className="services-grid">
                {services.map((service) => (
                    <div className="service-card" key={service.title}>
                        <h3>{service.title}</h3>
                        <p>{service.description}</p>
                        </div>
                ))}
            </div>
        </section>
    )
}