(() => {
  'use strict';

  const root = document.documentElement;
  const navHeader = document.querySelector('.nav-header');
  const themeToggle = document.getElementById('themeToggle');
  const languageToggle = document.getElementById('languageToggle');
  const metaDescription = document.getElementById('metaDescription');
  const metaOgTitle = document.getElementById('metaOgTitle');
  const metaOgDescription = document.getElementById('metaOgDescription');
  const metaTwitterTitle = document.getElementById('metaTwitterTitle');
  const metaTwitterDescription = document.getElementById('metaTwitterDescription');

  const storage = {
    get(key) { try { return localStorage.getItem(key); } catch (_) { return null; } },
    set(key, value) { try { localStorage.setItem(key, value); } catch (_) {} }
  };

  const keys = { theme: 'dc_theme_preference', language: 'dc_language_preference' };
  let currentTheme = storage.get(keys.theme) === 'day' ? 'day' : 'night';
  let currentLanguage = storage.get(keys.language) === 'es' ? 'es' : 'en';

  const copy = {
    en: {
      metaTitle: '#1 AI Client Acquisition System for US Business Owners',
      metaDescription: 'Get more clients and respond instantly.',
      metaSocialDescription: 'Get more clients and respond instantly.',
      metaTwitterDescription: 'Get more clients and respond instantly.',
      heroTerms: ['US Business Owners', 'HVAC Businesses', 'Medical Practices', 'Roofing Companies', 'Dental Clinics', 'Med Spas', 'Real Estate Teams'],
      toggles: { themeNight: 'Night', themeDay: 'Day', toDay: 'Switch to daytime mode', toNight: 'Switch to nighttime mode', language: 'EN', switchLanguage: 'Switch language to Costa Rican Spanish' },
      calcScenario: ({ leads, response, deal }) => `Based on ${leads} leads, ${response} human response, and a ${deal} average deal value.`,
      calcReady: ({ revenue }) => `Ready to recover ${revenue}/year?`,
      calcHours: (hours) => hours === 1 ? '1 hour' : `${hours} hours`,
      calcAiResponse: '12 seconds',
      text: {
        'nav.toggle': 'Toggle navigation menu',
        'nav.system': 'System',
        'nav.proof': 'Proof',
        'nav.calculator': 'Calculator',
        'nav.integrations': 'Integrations',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contact',
        'hero.titleTop': '#1 AI Client Acquisition System',
        'hero.titleFor': 'for',
        'hero.lead': 'Get more clients and respond instantly.',
        'hero.proof': 'Join 200+ companies already ahead.',
        'shared.human': 'Human',
        'shared.ai': 'AI',
        'shared.lead': 'Lead',
        'trust.kicker': 'Trusted Stack',
        'trust.title': 'The AI, ads, messaging, and CRM tools behind the system.',
        'trust.metric1': 'leads commonly lost from slow follow-up',
        'trust.metric2': 'speed to first AI response',
        'trust.metric3': 'ROI with the system in place',
        'trust.label': 'Trusted by top teams',
        'trust.bar1Label': 'Speed to lead',
        'trust.bar1Value': 'Seconds, not hours',
        'trust.bar2Label': 'System model',
        'trust.bar2Value': 'Lead generation -> AI response -> booking',
        'trust.bar3Label': 'Best fit',
        'trust.bar3Value': 'High-ticket services where every lead matters',
        'calc.kicker': 'Performance',
        'calc.title': 'Outperforms slow follow-up.',
        'calc.subtitle': 'Start with 150 monthly leads, then see how instant AI response changes booked conversations and revenue from the same demand.',
        'calc.intro': 'Model the difference:',
        'calc.card1Label': '01. Capture instantly',
        'calc.card1Title': 'Respond in seconds while the lead is still ready to book.',
        'calc.card1HumanLabel': 'Human response',
        'calc.card1HumanValue': 'Hours later',
        'calc.card1AiLabel': 'AI response',
        'calc.card1AiValue': 'Within seconds',
        'calc.card2Label': '02. Increase conversions',
        'calc.card2Title': 'Turn more of the same qualified demand into booked appointments.',
        'calc.card2HumanLabel': 'Human follow-up',
        'calc.card2AiLabel': 'AI follow-up',
        'calc.card3Label': '03. Maximize capacity',
        'calc.card3Title': 'Scale follow-up across every lead without human bottlenecks.',
        'calc.card3HumanLabel': 'Human capacity',
        'calc.card3AiLabel': 'AI capacity',
        'calc.inputLeads': 'Monthly leads',
        'calc.inputResponse': 'Human response time (hours)',
        'calc.inputDeal': 'Average deal value',
        'calc.result1Label': 'Revenue recovered / year',
        'calc.result1Body': 'from leads you already have',
        'calc.result2Label': 'Extra appointments / month',
        'calc.result2Body': 'more booked conversations',
        'calc.result3Label': 'Additional revenue / month',
        'calc.result3Body': 'extra sales potential',
        'calc.compareHumanLabel': 'Human follow-up',
        'calc.compareHumanTitle': 'Manual response',
        'calc.compareAiLabel': 'AI Client Acquisition System',
        'calc.compareAiTitle': 'Instant AI capture',
        'calc.compareResponse': 'Response time',
        'calc.compareConversion': 'Conversion rate',
        'calc.ctaBody': 'See the exact rollout, response logic, and follow-up system that could produce these numbers for your business.',
        'feature1.kicker': 'Feature One',
        'feature1.title': 'Qualify new leads within seconds.',
        'feature1.subtitle': 'Qualified demand comes in, AI responds instantly, and more of those leads move into booked conversations.',
        'feature1.summary1Label': 'Step 1',
        'feature1.summary1Value': 'We bring qualified leads in.',
        'feature1.summary2Label': 'Step 2',
        'feature1.summary2Value': 'AI responds in seconds.',
        'feature1.summary3Label': 'Step 3',
        'feature1.summary3Value': 'More leads turn into clients.',
        'feature1.step1Eyebrow': 'Get Leads',
        'feature1.step1Title': 'We bring you qualified leads',
        'feature1.step1Body': 'Targeted campaigns bring in people already searching for your service, not random traffic.',
        'feature1.step1UiLabel': 'Lead Capture',
        'feature1.step1UiValue': 'Live Pipeline',
        'feature1.step1Flow1': 'Google Ads',
        'feature1.step1Flow2': 'Form filled',
        'feature1.step1VisualTitle': '12 new leads',
        'feature1.step1VisualBody': 'Qualified and ready to contact',
        'feature1.step1Result': 'Result: steady inbound opportunities.',
        'feature1.step2Eyebrow': 'Respond Fast',
        'feature1.step2Title': 'We contact every lead instantly using AI',
        'feature1.step2Body': 'Voice AI, SMS, and chat go live within seconds while the lead is still engaged.',
        'feature1.step2UiLabel': 'AI Follow-Up',
        'feature1.step2UiValue': 'Multi-channel',
        'feature1.step2Tag1': 'Voice AI',
        'feature1.step2Tag2': 'SMS',
        'feature1.step2Tag3': 'Chat',
        'feature1.step2Transcript1': 'Hi Sarah, saw your request come in.',
        'feature1.step2Transcript2': 'Want to get you booked right away.',
        'feature1.step2Result': 'Result: you reach the lead before competitors do.',
        'feature1.step3Eyebrow': 'Close More',
        'feature1.step3Title': 'We help you turn more leads into paying clients',
        'feature1.step3Body': 'Better follow-up, tighter qualification, and faster booking help more leads become paying clients.',
        'feature1.step3UiLabel': 'Revenue View',
        'feature1.step3UiValue': 'Booked + Closed',
        'feature1.step3Metric1': 'booked calls',
        'feature1.step3Metric2': 'closed deals',
        'feature1.step3VisualTitle': 'Conversion trend up',
        'feature1.step3VisualBody': 'More revenue from the same lead flow',
        'feature1.step3Booked': 'Booked',
        'feature1.step3Result': 'Result: more revenue from the same spend.',
        'feature2.kicker': 'Feature Two',
        'feature2.title': 'Turn interest into booked calls in one conversation.',
        'feature2.subtitle': 'No cold handoff to a booking link. AI guides the lead from interested to booked in one natural exchange.',
        'feature2.windowbar': 'Live acquisition workflow',
        'feature2.point1Label': 'Natural scheduling',
        'feature2.point1Value': 'AI guides the booking like a real setter would.',
        'feature2.point2Label': 'Live availability',
        'feature2.point2Value': 'Calendar logic stays synced and confirms instantly.',
        'feature2.point3Label': 'Zero-friction handoff',
        'feature2.point3Value': 'From interested to booked in a single conversation.',
        'feature2.status1Label': 'Lead source',
        'feature2.status1Value': 'Google Ads - Implant Consult',
        'feature2.status1Body': 'High-intent lead captured and routed instantly.',
        'feature2.status2Label': 'Response status',
        'feature2.status2Value': 'Voice AI launched in 19 seconds',
        'feature2.status2Body': 'SMS and chat flow triggered automatically.',
        'feature2.transcript1': 'I just filled out the form about treatment pricing.',
        'feature2.transcript2': 'Thanks for reaching out. I can get you booked right away and answer the next steps.',
        'feature2.transcript3': 'Tomorrow afternoon works.',
        'feature2.panel1Label': 'Pipeline',
        'feature2.panel1Value': 'New lead -> Qualified -> Booked',
        'feature2.panel2Label': 'Calendar',
        'feature2.panel2Value': '3 new consults booked today',
        'feature2.panel3Label': 'Outcome',
        'feature2.panel3Value': 'More value recovered from the same ad spend',
        'proof.kicker': 'Proof',
        'proof.title': 'What improves when response time stops being the bottleneck.',
        'proof.subtitle': 'Faster contact, more booked calls, stronger close potential, and more revenue recovered from the same lead flow.',
        'proof.card1Label': 'Response time',
        'proof.card1Body': 'From delayed callbacks to near-instant first contact.',
        'proof.card2Label': 'Booked appointments',
        'proof.card2Body': 'More qualified leads make it onto the calendar.',
        'proof.card3Label': 'Close rate',
        'proof.card3Body': 'Stronger handling creates more revenue from the same demand.',
        'proof.card4Label': 'ROI',
        'proof.card4Body': 'Higher return than slow manual follow-up systems.',
        'proof.clientsKicker': 'Selected Client Outcomes',
        'proof.clientsTitle': 'Brands featured in your proof deck.',
        'proof.clientLabelOutcome': 'Outcome',
        'proof.clientLabelVolume': 'Volume',
        'proof.clientLabelCategory': 'Category',
        'proof.client1Outcome': 'Booked appointments',
        'proof.client1Category': 'Hospital growth',
        'proof.client2Outcome': 'Homes sold',
        'proof.client2Category': 'Real estate growth',
        'proof.client3Outcome': 'Deals closed',
        'proof.client3Category': 'Commercial growth',
        'feature3.kicker': 'Feature Three',
        'feature3.title': 'Connect every major messaging channel through GHL.',
        'feature3.subtitle': 'SMS, WhatsApp, Instagram, and Messenger stay connected in one system with direct GoHighLevel integration.',
        'feature3.chip1': 'Pipeline updates',
        'feature3.chip2': 'Calendar booking',
        'feature3.chip3': 'SMS + missed call text-back',
        'feature3.chip4': 'Lead assignment',
        'feature3.chip5': 'Conversation tracking',
        'feature3.note1Label': 'Direct GHL integration',
        'feature3.note1Value': 'Native setup in minutes, not hours.',
        'feature3.note2Label': 'Messaging layer',
        'feature3.note2Value': 'Every reply stays tied to CRM and booking flow.',
        'feature3.note3Label': 'Expansion-ready',
        'feature3.note3Value': 'Built to scale as channels and workflows expand.',
        'feature3.uiBarLabel': 'CRM + Messaging Layer',
        'feature3.uiBarValue': 'Connected',
        'feature3.channel1': 'SMS',
        'feature3.channel2': 'WhatsApp',
        'feature3.channel3': 'Instagram',
        'feature3.channel4': 'Messenger',
        'feature3.card1Label': 'Pipeline',
        'feature3.card1Body': 'New lead -> AI contacted -> booked',
        'feature3.card2Label': 'Inbox',
        'feature3.card2Body': 'SMS, WhatsApp, Instagram, Messenger',
        'feature3.card3Label': 'Calendar',
        'feature3.card3Body': 'Appointments booked directly into the workflow.',
        'feature3.card4Label': 'Tracking',
        'feature3.card4Body': 'Every conversation stays visible in one system.',
        'implementation.kicker': 'Why It Wins',
        'implementation.title': 'Build a pipeline that moves without extra drag.',
        'implementation.subtitle': 'Lower overhead, faster response, stronger support, and a system that keeps more lead volume moving without extra manual work.',
        'implementation.card1Title': 'Lower overhead',
        'implementation.card1Body': 'Replace expensive manual setter overhead with an always-on AI booking layer.',
        'implementation.card2Title': 'Stop missed demand',
        'implementation.card2Body': 'Wake up to a fuller calendar instead of an inbox full of cold leads.',
        'implementation.card3Title': 'Shared context',
        'implementation.card3Body': 'Every workflow keeps context across lead source, booking, and follow-up.',
        'implementation.card4Title': 'Fast support',
        'implementation.card4Body': 'White-glove setup and direct help whenever the system needs tuning.',
        'faq.kicker': 'FAQ',
        'faq.title': 'Questions businesses ask before rollout.',
        'faq.subtitle': 'Short answers around lead flow, AI follow-up, CRM connection, and launch.',
        'faq.q1': 'What does the AI Client Acquisition System actually do?',
        'faq.a1': 'It generates qualified leads, contacts them instantly using AI, and helps move more of those leads toward booked appointments and paying clients.',
        'faq.q2': 'Is this a software trial or subscription product?',
        'faq.a2': 'No. This is a service-led client acquisition system built around your business, your lead flow, and your sales process.',
        'faq.q3': 'How fast does the follow-up happen?',
        'faq.a3': 'The system is designed to respond within seconds through voice AI, SMS, and connected messaging channels.',
        'faq.q4': 'Can it work with GoHighLevel?',
        'faq.a4': 'Yes. We can plug into GoHighLevel for pipeline updates, conversations, booking, lead assignment, and follow-up workflows.',
        'faq.q5': 'What happens on the strategy call?',
        'faq.a5': 'We review where leads come in, how they are currently handled, where revenue is leaking, and what the cleanest version of the system should look like for your business.',
        'contact.kicker': 'Get Started',
        'contact.title': 'Book a Free Strategy Call',
        'contact.subtitle': 'We will show you where leads are being lost, how the system would fit your business, and what it takes to launch correctly.',
        'contact.call': 'Call +1 (612) 398-5577',
        'final.kicker': 'Ready to move faster?',
        'final.title': 'More leads. Instant follow-up. More closed deals.',
        'final.subtitle': 'Built for premium service businesses that want a tighter acquisition system, cleaner booking flow, and more revenue from the leads they already pay for.',
        'final.secondaryCta': 'Review the 3 Steps',
        'footer.blurb': 'Premium AI client acquisition infrastructure for high-ticket service businesses that need faster response, more booked appointments, and more closed revenue.',
        'footer.navLabel': 'Navigation',
        'footer.contactLabel': 'Contact',
        'footer.system': '3-Step System',
        'footer.implementation': 'Implementation',
        'whatsapp.aria': 'Chat with us on WhatsApp',
        'whatsapp.eyebrow': 'WhatsApp',
        'whatsapp.title': 'Chat with our team',
        'whatsapp.message': 'Hi, I found your website and would like to learn more about your AI client acquisition system. \uD83E\uDD16',
        'mobile.quickActions': 'Quick actions',
        'mobile.bookCall': 'Book a Free Call',
        'mobile.callNow': 'Call Now',
        'cta.strategy': 'Book a Free Strategy Call'
      }
    },
    es: {
      metaTitle: '#1 Sistema de Adquisición de Clientes con IA para dueños de negocios en EE. UU.',
      metaDescription: 'Consiga más clientes y responda al instante.',
      metaSocialDescription: 'Consiga más clientes y responda al instante.',
      metaTwitterDescription: 'Consiga más clientes y responda al instante.',
      heroTerms: ['Dueños de negocios', 'Negocios de HVAC', 'Consultorios médicos', 'Empresas de techos', 'Clínicas dentales', 'Med spas', 'Equipos inmobiliarios'],
      toggles: { themeNight: 'Noche', themeDay: 'Día', toDay: 'Cambiar al modo de día', toNight: 'Cambiar al modo de noche', language: 'ES', switchLanguage: 'Cambiar idioma a inglés' },
      calcScenario: ({ leads, response, deal }) => `Basado en ${leads} leads, ${response} de respuesta humana y un valor promedio por venta de ${deal}.`,
      calcReady: ({ revenue }) => `¿Listo para recuperar ${revenue}/año?`,
      calcHours: (hours) => hours === 1 ? '1 hora' : `${hours} horas`,
      calcAiResponse: '12 segundos',
      text: {
        'nav.toggle': 'Abrir o cerrar el menú de navegación',
        'nav.system': 'Sistema',
        'nav.proof': 'Prueba',
        'nav.calculator': 'Calculadora',
        'nav.integrations': 'Integraciones',
        'nav.faq': 'FAQ',
        'nav.contact': 'Contacto',
        'hero.titleTop': '#1 Sistema de Adquisición de Clientes con IA',
        'hero.titleFor': 'para',
        'hero.lead': 'Consiga más clientes y responda al instante.',
        'hero.proof': 'Más de 200 empresas ya nos llevan ventaja con esto.',
        'shared.human': 'Humano',
        'shared.ai': 'IA',
        'shared.lead': 'Lead',
        'trust.kicker': 'Stack Confiable',
        'trust.title': 'La IA, los anuncios, la mensajería y las herramientas de CRM que mueven todo el sistema.',
        'trust.metric1': 'leads que normalmente se pierden por seguimiento lento',
        'trust.metric2': 'velocidad hasta la primera respuesta con IA',
        'trust.metric3': 'ROI con el sistema activo',
        'trust.label': 'Confiado por equipos de primer nivel',
        'trust.bar1Label': 'Velocidad al lead',
        'trust.bar1Value': 'Segundos, no horas',
        'trust.bar2Label': 'Modelo del sistema',
        'trust.bar2Value': 'Generación de leads -> respuesta con IA -> cita',
        'trust.bar3Label': 'Mejor para',
        'trust.bar3Value': 'Servicios high-ticket donde cada lead importa',
        'calc.kicker': 'Rendimiento',
        'calc.title': 'Supera el seguimiento lento.',
        'calc.subtitle': 'Arranque con 150 leads al mes y vea cómo una respuesta instantánea con IA cambia las citas agendadas y los ingresos usando la misma demanda.',
        'calc.intro': 'Vea la diferencia:',
        'calc.card1Label': '01. Capture al instante',
        'calc.card1Title': 'Responda en segundos mientras el lead todavía está listo para agendar.',
        'calc.card1HumanLabel': 'Respuesta humana',
        'calc.card1HumanValue': 'Horas después',
        'calc.card1AiLabel': 'Respuesta IA',
        'calc.card1AiValue': 'En segundos',
        'calc.card2Label': '02. Suba conversiones',
        'calc.card2Title': 'Convierta más de la misma demanda calificada en citas agendadas.',
        'calc.card2HumanLabel': 'Seguimiento humano',
        'calc.card2AiLabel': 'Seguimiento IA',
        'calc.card3Label': '03. Maximice capacidad',
        'calc.card3Title': 'Escale el seguimiento de cada lead sin cuellos de botella humanos.',
        'calc.card3HumanLabel': 'Capacidad humana',
        'calc.card3AiLabel': 'Capacidad IA',
        'calc.inputLeads': 'Leads mensuales',
        'calc.inputResponse': 'Tiempo de respuesta humana (horas)',
        'calc.inputDeal': 'Valor promedio por venta',
        'calc.result1Label': 'Ingresos recuperados / año',
        'calc.result1Body': 'de los leads que ya le entran',
        'calc.result2Label': 'Citas extra / mes',
        'calc.result2Body': 'más conversaciones ya agendadas',
        'calc.result3Label': 'Ingresos adicionales / mes',
        'calc.result3Body': 'potencial real de ventas extra',
        'calc.compareHumanLabel': 'Seguimiento humano',
        'calc.compareHumanTitle': 'Respuesta manual',
        'calc.compareAiLabel': 'Sistema de Adquisición de Clientes con IA',
        'calc.compareAiTitle': 'Captura instantánea con IA',
        'calc.compareResponse': 'Tiempo de respuesta',
        'calc.compareConversion': 'Tasa de conversión',
        'calc.ctaBody': 'Le enseñamos el despliegue, la lógica de respuesta y el seguimiento que podrían producir estos números en su negocio.',
        'feature1.kicker': 'Característica Uno',
        'feature1.title': 'Califique nuevos leads en segundos.',
        'feature1.subtitle': 'Entra demanda calificada, la IA responde al instante y más de esos leads terminan en conversaciones agendadas.',
        'feature1.summary1Label': 'Paso 1',
        'feature1.summary1Value': 'Le traemos leads calificados.',
        'feature1.summary2Label': 'Paso 2',
        'feature1.summary2Value': 'La IA responde en segundos.',
        'feature1.summary3Label': 'Paso 3',
        'feature1.summary3Value': 'Más leads se convierten en clientes.',
        'feature1.step1Eyebrow': 'Conseguir leads',
        'feature1.step1Title': 'Le traemos leads calificados',
        'feature1.step1Body': 'Campañas dirigidas atraen personas que ya andan buscando su servicio, no tráfico aleatorio.',
        'feature1.step1UiLabel': 'Captura de leads',
        'feature1.step1UiValue': 'Pipeline en vivo',
        'feature1.step1Flow1': 'Google Ads',
        'feature1.step1Flow2': 'Formulario enviado',
        'feature1.step1VisualTitle': '12 leads nuevos',
        'feature1.step1VisualBody': 'Calificados y listos para contactar',
        'feature1.step1Result': 'Resultado: oportunidades entrantes de forma constante.',
        'feature1.step2Eyebrow': 'Responder rápido',
        'feature1.step2Title': 'Contactamos cada lead al instante con IA',
        'feature1.step2Body': 'La IA de voz, SMS y chat se activan en segundos mientras el lead todavía está caliente.',
        'feature1.step2UiLabel': 'Seguimiento con IA',
        'feature1.step2UiValue': 'Multicanal',
        'feature1.step2Tag1': 'IA de voz',
        'feature1.step2Tag2': 'SMS',
        'feature1.step2Tag3': 'Chat',
        'feature1.step2Transcript1': 'Hola Sarah, vimos que entró su solicitud.',
        'feature1.step2Transcript2': 'Queremos dejarle agendada de una vez.',
        'feature1.step2Result': 'Resultado: usted llega al lead antes que la competencia.',
        'feature1.step3Eyebrow': 'Cerrar más',
        'feature1.step3Title': 'Le ayudamos a convertir más leads en clientes que pagan',
        'feature1.step3Body': 'Mejor seguimiento, mejor calificación y un agendado más rápido ayudan a que más leads se vuelvan clientes.',
        'feature1.step3UiLabel': 'Vista de ingresos',
        'feature1.step3UiValue': 'Agendado + Cerrado',
        'feature1.step3Metric1': 'llamadas agendadas',
        'feature1.step3Metric2': 'ventas cerradas',
        'feature1.step3VisualTitle': 'Tendencia de conversión al alza',
        'feature1.step3VisualBody': 'Más ingresos desde el mismo flujo de leads',
        'feature1.step3Booked': 'Agendado',
        'feature1.step3Result': 'Resultado: más ingresos con el mismo gasto.',
        'feature2.kicker': 'Característica Dos',
        'feature2.title': 'Convierta interés en llamadas agendadas en una sola conversación.',
        'feature2.subtitle': 'Sin mandarlo a un link frío. La IA lleva al lead desde el interés hasta la cita en una conversación natural.',
        'feature2.windowbar': 'Flujo de adquisición en vivo',
        'feature2.point1Label': 'Agenda natural',
        'feature2.point1Value': 'La IA guía la cita como lo haría un setter real.',
        'feature2.point2Label': 'Disponibilidad en vivo',
        'feature2.point2Value': 'La lógica del calendario se mantiene sincronizada y confirma al instante.',
        'feature2.point3Label': 'Traspaso sin fricción',
        'feature2.point3Value': 'De interesado a agendado en una sola conversación.',
        'feature2.status1Label': 'Fuente del lead',
        'feature2.status1Value': 'Google Ads - Consulta de implante',
        'feature2.status1Body': 'Lead de alta intención capturado y enviado al instante.',
        'feature2.status2Label': 'Estado de respuesta',
        'feature2.status2Value': 'La IA de voz arrancó en 19 segundos',
        'feature2.status2Body': 'El flujo de SMS y chat se activó automáticamente.',
        'feature2.transcript1': 'Acabo de llenar el formulario sobre precios del tratamiento.',
        'feature2.transcript2': 'Gracias por escribirnos. Le puedo agendar de una vez y explicarle los siguientes pasos.',
        'feature2.transcript3': 'Mañana en la tarde me sirve.',
        'feature2.panel1Label': 'Pipeline',
        'feature2.panel1Value': 'Nuevo lead -> Calificado -> Agendado',
        'feature2.panel2Label': 'Calendario',
        'feature2.panel2Value': '3 consultas nuevas agendadas hoy',
        'feature2.panel3Label': 'Resultado',
        'feature2.panel3Value': 'Más valor recuperado del mismo gasto en anuncios',
        'proof.kicker': 'Prueba',
        'proof.title': 'Lo que mejora cuando el tiempo de respuesta deja de ser el cuello de botella.',
        'proof.subtitle': 'Contacto más rápido, más llamadas agendadas, mejor probabilidad de cierre y más ingresos recuperados del mismo flujo de leads.',
        'proof.card1Label': 'Tiempo de respuesta',
        'proof.card1Body': 'De devolver llamadas tarde a un primer contacto casi instantáneo.',
        'proof.card2Label': 'Citas agendadas',
        'proof.card2Body': 'Más leads calificados terminan en el calendario.',
        'proof.card3Label': 'Tasa de cierre',
        'proof.card3Body': 'Un mejor manejo genera más ingresos desde la misma demanda.',
        'proof.card4Label': 'ROI',
        'proof.card4Body': 'Mayor retorno que los sistemas manuales de seguimiento lento.',
        'proof.clientsKicker': 'Resultados de clientes seleccionados',
        'proof.clientsTitle': 'Marcas destacadas en su deck de prueba.',
        'proof.clientLabelOutcome': 'Resultado',
        'proof.clientLabelVolume': 'Volumen',
        'proof.clientLabelCategory': 'Categoría',
        'proof.client1Outcome': 'Citas agendadas',
        'proof.client1Category': 'Crecimiento hospitalario',
        'proof.client2Outcome': 'Casas vendidas',
        'proof.client2Category': 'Crecimiento inmobiliario',
        'proof.client3Outcome': 'Negocios cerrados',
        'proof.client3Category': 'Crecimiento comercial',
        'feature3.kicker': 'Característica Tres',
        'feature3.title': 'Conecte cada canal grande de mensajería por medio de GHL.',
        'feature3.subtitle': 'SMS, WhatsApp, Instagram y Messenger quedan conectados en un solo sistema con integración directa a GoHighLevel.',
        'feature3.chip1': 'Actualizaciones del pipeline',
        'feature3.chip2': 'Reserva en calendario',
        'feature3.chip3': 'SMS + texto por llamada perdida',
        'feature3.chip4': 'Asignación de leads',
        'feature3.chip5': 'Seguimiento de conversaciones',
        'feature3.note1Label': 'Integración directa con GHL',
        'feature3.note1Value': 'Configuración nativa en minutos, no en horas.',
        'feature3.note2Label': 'Capa de mensajería',
        'feature3.note2Value': 'Cada respuesta queda ligada al CRM y al flujo de agenda.',
        'feature3.note3Label': 'Lista para expandir',
        'feature3.note3Value': 'Hecho para escalar conforme crecen los canales y flujos.',
        'feature3.uiBarLabel': 'CRM + Capa de mensajería',
        'feature3.uiBarValue': 'Conectado',
        'feature3.channel1': 'SMS',
        'feature3.channel2': 'WhatsApp',
        'feature3.channel3': 'Instagram',
        'feature3.channel4': 'Messenger',
        'feature3.card1Label': 'Pipeline',
        'feature3.card1Body': 'Nuevo lead -> IA contacta -> agendado',
        'feature3.card2Label': 'Inbox',
        'feature3.card2Body': 'SMS, WhatsApp, Instagram, Messenger',
        'feature3.card3Label': 'Calendario',
        'feature3.card3Body': 'Citas agendadas directamente dentro del flujo.',
        'feature3.card4Label': 'Tracking',
        'feature3.card4Body': 'Cada conversación queda visible en un solo sistema.',
        'implementation.kicker': 'Por qué gana',
        'implementation.title': 'Construya un pipeline que se mueva sin arrastre extra.',
        'implementation.subtitle': 'Menor costo operativo, respuesta más rápida, mejor soporte y un sistema que mueve más volumen de leads sin meterle trabajo manual extra.',
        'implementation.card1Title': 'Menor costo',
        'implementation.card1Body': 'Reemplace el costo alto de setters manuales con una capa de agenda con IA que trabaja siempre.',
        'implementation.card2Title': 'Pare la demanda perdida',
        'implementation.card2Body': 'Despiértese con un calendario más lleno en vez de un inbox con leads fríos.',
        'implementation.card3Title': 'Contexto compartido',
        'implementation.card3Body': 'Cada flujo conserva el contexto entre fuente del lead, agenda y seguimiento.',
        'implementation.card4Title': 'Soporte rápido',
        'implementation.card4Body': 'Configuración white-glove y ayuda directa cada vez que haya que afinar el sistema.',
        'faq.kicker': 'FAQ',
        'faq.title': 'Preguntas que los negocios hacen antes de lanzar.',
        'faq.subtitle': 'Respuestas claras sobre flujo de leads, seguimiento con IA, CRM y puesta en marcha.',
        'faq.q1': '¿Qué hace realmente el Sistema de Adquisición de Clientes con IA?',
        'faq.a1': 'Genera leads calificados, los contacta al instante con IA y ayuda a mover más de esos leads hacia citas agendadas y clientes que sí compran.',
        'faq.q2': '¿Esto es una prueba de software o un producto por suscripción?',
        'faq.a2': 'No. Esto es un sistema de adquisición de clientes hecho alrededor de su negocio, su flujo de leads y su proceso comercial.',
        'faq.q3': '¿Qué tan rápido ocurre el seguimiento?',
        'faq.a3': 'El sistema está diseñado para responder en segundos por medio de IA de voz, SMS y canales de mensajería conectados.',
        'faq.q4': '¿Puede funcionar con GoHighLevel?',
        'faq.a4': 'Sí. Podemos conectarlo con GoHighLevel para actualizar pipeline, conversaciones, citas, asignación de leads y flujos de seguimiento.',
        'faq.q5': '¿Qué pasa en la llamada estratégica?',
        'faq.a5': 'Revisamos de dónde le entran los leads, cómo los están manejando hoy, dónde se está fugando plata y cómo debería verse la versión más limpia del sistema para su negocio.',
        'contact.kicker': 'Empecemos',
        'contact.title': 'Agenda una llamada gratis',
        'contact.subtitle': 'Le mostramos dónde se le están perdiendo leads, cómo encajaría el sistema en su negocio y qué se necesita para lanzarlo bien.',
        'contact.call': 'Llamar al +1 (612) 398-5577',
        'final.kicker': '¿Listo para moverse más rápido?',
        'final.title': 'Más leads. Respuesta al instante. Más cierres.',
        'final.subtitle': 'Hecho para negocios de servicios premium que quieren un sistema de adquisición más fino, un flujo de agenda más limpio y más ingresos desde los leads por los que ya pagan.',
        'final.secondaryCta': 'Revisar los 3 pasos',
        'footer.blurb': 'Infraestructura premium de adquisición de clientes con IA para negocios de servicios high-ticket que necesitan responder más rápido, agendar más citas y cerrar más ingresos.',
        'footer.navLabel': 'Navegación',
        'footer.contactLabel': 'Contacto',
        'footer.system': 'Sistema de 3 pasos',
        'footer.implementation': 'Implementación',
        'whatsapp.aria': 'Escríbanos por WhatsApp',
        'whatsapp.eyebrow': 'WhatsApp',
        'whatsapp.title': 'Escríbanos por WhatsApp',
        'whatsapp.message': 'Hola, encontré su sitio web y me gustaría saber más sobre su sistema de adquisición de clientes con IA. \uD83E\uDD16',
        'mobile.quickActions': 'Acciones rápidas',
        'mobile.bookCall': 'Agenda llamada gratis',
        'mobile.callNow': 'Llamar ahora',
        'cta.strategy': 'Agenda una llamada gratis'
      }
    }
  };

  const locale = () => (currentLanguage === 'es' ? 'es-CR' : 'en-US');
  const pack = () => copy[currentLanguage];
  const lookup = (key) => pack().text[key];

  const syncNavSurface = () => {
    if (!navHeader) return;
    const scrolled = window.scrollY > 80;
    const isDay = currentTheme === 'day';
    navHeader.style.background = isDay
      ? (scrolled ? 'rgba(245, 250, 255, 0.97)' : 'rgba(245, 250, 255, 0.88)')
      : (scrolled ? 'rgba(6, 13, 31, 0.95)' : 'rgba(6, 13, 31, 0.75)');
    navHeader.style.borderBottomColor = isDay
      ? (scrolled ? 'rgba(18, 40, 74, 0.12)' : 'rgba(18, 40, 74, 0.08)')
      : (scrolled ? 'rgba(255, 255, 255, 0.08)' : 'rgba(255, 255, 255, 0.06)');
  };

  const applyTheme = (theme) => {
    currentTheme = theme === 'day' ? 'day' : 'night';
    root.dataset.theme = currentTheme === 'day' ? 'light' : 'dark';
    storage.set(keys.theme, currentTheme);
    if (themeToggle) {
      themeToggle.dataset.themeMode = currentTheme;
      themeToggle.setAttribute('aria-label', currentTheme === 'night' ? pack().toggles.toDay : pack().toggles.toNight);
      themeToggle.classList.add('is-active');
    }
    syncNavSurface();
  };

  const applyLanguage = (language) => {
    currentLanguage = language === 'es' ? 'es' : 'en';
    storage.set(keys.language, currentLanguage);
    root.lang = currentLanguage === 'es' ? 'es-CR' : 'en';
    document.title = pack().metaTitle;
    if (metaDescription) metaDescription.setAttribute('content', pack().metaDescription);
    if (metaOgTitle) metaOgTitle.setAttribute('content', pack().metaTitle);
    if (metaOgDescription) metaOgDescription.setAttribute('content', pack().metaSocialDescription);
    if (metaTwitterTitle) metaTwitterTitle.setAttribute('content', pack().metaTitle);
    if (metaTwitterDescription) metaTwitterDescription.setAttribute('content', pack().metaTwitterDescription);

    document.querySelectorAll('[data-i18n]').forEach((node) => {
      const value = lookup(node.dataset.i18n);
      if (typeof value === 'string') node.textContent = value;
    });

    document.querySelectorAll('[data-i18n-aria]').forEach((node) => {
      const value = lookup(node.dataset.i18nAria);
      if (typeof value === 'string') node.setAttribute('aria-label', value);
    });

    document.querySelectorAll('[data-i18n-attr]').forEach((node) => {
      const value = lookup(node.dataset.i18n);
      if (typeof value === 'string') node.setAttribute(node.dataset.i18nAttr, value);
    });

    document.querySelectorAll('[data-i18n-label]').forEach((node) => {
      const value = lookup(node.dataset.i18nLabel);
      if (typeof value === 'string') node.dataset.label = value;
    });

    if (languageToggle) {
      languageToggle.dataset.language = currentLanguage;
      languageToggle.setAttribute('aria-label', pack().toggles.switchLanguage);
      languageToggle.classList.add('is-active');
    }

    const heroPrimary = document.getElementById('heroRotatingTextPrimary');
    const heroSecondary = document.getElementById('heroRotatingTextSecondary');
    if (heroPrimary) heroPrimary.textContent = pack().heroTerms[0];
    if (heroSecondary) heroSecondary.textContent = '';

    renderCalculator();
    applyTheme(currentTheme);
  };

  const renderCalculator = () => {
    const leadsInput = document.getElementById('calcLeads');
    const responseInput = document.getElementById('calcResponseHours');
    const dealInput = document.getElementById('calcDealValue');
    const revenueNode = document.getElementById('calcRecoveredRevenue');
    const appointmentsNode = document.getElementById('calcExtraAppointments');
    const addRevenueNode = document.getElementById('calcAdditionalRevenue');
    const humanResponseNode = document.getElementById('calcHumanResponse');
    const humanConvNode = document.getElementById('calcHumanConv');
    const aiResponseNode = document.getElementById('calcAiResponse');
    const aiConvNode = document.getElementById('calcAiConv');
    const readyNode = document.getElementById('calcReadySave');
    const scenarioNode = document.getElementById('calcScenarioLine');

    if (!leadsInput || !responseInput || !dealInput || !revenueNode || !appointmentsNode || !addRevenueNode || !humanResponseNode || !humanConvNode || !aiResponseNode || !aiConvNode || !readyNode) return;

    const leads = Math.max(0, Number.parseFloat(leadsInput.value) || 0);
    const responseHours = Math.max(0, Number.parseFloat(responseInput.value) || 0);
    const dealValue = Math.max(0, Number.parseFloat(dealInput.value) || 0);
    const humanConversion = responseHours <= 1 ? 0.20 : responseHours >= 24 ? 0.10 : Math.max(0.10, 0.20 - ((responseHours - 1) * ((0.20 - 0.10) / 23)));
    const aiConversion = 0.40;
    const extraAppointments = Math.max(0, Math.round(leads * (aiConversion - humanConversion)));
    const additionalRevenue = Math.max(0, Math.round(extraAppointments * dealValue * 0.25));
    const recoveredRevenue = additionalRevenue * 12;
    const integer = new Intl.NumberFormat(locale());
    const currency = new Intl.NumberFormat(locale(), { style: 'currency', currency: 'USD', maximumFractionDigits: 0 });
    const responseText = pack().calcHours(integer.format(responseHours));

    revenueNode.textContent = currency.format(recoveredRevenue);
    appointmentsNode.textContent = `+${integer.format(extraAppointments)}`;
    addRevenueNode.textContent = currency.format(additionalRevenue);
    humanResponseNode.textContent = responseText;
    humanConvNode.textContent = `${Math.round(humanConversion * 100)}%`;
    aiResponseNode.textContent = pack().calcAiResponse;
    aiConvNode.textContent = `${Math.round(aiConversion * 100)}%`;
    readyNode.textContent = pack().calcReady({ revenue: currency.format(recoveredRevenue) });
    if (scenarioNode) scenarioNode.textContent = pack().calcScenario({ leads: integer.format(leads), response: responseText, deal: currency.format(dealValue) });
  };

  window.__dcGetHeadlineTerms = () => pack().heroTerms;
  window.addEventListener('scroll', syncNavSurface, { passive: true });

  ['calcLeads', 'calcResponseHours', 'calcDealValue'].forEach((id) => {
    const node = document.getElementById(id);
    if (!node) return;
    node.addEventListener('input', renderCalculator);
    node.addEventListener('change', renderCalculator);
  });

  if (themeToggle) themeToggle.addEventListener('click', () => applyTheme(currentTheme === 'night' ? 'day' : 'night'));
  if (languageToggle) languageToggle.addEventListener('click', () => applyLanguage(currentLanguage === 'en' ? 'es' : 'en'));

  applyLanguage(currentLanguage);
})();
