/* Misterio — gecə/gündüz rejimi.
   FOUC olmasın deyə <head>-də sinxron yüklənir. */
(function(){
  var KEY="mist_theme";
  var saved=null;
  try{ saved=localStorage.getItem(KEY); }catch(e){}
  if(!saved){
    saved = (window.matchMedia && window.matchMedia("(prefers-color-scheme: light)").matches)
            ? "light" : "dark";
  }
  document.documentElement.setAttribute("data-theme", saved);

  window.toggleTheme=function(){
    var cur=document.documentElement.getAttribute("data-theme");
    var next= cur==="light" ? "dark" : "light";
    document.documentElement.setAttribute("data-theme", next);
    try{ localStorage.setItem(KEY,next); }catch(e){}
    paint();
  };
  function paint(){
    var t=document.documentElement.getAttribute("data-theme");
    document.querySelectorAll(".theme-btn").forEach(function(b){
      b.textContent = t==="light" ? "🌙" : "☀️";
      b.title = t==="light" ? "Gecə rejiminə keç" : "Gündüz rejiminə keç";
      b.setAttribute("aria-label", b.title);
    });
  }
  document.addEventListener("DOMContentLoaded", paint);
})();
