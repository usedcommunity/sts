
// Email für CONTACT Button
function openEmail() {
  var emailAddress = 'contact@used.community';
  var subject = 'Nachhaltigkeitsanforderungen';
  var body = '';

  var mailtoLink = 'mailto:' + encodeURIComponent(emailAddress) +
                   '?subject=' + encodeURIComponent(subject) +
                   '&body=' + encodeURIComponent(body);
  window.location.href = mailtoLink;
}