// Production-build smoke measurement, not a field Web Vitals or load benchmark.
// Run from frontend: node ../scripts/ui-performance.mjs
import fs from 'node:fs';
import path from 'node:path';
import http from 'node:http';
import net from 'node:net';
import os from 'node:os';
import {spawn} from 'node:child_process';
import {gzipSync} from 'node:zlib';
import {createRequire} from 'node:module';
import {fileURLToPath} from 'node:url';
const root=path.resolve(path.dirname(fileURLToPath(import.meta.url)),'..');
const require=createRequire(path.join(root,'frontend/package.json'));
const {chromium}=require('@playwright/test');
const AxeBuilder=require('@axe-core/playwright').default;
const dist=path.join(root,'frontend/dist');
const temporary=fs.mkdtempSync(path.join(os.tmpdir(),'bloom-ui-measure-'));
const portServer=net.createServer();await new Promise(r=>portServer.listen(0,'127.0.0.1',r));const backendPort=portServer.address().port;await new Promise(r=>portServer.close(r));
const backend=spawn(path.join(root,'.venv/bin/python'),['-m','uvicorn','app.main:app','--host','127.0.0.1','--port',String(backendPort)],{cwd:path.join(root,'backend'),env:{...process.env,LLM_MODE:'deterministic',DATABASE_PATH:path.join(temporary,'demo.sqlite3')},stdio:'ignore'});
const server=http.createServer(async(req,res)=>{
 try{
  if(req.url.startsWith('/api/')){
   const response=await fetch(`http://127.0.0.1:${backendPort}${req.url.slice(4)}`,{method:req.method,headers:req.headers,body:['GET','HEAD'].includes(req.method)?undefined:req,duplex:'half'});
   res.writeHead(response.status,{'content-type':response.headers.get('content-type')??'application/json'});res.end(Buffer.from(await response.arrayBuffer()));return;
  }
  const relative=decodeURIComponent(req.url.split('?')[0]);const target=path.resolve(dist,'.'+(relative==='/'?'/index.html':relative));
  if(!target.startsWith(dist+path.sep)){res.writeHead(403);res.end();return;}
  res.setHeader('Content-Type',target.endsWith('.js')?'text/javascript':target.endsWith('.css')?'text/css':'text/html');res.end(fs.readFileSync(target));
 }catch{res.writeHead(500);res.end('Local measurement server error');}
});
let browser;
try{
 for(let i=0;i<100;i++){try{if((await fetch(`http://127.0.0.1:${backendPort}/health`)).ok)break;}catch{}await new Promise(r=>setTimeout(r,100));if(i===99)throw Error('Backend did not start');}
 await new Promise(r=>server.listen(0,'127.0.0.1',r));const baseURL=`http://127.0.0.1:${server.address().port}`;
 browser=await chromium.launch({executablePath:process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH||undefined,args:['--no-sandbox']});
 const html=fs.readFileSync(path.join(dist,'index.html'),'utf8');const assets=[...html.matchAll(/(?:src|href)="(\/assets\/[^"]+)"/g)].map(m=>{const content=fs.readFileSync(path.join(dist,m[1]));return {asset:m[1],bytes:content.length,gzipBytes:gzipSync(content).length};});
 const report={conditions:{date:new Date().toISOString(),browser:browser.version(),build:'production dist',network:'loopback; no throttling; static assets uncompressed on measurement server',mode:'deterministic',samplesPerCondition:1,scope:'Initial load and Fable Labs selection; first condition also generates draft, later conditions load that persisted draft; excludes approve, submit, provider mode and field traffic'},assets,conditionsResults:[]};
 for(const width of [1440,390,320])for(const reducedMotion of ['no-preference','reduce']){
  const context=await browser.newContext({viewport:{width,height:1000},reducedMotion});const page=await context.newPage();
  await page.addInitScript(()=>{window.__uiMetrics={longTasks:[],shifts:[],shiftDetails:[],stage:'navigation'};for(const type of ['longtask','layout-shift']){try{new PerformanceObserver(list=>{for(const e of list.getEntries()){if(type==='longtask')window.__uiMetrics.longTasks.push(e.duration);else if(!e.hadRecentInput){window.__uiMetrics.shifts.push(e.value);window.__uiMetrics.shiftDetails.push({value:e.value,stage:window.__uiMetrics.stage,sources:e.sources.map(s=>({element:s.node?.className,previousRect:s.previousRect,currentRect:s.currentRect}))});}}}).observe({type,buffered:true});}catch{}}});
  await page.goto(baseURL);await page.evaluate(()=>{window.__uiMetrics.stage='select';});await page.getByRole('button').filter({hasText:'Fable Labs'}).click();const headingFocused=await page.getByRole('heading',{name:'Review the blocking question'}).evaluate(el=>el===document.activeElement);
  await page.evaluate(()=>{window.__uiMetrics.stage='draft';});const generate=page.getByRole('button',{name:'Generate evidence draft'});const draftGenerated=await generate.count()>0;if(draftGenerated)await generate.click();await page.getByLabel('Answer for your review').waitFor();await page.waitForTimeout(800);
  const measurements=await page.evaluate(()=>({cls:window.__uiMetrics.shifts.reduce((a,b)=>a+b,0),longTasks:window.__uiMetrics.longTasks,shiftDetails:window.__uiMetrics.shiftDetails,overflow:document.documentElement.scrollWidth>innerWidth,elementsWithAnimationStyles:[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).animationName!=='none').length,elementsWithTransitionStyles:[...document.querySelectorAll('*')].filter(e=>getComputedStyle(e).transitionDuration.split(',').some(t=>parseFloat(t)>0)).length,activeAnimations:document.getAnimations().filter(a=>a.playState==='running').map(a=>({type:a.constructor.name,duration:a.effect?.getTiming().duration,iterations:a.effect?.getTiming().iterations===Infinity?'infinite':a.effect?.getTiming().iterations})),navigation:performance.getEntriesByType('navigation').map(n=>({domContentLoadedMs:n.domContentLoadedEventEnd,responseEndMs:n.responseEnd}))}));
  const axe=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
  report.conditionsResults.push({width,reducedMotion,draftGenerated,headingFocused,...measurements,axe:{violations:axe.violations.map(v=>({id:v.id,impact:v.impact,nodes:v.nodes.map(n=>({target:n.target,failureSummary:n.failureSummary}))})),incomplete:axe.incomplete.map(v=>v.id),passes:axe.passes.length}});await context.close();
 }
 console.log(JSON.stringify(report,null,2));
}finally{await browser?.close();await new Promise(r=>server.close(r));backend.kill('SIGTERM');fs.rmSync(temporary,{recursive:true,force:true});}
