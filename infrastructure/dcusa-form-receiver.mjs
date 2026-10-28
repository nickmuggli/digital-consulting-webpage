import '../vendor/libphonenumber-js/libphonenumber-max.js';
import '../phone-validation.js';
// DCUSA form receiver. Secrets remain in Cloudflare bindings. Based on active version 76938761.
const API = 'https://services.leadconnectorhq.com';
const fieldsMap = {
  specialty:'dcusa_contractor_specialty', service_area:'dcusa_service_area',
  service_radius:'dcusa_service_radius', monthly_revenue:'dcusa_monthly_revenue',
  ad_budget:'dcusa_ad_budget', project_value:'dcusa_average_project_value',
  start_timeframe:'dcusa_start_timeframe', growth_goals:'dcusa_growth_goals',
  capacity:'dcusa_capacity', challenge:'dcusa_challenge', additional_information:'dcusa_additional_information'
};
const attributionKeys = new Set(['utm_source','utm_medium','utm_campaign','utm_content','utm_term','gclid','fbclid','msclkid','wbraid','gbraid']);
const hex = bytes => [...new Uint8Array(bytes)].map(x=>x.toString(16).padStart(2,'0')).join('');
const hash = async text => hex(await crypto.subtle.digest('SHA-256',new TextEncoder().encode(text)));
class Problem extends Error { constructor(status,message){super(message);this.status=status;} }
const fail=(status,message)=>{throw new Problem(status,message);};
const str=(v,max=200)=> typeof v==='string' ? v.trim().slice(0,max) : '';
function normalizeEmail(v){const x=str(v,254).toLowerCase();if(!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(x))fail(400,'Valid email required');return x;}
function normalizePhone(v){const phone=globalThis.DC_PHONE.normalize(v);if(!phone){const error=new Problem(400,'Enter a valid U.S. phone number, including area code.');error.field='phone';throw error;}return phone;}
function validateForm(b){
  if(b?.version!==1||!['contact','application'].includes(b.source))fail(400,'Invalid form');
  if(!/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(b.idempotencyKey||''))fail(400,'Invalid submission key');
  if(!b.fields||Array.isArray(b.fields)||typeof b.fields!=='object')fail(400,'Invalid fields');
  if(b.fields.website_confirm)fail(400,'Submission rejected');
  const allowed=new Set(['full_name','company','email','phone','website','sms_consent','sms_marketing_consent','sms_informational_consent','website_confirm',...Object.keys(fieldsMap)]);
  const f={}; for(const [k,v] of Object.entries(b.fields)){if(!allowed.has(k)||typeof v!=='string'||v.length>4000)fail(400,'Invalid field');f[k]=v.trim();}
  const required=['full_name','company','email','phone','specialty','service_area',...(b.source==='contact'?['challenge']:['service_radius','monthly_revenue','ad_budget','project_value','start_timeframe','growth_goals','capacity'])];
  f.phone=normalizePhone(f.phone);
  if(required.some(k=>!f[k]))fail(400,'Required field missing');
  f.email=normalizeEmail(f.email);
  if(f.website){let u;try{u=new URL(f.website);}catch{fail(400,'Invalid website');}if(!['https:','http:'].includes(u.protocol))fail(400,'Invalid website');}
  if(b.source==='application'&&(!/^\d+$/.test(f.service_radius)||+f.service_radius<1||+f.service_radius>1000))fail(400,'Invalid service radius');
  const attr={};for(const [k,v] of Object.entries(b.attribution||{})){if(attributionKeys.has(k)&&typeof v==='string')attr[k]=v.slice(0,300);}
  let page;try{page=new URL(b.sourcePage);}catch{fail(400,'Invalid source page');}
  if(!['https://www.digitalconsultingusa.com','https://digitalconsultingusa.com'].includes(page.origin))fail(400,'Invalid source page');
  const v2=b.smsDisclosureVersion==='2026-10-21-v2';
  const appointment=b.smsDisclosureVersion==='2026-10-27-appointments-v1';
  for(const key of ['smsMarketingConsent','smsInformationalConsent'])if(b[key]!==undefined&&typeof b[key]!=='boolean')fail(400,'Invalid SMS choice');
  if(v2&&(typeof b.smsMarketingConsent!=='boolean'||typeof b.smsInformationalConsent!=='boolean'))fail(400,'Separate SMS choices required');
  if(appointment&&(b.smsMarketingConsent===true||f.sms_marketing_consent))fail(400,'Appointment consent does not authorize marketing');
  const smsMarketingConsent=v2&&b.smsMarketingConsent===true;
  const smsInformationalConsent=(v2||appointment)&&b.smsInformationalConsent===true;
  if((v2||appointment)&&(smsMarketingConsent!==(f.sms_marketing_consent==='yes')||smsInformationalConsent!==(f.sms_informational_consent==='yes')))fail(400,'SMS choices do not match');
  return {version:1,idempotencyKey:b.idempotencyKey,source:b.source,fields:f,language:b.language==='es'?'es':'en',attribution:attr,sourcePage:page.origin+page.pathname,smsConsent:false,smsMarketingConsent,smsInformationalConsent,smsAppointmentConsent:appointment&&smsInformationalConsent,smsEnabled:false,smsDisclosureVersion:appointment?'2026-10-27-appointments-v1':v2?'2026-10-21-v2':'legacy-no-sms-consent'};
}
async function verifyCal(raw,signature,secret){
  if(!secret||!/^[a-f0-9]{64}$/i.test(signature||''))return false;
  const key=await crypto.subtle.importKey('raw',new TextEncoder().encode(secret),{name:'HMAC',hash:'SHA-256'},false,['verify']);
  const bytes=Uint8Array.from(signature.match(/../g),x=>parseInt(x,16));
  return crypto.subtle.verify('HMAC',key,bytes,new TextEncoder().encode(raw));
}
function parseCal(b,env){
  const p=b?.payload;
  if(!['BOOKING_CREATED','BOOKING_CANCELLED','BOOKING_RESCHEDULED'].includes(b?.triggerEvent))return null;
  if(!p||p.organizer?.username!==env.CAL_USERNAME||p.type!==env.CAL_EVENT_SLUG)return null;
  if(!p.uid||!b.createdAt||!Number.isFinite(Date.parse(b.createdAt)))fail(400,'Invalid booking event');
  if(b.triggerEvent!=='BOOKING_CANCELLED'&&p.status!=='ACCEPTED')return null;
  const attendee=p.attendees?.[0];if(!attendee?.email)fail(400,'Booking email missing');
  return {uid:str(p.uid,200),previousUid:str(p.rescheduleUid,200),event:b.triggerEvent,email:normalizeEmail(attendee.email),name:str(attendee.name),start:str(p.startTime,50),occurred:new Date(b.createdAt).toISOString(),status:b.triggerEvent==='BOOKING_CANCELLED'?'canceled':'confirmed'};
}
class GHL {
  constructor(env){this.env=env;this.fetch=env.API_FETCH||((input,init)=>fetch(input,init));}
  async call(path,method='GET',body){
    const res=await this.fetch(API+path,{method,signal:AbortSignal.timeout(8000),headers:{Authorization:'Bearer '+this.env.GHL_TOKEN,Version:'2021-07-28','Content-Type':'application/json'},...(body?{body:JSON.stringify(body)}:{})});
    if(!res.ok)fail(502,'CRM processing unavailable');return res.status===204?{}:res.json();
  }
  async config(){
    const [cf,pl]=await Promise.all([this.call(`/locations/${this.env.LOCATION_ID}/customFields`),this.call(`/opportunities/pipelines?locationId=${encodeURIComponent(this.env.LOCATION_ID)}`)]);
    this.fields=new Map((cf.customFields||[]).map(f=>[f.fieldKey,f.id]));
    this.pipeline=(pl.pipelines||[]).find(p=>p.name===this.env.PIPELINE_NAME);if(!this.pipeline)fail(503,'Pipeline setup incomplete');
  }
  custom(values){return Object.entries(values).filter(([,v])=>v!==undefined&&v!=='').map(([key,value])=>{const id=this.fields.get('contact.'+key);if(!id)fail(503,'Field mapping incomplete');return {id,field_value:String(value)};});}
  stage(name){const s=this.pipeline.stages.find(s=>s.name===name);if(!s)fail(503,'Stage mapping incomplete');return s.id;}
  async contact(f,custom){
    const name=str(f.full_name).split(/\s+/);
    const body={locationId:this.env.LOCATION_ID,email:f.email,...(f.full_name?{firstName:name.shift(),lastName:name.join(' ')}:{}),...(f.phone?{phone:f.phone}:{}),...(f.company?{companyName:str(f.company)}:{}),...(f.website?{website:f.website}:{}),dndSettings:{SMS:{status:'active',message:'Website SMS sending disabled pending registration and operational review'}},customFields:this.custom(custom)};
    const r=await this.call('/contacts/upsert','POST',body);if(!r.contact?.id)fail(502,'Contact not confirmed');return r.contact.id;
  }
  async opportunity(contactId,stageName,source,{allowMove=/** @type {boolean|string} */ (false)}={}){
    const r=await this.call(`/opportunities/search?location_id=${encodeURIComponent(this.env.LOCATION_ID)}&pipeline_id=${encodeURIComponent(this.pipeline.id)}&contact_id=${encodeURIComponent(contactId)}&limit=100`);
    const matches=(r.opportunities||[]).filter(o=>o.contactId===contactId&&o.pipelineId===this.pipeline.id);
    if(matches.length>1)fail(409,'Duplicate opportunities require review');
    if(matches.length){const o=matches[0];const permitted=allowMove==='application'?['New Inquiry']:['New Inquiry','Application Received','Strategy Call Booked','Call Canceled - Follow Up'];if(allowMove&&o.status==='open'&&permitted.some(n=>this.stage(n)===o.pipelineStageId))await this.call('/opportunities/'+o.id,'PUT',{pipelineStageId:this.stage(stageName)});return o.id;}
    const out=await this.call('/opportunities/upsert','POST',{locationId:this.env.LOCATION_ID,pipelineId:this.pipeline.id,pipelineStageId:this.stage(stageName),contactId,status:'open',name:'DCUSA Website Lead',source});
    if(!out.opportunity?.id)fail(502,'Opportunity not confirmed');return out.opportunity.id;
  }
  async tag(id,tag){await this.call(`/contacts/${id}/tags`,'POST',{tags:[tag]});}
}

const response=(status,body,origin)=>new Response(status===204?null:JSON.stringify(body),{status,headers:{'Content-Type':'application/json','Cache-Control':'no-store',...(origin?{'Access-Control-Allow-Origin':origin,'Vary':'Origin','Access-Control-Allow-Headers':'Content-Type','Access-Control-Allow-Methods':'POST, OPTIONS'}:{})}});
async function withLock(db,fn){
  const owner=crypto.randomUUID(),now=Date.now();
  const r=await db.prepare('INSERT INTO locks(id,owner,expires) VALUES(?,?,?) ON CONFLICT(id) DO UPDATE SET owner=excluded.owner,expires=excluded.expires WHERE locks.expires < ?').bind('crm',owner,now+120000,now).run();
  if(!r.meta?.changes)fail(409,'Processing another submission; retry shortly');
  try{return await fn();}finally{await db.prepare('DELETE FROM locks WHERE id=? AND owner=?').bind('crm',owner).run();}
}
async function receipt(db,id,body){
  const fingerprint=await hash(JSON.stringify(body));
  await db.prepare('INSERT OR IGNORE INTO receipts(id,hash,body,received) VALUES(?,?,?,?)').bind(id,fingerprint,JSON.stringify(body),new Date().toISOString()).run();
  const row=await db.prepare('SELECT * FROM receipts WHERE id=?').bind(id).first();
  if(row.hash!==fingerprint)fail(409,'Submission key already used for different answers');return row;
}
async function processForm(env,b,ip){
  const db=env.DB;
  return withLock(db,async()=>{
    const id='form:'+b.idempotencyKey,row=await receipt(db,id,b);
    if(row.result)return JSON.parse(row.result);
    const cp=JSON.parse(row.checkpoint);
    const save=()=>db.prepare('UPDATE receipts SET checkpoint=? WHERE id=?').bind(JSON.stringify(cp),id).run();
    if(!cp.rateChecked){const key=await hash(ip+':'+new Date().toISOString().slice(0,13)+':'+env.RATE_SALT);await db.prepare('INSERT INTO limits(id,count) VALUES(?,1) ON CONFLICT(id) DO UPDATE SET count=count+1').bind(key).run();const r=await db.prepare('SELECT count FROM limits WHERE id=?').bind(key).first();if(r.count>10)fail(429,'Too many submissions; try later');cp.rateChecked=true;await save();}
    const crm=new GHL(env);await crm.config();
    const custom=Object.fromEntries(Object.entries(fieldsMap).filter(([k])=>b.fields[k]).map(([k,v])=>[v,b.fields[k]]));
    Object.assign(custom,{dcusa_form_source:b.source,dcusa_submission_id:b.idempotencyKey,dcusa_received_at:row.received,dcusa_attribution:JSON.stringify(b.attribution),dcusa_language:b.language});
    if(!cp.contactId){cp.contactId=await crm.contact(b.fields,custom);await save();}
    if(!cp.consentRecorded){await crm.call('/contacts/'+cp.contactId+'/notes','POST',{body:JSON.stringify({type:'DCUSA SMS consent record',submissionId:b.idempotencyKey,phone:b.fields.phone,marketing:b.smsMarketingConsent,informational:b.smsInformationalConsent,appointment:b.smsAppointmentConsent,purpose:b.smsDisclosureVersion==='2026-10-27-appointments-v1'?'appointment confirmations and reminders':'legacy purposes',receivedAt:row.received,sourceUrl:b.sourcePage,disclosureVersion:b.smsDisclosureVersion,language:b.language,smsEnabled:false})});cp.consentRecorded=true;await save();}
    if(!cp.opportunityId){cp.opportunityId=await crm.opportunity(cp.contactId,b.source==='application'?'Application Received':'New Inquiry','DCUSA Website '+b.source,{allowMove:b.source==='application'?'application':false});await save();}
    if(!cp.notified){await crm.tag(cp.contactId,'dcusa-website-'+b.source+'-ready');cp.notified=true;await save();}
    const out={success:true,submissionId:b.idempotencyKey};
    await db.prepare('UPDATE receipts SET result=? WHERE id=?').bind(JSON.stringify(out),id).run();return out;
  });
}
async function processCal(env,b){
  const event=parseCal(b,env);if(!event)return {success:true,ignored:true};
  return withLock(env.DB,async()=>{
    const db=env.DB,id='cal:'+await hash(JSON.stringify(event));const row=await receipt(db,id,event);if(row.result)return JSON.parse(row.result);
    const finish=async out=>{await db.prepare('UPDATE receipts SET result=? WHERE id=?').bind(JSON.stringify(out),id).run();return out;};
    const old=await db.prepare('SELECT * FROM bookings WHERE uid=?').bind(event.uid).first();
    // Creation is immutable; inactive UIDs are canceled or superseded and must never reactivate.
    if(old&&(event.event==='BOOKING_CREATED'||(event.status==='confirmed'&&!old.active)))return finish({success:true,ignored:true});
    if(old&&old.occurred>=event.occurred)return finish({success:true,ignored:true});
    // A cancellation cannot manufacture a new lead. Unknown cancellations require reconciliation.
    if(event.status==='canceled'&&!old)fail(409,'Unknown cancellation requires booking reconciliation');
    const crm=new GHL(env);await crm.config();
    const contactId=old?.contact_id||await crm.contact({email:event.email,full_name:event.name},{});
    const active=await db.prepare('SELECT uid FROM bookings WHERE contact_id=? AND active=1 AND uid!=?').bind(contactId,event.uid).all();
    const stage=event.status==='confirmed'||active.results.length?'Strategy Call Booked':'Call Canceled - Follow Up';
    const opportunityId=await crm.opportunity(contactId,stage,'DCUSA Cal.com',{allowMove:true});
    if(event.previousUid)await db.prepare('INSERT INTO bookings(uid,contact_id,opportunity_id,occurred,active,email) VALUES(?,?,?,?,0,?) ON CONFLICT(uid) DO UPDATE SET active=0,occurred=MAX(bookings.occurred,excluded.occurred)').bind(event.previousUid,contactId,opportunityId,event.occurred,event.email).run();
    // Don't overwrite current booking fields when canceling an older, superseded booking.
    if(event.status==='confirmed'||!active.results.length)await crm.call('/contacts/'+contactId,'PUT',{customFields:crm.custom({dcusa_cal_booking_uid:event.uid,dcusa_cal_booking_status:event.status,dcusa_cal_start_time:event.start})});
    await db.prepare('INSERT INTO bookings(uid,contact_id,opportunity_id,occurred,active,email) VALUES(?,?,?,?,?,?) ON CONFLICT(uid) DO UPDATE SET occurred=excluded.occurred,active=excluded.active').bind(event.uid,contactId,opportunityId,event.occurred,event.status==='confirmed'?1:0,event.email).run();
    return finish({success:true});
  });
}
export default {
  async fetch(request,env){
    let origin;try{
      const url=new URL(request.url),path=url.pathname;
      if(url.protocol!=='https:')fail(400,'HTTPS required');
      if(path==='/health'&&request.method==='GET')return response(200,{service:'dcusa-ghl-receiver',enabled:env.ENABLED==='true'});
      if(!['/forms','/webhooks/cal'].includes(path))return response(404,{success:false});
      if(path==='/forms'){origin=request.headers.get('Origin');if(!(env.ALLOWED_ORIGINS||'').split(',').includes(origin))fail(403,'Origin not allowed');if(request.method==='OPTIONS')return response(204,null,origin);}
      if(request.method!=='POST')fail(405,'POST required');
      if(env.ENABLED!=='true'||!env.GHL_TOKEN||!env.RATE_SALT)fail(503,'Receiver not enabled');
      if(!request.headers.get('Content-Type')?.includes('application/json'))fail(415,'JSON required');
      const declared=Number(request.headers.get('Content-Length')||0);if(declared>32768)fail(413,'Request too large');
      const reader=request.body?.getReader();let raw='',size=0;const decoder=new TextDecoder();if(!reader)fail(400,'Body required');
      while(true){const part=await reader.read();if(part.done)break;size+=part.value.length;if(size>32768){await reader.cancel();fail(413,'Request too large');}raw+=decoder.decode(part.value,{stream:true});}raw+=decoder.decode();
      if(path==='/webhooks/cal'&&!await verifyCal(raw,request.headers.get('x-cal-signature-256'),env.CAL_WEBHOOK_SECRET))fail(401,'Invalid signature');
      let body;try{body=JSON.parse(raw);}catch{fail(400,'Invalid JSON');}
      return response(200,path==='/forms'?await processForm(env,validateForm(body),request.headers.get('CF-Connecting-IP')||'unknown'):await processCal(env,body),origin);
    }catch(error){return response(error.status||500,{success:false,...(error.field?{field:error.field}:{}),error:error instanceof Problem?error.message:'Submission processing unavailable'},origin);}
  }
};

