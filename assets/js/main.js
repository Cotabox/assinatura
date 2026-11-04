function showControls(flag){
  $("#directions, #copy-rich-button, #copy-button, #download-file-button").toggleClass("is-hidden", !flag);
}

showControls(false);

function presentSignature(fName, signature){
  console.log('yup, presented');
  // show user the the results
  document.getElementById("demo").innerHTML=signature;
  //suggest to the user to edit or make another
  document.getElementById("build-button").innerHTML = "Atualizar";
  $("#copy-rich-button").text("Copiar assinatura");
  $("#copy-button").text("Copiar HTML");
  // add HTML to file link
  var fileName = companyInitals + '_' + fName + '.html';
  addSignatureToFile(fileName, signature);
}

function showCopyFeedback(buttonId, message) {
  $("#" + buttonId).text(message);
}

function copyWithSelection(text, onCopied) {
  var field = document.createElement("textarea");
  field.value = text;
  field.setAttribute("readonly", "");
  field.className = "copy-fallback";
  document.body.appendChild(field);
  field.select();
  var copied = document.execCommand("copy");
  document.body.removeChild(field);
  if (!copied) return;
  onCopied();
}

function copyToClipboard() {
  var onCopied = function() {
    showCopyFeedback("copy-button", "HTML copiado! Copiar novamente?");
  };
  if (!navigator.clipboard) return copyWithSelection(signature, onCopied);
  navigator.clipboard.writeText(signature).then(onCopied, function() {
    copyWithSelection(signature, onCopied);
  });
}

function copyRenderedSignature(onCopied) {
  var range = document.createRange();
  range.selectNodeContents(document.getElementById("demo"));
  var selection = window.getSelection();
  selection.removeAllRanges();
  selection.addRange(range);
  var copied = document.execCommand("copy");
  selection.removeAllRanges();
  if (!copied) return;
  onCopied();
}

function copySignature() {
  var onCopied = function() {
    showCopyFeedback("copy-rich-button", "Assinatura copiada! Copiar novamente?");
  };
  if (!window.ClipboardItem || !navigator.clipboard || !navigator.clipboard.write) return copyRenderedSignature(onCopied);
  var item = new ClipboardItem({
    "text/html": new Blob([signature], { type: "text/html" }),
    "text/plain": new Blob([document.getElementById("demo").innerText], { type: "text/plain" })
  });
  navigator.clipboard.write([item]).then(onCopied, function() {
    copyRenderedSignature(onCopied);
  });
}

function addSignatureToFile(filename, emailSig) {
  // stores HTML into link for file downloading
  var $element = $('a#download-file-button');
  $element.attr('href','data:text/html; charset=utf-8,' + encodeURIComponent(emailSig));
  $element.attr('download', filename);
}

function getQueryVariable(variable){
  var query = window.location.search.substring(1);
  var vars = query.split("&");
  for (var i=0;i<vars.length;i++) {
    var pair = vars[i].split("=");
    if(pair[0] == variable){return pair[1];}
  }
  return(false);
}

function convertStringToTemplate(tpl, ...rest){
  console.log('yup, converted template');
  // tpl = tpl.replace(/`/g, ''); // safety precaution
  var t = new Function('return `' + tpl + '`');
  return t(...rest);
}

function loadTemplate(...rest) {
  console.log('yup, loaded template');
  return $.ajax({
    url:"inline-code.html",  
    success:function(data) {
      convertStringToTemplate(data, ...rest);
    }
  });
}

function createTextField(label, id, placeholder, attributes){
  // Create new input field
  var newInput = document.createElement("INPUT");
  newInput.id = id;
  newInput.name = id;
  newInput.type = "text";
  newInput.placeholder = placeholder;
  Object.keys(attributes || {}).forEach(function(name){
    newInput.setAttribute(name, attributes[name]);
  });

  var newlabel = document.createElement("Label");
  newlabel.setAttribute("for",id);
  newlabel.innerHTML = label;

  // create new div.field
  var newDiv = document.createElement("div");
  // add this new field and label to new .field
  newDiv.appendChild(newlabel);
  newDiv.appendChild(newInput);

  // add to #form
  document.getElementById("form").appendChild(newDiv);
  $('#form div').last().addClass('form__field');
}

function getFiles(dir){
  fileList = [];

  var files = fs.readdirSync(dir);
  for(var i in files){
    if (!files.hasOwnProperty(i)) continue;
    var name = dir+'/'+files[i];
    if (!fs.statSync(name).isDirectory()){
      fileList.push(name);
    }
  }
  return fileList;
}

function createDataSelectBox(label, id, dataArray) {
  var staff = [];
  staff = dataArray;

  // Create select field
  var newSelect=document.createElement('select');

  // Create id
  newSelect.id = id;
  newSelect.name = id;
  newSelect.className = "chosen-select";

  // Create label
  var newlabel = document.createElement("Label");
  newlabel.setAttribute("for",id);
  newlabel.innerHTML = label;

  // Create select field options
  for(person in staff) {
   var opt = document.createElement("option");
   opt.value = staff[person];
   opt.innerHTML = staff[person]; // whatever property it has
   opt.innerHTML = cleanUpText(opt.innerHTML);
   // then append it to the select element
   newSelect.appendChild(opt);
 }

  // create new div.field
  var newDiv = document.createElement("div");
  // add this new field and label to new .field
  newDiv.appendChild(newlabel);
  newDiv.appendChild(newSelect);

  // add to #form
  document.getElementById("form").appendChild(newDiv);
  $('#form div').last().addClass('field');
}

function cleanUpText(str)
{
 str = str.replace('-', ' ');
 str = str.replace('.jpg', '');
 return str.replace(/\w\S*/g, function(txt){return txt.charAt(0).toUpperCase() + txt.substr(1).toLowerCase();});
}

// if field is empty
function removeElementFromTemplate(id, sig){
  // turn string to html
  var $el =  $(sig);
  id = "#"+id;
  // remove #cell
  $el.find(id).remove();
  // turn html back to string
  sig = $el.prop('outerHTML');
  console.log(sig);
  return sig;
}

//////
// if testing variable exists
//////
var urlvar = getQueryVariable("test")
if (urlvar) {
  console.log('yup, test is ready');
  showControls(true);

  first = "João";
  last = "Cavalcante";
  title = "Diretor de Tecnologia";
  phone = "(11) 91234-5678";
  email = "joao.cavalcante@cotabox.com.br";

  var tempfile = "./dist/code.html";

  $.ajax({
    url:tempfile,  
    success:function(data) {

      signature = convertStringToTemplate(data, first, last, title, phone, email, serverPath);
      // if(creds==''){signature = removeElementFromTemplate('creds', signature);}
      // if(title==''){signature = removeElementFromTemplate('title', signature);}
      if(phone==''){signature = removeElementFromTemplate('phone', signature);}

      // show the results && pass the first name for file download
      presentSignature(first, signature);
    }
  });
}
