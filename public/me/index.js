export function mount() {
  document.getElementById('me_page_age_field').innerHTML = calculateAge(new Date(2005, 4, 17));

  // Source - https://stackoverflow.com/a/24181701
  // Posted by testUserPleaseIgnore, modified by community. See post 'Timeline' for change history
  // Retrieved 2026-10-06, License - CC BY-SA 4.0
  function calculateAge(birthday) {
    // birthday is a date
    var ageDifMs = Date.now() - birthday;
    var ageDate = new Date(ageDifMs); // miliseconds from epoch
    return Math.abs(ageDate.getUTCFullYear() - 1970);
  }
}
