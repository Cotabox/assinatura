//// Global vars
//////
// setup vars ***
//////
var companyName = 'Cotabox';
var companyInitals = 'Cotabox';
// server path ***
// this may change based on your local or live server set
var www = "";
if(window.location.href.indexOf("www") > -1){ www = "www."};
var serverPath = window.location.hostname === "localhost" ? window.location.origin : "https://assinatura.cotabox.com.br";
// defaults
var first, signature;

// collect headshots of people (staff)
var teamImgs = ["", "No Photo"];
var fileExt = ".jpg";
function getTeamImages(){
  return true
}

//////
// Start Signature CMS
//////
$(document).ready(function() {
  // update company name
  $('#company-name').text(companyName);

  // add text fields ***
  // createTextField(label, id, placeholder)
  $.when(getTeamImages()).done(function(results){
    $(results).find("a:contains(" + fileExt + ")").each(function () {
      teamImgs.push($(this).text().trim());
    });
    // createDataSelectBox("Add your headshot", "headshot", teamImgs);
    createTextField("Nome*", "first", "Maria", { autocomplete: "given-name" });
    createTextField("Sobrenome*", "last", "Souza", { autocomplete: "family-name" });
    createTextField("Cargo", "title", "Analista de Compras", { autocomplete: "organization-title" });
    createTextField("Telefone", "phone", "(11) 91234-5678", { inputmode: "tel", autocomplete: "tel-national", maxlength: "15" });
    createTextField("E-mail", "email", "nome.sobrenome@cotabox.com.br", { inputmode: "email", autocomplete: "email" });
    CotaboxForm.init();
  });
});

// on submit button click
function buidSignature() {
  if (!CotaboxForm.validateAll()) return;
  showControls(true);

  //Get the value of input fields with id="INPUT-FIELD-ID" ***
  first = document.getElementById("first").value.trim();
  last = document.getElementById("last").value.trim();
  creds = '';
  if(creds !== '') creds = ', ' + creds;
  title = document.getElementById("title").value.trim();
  division = '';
  phone = CotaboxForm.formatPhone( document.getElementById("phone").value );
  email = CotaboxForm.normalizeEmail( document.getElementById("email").value );

  $.ajax({
    url:"./dist/code.html",  
    success:function(data) {
      headshot = '';
      // put in all the variables need here ***
      // to add data for `dist/code.html` email signature template
      signature = convertStringToTemplate(
        data, 
        headshot, 
        first, 
        last, 
        creds, 
        title, 
        phone, 
        email, 
        serverPath
      );

      // optional fields ***
      if(creds===''){signature = removeElementFromTemplate('creds', signature);}
      if(title===''){signature = removeElementFromTemplate('title', signature);}
      if(division===''){signature = removeElementFromTemplate('division', signature);}
      if(phone===''){signature = removeElementFromTemplate('phone', signature);}
      if(email===''){signature = removeElementFromTemplate('email', signature);}

      // show the results && pass the first name for file download
      presentSignature(first, signature);
    }
  });
}