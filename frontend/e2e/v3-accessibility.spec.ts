import { test, expect, type Page } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { Application, Resolution } from '../src/types';

const answer = 'I built and integrated REST APIs using Python and TypeScript.';
const evidence = {id:'e-rest',candidate_id:'c-demo',kind:'profile' as const,topic:'rest',text:answer,context:'REST API development experience'};
function fixture(verdict: Resolution['verdict'] = 'supported', state='awaiting_review'):Application {
 return {id:'a-rest',candidate_id:'c-demo',company:'Fable Labs',role:'Software Intern',question:'Describe your REST API development experience.',question_kind:verdict==='sensitive'?'authorization':'technical',state,revision:2,evidence:[evidence],approved_answer:state==='verification_required'?answer:null,receipt:null,scenario:'normal',draft:{answer:verdict==='supported'?answer:'',claims:verdict==='supported'?[{text:answer,quote:answer,source_id:'e-rest'}]:[],missing_information:verdict==='supported'?[]:['Candidate information required.'],requires_confirmation:verdict==='sensitive',verdict,mode:'deterministic',latency_ms:1,tokens:null,warnings:[]}};
}
async function mock(page:Page, app:Application, historyError=false){
 await page.route('**/api/health',r=>r.fulfill({json:{status:'ok',mode:'deterministic'}}));
 await page.route('**/api/answers',r=>r.fulfill({json:{answers:[]}}));
 await page.route('**/api/applications',r=>r.fulfill({json:{applications:[app]}}));
 await page.route('**/api/applications/a-rest/events',r=>r.fulfill(historyError?{status:500,json:{detail:'History unavailable'}}:{json:{events:[]}}));
}
async function select(page:Page){await page.goto('/');await page.getByRole('button').filter({hasText:'Fable Labs'}).click();await expect(page.getByRole('heading',{name:'Review the blocking question'})).toBeFocused();}

for(const theme of ['light','dark']) for(const condition of ['supported','unsupported','sensitive','uncertain']){
 test(`v3 accessibility ${theme} ${condition}`,async({page})=>{
  await page.emulateMedia({colorScheme:theme as 'light'|'dark'});
  const app=fixture(condition==='uncertain'?'supported':condition as Resolution['verdict'],condition==='uncertain'?'verification_required':'awaiting_review');
  await mock(page,app);await select(page);
  await expect(page.locator('html')).toHaveAttribute('data-theme',theme);
  await expect(page.getByRole('button',{name:'Dark theme',exact:true})).toHaveAttribute('aria-pressed',String(theme==='dark'));
  const scan=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa','wcag22aa']).analyze();
  const output=path.resolve('../artifacts/ui-v3/accessibility');mkdirSync(output,{recursive:true});
  writeFileSync(path.join(output,`${theme}-${condition}.json`),JSON.stringify({theme,condition,browser:page.context().browser()?.version(),viewport:page.viewportSize(),violations:scan.violations,incomplete:scan.incomplete.map(v=>v.id),limitations:'Chromium automation; no actual assistive-technology test.'},null,2));
  expect(scan.violations).toEqual([]);
  if(condition==='unsupported') await expect(page.getByRole('button',{name:'Approve answer',exact:true})).toBeDisabled();
  if(condition==='uncertain') await expect(page.getByRole('button',{name:'Check submission status'})).toBeVisible();
 });
}

test('v3 answer validation is associated with editor; unrelated history error does not mark answer invalid',async({page})=>{
 await mock(page,fixture(),true);await select(page);
 const editor=page.getByLabel('Answer for your review',{exact:true});
 await expect(editor).not.toHaveAttribute('aria-invalid','true');
 await page.route('**/api/applications/a-rest/approve',r=>r.fulfill({status:422,json:{detail:'Answer must match supported evidence.'}}));
 await editor.fill('Unverified claim.');await page.getByRole('button',{name:'Approve answer',exact:true}).click();
 await expect(editor).toHaveAttribute('aria-invalid','true');
 const described=await editor.getAttribute('aria-describedby');expect(described).toBeTruthy();
 const descriptions=await page.evaluate(ids=>ids!.split(/\s+/).map(id=>document.getElementById(id)?.textContent??'').join(' '),described);
 expect(descriptions).toContain('supported evidence');
});

test('v3 reduced motion, 320px reflow, keyboard selection and target sizes',async({page})=>{
 await page.setViewportSize({width:320,height:812});await page.emulateMedia({reducedMotion:'reduce',colorScheme:'dark'});await mock(page,fixture());
 await page.goto('/');await page.keyboard.press('Tab');await expect(page.getByRole('link',{name:'Skip to recovery workspace'})).toBeFocused();
 await page.keyboard.press('Enter');const card=page.getByRole('button').filter({hasText:'Fable Labs'});await card.focus();await page.keyboard.press('Enter');
 await expect(page.getByRole('heading',{name:'Review the blocking question'})).toBeFocused();
 await expect.poll(()=>page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
 const animations=await page.evaluate(()=>document.getAnimations().filter(a=>a.playState==='running').length);expect(animations).toBe(0);
 const smallTargets=await page.getByRole('button').evaluateAll(buttons=>buttons.filter(b=>{const r=b.getBoundingClientRect();return r.width>0&&r.height>0&&(r.width<24||r.height<24);}).map(b=>b.textContent));expect(smallTargets).toEqual([]);
});

 test('v3 approval keeps focus on the new outcome when its triggering control disappears',async({page})=>{
  const current=fixture();await mock(page,current);
  await page.route('**/api/applications/a-rest/approve',r=>r.fulfill({json:{...current,state:'approved',revision:3,approved_answer:answer}}));
  await select(page);const approve=page.getByRole('button',{name:'Approve answer',exact:true});await approve.focus();await page.keyboard.press('Enter');
  await expect(page.getByRole('button',{name:'Resume mock application'})).toBeVisible();
  const focus=await page.evaluate(()=>({tag:document.activeElement?.tagName,text:document.activeElement?.textContent}));
  expect(focus.tag).not.toBe('BODY');expect(focus.text).toMatch(/approved|Resume mock application/i);
 });
