const menuToggle = document.getElementById("menu-toggle");
const nav = document.getElementById("nav");

if (menuToggle && nav) {
    menuToggle.addEventListener("click", () => {
        const isOpen = nav.classList.toggle("open");
        menuToggle.setAttribute("aria-expanded", String(isOpen));
    });

    nav.querySelectorAll("a").forEach((link) => {
        link.addEventListener("click", () => {
            nav.classList.remove("open");
            menuToggle.setAttribute("aria-expanded", "false");
        });
    });
}

const revealItems = document.querySelectorAll(".reveal");
const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry) => {
        if (entry.isIntersecting) {
            entry.target.classList.add("in-view");
            revealObserver.unobserve(entry.target);
        }
    });
}, {
    threshold: 0.14
});

revealItems.forEach((item, index) => {
    item.style.transitionDelay = `${Math.min(index * 60, 320)}ms`;
    revealObserver.observe(item);
});

const yearElement = document.getElementById("year");
if (yearElement) {
    yearElement.textContent = new Date().getFullYear();
}

const parallaxItems = document.querySelectorAll("[data-parallax]");
const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

if (!prefersReducedMotion && parallaxItems.length > 0) {
    window.addEventListener("mousemove", (event) => {
        const xOffset = (event.clientX / window.innerWidth - 0.5) * 2;
        const yOffset = (event.clientY / window.innerHeight - 0.5) * 2;

        parallaxItems.forEach((item) => {
            const strength = Number(item.getAttribute("data-parallax")) || 8;
            const x = xOffset * strength;
            const y = yOffset * strength;
            item.style.transform = `translate(${x}px, ${y}px)`;
        });
    });
}

const spotlightTargets = document.querySelectorAll(".hero-content-block, .hero-panel");
spotlightTargets.forEach((target) => {
    target.addEventListener("mousemove", (event) => {
        const rect = target.getBoundingClientRect();
        const x = ((event.clientX - rect.left) / rect.width) * 100;
        const y = ((event.clientY - rect.top) / rect.height) * 100;
        target.style.setProperty("--spot-x", `${x}%`);
        target.style.setProperty("--spot-y", `${y}%`);

        const cursorOrb = target.querySelector(".cursor-orb");
        if (cursorOrb) {
            cursorOrb.style.setProperty("--orb-x", `${x}%`);
            cursorOrb.style.setProperty("--orb-y", `${y}%`);
        }
    });

    target.addEventListener("mouseleave", () => {
        target.style.setProperty("--spot-x", "50%");
        target.style.setProperty("--spot-y", "50%");
    });
});

if (!prefersReducedMotion) {
    const magneticTargets = document.querySelectorAll(".btn, .trust-track span");

    magneticTargets.forEach((target) => {
        target.addEventListener("mousemove", (event) => {
            const rect = target.getBoundingClientRect();
            const offsetX = (event.clientX - rect.left) / rect.width - 0.5;
            const offsetY = (event.clientY - rect.top) / rect.height - 0.5;
            target.style.setProperty("--tx", `${offsetX * 8}px`);
            target.style.setProperty("--ty", `${offsetY * 8}px`);
        });

        target.addEventListener("mouseleave", () => {
            target.style.setProperty("--tx", "0px");
            target.style.setProperty("--ty", "0px");
        });
    });
}

const BOT_CONFIG = {
    bookingWebhookUrl: "",
    chatWebhookUrl: "",
    appointmentDurationMinutes: 30
};

const chatbotToggle = document.getElementById("chatbot-toggle");
const chatbotPanel = document.getElementById("chatbot-panel");
const chatbotForm = document.getElementById("chatbot-form");
const chatbotInput = document.getElementById("chatbot-input");
const chatbotMessages = document.getElementById("chatbot-messages");

const botState = {
    bookingStep: null,
    bookingData: {}
};

const faqReplies = [
    { keys: ["service", "services"], text: "We build revenue infrastructure: Google/Meta ads, advanced tracking, AI call secretary, and conversion architecture." },
    { keys: ["price", "pricing", "cost"], text: "We scope based on infrastructure complexity and revenue goals. The core KPI is cost per booked appointment." },
    { keys: ["hour", "hours", "available"], text: "Typical support hours are Monday-Friday, 9:00 AM-6:00 PM Central Time (US)." },
    { keys: ["phone", "call"], text: "You can call us directly at +1 (612) 398-5577." },
    { keys: ["whatsapp"], text: "Yes, we support WhatsApp business chat at +1 (612) 398-5577." },
    { keys: ["extra", "add-on", "addons", "video", "content"], text: "Add-ons include content strategy, video ads, UGC direction, landing page CRO, and lifecycle follow-ups." }
];

function addChatMessage(text, role = "bot") {
    if (!chatbotMessages) return;
    const messageElement = document.createElement("p");
    messageElement.className = `chatbot-msg ${role}`;
    messageElement.textContent = text;
    chatbotMessages.appendChild(messageElement);
    chatbotMessages.scrollTop = chatbotMessages.scrollHeight;
}

function formatGcalDate(dateObject) {
    return dateObject.toISOString().replace(/[-:]/g, "").replace(/\.\d{3}Z$/, "Z");
}

function buildGoogleCalendarDraft({ name, date, time }) {
    const start = new Date(`${date}T${time}`);
    const end = new Date(start.getTime() + BOT_CONFIG.appointmentDurationMinutes * 60000);
    const title = encodeURIComponent(`Discovery Call - ${name}`);
    const details = encodeURIComponent("Strategy call booked via website chatbot.");
    const dates = `${formatGcalDate(start)}/${formatGcalDate(end)}`;
    return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${title}&dates=${dates}&details=${details}`;
}

async function createCalendarAppointment(payload) {
    if (!BOT_CONFIG.bookingWebhookUrl) {
        return {
            ok: false,
            fallbackLink: buildGoogleCalendarDraft(payload),
            message: "Automatic booking is not connected yet. Use this calendar draft link to confirm the appointment."
        };
    }

    const response = await fetch(BOT_CONFIG.bookingWebhookUrl, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            action: "book_appointment",
            ...payload,
            timezone: Intl.DateTimeFormat().resolvedOptions().timeZone
        })
    });

    if (!response.ok) {
        throw new Error("Booking webhook request failed");
    }

    return response.json();
}

function beginBookingFlow() {
    botState.bookingStep = "name";
    botState.bookingData = {};
    addChatMessage("Great. I can book that for you. What is your full name?");
}

function handleBookingStep(userText) {
    if (botState.bookingStep === "name") {
        botState.bookingData.name = userText.trim();
        botState.bookingStep = "email";
        addChatMessage("Thanks. What email should receive the calendar invite?");
        return;
    }

    if (botState.bookingStep === "email") {
        const email = userText.trim();
        if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            addChatMessage("Please enter a valid email address.");
            return;
        }
        botState.bookingData.email = email;
        botState.bookingStep = "date";
        addChatMessage("Perfect. What date works best? Use YYYY-MM-DD format.");
        return;
    }

    if (botState.bookingStep === "date") {
        const date = userText.trim();
        if (!/^\d{4}-\d{2}-\d{2}$/.test(date)) {
            addChatMessage("Please use YYYY-MM-DD format (example: 2026-03-25).");
            return;
        }
        botState.bookingData.date = date;
        botState.bookingStep = "time";
        addChatMessage("Got it. What start time? Use 24-hour format HH:MM (example: 14:30).");
        return;
    }

    if (botState.bookingStep === "time") {
        const time = userText.trim();
        if (!/^\d{2}:\d{2}$/.test(time)) {
            addChatMessage("Please use HH:MM format (example: 09:30).");
            return;
        }
        botState.bookingData.time = time;
        botState.bookingStep = null;

        addChatMessage("One second, I am creating your appointment...");
        createCalendarAppointment(botState.bookingData)
            .then((result) => {
                if (result.ok) {
                    const confirmation = result.eventLink
                        ? `Booked. Your event is created. Link: ${result.eventLink}`
                        : "Booked. Your Google Calendar appointment is created.";
                    addChatMessage(confirmation);
                } else {
                    addChatMessage(result.message || "Booking webhook not connected.");
                    if (result.fallbackLink) {
                        addChatMessage(`Calendar draft: ${result.fallbackLink}`);
                    }
                }
            })
            .catch(() => {
                addChatMessage("I could not reach the calendar booking endpoint. Please try again or call +1 (612) 398-5577.");
            });
    }
}

async function handleChatMessage(userText) {
    const normalized = userText.toLowerCase();

    if (botState.bookingStep) {
        handleBookingStep(userText);
        return;
    }

    if (normalized.includes("book") || normalized.includes("appointment") || normalized.includes("schedule")) {
        beginBookingFlow();
        return;
    }

    const faqMatch = faqReplies.find((item) => item.keys.some((key) => normalized.includes(key)));
    if (faqMatch) {
        addChatMessage(faqMatch.text);
        return;
    }

    if (BOT_CONFIG.chatWebhookUrl) {
        try {
            const response = await fetch(BOT_CONFIG.chatWebhookUrl, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ message: userText })
            });
            const result = await response.json();
            addChatMessage(result.reply || "I can help with services, pricing, and booking appointments.");
            return;
        } catch (error) {
            addChatMessage("Chat AI endpoint is not reachable right now. You can still ask about services or book an appointment.");
            return;
        }
    }

    addChatMessage("I can help with offers, pricing, and booking. Try: 'Book appointment'.");
}

if (chatbotToggle && chatbotPanel && chatbotForm && chatbotInput) {
    chatbotToggle.addEventListener("click", () => {
        const isOpen = chatbotPanel.hasAttribute("hidden");
        chatbotPanel.toggleAttribute("hidden");
        chatbotToggle.setAttribute("aria-expanded", String(isOpen));
        if (isOpen && chatbotMessages && chatbotMessages.children.length === 0) {
            addChatMessage("Hi, I am your DigitalConsulting assistant. Ask a question or type 'book appointment'.");
        }
    });

    chatbotForm.addEventListener("submit", async (event) => {
        event.preventDefault();
        const userText = chatbotInput.value.trim();
        if (!userText) return;

        addChatMessage(userText, "user");
        chatbotInput.value = "";
        await handleChatMessage(userText);
    });
}

const faqItems = document.querySelectorAll(".faq-item");
faqItems.forEach((item) => {
    item.addEventListener("toggle", () => {
        if (!item.open) return;
        faqItems.forEach((otherItem) => {
            if (otherItem !== item) {
                otherItem.open = false;
            }
        });
    });
});
