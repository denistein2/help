(()=>{
"use strict";
const form=document.getElementById("lead-form");
if(!form)return;
const fields=["nome","empresa","email","whatsapp","lojas","sistema","necessidade","consent"];
const errors={
 nome:{id:"e-nome",msg:"Informe o nome do responsável."},
 empresa:{id:"e-empresa",msg:"Informe o nome da empresa."},
 email:{id:"e-email",msg:"Informe um e-mail válido."},
 whatsapp:{id:"e-whats",msg:"Informe WhatsApp com DDD (10 ou 11 dígitos)."},
 lojas:{id:"e-lojas",msg:"Selecione a quantidade aproximada de lojas."},
 sistema:{id:"e-sistema",msg:"Selecione o sistema utilizado."},
 necessidade:{id:"e-need",msg:"Descreva a necessidade com pelo menos 10 caracteres."},
 consent:{id:"e-consent",msg:"Confirme a leitura da política para continuar."}
};
const valid=(name, field)=>{
 const value=field.type==="checkbox"?field.checked:field.value.trim();
 switch(name){
 case "nome":return value.length>=2;
 case "empresa":return value.length>=2;
 case "email":return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value);
 case "whatsapp":return /^\d{10,11}$/.test(value.replace(/\D/g,""));
 case "lojas":case "sistema":return value.length>0;
 case "necessidade":return value.length>=10;
 case "consent":return value===true;
 default:return true;
 }
};
function check(){let first=null;
 for(const name of fields){const input=form.elements.namedItem(name);const good=valid(name,input);const error=document.getElementById(errors[name].id);error.textContent=good?"":errors[name].msg;input.setAttribute("aria-invalid",String(!good));if(!good&&!first)first=input;}
 return first;
}
let tried=false;
form.addEventListener("submit",(event)=>{
 const status=document.getElementById("form-status");
 if(form.elements.namedItem("_honey").value){
  event.preventDefault();status.textContent="Não foi possível processar este envio.";return;
 }
 tried=true;
 const first=check();
 if(first){event.preventDefault();status.textContent="Confira os campos destacados.";first.focus();return;}
 const next=document.getElementById("thankyou-url");
 if(next && /^https?:$/.test(window.location.protocol)){
  next.value=new URL("/obrigado.html",window.location.origin).href;
 }
 status.textContent="Abrindo a confirmação de envio…";
 // Envio nativo: FormSubmit exibirá proteção antispam e solicitará ativação inicial.
 // Não anunciar sucesso sem a resposta do provedor de formulários.
});
form.addEventListener("input",()=>{if(tried)check();});
form.addEventListener("change",()=>{if(tried)check();});
})();
