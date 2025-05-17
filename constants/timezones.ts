export const timezones = Intl.supportedValuesOf
  ? Intl.supportedValuesOf("timeZone")
  : [
      // Americas
      "Pacific/Honolulu", // Hawaii
      "America/Anchorage", // Alaska
      "America/Los_Angeles", // Pacific Time (US)
      "America/Denver", // Mountain Time (US)
      "America/Chicago", // Central Time (US)
      "America/New_York", // Eastern Time (US)
      "America/Indiana/Indianapolis", // Eastern Indiana
      "America/Caracas", // Venezuela
      "America/Sao_Paulo", // Brazil
      "America/Argentina/Buenos_Aires", // Argentina
      "America/Mexico_City", // Mexico City
      "America/Phoenix", // Arizona (no DST)
      "America/Guatemala", // Central America

      // Europe
      "Europe/London", // UK
      "Europe/Dublin", // Ireland
      "Europe/Berlin", // Germany
      "Europe/Paris", // France
      "Europe/Rome", // Italy
      "Europe/Amsterdam", // Netherlands
      "Europe/Brussels", // Belgium
      "Europe/Prague", // Czech Republic
      "Europe/Vienna", // Austria
      "Europe/Moscow", // Russia Moscow TZ
      "Europe/Istanbul", // Turkey

      // Africa
      "Africa/Cairo", // Egypt
      "Africa/Johannesburg", // South Africa
      "Africa/Lagos", // Nigeria
      "Africa/Nairobi", // Kenya
      "Africa/Algiers", // Algeria
      "Africa/Casablanca", // Morocco

      // Asia
      "Asia/Dubai", // UAE
      "Asia/Kolkata", // India
      "Asia/Kathmandu", // Nepal (+05:45)
      "Asia/Shanghai", // China
      "Asia/Tokyo", // Japan
      "Asia/Seoul", // South Korea
      "Asia/Jerusalem", // Israel
      "Asia/Tehran", // Iran
      "Asia/Bangkok", // Thailand
      "Asia/Singapore", // Singapore
      "Asia/Hong_Kong", // Hong Kong
      "Asia/Magadan", // Russian Far East
      "Asia/Yekaterinburg", // Ural Region (Russia)

      // Australia / Oceania
      "Australia/Sydney", // Australia East Coast
      "Australia/Perth", // Western Australia
      "Australia/Adelaide", // South Australia
      "Australia/Darwin", // Northern Territory
      "Pacific/Auckland", // New Zealand
      "Pacific/Fiji", // Fiji
    ];
