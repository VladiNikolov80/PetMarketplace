import './Contact.css';

const CONTACT_EMAIL = 'contact@example.com';

export default function Contact() {
  return (
    <div className="contact-page">
      <h2>Contact us</h2>
      <p className="contact-intro">
        Have a question, found a problem, or want your ad to stand out? Write to us and we will get back to you.
      </p>

      <div className="contact-cards">
        <section className="contact-card">
          <h3>⭐ VIP ads — coming soon</h3>
          <p>
            We are preparing VIP ads that appear first in the Catalog with a special highlight.
            If you are interested, contact us and we will let you know when they are available.
          </p>
        </section>

        <section className="contact-card">
          <h3>📢 Advertising</h3>
          <p>Want to place a banner on PetMarketplace? Ask us about the free ad slots on the site.</p>
        </section>

        <section className="contact-card">
          <h3>💬 General questions</h3>
          <p>Account problems, reporting an inappropriate ad, or ideas for new features.</p>
        </section>
      </div>

      <a href={`mailto:${CONTACT_EMAIL}?subject=PetMarketplace`} className="contact-button">
        Email us
      </a>
    </div>
  );
}
