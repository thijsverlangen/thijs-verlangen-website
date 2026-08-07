import { useEffect } from 'react';

export default function App() {
  useEffect(() => {
    const navbar = document.getElementById('navbar');
    const onScroll = () => {
      if (navbar) navbar.classList.toggle('scrolled', window.scrollY > 80);

      // Parallax on hero image
      const heroImage = document.querySelector('.hero-image') as HTMLElement;
      if (heroImage && window.scrollY < window.innerHeight) {
        heroImage.style.transform = `translateY(${window.scrollY * 0.4}px)`;
      }

      // Sticky CTA bar
      const stickyCta = document.getElementById('stickyCta');
      const ctaSection = document.getElementById('contact');
      const footer = document.querySelector('.footer');
      if (stickyCta) {
        const ctaTop = ctaSection?.getBoundingClientRect().top ?? Infinity;
        const footerTop = footer?.getBoundingClientRect().top ?? Infinity;
        const inCtaOrFooter = ctaTop < window.innerHeight && ctaTop > 0 || footerTop < window.innerHeight;
        if (window.scrollY > window.innerHeight && !inCtaOrFooter) {
          stickyCta.classList.add('sticky-cta-visible');
        } else {
          stickyCta.classList.remove('sticky-cta-visible');
        }
      }
    };
    window.addEventListener('scroll', onScroll);

    const navToggle = document.getElementById('navToggle');
    const navLinks = document.getElementById('navLinks');
    const onToggle = () => {
      const isOpen = navLinks?.classList.toggle('open') ?? false;
      navToggle?.setAttribute('aria-expanded', String(isOpen));
    };
    navToggle?.addEventListener('click', onToggle);

    const linkHandlers: Array<{ el: Element; handler: EventListener }> = [];
    navLinks?.querySelectorAll('a').forEach((l) => {
      const h = () => {
        navLinks.classList.remove('open');
        navToggle?.setAttribute('aria-expanded', 'false');
      };
      l.addEventListener('click', h);
      linkHandlers.push({ el: l, handler: h });
    });

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) e.target.classList.add('visible');
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -40px 0px' }
    );
    document.querySelectorAll('.fade-in').forEach((el) => observer.observe(el));

    const anchorHandlers: Array<{ el: Element; handler: EventListener }> = [];
    document.querySelectorAll('a[href^="#"]').forEach((a) => {
      const h = function (this: HTMLAnchorElement, e: Event) {
        e.preventDefault();
        const href = this.getAttribute('href');
        if (!href || href === '#') return;
        const t = document.querySelector(href);
        if (t) t.scrollIntoView({ behavior: 'smooth', block: 'start' });
      } as EventListener;
      a.addEventListener('click', h);
      anchorHandlers.push({ el: a, handler: h });
    });

    // Theater video: lazy-load zodra de sectie nadert, daarna cycle showreel → behind-the-scenes
    const theaterVideo = document.getElementById('theaterVideo') as HTMLVideoElement | null;
    const videoSources = ['showreel-short.mp4', 'behindthescenes-short.mp4'];
    let currentVideo = 0;
    const onTheaterEnd = () => {
      if (!theaterVideo) return;
      currentVideo = (currentVideo + 1) % videoSources.length;
      theaterVideo.src = videoSources[currentVideo];
      theaterVideo.load();
      theaterVideo.muted = true;
      theaterVideo.play().catch(() => {});
    };
    theaterVideo?.addEventListener('ended', onTheaterEnd);

    let videoObserver: IntersectionObserver | null = null;
    if (theaterVideo) {
      videoObserver = new IntersectionObserver(
        (entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting && !theaterVideo.src) {
              theaterVideo.src = videoSources[0];
              theaterVideo.muted = true;
              theaterVideo.play().catch(() => {});
              videoObserver?.disconnect();
            }
          });
        },
        { rootMargin: '400px' }
      );
      videoObserver.observe(theaterVideo);
    }

    // Animated counters on stats
    const statObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          const el = entry.target as HTMLElement;
          statObserver.unobserve(el);
          const original = el.getAttribute('data-target') || '';
          let target = 0;
          let suffix = '';
          let prefix = '';
          if (original === '#1') {
            el.textContent = '#1';
            return;
          } else if (original.endsWith('K+')) {
            target = parseInt(original);
            suffix = 'K+';
          } else if (original.endsWith('M+')) {
            target = parseInt(original);
            suffix = 'M+';
          } else if (original.endsWith('+')) {
            target = parseInt(original);
            suffix = '+';
          }
          el.textContent = '0';
          const duration = 1500;
          const start = performance.now();
          const animate = (now: number) => {
            const elapsed = now - start;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 4);
            const current = Math.round(eased * target);
            el.textContent = prefix + current + (progress >= 1 ? suffix : suffix);
            if (progress < 1) requestAnimationFrame(animate);
          };
          requestAnimationFrame(animate);
        });
      },
      { threshold: 0.5 }
    );
    document.querySelectorAll('.stat-number').forEach((el) => {
      const htmlEl = el as HTMLElement;
      htmlEl.setAttribute('data-target', htmlEl.textContent || '');
      statObserver.observe(el);
    });

    // 3D tilt on book cover
    const bookCover = document.querySelector('.book-cover-visual') as HTMLElement;
    const onBookMove = (e: MouseEvent) => {
      if (!bookCover) return;
      const rect = bookCover.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      bookCover.style.transform = `perspective(800px) rotateY(${x * 15}deg) rotateX(${-y * 15}deg)`;
    };
    const onBookLeave = () => {
      if (bookCover) bookCover.style.transform = 'perspective(800px) rotateY(0) rotateX(0)';
    };
    if (bookCover) {
      bookCover.style.transition = 'transform 0.1s ease';
      bookCover.addEventListener('mousemove', onBookMove);
      bookCover.addEventListener('mouseleave', onBookLeave);
    }

    return () => {
      window.removeEventListener('scroll', onScroll);
      navToggle?.removeEventListener('click', onToggle);
      linkHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
      anchorHandlers.forEach(({ el, handler }) => el.removeEventListener('click', handler));
      observer.disconnect();
      theaterVideo?.removeEventListener('ended', onTheaterEnd);
      videoObserver?.disconnect();
      statObserver.disconnect();
      if (bookCover) {
        bookCover.removeEventListener('mousemove', onBookMove);
        bookCover.removeEventListener('mouseleave', onBookLeave);
      }
    };
  }, []);

  return (
    <>
      {/* NAV */}
      <nav className="nav" id="navbar">
        <a href="#hero" className="nav-logo" aria-label="Thijs Verlangen, terug naar boven">
          THIJS <span>VERLANGEN</span>
        </a>
        <ul className="nav-links" id="navLinks">
          <li>
            <a href="#onderwerpen">Onderwerpen</a>
          </li>
          <li>
            <a href="#over">Over</a>
          </li>
          <li>
            <a href="#samenwerken">Samenwerken</a>
          </li>
          <li>
            <a href="#boek">Het Boek</a>
          </li>
          <li>
            <a
              href="https://www.verlangenfinance.nl"
              target="_blank"
              rel="noopener"
              style={{ color: 'var(--gold)' }}
            >
              Verlangen Finance {'\u2192'}
            </a>
          </li>
        </ul>
        <a href="#contact" className="nav-cta">
          Boek Thijs
        </a>
        <button className="nav-toggle" id="navToggle" type="button" aria-label="Menu openen of sluiten" aria-expanded="false" aria-controls="navLinks">
          <span></span>
          <span></span>
          <span></span>
        </button>
      </nav>

      {/* HERO */}
      <section className="hero" id="hero">
        <div className="hero-image">
          <img src="hero-new.jpg" alt="Thijs Verlangen" />
        </div>
        <div className="hero-gradient"></div>
        <div className="hero-content">
          <p className="hero-subtitle">
            Vermogensstrateeg {'\u2022'} Auteur {'\u2022'} Spreker
          </p>
          <h1 className="hero-title">
            Thijs<br />Verlangen
          </h1>
          <p className="hero-tagline">
            Fiscale strategie vertaald naar <span>concrete actie</span>
          </p>
        </div>
        <div className="hero-scroll">
          <span>Scroll</span>
          <div className="hero-scroll-line"></div>
        </div>
      </section>

      {/* MARQUEE */}
      <div className="marquee-bar">
        <div className="marquee-track">
          <span className="marquee-text">
            Vermogensstrateeg <span className="sep">//</span> 250.000+ volgers <span className="sep">//</span> #1 Bestseller Pas Op. Dit Boek Maakt Je Rijk <span className="sep">//</span> Host Finance Inside Podcast <span className="sep">//</span> Eigenaar Verlangen Finance
          </span>
        </div>
      </div>

      {/* STATS BAR */}
      <div className="stats-bar">
        <div className="stats-grid fade-in">
          <div className="stat">
            <div className="stat-number">250K+</div>
            <div className="stat-label">Volgers op social media</div>
          </div>
          <div className="stat">
            <div className="stat-number">2M+</div>
            <div className="stat-label">Maandelijks bereik</div>
          </div>
          <div className="stat">
            <div className="stat-number">50+</div>
            <div className="stat-label">Keynotes gegeven</div>
          </div>
          <div className="stat">
            <div className="stat-number">150+</div>
            <div className="stat-label">Podcast afleveringen</div>
          </div>
          <div className="stat stat-highlight">
            <div className="stat-number">#1</div>
            <div className="stat-label">Bestseller 60</div>
          </div>
        </div>
      </div>

      {/* INTRO */}
      <section className="intro" id="intro">
        <div className="fade-in">
          <p className="intro-label">Boek mij voor</p>
          <h2 className="intro-types">
            Keynotes <span>/</span> Panels <span>/</span> Media <span>/</span> Podcasts
          </h2>
          <div className="gold-line"></div>
          <div className="intro-text">
            <p>
              Thijs Verlangen is <strong>de stem van de nieuwe generatie financiële denkers</strong> in Nederland. Met een community van meer dan 250.000 volgers op social media bereikt hij dagelijks honderdduizenden Nederlanders. Als eigenaar van{' '}
              <a
                href="https://www.verlangenfinance.nl"
                target="_blank"
                rel="noopener"
                style={{ color: 'var(--gold)', fontWeight: 600, borderBottom: '1px solid var(--gold)' }}
              >
                Verlangen Finance
              </a>
              {' '}helpt hij ondernemers en vermogende particulieren met vermogensplanning en fiscale optimalisatie. Als auteur van <em>Pas Op. Dit Boek Maakt Je Rijk</em> en host van de Finance Inside podcast vertaalt hij complexe fiscale strategieën naar concrete actie die duizenden euro's per jaar oplevert.
            </p>
            <p>Geen saaie spreadsheets. Geen jargon. Gewoon heldere taal over geld, belasting en vermogensopbouw die mensen daadwerkelijk kunnen toepassen.</p>
          </div>
        </div>
      </section>

      {/* BEKEND VAN */}
      <section className="bekend">
        <div className="fade-in">
          <p className="bekend-label">Bekend van</p>
          <div className="bekend-logos">
            <div className="bekend-logo">
              SBS6<span className="sub">Samen Sterk</span>
            </div>
            <div className="bekend-logo">
              Zondag op Vier<span className="sub">TV / Pernille la Lau</span>
            </div>
            <div className="bekend-logo">
              WTFinance<span className="sub">Jay Jay Boske</span>
            </div>
            <div className="bekend-logo">
              Finance Inside<span className="sub">Podcast host</span>
            </div>
            <div className="bekend-logo">
              Grow Business Event<span className="sub">Keynote</span>
            </div>
            <div className="bekend-logo">
              FOF Zuid-Afrika<span className="sub">Podcast</span>
            </div>
            <div className="bekend-logo">
              Code 49<span className="sub">Spreker</span>
            </div>
            <div className="bekend-logo">
              HTUSM 4.0<span className="sub">Panel</span>
            </div>
            <div className="bekend-logo">
              Theatershow<span className="sub">Live podium</span>
            </div>
            <div className="bekend-logo">
              Bestseller 60<span className="sub">#1 Auteur</span>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider-line"></span>
      </div>

      {/* AUTHORITY / ACTION PHOTOS */}
      <section className="authority">
        <div className="fade-in">
          <p className="authority-label">Op het podium</p>
          <h2 className="authority-headline">Energiek, helder en altijd met concrete takeaways</h2>
        </div>
        <div className="authority-grid">
          <div className="authority-img fade-in">
            <img src="FullSizeRender 3_web.jpg" alt="Thijs Verlangen op het podium met microfoon" loading="lazy" />
          </div>
          <div className="authority-img fade-in fade-in-delay-1">
            <img src="DSC04640-2_web.jpg" alt="Thijs Verlangen spreekt voor publiek" loading="lazy" />
          </div>
          <div className="authority-img fade-in fade-in-delay-2">
            <img src="VV6_web.jpg" alt="Thijs Verlangen presenteert strategie" loading="lazy" />
          </div>
        </div>
      </section>

      {/* TOPICS */}
      <section className="topics" id="onderwerpen">
        <div className="section-header fade-in">
          <p className="section-label">Expertise</p>
          <h2 className="section-title">
            Onderwerpen waar ik<br />over spreek
          </h2>
        </div>
        <div className="topics-grid">
          <div className="topic-card fade-in fade-in-delay-1">
            <p className="topic-number">01</p>
            <h3 className="topic-title">Vermogensopbouw voor Ondernemers</h3>
            <p className="topic-desc">Van BV structuren tot pensioen in eigen beheer: hoe je als ondernemer slim vermogen opbouwt zonder de fiscus blij te maken.</p>
          </div>
          <div className="topic-card fade-in fade-in-delay-2">
            <p className="topic-number">02</p>
            <h3 className="topic-title">Financiele Vrijheid Zonder Opoffering</h3>
            <p className="topic-desc">Waarom "Die With Zero" denken je leven verandert en hoe je geniet terwijl je bouwt.</p>
          </div>
          <div className="topic-card fade-in fade-in-delay-3">
            <p className="topic-number">03</p>
            <h3 className="topic-title">Belastingoptimalisatie (Legaal)</h3>
            <p className="topic-desc">De strategieën die accountants je niet vertellen maar die duizenden euro's per jaar schelen.</p>
          </div>
          <div className="topic-card fade-in fade-in-delay-4">
            <p className="topic-number">04</p>
            <h3 className="topic-title">Generatievermogen</h3>
            <p className="topic-desc">Hoe je vermogen opbouwt dat verder gaat dan jezelf: erfplanning, schenkingen en familiestructuren.</p>
          </div>
          <div className="topic-card fade-in fade-in-delay-5">
            <p className="topic-number">05</p>
            <h3 className="topic-title">Pensioen in Eigen Regie</h3>
            <p className="topic-desc">Waarom je niet moet vertrouwen op het overheidspensioen en hoe je zelf een pensioenstructuur opbouwt die jou wel financiële zekerheid geeft. Van pensioen in eigen beheer tot slimme oudedagsvoorzieningen.</p>
          </div>
          <div className="topic-card fade-in fade-in-delay-6">
            <p className="topic-number">06</p>
            <h3 className="topic-title">Box 3 &amp; Slim Beleggen</h3>
            <p className="topic-desc">Hoe je als vermogende particulier of ondernemer slim omgaat met de nieuwe Box 3 regels en je rendement optimaliseert zonder onnodige belastingdruk.</p>
          </div>
        </div>
      </section>

      {/* TESTIMONIALS */}
      <section className="testimonials">
        <div className="testimonials-header fade-in">
          <p className="testimonials-label">Wat zij zeggen</p>
          <h2 className="testimonials-title">Over werken met Thijs</h2>
        </div>
        <div className="testimonials-grid">
          <div className="testimonial fade-in fade-in-delay-1">
            <div className="testimonial-quote-mark">{'\u201C'}</div>
            <p className="testimonial-text">Thijs kent alle kneepjes van het vak om juist op een legale manier zoveel mogelijk geld te besparen.</p>
            <div className="testimonial-divider"></div>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">JR</div>
              <div>
                <p className="testimonial-author">Joep Rovers</p>
                <p className="testimonial-role">Founder Elvou Group</p>
              </div>
            </div>
          </div>
          <div className="testimonial fade-in fade-in-delay-2">
            <div className="testimonial-quote-mark">{'\u201C'}</div>
            <p className="testimonial-text">Thijs maakt van fiscale planning iets wat je wilt begrijpen. Zijn kennis is diepgaand en zijn manier van overbrengen is verfrissend eerlijk.</p>
            <div className="testimonial-divider"></div>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">T</div>
              <div>
                <p className="testimonial-author">Tibor</p>
                <p className="testimonial-role">Ondernemer</p>
              </div>
            </div>
          </div>
          <div className="testimonial fade-in fade-in-delay-3">
            <div className="testimonial-quote-mark">{'\u201C'}</div>
            <p className="testimonial-text">Helder, concreet en zonder jargon. Thijs weet precies waar de kansen liggen en legt complexe stof haarfijn uit aan ondernemers.</p>
            <div className="testimonial-divider"></div>
            <div className="testimonial-footer">
              <div className="testimonial-avatar">J</div>
              <div>
                <p className="testimonial-author">Jaro</p>
                <p className="testimonial-role">Lotgenoten</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider-line"></span>
      </div>

      {/* SHOWREEL / THEATER VIDEO */}
      <section className="showreel">
        <div className="showreel-header fade-in">
          <p className="showreel-label">Zie Thijs in actie</p>
          <h2 className="showreel-title">Van theaterpodium tot keynote</h2>
        </div>
        <div className="showreel-wrapper fade-in">
          <video id="theaterVideo" muted playsInline preload="none" poster="DSC08407_web.jpg"></video>
        </div>
        <p className="showreel-caption">Highlights uit recente optredens</p>
      </section>

      {/* BIO */}
      <section className="bio" id="over">
        <div className="bio-image">
          <img src="20250228-tomdoms_0290073_web.jpg" alt="Thijs Verlangen presenteert" loading="lazy" />
        </div>
        <div className="bio-content fade-in">
          <p className="section-label">Over Thijs</p>
          <h2 className="bio-name">
            De man achter<br />de cijfers
          </h2>
          <div className="bio-text">
            <p>
              Thijs Verlangen begon zijn carrière in de financiële wereld en zag al snel dat de meeste ondernemers geen idee hadden hoeveel geld ze lieten liggen. Niet door slechte investeringen, maar door <strong>gemiste fiscale kansen</strong>.
            </p>
            <p>
              Vandaag is hij eigenaar van{' '}
              <a
                href="https://www.verlangenfinance.nl"
                target="_blank"
                rel="noopener"
                style={{ color: 'var(--gold)', fontWeight: 600, borderBottom: '1px solid var(--gold)' }}
              >
                Verlangen Finance
              </a>
              , een financieel advieskantoor dat ondernemers en vermogende particulieren helpt met vermogensplanning, pensioenstructuren en belastingoptimalisatie. Met een team van specialisten begeleidt Verlangen Finance klanten bij het structureren van hun vermogen en het benutten van fiscale mogelijkheden. Zijn aanpak: geen wollige adviezen, maar concrete cijfers en directe implementatie.
            </p>
            <p>
              Als auteur van de #1 bestseller <em>Pas Op. Dit Boek Maakt Je Rijk</em> maakt hij financiële kennis toegankelijk voor iedereen. Als host van de <strong>Finance Inside podcast</strong> interviewt hij ondernemers en experts over geld, groei en generatievermogen.
            </p>
            <p>Thijs woont in Nederland en is vader van een dochter. Hij gelooft dat financiële vrijheid niet betekent dat je stopt met werken, maar dat je kiest waarvoor je werkt.</p>
          </div>
          <a href="#contact" className="btn">
            Boek Thijs <span className="btn-arrow">{'\u2192'}</span>
          </a>
        </div>
      </section>

      {/* SERVICES */}
      <section className="services" id="samenwerken">
        <div className="section-header fade-in">
          <p className="section-label">Samenwerken</p>
          <h2 className="section-title" style={{ color: 'var(--white)' }}>
            Manieren om<br />samen te werken
          </h2>
        </div>
        <div className="services-grid">
          <div className="service-card fade-in fade-in-delay-1">
            <div className="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F7CD45" strokeWidth="1.5">
                <path d="M12 2L2 7l10 5 10-5-10-5z" />
                <path d="M2 17l10 5 10-5" />
                <path d="M2 12l10 5 10-5" />
              </svg>
            </div>
            <h3 className="service-title">Keynote Spreker</h3>
            <p className="service-desc">Energieke presentaties van 30 minuten tot 2 uur, afhankelijk van de vraag. Voor ondernemers en vermogende particulieren over vermogen, fiscale strategie en ondernemen. Interactief, concreet en altijd met takeaways die je dezelfde week nog kunt toepassen.</p>
          </div>
          <div className="service-card fade-in fade-in-delay-2">
            <div className="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F7CD45" strokeWidth="1.5">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
            </div>
            <h3 className="service-title">Panel Deelnemer</h3>
            <p className="service-desc">Expert perspectief op financiële onderwerpen voor conferenties en events. Scherpe meningen, onderbouwd met data en praktijkervaring.</p>
          </div>
          <div className="service-card fade-in fade-in-delay-3">
            <div className="service-icon">
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#F7CD45" strokeWidth="1.5">
                <path d="M23 7l-7 5 7 5V7z" />
                <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
              </svg>
            </div>
            <h3 className="service-title">Media &amp; Podcast Gast</h3>
            <p className="service-desc">Beschikbaar voor interviews, columns en podcast appearances. Van korte quotes tot diepgaande gesprekken over geld en strategie.</p>
          </div>
        </div>
        <div className="services-cta fade-in">
          <a href="#contact" className="btn btn-outline" style={{ marginTop: '2rem' }}>
            Neem contact op <span className="btn-arrow">{'\u2192'}</span>
          </a>
        </div>
      </section>

      {/* BOOK */}
      <section className="book" id="boek">
        <div className="book-inner fade-in">
          <div className="book-covers">
            <div className="book-cover">
              <div className="book-cover-visual">
                <img src="boek-voorkant.png" alt="Pas Op. Dit Boek Maakt Je Rijk - voorkant" loading="lazy" />
              </div>
            </div>
            <div className="book-back">
              <img src="boek-achterkant.png" alt="Pas Op. Dit Boek Maakt Je Rijk - achterkant" loading="lazy" />
            </div>
          </div>
          <div className="book-content">
            <p className="section-label">Het Boek</p>
            <div style={{ display: 'inline-block', background: '#F7CD45', color: '#000', fontWeight: 800, fontSize: '0.75rem', letterSpacing: '0.15em', textTransform: 'uppercase' as const, padding: '6px 14px', borderRadius: '4px', marginBottom: '14px' }}>
              {'\u2605'} #1 Bestseller 60
            </div>
            <h2 className="book-title">
              Pas Op Dit Boek<br />Maakt Je Rijk
            </h2>
            <p className="book-text">Binnengekomen op #1 in De Bestseller 60. Het complete handboek voor iedereen die grip wil krijgen op geld, belasting en vermogensopbouw. Van de basis tot geavanceerde fiscale strategieën, geschreven in de heldere taal waar Thijs om bekend staat.</p>
            <a href="https://www.verlangenfinance.nl/preorder-boek" target="_blank" rel="noopener" className="btn btn-book">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '6px', verticalAlign: 'middle' }}>
                <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
                <path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z" />
              </svg>
              Bestel het boek <span className="btn-arrow">{'\u2192'}</span>
            </a>
          </div>
        </div>
        <div className="bestseller-proof fade-in">
          <img src="bestseller-nr1.png" alt="Pas Op. Dit Boek Maakt Je Rijk op #1 in de Bestseller 60" loading="lazy" />
        </div>
      </section>

      {/* FAQ */}
      <section className="faq" id="faq">
        <div className="section-header fade-in">
          <p className="section-label">Veelgestelde vragen</p>
          <h2 className="section-title">Praktische zaken<br />op een rij</h2>
        </div>
        <div className="faq-list fade-in">
          <details className="faq-item">
            <summary>Wat kost een keynote of optreden van Thijs?</summary>
            <p>Tarieven verschillen per type sessie, duur, locatie en publiek. Voor een concreet voorstel: vul het boekingsformulier in of stuur een mail met de event details. Je krijgt binnen 24 uur een reactie.</p>
          </details>
          <details className="faq-item">
            <summary>Hoe lang duurt een sessie?</summary>
            <p>Keynotes zijn typisch 30 tot 60 minuten. Voor diepere sessies, workshops of Q&amp;A formats kan dit oplopen tot 2 uur. Duur stem ik altijd af op het event-programma en de doelgroep.</p>
          </details>
          <details className="faq-item">
            <summary>Voor welk type publiek is Thijs geschikt?</summary>
            <p>Primair: ondernemers en vermogende particulieren. Daarnaast spreek ik regelmatig voor financieel adviseurs, family offices, beleggersclubs en mastermind-groepen. Geen advies-jargon: heldere taal, concrete strategie, direct toepasbaar.</p>
          </details>
          <details className="faq-item">
            <summary>Doet Thijs ook online of hybride events?</summary>
            <p>Ja. Online keynotes, webinars en panel-deelnames doe ik regelmatig. Voor hybride events (live publiek + online stream) is een goede technische voorbereiding belangrijk. Daar geef ik een korte rider voor zodat alles soepel verloopt.</p>
          </details>
          <details className="faq-item">
            <summary>Reist Thijs ook buiten Nederland?</summary>
            <p>Ja, Europa en daarbuiten zijn bespreekbaar. Reis- en verblijfskosten worden los gefactureerd. Voor events op locatie buiten de Benelux plannen we minimaal 6 weken vooruit.</p>
          </details>
          <details className="faq-item">
            <summary>Welke voorbereidingstijd is er nodig?</summary>
            <p>Standaard 2 tot 4 weken. Voor maatwerk-content (bijv. case-specifieke voorbeelden uit jouw branche) graag eerder boeken zodat ik tijd heb om me in te lezen. Voor laatste-moment boekingen is contact maken altijd de moeite waard.</p>
          </details>
          <details className="faq-item">
            <summary>Hoe verloopt de boeking?</summary>
            <p>Stap 1: vul het formulier hieronder in of mail rechtstreeks. Stap 2: korte kennismakings-call om event en verwachtingen door te nemen. Stap 3: voorstel met tarief en voorwaarden. Stap 4: bevestiging en planning. Eenvoudig en zonder gedoe.</p>
          </details>
          <details className="faq-item">
            <summary>Spreekt Thijs ook in het Engels?</summary>
            <p>Ja. Engelstalige keynotes en panels zijn mogelijk. De meeste content is oorspronkelijk Nederlandstalig. Voor een Engelstalig optreden plan ik wat extra voorbereidingstijd in.</p>
          </details>
        </div>
      </section>

      {/* SECTION DIVIDER */}
      <div className="section-divider" aria-hidden="true">
        <span className="section-divider-line"></span>
      </div>

      {/* CONTACT / CTA */}
      <section className="cta" id="contact">
        <div className="fade-in">
          <h2 className="cta-title">Klaar om te praten?</h2>
          <p className="cta-text">Vertel kort over je event en ik reageer binnen 24 uur.</p>

          <form className="booking-form" action="https://formspree.io/f/xdabqbra" method="POST">
            <div className="form-row">
              <label className="form-field">
                <span>Naam</span>
                <input type="text" name="name" required autoComplete="name" />
              </label>
              <label className="form-field">
                <span>E-mail</span>
                <input type="email" name="email" required autoComplete="email" />
              </label>
            </div>
            <div className="form-row">
              <label className="form-field">
                <span>Organisatie / event</span>
                <input type="text" name="organization" autoComplete="organization" />
              </label>
              <label className="form-field">
                <span>Type sessie</span>
                <select name="session_type" defaultValue="Keynote">
                  <option>Keynote</option>
                  <option>Panel</option>
                  <option>Media / Podcast</option>
                  <option>Workshop</option>
                  <option>Anders</option>
                </select>
              </label>
            </div>
            <div className="form-row">
              <label className="form-field">
                <span>Event datum (indien bekend)</span>
                <input type="date" name="event_date" />
              </label>
              <label className="form-field">
                <span>Locatie / online</span>
                <input type="text" name="location" placeholder="Stad of online" />
              </label>
            </div>
            <label className="form-field form-field-full">
              <span>Bericht</span>
              <textarea name="message" rows={4} placeholder="Doelgroep, gewenste duur, eventuele bijzonderheden..." required></textarea>
            </label>
            <input type="hidden" name="_subject" value="Nieuwe boekingsaanvraag via thijsverlangen.nl" />
            <button type="submit" className="form-submit">
              Stuur aanvraag <span className="btn-arrow">{'→'}</span>
            </button>
          </form>

          <p className="cta-fallback">Liever direct mailen?</p>
          <a href="mailto:thijs@verlangenfinance.nl" className="cta-email">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
              <polyline points="22,6 12,13 2,6" />
            </svg>
            thijs@verlangenfinance.nl
          </a>
          <div className="cta-socials">
            <a href="https://www.instagram.com/thijsverlangen/" target="_blank" rel="noopener" aria-label="Instagram">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
              </svg>
            </a>
            <a href="https://www.linkedin.com/in/thijsverlangen/" target="_blank" rel="noopener" aria-label="LinkedIn">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect x="2" y="9" width="4" height="12" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>
            <a href="https://www.tiktok.com/@thijsverlangen" target="_blank" rel="noopener" aria-label="TikTok">
              <svg viewBox="0 0 24 24" fill="currentColor" stroke="none">
                <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-2.88 2.5 2.89 2.89 0 0 1-2.89-2.89 2.89 2.89 0 0 1 2.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 0 0-.79-.05A6.34 6.34 0 0 0 3.15 15a6.34 6.34 0 0 0 6.34 6.34 6.34 6.34 0 0 0 6.34-6.34V8.71a8.21 8.21 0 0 0 4.76 1.52v-3.4a4.85 4.85 0 0 1-1-.14z" />
              </svg>
            </a>
            <a href="https://www.youtube.com/@thijsverlangen" target="_blank" rel="noopener" aria-label="YouTube">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M22.54 6.42a2.78 2.78 0 0 0-1.94-2C18.88 4 12 4 12 4s-6.88 0-8.6.46a2.78 2.78 0 0 0-1.94 2A29 29 0 0 0 1 11.75a29 29 0 0 0 .46 5.33A2.78 2.78 0 0 0 3.4 19.1c1.72.46 8.6.46 8.6.46s6.88 0 8.6-.46a2.78 2.78 0 0 0 1.94-2 29 29 0 0 0 .46-5.25 29 29 0 0 0-.46-5.43z" />
                <polygon points="9.75,15.02 15.5,11.75 9.75,8.48" />
              </svg>
            </a>
          </div>
        </div>
      </section>

      {/* STICKY CTA BAR */}
      <div className="sticky-cta" id="stickyCta">
        <a href="#contact" className="sticky-cta-btn">
          Boek Thijs <span>{'→'}</span>
        </a>
      </div>

      {/* FOOTER */}
      <footer className="footer">
        <p className="footer-text">{'\u00A9'} 2026 THIJS VERLANGEN {'\u2022'} VERLANGEN FINANCE B.V.</p>
        <nav className="footer-topics" aria-label="Spreker-onderwerpen">
          <a href="/financieel-spreker/">Financieel spreker</a>
          <a href="/spreker-vermogensopbouw/">Spreker vermogensopbouw</a>
          <a href="/spreker-belastingoptimalisatie/">Spreker belastingoptimalisatie</a>
          <a href="/spreker-pensioen/">Spreker pensioen</a>
          <a href="/spreker-generatievermogen/">Spreker generatievermogen</a>
        </nav>
        <div className="footer-links">
          <a href="https://www.verlangenfinance.nl" target="_blank" rel="noopener">
            Verlangen Finance
          </a>
        </div>
      </footer>
    </>
  );
}
