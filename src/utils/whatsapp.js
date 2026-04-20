/**
 * Utility functions for generating WhatsApp links
 */

import contactData from '../../data/contact.json';

/**
 * Get the primary phone number from contact data
 * @returns {string} Primary phone number without spaces
 */
export function getPrimaryPhone() {
  const primaryPhone = contactData.phones.find(phone => phone.primary);
  return primaryPhone ? primaryPhone.number.replace(/\s/g, '') : '';
}

/**
 * Generate a WhatsApp link with a pre-filled message
 * @param {string} message - The message to pre-fill
 * @returns {string} WhatsApp URL
 */
export function getWhatsAppLink(message = '') {
  const phone = getPrimaryPhone();
  const encodedMessage = encodeURIComponent(message);
  return `https://wa.me/${phone}${message ? `?text=${encodedMessage}` : ''}`;
}

/**
 * Generate WhatsApp link for a product
 * @param {object} product - Product object with whatsapp_message or cta field
 * @param {string} locale - Current locale ('ar' or 'en')
 * @returns {string} WhatsApp URL
 */
export function getProductWhatsAppLink(product, locale = 'ar') {
  const message = product.whatsapp_message?.[locale] || product.cta || '';
  return getWhatsAppLink(message);
}

/**
 * Generate WhatsApp link for a project
 * @param {object} project - Project object
 * @param {string} locale - Current locale ('ar' or 'en')
 * @returns {string} WhatsApp URL
 */
export function getProjectWhatsAppLink(project, locale = 'ar') {
  const projectName = locale === 'ar' ? project.titleAr : project.titleEn;
  const message = locale === 'ar' 
    ? `مرحباً، أنا مهتم بمشروع مشابه لـ ${projectName}`
    : `Hello, I'm interested in a project similar to ${projectName}`;
  return getWhatsAppLink(message);
}

/**
 * Generate WhatsApp link for general consultation (hero CTA)
 * @param {string} locale - Current locale ('ar' or 'en')
 * @returns {string} WhatsApp URL
 */
export function getConsultationWhatsAppLink(locale = 'ar') {
  const message = locale === 'ar'
    ? 'مرحباً، أريد استشارة مجانية لمشروعي'
    : 'Hello, I would like a free consultation for my project';
  return getWhatsAppLink(message);
}
