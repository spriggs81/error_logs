function yHandler(){
  var wrap = document.getElementById('filtering');
  var contentHeight = wrap.offsetHeight; // get page content height
  var yOffset = window.pageYOffset;
  var y = yOffset + window.innerHeight;
  if(y >= contentHeight){
    wrap.innerHTML += '<div class="newData"></div>';

  }
  var status = document.getElementById('status');
  status.innerHTML = contentHeight+" | "+y;
}
window.onscroll = yHandler;
}
