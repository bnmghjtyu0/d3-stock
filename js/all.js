// tableRwd
function tableResponsive(el) {
  try {
    var array = [];
    var table = document.querySelector(el);
    var th = table.getElementsByTagName("th");
    for (var i = 0; i < th.length; i++) {
      var headingText = th[i].innerHTML;
      array.push(headingText);
    }
    var style = document.createElement("style"),
      styleSheet;
    document.head.appendChild(style);
    styleSheet = style.sheet;
    for (var i = 0; i < array.length; i++) {
      styleSheet.insertRule(
        el +
        " td:nth-child(" +
        (i + 1) +
        ')::before {content:"' +
        array[i] +
        ': ";}',
        styleSheet.cssRules.length
      );
    }
  } catch (e) {
    // console.log("錯誤:" + e);
  }
}
tableResponsive("#table01");

const mq = window.matchMedia("(max-width: 992px)");

// navbar
// 監聽
var navbar = document.querySelector('#navbar');
var aside = document.querySelector('.aside');
var main = document.querySelector('main');
function navbarFunc(e) {
  e.preventDefault();
  aside.classList.toggle('active');
  main.classList.toggle('active');
}

// responsive
function ifMatches() {
  if (mq.matches) {
    aside.classList.add('active');
  } else {
    aside.classList.remove('active');
  }
}
ifMatches();
window.onresize = function () {
  ifMatches();
}
navbar.addEventListener('click', navbarFunc, false);