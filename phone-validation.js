// Shared by website forms and the Cloudflare receiver. libphonenumber-js/max 1.13.15.
(() => {
  globalThis.DC_PHONE = {
    normalize(value) {
      if (typeof value !== 'string' || !value.trim() || value.length > 40) return null;
      // Reject surrounding prose and extensions; parse the entire supplied number.
      const phone = globalThis.libphonenumber?.parsePhoneNumberFromString(value.trim(), { defaultCountry: 'US', extract: false });
      return phone && phone.country === 'US' && !phone.ext && phone.isValid() ? phone.number : null;
    }
  };
})();
