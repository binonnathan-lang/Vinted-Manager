(function(){
  const cfg=window.VINTED_SUPABASE_CONFIG||{};
  const screen=document.getElementById('authScreen'), shell=document.getElementById('appShell');
  const form=document.getElementById('authForm'), email=document.getElementById('authEmail'), password=document.getElementById('authPassword');
  const submit=document.getElementById('authSubmit'), toggle=document.getElementById('authToggle'), reset=document.getElementById('authReset'), status=document.getElementById('authStatus'), message=document.getElementById('authMessage');
  if(!screen||!shell)return;
  const configured=cfg.url&&!cfg.url.includes('YOUR-PROJECT')&&cfg.anonKey&&!cfg.anonKey.includes('YOUR-SUPABASE');
  let mode='login', client=null;
  if(configured&&window.supabase?.createClient) client=window.supabase.createClient(cfg.url,cfg.anonKey);
  function setStatus(t,error=false){status.textContent=t||'';status.className='auth-status'+(error?' error':'')}
  function renderMode(){const signup=mode==='signup';submit.textContent=signup?'Créer mon compte':'Se connecter';toggle.textContent=signup?'J’ai déjà un compte':'Créer un compte';message.textContent=signup?'Créez votre compte pour retrouver vos données sur vos appareils.':'Connectez-vous pour accéder à votre espace Vinted Manager.';reset.style.display=signup?'none':''}
  function showApp(){screen.style.display='none';shell.style.display='flex'}
  function showAuth(){shell.style.display='none';screen.style.display='flex'}
  async function init(){
    if(!configured||!client){showAuth();setStatus('Supabase n’est pas encore configuré. Ajoutez votre URL et votre clé anon dans config.js.',true);submit.disabled=true;reset.disabled=true;return}
    const {data}=await client.auth.getSession();if(data.session)showApp();else showAuth();
    client.auth.onAuthStateChange((_event,session)=>session?showApp():showAuth());
  }
  form.addEventListener('submit',async e=>{e.preventDefault();if(!client)return;submit.disabled=true;setStatus('Connexion en cours…');const r=mode==='signup'?await client.auth.signUp({email:email.value.trim(),password:password.value}):await client.auth.signInWithPassword({email:email.value.trim(),password:password.value});submit.disabled=false;if(r.error){setStatus(r.error.message,true);return}if(mode==='signup'&&!r.data.session){setStatus('Compte créé. Vérifiez votre e-mail si la confirmation est activée.');return}setStatus('')});
  toggle.addEventListener('click',()=>{mode=mode==='login'?'signup':'login';setStatus('');renderMode()});
  reset.addEventListener('click',async()=>{if(!client)return;const v=email.value.trim();if(!v){setStatus('Entrez votre e-mail avant de demander la réinitialisation.',true);return}const {error}=await client.auth.resetPasswordForEmail(v,{redirectTo:window.location.origin+window.location.pathname});setStatus(error?error.message:'E-mail de réinitialisation envoyé.')});
  window.vintedAuth={client,signOut:async()=>{if(client)await client.auth.signOut()}};
  renderMode();init();
})();
